const axios = require('axios');
const keyManager = require('../utils/AIKeyManager'); // Adjust path
const AIUsageLog = require('../models/AIUsageLog'); // Adjust path
const User = require('../models/User'); // Adjust path

class AIRouter {
    constructor() {
        this.fallbackModel = 'gpt-4o-mini';
        this.maxOpenAILimit = 10; // Daily limit
    }

    /**
     * Main entry point for generating text.
     * Handles provider rotation, fallback, and logging.
     * 
     * @param {string} prompt - The input prompt
     * @param {object} metadata - { featureType, userId, isPremiumUser, systemPrompt }
     */
    async generateText(prompt, metadata = {}) {
        const { userId, isPremiumUser, featureType } = metadata;

        // 1. Try OpenRouter first
        try {
            return await this._tryOpenRouter(prompt, metadata);
        } catch (orError) {
            console.warn('[AIRouter] OpenRouter failed, attempting fallback...', orError.message);

            // 2. Fallback to OpenAI if allowed
            if (await this._canUseOpenAI(userId, isPremiumUser)) {
                try {
                    return await this._tryOpenAI(prompt, metadata);
                } catch (oaError) {
                    console.error('[AIRouter] OpenAI fallback also failed:', oaError.message);
                    throw new Error('AI service temporarily unavailable. Please try again later.');
                }
            } else {
                throw new Error('Service busy. Please try again later or upgrade for priority access.');
            }
        }
    }

    /**
     * Attempt generation using OpenRouter with automatic key rotation
     */
    async _tryOpenRouter(prompt, metadata) {
        const systemPrompt = metadata.systemPrompt || "You are a helpful assistant.";

        // Retry logic for multiple keys is handled here by just trying one best key? 
        // Ideally we might want to try a couple if the first one fails immediately.
        // For simplicity, we ask KeyManager for a key. If it fails, we report it and throw to trigger fallback.
        // To make it more robust, we could loop here.

        let attempts = 0;
        const maxAttempts = 3; // Try up to 3 OpenRouter keys

        while (attempts < maxAttempts) {
            const apiKey = keyManager.getOpenRouterKey();
            if (!apiKey) break; // No keys available

            try {
                const response = await axios.post(
                    'https://openrouter.ai/api/v1/chat/completions',
                    {
                        model: 'openai/gpt-4o-mini',
                        messages: [
                            { role: 'system', content: systemPrompt },
                            { role: 'user', content: prompt }
                        ],
                        temperature: 0.7,
                        max_tokens: 2000 // Safety limit
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${apiKey}`,
                            'HTTP-Referer': 'https://interview-ai.app',
                            'X-Title': 'Interview AI',
                            'Content-Type': 'application/json'
                        },
                        timeout: 30000 // 30s timeout
                    }
                );

                // Success!
                await this._logUsage(metadata.userId, 'openrouter', 'success');
                return response.data.choices[0].message.content;

            } catch (error) {
                attempts++;
                keyManager.reportFailure(apiKey, error);
                console.warn(`[AIRouter] Key attempt ${attempts} failed:`, error.message);
                // Loop continues to try next key
            }
        }

        throw new Error('All available OpenRouter keys failed.');
    }

    /**
     * Attempt generation using direct OpenAI
     */
    async _tryOpenAI(prompt, metadata) {
        const apiKey = keyManager.getOpenAIKey();
        if (!apiKey) throw new Error('OpenAI not configured');

        const systemPrompt = metadata.systemPrompt || "You are a helpful assistant.";

        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            }
        );

        await this._logUsage(metadata.userId, 'openai', 'success');
        return response.data.choices[0].message.content;
    }

    /**
     * Check if user is allowed to use OpenAI fallback
     */
    async _canUseOpenAI(userId, isPremiumUser) {
        if (!userId) return false; // Anonymous users can't use fallback
        if (isPremiumUser) return true; // Premium users always allowed

        const date = new Date().toISOString().split('T')[0];

        try {
            let log = await AIUsageLog.findOne({ userId, date });
            if (!log) return true; // No usage yet

            return log.openaiCount < this.maxOpenAILimit;
        } catch (err) {
            console.error('Error checking limits:', err);
            return false; // Fail safe
        }
    }

    /**
     * Log the usage stats
     */
    async _logUsage(userId, provider, status) {
        if (!userId) return;

        const date = new Date().toISOString().split('T')[0];

        try {
            await AIUsageLog.findOneAndUpdate(
                { userId, date },
                {
                    $inc: {
                        openaiCount: provider === 'openai' ? 1 : 0,
                        openRouterCount: provider === 'openrouter' ? 1 : 0
                    },
                    $push: {
                        requests: {
                            provider,
                            status,
                            timestamp: new Date()
                        }
                    }
                },
                { upsert: true, new: true }
            );
        } catch (err) {
            // Non-blocking logging error
            console.error('Failed to log AI usage:', err);
        }
    }
}

module.exports = new AIRouter();

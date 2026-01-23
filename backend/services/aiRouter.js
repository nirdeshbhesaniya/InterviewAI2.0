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
    async generateText(prompt, metadata = {}, options = {}) {
        const { userId, isPremiumUser, featureType } = metadata;

        // 1. Try OpenRouter first
        try {
            return await this._tryOpenRouter(prompt, metadata, options);
        } catch (orError) {
            console.warn('[AIRouter] OpenRouter failed, attempting fallback to OpenAI...', orError.message);

            // 2. Fallback to OpenAI if allowed
            if (await this._canUseOpenAI(userId, isPremiumUser)) {
                try {
                    return await this._tryOpenAI(prompt, metadata, options);
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
    async _tryOpenRouter(prompt, metadata, options = {}) {
        const systemPrompt = metadata.systemPrompt || "You are a helpful assistant.";

        let attempts = 0;
        const maxAttempts = 3; // Try up to 3 OpenRouter keys

        while (attempts < maxAttempts) {
            const apiKey = keyManager.getOpenRouterKey();
            if (!apiKey) break; // No keys available

            try {
                const requestBody = {
                    model: options.model || 'openai/gpt-4o-mini',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: prompt }
                    ],
                    temperature: options.temperature || 0.7,
                    max_tokens: options.max_tokens || 4096
                };

                if (options.response_format) {
                    requestBody.response_format = options.response_format;
                }

                const response = await axios.post(
                    'https://openrouter.ai/api/v1/chat/completions',
                    requestBody,
                    {
                        headers: {
                            'Authorization': `Bearer ${apiKey}`,
                            'HTTP-Referer': 'https://interview-ai.app',
                            'X-Title': 'Interview AI',
                            'Content-Type': 'application/json'
                        },
                        timeout: 60000 // Increased timeout for larger generations
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
    async _tryOpenAI(prompt, metadata, options = {}) {
        const apiKey = keyManager.getOpenAIKey();
        if (!apiKey) throw new Error('OpenAI not configured');

        const systemPrompt = metadata.systemPrompt || "You are a helpful assistant.";

        const requestBody = {
            model: options.model || 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: prompt }
            ],
            temperature: options.temperature || 0.7,
            max_tokens: options.max_tokens || 4096
        };

        if (options.response_format) {
            requestBody.response_format = options.response_format;
        }

        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            requestBody,
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 60000
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

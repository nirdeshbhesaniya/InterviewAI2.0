const axios = require('axios');

class AIKeyManager {
    constructor() {
        this.openRouterKeys = this._loadOpenRouterKeys();
        this.openAiKey = process.env.OPENAI_API_KEY;
        this.currentIndex = 0;

        // Status tracking
        this.keyStatus = this.openRouterKeys.map(key => ({
            key,
            failures: 0,
            disabledUntil: 0, // Timestamp
            usageCount: 0
        }));

        console.log(`[AIKeyManager] Initialized with ${this.openRouterKeys.length} OpenRouter keys.`);
    }

    _loadOpenRouterKeys() {
        const keys = [];
        // Load keys 1 through 6
        for (let i = 1; i <= 6; i++) {
            const key = process.env[`OPENROUTER_KEY_${i}`];
            if (key) keys.push(key);
        }

        // Also include the generic OPENROUTER_API_KEY if present and unique
        if (process.env.OPENROUTER_API_KEY && !keys.includes(process.env.OPENROUTER_API_KEY)) {
            keys.push(process.env.OPENROUTER_API_KEY);
        }

        return keys;
    }

    /**
     * Get the best available OpenRouter key using round-robin.
     * Skips keys that are temporarily disabled.
     * Returns null if no OpenRouter keys are available.
     */
    /**
     * Get the best available OpenRouter key using round-robin.
     * Skips keys that are temporarily disabled or manually locked.
     * Returns null if no OpenRouter keys are available.
     */
    getOpenRouterKey() {
        const now = Date.now();
        let attempts = 0;
        const totalKeys = this.keyStatus.length;

        if (totalKeys === 0) return null;

        while (attempts < totalKeys) {
            // Round robin selection
            this.currentIndex = (this.currentIndex + 1) % totalKeys;
            const status = this.keyStatus[this.currentIndex];

            // Check if key is usable (not manually disabled AND not temporarily disabled)
            if (status.isManuallyDisabled || status.disabledUntil > now) {
                attempts++;
                continue;
            }

            status.usageCount++;
            return status.key;
        }

        // All keys disabled
        return null;
    }

    /**
     * Get the OpenAI fallback key.
     */
    getOpenAIKey() {
        return this.openAiKey;
    }

    /**
     * Report a failure for a specific key to update its status.
     * @param {string} key - The API key that failed
     * @param {Error} error - The error received
     */
    reportFailure(key, error) {
        const status = this.keyStatus.find(s => s.key === key);
        if (!status) return;

        status.failures++;

        const errorMessage = error?.message || '';
        const isQuotaError =
            error?.response?.status === 429 ||
            status.failures >= 3 ||
            errorMessage.includes('insufficient_quota') ||
            errorMessage.includes('quota_exceeded') ||
            errorMessage.includes('rate_limit');

        if (isQuotaError) {
            // Disable for 1 hour (exponential backoff could be added)
            status.disabledUntil = Date.now() + (60 * 60 * 1000); // 1 hour
            console.warn(`[AIKeyManager] Key ...${key.slice(-4)} disabled for 1 hour due to quota/rate limit.`);
            // Reset failure count after disabling to allow fresh start later
            status.failures = 0;
        }
    }

    resetKey(key) {
        const status = this.keyStatus.find(s => s.key === key);
        if (status) {
            status.failures = 0;
            status.disabledUntil = 0;
        }
    }

    // --- New Control Methods ---

    /**
     * Manually lock a key so it won't be used.
     */
    forceDisableKey(key) {
        const status = this.keyStatus.find(s => s.key === key);
        if (status) {
            status.isManuallyDisabled = true;
            console.log(`[AIKeyManager] Key ...${key.slice(-4)} was manually LOCKED.`);
            return true;
        }
        return false;
    }

    /**
     * Unlock a manually disabled key.
     */
    enableKey(key) {
        const status = this.keyStatus.find(s => s.key === key);
        if (status) {
            status.isManuallyDisabled = false;
            status.disabledUntil = 0; // Also clear temp blocks
            status.failures = 0;
            console.log(`[AIKeyManager] Key ...${key.slice(-4)} was manually UNLOCKED.`);
            return true;
        }
        return false;
    }

    /**
     * Get full system status for the dashboard.
     */
    getSystemStatus() {
        return {
            openRouter: {
                totalKeys: this.keyStatus.length,
                activeKeys: this.keyStatus.filter(k => !k.isManuallyDisabled && k.disabledUntil < Date.now()).length,
                keys: this.keyStatus.map(k => ({
                    keyMasked: `...${k.key.slice(-4)}`,
                    fullKey: k.key, // Only send to owner!
                    failures: k.failures,
                    usageCount: k.usageCount,
                    isManuallyDisabled: !!k.isManuallyDisabled,
                    disabledUntil: k.disabledUntil,
                    isTempDisabled: k.disabledUntil > Date.now()
                }))
            },
            openAI: {
                available: !!this.openAiKey,
                keyMasked: this.openAiKey ? `...${this.openAiKey.slice(-4)}` : 'Not Configured'
            }
        };
    }
}

// Singleton instance
const keyManager = new AIKeyManager();
module.exports = keyManager;

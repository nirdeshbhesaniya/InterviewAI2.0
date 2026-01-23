const axios = require('axios');

class AIKeyManager {
    constructor() {
        this.openRouterKeys = this._loadOpenRouterKeys();
        this.geminiKeys = this._loadGeminiKeys(); // Load Gemini keys
        this.openAiKey = process.env.OPENAI_API_KEY;
        this.currentIndex = 0;
        this.geminiIndex = 0; // Index for Gemini round-robin

        // Status tracking - Unified for all providers
        // We will store both OpenRouter and Gemini keys in keyStatus, expecting unique keys or handled by type if needed.
        // But to keep it simple and existing structure compatible, let's keep one main list or separate lists?
        // Existing code uses `this.keyStatus` which seemed to map 1:1 to openRouterKeys initially.
        // Let's refactor `this.keyStatus` to hold ALL managed keys with a 'provider' or 'type' field,
        // OR maintain separate status lists.
        // Given `getSystemStatus` iterates `keyStatus` for OpenRouter specifically, let's separate them to avoid breaking existing logic.

        this.keyStatus = this.openRouterKeys.map(key => ({
            key,
            provider: 'openRouter',
            failures: 0,
            disabledUntil: 0,
            usageCount: 0
        }));

        this.geminiKeyStatus = this.geminiKeys.map(key => ({
            key,
            provider: 'gemini',
            failures: 0,
            disabledUntil: 0,
            usageCount: 0
        }));

        console.log(`[AIKeyManager] Initialized with ${this.openRouterKeys.length} OpenRouter keys and ${this.geminiKeys.length} Gemini keys.`);
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

    _loadGeminiKeys() {
        const keys = [];
        // Load keys 1 through 6
        for (let i = 1; i <= 6; i++) {
            const key = process.env[`GEMINI_KEY_${i}`];
            if (key) {
                keys.push(key.trim()); // Trim whitespace just in case
                console.log(`[AIKeyManager] Loaded GEMINI_KEY_${i}: ...${key.slice(-4)}`);
            }
        }

        // Also include the generic GEMINI_API_KEY
        if (process.env.GEMINI_API_KEY) {
            const key = process.env.GEMINI_API_KEY.trim();
            if (!keys.includes(key)) {
                keys.push(key);
                console.log(`[AIKeyManager] Loaded GEMINI_API_KEY: ...${key.slice(-4)}`);
            }
        }

        if (keys.length === 0) {
            console.warn('[AIKeyManager] No Gemini keys found in environment variables!');
        }

        return keys;
    }

    /**
     * Get the best available OpenRouter key using round-robin.
     * Skips keys that are temporarily disabled or manually locked.
     * Returns null if no OpenRouter keys are available.
     */
    getOpenRouterKey() {
        return this._getKey(this.keyStatus, 'currentIndex');
    }

    /**
     * Get the best available Gemini key using round-robin.
     */
    getGeminiKey() {
        return this._getKey(this.geminiKeyStatus, 'geminiIndex');
    }

    /**
     * Generic helper to get key from a status list
     */
    _getKey(statusList, indexProp) {
        const now = Date.now();
        let attempts = 0;
        const totalKeys = statusList.length;

        if (totalKeys === 0) return null;

        while (attempts < totalKeys) {
            // Round robin selection
            this[indexProp] = (this[indexProp] + 1) % totalKeys;
            const status = statusList[this[indexProp]];

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
        // Find which list this key belongs to
        let status = this.keyStatus.find(s => s.key === key);
        if (!status) {
            status = this.geminiKeyStatus.find(s => s.key === key);
        }

        if (!status) return;

        status.failures++;

        const errorMessage = error?.message || '';
        const isQuotaError =
            error?.response?.status === 429 ||
            status.failures >= 3 ||
            errorMessage.includes('insufficient_quota') ||
            errorMessage.includes('quota_exceeded') ||
            errorMessage.includes('rate_limit') ||
            errorMessage.includes('429'); // Common 429 string

        if (isQuotaError) {
            // Disable for 1 hour (exponential backoff could be added)
            status.disabledUntil = Date.now() + (60 * 60 * 1000); // 1 hour
            console.warn(`[AIKeyManager] Key ...${key.slice(-4)} (${status.provider}) disabled for 1 hour due to quota/rate limit.`);
            // Reset failure count after disabling to allow fresh start later
            status.failures = 0;
        }
    }

    resetKey(key) {
        let status = this.keyStatus.find(s => s.key === key);
        if (!status) status = this.geminiKeyStatus.find(s => s.key === key);

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
        let status = this.keyStatus.find(s => s.key === key);
        if (!status) status = this.geminiKeyStatus.find(s => s.key === key);

        if (status) {
            status.isManuallyDisabled = true;
            console.log(`[AIKeyManager] Key ...${key.slice(-4)} (${status.provider}) was manually LOCKED.`);
            return true;
        }
        return false;
    }

    /**
     * Unlock a manually disabled key.
     */
    enableKey(key) {
        let status = this.keyStatus.find(s => s.key === key);
        if (!status) status = this.geminiKeyStatus.find(s => s.key === key);

        if (status) {
            status.isManuallyDisabled = false;
            status.disabledUntil = 0; // Also clear temp blocks
            status.failures = 0;
            console.log(`[AIKeyManager] Key ...${key.slice(-4)} (${status.provider}) was manually UNLOCKED.`);
            return true;
        }
        return false;
    }

    /**
     * Get full system status for the dashboard.
     */
    getSystemStatus() {
        const mapKeyStatus = (k) => ({
            keyMasked: `...${k.key.slice(-4)}`,
            fullKey: k.key, // Only send to owner!
            failures: k.failures,
            usageCount: k.usageCount,
            isManuallyDisabled: !!k.isManuallyDisabled,
            disabledUntil: k.disabledUntil,
            isTempDisabled: k.disabledUntil > Date.now()
        });

        return {
            openRouter: {
                totalKeys: this.keyStatus.length,
                activeKeys: this.keyStatus.filter(k => !k.isManuallyDisabled && k.disabledUntil < Date.now()).length,
                keys: this.keyStatus.map(mapKeyStatus)
            },
            gemini: {
                totalKeys: this.geminiKeyStatus.length,
                activeKeys: this.geminiKeyStatus.filter(k => !k.isManuallyDisabled && k.disabledUntil < Date.now()).length,
                keys: this.geminiKeyStatus.map(mapKeyStatus)
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

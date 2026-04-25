const DeepgramService = require('./DeepgramService');

let deepgramInstance = null;

function getDeepgramInstance() {
    if (!deepgramInstance) {
        deepgramInstance = new DeepgramService();
    }
    return deepgramInstance;
}

/**
 * Unified TTS service for the websocket interview flow.
 *
 * Exclusively uses Deepgram for high-quality voice generation.
 */
module.exports = {
    /**
     * @param {string} text
     * @returns {Promise<Buffer|null>}
     */
    async generateAudio(text) {
        const safeText = (text || '').toString().trim();
        if (!safeText) return null;

        if (!process.env.DEEPGRAM_API_KEY) {
            console.error('TextToSpeechService Error: DEEPGRAM_API_KEY is missing. Audio generation skipped.');
            return null;
        }

        try {
            const deepgram = getDeepgramInstance();
            return await deepgram.generateAudio(safeText);
        } catch (error) {
            console.error('TextToSpeechService Deepgram Error:', error);
            return null;
        }
    },
};

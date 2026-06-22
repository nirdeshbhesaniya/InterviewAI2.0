const AWSPollyService = require('./AWSPollyService');

let pollyInstance = null;

function getPollyInstance() {
    if (!pollyInstance) {
        pollyInstance = new AWSPollyService();
    }
    return pollyInstance;
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

        if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
            console.error('TextToSpeechService Error: AWS credentials missing. Audio generation skipped.');
            return null;
        }

        try {
            const polly = getPollyInstance();
            return await polly.generateAudio(safeText);
        } catch (error) {
            console.error('TextToSpeechService AWS Polly Error:', error);
            return null;
        }
    },
};

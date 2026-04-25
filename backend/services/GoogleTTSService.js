const googleTTS = require('google-tts-api');

/**
 * Simple Google Translate TTS wrapper.
 * No API key required, but may be rate-limited.
 */
class GoogleTTSService {
    /**
     * @param {string} text
     * @param {{ lang?: string, slow?: boolean, host?: string }} [options]
     * @returns {Promise<Buffer|null>}
     */
    static async generateAudio(text, options = {}) {
        try {
            const safeText = (text || '').toString().trim();
            if (!safeText) return null;

            const lang = options.lang || 'en';
            const slow = Boolean(options.slow);
            const host = options.host || 'https://translate.google.com';

            // Handles long text by splitting into chunks.
            const parts = googleTTS.getAllAudioUrls(safeText, { lang, slow, host });
            const buffers = [];

            for (const part of parts) {
                const res = await fetch(part.url);
                if (!res.ok) {
                    throw new Error(`Google TTS failed (${res.status}): ${await res.text()}`);
                }
                buffers.push(Buffer.from(await res.arrayBuffer()));
            }

            return Buffer.concat(buffers);
        } catch (error) {
            console.error('GoogleTTSService Error:', error);
            return null;
        }
    }
}

module.exports = GoogleTTSService;

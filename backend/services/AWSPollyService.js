const { PollyClient, SynthesizeSpeechCommand, Engine, OutputFormat, TextType } = require('@aws-sdk/client-polly');

/**
 * AWS Polly TTS Service
 * Generates high-quality neural speech for the AI interviewer.
 */
class AWSPollyService {
    constructor() {
        const region = process.env.AWS_REGION || 'us-east-1';
        const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
        const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

        if (!accessKeyId || !secretAccessKey) {
            throw new Error('AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are required for AWSPollyService');
        }

        this.client = new PollyClient({
            region,
            credentials: { accessKeyId, secretAccessKey },
        });

        this.voiceId = process.env.AWS_POLLY_VOICE_ID || 'Matthew';

        console.log(`🔊 AWS Polly initialized — voice: ${this.voiceId}, region: ${region}`);
    }

    /**
     * Convert text to speech audio buffer (MP3).
     * @param {string} text
     * @returns {Promise<Buffer|null>}
     */
    async generateAudio(text) {
        const safeText = this.formatInterviewSpeech(text);
        if (!safeText) return null;

        try {
            const command = new SynthesizeSpeechCommand({
                Text: safeText,
                TextType: TextType.TEXT,
                Engine: Engine.NEURAL,
                VoiceId: this.voiceId,
                OutputFormat: OutputFormat.MP3,
                SampleRate: '24000',
                LanguageCode: 'en-US',
            });

            const response = await this.client.send(command);

            if (!response.AudioStream) {
                console.error('❌ AWS Polly returned no AudioStream');
                return null;
            }

            // Collect all chunks from the readable stream
            const chunks = [];
            for await (const chunk of response.AudioStream) {
                chunks.push(chunk);
            }

            const audioBuffer = Buffer.concat(chunks);
            console.log(`✅ AWS Polly generated ${audioBuffer.length} bytes of audio`);
            return audioBuffer;

        } catch (error) {
            console.error('❌ AWS Polly TTS Error:', error.message);
            return null;
        }
    }

    /**
     * Clean up text for natural speech delivery.
     * Removes markdown artifacts and normalizes punctuation.
     * @param {string} text
     * @returns {string}
     */
    formatInterviewSpeech(text) {
        if (!text) return '';

        return (text || '')
            .toString()
            // Strip markdown code blocks (already sanitized by SocketService but double-safe)
            .replace(/```[\s\S]*?```/g, 'I have provided the code example on screen.')
            .replace(/`([^`]+)`/g, '$1')
            // Strip markdown formatting symbols
            .replace(/\*\*(.+?)\*\*/g, '$1')
            .replace(/\*(.+?)\*/g, '$1')
            .replace(/#+ /g, '')
            // Normalize spacing and punctuation for natural pauses
            .replace(/\s+/g, ' ')
            .replace(/\./g, '. ')
            .replace(/\?/g, '? ')
            .replace(/,/g, ', ')
            .replace(/:/g, '. ')
            // Collapse double spaces
            .replace(/  +/g, ' ')
            .trim();
    }
}

module.exports = AWSPollyService;

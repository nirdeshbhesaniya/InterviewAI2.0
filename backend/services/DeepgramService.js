const { createClient, LiveTranscriptionEvents } = require('@deepgram/sdk');

class DeepgramService {
    constructor() {
        const apiKey = process.env.DEEPGRAM_API_KEY;
        if (!apiKey) throw new Error('DEEPGRAM_API_KEY missing');

        console.log('🔑 Deepgram initialized');

        this.deepgram = createClient(apiKey);
        this.connection = null;
    }

    /**
     * 🎤 CONNECT TO LIVE TRANSCRIPTION
     */
    connect(onTranscriptCallback) {
        console.log('🎤 Connecting to Deepgram STT...');

        this.connection = this.deepgram.listen.live({
            model: 'nova-2-meeting', // ⭐ best for interviews
            language: 'en-US',

            smart_format: true,
            punctuate: true,
            filler_words: false,     // removes "uh", "um"
            interim_results: true,

            encoding: 'webm',
            sample_rate: 48000,
            channels: 1,

            endpointing: 300,        // detects pauses quickly
            utterance_end_ms: 1000,
        });

        this.connection.on(LiveTranscriptionEvents.Open, () => {
            console.log('✅ Deepgram connected');
        });

        this.connection.on(LiveTranscriptionEvents.Transcript, (data) => {
            const transcript = data.channel.alternatives[0].transcript;

            if (!transcript) return;

            if (data.is_final) {
                console.log('📝 FINAL:', transcript);
                onTranscriptCallback(transcript);
            }
        });

        this.connection.on(LiveTranscriptionEvents.Error, (err) => {
            console.error('❌ Deepgram error:', err);
        });

        this.connection.on(LiveTranscriptionEvents.Close, () => {
            console.log('🔌 Deepgram closed');
        });
    }

    /**
     * 🎧 SEND AUDIO STREAM
     */
    send(audioBuffer) {
        if (!audioBuffer) return;

        if (this.connection?.getReadyState() === 1) {
            this.connection.send(audioBuffer);
        }
    }

    /**
     * 🔌 DISCONNECT
     */
    disconnect() {
        if (this.connection) {
            this.connection.finish();
            this.connection = null;
            console.log('🔌 Deepgram disconnected');
        }
    }

    /**
     * 🎙️ GENERATE PROFESSIONAL INTERVIEW VOICE
     */
    async generateAudio(text) {
        try {
            const formattedText = this.formatInterviewSpeech(text);

            const response = await fetch(
                'https://api.deepgram.com/v1/speak?model=aura-orion-en',
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        text: formattedText
                    }),
                }
            );

            if (!response.ok) {
                throw new Error(await response.text());
            }

            return Buffer.from(await response.arrayBuffer());

        } catch (error) {
            console.error('❌ Deepgram TTS Error:', error.message);
            return null;
        }
    }

    /**
     * 🎯 IMPROVE SPEECH DELIVERY
     */
    formatInterviewSpeech(text) {
        if (!text) return "";

        return text
            .replace(/\s+/g, ' ')      // normalize spacing
            .replace(/\./g, '. ')      // natural pause
            .replace(/\?/g, '? ')      // question pause
            .replace(/,/g, ', ')       // rhythm
            .replace(/:/g, '. ')       // avoid robotic colon reading
            .trim();
    }
}

module.exports = DeepgramService;
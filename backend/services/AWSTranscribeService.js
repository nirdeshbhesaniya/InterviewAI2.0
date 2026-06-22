const {
    TranscribeStreamingClient,
    StartStreamTranscriptionCommand,
    LanguageCode,
    MediaEncoding,
} = require('@aws-sdk/client-transcribe-streaming');
const { Readable } = require('stream');

/**
 * AWS Transcribe Streaming STT Service
 *
 * Each interview session creates its own instance.
 * Audio chunks (webm/opus from the browser MediaRecorder) are fed via `sendAudio()`.
 * Final transcript segments are delivered via the callback passed to `startStream()`.
 */
class AWSTranscribeService {
    constructor() {
        const region = process.env.AWS_REGION || 'us-east-1';
        const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
        const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

        if (!accessKeyId || !secretAccessKey) {
            throw new Error('AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are required for AWSTranscribeService');
        }

        this.client = new TranscribeStreamingClient({
            region,
            credentials: { accessKeyId, secretAccessKey },
        });

        this.audioChunkQueue = [];
        this.isStreaming = false;
        this.onTranscriptCallback = null;
        this._pushChunk = null; // injected by the async generator
        this._streamDone = null; // resolve to end the generator

        console.log(`🎤 AWS Transcribe Streaming initialized — region: ${region}`);
    }

    /**
     * Start a streaming transcription session.
     * @param {function(string): void} onTranscriptCallback  Called with each final transcript
     */
    async startStream(onTranscriptCallback) {
        if (this.isStreaming) {
            console.warn('⚠️  AWSTranscribeService: stream already active');
            return;
        }

        this.onTranscriptCallback = onTranscriptCallback;
        this.isStreaming = true;

        // Create a promise-based push queue for feeding audio to the generator
        let resolvePush = null;
        const chunkQueue = [];
        let streamDone = false;

        this._pushChunk = (chunk) => {
            chunkQueue.push(chunk);
            if (resolvePush) {
                resolvePush();
                resolvePush = null;
            }
        };

        this._streamDone = () => {
            streamDone = true;
            if (resolvePush) {
                resolvePush();
                resolvePush = null;
            }
        };

        const self = this;

        // Async generator that yields audio events to AWS Transcribe
        async function* audioStream() {
            while (true) {
                if (chunkQueue.length > 0) {
                    const chunk = chunkQueue.shift();
                    yield { AudioEvent: { AudioChunk: chunk } };
                } else if (streamDone) {
                    return;
                } else {
                    // Wait for the next chunk or done signal
                    await new Promise((resolve) => { resolvePush = resolve; });
                }
            }
        }

        try {
            const command = new StartStreamTranscriptionCommand({
                LanguageCode: LanguageCode.EN_US,
                MediaSampleRateHertz: 16000,
                MediaEncoding: MediaEncoding.PCM,
                AudioStream: audioStream(),
            });

            const response = await this.client.send(command);

            // Process transcript events
            for await (const event of response.TranscriptResultStream) {
                if (!this.isStreaming) break;

                if (event.TranscriptEvent) {
                    const results = event.TranscriptEvent.Transcript?.Results || [];
                    for (const result of results) {
                        // Only process final (non-partial) results
                        if (!result.IsPartial && result.Alternatives?.length > 0) {
                            const transcript = result.Alternatives[0].Transcript?.trim();
                            if (transcript) {
                                console.log('📝 AWS Transcribe FINAL:', transcript);
                                if (self.onTranscriptCallback) {
                                    self.onTranscriptCallback(transcript);
                                }
                            }
                        }
                    }
                }
            }
        } catch (error) {
            if (this.isStreaming) {
                // Only log if it wasn't intentionally stopped
                console.error('❌ AWS Transcribe Streaming Error:', error.message);
            }
        } finally {
            this.isStreaming = false;
            console.log('🔌 AWS Transcribe stream ended');
        }
    }

    /**
     * Feed a raw audio chunk (Buffer/Uint8Array) into the stream.
     * @param {Buffer|Uint8Array} chunk
     */
    sendAudio(chunk) {
        if (!this.isStreaming || !this._pushChunk) return;
        this._pushChunk(chunk);
    }

    /**
     * Gracefully stop the transcription stream.
     */
    stopStream() {
        if (!this.isStreaming) return;
        this.isStreaming = false;
        if (this._streamDone) {
            this._streamDone();
        }
        this._pushChunk = null;
        this._streamDone = null;
        this.onTranscriptCallback = null;
        console.log('🛑 AWS Transcribe stream stopped');
    }
}

module.exports = AWSTranscribeService;

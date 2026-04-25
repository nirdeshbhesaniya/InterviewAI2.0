const { WebSocketServer } = require('ws');
const InterviewLLMService = require('./InterviewLLMService');
const TextToSpeechService = require('./TextToSpeechService');

class SocketService {
    constructor() {
        this.wss = null;
    }

    assessTranscriptRisk(text) {
        const normalized = (text || '').toLowerCase();

        const severePatterns = [
            /\b(sex|sexual|explicit|nude|porn|nsfw)\b/i,
            /\b(hate|racist|slur|kill|murder|suicide)\b/i,
            /\b(assault|abuse|harass|threat|bomb)\b/i,
        ];

        const moderatePatterns = [
            /\b(ssn|social security|credit card|cvv|bank account|password|otp)\b/i,
            /\b(fake|fabricate|lie about|pretend|make up)\b/i,
        ];

        if (severePatterns.some((pattern) => pattern.test(normalized))) {
            return { blocked: true, severity: 'severe', reason: 'unsafe or explicit content' };
        }

        if (moderatePatterns.some((pattern) => pattern.test(normalized))) {
            return { blocked: true, severity: 'moderate', reason: 'sensitive or misleading content' };
        }

        return { blocked: false };
    }

    async sendRefusal(ws, tts, reason, severity = 'moderate') {
        const message = severity === 'severe'
            ? 'Warning: that content is not allowed in this interview. Please stop immediately. This session is ending now. Let’s keep the conversation professional.'
            : 'Warning: that content is not appropriate for this interview. Please keep your answers professional and focused on your experience, projects, or interview preparation.';

        ws.send(JSON.stringify({ type: 'moderation_flag', severity, reason }));
        ws.send(JSON.stringify({ type: 'transcript', role: 'assistant', text: message }));
        ws.send(JSON.stringify({ type: 'status', status: 'speaking' }));

        const refusalAudio = await tts.generateAudio(message);
        if (refusalAudio) {
            ws.send(refusalAudio);
        }

        ws.send(JSON.stringify({ type: 'status', status: 'listening' }));
        return message;
    }

    init(server) {
        this.wss = new WebSocketServer({ server });

        this.wss.on('connection', (ws) => {
            console.log('✅ Client connected to WebSocket');

            // Initialize services for this connection
            let llm = null;
            const tts = TextToSpeechService;

            ws.on('message', async (message, isBinary) => {
                try {
                    // Check if message is binary (audio) or text (JSON control)
                    // Note: 'isBinary' argument is reliable in 'ws' library

                    if (isBinary) {
                        // Previously: mic audio -> Deepgram STT.
                        // Now: STT is handled client-side (react-speech-recognition), so ignore binary.
                        // Keeping this branch prevents server errors if older clients still stream audio.
                        return;
                    } else {
                        // Text Data (Control Messages)
                        const messageString = message.toString();
                        console.log('📨 Received control message:', messageString.substring(0, 100)); // Log first 100 chars

                        const data = JSON.parse(messageString);

                        if (data.type === 'start_interview') {
                            try {
                                const { systemMessage } = data;

                                // Initialize LLM
                                llm = new InterviewLLMService();
                                llm.initialize(systemMessage);
                                console.log('🤖 LLM initialized with system message');

                                // Send initial greeting
                                const greeting = "Hello! I'm your AI interviewer. I'm excited to learn more about you and your experience. Best of luck! Shall we begin?";

                                // Send greeting transcript
                                ws.send(JSON.stringify({ type: 'transcript', role: 'assistant', text: greeting }));

                                // Generate greeting audio
                                ws.send(JSON.stringify({ type: 'status', status: 'speaking' }));
                                const greetingAudio = await tts.generateAudio(greeting);
                                if (greetingAudio) {
                                    console.log('🔊 Sending greeting audio:', greetingAudio.length, 'bytes');
                                    ws.send(greetingAudio);
                                } else {
                                    console.error('❌ Failed to generate greeting audio');
                                }
                                ws.send(JSON.stringify({ type: 'status', status: 'listening' }));

                            } catch (error) {
                                console.error('❌ Error starting interview:', error);
                                ws.send(JSON.stringify({ type: 'error', message: 'Failed to start interview: ' + error.message }));
                            }

                        } else if (data.type === 'user_message') {
                            try {
                                if (!llm) {
                                    ws.send(JSON.stringify({ type: 'error', message: 'Interview not started yet' }));
                                    return;
                                }

                                const userText = (data.text || '').toString().trim();
                                if (!userText) {
                                    return;
                                }

                                const risk = this.assessTranscriptRisk(userText);
                                if (risk.blocked) {
                                    console.warn(`🛑 Moderation flag (${risk.severity}): ${risk.reason}`);
                                    await this.sendRefusal(ws, tts, risk.reason, risk.severity);

                                    if (risk.severity === 'severe') {
                                        llm = null;
                                        ws.send(JSON.stringify({ type: 'stop_interview', reason: risk.reason }));
                                    }

                                    return;
                                }

                                console.log('📝 User message received:', userText.substring(0, 120));

                                // Send transcript to client for display
                                ws.send(JSON.stringify({ type: 'transcript', role: 'user', text: userText }));

                                // Generate AI Response
                                ws.send(JSON.stringify({ type: 'status', status: 'thinking' }));
                                const aiResponse = await llm.generateResponse(userText);
                                console.log('💭 AI Response:', aiResponse);

                                // Send AI text to client
                                ws.send(JSON.stringify({ type: 'transcript', role: 'assistant', text: aiResponse }));

                                // Sanitize audio string so it doesn't read code out loud
                                const ttsSanitizedResponse = aiResponse
                                    .replace(/```[\s\S]*?```/g, '\nI have provided the code example on your screen, please observe it while I explain the logic.\n')
                                    .replace(/`/g, '')
                                    .replace(/\*\*/g, '')
                                    .replace(/\*/g, '')
                                    .replace(/#/g, '');

                                // Generate Audio
                                ws.send(JSON.stringify({ type: 'status', status: 'speaking' }));
                                const audioBuffer = await tts.generateAudio(ttsSanitizedResponse);

                                if (audioBuffer) {
                                    console.log('🔊 Sending audio buffer:', audioBuffer.length, 'bytes');
                                    ws.send(audioBuffer);
                                } else {
                                    console.error('❌ Failed to generate audio');
                                }

                                ws.send(JSON.stringify({ type: 'status', status: 'listening' }));
                            } catch (error) {
                                console.error('❌ Error handling user_message:', error);
                                ws.send(JSON.stringify({ type: 'error', message: error.message }));
                            }

                        } else if (data.type === 'stop_interview') {
                            console.log('🛑 Stopping interview');
                            llm = null;
                        }
                    }
                } catch (e) {
                    console.error("❌ Error processing message:", e);
                }
            });

            ws.on('close', () => {
                console.log('🔌 Client disconnected');
            });

            ws.on('error', (error) => {
                console.error('❌ WebSocket error:', error);
            });
        });

        console.log('🌐 WebSocket server initialized');
    }
}

module.exports = new SocketService();

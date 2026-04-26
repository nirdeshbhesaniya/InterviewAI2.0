import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from '../../utils/axiosInstance';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Clock, Bot, AlertCircle, Loader2, Maximize2, Minimize2, X, Globe, Briefcase, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { useUser } from '../../context/UserContext';
import { useInterviewMode } from '../../context/InterviewModeContext';
import * as faceapi from '@vladmandic/face-api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import jsx from 'react-syntax-highlighter/dist/esm/languages/prism/jsx';
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

SyntaxHighlighter.registerLanguage('jsx', jsx);
SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('javascript', javascript);

const ActiveInterview = () => {
    const { mockId } = useParams();
    const navigate = useNavigate();
    const { user } = useUser();
    const { setIsInterviewActive } = useInterviewMode();
    const [interview, setInterview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isCallActive, setIsCallActive] = useState(false);
    const [transcript, setTranscript] = useState([]);
    const [timeLeft, setTimeLeft] = useState(1800); // 30 mins
    const [isStarting, setIsStarting] = useState(false);
    const [aiStatus, setAiStatus] = useState('idle'); // idle, listening, thinking, speaking
    const [isMicMuted, setIsMicMuted] = useState(false);
    const [activeView, setActiveView] = useState('user'); // 'user' or 'ai'
    const [isTranscriptFullScreen, setIsTranscriptFullScreen] = useState(false);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [liveMetrics, setLiveMetrics] = useState({ eyeContact: 0, confidence: 0 });

    // Tracking Metrics
    const faceMetricsRef = useRef({
        totalFrames: 0,
        faceDetectedFrames: 0,
        expressions: {
            neutral: 0,
            happy: 0,
            sad: 0,
            angry: 0,
            fearful: 0,
            disgusted: 0,
            surprised: 0
        },
        significantShifts: 0,
        lastDominantEmotion: null
    });

    const {
        finalTranscript,
        resetTranscript,
        browserSupportsSpeechRecognition,
    } = useSpeechRecognition();

    // Refs
    const wsRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioContextRef = useRef(null);
    const audioQueueRef = useRef([]);
    const isPlayingRef = useRef(false);
    const timerRef = useRef(null);
    const transcriptEndRef = useRef(null);
    const lastSentTranscriptRef = useRef('');
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const faceTrackingIntervalRef = useRef(null);
    const sendDebounceRef = useRef(null);
    const pendingUserMessageRef = useRef('');
    const isMicPausedForAIRef = useRef(false);
    const hasForcedModerationExitRef = useRef(false);

    const DEFAULT_AUDIO_PLAYBACK_RATE = 0.95;
    const [speechRate, setSpeechRate] = useState(() => {
        const savedRate = Number(localStorage.getItem('mockInterviewSpeechRate'));
        return Number.isFinite(savedRate) && savedRate >= 0.8 && savedRate <= 1.15
            ? savedRate
            : DEFAULT_AUDIO_PLAYBACK_RATE;
    });

    useEffect(() => {
        localStorage.setItem('mockInterviewSpeechRate', String(speechRate));
    }, [speechRate]);

    // Set interview mode to hide header/footer
    useEffect(() => {
        setIsInterviewActive(true);
        startCamera();
        loadModels();
        return () => {
            setIsInterviewActive(false);
            cleanupInterview();
        };
    }, [setIsInterviewActive]);

    const loadModels = async () => {
        try {
            await Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
                faceapi.nets.faceExpressionNet.loadFromUri('/models')
            ]);
            setModelsLoaded(true);
            console.log("✅ Face models loaded successfully");
        } catch (err) {
            console.error("❌ Error loading face models:", err);
            toast.error("Failed to load tracking models");
        }
    };

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Failed to access camera:", err);
            toast.error("Could not access webcam");
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    };

    useEffect(() => {
        fetchInterview();
    }, []);

    const deriveCandidateName = () => {
        if (user?.fullName?.trim()) return user.fullName.trim();
        if (user?.username?.trim()) return user.username.trim();
        if (interview?.createdBy?.includes('@')) {
            return interview.createdBy.split('@')[0].replace(/[._-]+/g, ' ').trim();
        }
        return 'Candidate';
    };

    const candidateName = deriveCandidateName();
    const candidateFirstName = candidateName.split(' ')[0] || 'there';
    const resumeSkills = Array.isArray(interview?.candidateProfile?.skills) && interview.candidateProfile.skills.length > 0
        ? interview.candidateProfile.skills
        : String(interview?.skills || '').split(',').map(s => s.trim()).filter(Boolean);
    const profileSummary = String(interview?.candidateProfile?.summary || '').trim();
    const profileEducation = Array.isArray(interview?.candidateProfile?.education) ? interview.candidateProfile.education : [];
    const profileProjects = Array.isArray(interview?.candidateProfile?.projects) ? interview.candidateProfile.projects : [];
    const profileExperience = Array.isArray(interview?.candidateProfile?.workExperience) ? interview.candidateProfile.workExperience : [];

    useEffect(() => {
        if (!isCallActive) return;
        if (!finalTranscript) return;

        const text = normalizeTranscript(finalTranscript);
        if (!text) return;

        pendingUserMessageRef.current = text;

        if (sendDebounceRef.current) {
            clearTimeout(sendDebounceRef.current);
        }

        // Debounce final transcript chunks so complete thoughts are sent to AI.
        sendDebounceRef.current = setTimeout(() => {
            flushPendingUserMessage();
        }, 650);

        resetTranscript();
    }, [finalTranscript, isCallActive, resetTranscript]);

    const normalizeTranscript = (rawText) => {
        return (rawText || '')
            .replace(/\s+/g, ' ')
            .replace(/[\u2018\u2019]/g, "'")
            .replace(/[\u201C\u201D]/g, '"')
            .trim();
    };

    const shouldIgnoreTranscript = (text) => {
        if (!text) return true;

        const lowered = text.toLowerCase();
        const fillerOnly = ['hmm', 'uh', 'um', 'okay', 'ok', 'yeah', 'yes', 'no'];
        if (fillerOnly.includes(lowered)) return true;

        // Avoid sending tiny/noisy one-word fragments unless meaningful.
        if (text.split(' ').length === 1 && text.length < 4) return true;

        return false;
    };

    const flushPendingUserMessage = () => {
        const text = normalizeTranscript(pendingUserMessageRef.current);
        if (!text || shouldIgnoreTranscript(text)) return;

        // Avoid duplicates when browser emits repeated final segments.
        if (text === lastSentTranscriptRef.current) return;

        // If AI is speaking/thinking, hold the user's message and send when listening resumes.
        if (aiStatus !== 'listening') return;

        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'user_message', text }));
            lastSentTranscriptRef.current = text;
            pendingUserMessageRef.current = '';
        }
    };

    const fetchInterview = async () => {
        try {
            const response = await axios.get(`/mock-interview/${mockId}`);
            setInterview(response.data);
        } catch (error) {
            console.error("Failed to fetch interview", error);
            toast.error("Failed to load interview details");
        } finally {
            setLoading(false);
        }
    };

    const startInterview = async () => {
        if (!interview) return;
        setIsStarting(true);

        try {
            // Initialize WebSocket
            const ws = new WebSocket('wss://api.interviewai.tech');
            wsRef.current = ws;

            ws.onopen = () => {
                console.log('✅ Connected to WebSocket');

                // Send Start Signal with Context FIRST (before starting microphone)
                const questionsList = interview.mockInterviewResult
                    .map((q, idx) => `Question ${idx + 1}: ${q.question}`)
                    .join('\n\n');

                // Build a clean, structured candidate profile section for the AI
                const cp = interview.candidateProfile;
                const hasStructuredProfile = cp && (
                    (cp.skills && cp.skills.length > 0) ||
                    (cp.projects && cp.projects.length > 0) ||
                    (cp.workExperience && cp.workExperience.length > 0) ||
                    (cp.education && cp.education.length > 0)
                );

                const buildCandidateProfileSection = () => {
                    if (!hasStructuredProfile) {
                        // Fallback to raw text if no structured profile
                        return interview.resumeContext
                            ? `\nCANDIDATE RESUME SUMMARY:\n${interview.resumeContext.substring(0, 1500)}`
                            : '';
                    }

                    const lines = ['\n=== STRUCTURED CANDIDATE PROFILE (from Resume) ==='];

                    if (cp.summary) {
                        lines.push(`\nPROFESSIONAL SUMMARY:\n${cp.summary}`);
                    }

                    if (cp.education && cp.education.length > 0) {
                        lines.push(`\nEDUCATION:\n${cp.education.map(e => `  - ${e}`).join('\n')}`);
                    }

                    if (cp.skills && cp.skills.length > 0) {
                        lines.push(`\nSKILLS:\n  ${cp.skills.join(', ')}`);
                    }

                    if (cp.projects && cp.projects.length > 0) {
                        lines.push('\nPROJECTS:');
                        cp.projects.forEach(p => {
                            lines.push(`  • ${p.title}${p.technologies && p.technologies.length > 0 ? ` [${p.technologies.join(', ')}]` : ''}`);
                            if (p.description) lines.push(`    ${p.description}`);
                        });
                    }

                    if (cp.workExperience && cp.workExperience.length > 0) {
                        lines.push('\nWORK EXPERIENCE:');
                        cp.workExperience.forEach(w => {
                            lines.push(`  • ${w.role || 'Role'} at ${w.company || 'Company'}${w.duration ? ` (${w.duration})` : ''}`);
                            if (w.highlights && w.highlights.length > 0) {
                                w.highlights.forEach(h => lines.push(`    - ${h}`));
                            }
                        });
                    }

                    if (cp.certifications && cp.certifications.length > 0) {
                        lines.push(`\nCERTIFICATIONS:\n${cp.certifications.map(c => `  - ${c}`).join('\n')}`);
                    }

                    lines.push('\n=================================================');
                    return lines.join('\n');
                };

                const candidateProfileSection = buildCandidateProfileSection();

                const systemMessage = `
Build a realistic 10-minute AI Interview Flow for a MERN stack AI interviewer application.

OBJECTIVE:
Simulate a real human interviewer conversation with a natural flow, short responses, and structured evaluation.

GUARDRAILS AND EVALUATION RULES:
* Use structure over content. Guide the candidate using STAR (Situation, Task, Action, Result), but do not write their story for them.
* Stay strictly focused on interview context only: role fit, resume, projects, technical decisions, and problem-solving.
* Do not move into unrelated topics such as entertainment, politics, personal gossip, or general chit-chat.
* Validate claims with specifics. Ask for technologies used, exact responsibilities, constraints, and measurable results.
* If an answer sounds generic, scripted, or overly polished, ask follow-up questions that require context-specific details.
* Compare the candidate's answers against the resume summary, job role, and previous answers. If something is inconsistent, ask for clarification.
* Focus on process, tradeoffs, and decision-making, not only final outcomes.
* If the user gives harmful, abusive, sexually explicit, or other inappropriate content, refuse immediately, redirect back to the interview topic, and stop the session for severe cases.
* If the user misuses tools or tries to fake experience, flag it as a serious violation.
* Keep a human-in-the-loop mindset: the AI should flag suspicious or unsafe content rather than pretending certainty.

You are Alex, an expert AI interviewer. You are conducting a ${interview.interviewType} interview for a candidate named ${candidateName || 'the candidate'}, focusing on ${interview.focusArea}. The candidate has a ${interview.degree} degree.
${interview.jobExperience ? `The candidate has ${interview.jobExperience} years of experience.` : ''}
${candidateProfileSection}

INTERVIEW FLOW STAGES:

STAGE 1: Warm Introduction
* Introduce yourself as Alex.
* Greet the candidate natively by their first name (${candidateFirstName}).
* Briefly explain the interview structure.
* Create a comfortable environment.
* Ask the candidate to introduce themselves.

STAGE 2: Candidate Introduction Analysis
* Listen to candidate introduction.
* Extract interests, skills, technologies, and motivations automatically in your mind.
* Ask 1-2 follow-up questions based on their introduction.

STAGE 3: Rapport Building (Conversational)
* Ask friendly conversational questions to build comfort.
* Example topics: interests, challenges, preferences.

STAGE 4: Role-Based Questions
* Ask 1-2 questions based on the job role (${interview.interviewType}).
* Keep questions short and relevant.

STAGE 5: Resume & Project Discussion
* YOU MUST heavily analyze the STRUCTURED CANDIDATE PROFILE provided above.
* Ask highly specific questions about the EXACT projects, technologies, and experiences listed in the profile.
* Reference project names, tech stacks, and company names directly — make the candidate feel seen.
* If no profile is provided, ask them to describe a recent project.
* Ask about architecture, challenges, tradeoffs, and improvements.

STAGE 6: Core Subject Evaluation
* Ask 2 concise questions from: OOP, OS, DBMS, Computer Networks.
* Questions should test fundamentals.

STAGE 7: Focus Topic Questions
* Ask 1-2 questions based on selected focus topics: ${interview.focusArea}.
* Keep questions practical and short.

STAGE 8: Real-World Scenario Question
* Ask one scenario-based question relevant to the job role.
* Evaluate problem-solving approach.

STAGE 9: Closing
* Provide encouraging closing remarks.
* Ask if the candidate has questions.
* End the interview.

AI RESPONSE STYLE:
* Use short, clear sentences.
* Maintain professional but friendly tone.
* Avoid long explanations.
* Sound natural and conversational.
* Use acknowledgments like: "That's interesting", "Good point", "I see".

DURATION MANAGEMENT & LOGIC REQUIREMENTS:
* Ensure entire flow fits within approximately 10 minutes.
* Track interview stage state internally.
* CRITICAL: Before starting a new STAGE, you MUST explicitly announce the transition to the candidate in your response (e.g., "Now, let's move on to discuss your resume...", "Next, I'd like to ask you some technical questions...", etc.). 
* Generate follow-up questions dynamically.
* Avoid repeating topics.
* Adapt questions based on candidate responses.
* Keep responses concise and easy to understand.
* Ask only ONE question at a time and wait for their answer.

REFERENCE QUESTIONS:
${questionsList}
`;
                console.log('📤 Sending start_interview message');
                ws.send(JSON.stringify({ type: 'start_interview', systemMessage }));

                // Wait a bit for backend to process, then start UI updates and microphone
                setTimeout(async () => {
                    setIsCallActive(true);
                    setIsStarting(false);
                    setTimeLeft(1800);
                    setAiStatus('listening');

                    // Start timer
                    timerRef.current = setInterval(() => {
                        setTimeLeft(prev => {
                            if (prev <= 1) {
                                clearInterval(timerRef.current);
                                finishInterview();
                                return 0;
                            }
                            return prev - 1;
                        });
                    }, 1000);

                    // Start face tracking
                    startFaceTracking();

                    // Start Microphone AFTER sending the start message
                    await startMicrophone();
                }, 500);
            };

            ws.onmessage = async (event) => {
                const data = event.data;

                if (data instanceof Blob) {
                    // Audio Data
                    console.log("🔊 Audio blob received:", data.size, "bytes");
                    audioQueueRef.current.push(data);
                    playNextAudio();
                } else {
                    try {
                        const message = JSON.parse(data);
                        console.log("📨 WebSocket message:", message);

                        if (message.type === 'transcript') {
                            setTranscript(prev => {
                                const newTranscript = [...prev, {
                                    role: message.role,
                                    text: message.text
                                }];
                                setTimeout(() => {
                                    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                                }, 100);
                                return newTranscript;
                            });
                        } else if (message.type === 'status') {
                            console.log("📊 Status update:", message.status);
                            setAiStatus(message.status);

                            // Prevent cross-talk: pause recognition while AI is speaking,
                            // then resume when AI is listening again.
                            if (message.status === 'speaking' && !isMicMuted) {
                                try {
                                    SpeechRecognition.stopListening();
                                    isMicPausedForAIRef.current = true;
                                } catch (err) {
                                    console.error('Failed to pause mic during AI speech', err);
                                }
                            }

                            if (message.status === 'listening' && !isMicMuted) {
                                if (isMicPausedForAIRef.current) {
                                    try {
                                        await startMicrophone();
                                    } catch (err) {
                                        console.error('Failed to resume mic after AI speech', err);
                                    }
                                    isMicPausedForAIRef.current = false;
                                }

                                // Send anything user said right as AI finished speaking.
                                flushPendingUserMessage();
                            }
                        } else if (message.type === 'stop_interview') {
                            hasForcedModerationExitRef.current = true;
                            stopMockInterview();
                            toast.error('Interview stopped due to policy violation.');
                            navigate(`/mock-interview/${mockId}`, {
                                replace: true,
                                state: {
                                    moderationStopped: true,
                                    reason: message.reason || 'policy_violation',
                                },
                            });
                        } else if (message.type === 'error') {
                            console.error("❌ Backend error:", message.message);
                            toast.error(message.message);
                        }
                    } catch (e) {
                        console.error("❌ Parse error", e);
                    }
                }
            };

            ws.onerror = (e) => {
                console.error("❌ WebSocket error", e);
                toast.error("Connection error");
                stopMockInterview();
            };

            ws.onclose = () => {
                console.log("🔌 WebSocket closed");
                if (!hasForcedModerationExitRef.current) {
                    stopMockInterview();
                }
            };

        } catch (err) {
            console.error("❌ Failed to start interview:", err);
            toast.error("Failed to start interview");
            setIsStarting(false);
        }
    };

    const startFaceTracking = () => {
        if (!modelsLoaded || !videoRef.current) return;

        faceTrackingIntervalRef.current = setInterval(async () => {
            if (videoRef.current && !videoRef.current.paused && isVideoEnabled) {
                try {
                    const detections = await faceapi.detectSingleFace(
                        videoRef.current,
                        new faceapi.TinyFaceDetectorOptions()
                    ).withFaceExpressions();

                    const metrics = faceMetricsRef.current;
                    metrics.totalFrames += 1;

                    if (detections) {
                        metrics.faceDetectedFrames += 1;

                        // Accumulate expressions
                        Object.keys(detections.expressions).forEach(exp => {
                            metrics.expressions[exp] += detections.expressions[exp];
                        });

                        // Track shifts
                        const dominant = Object.keys(detections.expressions).reduce((a, b) =>
                            detections.expressions[a] > detections.expressions[b] ? a : b
                        );

                        if (metrics.lastDominantEmotion && metrics.lastDominantEmotion !== dominant) {
                            metrics.significantShifts += 1;
                        }
                        metrics.lastDominantEmotion = dominant;

                        // Live Metrics update
                        const currentEyePercent = Math.round((metrics.faceDetectedFrames / metrics.totalFrames) * 100);
                        let conf = 50 + (currentEyePercent * 0.3) + (detections.expressions.happy * 20);
                        conf -= (detections.expressions.sad * 20) + (detections.expressions.fearful * 30);
                        const currentConfidence = Math.max(0, Math.min(100, Math.round(conf)));

                        setLiveMetrics({ eyeContact: currentEyePercent, confidence: currentConfidence });
                    } else {
                        const currentEyePercent = Math.round((metrics.faceDetectedFrames / metrics.totalFrames) * 100);
                        setLiveMetrics(prev => ({ ...prev, eyeContact: currentEyePercent }));
                    }
                } catch (e) {
                    console.error("Tracking err:", e);
                }
            }
        }, 1000); // Track every second
    };

    const startMicrophone = async () => {
        if (!browserSupportsSpeechRecognition) {
            toast.error('Speech recognition not supported in this browser. Please use Chrome/Edge.');
            return;
        }

        try {
            console.log('🎤 Starting browser speech recognition...');
            lastSentTranscriptRef.current = '';
            resetTranscript();
            SpeechRecognition.startListening({
                continuous: true,
                interimResults: true,
                language: 'en-US',
            });
        } catch (e) {
            console.error('❌ Speech recognition failed', e);
            toast.error('Microphone/speech recognition permission required');
            throw e;
        }
    };

    const playNextAudio = async () => {
        if (isPlayingRef.current || audioQueueRef.current.length === 0) {
            return;
        }

        isPlayingRef.current = true;
        const blob = audioQueueRef.current.shift();

        try {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
                console.log("🔊 AudioContext created");
            }

            if (audioContextRef.current.state === 'suspended') {
                await audioContextRef.current.resume();
                console.log("▶️ AudioContext resumed");
            }

            console.log("🎵 Decoding audio blob...");
            const arrayBuffer = await blob.arrayBuffer();
            const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
            console.log("✅ Audio decoded, duration:", audioBuffer.duration, "seconds");

            const source = audioContextRef.current.createBufferSource();
            source.buffer = audioBuffer;
            source.playbackRate.value = speechRate;
            source.connect(audioContextRef.current.destination);

            source.onended = () => {
                console.log("✅ Audio playback finished");
                isPlayingRef.current = false;
                playNextAudio(); // Play next in queue
            };

            source.start(0);
            console.log("▶️ Audio playback started");

        } catch (error) {
            console.error("❌ Error playing audio:", error);
            isPlayingRef.current = false;
            playNextAudio(); // Try next in queue
        }
    };

    const stopMockInterview = () => {
        cleanupInterview();
        setIsCallActive(false);
    };

    const cleanupInterview = () => {
        stopCamera();
        if (wsRef.current) {
            wsRef.current.close();
        }
        if (faceTrackingIntervalRef.current) {
            clearInterval(faceTrackingIntervalRef.current);
        }
        try {
            SpeechRecognition.stopListening();
        } catch {
            // ignore
        }

        if (mediaRecorderRef.current) {
            try {
                mediaRecorderRef.current.stop();
                mediaRecorderRef.current.stream?.getTracks?.().forEach(track => track.stop());
            } catch {
                // ignore
            }
            mediaRecorderRef.current = null;
        }
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        if (sendDebounceRef.current) {
            clearTimeout(sendDebounceRef.current);
            sendDebounceRef.current = null;
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        audioQueueRef.current = [];
        isPlayingRef.current = false;
        pendingUserMessageRef.current = '';
        isMicPausedForAIRef.current = false;
    };

    const calculateBehavioralScore = () => {
        const m = faceMetricsRef.current;
        if (m.totalFrames === 0) return { eyeContact: 0, overallScore: 0, engagementScore: 0, feedback: [] };

        const eyeContactPercent = Math.round((m.faceDetectedFrames / m.totalFrames) * 100);

        // Confidence formulation: Neutral/Happy relative to total frames detected
        const positiveBase = (m.expressions.neutral + (m.expressions.happy * 1.5));
        const negativeBase = (m.expressions.fearful + m.expressions.sad + m.expressions.angry + m.expressions.disgusted);

        let confidenceScore = Math.round(((positiveBase / (positiveBase + negativeBase)) * 100)) || 0;
        // Cap confidence if eye contact is extremely poor
        if (eyeContactPercent < 30) confidenceScore = Math.min(confidenceScore, 40);

        // Engagement formulation: Shift in expressions + face presence
        const engagementScore = Math.min(100, Math.round(eyeContactPercent * 0.7 + (m.significantShifts * 2)));

        const feedback = [];
        if (eyeContactPercent < 50) feedback.push("You frequently looked away from the camera. Try to maintain better eye contact next time.");
        else if (eyeContactPercent > 80) feedback.push("Excellent eye contact throughout the interview.");

        if (confidenceScore < 60) feedback.push("Your expressions occasionally appeared nervous or uncertain. Remember to take deep breaths.");
        else if (confidenceScore > 85) feedback.push("You displayed strong, confident body language.");

        if (m.expressions.happy > (m.faceDetectedFrames * 0.15)) feedback.push("Good use of smiling to appear friendly and approachable.");

        return {
            eyeContact: eyeContactPercent,
            overallScore: confidenceScore,
            engagementScore,
            feedback
        };
    };

    const finishInterview = async () => {
        const behaviorAnalysis = calculateBehavioralScore();
        const currentTranscript = transcript; // Use current state snapshot

        stopMockInterview();

        toast.promise(
            axios.post(`/mock-interview/${mockId}/end`, {
                transcript: currentTranscript,
                behaviorAnalysis
            }),
            {
                loading: 'Analyzing your behavioral and technical performance...',
                success: 'Analysis complete!',
                error: 'Failed to save results.'
            }
        ).then(() => {
            navigate(`/mock-interview/${mockId}/feedback`);
        }).catch(e => console.error(e));
    };

    const toggleMic = () => {
        if (isMicMuted) {
            startMicrophone();
            toast.success("Microphone resumed");
            setIsMicMuted(false);
        } else {
            try {
                SpeechRecognition.stopListening();
                toast.success("Microphone muted");
            } catch (err) {
                console.error("Error stopping mic", err);
            }
            setIsMicMuted(true);
        }
    };

    const toggleVideo = () => {
        if (streamRef.current) {
            streamRef.current.getVideoTracks().forEach(track => {
                track.enabled = !isVideoEnabled;
            });
            setIsVideoEnabled(!isVideoEnabled);
            toast.success(isVideoEnabled ? "Video off" : "Video on");
        }
    };

    const cycleSpeechRate = () => {
        // Presets optimized for interview clarity.
        const presets = [0.9, 0.95, 1.0];
        const currentIndex = presets.findIndex((rate) => Math.abs(rate - speechRate) < 0.01);
        const nextRate = currentIndex === -1 ? 1 : presets[(currentIndex + 1) % presets.length];
        setSpeechRate(nextRate);
        toast.success(`Speech speed: ${nextRate.toFixed(2)}x`, { duration: 1400 });
    };

    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    const progressPercent = Math.min(100, Math.max(0, ((1800 - timeLeft) / 1800) * 100));

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin w-10 h-10 text-[rgb(var(--accent))]" /></div>;

    return (
        <div className="h-screen bg-[rgb(var(--bg-background))] p-3 md:p-4 flex flex-col font-sans overflow-hidden">
            {/* Top Bar */}
            <div className="flex flex-col gap-2 pb-3 border-b border-[rgb(var(--border))] flex-shrink-0">
                {/* Row 1: Logo + Timer */}
                <div className="flex items-center justify-between">
                    <Link to="/home" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-[rgb(var(--accent))] rounded-xl flex items-center justify-center shadow-md">
                            <Bot className="w-5 h-5 md:w-6 md:h-6 text-white" />
                        </div>
                        <h1 className="text-xl md:text-2xl font-bold text-[rgb(var(--text-primary))]">Interview AI</h1>
                    </Link>

                    {/* Advanced Time Tracker */}
                    <div className="flex items-center gap-4 bg-[rgb(var(--bg-elevated))]/60 border border-[rgb(var(--border))] backdrop-blur-md px-4 py-2 rounded-2xl shadow-sm transition-all hover:shadow-md">
                        <div className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-colors duration-500 ${isCallActive ? 'bg-[rgb(var(--accent))]/10 text-[rgb(var(--accent))]' : 'bg-[rgb(var(--bg-elevated-alt))] text-[rgb(var(--text-muted))]'}`}>
                            {isCallActive && (
                                <div className="absolute inset-0 rounded-full border-2 border-[rgb(var(--accent))] border-t-transparent animate-spin opacity-50"></div>
                            )}
                            <Clock className={`w-5 h-5 ${isCallActive && timeLeft < 300 ? 'text-[rgb(var(--danger))] animate-pulse' : ''}`} />
                        </div>

                        <div className="flex flex-col items-end min-w-[120px]">
                            <div className="flex justify-between w-full items-center mb-1">
                                <span className="text-xs font-bold text-[rgb(var(--text-muted))] uppercase tracking-wider">
                                    {isCallActive ? 'Active' : 'Standby'}
                                </span>
                                <span className={`text-xl font-black tabular-nums tracking-tight drop-shadow-sm ${timeLeft < 300 ? 'text-[rgb(var(--danger))] animate-pulse' : 'text-[rgb(var(--text-primary))]'}`}>
                                    {formatDuration(timeLeft)}
                                </span>
                            </div>

                            {/* Dynamic Progress Bar */}
                            <div className="w-full h-1.5 bg-[rgb(var(--border))] rounded-full overflow-hidden relative shadow-inner">
                                <div
                                    className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-linear ${timeLeft < 300 ? 'bg-gradient-to-r from-[rgb(var(--danger))]/80 to-[rgb(var(--danger))] shadow-[0_0_8px_rgba(var(--danger),0.8)]' : 'bg-gradient-to-r from-[rgb(var(--accent))]/80 to-[rgb(var(--accent))] shadow-[0_0_8px_rgba(var(--accent),0.6)]'}`}
                                    style={{ inlineSize: progressPercent + '%' }}
                                >
                                    <div className="absolute top-0 right-0 bottom-0 w-6 bg-white/40 blur-[2px] rounded-full translate-x-2"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Row 2: Info Badges — full width, always visible */}
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-3 py-1 bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border))] rounded-full text-sm font-medium flex items-center gap-1.5 text-[rgb(var(--text-secondary))] shadow-sm whitespace-nowrap">
                        <Bot className="w-3.5 h-3.5 flex-shrink-0" /> {candidateName}
                    </span>
                    <span className="px-3 py-1 bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border))] rounded-full text-sm font-medium flex items-center gap-1.5 text-[rgb(var(--text-secondary))] shadow-sm whitespace-nowrap">
                        <Globe className="w-3.5 h-3.5 flex-shrink-0" /> English
                    </span>
                    <span className="px-3 py-1 bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border))] rounded-full text-sm font-medium flex items-center gap-1.5 text-[rgb(var(--text-secondary))] shadow-sm whitespace-nowrap">
                        <Building2 className="w-3.5 h-3.5 flex-shrink-0" /> {interview?.degree || 'General Profile'}
                    </span>
                    <span className="px-3 py-1 bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border))] rounded-full text-sm font-medium flex items-center gap-1.5 text-[rgb(var(--text-secondary))] shadow-sm whitespace-nowrap">
                        <Briefcase className="w-3.5 h-3.5 flex-shrink-0" /> {interview?.jobPosition || 'React JS Developer'}
                    </span>
                    {resumeSkills.length > 0 && (
                        <span className="px-3 py-1 bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border))] rounded-full text-sm font-medium flex items-center gap-1.5 text-[rgb(var(--text-secondary))] shadow-sm whitespace-nowrap max-w-[420px] truncate">
                            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" /> {resumeSkills.slice(0, 6).join(', ')}
                        </span>
                    )}
                </div>

                {(profileSummary || profileEducation.length > 0 || profileProjects.length > 0 || profileExperience.length > 0 || interview?.resumeContext) && (
                    <div className="bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border))] rounded-xl px-3 py-2 text-xs text-[rgb(var(--text-secondary))]">
                        <div className="font-semibold text-[rgb(var(--text-primary))] mb-1">Candidate Snapshot</div>

                        {profileSummary && (
                            <p className="line-clamp-2 mb-1">{profileSummary}</p>
                        )}

                        {profileEducation.length > 0 && (
                            <p className="line-clamp-1 mb-1"><span className="font-medium text-[rgb(var(--text-primary))]">Education:</span> {profileEducation.slice(0, 2).join(' | ')}</p>
                        )}

                        {profileProjects.length > 0 && (
                            <p className="line-clamp-1 mb-1"><span className="font-medium text-[rgb(var(--text-primary))]">Projects:</span> {profileProjects.slice(0, 2).map((p) => p?.title || p?.description).filter(Boolean).join(' | ')}</p>
                        )}

                        {profileExperience.length > 0 && (
                            <p className="line-clamp-1 mb-1"><span className="font-medium text-[rgb(var(--text-primary))]">Experience:</span> {profileExperience.slice(0, 2).map((w) => [w?.role, w?.company].filter(Boolean).join(' at ') || w?.duration).filter(Boolean).join(' | ')}</p>
                        )}

                        {!profileSummary && profileEducation.length === 0 && profileProjects.length === 0 && profileExperience.length === 0 && interview?.resumeContext && (
                            <p className="line-clamp-2">{String(interview.resumeContext).replace(/--- RESUME CONTENT ---/g, '').slice(0, 220)}</p>
                        )}
                    </div>
                )}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col lg:flex-row gap-4 mt-4 min-h-0">
                {/* Left Area - Video */}
                <div className={`flex flex-col relative min-w-0 transition-all duration-500 ease-in-out ${activeView === 'user' ? 'flex-[2] order-1' : 'flex-[1] lg:max-w-[400px] order-2'}`}>
                    <div className="relative flex-1 bg-[rgb(var(--bg-card))] rounded-2xl overflow-hidden border border-[rgb(var(--border))] shadow-sm group">
                        {/* User Video Feed */}
                        <video
                            ref={videoRef}
                            autoPlay
                            muted
                            playsInline
                            className={`w-full h-full object-cover transition-opacity duration-300 ${isVideoEnabled ? 'opacity-100' : 'opacity-0'}`}
                        />
                        {!isVideoEnabled && (
                            <div className="absolute inset-0 flex items-center justify-center bg-[rgb(var(--bg-body))]">
                                <div className="w-24 h-24 rounded-full bg-[rgb(var(--bg-elevated-alt))] flex items-center justify-center text-[rgb(var(--text-muted))]">
                                    <VideoOff className="w-10 h-10" />
                                </div>
                            </div>
                        )}

                        {/* Top Left Overlay */}
                        <div className="absolute top-4 left-4 font-bold text-[rgb(var(--text-primary))] bg-[rgb(var(--bg-elevated))]/40 backdrop-blur-md px-3 py-1.5 rounded-lg text-sm shadow-sm flex items-center gap-2">
                            {candidateName} (You)
                        </div>

                        {/* Top Right Overlay */}
                        <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-[rgb(var(--bg-elevated))]/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-bold text-[rgb(var(--danger))] shadow-sm border border-[rgb(var(--border))]">
                            <div className="w-2 h-2 rounded-full bg-[rgb(var(--danger))] animate-pulse"></div>
                            Rec
                        </div>

                        {/* Live AI Face Analytics UI */}
                        {isCallActive && modelsLoaded && isVideoEnabled && (
                            <div className="absolute bottom-16 left-4 bg-[rgb(var(--bg-elevated))]/70 backdrop-blur-md p-3 rounded-xl border border-[rgb(var(--border))] shadow-sm flex flex-col gap-2 min-w-[150px]">
                                <div className="text-[10px] font-bold text-[rgb(var(--text-muted))] uppercase tracking-widest text-center border-b border-[rgb(var(--border))] pb-1 mb-1">Live Analytics</div>

                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-[rgb(var(--text-secondary))] font-medium text-xs">Eye Contact</span>
                                    <span className={`font-bold ${liveMetrics.eyeContact > 60 ? 'text-[rgb(var(--success))]' : 'text-[rgb(var(--warning))]'}`}>
                                        {liveMetrics.eyeContact}%
                                    </span>
                                </div>

                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-[rgb(var(--text-secondary))] font-medium text-xs">Confidence</span>
                                    <span className={`font-bold ${liveMetrics.confidence > 70 ? 'text-[rgb(var(--success))]' : 'text-[rgb(var(--warning))]'}`}>
                                        {liveMetrics.confidence}%
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Bottom Left Overlay */}
                        <div className="absolute bottom-4 left-4 bg-[rgb(var(--success))] px-3 py-2 rounded-full flex gap-1 items-center shadow-md">
                            <div className={`w-1.5 h-1.5 bg-black/80 rounded-full ${!isMicMuted && isCallActive ? 'animate-bounce' : ''}`} style={{ animationDelay: '0ms' }}></div>
                            <div className={`w-1.5 h-1.5 bg-black/80 rounded-full ${!isMicMuted && isCallActive ? 'animate-bounce' : ''}`} style={{ animationDelay: '100ms' }}></div>
                            <div className={`w-1.5 h-1.5 bg-black/80 rounded-full ${!isMicMuted && isCallActive ? 'animate-bounce' : ''}`} style={{ animationDelay: '200ms' }}></div>
                            <div className={`w-1.5 h-1.5 bg-black/80 rounded-full ${!isMicMuted && isCallActive ? 'animate-bounce' : ''}`} style={{ animationDelay: '300ms' }}></div>
                            <div className={`w-1.5 h-1.5 bg-black/80 rounded-full ${!isMicMuted && isCallActive ? 'animate-bounce' : ''}`} style={{ animationDelay: '400ms' }}></div>
                        </div>

                        {/* View Toggle Button */}
                        {isCallActive && (
                            <button
                                onClick={() => setActiveView(prev => prev === 'user' ? 'ai' : 'user')}
                                className="absolute bottom-4 right-4 bg-[rgb(var(--bg-elevated))]/70 backdrop-blur-md p-2 rounded-xl text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--bg-elevated))] hover:scale-105 border border-[rgb(var(--border))] shadow-sm z-20 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                                title="Toggle View"
                            >
                                {activeView === 'user' ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                            </button>
                        )}

                        {/* Start View Overlay */}
                        {!isCallActive && (
                            <div className="absolute inset-0 bg-[rgb(var(--bg-body))]/60 backdrop-blur-sm flex items-center justify-center z-20">
                                <button
                                    onClick={startInterview}
                                    disabled={isStarting}
                                    className="bg-[rgb(var(--bg-elevated))] text-[rgb(var(--text-primary))] px-8 py-3 rounded-full font-bold text-base hover:scale-105 transition-transform shadow-xl disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 min-w-[180px] border border-[rgb(var(--border))]"
                                >
                                    {isStarting ? (
                                        <Loader2 className="animate-spin w-5 h-5 mx-auto text-[rgb(var(--text-primary))]" />
                                    ) : (
                                        'Start Interview'
                                    )}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Controls Toolbar beneath video */}
                    <div className="flex justify-center items-center gap-4 mt-4 h-14 flex-shrink-0">
                        <button
                            onClick={() => isCallActive ? finishInterview() : window.history.back()}
                            className="w-12 h-12 rounded-full border border-[rgb(var(--danger))]/30 flex items-center justify-center text-[rgb(var(--danger))] hover:bg-[rgb(var(--danger))]/10 hover:border-[rgb(var(--danger))]/50 transition-colors bg-[rgb(var(--bg-elevated))] shadow-sm"
                            title={isCallActive ? "End Call" : "Leave"}
                        >
                            <PhoneOff className="w-5 h-5" />
                        </button>
                        <button
                            onClick={toggleMic}
                            className={`w-12 h-12 rounded-full border flex items-center justify-center transition-colors shadow-sm ${isMicMuted ? 'bg-[rgb(var(--danger))]/10 border-[rgb(var(--danger))]/30 text-[rgb(var(--danger))] hover:bg-[rgb(var(--danger))]/20' : 'bg-[rgb(var(--bg-elevated))] border-[rgb(var(--border))] text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-elevated-alt))]'}`}
                            title={isMicMuted ? "Unmute" : "Mute"}
                        >
                            {isMicMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                        </button>
                        <button
                            onClick={toggleVideo}
                            className={`w-12 h-12 rounded-full border flex items-center justify-center transition-colors shadow-sm ${!isVideoEnabled ? 'bg-[rgb(var(--danger))]/10 border-[rgb(var(--danger))]/30 text-[rgb(var(--danger))] hover:bg-[rgb(var(--danger))]/20' : 'bg-[rgb(var(--bg-elevated))] border-[rgb(var(--border))] text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-elevated-alt))]'}`}
                            title={!isVideoEnabled ? "Start Video" : "Stop Video"}
                        >
                            {!isVideoEnabled ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                        </button>
                        <button
                            onClick={cycleSpeechRate}
                            className="min-w-[72px] h-12 px-3 rounded-full border border-[rgb(var(--border))] flex items-center justify-center bg-[rgb(var(--bg-elevated))] text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--bg-elevated-alt))] transition-colors shadow-sm"
                            title="Change AI speech speed"
                        >
                            <span className="text-xs font-semibold tracking-wide">{speechRate.toFixed(2)}x</span>
                        </button>
                    </div>
                </div>

                {/* Right Area - Transcript & Avatar */}
                <div className={`flex flex-col gap-4 min-w-[320px] transition-all duration-500 ease-in-out ${activeView === 'user' ? 'flex-[1] lg:max-w-[400px] order-2' : 'flex-[2] order-1'}`}>
                    {/* Transcript List */}
                    <div className={`bg-[rgb(var(--bg-card))] rounded-2xl border border-[rgb(var(--border))] overflow-hidden flex flex-col p-4 shadow-sm group ${isTranscriptFullScreen ? 'fixed inset-4 z-50 flex-[1]' : 'flex-[3] min-h-[300px]'}`}>
                        {/* View Toggle Button */}
                        <button
                            onClick={() => setIsTranscriptFullScreen(prev => !prev)}
                            className="absolute top-4 right-4 z-10 p-1.5 rounded-lg bg-[rgb(var(--bg-elevated))]/70 backdrop-blur-md flex items-center justify-center border border-[rgb(var(--border))] shadow-sm hover:bg-[rgb(var(--bg-elevated))] text-[rgb(var(--text-primary))] opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                            title={isTranscriptFullScreen ? "Minimize Transcript" : "Full Screen Transcript"}
                        >
                            {isTranscriptFullScreen ? <X className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                        </button>

                        <div className="flex-1 overflow-y-auto space-y-5 min-h-0 pr-2 custom-scrollbar">
                            {transcript.length === 0 && (
                                <p className="text-sm text-[rgb(var(--text-muted))] italic text-center py-8">
                                    Questions will appear here. Let's keep going.
                                </p>
                            )}
                            {transcript.map((msg, idx) => (
                                <div key={idx} className="flex flex-col">
                                    <div className="text-sm font-bold text-[rgb(var(--text-primary))] mb-1">
                                        {msg.role === 'user' ? 'You' : 'Alex (AI Interviewer)'}
                                    </div>
                                    <div className={`text-[15px] leading-relaxed ${msg.role === 'user' ? 'text-[rgb(var(--text-secondary))]' : 'text-[rgb(var(--text-primary))]'}`}>
                                        {msg.role === 'user' ? (
                                            <p>{msg.text}</p>
                                        ) : (
                                            <div className="prose prose-sm dark:prose-invert max-w-none">
                                                <ReactMarkdown
                                                    remarkPlugins={[remarkGfm]}
                                                    components={{
                                                        code({ node, inline, className, children, ...props }) {
                                                            const match = /language-(\w+)/.exec(className || '');
                                                            return !inline && match ? (
                                                                <div className="rounded-md overflow-hidden my-2 shadow-sm border border-[rgb(var(--border))]">
                                                                    <div className="bg-[rgb(var(--bg-body))] px-4 py-1 text-xs text-[rgb(var(--text-muted))] font-mono uppercase border-b border-[rgb(var(--border))]">
                                                                        {match[1]}
                                                                    </div>
                                                                    <SyntaxHighlighter
                                                                        {...props}
                                                                        style={vscDarkPlus}
                                                                        language={match[1]}
                                                                        PreTag="div"
                                                                        customStyle={{ margin: 0, padding: '1rem', background: '#0d1117' }}
                                                                    >
                                                                        {String(children).replace(/\n$/, '')}
                                                                    </SyntaxHighlighter>
                                                                </div>
                                                            ) : (
                                                                <code {...props} className="bg-[rgb(var(--bg-body-alt))] text-[rgb(var(--accent))] px-1.5 py-0.5 rounded-md text-sm font-mono border border-[rgb(var(--border-subtle))]">
                                                                    {children}
                                                                </code>
                                                            );
                                                        },
                                                        ul({ children }) { return <ul className="list-disc pl-5 my-2 text-[rgb(var(--text-secondary))] space-y-1">{children}</ul> },
                                                        ol({ children }) { return <ol className="list-decimal pl-5 my-2 text-[rgb(var(--text-secondary))] space-y-1">{children}</ol> },
                                                        p({ children }) { return <p className="mb-2 last:mb-0 text-[rgb(var(--text-secondary))]">{children}</p> },
                                                        strong({ children }) { return <strong className="font-bold text-[rgb(var(--accent))]">{children}</strong> }
                                                    }}
                                                >
                                                    {msg.text}
                                                </ReactMarkdown>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            <div ref={transcriptEndRef} />
                        </div>
                    </div>

                    {/* AI Avatar */}
                    <div className={`bg-[rgb(var(--bg-card-alt))] rounded-2xl border border-[rgb(var(--accent))]/30 p-4 flex flex-col relative overflow-hidden shadow-sm transition-all duration-500 group ${activeView === 'user' ? 'flex-[2] min-h-[200px]' : 'flex-[4] min-h-[300px]'}`}>
                        <h3 className="text-base font-bold text-[rgb(var(--text-primary))] absolute top-4 left-4 z-10">Alex (AI)</h3>
                        <div className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-[rgb(var(--bg-elevated))] flex items-center justify-center border border-[rgb(var(--border))] shadow-sm">
                            <div className="text-sm text-[rgb(var(--accent))] font-bold">A</div>
                        </div>

                        {/* View Toggle Button */}
                        {isCallActive && (
                            <button
                                onClick={() => setActiveView(prev => prev === 'user' ? 'ai' : 'user')}
                                className="absolute top-4 right-14 z-10 p-1.5 rounded-lg bg-[rgb(var(--bg-elevated))]/70 backdrop-blur-md flex items-center justify-center border border-[rgb(var(--border))] shadow-sm hover:bg-[rgb(var(--bg-elevated))] text-[rgb(var(--text-primary))] opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                                title="Toggle View"
                            >
                                {activeView === 'ai' ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                            </button>
                        )}

                        <div className="absolute bottom-4 left-4 z-10 w-8 h-8 rounded-full bg-[rgb(var(--accent))]/20 text-[rgb(var(--accent))] flex items-center justify-center shadow-sm">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>

                        <div className="flex-1 flex items-center justify-center relative mt-6">
                            {/* Glowing orb effects */}
                            {isCallActive && aiStatus === 'speaking' && (
                                <>
                                    <div className="absolute w-40 h-40 bg-[rgb(var(--accent))]/30 rounded-full blur-2xl animate-ping opacity-70"></div>
                                    <div className="absolute w-56 h-56 bg-[rgb(var(--accent))]/10 rounded-full blur-3xl animate-pulse"></div>
                                </>
                            )}
                            <div className={`absolute w-32 h-32 bg-[rgb(var(--accent))]/20 rounded-full blur-xl transition-all duration-700 ${isCallActive && aiStatus === 'speaking' ? 'scale-[1.8] opacity-100' : 'scale-100 opacity-50'}`}></div>
                            <div className={`absolute w-24 h-24 bg-[rgb(var(--accent))]/30 rounded-full blur-md transition-all duration-500 ${isCallActive && aiStatus === 'speaking' ? 'scale-[1.4] opacity-100' : 'scale-100 opacity-60'}`}></div>
                            <div className={`relative z-10 w-24 h-24 bg-gradient-to-br from-[rgb(var(--accent))] to-[rgb(var(--accent-hover))] rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(var(--accent),0.5)] border-[5px] border-[rgb(var(--bg-elevated))]/60 transition-transform duration-300 ${isCallActive && aiStatus === 'speaking' ? 'scale-110' : 'scale-100'}`}>
                                <span className="text-4xl font-extrabold text-[rgb(var(--accent-foreground))] drop-shadow-md">A</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActiveInterview;

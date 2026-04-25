import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from '../../utils/axiosInstance';
import { Loader2, Play, Briefcase, Code, Award, Target, FileText, Globe, Clock, CheckCircle, Mic, Volume2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const InterviewDetails = () => {
    const { mockId } = useParams();
    const [interview, setInterview] = useState(null);
    const [loading, setLoading] = useState(true);

    // Audio Test State
    const [devices, setDevices] = useState([]);
    const [selectedDevice, setSelectedDevice] = useState('');
    const [volume, setVolume] = useState(0);
    const [isMicTested, setIsMicTested] = useState(false);
    const [audioError, setAudioError] = useState('');

    // Audio refs
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const streamRef = useRef(null);
    const frameRef = useRef(null);

    // Fetch Devices
    useEffect(() => {
        const getDevices = async () => {
            try {
                await navigator.mediaDevices.getUserMedia({ audio: true }); // Request permission
                const allDevices = await navigator.mediaDevices.enumerateDevices();
                const audioDevices = allDevices.filter(d => d.kind === 'audioinput');
                setDevices(audioDevices);
                if (audioDevices.length > 0) {
                    setSelectedDevice(audioDevices[0].deviceId);
                }
            } catch (err) {
                console.error("Audio permission denied", err);
                setAudioError("Microphone permission denied. Please allow it in your browser settings to proceed.");
            }
        };
        getDevices();

        return () => {
            stopAudio();
        };
    }, []);

    const stopAudio = () => {
        if (frameRef.current) cancelAnimationFrame(frameRef.current);
        if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close().catch(console.error);
        }
    };

    // Monitor Volume
    useEffect(() => {
        if (!selectedDevice) return;

        const startMonitoring = async () => {
            stopAudio();
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    audio: { deviceId: { exact: selectedDevice } }
                });
                streamRef.current = stream;

                const AudioContext = window.AudioContext || window.webkitAudioContext;
                const audioCtx = new AudioContext();
                audioContextRef.current = audioCtx;

                const analyser = audioCtx.createAnalyser();
                analyser.fftSize = 256;
                const source = audioCtx.createMediaStreamSource(stream);
                source.connect(analyser);
                analyserRef.current = analyser;

                const dataArray = new Uint8Array(analyser.frequencyBinCount);

                const updateVolume = () => {
                    if (!analyserRef.current) return;
                    analyser.getByteFrequencyData(dataArray);

                    let sum = 0;
                    for (let i = 0; i < dataArray.length; i++) {
                        sum += dataArray[i];
                    }
                    const avg = sum / dataArray.length;
                    const volPercent = Math.min(100, Math.round((avg / 128) * 100)); // Normalize

                    setVolume(volPercent);

                    // Threshold to unlock the button
                    if (volPercent > 10) {
                        setIsMicTested(true);
                    }

                    frameRef.current = requestAnimationFrame(updateVolume);
                };
                updateVolume();
                setAudioError('');
            } catch (err) {
                console.error("Error starting stream for device", err);
                setAudioError("Failed to access selected microphone.");
            }
        };
        startMonitoring();
    }, [selectedDevice]);

    useEffect(() => {
        fetchInterview();
    }, [mockId]);

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

    if (loading) return (
        <div className="flex justify-center items-center min-h-[60vh]">
            <Loader2 className="animate-spin w-10 h-10 text-[rgb(var(--accent))]" />
        </div>
    );

    if (!interview) return (
        <div className="text-center py-20">
            <h2 className="text-xl font-bold text-[rgb(var(--text-primary))]">Interview Not Found</h2>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto py-10 px-4">
            <div className="bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border))] rounded-2xl shadow-xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-[rgb(var(--bg-card))] to-[rgb(var(--bg-card-alt))] p-8 border-b border-[rgb(var(--border))]">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                                    ${interview.interviewType === 'Technical' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'}`}>
                                    {interview.interviewType}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                                    ${interview.difficulty === 'Expert' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                                        interview.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                                            'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'}`}>
                                    {interview.difficulty}
                                </span>
                            </div>
                            <h1 className="text-3xl font-extrabold text-[rgb(var(--text-primary))] mb-2">{interview.jobPosition}</h1>
                            <p className="text-[rgb(var(--text-muted))] flex items-center gap-2 text-sm">
                                <Clock className="w-4 h-4" /> Created on {new Date(interview.createdAt).toLocaleDateString()}
                            </p>
                        </div>

                        {/* Proceed Button */}
                        <Link
                            to={`/mock-interview/${mockId}/start`}
                            target="_blank"
                            onClick={(e) => {
                                if (!isMicTested) {
                                    e.preventDefault();
                                    toast.error(audioError ? "Please fix audio errors." : "Please speak into the mic to verify volume.");
                                } else {
                                    stopAudio(); // Release microphone for the new tab
                                }
                            }}
                            className={`${isMicTested ? 'bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent-hover))] text-white shadow-lg transform hover:-translate-y-1 cursor-pointer' : 'bg-[rgb(var(--bg-elevated-alt))] text-[rgb(var(--text-muted))] cursor-not-allowed border border-[rgb(var(--border))]'} px-8 py-3 rounded-xl font-bold text-lg transition-all flex items-center gap-2 group`}
                        >
                            Proceed to Interview <Play className={`w-5 h-5 fill-current ${isMicTested ? 'group-hover:scale-110 transition-transform' : ''}`} />
                        </Link>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column */}
                    <div className="space-y-6">
                        <div className="bg-[rgb(var(--bg-background))] p-5 rounded-xl border border-[rgb(var(--border))]">
                            <h3 className="text-sm font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Target className="w-4 h-4" /> Focus Area
                            </h3>
                            <p className="text-lg font-medium text-[rgb(var(--text-primary))]">{interview.focusArea}</p>
                        </div>

                        <div className="bg-[rgb(var(--bg-background))] p-5 rounded-xl border border-[rgb(var(--border))]">
                            <h3 className="text-sm font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Briefcase className="w-4 h-4" /> Description / Topic
                            </h3>
                            <p className="text-[rgb(var(--text-primary))] leading-relaxed">
                                {interview.jobDesc}
                            </p>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        <div className="bg-[rgb(var(--bg-background))] p-5 rounded-xl border border-[rgb(var(--border))]">
                            <h3 className="text-sm font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Code className="w-4 h-4" /> Tech Stack / Skills
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {interview.skills.split(',').map((skill, idx) => (
                                    <span key={idx} className="bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border))] text-[rgb(var(--text-secondary))] px-3 py-1.5 rounded-lg text-sm font-medium">
                                        {skill.trim()}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="bg-[rgb(var(--bg-background))] p-5 rounded-xl border border-[rgb(var(--border))]">
                            <h3 className="text-sm font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Award className="w-4 h-4" /> Configuration
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-xs text-[rgb(var(--text-muted))] block mb-1">Questions</span>
                                    <span className="font-bold text-xl text-[rgb(var(--text-primary))]">{interview.questionCount}</span>
                                </div>
                                <div>
                                    <span className="text-xs text-[rgb(var(--text-muted))] block mb-1">Experience Level</span>
                                    <span className="font-bold text-xl text-[rgb(var(--text-primary))]">{interview.jobExperience}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Audio Pre-Check Section */}
                <div className="p-8 border-t border-[rgb(var(--border))] bg-gradient-to-r from-[rgb(var(--bg-background))] to-[rgb(var(--bg-elevated))]">
                    <h3 className="font-bold text-[rgb(var(--text-primary))] mb-4 flex items-center gap-2">
                        <Mic className="w-5 h-5 text-[rgb(var(--accent))]" /> Mandatory Pre-Interview Audio Check
                    </h3>

                    {audioError ? (
                        <div className="p-4 bg-[rgb(var(--danger))]/10 border border-[rgb(var(--danger))]/30 rounded-xl text-[rgb(var(--danger))] text-sm flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0" /> {audioError}
                        </div>
                    ) : (
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 bg-[rgb(var(--bg-card))] p-5 rounded-xl border border-[rgb(var(--border))] shadow-sm">
                            <div className="flex-1 w-full relative">
                                <label className="block text-xs font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wider mb-2">
                                    Select Microphone / Earbuds
                                </label>
                                <select
                                    value={selectedDevice}
                                    onChange={(e) => setSelectedDevice(e.target.value)}
                                    className="w-full bg-[rgb(var(--bg-elevated-alt))] border border-[rgb(var(--border))] text-[rgb(var(--text-primary))] px-4 py-2.5 rounded-xl text-sm outline-none focus:border-[rgb(var(--accent))] transition-colors cursor-pointer"
                                >
                                    {devices.length === 0 && <option value="">Loading devices...</option>}
                                    {devices.map(d => (
                                        <option key={d.deviceId} value={d.deviceId}>
                                            {d.label || `Microphone ${d.deviceId.slice(0, 5)}...`}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex-1 w-full flex flex-col gap-2">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-[rgb(var(--text-secondary))] font-medium flex items-center gap-1">
                                        <Volume2 className="w-4 h-4" /> Speak to test volume
                                    </span>
                                    <span className={`font-bold ${isMicTested ? 'text-[rgb(var(--success))]' : 'text-[rgb(var(--warning))]'}`}>
                                        {isMicTested ? 'Ready' : 'Testing...'}
                                    </span>
                                </div>

                                {/* Volume Bar */}
                                <div className="w-full h-3 bg-[rgb(var(--bg-elevated-alt))] rounded-full overflow-hidden shadow-inner border border-[rgb(var(--border))] relative">
                                    <div
                                        className={`absolute top-0 left-0 h-full rounded-full transition-all duration-75 min-w-[4px] ${isMicTested ? 'bg-gradient-to-r from-[rgb(var(--success))]/80 to-[rgb(var(--success))]' : 'bg-gradient-to-r from-[rgb(var(--warning))]/80 to-[rgb(var(--warning))]'}`}
                                        style={{ width: `${Math.max(2, volume)}%` }}
                                    ></div>
                                </div>
                                <p className="text-xs text-[rgb(var(--text-muted))] flex items-center gap-1 mt-1">
                                    * Talk normally until the bar turns green to unlock the interview.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer / Instructions */}
                <div className="bg-[rgb(var(--bg-elevated-alt))] px-8 py-6 border-t border-[rgb(var(--border))]">
                    <h3 className="font-bold text-[rgb(var(--text-primary))] mb-3 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-[rgb(var(--success))]" /> Instructions
                    </h3>
                    <ul className="text-sm text-[rgb(var(--text-muted))] space-y-2 list-disc list-inside">
                        <li>Ensure you are in a quiet environment.</li>
                        <li>Grant camera and microphone permissions when prompted.</li>
                        <li>Speak clearly and look at the camera for the behavior analysis.</li>
                        <li>Click <strong>Proceed</strong> to open the interview room in a new tab.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default InterviewDetails;

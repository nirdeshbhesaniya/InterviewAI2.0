import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import { UserContext } from '../../context/UserContext';
import { useTestMode } from '../../context/TestModeContext';
import { API } from '../../utils/apiPaths';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/button';
import {
    Clock, Play, Send, ChevronLeft, ChevronRight, CheckCircle, XCircle,
    Code, FileText, AlertTriangle, Award, Terminal, Eye, EyeOff,
    Maximize2, Minimize2, Timer, BookOpen, ArrowLeft, Loader2,
    ChevronDown, Lock
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

// ─── Language Configuration ───
const LanguageIcons = {
    JavaScript: () => (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
            <rect width="24" height="24" rx="4" fill="#F7DF1E" />
            <path d="M6.5 15.5c0 1.5.8 2.5 2.5 2.5 1.5 0 2.3-.8 2.3-2.5V9H9.8v6.5c0 .8-.4 1.2-1 1.2s-1-.4-1-1.2h-1.3zm5.5 0c0 1.5 1 2.5 2.7 2.5 1.5 0 2.5-.8 2.5-2.2 0-1.2-.6-1.8-2-2.3l-.5-.2c-.8-.3-1.2-.5-1.2-1 0-.4.3-.7.8-.7.5 0 .8.2 1 .7h1.3c-.1-1.3-1-2-2.3-2-1.4 0-2.3.9-2.3 2.1 0 1.2.6 1.8 1.8 2.2l.5.2c.9.4 1.4.6 1.4 1.2 0 .5-.4.8-1 .8-.7 0-1.1-.4-1.2-1h-1.5z" fill="#000" />
        </svg>
    ),
    Python: () => (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
            <defs>
                <linearGradient id="pythonBlue" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#387EB8" />
                    <stop offset="100%" stopColor="#366994" />
                </linearGradient>
                <linearGradient id="pythonYellow" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#FFE873" />
                    <stop offset="100%" stopColor="#FFD43B" />
                </linearGradient>
            </defs>
            <path d="M12 2C9.8 2 8 2.6 8 4.5V7h4v.5H7.5C5.6 7.5 4 8.3 4 11v2c0 2.7 1.6 3.5 3.5 3.5H9v-2.8c0-1.9 1.6-3.7 3.5-3.7h5c1.7 0 3-1.4 3-3.1V4.5C20.5 2.6 18.7 2 16.5 2h-4.5zm-1 1.5c.6 0 1 .4 1 1s-.4 1-1 1-1-.4-1-1 .4-1 1-1z" fill="url(#pythonBlue)" />
            <path d="M12 22c2.2 0 4-.6 4-2.5V17h-4v-.5h4.5c1.9 0 3.5-.8 3.5-3.5v-2c0-2.7-1.6-3.5-3.5-3.5H15v2.8c0 1.9-1.6 3.7-3.5 3.7h-5c-1.7 0-3 1.4-3 3.1v4.4C3.5 21.4 5.3 22 7.5 22h4.5zm1-1.5c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1z" fill="url(#pythonYellow)" />
        </svg>
    ),
    Java: () => (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
            <path d="M8.5 17.5s-1 .5.7.7c2 .2 3 .2 5.2-.2 0 0 .6.4 1.4.7-5 2.1-11.3-.1-7.3-1.2zm-.7-3s-1.1.8.6 1c2.2.2 4 .3 7-.3 0 0 .4.4 1 .6-5.8 1.7-12.2.1-8.6-1.3z" fill="#5382A1" />
            <path d="M13.5 11.8c1.2 1.4-.3 2.7-.3 2.7s3.1-1.6 1.7-3.6c-1.3-1.9-2.3-2.8 3.1-6 0 0-8.5 2.1-4.5 6.9z" fill="#E76F00" />
            <path d="M18.3 19.8s.7.6-.8 1c-2.8.8-11.7 1-14.2 0-.9-.4.8-.9 1.3-1 .5-.1.8-.1.8-.1-.9-.6-6.1 1.3-2.6 1.9 9.9 1.4 18-0.6 15.5-1.8zm-10.8-8s-4.3 1-1.5 1.4c1.2.1 3.5.1 5.7 0 1.8-.1 3.5-.3 3.5-.3s-.6.3-1.1.6c-4.4 1.2-12.8.6-10.4-.6 2-1 3.8-.9 3.8-.9zm8.1 4.4c4.5-2.3 2.4-4.6 1-4.3-.4.1-.5.2-.5.2s.1-.2.4-.4c2.7-1 4.8 3-.9 4.6 0-.1.1-.1.1-.1z" fill="#5382A1" />
        </svg>
    ),
    CPlusPlus: () => (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7v10l10 5 10-5V7L12 2z" fill="#00599C" stroke="#004482" strokeWidth="1.5" />
            <path d="M16.5 13.5c-.2.8-.6 1.5-1.1 2s-1.2.9-2 1.1c-.8.2-1.6.2-2.4 0-.8-.2-1.5-.6-2-1.1-.5-.5-.9-1.2-1.1-2-.2-.8-.2-1.6 0-2.4.2-.8.6-1.5 1.1-2 .5-.5 1.2-.9 2-1.1.8-.2 1.6-.2 2.4 0 .6.1 1.2.4 1.7.7l-1.2 1.5c-.3-.2-.6-.3-.9-.4-.5-.1-1-.1-1.5 0-.3.1-.6.3-.9.5-.3.2-.5.5-.6.8-.1.3-.2.7 0 1.1.1.3.3.6.5.9.2.3.5.5.8.6.3.1.7.2 1.1 0 .3-.1.6-.3.9-.5.2-.2.4-.5.5-.8h2z" fill="white" />
            <path d="M18 10.5h1v1h1v1h-1v1h-1v-1h-1v-1h1v-1zm3 0h1v1h1v1h-1v1h-1v-1h-1v-1h1v-1z" fill="#00599C" />
        </svg>
    )
};

const LANGUAGES = [
    { id: 'cpp', name: 'C++', monacoId: 'cpp', icon: <LanguageIcons.CPlusPlus /> },
    { id: 'java', name: 'Java', monacoId: 'java', icon: <LanguageIcons.Java /> },
    { id: 'python', name: 'Python', monacoId: 'python', icon: <LanguageIcons.Python /> },
    { id: 'javascript', name: 'JavaScript', monacoId: 'javascript', icon: <LanguageIcons.JavaScript /> }
];

const EDITOR_THEMES = {
    dark: 'vs-dark',
    light: 'light'
};

const DSATestPage = ({ 
    testId: propTestId, 
    attemptId: propAttemptId, 
    onComplete: propOnComplete, 
    timeLeft: propTimeLeft, 
    setTimeLeft: propSetTimeLeft, 
    isEmbedded = false, 
    testData: propTestData,
    isLastModule = true
}) => {
    const navigate = useNavigate();
    const { testId: routeTestId } = useParams();
    const testId = isEmbedded ? propTestId : routeTestId;
    const { user } = useContext(UserContext);
    const { setIsTestActive } = useTestMode();

    // ─── State ───
    const [testData, setTestData] = useState(isEmbedded ? (propTestData || null) : null);
    const [loading, setLoading] = useState(!isEmbedded);
    const [attemptId, setAttemptId] = useState(propAttemptId || null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    // Per-question state
    const [codeMap, setCodeMap] = useState({});          // questionId -> code
    const [languageMap, setLanguageMap] = useState({});   // questionId -> language
    const [resultsMap, setResultsMap] = useState({});     // questionId -> results
    const [statusMap, setStatusMap] = useState({});       // questionId -> 'idle' | 'running' | 'submitting' | 'submitted'
    const [scoreMap, setScoreMap] = useState({});         // questionId -> { score, maxScore, hiddenPassed, hiddenTotal }

    // UI state
    const [activeTab, setActiveTab] = useState('description'); // 'description' | 'testcases'
    const [showResults, setShowResults] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [localTimeLeft, setLocalTimeLeft] = useState(0);
    const [isTestComplete, setIsTestComplete] = useState(false);
    const [finalTimeSpent, setFinalTimeSpent] = useState(0);

    const timeLeft = isEmbedded ? propTimeLeft : localTimeLeft;
    const setTimeLeft = isEmbedded ? propSetTimeLeft : setLocalTimeLeft;

    const editorRef = useRef(null);
    const timerRef = useRef(null);

    useEffect(() => {
        if (propAttemptId) {
            setAttemptId(propAttemptId);
        }
    }, [propAttemptId]);

    // ─── Load Test Data ───
    useEffect(() => {
        if (isEmbedded) {
            if (propTestData) {
                setTestData(propTestData);
                setLoading(false);
                // Initialize code and language maps from DSA questions
                const initCode = {};
                const initLang = {};
                (propTestData.dsaQuestions || []).forEach(q => {
                    const firstLang = q.allowedLanguages?.[0] || 'python';
                    initLang[q.id] = firstLang;
                    const starterCode = q.starterCode instanceof Map
                        ? q.starterCode.get(firstLang)
                        : q.starterCode?.[firstLang];
                    initCode[q.id] = starterCode || getDefaultCode(firstLang);
                });
                setCodeMap(initCode);
                setLanguageMap(initLang);
            }
            return;
        }

        const loadTest = async () => {
            try {
                const res = await axiosInstance.get(API.MCQ.PRACTICE_DETAILS(testId));
                if (res.data.success) {
                    const data = res.data.data;
                    setTestData(data);

                    // Initialize code and language maps from DSA questions
                    const initCode = {};
                    const initLang = {};
                    (data.dsaQuestions || []).forEach(q => {
                        const firstLang = q.allowedLanguages?.[0] || 'python';
                        initLang[q.id] = firstLang;
                        // Use starter code if available, otherwise empty
                        const starterCode = q.starterCode instanceof Map
                            ? q.starterCode.get(firstLang)
                            : q.starterCode?.[firstLang];
                        initCode[q.id] = starterCode || getDefaultCode(firstLang);
                    });
                    setCodeMap(initCode);
                    setLanguageMap(initLang);

                    // Calculate time limit from DSA module
                    const dsaModule = (data.modules || []).find(m => m.moduleType === 'dsa');
                    const timeLimitMinutes = dsaModule?.timeLimit || data.timeLimit || 45;
                    setTimeLeft(timeLimitMinutes * 60);

                    // Start the test
                    await startTest(data);
                }
            } catch (err) {
                console.error('Error loading DSA test:', err);
                toast.error('Failed to load test');
                navigate('/mcq-test/practice');
            } finally {
                setLoading(false);
            }
        };
        loadTest();

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [testId, isEmbedded, propTestData]);

    // ─── Timer ───
    useEffect(() => {
        if (isEmbedded) return;
        if (timeLeft <= 0 || isTestComplete) return;

        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    handleTimeUp();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timerRef.current);
    }, [timeLeft, isTestComplete]);

    // ─── Fullscreen & Header/Footer Hiding ───
    const enterFullscreen = useCallback(() => {
        try {
            const docElm = document.documentElement;
            if (docElm.requestFullscreen) {
                docElm.requestFullscreen();
            } else if (docElm.mozRequestFullScreen) {
                docElm.mozRequestFullScreen();
            } else if (docElm.webkitRequestFullscreen) {
                docElm.webkitRequestFullscreen();
            } else if (docElm.msRequestFullscreen) {
                docElm.msRequestFullscreen();
            }
        } catch (err) {
            console.error("Failed to enter fullscreen:", err);
        }
    }, []);

    // Standalone mode: hide header/footer
    useEffect(() => {
        if (!isEmbedded && setIsTestActive) {
            setIsTestActive(true);
            return () => setIsTestActive(false);
        }
    }, [isEmbedded, setIsTestActive]);

    // Handle F11 key press to toggle/trigger HTML5 fullscreen mode
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'F11') {
                e.preventDefault();
                try {
                    if (document.fullscreenElement) {
                        if (document.exitFullscreen) {
                            document.exitFullscreen();
                        }
                        toast.success('Exited fullscreen mode', { duration: 2000 });
                    } else {
                        enterFullscreen();
                    }
                } catch (err) {
                    console.error('Fullscreen toggle failed:', err);
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [enterFullscreen]);

    // Auto-fullscreen when loading finishes / page mounts
    useEffect(() => {
        if (!loading && testData) {
            enterFullscreen();

            // Try to acquire fullscreen on first user interaction as fallback
            const triggerOnInteraction = () => {
                enterFullscreen();
                document.removeEventListener('click', triggerOnInteraction);
            };
            document.addEventListener('click', triggerOnInteraction);
            return () => document.removeEventListener('click', triggerOnInteraction);
        }
    }, [loading, testData, enterFullscreen]);

    const submitTestResult = useCallback(async (timeSpentOverride = null) => {
        if (!attemptId || !testData) return;

        setLoading(true);
        const submitToastId = toast.loading('Submitting your test... Please wait.');

        try {
            // Calculate time spent
            const dsaModule = (testData.modules || []).find(m => m.moduleType === 'dsa');
            const timeLimitMinutes = dsaModule?.timeLimit || testData.timeLimit || 45;
            const totalAllowedSeconds = timeLimitMinutes * 60;
            
            const actualTimeSpent = timeSpentOverride !== null 
                ? timeSpentOverride 
                : (totalAllowedSeconds - timeLeft);
            
            setFinalTimeSpent(actualTimeSpent);

            const submissionData = {
                topic: testData.topic,
                answers: {}, // No MCQ answers for DSA-only test
                questions: [], // No MCQ questions
                userInfo: {
                    name: user?.fullName || user?.email?.split('@')[0] || 'User',
                    email: user?.email
                },
                numberOfQuestions: 0,
                timeSpent: actualTimeSpent,
                securityWarnings: {
                    fullscreenExits: 0,
                    tabSwitches: 0
                },
                practiceTestId: testId,
                attemptId: attemptId
            };

            const response = await axiosInstance.post(API.MCQ.SUBMIT, submissionData);

            if (response.data.success) {
                setIsTestComplete(true);
                toast.success('Test submitted successfully!', { id: submitToastId });
                
                // Exit fullscreen
                try {
                    if (document.fullscreenElement) {
                        await document.exitFullscreen();
                    }
                } catch (e) {
                    console.log('Exit fullscreen error:', e);
                }
            }
        } catch (error) {
            console.error('Error submitting DSA test:', error);
            toast.error(error.response?.data?.message || 'Failed to submit test', { id: submitToastId });
        } finally {
            setLoading(false);
        }
    }, [attemptId, testData, timeLeft, user, testId]);

    const handleTimeUp = () => {
        const dsaModule = (testData?.modules || []).find(m => m.moduleType === 'dsa');
        const timeLimitMinutes = dsaModule?.timeLimit || testData?.timeLimit || 45;
        const totalAllowedSeconds = timeLimitMinutes * 60;
        
        toast.error('Time is up! Test auto-submitted.');
        submitTestResult(totalAllowedSeconds);
    };

    const startTest = async (data) => {
        try {
            const res = await axiosInstance.post(API.MCQ.START_PRACTICE_TEST(testId), {
                userInfo: { email: user?.email, name: user?.fullName }
            });
            if (res.data.success) {
                setAttemptId(res.data.data.attemptId);
            }
        } catch (err) {
            if (err.response?.status === 403) {
                toast.error(err.response.data.message || 'Cannot start test');
                navigate('/mcq-test/practice');
            }
        }
    };

    // ─── Helpers ───
    const getDefaultCode = (lang) => {
        const defaults = {
            cpp: '#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    \n    return 0;\n}',
            java: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your code here\n        \n    }\n}',
            python: '# Write your code here\n',
            javascript: '// Write your code here\nconst readline = require("readline");\nconst rl = readline.createInterface({ input: process.stdin });\nconst lines = [];\nrl.on("line", (line) => lines.push(line));\nrl.on("close", () => {\n    // Process input\n    \n});\n'
        };
        return defaults[lang] || '';
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const currentQuestion = testData?.dsaQuestions?.[currentQuestionIndex];
    const currentCode = currentQuestion ? (codeMap[currentQuestion.id] || '') : '';
    const currentLanguage = currentQuestion ? (languageMap[currentQuestion.id] || 'python') : 'python';
    const currentResults = currentQuestion ? resultsMap[currentQuestion.id] : null;
    const currentStatus = currentQuestion ? (statusMap[currentQuestion.id] || 'idle') : 'idle';
    const currentScore = currentQuestion ? scoreMap[currentQuestion.id] : null;

    // ─── Code Actions ───
    const handleCodeChange = (value) => {
        if (!currentQuestion) return;
        setCodeMap(prev => ({ ...prev, [currentQuestion.id]: value }));
    };

    const handleLanguageChange = (lang) => {
        if (!currentQuestion) return;
        setLanguageMap(prev => ({ ...prev, [currentQuestion.id]: lang }));
        // Load starter code for new language if current code is default
        const starterCode = currentQuestion.starterCode instanceof Map
            ? currentQuestion.starterCode.get(lang)
            : currentQuestion.starterCode?.[lang];
        const currentIsDefault = !codeMap[currentQuestion.id] ||
            codeMap[currentQuestion.id] === getDefaultCode(languageMap[currentQuestion.id]);
        if (currentIsDefault) {
            setCodeMap(prev => ({ ...prev, [currentQuestion.id]: starterCode || getDefaultCode(lang) }));
        }
    };

    const handleRunCode = async () => {
        if (!currentQuestion || !attemptId) return;
        setStatusMap(prev => ({ ...prev, [currentQuestion.id]: 'running' }));
        setShowResults(true);

        try {
            const res = await axiosInstance.post(API.MCQ.RUN_CODE(testId), {
                questionId: currentQuestion.id,
                language: currentLanguage,
                code: currentCode
            });

            if (res.data.success) {
                setResultsMap(prev => ({ ...prev, [currentQuestion.id]: res.data.data }));
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to run code');
        } finally {
            setStatusMap(prev => ({ ...prev, [currentQuestion.id]: 'idle' }));
        }
    };

    const handleSubmitCode = async () => {
        if (!currentQuestion || !attemptId) return;
        setStatusMap(prev => ({ ...prev, [currentQuestion.id]: 'submitting' }));
        setShowResults(true);

        try {
            const res = await axiosInstance.post(API.MCQ.SUBMIT_CODE(testId), {
                questionId: currentQuestion.id,
                language: currentLanguage,
                code: currentCode,
                attemptId
            });

            if (res.data.success) {
                const data = res.data.data;
                setResultsMap(prev => ({ ...prev, [currentQuestion.id]: data }));
                setScoreMap(prev => ({
                    ...prev,
                    [currentQuestion.id]: {
                        score: data.score,
                        maxScore: data.maxScore || currentQuestion.maxScore,
                        hiddenPassed: data.hiddenPassed,
                        hiddenTotal: data.hiddenTotal
                    }
                }));
                setStatusMap(prev => ({ ...prev, [currentQuestion.id]: 'submitted' }));

                if (data.publicAllPassed) {
                    toast.success(data.message || 'Code submitted successfully!');
                } else {
                    toast.error('Public test cases failed. Fix your code first.');
                    setStatusMap(prev => ({ ...prev, [currentQuestion.id]: 'idle' }));
                }
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Submission failed');
            setStatusMap(prev => ({ ...prev, [currentQuestion.id]: 'idle' }));
        }
    };

    const totalScore = Object.values(scoreMap).reduce((sum, s) => sum + (s?.score || 0), 0);
    const totalMaxScore = (testData?.dsaQuestions || []).reduce((sum, q) => sum + (q.maxScore || 100), 0);

    // ─── Loading State ───
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--bg-body))]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-[rgb(var(--text-secondary))] text-lg font-medium">Loading DSA Test...</p>
                </div>
            </div>
        );
    }

    if (isTestComplete) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--bg-body))] p-6">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-2xl bg-[rgb(var(--bg-card))] border border-[rgb(var(--border-subtle))] rounded-2xl shadow-2xl p-8 space-y-6"
                >
                    <div className="text-center space-y-2">
                        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto text-emerald-500 mb-2">
                            <CheckCircle className="w-10 h-10" />
                        </div>
                        <h2 className="text-2xl font-bold text-[rgb(var(--text-primary))]">Test Completed!</h2>
                        <p className="text-sm text-[rgb(var(--text-secondary))]">Your DSA coding test results have been saved to your history.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 bg-[rgb(var(--bg-body))]/50 rounded-xl p-4 border border-[rgb(var(--border-subtle))]">
                        <div className="text-center p-3 border-r border-[rgb(var(--border-subtle))]">
                            <span className="text-xs text-[rgb(var(--text-muted))] block uppercase tracking-wider font-semibold">Total Score</span>
                            <span className="text-3xl font-extrabold text-cyan-500">{totalScore} / {totalMaxScore}</span>
                        </div>
                        <div className="text-center p-3">
                            <span className="text-xs text-[rgb(var(--text-muted))] block uppercase tracking-wider font-semibold">Time Spent</span>
                            <span className="text-2xl font-extrabold text-[rgb(var(--text-primary))] font-mono">
                                {formatTime(finalTimeSpent)}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-sm font-bold text-[rgb(var(--text-muted))] uppercase tracking-wider">Question Summary</h3>
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                            {testData.dsaQuestions.map((q, idx) => {
                                const qScore = scoreMap[q.id];
                                return (
                                    <div key={q.id} className="flex items-center justify-between p-3.5 bg-[rgb(var(--bg-elevated))]/40 border border-[rgb(var(--border-subtle))] rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <span className="w-6 h-6 rounded-lg bg-[rgb(var(--bg-body))] border border-[rgb(var(--border-subtle))] flex items-center justify-center font-bold text-xs text-[rgb(var(--text-secondary))]">
                                                {idx + 1}
                                            </span>
                                            <div>
                                                <h4 className="text-sm font-bold text-[rgb(var(--text-primary))]">{q.title}</h4>
                                                <span className="text-xs text-[rgb(var(--text-muted))]">
                                                    Cases: {qScore ? `${qScore.hiddenPassed}/${qScore.hiddenTotal}` : `0/${q.hiddenTestCaseCount || 0}`} passed
                                                </span>
                                            </div>
                                        </div>
                                        <span className="text-sm font-extrabold text-cyan-500">
                                            {qScore ? `${qScore.score}/${qScore.maxScore}` : `0/${q.maxScore || 100}`} pts
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex justify-center pt-4 border-t border-[rgb(var(--border-subtle))]">
                        <Button 
                            onClick={() => navigate('/mcq-test/practice')}
                            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-cyan-500/20"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Practice Library
                        </Button>
                    </div>
                </motion.div>
            </div>
        );
    }

    if (!testData || !testData.dsaQuestions || testData.dsaQuestions.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--bg-body))]">
                <div className="text-center">
                    <Code className="w-16 h-16 text-[rgb(var(--text-muted))] mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-[rgb(var(--text-primary))] mb-2">No DSA Questions Found</h2>
                    <p className="text-[rgb(var(--text-secondary))] mb-6">This test doesn't have any DSA coding questions.</p>
                    <Button onClick={() => navigate('/mcq-test/practice')} className="bg-[rgb(var(--accent))] text-white">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Practice Tests
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-[rgb(var(--bg-body))] overflow-hidden">
            {/* ═══ Top Bar ═══ */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-[rgb(var(--bg-card))]/90 backdrop-blur-xl border-b border-[rgb(var(--border-subtle))] shrink-0">
                <div className="flex items-center gap-3">
                    {!isEmbedded && (
                        <button
                            onClick={() => navigate('/mcq-test/practice')}
                            className="p-2 hover:bg-[rgb(var(--bg-elevated))] rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-[rgb(var(--text-secondary))]" />
                        </button>
                    )}
                    <div>
                        <h1 className="text-sm font-bold text-[rgb(var(--text-primary))] leading-tight">{testData.title}</h1>
                        <p className="text-xs text-[rgb(var(--text-muted))]">
                            Problem {currentQuestionIndex + 1} of {testData.dsaQuestions.length}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Score */}
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-[rgb(var(--bg-elevated))] rounded-lg border border-[rgb(var(--border-subtle))]">
                        <Award className="w-4 h-4 text-amber-500" />
                        <span className="text-sm font-bold text-[rgb(var(--text-primary))]">
                            {totalScore}/{totalMaxScore}
                        </span>
                    </div>

                    {/* Timer */}
                    {!isEmbedded && (
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono text-sm font-bold
                            ${timeLeft < 300
                                ? 'bg-red-500/10 border-red-500/30 text-red-500 animate-pulse'
                                : timeLeft < 600
                                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-500'
                                    : 'bg-[rgb(var(--bg-elevated))] border-[rgb(var(--border-subtle))] text-[rgb(var(--text-primary))]'
                            }`}>
                            <Timer className="w-4 h-4" />
                            {formatTime(timeLeft)}
                        </div>
                    )}

                    {isEmbedded ? (
                        <Button
                            onClick={propOnComplete}
                            className="bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-600 hover:to-indigo-700 text-white font-bold px-5 rounded-xl shadow shadow-cyan-500/20"
                            size="sm"
                        >
                            {isLastModule ? 'Submit Test' : 'Submit Module'}
                        </Button>
                    ) : (
                        <Button
                            onClick={() => submitTestResult()}
                            className="bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-600 hover:to-indigo-700 text-white font-bold px-5 rounded-xl shadow shadow-cyan-500/20"
                            size="sm"
                        >
                            Submit Test
                        </Button>
                    )}
                </div>
            </div>

            {/* ═══ Main Content ═══ */}
            <div className="flex-1 flex overflow-hidden">
                {/* ─── Question Navigator (Left Sidebar) ─── */}
                <div className="w-14 bg-[rgb(var(--bg-card))]/60 border-r border-[rgb(var(--border-subtle))] flex flex-col items-center py-3 gap-2 overflow-y-auto shrink-0">
                    {testData.dsaQuestions.map((q, idx) => {
                        const qScore = scoreMap[q.id];
                        const qStatus = statusMap[q.id] || 'idle';
                        return (
                            <button
                                key={q.id}
                                onClick={() => setCurrentQuestionIndex(idx)}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold transition-all relative
                                    ${idx === currentQuestionIndex
                                        ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30 scale-110'
                                        : qStatus === 'submitted'
                                            ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                                            : 'bg-[rgb(var(--bg-elevated))] text-[rgb(var(--text-secondary))] border border-[rgb(var(--border-subtle))] hover:border-cyan-500/40'
                                    }`}
                                title={`Problem ${idx + 1}: ${q.title}`}
                            >
                                {idx + 1}
                                {qScore && (
                                    <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[rgb(var(--bg-card))]" />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* ─── Problem Panel (Left) ─── */}
                <div className="w-[42%] min-w-[340px] flex flex-col border-r border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))]/30">
                    {/* Tabs */}
                    <div className="flex border-b border-[rgb(var(--border-subtle))] shrink-0">
                        {[
                            { id: 'description', label: 'Description', icon: FileText },
                            { id: 'testcases', label: 'Test Cases', icon: Terminal }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all border-b-2
                                    ${activeTab === tab.id
                                        ? 'text-cyan-500 border-cyan-500 bg-cyan-500/5'
                                        : 'text-[rgb(var(--text-muted))] border-transparent hover:text-[rgb(var(--text-secondary))]'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-5">
                        {currentQuestion && activeTab === 'description' && (
                            <>
                                {/* Title + Difficulty */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <h2 className="text-xl font-bold text-[rgb(var(--text-primary))]">
                                            {currentQuestion.title}
                                        </h2>
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase
                                            ${currentQuestion.difficulty === 'easy' ? 'bg-emerald-500/15 text-emerald-500' :
                                                currentQuestion.difficulty === 'hard' ? 'bg-red-500/15 text-red-500' :
                                                    'bg-amber-500/15 text-amber-500'}`}>
                                            {currentQuestion.difficulty}
                                        </span>
                                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-500">
                                            {currentQuestion.maxScore || 100} pts
                                        </span>
                                    </div>
                                    {currentScore && (
                                        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                                            <span className="text-sm font-semibold text-emerald-500">
                                                Score: {currentScore.score}/{currentScore.maxScore} ({currentScore.hiddenPassed}/{currentScore.hiddenTotal} hidden cases passed)
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Description */}
                                <div className="prose prose-sm prose-invert max-w-none text-[rgb(var(--text-secondary))] leading-relaxed">
                                    <ReactMarkdown
                                        components={{
                                            code({ node, inline, className, children, ...props }) {
                                                const match = /language-(\w+)/.exec(className || '');
                                                if (!inline && match) {
                                                    return (
                                                        <SyntaxHighlighter style={oneDark} language={match[1]} PreTag="div" className="rounded-xl !bg-[rgb(var(--bg-elevated))] !text-sm my-4">
                                                            {String(children).replace(/\n$/, '')}
                                                        </SyntaxHighlighter>
                                                    );
                                                } else if (!inline) {
                                                    return (
                                                        <div className="bg-[rgb(var(--bg-elevated))]/50 p-4 rounded-xl text-sm font-mono overflow-x-auto text-[rgb(var(--text-primary))] border border-[rgb(var(--border-subtle))] my-4 leading-relaxed whitespace-pre">
                                                            <code {...props}>{children}</code>
                                                        </div>
                                                    );
                                                } else {
                                                    return (
                                                        <code className="bg-[rgb(var(--bg-elevated))] px-1.5 py-0.5 rounded text-cyan-400 text-sm border border-[rgb(var(--border-subtle))]" {...props}>
                                                            {children}
                                                        </code>
                                                    );
                                                }
                                            }
                                        }}
                                    >
                                        {currentQuestion.description}
                                    </ReactMarkdown>
                                </div>

                                {/* Constraints */}
                                {currentQuestion.constraints && (
                                    <div className="p-4 bg-[rgb(var(--bg-elevated))]/50 rounded-xl border border-[rgb(var(--border-subtle))]">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-amber-500 mb-2 flex items-center gap-1.5">
                                            <AlertTriangle className="w-3.5 h-3.5" />
                                            Constraints
                                        </h4>
                                        <pre className="text-sm text-[rgb(var(--text-secondary))] whitespace-pre-wrap font-mono">
                                            {currentQuestion.constraints}
                                        </pre>
                                    </div>
                                )}

                                {/* Public Test Cases with Explanation */}
                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-[rgb(var(--text-muted))]">
                                        Examples
                                    </h4>
                                    {currentQuestion.publicTestCases?.map((tc, idx) => (
                                        <div key={idx} className="p-4 bg-[rgb(var(--bg-elevated))]/50 rounded-xl border border-[rgb(var(--border-subtle))] space-y-3">
                                            <div className="text-xs font-bold text-[rgb(var(--text-muted))] uppercase">Example {idx + 1}</div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <span className="text-xs font-semibold text-cyan-500">Input:</span>
                                                    <pre className="mt-1 text-sm bg-[rgb(var(--bg-body))] rounded-lg px-3 py-2 text-[rgb(var(--text-primary))] font-mono overflow-x-auto">{tc.input}</pre>
                                                </div>
                                                <div>
                                                    <span className="text-xs font-semibold text-emerald-500">Output:</span>
                                                    <pre className="mt-1 text-sm bg-[rgb(var(--bg-body))] rounded-lg px-3 py-2 text-[rgb(var(--text-primary))] font-mono overflow-x-auto">{tc.expectedOutput}</pre>
                                                </div>
                                            </div>
                                            {tc.explanation && (
                                                <div className="text-sm text-[rgb(var(--text-secondary))] bg-[rgb(var(--bg-body))]/50 rounded-lg px-3 py-2 border-l-2 border-cyan-500/40">
                                                    <span className="font-semibold text-cyan-500">Explanation: </span>
                                                    {tc.explanation}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Hidden test case info */}
                                <div className="flex items-center gap-2 p-3 bg-[rgb(var(--bg-elevated))]/30 rounded-xl border border-[rgb(var(--border-subtle))]">
                                    <Lock className="w-4 h-4 text-[rgb(var(--text-muted))]" />
                                    <span className="text-xs text-[rgb(var(--text-muted))]">
                                        {currentQuestion.hiddenTestCaseCount || 0} hidden test case(s) will be evaluated on submission
                                    </span>
                                </div>
                            </>
                        )}

                        {currentQuestion && activeTab === 'testcases' && (
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-[rgb(var(--text-primary))]">Public Test Cases</h3>
                                {currentQuestion.publicTestCases?.map((tc, idx) => (
                                    <div key={idx} className="bg-[rgb(var(--bg-elevated))]/50 rounded-xl border border-[rgb(var(--border-subtle))] overflow-hidden">
                                        <div className="px-4 py-2 bg-[rgb(var(--bg-elevated))] border-b border-[rgb(var(--border-subtle))] flex items-center justify-between">
                                            <span className="text-xs font-bold text-[rgb(var(--text-muted))] uppercase">Case {idx + 1}</span>
                                            {currentResults?.results?.[idx] && (
                                                currentResults.results[idx].passed
                                                    ? <CheckCircle className="w-4 h-4 text-emerald-500" />
                                                    : <XCircle className="w-4 h-4 text-red-500" />
                                            )}
                                        </div>
                                        <div className="p-4 space-y-3">
                                            <div>
                                                <span className="text-xs font-semibold text-[rgb(var(--text-muted))]">Input</span>
                                                <pre className="mt-1 text-sm bg-[rgb(var(--bg-body))] rounded-lg px-3 py-2 text-[rgb(var(--text-primary))] font-mono">{tc.input}</pre>
                                            </div>
                                            <div>
                                                <span className="text-xs font-semibold text-[rgb(var(--text-muted))]">Expected Output</span>
                                                <pre className="mt-1 text-sm bg-[rgb(var(--bg-body))] rounded-lg px-3 py-2 text-[rgb(var(--text-primary))] font-mono">{tc.expectedOutput}</pre>
                                            </div>
                                            {currentResults?.results?.[idx] && (
                                                <div>
                                                    <span className="text-xs font-semibold text-[rgb(var(--text-muted))]">Your Output</span>
                                                    <pre className={`mt-1 text-sm rounded-lg px-3 py-2 font-mono ${currentResults.results[idx].passed
                                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                                        }`}>
                                                        {currentResults.results[idx].error || currentResults.results[idx].actualOutput || '(no output)'}
                                                    </pre>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {/* Hidden test result summary */}
                                {currentResults?.hiddenPassed !== undefined && currentResults?.publicAllPassed && (
                                    <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-500/10 to-violet-500/10 border border-cyan-500/20">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Lock className="w-4 h-4 text-cyan-500" />
                                            <span className="text-sm font-bold text-[rgb(var(--text-primary))]">Hidden Test Cases</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-3xl font-black text-cyan-500">
                                                {currentResults.hiddenPassed}/{currentResults.hiddenTotal}
                                            </div>
                                            <div className="text-sm text-[rgb(var(--text-secondary))]">
                                                hidden test cases passed
                                                <br />
                                                <span className="font-bold text-[rgb(var(--text-primary))]">
                                                    Score: {currentResults.score}/{currentResults.maxScore || currentQuestion?.maxScore}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* ─── Code Editor Panel (Right) ─── */}
                <div className="flex-1 flex flex-col min-w-0">
                    {/* Editor Header */}
                    <div className="flex items-center justify-between px-4 py-2 bg-[rgb(var(--bg-card))]/60 border-b border-[rgb(var(--border-subtle))] shrink-0">
                        <div className="flex items-center gap-2">
                            <Code className="w-4 h-4 text-cyan-500" />
                            <span className="text-xs font-bold text-[rgb(var(--text-muted))] uppercase tracking-wider">Code Editor</span>
                        </div>

                        {/* Language Selector */}
                        <div className="relative group">
                            {(() => {
                                const activeLang = LANGUAGES.find(l => l.id === currentLanguage);
                                return (
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border-subtle))] rounded-lg text-sm font-medium text-[rgb(var(--text-primary))] group-hover:border-cyan-500/50 transition-colors cursor-pointer min-w-[140px]">
                                        {activeLang?.icon}
                                        <span className="flex-1">{activeLang?.name}</span>
                                        <ChevronDown className="w-4 h-4 text-[rgb(var(--text-muted))] group-hover:text-cyan-500 transition-colors" />
                                    </div>
                                );
                            })()}
                            <select
                                value={currentLanguage}
                                onChange={(e) => handleLanguageChange(e.target.value)}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            >
                                {LANGUAGES.filter(l => currentQuestion?.allowedLanguages?.includes(l.id)).map(lang => (
                                    <option key={lang.id} value={lang.id}>
                                        {lang.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Monaco Editor */}
                    <div className="flex-1 min-h-0">
                        <Editor
                            height="100%"
                            language={LANGUAGES.find(l => l.id === currentLanguage)?.monacoId || 'python'}
                            value={currentCode}
                            onChange={handleCodeChange}
                            theme="vs-dark"
                            onMount={(editor) => { editorRef.current = editor; }}
                            options={{
                                fontSize: 14,
                                fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
                                minimap: { enabled: false },
                                scrollBeyondLastLine: false,
                                padding: { top: 16, bottom: 16 },
                                lineNumbers: 'on',
                                lineNumbersMinChars: 3,
                                renderLineHighlight: 'line',
                                cursorBlinking: 'smooth',
                                cursorSmoothCaretAnimation: 'on',
                                smoothScrolling: true,
                                wordWrap: 'on',
                                automaticLayout: true,
                                tabSize: 4,
                                bracketPairColorization: { enabled: true },
                                guides: { bracketPairs: true }
                            }}
                        />
                    </div>

                    {/* ─── Bottom Action Bar ─── */}
                    <div className="px-4 py-3 bg-[rgb(var(--bg-card))]/80 backdrop-blur-md border-t border-[rgb(var(--border-subtle))] flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-2">
                            {/* Navigation */}
                            <Button
                                onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                                disabled={currentQuestionIndex === 0}
                                variant="outline"
                                size="sm"
                                className="border-[rgb(var(--border-subtle))] text-[rgb(var(--text-secondary))] disabled:opacity-30"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <Button
                                onClick={() => setCurrentQuestionIndex(prev => Math.min((testData?.dsaQuestions?.length || 1) - 1, prev + 1))}
                                disabled={currentQuestionIndex >= (testData?.dsaQuestions?.length || 1) - 1}
                                variant="outline"
                                size="sm"
                                className="border-[rgb(var(--border-subtle))] text-[rgb(var(--text-secondary))] disabled:opacity-30"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Run Button */}
                            <Button
                                onClick={handleRunCode}
                                disabled={currentStatus === 'running' || currentStatus === 'submitting' || !currentCode.trim()}
                                className="bg-[rgb(var(--bg-elevated))] hover:bg-[rgb(var(--bg-elevated))]/80 text-[rgb(var(--text-primary))] border border-[rgb(var(--border-subtle))] hover:border-cyan-500/40 transition-all px-5"
                            >
                                {currentStatus === 'running' ? (
                                    <><span className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mr-2" /> Running...</>
                                ) : (
                                    <><Play className="w-4 h-4 mr-2 text-cyan-500" /> Run Code</>
                                )}
                            </Button>

                            {/* Submit Button */}
                            <Button
                                onClick={handleSubmitCode}
                                disabled={currentStatus === 'running' || currentStatus === 'submitting' || currentStatus === 'submitted' || !currentCode.trim()}
                                className={`px-5 font-bold transition-all ${currentStatus === 'submitted'
                                    ? 'bg-emerald-600 text-white cursor-not-allowed'
                                    : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/20'
                                    }`}
                            >
                                {currentStatus === 'submitting' ? (
                                    <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" /> Evaluating...</>
                                ) : currentStatus === 'submitted' ? (
                                    <><CheckCircle className="w-4 h-4 mr-2" /> Submitted</>
                                ) : (
                                    <><Send className="w-4 h-4 mr-2" /> Submit</>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DSATestPage;

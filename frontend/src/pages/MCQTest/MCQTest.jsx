import React, { useState, useEffect, useContext, useCallback, useRef,useMemo  } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { UserContext } from '../../context/UserContext';
import { useTestMode } from '../../context/TestModeContext';
import { API } from '../../utils/apiPaths';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Clock, CheckCircle, XCircle, Award, Mail, Brain, Timer, BookOpen, Settings, ChevronLeft, ChevronRight, ChevronDown, Code, Copy, History, AlertTriangle, Lock } from 'lucide-react';
import { ButtonLoader } from '../../components/ui/Loader';

import BranchModal from '../../components/BranchModal';
import { BRANCHES } from '../../utils/constants';
import DSATestPage from './DSATestPage';

const getLanguageFromTopic = (topic) => {
    if (!topic) return 'javascript';
    const lowerTopic = topic.toLowerCase();

    const languageMap = {
        'python': 'python',
        'java': 'java',
        'c++': 'cpp',
        'cpp': 'cpp',
        'c#': 'csharp',
        'csharp': 'csharp',
        'javascript': 'javascript',
        'js': 'javascript',
        'react': 'javascript', // React usually uses JSX/JS
        'node': 'javascript',
        'node.js': 'javascript',
        'typescript': 'typescript',
        'ts': 'typescript',
        'html': 'html',
        'css': 'css',
        'sql': 'sql',
        'database': 'sql',
        'go': 'go',
        'golang': 'go',
        'rust': 'rust',
        'swift': 'swift',
        'kotlin': 'kotlin',
        'ruby': 'ruby',
        'php': 'php',
        'shell': 'bash',
        'bash': 'bash'
    };

    // Check for exact matches or if the topic contains the key
    for (const [key, value] of Object.entries(languageMap)) {
        if (lowerTopic.includes(key)) {
            return value;
        }
    }

    return 'javascript'; // Default
};

const getTopicPlaceholder = (branchId) => {
    switch (branchId) {
        case 'electronics':
            return 'e.g., VLSI Design, Signal Processing, Microcontrollers...';
        case 'electrical':
            return 'e.g., Power Systems, Control Theory, Electric Machines...';
        case 'mechanical':
            return 'e.g., Thermodynamics, Fluid Mechanics, Machine Design...';
        case 'civil':
            return 'e.g., Structural Analysis, Soil Mechanics, Fluid Dynamics...';
        case 'chemical':
            return 'e.g., Process Engineering, Mass Transfer, Chemical Kinetics...';
        case 'computer':
        default:
            return 'e.g., React Hooks, System Design, Data Structures...';
    }
};

const MCQTest = () => {
    const { user } = useContext(UserContext);
    const { setIsTestActive } = useTestMode();
    const navigate = useNavigate();
    const location = useLocation();
    const { testId } = useParams(); // Get testId for practice mode
    const isSubmitting = useRef(false); // Synchronous lock to prevent double submissions
    
    // Branch Selection State
    const [selectedBranch, setSelectedBranch] = useState(
        localStorage.getItem('dashboard_branch') || 'Computer Engineering'
    );
    const [showBranchModal, setShowBranchModal] = useState(!localStorage.getItem('dashboard_branch'));

    useEffect(() => {
        if (selectedBranch) {
            localStorage.setItem('dashboard_branch', selectedBranch);
        }
    }, [selectedBranch]);

    const currentBranchInfo = BRANCHES.find(b => b.id === selectedBranch) || BRANCHES[0];

    const [currentStep, setCurrentStep] = useState('setup'); // setup, test, results
    const [formData, setFormData] = useState({
        topic: '',
        experience: 'beginner',
        specialization: '',
        numberOfQuestions: 30,
        securityEnabled: true
    });
    const [questions, setQuestions] = useState([]);
    const [questionsWithAnswers, setQuestionsWithAnswers] = useState([]); // Store questions with correct answers for evaluation
    const [answers, setAnswers] = useState({}); // Only saved answers after clicking Save & Next
    const [tempAnswer, setTempAnswer] = useState(null); // Temporary selection for current question
    const [markedForReview, setMarkedForReview] = useState({});
    const [visitedQuestions, setVisitedQuestions] = useState({});
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
    const [moduleTimes, setModuleTimes] = useState({});
    const timeLeft = moduleTimes[currentModuleIndex] || 0;
    const setTimeLeft = useCallback((val) => {
        setModuleTimes(prev => ({
            ...prev,
            [currentModuleIndex]: typeof val === 'function' ? val(prev[currentModuleIndex] || 0) : val
        }));
    }, [currentModuleIndex]);
    const [moduleTimeSpent, setModuleTimeSpent] = useState({});
    const [dsaQuestions, setDsaQuestions] = useState([]);
    const [rawTestData, setRawTestData] = useState(null);

    const getSpecializationSuggestions = (branchId) => {
        switch (branchId) {
            case 'electrical':
                return ['Power Systems', 'Control Systems', 'Machines', 'Power Electronics'];
            case 'mechanical':
                return ['Thermodynamics', 'Fluid Mechanics', 'Automobile', 'Manufacturing'];
            case 'civil':
                return ['Structural', 'Transportation', 'Geotechnical', 'Construction'];
            case 'electronics':
                return ['VLSI Design', 'Embedded Systems', 'Signal Processing', 'Communication Systems'];
            case 'chemical':
                return ['Process Engineering', 'Thermodynamics', 'Transport Phenomena', 'Reaction Engineering'];
            case 'computer':
            default:
                return ['Frontend Development', 'Backend Development', 'Machine Learning', 'Data Science', 'Cybersecurity'];
        }
    };

    const getSpecializationPlaceholder = (branchId) => {
        switch (branchId) {
            case 'electrical': return "e.g., Power Systems, Control Systems...";
            case 'mechanical': return "e.g., Thermodynamics, Automobile...";
            case 'civil': return "e.g., Structural Analysis, Geotechnical...";
            case 'electronics': return "e.g., VLSI, Embedded Systems...";
            case 'chemical': return "e.g., Process Engineering, Reactor Design...";
            case 'computer':
            default: return "e.g., Frontend Development, Machine Learning...";
        }
    };
    const [testStartTime, setTestStartTime] = useState(null);
    const [testEndTime, setTestEndTime] = useState(null);
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showDetailedResults, setShowDetailedResults] = useState(false);
    const [showSubmitConfirmation, setShowSubmitConfirmation] = useState(false);
    // Strict practice rules
    const [rules] = useState([
        'No back navigation once test begins',
        'One attempt per generated test',
        'Answers auto-submit at time end',
        'You can change answers before submitting',
        'Saved and marked for review questions are evaluated',
        'Results include score, accuracy and time spent'
    ]);
    const [hasAttempted, setHasAttempted] = useState(false);
    const [attemptId, setAttemptId] = useState(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [fullscreenWarnings, setFullscreenWarnings] = useState(0);
    const [tabSwitchWarnings, setTabSwitchWarnings] = useState(0);
    const [notificationWarnings, setNotificationWarnings] = useState(0);
    const autoStartedRef = useRef(false);

    useEffect(() => {
        if (!user?.email || !location.state?.autoGenerateMCQ || autoStartedRef.current) return;

        const startAutoTest = async () => {
            autoStartedRef.current = true;
            
            const topic = location.state.topic;
            const numQuestions = location.state.numberOfQuestions || 10;
            
            setFormData(prev => ({
                ...prev,
                topic,
                numberOfQuestions: numQuestions
            }));

            setLoading(true);
            try {
                const response = await axiosInstance.post(API.MCQ.GENERATE, {
                    topic,
                    experience: 'intermediate',
                    specialization: '',
                    numberOfQuestions: numQuestions,
                    userEmail: user.email,
                    email: user.email,
                    branch: selectedBranch
                });

                if (response.data.success) {
                    const rawQuestions = response.data.questions || response.data.data?.questions;
                    const transformedQuestions = rawQuestions.map(q => {
                        if (q.options && typeof q.options === 'object' && !Array.isArray(q.options)) {
                            return {
                                ...q,
                                options: [q.options.A, q.options.B, q.options.C, q.options.D],
                                correctAnswer: q.correctAnswer
                            };
                        }
                        return q;
                    });

                    setQuestions(transformedQuestions);
                    if (response.data.questionsWithAnswers || response.data.data?.questionsWithAnswers) {
                        setQuestionsWithAnswers(response.data.questionsWithAnswers || response.data.data.questionsWithAnswers);
                    }
                    setCurrentStep('test');
                    setModuleTimes({ 0: numQuestions * 120 });
                    setTestStartTime(new Date());
                    setHasAttempted(true);
                    toast.success(`Test started! You have ${Math.ceil(numQuestions * 2)} minutes to complete.`);
                }
            } catch (error) {
                console.error('Error generating test:', error);
                toast.error(error.response?.data?.message || 'Failed to generate test');
                setCurrentStep('setup');
            } finally {
                setLoading(false);
                // Clean up state to prevent re-triggering on refresh
                window.history.replaceState({}, document.title);
            }
        };

        startAutoTest();
    }, [location.state, user?.email, selectedBranch]);
    const availableTopics = useMemo(() => {
        switch (selectedBranch) {
            case 'electronics':
                return ['VLSI Design', 'Digital Electronics', 'Signal Processing', 'Microprocessors', 'Embedded Systems', 'Communication Systems'];
            case 'electrical':
                return ['Power Systems', 'Control Systems', 'Electric Machines', 'Circuit Theory', 'Power Electronics', 'Electromagnetics'];
            case 'mechanical':
                return ['Thermodynamics', 'Fluid Mechanics', 'Machine Design', 'Heat Transfer', 'Manufacturing', 'Solid Mechanics'];
            case 'civil':
                return ['Structural Analysis', 'Soil Mechanics', 'Fluid Dynamics', 'Transportation Engineering', 'Environmental Engineering'];
            case 'chemical':
                return ['Process Engineering', 'Mass Transfer', 'Chemical Kinetics', 'Thermodynamics', 'Transport Phenomena'];
            case 'computer':
            default:
                return [
                    'JavaScript', 'React', 'Node.js', 'Python', 'Java', 'C++', 'Database',
                    'System Design', 'Data Structures', 'Algorithms', 'Machine Learning',
                    'DevOps', 'Cloud Computing', 'Cybersecurity'
                ];
        }
    }, [selectedBranch]);

    // --- Persistence Logic ---
    const getPersistenceKey = useCallback(() => {
        if (!user?.email) return null;
        return `practice_test_resilience_${testId || 'ai'}_${user.email}`;
    }, [testId, user?.email]);

    const saveProgress = useCallback(() => {
        const key = getPersistenceKey();
        if (!key || currentStep !== 'test' || questions.length === 0) return;

        const stateToSave = {
            questions,
            questionsWithAnswers,
            answers,
            tempAnswer,
            markedForReview,
            visitedQuestions,
            currentQuestion,
            currentModuleIndex,
            moduleTimes,
            moduleTimeSpent,
            timeLeft,
            testStartTime: testStartTime?.toISOString(),
            formData,
            attemptId,
            lastUpdated: new Date().toISOString()
        };
        localStorage.setItem(key, JSON.stringify(stateToSave));
    }, [getPersistenceKey, currentStep, questions, questionsWithAnswers, answers, tempAnswer, markedForReview, visitedQuestions, currentQuestion, currentModuleIndex, moduleTimes, moduleTimeSpent, timeLeft, testStartTime, formData, attemptId]);

    const clearProgress = useCallback(() => {
        const key = getPersistenceKey();
        if (key) localStorage.removeItem(key);
    }, [getPersistenceKey]);

    // Auto-save effect — debounced to avoid blocking UI on every selection
    useEffect(() => {
        if (currentStep === 'test') {
            const timeout = setTimeout(() => saveProgress(), 500);
            return () => clearTimeout(timeout);
        }
    }, [saveProgress, currentStep, answers, tempAnswer, currentQuestion, timeLeft, markedForReview]);

    // --- Unified Initialization & Resilience Logic ---
    useEffect(() => {
        if (!user?.email) return;

        const initializeTest = async () => {
            const key = getPersistenceKey();
            const saved = key ? localStorage.getItem(key) : null;

            // 1. Priority: Try to resume existing session
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    if (parsed.questions && parsed.questions.length > 0) {
                        const lastUpdated = new Date(parsed.lastUpdated);
                        const now = new Date();
                        const hoursSinceUpdate = (now - lastUpdated) / (1000 * 60 * 60);

                        if (hoursSinceUpdate < 4) {
                            const startTime = parsed.testStartTime ? new Date(parsed.testStartTime) : null;
                            const questionsCount = parsed.questions.length;
                            const manualTimeLimit = parsed.formData.timeLimit;
                            const totalAllowedSeconds = (manualTimeLimit || (questionsCount * 2)) * 60;
                            
                            let remaining = parsed.timeLeft;
                            if (startTime) {
                                const elapsed = Math.floor((now - startTime) / 1000);
                                remaining = Math.max(0, totalAllowedSeconds - elapsed);
                            }

                            setQuestions(parsed.questions);
                            setQuestionsWithAnswers(parsed.questionsWithAnswers || []);
                            setAnswers(parsed.answers || {});
                            setTempAnswer(parsed.tempAnswer);
                            setMarkedForReview(parsed.markedForReview || {});
                            setVisitedQuestions(parsed.visitedQuestions || {});
                            setCurrentQuestion(parsed.currentQuestion || 0);
                            
                            // Restore modular state
                            setCurrentModuleIndex(parsed.currentModuleIndex || 0);
                            if (parsed.moduleTimes && Object.keys(parsed.moduleTimes).length > 0) {
                                // Apply elapsed time proportionally or just subtract from the current module
                                const currentModule = parsed.currentModuleIndex || 0;
                                const savedModuleTimes = { ...parsed.moduleTimes };
                                
                                if (startTime) {
                                    const elapsed = Math.floor((now - startTime) / 1000);
                                    // A simple approach: subtract elapsed from total allowed seconds, and sync `timeLeft`
                                    // But it's better to just trust the stored timer or update it if time elapsed.
                                    // We will just restore it as is and let `timeLeft` logic handle overall time if needed.
                                    savedModuleTimes[currentModule] = remaining; // override active module with elapsed diff
                                }
                                setModuleTimes(savedModuleTimes);
                            } else {
                                setTimeLeft(remaining);
                            }
                            setModuleTimeSpent(parsed.moduleTimeSpent || {});
                            
                            setTestStartTime(startTime);
                            setFormData(parsed.formData);
                            setAttemptId(parsed.attemptId);
                            setHasAttempted(true);
                            setCurrentStep('test');

                            if (remaining === 0) {
                                toast.error('Your test session has timed out.');
                                // The timer useEffect will trigger handleSubmitTest on next tick
                            } else {
                                toast.success('Resuming your active session...', {
                                    icon: '🔄',
                                    duration: 3000
                                });
                            }
                            return; // Stop here, session resumed successfully
                        }
                    }
                } catch (e) {
                    console.error('Failed to parse saved progress:', e);
                    localStorage.removeItem(key);
                }
            }

            // 2. If no resume, handle practice test loading
            if (testId) {
                setLoading(true);
                try {
                    const res = await axiosInstance.get(API.MCQ.PRACTICE_DETAILS(testId), {
                        headers: { 'user-email': user.email }
                    });
                    const data = res.data.data;

                    if (data) {
                        // Check attempts only if we're starting fresh
                        if (data.maxAttempts && data.userAttempts >= data.maxAttempts) {
                            toast.error(`Attempt limit reached (${data.maxAttempts}). Please contact support if you believe this is an error.`);
                            navigate('/mcq-test/practice');
                            return;
                        }

                        const transformedQuestions = data.questions.map(q => ({
                            ...q,
                            options: Array.isArray(q.options) ? q.options : Object.values(q.options)
                        }));

                        setQuestions(transformedQuestions);
                        setDsaQuestions(data.dsaQuestions || []);
                        setRawTestData(data);

                        // Initialize module times
                        const initialTimes = {};
                        (data.modules || []).forEach((m, idx) => {
                            initialTimes[idx] = (m.timeLimit || 30) * 60;
                        });
                        if ((data.modules || []).length === 0) {
                            initialTimes[0] = (data.timeLimit || 30) * 60;
                        }
                        setModuleTimes(initialTimes);

                        setFormData(prev => ({
                            ...prev,
                            topic: data.topic,
                            numberOfQuestions: data.questions.length,
                            title: data.title,
                            guidelines: data.guidelines,
                            timeLimit: data.timeLimit || 30,
                            maxAttempts: data.maxAttempts || 1,
                            isTimeRestricted: data.isTimeRestricted || false,
                            startTime: data.startTime || null,
                            endTime: data.endTime || null,
                            moduleType: data.moduleType || 'mcq',
                            securityEnabled: data.securityEnabled ?? false,
                            modules: data.modules || []
                        }));
                        setHasAttempted(true);
                        setCurrentStep('guidelines');
                    }
                } catch (error) {
                    console.error('Error loading practice test:', error);
                    toast.error('Failed to load test details');
                    navigate('/mcq-test/practice');
                } finally {
                    setLoading(false);
                }
            } else {
                // If AI test (no testId), ensure we are on setup
                setCurrentStep('setup');
            }
        };

        initializeTest();
    }, [testId, user?.email, getPersistenceKey, navigate]);

    // Submit test function - defined before useEffect hooks that reference it
    const handleSubmitTest = useCallback(async () => {
        // Prevent multiple submissions using ref (synchronous check)
        if (isSubmitting.current || loading) {
            console.log('⚠️ Submission already in progress, ignoring duplicate click');
            return;
        }

        // Set synchronous lock immediately
        isSubmitting.current = true;
        setLoading(true);

        // Show immediate feedback
        toast.loading('Submitting your test... Please wait.', {
            id: 'submit-test',
            duration: Infinity
        });

        const endTime = new Date();
        setTestEndTime(endTime);

        const questionsCount = questions.length;
        const manualTimeLimit = formData.timeLimit;
        const totalAllowedSeconds = (manualTimeLimit || (questionsCount * 2)) * 60;

        // Calculate actual time spent in seconds based on timeLeft for consistency with UI
        const actualTimeSpent = totalAllowedSeconds - timeLeft;

        // Exit fullscreen
        try {
            if (document.fullscreenElement) {
                await document.exitFullscreen();
                setIsFullscreen(false);
            }
        } catch (err) {
            console.log('Exit fullscreen failed:', err);
        }

        try {
            const submissionData = {
                topic: formData.topic,
                answers: answers,
                questions: questionsWithAnswers, // Include questions with correct answers for evaluation
                userInfo: {
                    name: user?.name || user?.email?.split('@')[0] || 'User',
                    email: user?.email
                },
                numberOfQuestions: formData.numberOfQuestions,
                experience: formData.experience,
                specialization: formData.specialization,
                timeSpent: actualTimeSpent,
                // Include security warnings
                // Include security warnings
                securityWarnings: {
                    fullscreenExits: fullscreenWarnings,
                    tabSwitches: tabSwitchWarnings
                },
                practiceTestId: testId, // Include practiceTestId if available
                saveHistory: !testId, // Do not save history for practice tests, save for AI tests
                attemptId: attemptId // Link this submission to the in-progress attempt
            };

            const response = await axiosInstance.post(API.MCQ.SUBMIT, submissionData);

            if (response.data.success) {
                // Clear saved progress on successful submission
                clearProgress();
                
                // Close the confirmation dialog on success
                setShowSubmitConfirmation(false);

                setResults({
                    ...response.data.data.results,
                    timeSpent: actualTimeSpent,
                    securityWarnings: {
                        fullscreenExits: fullscreenWarnings,
                        tabSwitches: tabSwitchWarnings
                    }
                });
                setCurrentStep('results');

                // Dismiss loading toast
                toast.dismiss('submit-test');

                // Show warning if there were security violations
                if (fullscreenWarnings > 0 || tabSwitchWarnings > 0) {
                    toast.error(`⚠️ Test completed with ${fullscreenWarnings} fullscreen exit(s) and ${tabSwitchWarnings} tab switch(es). Results may be affected.`, {
                        duration: 6000
                    });
                } else {
                    toast.success(testId ? 'Practice Data Submitted' : 'Test submitted successfully! Results sent to your email.');
                }
            }
        } catch (error) {
            console.error('Error submitting test:', error);
            toast.dismiss('submit-test');
            toast.error(error.response?.data?.message || 'Failed to submit test');
        } finally {
            setLoading(false);
            isSubmitting.current = false; // Release the lock
        }
    }, [answers, testStartTime, formData, timeLeft, user, questionsWithAnswers, fullscreenWarnings, tabSwitchWarnings, setCurrentStep, setResults, setTestEndTime, setIsFullscreen, setLoading, moduleTimeSpent, getPersistenceKey]);

    const handleModuleSubmit = useCallback(() => {
        const currentModule = formData.modules?.[currentModuleIndex];
        const manualTimeLimit = currentModule?.timeLimit || formData.timeLimit;
        const totalAllowedSeconds = (manualTimeLimit || (questions.length * 2)) * 60;
        const actualTimeSpent = totalAllowedSeconds - timeLeft;

        setModuleTimeSpent(prev => ({
            ...prev,
            [currentModuleIndex]: actualTimeSpent
        }));

        if (formData.modules && currentModuleIndex < formData.modules.length - 1) {
            const nextModuleIndex = currentModuleIndex + 1;
            setCurrentModuleIndex(nextModuleIndex);
            
            const nextModuleQuestions = questions
                .map((q, i) => ({...q, globalIndex: i}))
                .filter(q => (q.moduleIndex || 0) === nextModuleIndex);
                
            if (nextModuleQuestions.length > 0) {
                setCurrentQuestion(nextModuleQuestions[0].globalIndex);
            }
            
            toast.success(`Moving to ${formData.modules[nextModuleIndex].title}...`, { duration: 3000 });
            setShowSubmitConfirmation(false);
        } else {
            handleSubmitTest();
        }
    }, [formData, currentModuleIndex, questions, timeLeft, handleSubmitTest]);

    // Enhanced components for markdown rendering with better code support
    // Memoize ReactMarkdown components to prevent unnecessary re-renders on option selection
    const components = React.useMemo(() => ({
        code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';

            // Clean the code content - remove trailing newlines and artifacts
            const cleanCode = String(children)
                .replace(/\n$/, '') // Remove trailing newline
                .replace(/```\?/g, '') // Remove ```? artifacts
                .replace(/```$/g, '') // Remove trailing ```
                .replace(/^```\w*\n?/g, '') // Remove leading ``` with optional language
                .trim();

            if (!inline && (language || cleanCode.includes('\n') || cleanCode.length > 50)) {
                return (
                    <div className="relative group my-4 bg-[#1a1a1a] rounded-lg border border-white/10 shadow-card overflow-hidden">
                        <div className="flex items-center justify-between bg-[#0f0f0f] text-gray-300 px-3 sm:px-4 py-2.5 border-b border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                </div>
                                <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                                    {language || 'code'}
                                </span>
                            </div>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(cleanCode);
                                    toast.success('Code copied to clipboard!');
                                }}
                                className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 hover:bg-white/10 rounded text-xs transition-colors opacity-0 group-hover:opacity-100 font-medium text-gray-300"
                                title="Copy code"
                            >
                                <Copy className="w-3 h-3" />
                                Copy
                            </button>
                        </div>
                        <div className="overflow-x-auto bg-[#1a1a1a]">
                            <SyntaxHighlighter
                                style={tomorrow}
                                language={language || 'text'}
                                PreTag="div"
                                className="!mt-0 !rounded-none !bg-transparent"
                                customStyle={{
                                    margin: 0,
                                    padding: '1rem 1.5rem',
                                    fontSize: '0.875rem',
                                    lineHeight: '1.6',
                                    backgroundColor: 'transparent',
                                    borderRadius: 0
                                }}
                                {...props}
                            >
                                {cleanCode}
                            </SyntaxHighlighter>
                        </div>
                    </div>
                );
            }

            // Inline code with theme-aware styles
            return (
                <code className="bg-[rgb(var(--accent))]/10 text-[rgb(var(--accent))] px-1.5 py-0.5 rounded text-sm font-mono border border-[rgb(var(--accent))]/20 font-semibold" {...props}>
                    {cleanCode}
                </code>
            );
        },
        pre({ children }) {
            return <div className="overflow-x-auto rounded-lg">{children}</div>;
        },
        p({ children }) {
            return <p className="mb-3 last:mb-0 leading-relaxed text-[rgb(var(--text-secondary))]">{children}</p>;
        },
        ul({ children }) {
            return <ul className="list-disc list-inside mb-4 space-y-2 text-[rgb(var(--text-secondary))] pl-2">{children}</ul>;
        },
        ol({ children }) {
            return <ol className="list-decimal list-inside mb-4 space-y-2 text-[rgb(var(--text-secondary))] pl-2">{children}</ol>;
        },
        li({ children }) {
            return <li className="leading-relaxed">{children}</li>;
        },
        blockquote({ children }) {
            return (
                <blockquote className="border-l-4 border-accent pl-4 py-3 my-4 bg-accent/10 rounded-r-lg">
                    <div className="text-[rgb(var(--text-secondary))] italic">
                        {children}
                    </div>
                </blockquote>
            );
        },
        h1({ children }) {
            return <h1 className="text-xl font-bold mb-4 text-[rgb(var(--text-primary))]">{children}</h1>;
        },
        h2({ children }) {
            return <h2 className="text-lg font-semibold mb-3 text-[rgb(var(--text-primary))]">{children}</h2>;
        },
        h3({ children }) {
            return <h3 className="text-base font-medium mb-2 text-[rgb(var(--text-primary))]">{children}</h3>;
        },
        strong({ children }) {
            return <strong className="font-semibold text-[rgb(var(--text-primary))]">{children}</strong>;
        },
        em({ children }) {
            return <em className="italic text-[rgb(var(--text-secondary))]">{children}</em>;
        },
        table({ children }) {
            return (
                <div className="overflow-x-auto my-4 rounded-lg border border-[rgb(var(--border-subtle))]">
                    <table className="min-w-full bg-[rgb(var(--bg-card))]">
                        {children}
                    </table>
                </div>
            );
        },
        th({ children }) {
            return (
                <th className="border-b border-[rgb(var(--border-subtle))] px-4 py-3 bg-[rgb(var(--bg-body-alt))] font-semibold text-left text-[rgb(var(--text-primary))] text-sm">
                    {children}
                </th>
            );
        },
        td({ children }) {
            return (
                <td className="border-b border-[rgb(var(--border-subtle))] px-4 py-3 text-[rgb(var(--text-secondary))] text-sm">
                    {children}
                </td>
            );
        }
    }), []);

    // Utility function to detect if content contains code — memoized to avoid re-computation
    const containsCode = useCallback((text) => {
        if (!text) return false;
        return (
            text.includes('```') ||
            text.includes('function') ||
            text.includes('class ') ||
            text.includes('import ') ||
            text.includes('const ') ||
            text.includes('let ') ||
            text.includes('var ') ||
            text.includes('def ') ||
            text.includes('public ') ||
            text.includes('private ') ||
            text.includes('console.') ||
            text.includes('print(') ||
            text.includes('return ') ||
            /\b(for|while|if|else)\s*\(/.test(text) ||
            (text.includes('<') && text.includes('>') && text.includes('/'))
        );
    }, []);

    // Timer effect - ticks down the active module's remaining time directly
    useEffect(() => {
        if (currentStep === 'test' && !loading) {
            const timer = setInterval(() => {
                setModuleTimes(prev => {
                    const currentRemaining = prev[currentModuleIndex];
                    if (currentRemaining === undefined) return prev;
                    if (currentRemaining <= 0) {
                        clearInterval(timer);
                        console.log('⏰ Timer reached zero, auto-submitting module...');
                        handleModuleSubmit();
                        return prev;
                    }
                    return {
                        ...prev,
                        [currentModuleIndex]: currentRemaining - 1
                    };
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [currentStep, currentModuleIndex, handleModuleSubmit, loading]);

    // Fullscreen management and hide header/footer when test starts
    useEffect(() => {
        // Update test mode context to hide header/footer
        setIsTestActive(currentStep === 'test');

        if (formData.securityEnabled === false) return;

        // Listen for fullscreen changes and prevent manual exit
        const handleFullscreenChange = () => {
            const isCurrentlyFullscreen = !!document.fullscreenElement;
            setIsFullscreen(isCurrentlyFullscreen);

            // If user manually exits fullscreen during test, show warning
            if (currentStep === 'test' && !isCurrentlyFullscreen && isFullscreen) {
                setFullscreenWarnings(prev => {
                    const newCount = prev + 1;
                    const totalWarnings = newCount + tabSwitchWarnings + notificationWarnings;

                    toast.error(`⚠️ You exited fullscreen. Test may be invalid! (Warning ${totalWarnings}/3)`, {
                        duration: 5000,
                        icon: '🚨',
                    });

                    // Auto-submit if 3 warnings reached
                    if (totalWarnings >= 3) {
                        toast.error('🚨 Test auto-submitted due to 3 security violations!', {
                            duration: 6000,
                        });
                        setTimeout(() => {
                            handleSubmitTest();
                        }, 1000);
                    }

                    return newCount;
                });
            }
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            // Restore header/footer when leaving test
        };
    }, [currentStep, setIsTestActive, isFullscreen, tabSwitchWarnings, notificationWarnings, handleSubmitTest, formData.securityEnabled]);

    // Track visited questions and load saved/temp answer when changing questions
    useEffect(() => {
        if (currentStep === 'test' && questions.length > 0) {
            setVisitedQuestions(prev => ({ ...prev, [currentQuestion]: true }));

            // Load saved answer for the current question into temp state
            if (answers[currentQuestion] !== undefined) {
                setTempAnswer(answers[currentQuestion]);
            } else {
                setTempAnswer(null);
            }
        }
    }, [currentQuestion, currentStep, questions.length, answers]);

    // Prevent accidental page refresh/close during test
    useEffect(() => {
        const beforeUnload = (e) => {
            if (currentStep === 'test') {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', beforeUnload);
        return () => window.removeEventListener('beforeunload', beforeUnload);
    }, [currentStep]);

    // Strict exam mode: Disable right-click and keyboard shortcuts
    useEffect(() => {
        if (currentStep !== 'test' || formData.securityEnabled === false) return;

        // Prevent right-click context menu
        const preventContextMenu = (e) => {
            e.preventDefault();
            toast.error('Right-click is disabled during the test!', { duration: 2000 });
        };

        // Prevent keyboard shortcuts (except allowed ones)
        const preventKeyboardShortcuts = (e) => {
            // Block Windows/Meta key (prevents Start menu and Windows shortcuts)
            if (e.key === 'Meta' || e.key === 'OS') {
                e.preventDefault();
                toast.error('Windows/Command key is disabled during the test!', { duration: 2000 });
                return;
            }

            // Block Alt+Tab and other Alt combos (best effort, browser captures most)
            if (e.altKey && (e.key === 'Tab' || e.key === 'F4')) {
                e.preventDefault();
                return;
            }

            // Block common shortcuts like copy, paste, inspect, print
            if ((e.ctrlKey || e.metaKey) && 
                ['c', 'v', 'x', 'p', 's', 'i', 'u'].includes(e.key.toLowerCase())) {
                
                // Allow Ctrl+C/V only if explicitly needed, otherwise block
                if (e.key.toLowerCase() === 'c' || e.key.toLowerCase() === 'v') {
                    return; // Allow copy/paste
                }
                e.preventDefault();
                toast.error('Keyboard shortcuts are disabled during the test!', { duration: 2000 });
            }

            // Prevent F12 (Developer tools)
            if (e.key === 'F12') {
                e.preventDefault();
                toast.error('Developer tools are disabled during the test!', { duration: 2000 });
            }

            // Prevent F11 browser toggle and trigger HTML5 fullscreen instead
            if (e.key === 'F11') {
                e.preventDefault();
                try {
                    const docElm = document.documentElement;
                    if (docElm.requestFullscreen) {
                        docElm.requestFullscreen();
                    } else if (docElm.webkitRequestFullscreen) {
                        docElm.webkitRequestFullscreen();
                    } else if (docElm.mozRequestFullScreen) {
                        docElm.mozRequestFullScreen();
                    } else if (docElm.msRequestFullscreen) {
                        docElm.msRequestFullscreen();
                    }
                    toast.success('Fullscreen mode activated', { duration: 2000 });
                } catch (err) {
                    console.error('Fullscreen request failed:', err);
                }
            }
        };

        window.addEventListener('contextmenu', preventContextMenu);
        window.addEventListener('keydown', preventKeyboardShortcuts);

        return () => {
            window.removeEventListener('contextmenu', preventContextMenu);
            window.removeEventListener('keydown', preventKeyboardShortcuts);
        };
    }, [currentStep, formData.securityEnabled]);

    // Detect tab switching and show warning
    useEffect(() => {
        if (currentStep !== 'test' || formData.securityEnabled === false) return;

        const handleVisibilityChange = () => {
            if (document.hidden) {
                setTabSwitchWarnings(prev => {
                    const newCount = prev + 1;
                    const totalWarnings = newCount + fullscreenWarnings + notificationWarnings;

                    toast.error(`⚠️ Tab switch detected! This may invalidate your test. (Warning ${totalWarnings}/3)`, {
                        duration: 5000,
                        icon: '👀',
                    });

                    // Auto-submit if 3 warnings reached
                    if (totalWarnings >= 3) {
                        toast.error('🚨 Test auto-submitted due to 3 security violations!', {
                            duration: 6000,
                        });
                        setTimeout(() => {
                            handleSubmitTest();
                        }, 1000);
                    }

                    return newCount;
                });
            }
        };

        const handleBlur = () => {
            setTabSwitchWarnings(prev => {
                const newCount = prev + 1;
                const totalWarnings = newCount + fullscreenWarnings + notificationWarnings;

                toast.error(`⚠️ You switched away from the test window! (Warning ${totalWarnings}/3)`, {
                    duration: 4000,
                    icon: '⚡',
                });

                // Auto-submit if 3 warnings reached
                if (totalWarnings >= 3) {
                    toast.error('🚨 Test auto-submitted due to 3 security violations!', {
                        duration: 6000,
                    });
                    setTimeout(() => {
                        handleSubmitTest();
                    }, 1000);
                }

                return newCount;
            });
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleBlur);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleBlur);
        };
    }, [currentStep, fullscreenWarnings, tabSwitchWarnings, notificationWarnings, handleSubmitTest, formData.securityEnabled]);

    // Block external notifications during test
    useEffect(() => {
        if (currentStep !== 'test' || formData.securityEnabled === false) return;

        const handleNotificationShow = () => {
            setNotificationWarnings(prev => {
                const newCount = prev + 1;
                const totalWarnings = newCount + fullscreenWarnings + tabSwitchWarnings;

                toast.error(`📵 External notification detected! (Warning ${totalWarnings}/3)`, {
                    duration: 4000,
                    icon: '⚠️',
                });

                if (totalWarnings >= 3) {
                    toast.error('🚨 Test auto-submitted!', { duration: 6000 });
                    setTimeout(handleSubmitTest, 1000);
                }

                return newCount;
            });
        };

        const checkNotifications = () => {
            if ('Notification' in window && Notification.permission === 'granted') {
                const reminderInterval = setInterval(() => {
                    if (currentStep === 'test') {
                        toast('📵 Reminder: Close all messaging apps', { duration: 3000, icon: '⚠️' });
                    }
                }, 300000);

                const handleFocusLoss = (e) => {
                    if (document.hidden && e.target !== window) {
                        handleNotificationShow();
                    }
                };

                window.addEventListener('focusout', handleFocusLoss);

                return () => {
                    clearInterval(reminderInterval);
                    window.removeEventListener('focusout', handleFocusLoss);
                };
            }
        };

        const cleanup = checkNotifications();
        return cleanup;
    }, [currentStep, fullscreenWarnings, tabSwitchWarnings, handleSubmitTest, formData.securityEnabled]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Enter fullscreen - must be called from user gesture
    const enterFullscreen = async () => {
        try {
            if (document.documentElement.requestFullscreen) {
                await document.documentElement.requestFullscreen();
                setIsFullscreen(true);
                toast.success('Fullscreen mode activated', { duration: 2000 });
            }
        } catch (err) {
            console.log('Fullscreen request failed:', err);
            // Fallback: just hide header/footer without browser fullscreen
            // Using toast instead of toast.info as info variant is not available
            toast('Press F11 for fullscreen mode', { duration: 3000 });
        }
    };

    const handleStartTest = async () => {
        if (!formData.topic.trim()) {
            toast.error('Please enter a topic for the test');
            return;
        }
        if (hasAttempted && currentStep !== 'test') {
            toast.error('You have already attempted this generated test. Create a new one.');
            return;
        }

        // Clear any old progress before starting a new AI test
        clearProgress();

        setLoading(true);
        try {
            const response = await axiosInstance.post(API.MCQ.GENERATE, {
                ...formData,
                userEmail: user?.email, // Add user email for uniqueness tracking
                email: user?.email,
                branch: selectedBranch
            });

            if (response.data.success) {
                // LangChain backend returns questions directly in response.data.questions
                const rawQuestions = response.data.questions || response.data.data?.questions;

                // Transform questions: convert options object {A, B, C, D} to array
                const transformedQuestions = rawQuestions.map(q => {
                    if (q.options && typeof q.options === 'object' && !Array.isArray(q.options)) {
                        // Convert {A: "...", B: "...", C: "...", D: "..."} to ["...", "...", "...", "..."]
                        return {
                            ...q,
                            options: [q.options.A, q.options.B, q.options.C, q.options.D],
                            correctAnswer: q.correctAnswer // Keep as letter (A, B, C, D)
                        };
                    }
                    return q;
                });

                setQuestions(transformedQuestions);
                // Store questions with answers for evaluation
                if (response.data.questionsWithAnswers || response.data.data?.questionsWithAnswers) {
                    setQuestionsWithAnswers(response.data.questionsWithAnswers || response.data.data.questionsWithAnswers);
                }
                setCurrentStep('test');
                setModuleTimes({ 0: formData.numberOfQuestions * 120 });
                setTestStartTime(new Date()); // Set test start time
                setHasAttempted(true);
                toast.success(`Test started! You have ${Math.ceil(formData.numberOfQuestions * 2)} minutes to complete.`);

                // Request notification permission and warn about external notifications
                if ('Notification' in window && Notification.permission === 'default') {
                    try {
                        const permission = await Notification.requestPermission();
                        if (permission === 'granted') {
                            toast('📵 Please close all notification apps (WhatsApp, etc.) during the test', {
                                duration: 5000,
                                icon: '⚠️'
                            });
                        }
                    } catch (err) {
                        console.log('Notification permission request failed:', err);
                    }
                } else if (Notification.permission === 'granted') {
                    toast('📵 Please close all notification apps (WhatsApp, etc.) during the test', {
                        duration: 5000,
                        icon: '⚠️'
                    });
                }

                // Optional: User can manually enter fullscreen using F11 or a button
                // Removed automatic fullscreen call to avoid permission errors
            }
        } catch (error) {
            console.error('Error generating test:', error);
            toast.error(error.response?.data?.message || 'Failed to generate test');
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerSelect = (questionIndex, selectedOption) => {
        // Only set temporary answer, don't save yet
        setTempAnswer(selectedOption);
    };

    // Helper: get global question indices belonging to a given module
    // Handles two cases:
    //   1. Questions have explicit moduleIndex set (admin tagged them per module)
    //   2. Older tests where all questions default to moduleIndex:0 — split evenly by module question count
    const getModuleIndices = (moduleIdx) => {
        const mcqModules = (formData.modules || []).filter(m => m.moduleType !== 'dsa');
        const totalMcqModules = mcqModules.length;

        if (totalMcqModules <= 1) {
            // Single module or no modules — all questions belong to module 0
            return questions.map((_, i) => i);
        }

        // Check if questions have been explicitly tagged with moduleIndex
        const hasExplicitTagging = questions.some(q => (q.moduleIndex || 0) !== 0);

        if (hasExplicitTagging) {
            // Use explicit moduleIndex
            return questions
                .map((q, i) => ({ ...q, globalIndex: i }))
                .filter(q => (q.moduleIndex || 0) === moduleIdx)
                .map(q => q.globalIndex);
        } else {
            // Fallback: divide questions evenly across MCQ modules
            // Build per-module question counts based on module order index
            const total = questions.length;
            const baseCount = Math.floor(total / totalMcqModules);
            const remainder = total % totalMcqModules;

            // Compute start/end for the requested moduleIdx
            let start = 0;
            for (let i = 0; i < moduleIdx; i++) {
                start += baseCount + (i < remainder ? 1 : 0);
            }
            const count = baseCount + (moduleIdx < remainder ? 1 : 0);
            return Array.from({ length: count }, (_, k) => start + k);
        }
    };


    const handleMarkForReview = () => {
        setMarkedForReview(prev => ({
            ...prev,
            [currentQuestion]: !prev[currentQuestion]
        }));
    };

    const handleClearAnswer = () => {
        // Clear saved answer
        setAnswers(prev => {
            const newAnswers = { ...prev };
            delete newAnswers[currentQuestion];
            return newAnswers;
        });
        // Clear temporary selection
        setTempAnswer(null);
        toast.success('Answer cleared', { duration: 1500 });
    };

    const handleSaveAndNext = () => {
        // Save the temporary answer if one is selected
        if (tempAnswer !== null) {
            setAnswers(prev => ({
                ...prev,
                [currentQuestion]: tempAnswer
            }));
            toast.success('Answer saved', { duration: 1500 });
        } else if (answers[currentQuestion] === undefined) {
            toast('No answer selected', { duration: 1500 });
        }

        const activeModIndices = getModuleIndices(currentModuleIndex);

        const localIdx = activeModIndices.indexOf(currentQuestion);
        if (localIdx !== -1 && localIdx < activeModIndices.length - 1) {
            setCurrentQuestion(activeModIndices[localIdx + 1]);
        } else if (localIdx === activeModIndices.length - 1) {
            setShowSubmitConfirmation(true);
        }
    };

    const handleMarkForReviewAndNext = () => {
        // Save the temporary answer first if one is selected
        if (tempAnswer !== null) {
            setAnswers(prev => ({
                ...prev,
                [currentQuestion]: tempAnswer
            }));
        }
        // Mark current question for review
        setMarkedForReview(prev => ({
            ...prev,
            [currentQuestion]: true
        }));
        toast('Saved and marked for review', { duration: 1500 });
        const activeModIndices = getModuleIndices(currentModuleIndex);

        const localIdx = activeModIndices.indexOf(currentQuestion);
        if (localIdx !== -1 && localIdx < activeModIndices.length - 1) {
            setCurrentQuestion(activeModIndices[localIdx + 1]);
        } else if (localIdx === activeModIndices.length - 1) {
            setShowSubmitConfirmation(true);
        }
    };

    const confirmSubmit = () => {
        if (Object.keys(answers).length === 0) {
            toast.error('Please answer at least one question before submitting');
            return;
        }
        setShowSubmitConfirmation(true);
    };

    // Render confirmation dialog - extracted as separate function
    const renderConfirmationDialog = () => {
        if (!showSubmitConfirmation) return null;

        const currentModule = formData.modules?.[currentModuleIndex];
        const isLastModule = !formData.modules || currentModuleIndex === formData.modules.length - 1;
        const submitText = isLastModule ? 'Submit Test?' : 'Submit Module?';
        const submitDesc = isLastModule ? 'Are you sure you want to submit your test?' : `Are you sure you want to submit module ${currentModule?.title || ''}?`;
        
        const currentModuleIndices = getModuleIndices(currentModuleIndex);

        const answeredInModule = currentModuleIndices.filter(i => answers[i] !== undefined).length;
        const totalInModule = currentModuleIndices.length;

        console.log('🎨 [DEBUG] Rendering confirmation dialog');

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-[rgb(var(--bg-card))] rounded-2xl shadow-2xl border border-[rgb(var(--border-subtle))] w-full max-w-md p-6"
                >
                    <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-[rgb(var(--accent))]/20 flex items-center justify-center flex-shrink-0">
                            <AlertTriangle className="w-6 h-6 text-[rgb(var(--accent))]" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-[rgb(var(--text-primary))] mb-2">{submitText}</h3>
                            <div className="text-[rgb(var(--text-muted))] text-sm space-y-2">
                                <p>{submitDesc}</p>
                                <div className="bg-[rgb(var(--bg-body-alt))] rounded-lg p-3 border border-[rgb(var(--border-subtle))] mt-3">
                                    <div className="flex items-center justify-between text-sm mb-2">
                                        <span className="text-[rgb(var(--text-muted))]">Answered:</span>
                                        <span className="text-[rgb(var(--text-primary))] font-semibold">{answeredInModule} / {totalInModule}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm mb-2">
                                        <span className="text-[rgb(var(--text-muted))]">Unanswered:</span>
                                        <span className="text-yellow-400 font-semibold">{totalInModule - answeredInModule}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-[rgb(var(--text-muted))]">Time Remaining:</span>
                                        <span className={`font-semibold ${timeLeft < 300 ? 'text-red-400' : 'text-primary'}`}>{formatTime(timeLeft)}</span>
                                    </div>
                                </div>
                                {(fullscreenWarnings > 0 || tabSwitchWarnings > 0) && (
                                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mt-3">
                                        <p className="text-yellow-400 text-xs font-semibold flex items-center gap-2">
                                            <AlertTriangle className="w-4 h-4" />
                                            Security Warnings: {fullscreenWarnings + tabSwitchWarnings + notificationWarnings}
                                        </p>
                                    </div>
                                )}
                                <p className="text-red-400 text-xs mt-3">
                                    Once submitted, you cannot change your answers.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                        <Button
                            onClick={() => {
                                console.log('🔵 [DEBUG] Continue Test clicked');
                                if (!loading) {
                                    setShowSubmitConfirmation(false);
                                }
                            }}
                            variant="outline"
                            className="flex-1 bg-[rgb(var(--bg-body-alt))] border-[rgb(var(--border-subtle))] hover:bg-[rgb(var(--bg-body))] text-[rgb(var(--text-primary))] disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : 'Continue Test'}
                        </Button>
                        <Button
                            onClick={() => {
                                console.log('🔵 [DEBUG] Submit Test button clicked in dialog');
                                if (!loading && !isSubmitting.current) {
                                    handleModuleSubmit();
                                }
                            }}
                            className="flex-1 bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent-hover))] text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Submitting...
                                </div>
                            ) : (
                                <>
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    {submitText}
                                </>
                            )}
                        </Button>
                    </div>
                </motion.div>
            </div>
        );
    };

    const renderSetupForm = () => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto px-4 sm:px-6 my-10"
        >
            <div className="relative">
                {/* Background Glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-[rgb(var(--accent))]/20 to-purple-500/20 rounded-3xl blur-2xl opacity-60 -z-10"></div>
                
                <Card className="p-6 sm:p-8 lg:p-10 bg-[rgb(var(--bg-card))]/80 backdrop-blur-xl border border-[rgb(var(--border-subtle))] shadow-2xl rounded-3xl relative overflow-hidden">
                    {/* Corner Decoration */}
                    <div className="absolute top-0 right-0 w-40 h-40 bg-[rgb(var(--accent))]/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

                    <div className="text-center mb-8 relative z-10">
                        <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[rgb(var(--accent))] to-[rgb(var(--accent-hover))] rounded-2xl mb-6 shadow-lg shadow-[rgb(var(--accent))]/30 transform rotate-3">
                            <Brain className="w-8 h-8 sm:w-10 sm:h-10 text-white transform -rotate-3" />
                        </div>
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[rgb(var(--text-primary))] to-[rgb(var(--accent))] mb-3">
                            Configure Your Test
                        </h2>
                        <p className="text-sm sm:text-base text-[rgb(var(--text-secondary))] max-w-md mx-auto">
                            Personalize your AI-generated MCQ test by selecting a topic, experience level, and length.
                        </p>
                    </div>

                    <div className="space-y-6 relative z-10">
                        {/* Topic Input */}
                        <div className="group">
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-semibold text-[rgb(var(--text-primary))]">
                                    Test Topic <span className="text-[rgb(var(--text-muted))] font-normal">for {currentBranchInfo?.name || 'Computer Engineering'}</span> *
                                </label>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setShowBranchModal(true);
                                    }}
                                    className="text-xs font-medium text-[rgb(var(--accent))] hover:text-[rgb(var(--accent-hover))] hover:underline transition-all"
                                >
                                    Change Branch
                                </button>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <BookOpen className="h-5 w-5 text-[rgb(var(--text-muted))] group-focus-within:text-[rgb(var(--accent))] transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    value={formData.topic}
                                    onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
                                    placeholder={getTopicPlaceholder(selectedBranch)}
                                    className="w-full pl-11 pr-4 py-3.5 text-sm sm:text-base border border-[rgb(var(--border-subtle))] rounded-xl bg-[rgb(var(--bg-elevated))]/50 text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]/50 focus:border-[rgb(var(--accent))] transition-all shadow-inner"
                                    list="topics"
                                />
                                <datalist id="topics">
                                    {availableTopics.map(topic => (
                                        <option key={topic} value={topic} />
                                    ))}
                                </datalist>
                            </div>
                        </div>

                        {/* Experience and Questions */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                            <div className="group">
                                <label className="block text-sm font-semibold text-[rgb(var(--text-primary))] mb-2">
                                    Experience Level
                                </label>
                                <div className="relative">
                                    <select
                                        value={formData.experience}
                                        onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                                        className="w-full px-4 py-3.5 text-sm sm:text-base border border-[rgb(var(--border-subtle))] rounded-xl bg-[rgb(var(--bg-elevated))]/50 text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]/50 focus:border-[rgb(var(--accent))] transition-all appearance-none cursor-pointer shadow-inner"
                                    >
                                        <option value="beginner">Beginner (0-1 years)</option>
                                        <option value="intermediate">Intermediate (1-3 years)</option>
                                        <option value="advanced">Advanced (3-5 years)</option>
                                        <option value="expert">Expert (5+ years)</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-[rgb(var(--text-muted))] group-focus-within:text-[rgb(var(--accent))] transition-colors">
                                        <ChevronDown className="h-4 w-4" />
                                    </div>
                                </div>
                            </div>

                            <div className="group">
                                <label className="block text-sm font-semibold text-[rgb(var(--text-primary))] mb-2">
                                    Number of Questions
                                </label>
                                <div className="relative">
                                    <select
                                        value={formData.numberOfQuestions}
                                        onChange={(e) => {
                                            const numQuestions = parseInt(e.target.value);
                                            setFormData(prev => ({ ...prev, numberOfQuestions: numQuestions }));
                                            setTimeLeft(numQuestions * 120);
                                        }}
                                        className="w-full px-4 py-3.5 text-sm sm:text-base border border-[rgb(var(--border-subtle))] rounded-xl bg-[rgb(var(--bg-elevated))]/50 text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]/50 focus:border-[rgb(var(--accent))] transition-all appearance-none cursor-pointer shadow-inner"
                                    >
                                        <option value={10}>10 Questions (20 min)</option>
                                        <option value={15}>15 Questions (30 min)</option>
                                        <option value={20}>20 Questions (40 min)</option>
                                        <option value={25}>25 Questions (50 min)</option>
                                        <option value={30}>30 Questions (60 min)</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-[rgb(var(--text-muted))] group-focus-within:text-[rgb(var(--accent))] transition-colors">
                                        <ChevronDown className="h-4 w-4" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Specialization */}
                        <div className="group">
                            <label className="block text-sm font-semibold text-[rgb(var(--text-primary))] mb-2">
                                Specialization <span className="text-[rgb(var(--text-muted))] font-normal">(Optional)</span>
                            </label>
                            <input
                                type="text"
                                value={formData.specialization}
                                onChange={(e) => setFormData(prev => ({ ...prev, specialization: e.target.value }))}
                                placeholder={getSpecializationPlaceholder(selectedBranch)}
                                className="w-full px-4 py-3.5 text-sm sm:text-base border border-[rgb(var(--border-subtle))] rounded-xl bg-[rgb(var(--bg-elevated))]/50 text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]/50 focus:border-[rgb(var(--accent))] transition-all shadow-inner"
                            />
                            <div className="mt-4 flex flex-wrap gap-2 items-center">
                                <span className="text-xs font-medium text-[rgb(var(--text-muted))] mr-1 uppercase tracking-wider">Suggestions:</span>
                                {getSpecializationSuggestions(selectedBranch).map(topic => (
                                    <button
                                        key={topic}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, specialization: formData.specialization ? `${formData.specialization}, ${topic}` : topic })}
                                        className="text-xs font-medium px-3 py-1.5 rounded-full border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] text-[rgb(var(--text-secondary))] hover:border-[rgb(var(--accent))] hover:text-[rgb(var(--accent))] hover:bg-[rgb(var(--accent))]/5 transition-all shadow-sm"
                                    >
                                        + {topic}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Test Rules */}
                        <div className="mt-8 bg-gradient-to-br from-[rgb(var(--accent))]/5 to-transparent rounded-2xl p-5 border border-[rgb(var(--accent))]/20 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-[rgb(var(--accent))]"></div>
                            <div className="flex items-start space-x-4">
                                <div className="p-2.5 bg-[rgb(var(--accent))]/10 rounded-xl shrink-0">
                                    <Timer className="w-6 h-6 text-[rgb(var(--accent))]" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-[rgb(var(--text-primary))] mb-2">Important Guidelines</h4>
                                    <ul className="text-sm text-[rgb(var(--text-secondary))] space-y-1.5 list-disc list-inside">
                                        {rules.map((r, i) => (
                                            <li key={i} className="pl-1 leading-relaxed">{r}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-6 mt-8">
                            <Button
                                onClick={handleStartTest}
                                disabled={loading || !formData.topic.trim()}
                                className="flex-1 bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent-hover))] text-white py-6 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(var(--accent),0.3)] hover:shadow-[0_0_30px_rgba(var(--accent),0.5)] transform hover:-translate-y-0.5 disabled:hover:translate-y-0 disabled:shadow-none relative overflow-hidden group/btn"
                            >
                                {loading ? (
                                    <ButtonLoader text="Generating Magic..." />
                                ) : (
                                    <span className="flex items-center justify-center gap-2 text-base">
                                        Start Your Test <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                                    </span>
                                )}
                                {/* Shimmer Effect */}
                                {!loading && formData.topic.trim() && (
                                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover/btn:animate-[shimmer_1.5s_infinite]"></div>
                                )}
                            </Button>
                            <Button
                                onClick={() => navigate('/mcq-test/history')}
                                className="flex-1 sm:flex-none bg-[rgb(var(--bg-elevated))] hover:bg-[rgb(var(--bg-body))] text-[rgb(var(--text-primary))] border border-[rgb(var(--border-subtle))] px-8 py-6 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                            >
                                <History className="w-5 h-5 text-[rgb(var(--text-muted))]" />
                                View History
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        </motion.div>
    );
    const renderModuleTabs = () => {
        if (!formData.modules || formData.modules.length === 0) return null;
        return (
            <div className="bg-[rgb(var(--bg-card))] border-b border-[rgb(var(--border-subtle))] px-8 py-2.5 flex items-center gap-2 overflow-x-auto custom-scrollbar shrink-0 shadow-sm">
                <span className="text-xs font-bold text-[rgb(var(--text-muted))] uppercase tracking-wider mr-2 shrink-0">Test Modules:</span>
                <div className="flex items-center gap-2">
                    {formData.modules.map((mod, idx) => {
                        const isActive = idx === currentModuleIndex;
                        const remTime = moduleTimes[idx] || 0;
                        const isLocked = idx > currentModuleIndex;
                        const isCompleted = idx < currentModuleIndex;
                        
                        return (
                            <button
                                key={idx}
                                disabled={!isActive} // Enforce sequential unlocking
                                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold border transition-all shrink-0
                                    ${isActive
                                        ? 'bg-[rgb(var(--accent))]/10 border-[rgb(var(--accent))] text-[rgb(var(--accent))] shadow-sm font-extrabold active:scale-95'
                                        : isLocked
                                            ? 'bg-gray-100/50 border-gray-200 text-gray-400 cursor-not-allowed opacity-60'
                                            : 'bg-green-100/50 border-green-200 text-green-700 cursor-not-allowed opacity-80'
                                    }`}
                            >
                                <span>{mod.title}</span>
                                {isCompleted ? (
                                    <CheckCircle className="w-3.5 h-3.5" />
                                ) : isLocked ? (
                                    <Lock className="w-3.5 h-3.5" />
                                ) : (
                                    <span className="font-mono opacity-85">({formatTime(remTime)})</span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderTest = () => {
        const currentModule = formData.modules?.[currentModuleIndex] || { title: formData.topic || 'Test' };

        if (currentModule && currentModule.moduleType === 'dsa') {
            const isLastModule = currentModuleIndex === (formData.modules?.length || 1) - 1;
            return (
                <div className="w-full h-screen flex flex-col overflow-hidden bg-[rgb(var(--bg-body))]">
                    {/* Top Navigation Bar */}
                    <div className="bg-[rgb(var(--accent))] text-white px-8 py-3 flex items-center justify-between shadow-lg shrink-0">
                        <div className="flex items-center gap-4">
                            <h1 className="text-xl font-bold tracking-wide">{formData.topic.toUpperCase()}</h1>
                            {/* Security Warnings Badge */}
                            {(fullscreenWarnings > 0 || tabSwitchWarnings > 0 || notificationWarnings > 0) && (
                                <div className="flex items-center gap-2 px-3 py-1 bg-red-500/90 rounded-full text-xs font-semibold animate-pulse">
                                    <span>⚠️</span>
                                    <span>{fullscreenWarnings + tabSwitchWarnings + notificationWarnings} Security Warnings</span>
                                </div>
                            )}
                        </div>
                        <div className="text-right text-sm">
                            <div>Username : <span className="font-semibold">{user?.email?.split('@')[0] || 'Guest'}</span></div>
                            <div>Subject : <span className="font-semibold">{formData.topic}</span></div>
                        </div>
                    </div>

                    {/* Shared Module Navigation Sub-Header */}
                    {renderModuleTabs()}

                    {/* DSA Test Page Content */}
                    <div className="flex-1 overflow-hidden">
                        <DSATestPage
                            testId={testId}
                            attemptId={attemptId}
                            onComplete={handleModuleSubmit}
                            timeLeft={timeLeft}
                            setTimeLeft={setTimeLeft}
                            isEmbedded={true}
                            testData={rawTestData}
                            isLastModule={isLastModule}
                        />
                    </div>
                </div>
            );
        }

        const currentModuleIndices = getModuleIndices(currentModuleIndex);
        
        const localQuestionIndex = currentModuleIndices.indexOf(currentQuestion) !== -1 ? currentModuleIndices.indexOf(currentQuestion) : 0;
        
        return (
        <div className="w-full h-screen overflow-hidden">
            {/* Mobile/Tablet View - Fixed Height Layout */}
            <div className="lg:hidden h-screen flex flex-col overflow-hidden">
                {/* Header with timer and progress */}
                <Card className="p-4 bg-[rgb(var(--bg-card))] border border-[rgb(var(--border-subtle))] shadow-md flex-shrink-0 z-30">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <Clock className="w-5 h-5 text-secondary" />
                                <span className={`font-mono text-lg font-bold ${timeLeft < 300 ? 'text-red-500' : 'text-secondary'}`}>
                                    {formatTime(timeLeft)}
                                </span>
                            </div>
                            <div className="text-sm text-[rgb(var(--text-muted))]">
                                {currentModule.title} - Question {localQuestionIndex + 1} of {currentModuleIndices.length}
                            </div>
                        </div>
                        {/* Security Warnings Indicator */}
                        {(fullscreenWarnings > 0 || tabSwitchWarnings > 0 || notificationWarnings > 0) && (
                            <div className="flex items-center gap-2 text-xs text-danger">
                                <span className="animate-pulse">⚠️</span>
                                <span>{fullscreenWarnings + tabSwitchWarnings + notificationWarnings} warnings</span>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Mobile Module Navigation Tabs */}
                {renderModuleTabs()}

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar px-4">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentQuestion}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Card className="w-full p-4 sm:p-6 my-4 bg-[rgb(var(--bg-card))] shadow-xl border border-[rgb(var(--border-subtle))]">
                                <div className="mb-6">
                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6 gap-4">
                                        <div className="flex-1">
                                            <div className="flex flex-wrap items-center gap-2 mb-4">
                                                <span className="px-2 sm:px-3 py-1 bg-[rgb(var(--accent))] text-white rounded-full text-xs sm:text-sm font-medium shadow-md whitespace-nowrap">
                                                    Q {localQuestionIndex + 1}/{currentModuleIndices.length}
                                                </span>
                                                <div className="flex items-center gap-1 text-xs sm:text-sm text-[rgb(var(--text-muted))]">
                                                    <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                                                    <span className="whitespace-nowrap">{formatTime(timeLeft)}</span>
                                                </div>
                                                {containsCode(questions[currentQuestion]?.question) && (
                                                    <span className="hidden sm:flex px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium items-center gap-1 border border-green-500/30">
                                                        <Code className="w-3 h-3" />
                                                        Code
                                                    </span>
                                                )}
                                            </div>

                                            {/* Enhanced Question Content Container */}
                                            <div className="bg-[rgb(var(--bg-body))] rounded-xl p-4 border border-[rgb(var(--border-subtle))] shadow-sm">
                                                <div className="prose prose-base max-w-none markdown-content [&_pre]:!bg-transparent [&_code]:!bg-transparent text-[rgb(var(--text-primary))]">
                                                    <ReactMarkdown components={components}>
                                                        {questions[currentQuestion]?.question}
                                                    </ReactMarkdown>
                                                    {questions[currentQuestion]?.codeSnippet && (
                                                        <div className="mt-4 rounded-lg overflow-hidden border border-[rgb(var(--border))]">
                                                            <div className="bg-[#0f0f0f] px-3 py-1.5 border-b border-white/10 flex items-center justify-between">
                                                                <span className="text-xs text-gray-400 font-mono">
                                                                    {getLanguageFromTopic(formData.topic)}
                                                                </span>
                                                            </div>
                                                            <SyntaxHighlighter
                                                                language={getLanguageFromTopic(formData.topic).toLowerCase()}
                                                                style={tomorrow}
                                                                customStyle={{ margin: 0, borderRadius: 0 }}
                                                            >
                                                                {questions[currentQuestion].codeSnippet}
                                                            </SyntaxHighlighter>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Mobile-friendly progress indicator */}
                                        <div className="w-full sm:w-auto">
                                            <div className="flex items-center justify-between text-xs text-[rgb(var(--text-muted))] mb-2">
                                                <span>Progress</span>
                                                <span>{Math.round(((localQuestionIndex + 1) / currentModuleIndices.length) * 100)}%</span>
                                            </div>
                                            <div className="w-full sm:w-32 bg-[rgb(var(--bg-body))] rounded-full h-2 border border-[rgb(var(--border-subtle))]">
                                                <div
                                                    className="bg-[rgb(var(--accent))] h-2 rounded-full transition-all duration-500 ease-out"
                                                    style={{ width: `${((localQuestionIndex + 1) / currentModuleIndices.length) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-3">
                                        {questions[currentQuestion]?.options?.map((option, optionIndex) => (
                                            <label
                                                key={optionIndex}
                                                className={`group flex items-start p-5 border-2 rounded-xl cursor-pointer transition-colors duration-75 hover:shadow-md ${tempAnswer === optionIndex
                                                    ? 'border-[rgb(var(--accent))] bg-[rgb(var(--accent))]/10 shadow-lg shadow-[rgb(var(--accent))]/20'
                                                    : 'border-[rgb(var(--border-subtle))] hover:border-[rgb(var(--accent))]/50 hover:bg-[rgb(var(--bg-body-alt))]'
                                                    }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name={`question-${currentQuestion}`}
                                                    value={optionIndex}
                                                    checked={tempAnswer === optionIndex}
                                                    onChange={() => handleAnswerSelect(currentQuestion, optionIndex)}
                                                    className="sr-only"
                                                />
                                                <div className={`flex-shrink-0 w-5 h-5 border-2 rounded-full mr-4 mt-1 flex items-center justify-center transition-colors duration-75 ${tempAnswer === optionIndex
                                                    ? 'border-primary bg-primary shadow-md'
                                                    : 'border-[rgb(var(--border-subtle))] group-hover:border-primary'
                                                    }`}>
                                                    {tempAnswer === optionIndex && (
                                                        <div className="w-2 h-2 bg-white rounded-full" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <span className="text-sm sm:text-base font-semibold text-[rgb(var(--text-muted))] flex items-center gap-1.5">
                                                            {String.fromCharCode(65 + optionIndex)}.
                                                            {containsCode(option) && (
                                                                <span className="hidden sm:inline-flex px-1.5 py-0.5 bg-secondary/20 text-secondary rounded text-[10px] items-center gap-1 border border-secondary/30">
                                                                    <Code className="w-2.5 h-2.5" />
                                                                    Code
                                                                </span>
                                                            )}
                                                        </span>
                                                    </div>

                                                    {/* Enhanced Option Content */}
                                                    <div className={`prose prose-base max-w-none text-[rgb(var(--text-primary))] ${containsCode(option)
                                                        ? 'bg-[#1a1a1a] rounded-lg p-4 border border-white/10'
                                                        : ''
                                                        }`}>
                                                        <ReactMarkdown components={components}>
                                                            {option}
                                                        </ReactMarkdown>
                                                    </div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </Card>

                            {/* Mobile Question Navigator */}
                            <Card className="p-4 sm:p-5 mb-24 bg-[rgb(var(--bg-card))] shadow-xl border border-[rgb(var(--border-subtle))]">
                                <h3 className="text-base sm:text-lg font-bold text-[rgb(var(--text-primary))] mb-4">Question Navigator</h3>

                                {/* Question Grid */}
                                <div className="grid grid-cols-5 sm:grid-cols-6 gap-2 mb-5">
                                    {currentModuleIndices.map((globalIndex, localIdx) => {
                                        const isAnswered = answers[globalIndex] !== undefined;
                                        const isCurrent = globalIndex === currentQuestion;
                                        const isMarked = markedForReview[globalIndex];
                                        const isVisited = visitedQuestions[globalIndex];

                                        let bgColor = 'bg-gray-500'; // Not Visited
                                        if (isCurrent) {
                                            bgColor = 'bg-[rgb(var(--accent))]'; // Current
                                        } else if (isAnswered && isMarked) {
                                            bgColor = 'bg-gradient-to-r from-green-600 to-purple-600'; // Answered & Marked
                                        } else if (isMarked) {
                                            bgColor = 'bg-purple-600'; // Marked for review only
                                        } else if (isAnswered) {
                                            bgColor = 'bg-green-600'; // Answered
                                        } else if (isVisited) {
                                            bgColor = 'bg-orange-500'; // Visited but not answered
                                        }

                                        return (
                                            <button
                                                key={globalIndex}
                                                onClick={() => setCurrentQuestion(globalIndex)}
                                                className={`${bgColor} text-white font-bold rounded h-10 sm:h-11 flex items-center justify-center text-sm sm:text-base transition-all active:scale-95 shadow`}
                                            >
                                                {localIdx + 1}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Legend */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-500 text-white flex items-center justify-center font-bold text-xs shadow flex-shrink-0">
                                            {currentModuleIndices.filter(i => !visitedQuestions[i]).length}
                                        </div>
                                        <span className="text-xs sm:text-sm text-[rgb(var(--text-secondary))]">Not Visited</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-xs shadow flex-shrink-0">
                                            {currentModuleIndices.filter(i => visitedQuestions[i] && answers[i] === undefined).length}
                                        </div>
                                        <span className="text-xs sm:text-sm text-[rgb(var(--text-secondary))]">Not Answered</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-xs shadow flex-shrink-0">
                                            {currentModuleIndices.filter(i => answers[i] !== undefined && !markedForReview[i]).length}
                                        </div>
                                        <span className="text-xs sm:text-sm text-[rgb(var(--text-secondary))]">Answered</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs shadow flex-shrink-0">
                                            {currentModuleIndices.filter(i => markedForReview[i] && answers[i] === undefined).length}
                                        </div>
                                        <span className="text-xs sm:text-sm text-[rgb(var(--text-secondary))]">Marked for Review</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-green-600 to-purple-600 text-white flex items-center justify-center font-bold text-xs shadow flex-shrink-0">
                                            {currentModuleIndices.filter(i => answers[i] !== undefined && markedForReview[i]).length}
                                        </div>
                                        <span className="text-xs sm:text-sm text-[rgb(var(--text-secondary))]">Answered & Marked</span>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Fixed Bottom Navigation - Mobile */}
                {/* Save & Next and Clear Buttons - Mobile */}
                <div className="sm:hidden fixed bottom-20 left-0 right-0 z-40 px-4">
                    <div className="flex gap-2">
                        <button
                            onClick={handleSaveAndNext}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg font-semibold shadow-lg transition-all active:scale-95"
                        >
                            SAVE & NEXT
                        </button>
                        <button
                            onClick={handleClearAnswer}
                            className="flex-1 bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300 px-4 py-2.5 rounded-lg font-medium shadow-lg transition-all active:scale-95"
                        >
                            CLEAR
                        </button>
                    </div>
                </div>

                {/* Mark for Review Button - Above mobile sticky bar */}
                <div className="sm:hidden fixed bottom-32 left-1/2 -translate-x-1/2 z-40">
                    <button
                        onClick={handleMarkForReview}
                        className={`${markedForReview[currentQuestion] ? 'bg-purple-600' : 'bg-[rgb(var(--accent))]/80'} text-white px-5 py-2.5 rounded-full font-medium shadow-lg flex items-center gap-2 transition-all active:scale-95`}
                    >
                        {markedForReview[currentQuestion] ? '✓ Marked' : 'Mark For Review'} ⚑
                    </button>
                </div>

                {/* Mobile sticky action bar - Fully Responsive */}
                <div className="sm:hidden">
                    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[rgb(var(--bg-card))] border-t-2 border-[rgb(var(--border-subtle))]">
                        <div className="flex items-center justify-between gap-3 px-4 py-3">
                            {/* Prev Button */}
                            <button
                                onClick={() => setCurrentQuestion(currentModuleIndices[localQuestionIndex - 1])}
                                disabled={localQuestionIndex === 0}
                                className={`flex-1 flex items-center justify-center gap-2 rounded-2xl py-2.5 font-semibold text-sm transition-all ${localQuestionIndex === 0
                                    ? 'bg-[rgb(var(--bg-body-alt))] text-[rgb(var(--text-muted))] opacity-50 cursor-not-allowed'
                                    : 'bg-[rgb(var(--bg-body-alt))] text-[rgb(var(--text-secondary))] active:scale-95'
                                    }`}
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Prev
                            </button>

                            {/* Time Chip */}
                            <div className="px-3 py-1 rounded-full bg-[rgb(var(--bg-body))] text-xs text-[rgb(var(--text-secondary))] flex items-center justify-center whitespace-nowrap">
                                <Clock className="w-3 h-3 mr-1" />
                                {formatTime(timeLeft)}
                            </div>

                            {/* Next/Submit Button */}
                            {localQuestionIndex === currentModuleIndices.length - 1 ? (
                                <button
                                    onClick={confirmSubmit}
                                    disabled={loading}
                                    className="flex-1 flex items-center justify-center gap-2 rounded-2xl py-2.5 font-semibold text-sm text-white transition-all active:scale-95 bg-green-600 hover:bg-green-700"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Submitting
                                        </>
                                    ) : (
                                        <>
                                            {currentModuleIndex < (formData.modules?.length || 1) - 1 ? 'Submit Module' : 'Submit Test'}
                                            <CheckCircle className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            ) : (
                                <button
                                    onClick={() => setCurrentQuestion(currentModuleIndices[localQuestionIndex + 1])}
                                    disabled={localQuestionIndex === currentModuleIndices.length - 1}
                                    className="flex-1 flex items-center justify-center gap-2 rounded-2xl py-2.5 font-semibold text-sm text-white transition-all active:scale-95 bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent-hover))] disabled:opacity-50"
                                >
                                    Next
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Desktop View - Professional Layout */}
            <div className="hidden lg:flex lg:flex-col h-screen overflow-hidden bg-[rgb(var(--bg-body))]">
                {/* Top Navigation Bar */}
                <div className="bg-[rgb(var(--accent))] text-white px-8 py-3 flex items-center justify-between shadow-lg shrink-0">
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-bold tracking-wide">{formData.topic.toUpperCase()}</h1>
                        {/* Security Warnings Badge */}
                        {(fullscreenWarnings > 0 || tabSwitchWarnings > 0 || notificationWarnings > 0) && (
                            <div className="flex items-center gap-2 px-3 py-1 bg-red-500/90 rounded-full text-xs font-semibold animate-pulse">
                                <span>⚠️</span>
                                <span>{fullscreenWarnings + tabSwitchWarnings + notificationWarnings} Security Warnings</span>
                            </div>
                        )}
                    </div>
                    <div className="text-right text-sm">
                        <div>Username : <span className="font-semibold">{user?.email?.split('@')[0] || 'Guest'}</span></div>
                        <div>Subject : <span className="font-semibold">{formData.topic}</span></div>
                    </div>
                </div>

                {/* Shared Module Navigation Sub-Header */}
                {renderModuleTabs()}

                {/* Main Content Area */}
                <div className="grid grid-cols-[1fr_380px] flex-1 overflow-hidden">
                    {/* Left Side - Question and Options */}
                    <div className="bg-bg-elevated overflow-y-auto custom-scrollbar">
                        <div className="p-6">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentQuestion}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {/* Question Header */}
                                    <div className="bg-[rgb(var(--bg-card))] border border-[rgb(var(--border-subtle))] rounded p-3 mb-4 shadow-sm">
                                        <div className="flex items-center justify-between">
                                            <div className="text-sm text-[rgb(var(--text-secondary))]">Question: <span className="font-bold text-[rgb(var(--text-primary))]">{currentQuestion + 1}</span></div>
                                            <div className="text-sm text-[rgb(var(--text-secondary))]">Marks: <span className="font-bold text-[rgb(var(--text-primary))]">1</span></div>
                                        </div>
                                    </div>

                                    {/* Question Content */}
                                    <div className="bg-[rgb(var(--bg-card))] border border-[rgb(var(--border-subtle))] rounded p-5 mb-5 shadow-sm">
                                        <div className="prose prose-base max-w-none text-[rgb(var(--text-primary))]">
                                            <ReactMarkdown components={components}>
                                                {questions[currentQuestion]?.question}
                                            </ReactMarkdown>
                                            {questions[currentQuestion]?.codeSnippet && (
                                                <div className="mt-4 rounded-lg overflow-hidden border border-[rgb(var(--border))]">
                                                    <div className="bg-[#0f0f0f] px-3 py-1.5 border-b border-white/10 flex items-center justify-between">
                                                        <span className="text-xs text-gray-400 font-mono">
                                                            {getLanguageFromTopic(formData.topic)}
                                                        </span>
                                                    </div>
                                                    <SyntaxHighlighter
                                                        language={getLanguageFromTopic(formData.topic).toLowerCase()}
                                                        style={tomorrow}
                                                        customStyle={{ margin: 0, borderRadius: 0 }}
                                                    >
                                                        {questions[currentQuestion].codeSnippet}
                                                    </SyntaxHighlighter>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Options */}
                                    <div className="space-y-3">
                                        {questions[currentQuestion]?.options?.map((option, optionIndex) => (
                                            <label
                                                key={optionIndex}
                                                className={`flex items-start gap-3 bg-[rgb(var(--bg-card))] border rounded p-4 cursor-pointer transition-colors duration-75 shadow-sm hover:shadow-md hover:border-primary/50 ${tempAnswer === optionIndex
                                                    ? 'border-primary bg-primary/10 ring-2 ring-primary/30'
                                                    : 'border-[rgb(var(--border-subtle))]'
                                                    }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name={`question-${currentQuestion}`}
                                                    checked={tempAnswer === optionIndex}
                                                    onChange={() => handleAnswerSelect(currentQuestion, optionIndex)}
                                                    className="mt-1 w-4 h-4 accent-primary"
                                                />
                                                <div className="flex-1">
                                                    <div className="mb-1">
                                                        <span className="font-bold text-[rgb(var(--text-primary))] text-base">
                                                            {String.fromCharCode(65 + optionIndex)}.
                                                        </span>
                                                    </div>
                                                    <div className="prose prose-sm max-w-none text-[rgb(var(--text-secondary))]">
                                                        <ReactMarkdown components={components}>
                                                            {option}
                                                        </ReactMarkdown>
                                                    </div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Right Side - Timer, Navigator, and Legend */}
                    <div className="bg-[rgb(var(--bg-card))] border-l-2 border-[rgb(var(--border-subtle))] flex flex-col h-full overflow-hidden">
                        <div className="p-4 flex flex-col h-full min-h-0">
                            {/* Timer Card */}
                            <div className="bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border-subtle))] rounded p-3 mb-3 text-center shadow-sm shrink-0">
                                <div className="text-xs text-[rgb(var(--text-secondary))] mb-1.5 font-medium">Remaining Time:</div>
                                <div className={`text-2xl font-bold font-mono tracking-wider ${timeLeft < 300 ? 'text-red-400' : 'text-[rgb(var(--text-primary))]'
                                    }`}>
                                    {Math.floor(timeLeft / 3600).toString().padStart(2, '0')} : {Math.floor((timeLeft % 3600) / 60).toString().padStart(2, '0')} : {(timeLeft % 60).toString().padStart(2, '0')}
                                </div>
                            </div>

                            {/* Quiz Title */}
                            <div className="text-center mb-3 shrink-0">
                                <h2 className="text-base font-bold text-[rgb(var(--text-primary))]">{formData.topic.toUpperCase()}</h2>
                            </div>

                            {/* Question Navigator */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar mb-3 pr-1 min-h-0">
                                <div className="grid grid-cols-5 gap-2">
                                    {currentModuleIndices.map((globalIndex, localIdx) => {
                                        const isAnswered = answers[globalIndex] !== undefined;
                                        const isCurrent = globalIndex === currentQuestion;
                                        const isMarked = markedForReview[globalIndex];
                                        const isVisited = visitedQuestions[globalIndex];

                                        let bgColor = 'bg-gray-500'; // Not Visited
                                        if (isCurrent) {
                                            bgColor = 'bg-[rgb(var(--accent))]'; // Current
                                        } else if (isAnswered && isMarked) {
                                            bgColor = 'bg-gradient-to-r from-green-600 to-purple-600'; // Answered & Marked
                                        } else if (isMarked) {
                                            bgColor = 'bg-purple-600'; // Marked for review only
                                        } else if (isAnswered) {
                                            bgColor = 'bg-green-600'; // Answered
                                        } else if (isVisited) {
                                            bgColor = 'bg-orange-500'; // Visited but not answered
                                        }

                                        return (
                                            <button
                                                key={globalIndex}
                                                onClick={() => setCurrentQuestion(globalIndex)}
                                                className={`${bgColor} text-white font-bold rounded h-10 flex items-center justify-center text-sm transition-all hover:opacity-90 shadow`}
                                            >
                                                {localIdx + 1}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Legend - Compact Grid */}
                            <div className="grid grid-cols-2 gap-x-3 gap-y-2 border-t border-[rgb(var(--border-subtle))] pt-3 shrink-0 bg-[rgb(var(--bg-card))]">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-gray-500 text-white flex items-center justify-center font-bold text-xs shadow flex-shrink-0">
                                        {currentModuleIndices.filter(i => !visitedQuestions[i]).length}
                                    </div>
                                    <span className="text-xs text-[rgb(var(--text-secondary))] truncate">Not Visited</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-xs shadow flex-shrink-0">
                                        {currentModuleIndices.filter(i => visitedQuestions[i] && answers[i] === undefined).length}
                                    </div>
                                    <span className="text-xs text-[rgb(var(--text-secondary))] truncate">Not Answered</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-xs shadow flex-shrink-0">
                                        {currentModuleIndices.filter(i => answers[i] !== undefined && !markedForReview[i]).length}
                                    </div>
                                    <span className="text-xs text-[rgb(var(--text-secondary))] truncate">Answered</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs shadow flex-shrink-0">
                                        {currentModuleIndices.filter(i => markedForReview[i] && answers[i] === undefined).length}
                                    </div>
                                    <span className="text-xs text-[rgb(var(--text-secondary))] truncate">Marked for Review</span>
                                </div>
                                <div className="flex items-center gap-2 col-span-2">
                                    <div className="w-7 h-7 rounded-full bg-gradient-to-r from-green-600 to-purple-600 text-white flex items-center justify-center font-bold text-xs shadow flex-shrink-0">
                                        {currentModuleIndices.filter(i => answers[i] !== undefined && markedForReview[i]).length}
                                    </div>
                                    <span className="text-xs text-[rgb(var(--text-secondary))]">Answered & Marked</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Navigation Bar */}
                <div className="h-[60px] flex-shrink-0 bg-[rgb(var(--bg-card))] border-t-2 border-[rgb(var(--border-subtle))] px-8 flex items-center justify-between shadow-lg">
                    <div className="flex items-center gap-3">
                        <Button
                            onClick={() => setCurrentQuestion(currentModuleIndices[localQuestionIndex - 1])}
                            disabled={localQuestionIndex === 0}
                            className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-5 py-2.5 rounded font-medium flex items-center gap-2 shadow transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            &lt;&lt; BACK
                        </Button>
                        <Button
                            onClick={() => setCurrentQuestion(currentModuleIndices[localQuestionIndex + 1])}
                            disabled={localQuestionIndex === currentModuleIndices.length - 1}
                            className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-5 py-2.5 rounded font-medium flex items-center gap-2 shadow transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            NEXT &gt;&gt;
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            onClick={handleSaveAndNext}
                            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded font-semibold shadow transition-colors"
                        >
                            SAVE & NEXT
                        </Button>
                        <Button
                            onClick={handleClearAnswer}
                            className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-5 py-2.5 rounded font-medium shadow transition-colors"
                        >
                            CLEAR
                        </Button>
                        <Button
                            onClick={() => {
                                // Save temporary answer first if selected
                                if (tempAnswer !== null) {
                                    setAnswers(prev => ({
                                        ...prev,
                                        [currentQuestion]: tempAnswer
                                    }));
                                }
                                // Then mark for review
                                handleMarkForReview();
                                toast.success('Saved and marked for review', { duration: 1500 });
                            }}
                            className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded font-semibold shadow transition-colors"
                        >
                            SAVE & MARK FOR REVIEW
                        </Button>
                        <Button
                            onClick={handleMarkForReviewAndNext}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded font-semibold shadow transition-colors"
                        >
                            MARK FOR REVIEW & NEXT
                        </Button>
                    </div>

                    <Button
                        onClick={confirmSubmit}
                        disabled={loading}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded font-semibold shadow transition-colors"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Submitting
                            </>
                        ) : (
                            currentModuleIndex < (formData.modules?.length || 1) - 1 ? 'SUBMIT MODULE' : 'SUBMIT TEST'
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};

    const renderPracticeResults = () => {
        if (!results) return null;

        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[rgb(var(--bg-elevated))] rounded-2xl p-8 border border-[rgb(var(--border))]"
                >
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center p-4 rounded-full bg-[rgb(var(--accent))/10] mb-4">
                            <Award className="w-12 h-12 text-[rgb(var(--accent))]" />
                        </div>
                        <h2 className="text-3xl font-bold text-[rgb(var(--text-primary))] mb-2">Practice Complete!</h2>
                        <p className="text-[rgb(var(--text-muted))]">Here is how you performed</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-[rgb(var(--bg-card))] p-6 rounded-xl border border-[rgb(var(--border-subtle))] text-center">
                            <div className="text-sm text-[rgb(var(--text-muted))] mb-1">Score</div>
                            <div className={`text-3xl font-bold ${results.score >= 70 ? 'text-green-500' : 'text-amber-500'}`}>
                                {results.score}%
                            </div>
                        </div>
                        <div className="bg-[rgb(var(--bg-card))] p-6 rounded-xl border border-[rgb(var(--border-subtle))] text-center">
                            <div className="text-sm text-[rgb(var(--text-muted))] mb-1">Correct Answers</div>
                            <div className="text-3xl font-bold text-[rgb(var(--text-primary))]">
                                {results.correctAnswers}/{results.totalQuestions}
                            </div>
                        </div>
                        <div className="bg-[rgb(var(--bg-card))] p-6 rounded-xl border border-[rgb(var(--border-subtle))] text-center">
                            <div className="text-sm text-[rgb(var(--text-muted))] mb-1">Time Spent</div>
                            <div className="text-3xl font-bold text-[rgb(var(--text-primary))]">
                                {Math.floor(results.timeSpent / 60)}m {results.timeSpent % 60}s
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-xl font-bold text-[rgb(var(--text-primary))]">Detailed Review</h3>
                        {results.detailedResults && results.detailedResults.map((result, index) => (
                            <div key={index} className={`p-6 rounded-xl border ${result.isCorrect ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
                                <div className="flex justify-between items-start mb-4">
                                    <h4 className="font-medium text-[rgb(var(--text-primary))]">Question {index + 1}</h4>
                                    {result.isCorrect ? (
                                        <span className="flex items-center text-green-500 text-sm font-medium">
                                            <CheckCircle className="w-4 h-4 mr-1" /> Correct
                                        </span>
                                    ) : (
                                        <span className="flex items-center text-red-500 text-sm font-medium">
                                            <XCircle className="w-4 h-4 mr-1" /> Incorrect
                                        </span>
                                    )}
                                </div>
                                <div className="prose prose-sm max-w-none text-[rgb(var(--text-secondary))] mb-4">
                                    <ReactMarkdown components={components}>
                                        {result.question}
                                    </ReactMarkdown>
                                    {(result.codeSnippet || questions[index]?.codeSnippet) && (
                                        <div className="mt-4 rounded-lg overflow-hidden border border-[rgb(var(--border))]">
                                            <div className="bg-[#0f0f0f] px-3 py-1.5 border-b border-white/10 flex items-center justify-between">
                                                <span className="text-xs text-gray-400 font-mono">
                                                    {getLanguageFromTopic(formData.topic)}
                                                </span>
                                            </div>
                                            <SyntaxHighlighter
                                                language={getLanguageFromTopic(formData.topic).toLowerCase()}
                                                style={tomorrow}
                                                customStyle={{ margin: 0, borderRadius: 0 }}
                                            >
                                                {result.codeSnippet || questions[index]?.codeSnippet}
                                            </SyntaxHighlighter>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div className="bg-[rgb(var(--bg-card))] p-3 rounded-lg border border-[rgb(var(--border-subtle))]">
                                        <span className="text-[rgb(var(--text-muted))] block mb-1">Your Answer:</span>
                                        <span className={result.isCorrect ? 'text-green-500' : 'text-red-500'}>
                                            {result.userAnswer}
                                        </span>
                                    </div>
                                    <div className="bg-[rgb(var(--bg-card))] p-3 rounded-lg border border-[rgb(var(--border-subtle))]">
                                        <span className="text-[rgb(var(--text-muted))] block mb-1">Correct Answer:</span>
                                        <span className="text-green-500">{result.correctAnswer}</span>
                                    </div>
                                </div>

                                {result.explanation && (
                                    <div className="mt-4 pt-4 border-t border-[rgb(var(--border-subtle))]">
                                        <span className="text-[rgb(var(--text-muted))] text-sm font-semibold uppercase tracking-wider block mb-2">Explanation</span>
                                        <p className="text-[rgb(var(--text-secondary))] text-sm leading-relaxed">{result.explanation}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {results.dsaResults && results.dsaResults.length > 0 && (
                        <div className="space-y-6 mt-8 pt-8 border-t border-[rgb(var(--border))]">
                            <h3 className="text-xl font-bold text-[rgb(var(--text-primary))]">DSA Coding Results</h3>
                            {results.dsaResults.map((dsa, index) => (
                                <div key={index} className="bg-[rgb(var(--bg-card))] p-6 rounded-xl border border-[rgb(var(--border-subtle))]">
                                    <div className="flex justify-between items-start mb-4">
                                        <h4 className="font-medium text-[rgb(var(--text-primary))]">Coding Problem {index + 1}</h4>
                                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                                            dsa.status === 'evaluated' ? 'bg-green-500/10 text-green-500' :
                                            dsa.status === 'public_passed' ? 'bg-yellow-500/10 text-yellow-500' :
                                            'bg-red-500/10 text-red-500'
                                        }`}>
                                            {dsa.status.replace('_', ' ').toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                                        <div className="bg-[rgb(var(--bg-elevated))] p-3 rounded-lg border border-[rgb(var(--border-subtle))] text-center">
                                            <div className="text-xs text-[rgb(var(--text-muted))] mb-1">Score</div>
                                            <div className="text-lg font-bold text-[rgb(var(--text-primary))]">{dsa.score}</div>
                                        </div>
                                        <div className="bg-[rgb(var(--bg-elevated))] p-3 rounded-lg border border-[rgb(var(--border-subtle))] text-center">
                                            <div className="text-xs text-[rgb(var(--text-muted))] mb-1">Language</div>
                                            <div className="text-lg font-bold text-[rgb(var(--text-primary))] capitalize">{dsa.language}</div>
                                        </div>
                                        <div className="bg-[rgb(var(--bg-elevated))] p-3 rounded-lg border border-[rgb(var(--border-subtle))] text-center">
                                            <div className="text-xs text-[rgb(var(--text-muted))] mb-1">Public Cases</div>
                                            <div className="text-lg font-bold text-[rgb(var(--text-primary))]">{dsa.publicTestsPassed}/{dsa.publicTestsTotal}</div>
                                        </div>
                                        <div className="bg-[rgb(var(--bg-elevated))] p-3 rounded-lg border border-[rgb(var(--border-subtle))] text-center">
                                            <div className="text-xs text-[rgb(var(--text-muted))] mb-1">Hidden Cases</div>
                                            <div className="text-lg font-bold text-[rgb(var(--text-primary))]">{dsa.hiddenTestsPassed}/{dsa.hiddenTestsTotal}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex justify-center mt-8 gap-4">
                        <Button
                            onClick={() => {
                                setResults(null);
                                setCurrentStep('setup');
                                setVisitedQuestions({});
                                setMarkedForReview({});
                                setAnswers({});
                                navigate('/mcq-test/practice');
                            }}
                            className="px-8 bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent-hover))] text-white font-semibold"
                        >
                            Back to Dashboard
                        </Button>
                    </div>
                </motion.div>
            </div>
        );
    };

    const renderResults = () => {
        const getPerformanceLevel = (score) => {
            if (score >= 90) return { level: 'Excellent', color: 'text-[rgb(var(--accent))]', bgColor: 'bg-[rgb(var(--accent))]/10', borderColor: 'border-[rgb(var(--accent))]' };
            if (score >= 75) return { level: 'Good', color: 'text-[rgb(var(--text-primary))]', bgColor: 'bg-[rgb(var(--text-primary))]/10', borderColor: 'border-[rgb(var(--text-primary))]' };
            if (score >= 60) return { level: 'Average', color: 'text-[rgb(var(--text-secondary))]', bgColor: 'bg-[rgb(var(--text-secondary))]/10', borderColor: 'border-[rgb(var(--text-secondary))]' };
            return { level: 'Needs Improvement', color: 'text-[rgb(var(--text-muted))]', bgColor: 'bg-[rgb(var(--text-muted))]/10', borderColor: 'border-[rgb(var(--text-muted))]' };
        };

        const performance = results ? getPerformanceLevel(results.score) : null;

        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-7xl mx-auto space-y-6"
            >
                {/* Summary Card */}
                <Card className="p-6 sm:p-8 bg-[rgb(var(--bg-card))] border border-[rgb(var(--border-subtle))] shadow-xl">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-[rgb(var(--accent))] rounded-full mb-4 shadow-lg">
                            <Award className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-[rgb(var(--text-primary))] mb-2">
                            Test Completed!
                        </h2>
                        {performance && (
                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${performance.bgColor} ${performance.borderColor} border mt-2`}>
                                <span className={`text-sm sm:text-base font-semibold ${performance.color}`}>
                                    Performance: {performance.level}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Stats Grid */}
                    {results && (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
                            <div className="bg-[rgb(var(--bg-body))] rounded-xl p-4 sm:p-6 shadow-md border border-[rgb(var(--border-subtle))] hover:border-[rgb(var(--accent))] transition-colors">
                                <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-[rgb(var(--accent))]/20 rounded-full mx-auto mb-3">
                                    <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-[rgb(var(--accent))]" />
                                </div>
                                <h3 className="text-xs sm:text-sm font-medium text-[rgb(var(--text-muted))] mb-1 text-center">Score</h3>
                                <p className="text-2xl sm:text-3xl font-bold text-[rgb(var(--accent))] text-center">
                                    {results.score}%
                                </p>
                            </div>

                            <div className="bg-[rgb(var(--bg-body))] rounded-xl p-4 sm:p-6 shadow-md border border-[rgb(var(--border-subtle))] hover:border-[rgb(var(--accent))] transition-colors">
                                <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-[rgb(var(--accent))]/20 rounded-full mx-auto mb-3">
                                    <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-[rgb(var(--accent))]" />
                                </div>
                                <h3 className="text-xs sm:text-sm font-medium text-[rgb(var(--text-muted))] mb-1 text-center">Correct</h3>
                                <p className="text-2xl sm:text-3xl font-bold text-[rgb(var(--accent))] text-center">
                                    {results.correctAnswers}/{results.totalQuestions}
                                </p>
                            </div>

                            <div className="bg-[rgb(var(--bg-body))] rounded-xl p-4 sm:p-6 shadow-md border border-[rgb(var(--border-subtle))] hover:border-[rgb(var(--text-muted))] transition-colors">
                                <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-[rgb(var(--text-muted))]/20 rounded-full mx-auto mb-3">
                                    <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-[rgb(var(--text-muted))]" />
                                </div>
                                <h3 className="text-xs sm:text-sm font-medium text-[rgb(var(--text-muted))] mb-1 text-center">Wrong</h3>
                                <p className="text-2xl sm:text-3xl font-bold text-[rgb(var(--text-muted))] text-center">
                                    {results.totalQuestions - results.correctAnswers}
                                </p>
                            </div>

                            <div className="bg-[rgb(var(--bg-body))] rounded-xl p-4 sm:p-6 shadow-md border border-[rgb(var(--border-subtle))] hover:border-[rgb(var(--text-primary))] transition-colors">
                                <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-[rgb(var(--text-primary))]/20 rounded-full mx-auto mb-3">
                                    <Timer className="w-5 h-5 sm:w-6 sm:h-6 text-[rgb(var(--text-primary))]" />
                                </div>
                                <h3 className="text-xs sm:text-sm font-medium text-[rgb(var(--text-muted))] mb-1 text-center">Time</h3>
                                <p className="text-2xl sm:text-3xl font-bold text-[rgb(var(--text-primary))] text-center">
                                    {formatTime(results.timeSpent || 0)}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Security Warnings */}
                    {(fullscreenWarnings > 0 || tabSwitchWarnings > 0) && (
                        <div className="bg-[rgb(var(--text-muted))]/10 rounded-xl p-4 sm:p-6 mb-6 border border-[rgb(var(--text-muted))]/30">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-xl sm:text-2xl">⚠️</span>
                                <h3 className="text-base sm:text-lg font-semibold text-[rgb(var(--text-muted))]">
                                    Security Warnings Detected
                                </h3>
                            </div>
                            <div className="text-sm sm:text-base text-[rgb(var(--text-secondary))] space-y-1">
                                {fullscreenWarnings > 0 && (
                                    <p>• Fullscreen exits: <span className="font-bold text-[rgb(var(--text-muted))]">{fullscreenWarnings}</span></p>
                                )}
                                {tabSwitchWarnings > 0 && (
                                    <p>• Tab/window switches: <span className="font-bold text-[rgb(var(--text-muted))]">{tabSwitchWarnings}</span></p>
                                )}
                                <p className="text-xs sm:text-sm text-text-muted mt-2">
                                    These violations have been recorded and may affect the validity of your test results.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* AI Disclaimer */}
                    <div className="bg-[rgb(var(--bg-body-alt))] border border-[rgb(var(--border-subtle))] rounded-xl p-4 sm:p-5 mb-6 shadow-md">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-[rgb(var(--text-secondary))] flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <h4 className="text-sm sm:text-base font-semibold text-[rgb(var(--text-primary))] mb-1">AI-Generated Results Disclaimer</h4>
                                <p className="text-xs sm:text-sm text-[rgb(var(--text-secondary))] leading-relaxed">
                                    The answers and explanations are verified by AI and may occasionally contain mistakes.
                                    If you're not satisfied with the AI's answer, we recommend verifying it yourself through additional resources.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* View Detailed Results Button */}
                    <div className="text-center mb-6">
                        <Button
                            onClick={() => setShowDetailedResults(!showDetailedResults)}
                            className="bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent-hover))] text-white px-6 py-3 rounded-lg font-medium shadow-lg transition-all"
                        >
                            {showDetailedResults ? '📊 Hide' : '📋 View'} Detailed Results & Solutions
                        </Button>
                    </div>

                    {/* Email Notification */}
                    <div className="bg-[rgb(var(--accent))]/10 rounded-xl p-4 sm:p-6 mb-6 border border-[rgb(var(--accent))]/30">
                        <div className="flex items-center gap-2 mb-2">
                            <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-[rgb(var(--accent))]" />
                            <h3 className="text-sm sm:text-base font-semibold text-[rgb(var(--text-primary))]">
                                Detailed Report Sent
                            </h3>
                        </div>
                        <p className="text-xs sm:text-sm text-[rgb(var(--text-secondary))]">
                            A comprehensive report with question-wise analysis, explanations, and improvement suggestions has been sent to your email.
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                        <Button
                            onClick={() => {
                                setCurrentStep('setup');
                                setQuestions([]);
                                setAnswers({});
                                setMarkedForReview({});
                                setVisitedQuestions({});
                                setCurrentQuestion(0);
                                setResults(null);
                                setShowDetailedResults(false);
                                setFullscreenWarnings(0);
                                setTabSwitchWarnings(0);
                                setFormData({ topic: '', experience: 'beginner', specialization: '', numberOfQuestions: 30 });
                            }}
                            className="bg-bg-elevated hover:bg-[rgb(var(--bg-body-alt))] text-[rgb(var(--text-primary))] border border-[rgb(var(--border-subtle))] px-6 py-3 rounded-lg font-medium transition-all"
                        >
                            🔄 Take Another Test
                        </Button>
                        <Button
                            onClick={() => window.location.href = '/dashboard'}
                            className="bg-[rgb(var(--accent))] hover:opacity-90 text-white px-6 py-3 rounded-lg font-medium shadow-lg transition-all"
                        >
                            🏠 Back to Dashboard
                        </Button>
                    </div>
                </Card>

                {/* Detailed Results Section */}
                {showDetailedResults && questionsWithAnswers && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4"
                    >
                        <Card className="p-4 sm:p-6 bg-[rgb(var(--bg-card))] border border-[rgb(var(--border-subtle))]">
                            <h3 className="text-xl sm:text-2xl font-bold text-[rgb(var(--text-primary))] mb-4 flex items-center gap-2">
                                <Brain className="w-6 h-6 text-[rgb(var(--accent))]" />
                                Question-wise Analysis
                            </h3>

                            {/* AI Disclaimer for detailed results */}
                            <div className="bg-[rgb(var(--bg-body-alt))] border border-[rgb(var(--border-subtle))] rounded-xl p-4 mb-6">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="w-5 h-5 text-[rgb(var(--text-secondary))] flex-shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                        <h4 className="text-sm font-semibold text-[rgb(var(--text-primary))] mb-1">AI-Generated Content</h4>
                                        <p className="text-xs text-[rgb(var(--text-secondary))] leading-relaxed">
                                            Answers and explanations are verified by AI and may occasionally contain mistakes.
                                            Please verify independently if you have concerns.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {questionsWithAnswers.map((q, index) => {
                                    const userAnswer = answers[index];
                                    const isCorrect = userAnswer === q.correctAnswer;
                                    const wasAttempted = userAnswer !== undefined;

                                    return (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className={`rounded-xl border-2 overflow-hidden ${isCorrect ? 'border-[rgb(var(--accent))] bg-[rgb(var(--accent))]/5' :
                                                wasAttempted ? 'border-[rgb(var(--text-muted))] bg-[rgb(var(--text-muted))]/5' : 'border-[rgb(var(--text-secondary))] bg-[rgb(var(--text-secondary))]/5'
                                                }`}
                                        >
                                            {/* Question Header */}
                                            <div className={`px-4 sm:px-6 py-3 flex items-center justify-between ${isCorrect ? 'bg-[rgb(var(--accent))]/10' :
                                                wasAttempted ? 'bg-[rgb(var(--text-muted))]/10' : 'bg-[rgb(var(--text-secondary))]/10'
                                                }`}>
                                                <div className="flex items-center gap-3">
                                                    <span className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-white ${isCorrect ? 'bg-[rgb(var(--accent))]' :
                                                        wasAttempted ? 'bg-[rgb(var(--text-muted))]' : 'bg-[rgb(var(--text-secondary))]'
                                                        }`}>
                                                        {index + 1}
                                                    </span>
                                                    <span className={`text-sm sm:text-base font-semibold ${isCorrect ? 'text-[rgb(var(--accent))]' :
                                                        wasAttempted ? 'text-[rgb(var(--text-muted))]' : 'text-[rgb(var(--text-secondary))]'
                                                        }`}>
                                                        {isCorrect ? '✓ Correct' : wasAttempted ? '✗ Wrong' : '⊘ Not Attempted'}
                                                    </span>
                                                </div>
                                                {markedForReview[index] && (
                                                    <span className="text-xs sm:text-sm px-2 py-1 bg-[rgb(var(--accent))]/20 text-[rgb(var(--accent))] rounded-full border border-[rgb(var(--accent))]/30">
                                                        ⚑ Marked
                                                    </span>
                                                )}
                                            </div>

                                            {/* Question Content */}
                                            <div className="p-4 sm:p-6 space-y-4">
                                                <div className="bg-bg-elevated rounded-lg p-4 border border-[rgb(var(--border-subtle))]">
                                                    <h4 className="text-xs sm:text-sm font-medium text-[rgb(var(--text-muted))] mb-2">Question:</h4>
                                                    <div className="prose prose-sm sm:prose-base max-w-none text-[rgb(var(--text-primary))]">
                                                        <ReactMarkdown components={components}>
                                                            {q.question}
                                                        </ReactMarkdown>
                                                        {q.codeSnippet && (
                                                            <div className="mt-4 rounded-lg overflow-hidden border border-[rgb(var(--border))]">
                                                                <div className="bg-[#0f0f0f] px-3 py-1.5 border-b border-white/10 flex items-center justify-between">
                                                                    <span className="text-xs text-gray-400 font-mono">
                                                                        {getLanguageFromTopic(formData.topic)}
                                                                    </span>
                                                                </div>
                                                                <SyntaxHighlighter
                                                                    language={getLanguageFromTopic(formData.topic).toLowerCase()}
                                                                    style={tomorrow}
                                                                    customStyle={{ margin: 0, borderRadius: 0 }}
                                                                >
                                                                    {q.codeSnippet}
                                                                </SyntaxHighlighter>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Options */}
                                                <div className="space-y-2">
                                                    {q.options.map((option, optIndex) => {
                                                        const isUserAnswer = userAnswer === optIndex;
                                                        const isCorrectAnswer = q.correctAnswer === optIndex;

                                                        return (
                                                            <div
                                                                key={optIndex}
                                                                className={`p-3 sm:p-4 rounded-lg border-2 ${isCorrectAnswer ? 'border-[rgb(var(--accent))] bg-[rgb(var(--accent))]/10' :
                                                                    isUserAnswer ? 'border-[rgb(var(--text-muted))] bg-[rgb(var(--text-muted))]/10' :
                                                                        'border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-elevated))]'
                                                                    }`}
                                                            >
                                                                <div className="flex items-start gap-3">
                                                                    <span className={`flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm ${isCorrectAnswer ? 'bg-[rgb(var(--accent))] text-white' :
                                                                        isUserAnswer ? 'bg-[rgb(var(--text-muted))] text-white' :
                                                                            'bg-[rgb(var(--bg-body))] text-[rgb(var(--text-muted))] border border-[rgb(var(--border-subtle))]'
                                                                        }`}>
                                                                        {String.fromCharCode(65 + optIndex)}
                                                                    </span>
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="prose prose-sm max-w-none text-[rgb(var(--text-secondary))]">
                                                                            <ReactMarkdown components={components}>
                                                                                {option}
                                                                            </ReactMarkdown>
                                                                        </div>
                                                                        {isCorrectAnswer && (
                                                                            <span className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-[rgb(var(--accent))] mt-1">
                                                                                <CheckCircle className="w-4 h-4" />
                                                                                Correct Answer
                                                                            </span>
                                                                        )}
                                                                        {isUserAnswer && !isCorrectAnswer && (
                                                                            <span className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-[rgb(var(--text-muted))] mt-1">
                                                                                <XCircle className="w-4 h-4" />
                                                                                Your Answer
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                {/* Explanation */}
                                                {q.explanation && (
                                                    <div className="bg-[rgb(var(--accent))]/10 rounded-lg p-4 border border-[rgb(var(--accent))]/30">
                                                        <h4 className="text-sm sm:text-base font-semibold text-[rgb(var(--accent))] mb-2 flex items-center gap-2">
                                                            <Brain className="w-4 h-4" />
                                                            Explanation
                                                        </h4>
                                                        <div className="prose prose-sm max-w-none text-[rgb(var(--text-secondary))]">
                                                            <ReactMarkdown components={components}>
                                                                {q.explanation}
                                                            </ReactMarkdown>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </Card>

                        {/* Recommendations Section */}
                        {results && (
                            <Card className="p-4 sm:p-6 bg-[rgb(var(--bg-card))] border border-[rgb(var(--border-subtle))]">
                                <h3 className="text-xl sm:text-2xl font-bold text-[rgb(var(--text-primary))] mb-4 flex items-center gap-2">
                                    <Settings className="w-6 h-6 text-[rgb(var(--accent))]" />
                                    Personalized Recommendations
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Strengths */}
                                    {results.score >= 60 && (
                                        <div className="bg-[rgb(var(--accent))]/10 rounded-xl p-4 border border-[rgb(var(--accent))]/30">
                                            <h4 className="text-base sm:text-lg font-semibold text-[rgb(var(--accent))] mb-3 flex items-center gap-2">
                                                <CheckCircle className="w-5 h-5" />
                                                Strengths
                                            </h4>
                                            <ul className="space-y-2 text-sm sm:text-base text-[rgb(var(--text-secondary))]">
                                                <li className="flex items-start gap-2">
                                                    <span className="text-[rgb(var(--accent))] mt-1">•</span>
                                                    <span>Good understanding of {formData.topic} fundamentals</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="text-[rgb(var(--accent))] mt-1">•</span>
                                                    <span>Completed test within time limit</span>
                                                </li>
                                                {results.score >= 80 && (
                                                    <li className="flex items-start gap-2">
                                                        <span className="text-[rgb(var(--accent))] mt-1">•</span>
                                                        <span>Strong performance indicates readiness for advanced topics</span>
                                                    </li>
                                                )}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Areas for Improvement */}
                                    <div className="bg-[rgb(var(--text-secondary))]/10 rounded-xl p-4 border border-[rgb(var(--text-secondary))]/30">
                                        <h4 className="text-base sm:text-lg font-semibold text-[rgb(var(--text-secondary))] mb-3 flex items-center gap-2">
                                            <Brain className="w-5 h-5" />
                                            Focus Areas
                                        </h4>
                                        <ul className="space-y-2 text-sm sm:text-base text-[rgb(var(--text-secondary))]">
                                            {results.score < 60 && (
                                                <li className="flex items-start gap-2">
                                                    <span className="text-[rgb(var(--text-secondary))] mt-1">•</span>
                                                    <span>Review core concepts of {formData.topic}</span>
                                                </li>
                                            )}
                                            {results.totalQuestions - results.correctAnswers > 0 && (
                                                <li className="flex items-start gap-2">
                                                    <span className="text-[rgb(var(--text-secondary))] mt-1">•</span>
                                                    <span>Study the explanations for {results.totalQuestions - results.correctAnswers} incorrect answers</span>
                                                </li>
                                            )}
                                            <li className="flex items-start gap-2">
                                                <span className="text-[rgb(var(--text-secondary))] mt-1">•</span>
                                                <span>Practice more {formData.experience} level questions</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-[rgb(var(--text-secondary))] mt-1">•</span>
                                                <span>Review marked questions to clarify doubts</span>
                                            </li>
                                        </ul>
                                    </div>

                                    {/* Next Steps */}
                                    <div className="bg-[rgb(var(--text-primary))]/10 rounded-xl p-4 border border-[rgb(var(--text-primary))]/30">
                                        <h4 className="text-base sm:text-lg font-semibold text-[rgb(var(--text-primary))] mb-3 flex items-center gap-2">
                                            <ChevronRight className="w-5 h-5" />
                                            Next Steps
                                        </h4>
                                        <ul className="space-y-2 text-sm sm:text-base text-[rgb(var(--text-secondary))]">
                                            <li className="flex items-start gap-2">
                                                <span className="text-[rgb(var(--text-primary))] mt-1">•</span>
                                                <span>Take another test on {formData.topic} to track improvement</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-secondary mt-1">•</span>
                                                <span>Explore interview preparation for practical scenarios</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-secondary mt-1">•</span>
                                                <span>Join coding practice sessions for hands-on experience</span>
                                            </li>
                                        </ul>
                                    </div>

                                    {/* Study Resources */}
                                    <div className="bg-primary/10 rounded-xl p-4 border border-primary/30">
                                        <h4 className="text-base sm:text-lg font-semibold text-primary mb-3 flex items-center gap-2">
                                            <BookOpen className="w-5 h-5" />
                                            Study Tips
                                        </h4>
                                        <ul className="space-y-2 text-sm sm:text-base text-[rgb(var(--text-secondary))]">
                                            <li className="flex items-start gap-2">
                                                <span className="text-primary mt-1">•</span>
                                                <span>Use our notes feature to save important concepts</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-primary mt-1">•</span>
                                                <span>Practice coding problems related to {formData.topic}</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-primary mt-1">•</span>
                                                <span>Schedule regular test sessions to build consistency</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </Card>
                        )}
                    </motion.div>
                )}
            </motion.div>
        );
    };

    const handleStartPracticeTest = async () => {
        // Final safety check: If there's already progress, just resume it
        const key = getPersistenceKey();
        const saved = key ? localStorage.getItem(key) : null;
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.questions?.length > 0) {
                    setCurrentStep('test');
                    toast.success('Resuming your active session...');
                    return;
                }
            } catch (e) {
                console.error("Manual resume check failed:", e);
            }
        }

        if (testId) {
            // Re-validate availability before starting
            if (formData.isTimeRestricted) {
                const now = new Date();
                const start = formData.startTime ? new Date(formData.startTime) : null;
                const end = formData.endTime ? new Date(formData.endTime) : null;

                if (start && now < start) {
                    toast.error(`Test has not started yet. Available from ${start.toLocaleString()}`);
                    return;
                }
                if (end && now > end) {
                    toast.error(`Test has already ended on ${end.toLocaleString()}`);
                    return;
                }
            }

            setLoading(true);
            try {
                const res = await axiosInstance.post(API.MCQ.START_PRACTICE_TEST(testId), {
                    userInfo: user
                });
                if (res.data.success) {
                    setAttemptId(res.data.data.attemptId);
                }
            } catch (error) {
                console.error("Error starting practice test:", error);
                toast.error(error.response?.data?.message || 'Failed to start test');
                setLoading(false);
                return; // Stop execution
            }
            setLoading(false);
        }

        // Calculate time left - cap it if test is time restricted
        let calculatedTimeLeft = formData.timeLimit ? formData.timeLimit * 60 : formData.numberOfQuestions * 120;
        if (formData.modules && formData.modules.length > 0) {
            calculatedTimeLeft = (formData.modules[0].timeLimit || 30) * 60;
        }
        
        if (formData.isTimeRestricted && formData.endTime) {
            const now = new Date();
            const end = new Date(formData.endTime);
            const remainingUntilEnd = Math.floor((end - now) / 1000);
            
            if (remainingUntilEnd > 0) {
                // Use the minimum of time limit and time remaining until test ends
                calculatedTimeLeft = Math.min(calculatedTimeLeft, remainingUntilEnd);
            }
        }

        setCurrentStep('test');
        setTimeLeft(calculatedTimeLeft);
        setTestStartTime(new Date());
        toast.success(`Practice Test: ${formData.title} started!`);
    };

    const renderGuidelines = () => {
        let isAvailable = true;
        let availabilityMessage = "";

        if (formData.isTimeRestricted) {
            const now = new Date();
            const start = formData.startTime ? new Date(formData.startTime) : null;
            const end = formData.endTime ? new Date(formData.endTime) : null;

            if (start && now < start) {
                isAvailable = false;
                availabilityMessage = `Test will be available from ${start.toLocaleString()}`;
            } else if (end && now > end) {
                isAvailable = false;
                availabilityMessage = `Test ended on ${end.toLocaleString()}`;
            }
        }

        return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto mt-10"
        >
            <Card className="p-6 md:p-8 bg-[rgb(var(--bg-card))] border border-[rgb(var(--border-subtle))] shadow-xl relative overflow-hidden rounded-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[rgb(var(--accent))]/5 rounded-full blur-3xl -z-10" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-[rgb(var(--primary))]/5 rounded-full blur-3xl -z-10" />

                <div className="text-center mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-[rgb(var(--text-primary))] mb-3">
                        {formData.title || formData.topic}
                    </h2>
                    <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-[rgb(var(--text-secondary))]">
                        <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-[rgb(var(--accent))]" /> {formData.timeLimit || 30} Minutes</span>
                        <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4 text-primary" /> {formData.numberOfQuestions} Questions</span>
                        <span className="flex items-center gap-1.5"><History className="w-4 h-4 text-orange-500" /> Max Attempts: {formData.maxAttempts || 1}</span>
                    </div>
                </div>

                <div className="bg-[rgb(var(--bg-body-alt))] rounded-xl p-6 border border-[rgb(var(--border-subtle))] mb-8">
                    <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))] mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-[rgb(var(--accent))]" />
                        Guidelines & Instructions
                    </h3>
                    <div className="prose prose-sm md:prose-base max-w-none text-[rgb(var(--text-secondary))]">
                        <ul className="list-none space-y-3">
                            <li className="flex items-start gap-2">
                                <span className="text-[rgb(var(--accent))] mt-1">•</span>
                                <span><strong>Stable Connection:</strong> Ensure you have a stable internet connection before starting.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-[rgb(var(--accent))] mt-1">•</span>
                                <span><strong>No Tab Switching:</strong> Avoid switching tabs or opening new windows. This activity is monitored and recorded.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-[rgb(var(--accent))] mt-1">•</span>
                                <span><strong>Auto-Submission:</strong> The test will automatically submit when the timer reaches zero.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-[rgb(var(--accent))] mt-1">•</span>
                                <span><strong>Safe Resume:</strong> Progress is automatically saved. If your browser reloads or device fails, you can resume exactly where you left off.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-[rgb(var(--accent))] mt-1">•</span>
                                <span><strong>Finality:</strong> Once submitted, you cannot alter your answers. Please review carefully.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-[rgb(var(--accent))] mt-1">•</span>
                                <span><strong>Exam start:</strong> Once click "I Agree, Start Exam", it's counted as an attempt, so start only when you are ready.</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="flex justify-end gap-4 items-center">
                    {!isAvailable && (
                        <div className="text-red-500 font-medium mr-auto">
                            <Clock className="w-4 h-4 inline mr-1" /> {availabilityMessage}
                        </div>
                    )}
                    <Button
                        onClick={() => navigate('/mcq-test/practice')}
                        className="bg-[rgb(var(--bg-body-alt))] hover:bg-[rgb(var(--bg-elevated))] text-[rgb(var(--text-primary))] border border-[rgb(var(--border-subtle))] px-6"
                    >
                        Cancel
                    </Button>
                    {isAvailable && (
                        <Button
                            onClick={handleStartPracticeTest}
                            className="bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent-hover))] text-white px-8 font-semibold shadow-lg shadow-[rgb(var(--accent))]/20 transition-all active:scale-95"
                        >
                            I Agree, Start Exam
                        </Button>
                    )}
                </div>
            </Card>
        </motion.div>
        );
    };

    // During test on desktop, render fullscreen layout without container
    if (currentStep === 'test' && window.innerWidth >= 1024) {
        return (
            <>
                {renderTest()}
                {renderConfirmationDialog()}
            </>
        );
    }

    return (
        <div className="min-h-screen w-full overflow-x-hidden bg-bg-body">
            <div className="container mx-auto px-4 pb-4 pt-4">
                {/* Content based on current step */}
                {currentStep === 'setup' && renderSetupForm()}
                {currentStep === 'guidelines' && renderGuidelines()}
                {currentStep === 'test' && renderTest()}
                {currentStep === 'results' && (testId ? renderPracticeResults() : renderResults())}
            </div>

            {/* Branch Selection Modal */}
            <BranchModal 
                isOpen={showBranchModal} 
                onClose={() => setShowBranchModal(false)}
                onSelectBranch={(branchId) => {
                    setSelectedBranch(branchId);
                    setShowBranchModal(false);
                }}
                currentBranch={selectedBranch}
            />

            {/* Submit Confirmation Modal */}
            {renderConfirmationDialog()}
        </div>
    );
};

export default MCQTest;



import React, { useState, useEffect, useContext, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
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
import { Clock, CheckCircle, XCircle, Award, Mail, Brain, Timer, BookOpen, Settings, ChevronLeft, ChevronRight, Code, Copy, History, AlertTriangle } from 'lucide-react';

const MCQTest = () => {
    const { user } = useContext(UserContext);
    const { setIsTestActive } = useTestMode();
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState('setup'); // setup, test, results
    const [formData, setFormData] = useState({
        topic: '',
        experience: 'beginner',
        specialization: '',
        numberOfQuestions: 30
    });
    const [questions, setQuestions] = useState([]);
    const [questionsWithAnswers, setQuestionsWithAnswers] = useState([]); // Store questions with correct answers for evaluation
    const [answers, setAnswers] = useState({});
    const [markedForReview, setMarkedForReview] = useState({});
    const [visitedQuestions, setVisitedQuestions] = useState({});
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [timeLeft, setTimeLeft] = useState(1800); // Default 30 minutes
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
        'Results include score, accuracy and time spent'
    ]);
    const [hasAttempted, setHasAttempted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [fullscreenWarnings, setFullscreenWarnings] = useState(0);
    const [tabSwitchWarnings, setTabSwitchWarnings] = useState(0);
    const [availableTopics] = useState([
        'JavaScript', 'React', 'Node.js', 'Python', 'Java', 'C++', 'Database',
        'System Design', 'Data Structures', 'Algorithms', 'Machine Learning',
        'DevOps', 'Cloud Computing', 'Cybersecurity', 'Frontend Development',
        'Backend Development'
    ]);

    // Submit test function - defined before useEffect hooks that reference it
    const handleSubmitTest = useCallback(async () => {
        setLoading(true);
        const endTime = new Date();
        setTestEndTime(endTime);

        // Calculate actual time spent in seconds
        const actualTimeSpent = testStartTime ? Math.floor((endTime - testStartTime) / 1000) : (formData.numberOfQuestions * 120) - timeLeft;

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
                securityWarnings: {
                    fullscreenExits: fullscreenWarnings,
                    tabSwitches: tabSwitchWarnings
                }
            };

            const response = await axiosInstance.post(API.MCQ.SUBMIT, submissionData);

            if (response.data.success) {
                setResults({
                    ...response.data.data.results,
                    timeSpent: actualTimeSpent,
                    securityWarnings: {
                        fullscreenExits: fullscreenWarnings,
                        tabSwitches: tabSwitchWarnings
                    }
                });
                setCurrentStep('results');

                // Show warning if there were security violations
                if (fullscreenWarnings > 0 || tabSwitchWarnings > 0) {
                    toast.error(`⚠️ Test completed with ${fullscreenWarnings} fullscreen exit(s) and ${tabSwitchWarnings} tab switch(es). Results may be affected.`, {
                        duration: 6000
                    });
                } else {
                    toast.success('Test submitted successfully! Results sent to your email.');
                }
            }
        } catch (error) {
            console.error('Error submitting test:', error);
            toast.error(error.response?.data?.message || 'Failed to submit test');
        } finally {
            setLoading(false);
        }
    }, [answers, testStartTime, formData, timeLeft, user, questionsWithAnswers, fullscreenWarnings, tabSwitchWarnings, setCurrentStep, setResults, setTestEndTime, setIsFullscreen, setLoading]);

    // Enhanced components for markdown rendering with better code support
    const components = {
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
                    <div className="relative group my-4 bg-bg-card rounded-lg border border-border-subtle shadow-card overflow-hidden">
                        <div className="flex items-center justify-between bg-bg-elevated-alt text-text-secondary px-3 sm:px-4 py-2.5 border-b border-border-subtle">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                </div>
                                <span className="text-xs font-medium text-text-muted uppercase tracking-wide">
                                    {language || 'code'}
                                </span>
                            </div>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(cleanCode);
                                    toast.success('Code copied to clipboard!');
                                }}
                                className="flex items-center gap-1.5 px-2.5 py-1 bg-bg-elevated-alt hover:bg-bg-card rounded text-xs transition-colors opacity-0 group-hover:opacity-100 font-medium text-text-secondary"
                                title="Copy code"
                            >
                                <Copy className="w-3 h-3" />
                                Copy
                            </button>
                        </div>
                        <div className="overflow-x-auto bg-bg-card">
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

            // Inline code with dark theme
            return (
                <code className="bg-bg-elevated-alt text-text-secondary px-2 py-1 rounded text-sm font-mono border border-border-subtle" {...props}>
                    {cleanCode}
                </code>
            );
        },
        pre({ children }) {
            return <div className="overflow-x-auto rounded-lg">{children}</div>;
        },
        p({ children }) {
            return <p className="mb-3 last:mb-0 leading-relaxed text-text-secondary">{children}</p>;
        },
        ul({ children }) {
            return <ul className="list-disc list-inside mb-4 space-y-2 text-text-secondary pl-2">{children}</ul>;
        },
        ol({ children }) {
            return <ol className="list-decimal list-inside mb-4 space-y-2 text-text-secondary pl-2">{children}</ol>;
        },
        li({ children }) {
            return <li className="leading-relaxed">{children}</li>;
        },
        blockquote({ children }) {
            return (
                <blockquote className="border-l-4 border-accent pl-4 py-3 my-4 bg-accent/10 rounded-r-lg">
                    <div className="text-text-secondary italic">
                        {children}
                    </div>
                </blockquote>
            );
        },
        h1({ children }) {
            return <h1 className="text-xl font-bold mb-4 text-text-primary">{children}</h1>;
        },
        h2({ children }) {
            return <h2 className="text-lg font-semibold mb-3 text-text-primary">{children}</h2>;
        },
        h3({ children }) {
            return <h3 className="text-base font-medium mb-2 text-text-primary">{children}</h3>;
        },
        strong({ children }) {
            return <strong className="font-semibold text-text-primary">{children}</strong>;
        },
        em({ children }) {
            return <em className="italic text-text-secondary">{children}</em>;
        },
        table({ children }) {
            return (
                <div className="overflow-x-auto my-4 rounded-lg border border-border-subtle">
                    <table className="min-w-full bg-bg-card">
                        {children}
                    </table>
                </div>
            );
        },
        th({ children }) {
            return (
                <th className="border-b border-border-subtle px-4 py-3 bg-bg-elevated-alt font-semibold text-left text-text-primary text-sm">
                    {children}
                </th>
            );
        },
        td({ children }) {
            return (
                <td className="border-b border-border-subtle px-4 py-3 text-text-secondary text-sm">
                    {children}
                </td>
            );
        }
    };

    // Utility function to detect if content contains code
    const containsCode = (text) => {
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
    };

    // Timer effect
    useEffect(() => {
        if (currentStep === 'test' && timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        handleSubmitTest();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [currentStep, timeLeft, handleSubmitTest]);

    // Fullscreen management and hide header/footer when test starts
    useEffect(() => {
        // Update test mode context to hide header/footer
        setIsTestActive(currentStep === 'test');

        // Listen for fullscreen changes and prevent manual exit
        const handleFullscreenChange = () => {
            const isCurrentlyFullscreen = !!document.fullscreenElement;
            setIsFullscreen(isCurrentlyFullscreen);

            // If user manually exits fullscreen during test, show warning
            if (currentStep === 'test' && !isCurrentlyFullscreen && isFullscreen) {
                setFullscreenWarnings(prev => {
                    const newCount = prev + 1;
                    const totalWarnings = newCount + tabSwitchWarnings;

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
            setIsTestActive(false);
        };
    }, [currentStep, setIsTestActive, isFullscreen, tabSwitchWarnings, handleSubmitTest]);

    // Track visited questions
    useEffect(() => {
        if (currentStep === 'test' && questions.length > 0) {
            setVisitedQuestions(prev => ({ ...prev, [currentQuestion]: true }));
        }
    }, [currentQuestion, currentStep, questions.length]);

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
        if (currentStep !== 'test') return;

        // Prevent right-click context menu
        const preventContextMenu = (e) => {
            e.preventDefault();
            toast.error('Right-click is disabled during the test!', { duration: 2000 });
        };

        // Prevent keyboard shortcuts (except allowed ones)
        const preventKeyboardShortcuts = (e) => {
            // Block Ctrl, Cmd, Alt combinations (except Ctrl+C for copy in test)
            if (e.ctrlKey || e.metaKey || e.altKey) {
                // Allow Ctrl+C and Ctrl+V for copying code/text
                if (e.ctrlKey && (e.key === 'c' || e.key === 'C' || e.key === 'v' || e.key === 'V')) {
                    return; // Allow copy/paste
                }
                e.preventDefault();
                toast.error('Keyboard shortcuts are disabled during the test!', { duration: 2000 });
            }

            // Allow F11 and Escape for fullscreen control
            // Removed restriction to allow users to toggle fullscreen manually

            // Prevent F12 (Developer tools)
            if (e.key === 'F12') {
                e.preventDefault();
                toast.error('Developer tools are disabled during the test!', { duration: 2000 });
            }
        };

        window.addEventListener('contextmenu', preventContextMenu);
        window.addEventListener('keydown', preventKeyboardShortcuts);

        return () => {
            window.removeEventListener('contextmenu', preventContextMenu);
            window.removeEventListener('keydown', preventKeyboardShortcuts);
        };
    }, [currentStep]);

    // Detect tab switching and show warning
    useEffect(() => {
        if (currentStep !== 'test') return;

        const handleVisibilityChange = () => {
            if (document.hidden) {
                setTabSwitchWarnings(prev => {
                    const newCount = prev + 1;
                    const totalWarnings = newCount + fullscreenWarnings;

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
                const totalWarnings = newCount + fullscreenWarnings;

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
    }, [currentStep, fullscreenWarnings, handleSubmitTest]);

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
            toast.info('Press F11 for fullscreen mode', { duration: 3000 });
        }
    };

    const handleStartTest = async () => {
        if (!formData.topic.trim()) {
            toast.error('Please enter a topic for the test');
            return;
        }
        if (hasAttempted) {
            toast.error('You have already attempted this generated test. Create a new one.');
            return;
        }

        setLoading(true);
        try {
            const response = await axiosInstance.post(API.MCQ.GENERATE, {
                ...formData,
                userEmail: user?.email, // Add user email for uniqueness tracking
                email: user?.email
            });

            if (response.data.success) {
                setQuestions(response.data.data.questions);
                // Store questions with answers for evaluation
                if (response.data.data.questionsWithAnswers) {
                    setQuestionsWithAnswers(response.data.data.questionsWithAnswers);
                }
                setCurrentStep('test');
                setTimeLeft(formData.numberOfQuestions * 120); // Reset timer based on questions
                setTestStartTime(new Date()); // Set test start time
                setHasAttempted(true);
                toast.success(`Test started! You have ${Math.ceil(formData.numberOfQuestions * 2)} minutes to complete.`);

                // Enter fullscreen after test starts (user just clicked button)
                setTimeout(() => {
                    enterFullscreen();
                }, 100);
            }
        } catch (error) {
            console.error('Error generating test:', error);
            toast.error(error.response?.data?.message || 'Failed to generate test');
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerSelect = (questionIndex, selectedOption) => {
        setAnswers(prev => ({
            ...prev,
            [questionIndex]: selectedOption
        }));
    };

    const handleMarkForReview = () => {
        setMarkedForReview(prev => ({
            ...prev,
            [currentQuestion]: !prev[currentQuestion]
        }));
    };

    const confirmSubmit = () => {
        if (Object.keys(answers).length === 0) {
            toast.error('Please answer at least one question before submitting');
            return;
        }
        setShowSubmitConfirmation(true);
    };

    const renderSetupForm = () => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto px-4 sm:px-6"
        >
            <Card className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-bg-card to-bg-body border border-border-subtle shadow-xl">
                <div className="text-center mb-6 sm:mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-secondary to-primary rounded-full mb-4 shadow-lg">
                        <Brain className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </div>
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-text-primary mb-2">
                        MCQ Test Setup
                    </h2>
                    <p className="text-sm sm:text-base text-text-secondary">
                        Configure your personalized test with AI-generated questions
                    </p>
                </div>

                <div className="space-y-4 sm:space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">
                            Test Topic *
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={formData.topic}
                                onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
                                placeholder="e.g., React Hooks, System Design, Data Structures..."
                                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-border-subtle rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-bg-body text-text-primary placeholder:text-text-muted transition-all duration-200"
                                list="topics"
                            />
                            <datalist id="topics">
                                {availableTopics.map(topic => (
                                    <option key={topic} value={topic} />
                                ))}
                            </datalist>
                            <BookOpen className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-text-muted" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">
                                Experience Level
                            </label>
                            <select
                                value={formData.experience}
                                onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-border-subtle rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-bg-body text-text-primary"
                            >
                                <option value="beginner">Beginner (0-1 years)</option>
                                <option value="intermediate">Intermediate (1-3 years)</option>
                                <option value="advanced">Advanced (3-5 years)</option>
                                <option value="expert">Expert (5+ years)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">
                                Number of Questions
                            </label>
                            <select
                                value={formData.numberOfQuestions}
                                onChange={(e) => {
                                    const numQuestions = parseInt(e.target.value);
                                    setFormData(prev => ({ ...prev, numberOfQuestions: numQuestions }));
                                    setTimeLeft(numQuestions * 120); // 2 minutes per question
                                }}
                                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-border-subtle rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-bg-body text-text-primary"
                            >
                                <option value={10}>10 Questions (20 min)</option>
                                <option value={15}>15 Questions (30 min)</option>
                                <option value={20}>20 Questions (40 min)</option>
                                <option value={25}>25 Questions (50 min)</option>
                                <option value={30}>30 Questions (60 min)</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">
                            Specialization (Optional)
                        </label>
                        <input
                            type="text"
                            value={formData.specialization}
                            onChange={(e) => setFormData(prev => ({ ...prev, specialization: e.target.value }))}
                            placeholder="e.g., Frontend Development, Machine Learning..."
                            className="w-full px-4 py-3 border border-border-subtle rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-bg-body text-text-primary placeholder:text-text-muted"
                        />
                    </div>

                    <div className="bg-primary/10 rounded-lg p-4 border border-primary/30">
                        <div className="flex items-start space-x-3">
                            <Timer className="w-5 h-5 text-primary mt-0.5" />
                            <div>
                                <h4 className="font-medium text-text-primary">Test Rules</h4>
                                <ul className="text-sm text-text-secondary mt-1 space-y-1 list-disc list-inside">
                                    {rules.map((r, i) => (
                                        <li key={i}>{r}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                            onClick={handleStartTest}
                            disabled={loading || !formData.topic.trim()}
                            className="flex-1 bg-gradient-to-r from-secondary to-primary hover:shadow-lg hover:shadow-primary/50 text-white py-3 font-medium transition-all"
                        >
                            {loading ? (
                                <div className="flex items-center space-x-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>Generating Questions...</span>
                                </div>
                            ) : (
                                'Start MCQ Test'
                            )}
                        </Button>
                        <Button
                            onClick={() => navigate('/mcq-test/history')}
                            className="flex-1 sm:flex-none bg-bg-elevated hover:bg-bg-elevated-alt text-text-primary border border-border-subtle px-6 py-3 font-medium transition-all flex items-center justify-center gap-2"
                        >
                            <History className="w-5 h-5" />
                            View History
                        </Button>
                    </div>
                </div>
            </Card>
        </motion.div>
    );

    const renderTest = () => (
        <div className="w-full pb-32 sm:pb-6">
            {/* Mobile/Tablet View - Original Stacked Layout */}
            <div className="lg:hidden max-w-4xl mx-auto">
                {/* Header with timer and progress */}
                <Card className="p-4 mb-6 bg-bg-card border border-border-subtle shadow-md sticky top-0 z-30">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <Clock className="w-5 h-5 text-secondary" />
                                <span className={`font-mono text-lg font-bold ${timeLeft < 300 ? 'text-red-500' : 'text-secondary'}`}>
                                    {formatTime(timeLeft)}
                                </span>
                            </div>
                            <div className="text-sm text-text-muted">
                                Question {currentQuestion + 1} of {questions.length}
                            </div>
                        </div>
                        {/* Security Warnings Indicator */}
                        {(fullscreenWarnings > 0 || tabSwitchWarnings > 0) && (
                            <div className="flex items-center gap-2 text-xs text-danger">
                                <span className="animate-pulse">⚠️</span>
                                <span>{fullscreenWarnings + tabSwitchWarnings} warnings</span>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Question Card */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentQuestion}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Card className="w-full p-4 sm:p-6 mb-6 bg-bg-card shadow-xl border border-border-subtle">
                            <div className="mb-6">
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6 gap-4">
                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center gap-2 mb-4">
                                            <span className="px-2 sm:px-3 py-1 bg-gradient-to-r from-secondary to-primary text-white rounded-full text-xs sm:text-sm font-medium shadow-md whitespace-nowrap">
                                                Q {currentQuestion + 1}/{questions.length}
                                            </span>
                                            <div className="flex items-center gap-1 text-xs sm:text-sm text-text-muted">
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
                                        <div className="bg-bg-body rounded-xl p-4 border border-border-subtle shadow-sm">
                                            <div className="prose prose-base dark:prose-invert max-w-none markdown-content [&_pre]:!bg-transparent [&_code]:!bg-transparent text-text-primary">
                                                <ReactMarkdown components={components}>
                                                    {questions[currentQuestion]?.question}
                                                </ReactMarkdown>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Mobile-friendly progress indicator */}
                                    <div className="w-full sm:w-auto">
                                        <div className="flex items-center justify-between text-xs text-text-muted mb-2">
                                            <span>Progress</span>
                                            <span>{Math.round(((currentQuestion + 1) / questions.length) * 100)}%</span>
                                        </div>
                                        <div className="w-full sm:w-32 bg-bg-body rounded-full h-2 border border-border-subtle">
                                            <div
                                                className="bg-gradient-to-r from-secondary to-primary h-2 rounded-full transition-all duration-500 ease-out"
                                                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-3">
                                    {questions[currentQuestion]?.options?.map((option, optionIndex) => (
                                        <motion.label
                                            key={optionIndex}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.2, delay: optionIndex * 0.05 }}
                                            className={`group flex items-start p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${answers[currentQuestion] === optionIndex
                                                ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20'
                                                : 'border-border-subtle hover:border-primary/50 hover:bg-bg-card-alt'
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name={`question-${currentQuestion}`}
                                                value={optionIndex}
                                                checked={answers[currentQuestion] === optionIndex}
                                                onChange={() => handleAnswerSelect(currentQuestion, optionIndex)}
                                                className="sr-only"
                                            />
                                            <div className={`flex-shrink-0 w-5 h-5 border-2 rounded-full mr-4 mt-1 flex items-center justify-center transition-all duration-200 ${answers[currentQuestion] === optionIndex
                                                ? 'border-primary bg-primary shadow-md'
                                                : 'border-border-subtle group-hover:border-primary'
                                                }`}>
                                                {answers[currentQuestion] === optionIndex && (
                                                    <motion.div
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        className="w-2 h-2 bg-white rounded-full"
                                                    />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-xs sm:text-sm font-medium text-text-muted flex items-center gap-1">
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
                                                <div className={`prose prose-sm dark:prose-invert max-w-none text-text-primary ${containsCode(option)
                                                    ? 'bg-bg-body rounded-lg p-3 border border-border-subtle'
                                                    : ''
                                                    }`}>
                                                    <ReactMarkdown components={components}>
                                                        {option}
                                                    </ReactMarkdown>
                                                </div>
                                            </div>
                                        </motion.label>
                                    ))}
                                </div>
                            </div>
                        </Card>

                        {/* Mobile Question Navigator */}
                        <Card className="p-4 sm:p-5 mb-6 bg-bg-card shadow-xl border border-border-subtle">
                            <h3 className="text-base sm:text-lg font-bold text-text-primary mb-4">Question Navigator</h3>

                            {/* Question Grid */}
                            <div className="grid grid-cols-5 sm:grid-cols-6 gap-2 mb-5">
                                {questions.map((_, index) => {
                                    const isAnswered = answers[index] !== undefined;
                                    const isCurrent = index === currentQuestion;
                                    const isMarked = markedForReview[index];
                                    const isVisited = visitedQuestions[index];

                                    let bgColor = 'bg-text-disabled'; // Not Visited
                                    if (isCurrent) {
                                        bgColor = 'bg-primary'; // Current
                                    } else if (isMarked) {
                                        bgColor = 'bg-purple-600'; // Marked for review
                                    } else if (isAnswered) {
                                        bgColor = 'bg-success'; // Answered
                                    } else if (isVisited) {
                                        bgColor = 'bg-accent-warm'; // Visited but not answered
                                    }

                                    return (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentQuestion(index)}
                                            className={`${bgColor} text-white font-bold rounded h-10 sm:h-11 flex items-center justify-center text-sm sm:text-base transition-all active:scale-95 shadow`}
                                        >
                                            {index + 1}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Legend */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-text-disabled text-white flex items-center justify-center font-bold text-xs shadow flex-shrink-0">
                                        {questions.filter((_, i) => !visitedQuestions[i]).length}
                                    </div>
                                    <span className="text-xs sm:text-sm text-text-secondary">Not Visited</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs shadow flex-shrink-0">
                                        {Object.keys(markedForReview).filter(k => markedForReview[k]).length}
                                    </div>
                                    <span className="text-xs sm:text-sm text-text-secondary">Marked</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-accent-warm text-white flex items-center justify-center font-bold text-xs shadow flex-shrink-0">
                                        {Object.keys(visitedQuestions).length - Object.keys(answers).length}
                                    </div>
                                    <span className="text-xs sm:text-sm text-text-secondary">Not Answered</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-success text-white flex items-center justify-center font-bold text-xs shadow flex-shrink-0">
                                        {Object.keys(answers).filter(k => !markedForReview[k]).length}
                                    </div>
                                    <span className="text-xs sm:text-sm text-text-secondary">Answered</span>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Desktop View - Professional Layout */}
            <div className="hidden lg:block h-screen overflow-hidden bg-bg-body">
                {/* Top Navigation Bar */}
                <div className="bg-gradient-to-r from-primary via-secondary to-accent-warm text-white px-8 py-3 flex items-center justify-between shadow-lg">
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-bold tracking-wide">{formData.topic.toUpperCase()}</h1>
                        {/* Security Warnings Badge */}
                        {(fullscreenWarnings > 0 || tabSwitchWarnings > 0) && (
                            <div className="flex items-center gap-2 px-3 py-1 bg-red-500/90 rounded-full text-xs font-semibold animate-pulse">
                                <span>⚠️</span>
                                <span>{fullscreenWarnings + tabSwitchWarnings} Security Warnings</span>
                            </div>
                        )}
                    </div>
                    <div className="text-right text-sm">
                        <div>Username : <span className="font-semibold">{user?.email?.split('@')[0] || 'Guest'}</span></div>
                        <div>Subject : <span className="font-semibold">{formData.topic}</span></div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-[1fr_380px] h-[calc(100vh-140px)]">
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
                                    <div className="bg-bg-card border border-border-subtle rounded p-3 mb-4 shadow-sm">
                                        <div className="flex items-center justify-between">
                                            <div className="text-sm text-text-secondary">Question: <span className="font-bold text-text-primary">{currentQuestion + 1}</span></div>
                                            <div className="text-sm text-text-secondary">Marks: <span className="font-bold text-text-primary">1</span></div>
                                        </div>
                                    </div>

                                    {/* Question Content */}
                                    <div className="bg-bg-card border border-border-subtle rounded p-5 mb-5 shadow-sm">
                                        <div className="prose prose-base max-w-none text-text-primary dark:prose-invert">
                                            <ReactMarkdown components={components}>
                                                {questions[currentQuestion]?.question}
                                            </ReactMarkdown>
                                        </div>
                                    </div>

                                    {/* Options */}
                                    <div className="space-y-3">
                                        {questions[currentQuestion]?.options?.map((option, optionIndex) => (
                                            <motion.label
                                                key={optionIndex}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: optionIndex * 0.05 }}
                                                className={`flex items-start gap-3 bg-bg-card border rounded p-4 cursor-pointer transition-all shadow-sm hover:shadow-md hover:border-primary/50 ${answers[currentQuestion] === optionIndex
                                                    ? 'border-primary bg-primary/10 ring-2 ring-primary/30'
                                                    : 'border-border-subtle'
                                                    }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name={`question-${currentQuestion}`}
                                                    checked={answers[currentQuestion] === optionIndex}
                                                    onChange={() => handleAnswerSelect(currentQuestion, optionIndex)}
                                                    className="mt-1 w-4 h-4 accent-primary"
                                                />
                                                <div className="flex-1">
                                                    <div className="mb-1">
                                                        <span className="font-bold text-text-primary text-base">
                                                            {String.fromCharCode(65 + optionIndex)}.
                                                        </span>
                                                    </div>
                                                    <div className="prose prose-sm max-w-none text-text-secondary dark:prose-invert">
                                                        <ReactMarkdown components={components}>
                                                            {option}
                                                        </ReactMarkdown>
                                                    </div>
                                                </div>
                                            </motion.label>
                                        ))}
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Right Side - Timer, Navigator, and Legend */}
                    <div className="bg-bg-card border-l-2 border-border-subtle overflow-y-auto custom-scrollbar">
                        <div className="p-5">
                            {/* Timer Card */}
                            <div className="bg-bg-elevated border border-border-subtle rounded p-4 mb-5 text-center shadow-sm">
                                <div className="text-xs text-text-muted mb-2 font-medium">Remaining Time:</div>
                                <div className={`text-3xl font-bold font-mono tracking-wider ${timeLeft < 300 ? 'text-danger' : 'text-text-primary'
                                    }`}>
                                    {Math.floor(timeLeft / 3600).toString().padStart(2, '0')} : {Math.floor((timeLeft % 3600) / 60).toString().padStart(2, '0')} : {(timeLeft % 60).toString().padStart(2, '0')}
                                </div>
                            </div>

                            {/* Quiz Title */}
                            <div className="text-center mb-5">
                                <h2 className="text-lg font-bold text-text-primary">{formData.topic.toUpperCase()}</h2>
                            </div>

                            {/* Question Navigator */}
                            <div className="mb-5">
                                <div className="grid grid-cols-5 gap-2">
                                    {questions.map((_, index) => {
                                        const isAnswered = answers[index] !== undefined;
                                        const isCurrent = index === currentQuestion;
                                        const isMarked = markedForReview[index];
                                        const isVisited = visitedQuestions[index];

                                        let bgColor = 'bg-text-disabled'; // Not Visited
                                        if (isCurrent) {
                                            bgColor = 'bg-primary'; // Current
                                        } else if (isMarked) {
                                            bgColor = 'bg-purple-600'; // Marked for review
                                        } else if (isAnswered) {
                                            bgColor = 'bg-success'; // Answered
                                        } else if (isVisited) {
                                            bgColor = 'bg-accent-warm'; // Visited but not answered
                                        }

                                        return (
                                            <button
                                                key={index}
                                                onClick={() => setCurrentQuestion(index)}
                                                className={`${bgColor} text-white font-bold rounded h-11 flex items-center justify-center text-base transition-all hover:opacity-90 shadow`}
                                            >
                                                {index + 1}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Legend */}
                            <div className="space-y-2.5">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-9 h-9 rounded-full bg-text-disabled text-white flex items-center justify-center font-bold text-xs shadow">
                                        {questions.filter((_, i) => !visitedQuestions[i]).length}
                                    </div>
                                    <span className="text-sm text-text-secondary">Not Visited</span>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <div className="w-9 h-9 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs shadow">
                                        {Object.keys(markedForReview).filter(k => markedForReview[k]).length}
                                    </div>
                                    <span className="text-sm text-text-secondary">Marked For Review</span>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <div className="w-9 h-9 rounded-full bg-accent-warm text-white flex items-center justify-center font-bold text-xs shadow">
                                        {Object.keys(visitedQuestions).length - Object.keys(answers).length}
                                    </div>
                                    <span className="text-sm text-text-secondary">Not Answered</span>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <div className="w-9 h-9 rounded-full bg-success text-white flex items-center justify-center font-bold text-xs shadow">
                                        {Object.keys(answers).filter(k => !markedForReview[k]).length}
                                    </div>
                                    <span className="text-sm text-text-secondary">Answered</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Navigation Bar */}
                <div className="h-[60px] bg-bg-card border-t-2 border-border-subtle px-8 flex items-center justify-between shadow-lg">
                    <Button
                        onClick={() => setCurrentQuestion(0)}
                        className="bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded font-medium flex items-center gap-2 shadow transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Back
                    </Button>

                    <div className="flex items-center gap-3">
                        <Button
                            onClick={handleMarkForReview}
                            className={`${markedForReview[currentQuestion] ? 'bg-purple-600 hover:bg-purple-700' : 'bg-secondary hover:bg-secondary-hover'} text-white px-5 py-2.5 rounded font-medium shadow flex items-center gap-2 transition-colors`}
                        >
                            {markedForReview[currentQuestion] ? '✓ Marked' : 'Mark For Review'} ⚑
                        </Button>
                        <Button
                            onClick={() => setCurrentQuestion(prev => Math.min(questions.length - 1, prev + 1))}
                            disabled={currentQuestion === questions.length - 1}
                            className="bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded font-medium flex items-center gap-2 shadow disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Next
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>

                    <Button
                        onClick={confirmSubmit}
                        disabled={loading}
                        className="bg-success hover:bg-green-700 text-white px-6 py-2.5 rounded font-medium flex items-center gap-2 shadow transition-colors"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Submitting
                            </>
                        ) : (
                            <>
                                ✓ Submit Quiz
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Enhanced Navigation - Mobile Only */}
            <div className="lg:hidden space-y-4">
                {/* Mark for Review Button - Above mobile sticky bar */}
                <div className="sm:hidden fixed bottom-20 left-1/2 -translate-x-1/2 z-40">
                    <button
                        onClick={handleMarkForReview}
                        className={`${markedForReview[currentQuestion] ? 'bg-purple-600' : 'bg-secondary'} text-white px-5 py-2.5 rounded-full font-medium shadow-lg flex items-center gap-2 transition-all active:scale-95`}
                    >
                        {markedForReview[currentQuestion] ? '✓ Marked' : 'Mark For Review'} ⚑
                    </button>
                </div>

                {/* Mobile sticky action bar - Fully Responsive */}
                <div className="sm:hidden">
                    <div className="fixed bottom-0 left-0 right-0 z-40 bg-bg-card">
                        <div className="mx-4 mb-[env(safe-area-inset-bottom,16px)] rounded-t-3xl flex items-center justify-between gap-3 px-4 py-3 shadow-[0_-10px_30px_rgba(0,0,0,0.45)]">
                            {/* Prev Button */}
                            <button
                                onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                                disabled={currentQuestion === 0}
                                className={`flex-1 flex items-center justify-center gap-2 rounded-2xl py-2.5 font-semibold text-sm transition-all ${currentQuestion === 0
                                    ? 'bg-bg-elevated-alt text-text-muted opacity-50 cursor-not-allowed'
                                    : 'bg-bg-elevated-alt text-text-secondary active:scale-95'
                                    }`}
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Prev
                            </button>

                            {/* Time Chip */}
                            <div className="px-3 py-1 rounded-full bg-bg-body text-xs text-text-muted flex items-center justify-center whitespace-nowrap">
                                <Clock className="w-3 h-3 mr-1" />
                                {formatTime(timeLeft)}
                            </div>

                            {/* Next/Submit Button */}
                            {currentQuestion === questions.length - 1 ? (
                                <button
                                    onClick={confirmSubmit}
                                    disabled={loading}
                                    className="flex-1 flex items-center justify-center gap-2 rounded-2xl py-2.5 font-semibold text-sm text-white transition-all active:scale-95 bg-gradient-to-r from-success to-green-600"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Submitting
                                        </>
                                    ) : (
                                        <>
                                            Submit
                                            <CheckCircle className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            ) : (
                                <button
                                    onClick={() => setCurrentQuestion(prev => Math.min(questions.length - 1, prev + 1))}
                                    disabled={currentQuestion === questions.length - 1}
                                    className="flex-1 flex items-center justify-center gap-2 rounded-2xl py-2.5 font-semibold text-sm text-white transition-all active:scale-95 bg-gradient-primary-button"
                                >
                                    Next
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderResults = () => {
        const getPerformanceLevel = (score) => {
            if (score >= 90) return { level: 'Excellent', color: 'text-success', bgColor: 'bg-success/10', borderColor: 'border-success' };
            if (score >= 75) return { level: 'Good', color: 'text-secondary', bgColor: 'bg-secondary/10', borderColor: 'border-secondary' };
            if (score >= 60) return { level: 'Average', color: 'text-warning', bgColor: 'bg-warning/10', borderColor: 'border-warning' };
            return { level: 'Needs Improvement', color: 'text-danger', bgColor: 'bg-danger/10', borderColor: 'border-danger' };
        };

        const performance = results ? getPerformanceLevel(results.score) : null;

        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-7xl mx-auto space-y-6"
            >
                {/* Summary Card */}
                <Card className="p-6 sm:p-8 bg-gradient-to-br from-bg-card to-bg-elevated border border-border-subtle shadow-xl">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-success to-secondary rounded-full mb-4 shadow-lg shadow-success/30">
                            <Award className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
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
                            <div className="bg-bg-body rounded-xl p-4 sm:p-6 shadow-md border border-border-subtle hover:border-secondary transition-colors">
                                <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-secondary/20 rounded-full mx-auto mb-3">
                                    <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-secondary" />
                                </div>
                                <h3 className="text-xs sm:text-sm font-medium text-text-muted mb-1 text-center">Score</h3>
                                <p className="text-2xl sm:text-3xl font-bold text-secondary text-center">
                                    {results.score}%
                                </p>
                            </div>

                            <div className="bg-bg-body rounded-xl p-4 sm:p-6 shadow-md border border-border-subtle hover:border-success transition-colors">
                                <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-success/20 rounded-full mx-auto mb-3">
                                    <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-success" />
                                </div>
                                <h3 className="text-xs sm:text-sm font-medium text-text-muted mb-1 text-center">Correct</h3>
                                <p className="text-2xl sm:text-3xl font-bold text-success text-center">
                                    {results.correctAnswers}/{results.totalQuestions}
                                </p>
                            </div>

                            <div className="bg-bg-body rounded-xl p-4 sm:p-6 shadow-md border border-border-subtle hover:border-danger transition-colors">
                                <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-danger/20 rounded-full mx-auto mb-3">
                                    <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-danger" />
                                </div>
                                <h3 className="text-xs sm:text-sm font-medium text-text-muted mb-1 text-center">Wrong</h3>
                                <p className="text-2xl sm:text-3xl font-bold text-danger text-center">
                                    {results.totalQuestions - results.correctAnswers}
                                </p>
                            </div>

                            <div className="bg-bg-body rounded-xl p-4 sm:p-6 shadow-md border border-border-subtle hover:border-primary transition-colors">
                                <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-primary/20 rounded-full mx-auto mb-3">
                                    <Timer className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                                </div>
                                <h3 className="text-xs sm:text-sm font-medium text-text-muted mb-1 text-center">Time</h3>
                                <p className="text-2xl sm:text-3xl font-bold text-primary text-center">
                                    {formatTime(results.timeSpent || 0)}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Security Warnings */}
                    {(fullscreenWarnings > 0 || tabSwitchWarnings > 0) && (
                        <div className="bg-danger/10 rounded-xl p-4 sm:p-6 mb-6 border border-danger/30">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-xl sm:text-2xl">⚠️</span>
                                <h3 className="text-base sm:text-lg font-semibold text-danger">
                                    Security Warnings Detected
                                </h3>
                            </div>
                            <div className="text-sm sm:text-base text-text-secondary space-y-1">
                                {fullscreenWarnings > 0 && (
                                    <p>• Fullscreen exits: <span className="font-bold text-danger">{fullscreenWarnings}</span></p>
                                )}
                                {tabSwitchWarnings > 0 && (
                                    <p>• Tab/window switches: <span className="font-bold text-danger">{tabSwitchWarnings}</span></p>
                                )}
                                <p className="text-xs sm:text-sm text-text-muted mt-2">
                                    These violations have been recorded and may affect the validity of your test results.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* AI Disclaimer */}
                    <div className="bg-gradient-to-r from-warning/10 to-accent-warm/10 border border-warning/30 rounded-xl p-4 sm:p-5 mb-6 shadow-md">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <h4 className="text-sm sm:text-base font-semibold text-warning mb-1">AI-Generated Results Disclaimer</h4>
                                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
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
                            className="bg-gradient-to-r from-primary to-secondary hover:from-primary-hover hover:to-secondary-hover text-white px-6 py-3 rounded-lg font-medium shadow-lg transition-all"
                        >
                            {showDetailedResults ? '📊 Hide' : '📋 View'} Detailed Results & Solutions
                        </Button>
                    </div>

                    {/* Email Notification */}
                    <div className="bg-primary/10 rounded-xl p-4 sm:p-6 mb-6 border border-primary/30">
                        <div className="flex items-center gap-2 mb-2">
                            <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                            <h3 className="text-sm sm:text-base font-semibold text-text-primary">
                                Detailed Report Sent
                            </h3>
                        </div>
                        <p className="text-xs sm:text-sm text-text-secondary">
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
                            className="bg-bg-elevated hover:bg-bg-elevated-alt text-text-primary border border-border-subtle px-6 py-3 rounded-lg font-medium transition-all"
                        >
                            🔄 Take Another Test
                        </Button>
                        <Button
                            onClick={() => window.location.href = '/dashboard'}
                            className="bg-gradient-to-r from-secondary to-primary hover:from-secondary-hover hover:to-primary-hover text-white px-6 py-3 rounded-lg font-medium shadow-lg transition-all"
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
                        <Card className="p-4 sm:p-6 bg-bg-card border border-border-subtle">
                            <h3 className="text-xl sm:text-2xl font-bold text-text-primary mb-4 flex items-center gap-2">
                                <Brain className="w-6 h-6 text-secondary" />
                                Question-wise Analysis
                            </h3>

                            {/* AI Disclaimer for detailed results */}
                            <div className="bg-gradient-to-r from-warning/10 to-accent-warm/10 border border-warning/30 rounded-xl p-4 mb-6">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                        <h4 className="text-sm font-semibold text-warning mb-1">AI-Generated Content</h4>
                                        <p className="text-xs text-text-secondary leading-relaxed">
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
                                            className={`rounded-xl border-2 overflow-hidden ${isCorrect ? 'border-success bg-success/5' :
                                                wasAttempted ? 'border-danger bg-danger/5' : 'border-warning bg-warning/5'
                                                }`}
                                        >
                                            {/* Question Header */}
                                            <div className={`px-4 sm:px-6 py-3 flex items-center justify-between ${isCorrect ? 'bg-success/10' :
                                                wasAttempted ? 'bg-danger/10' : 'bg-warning/10'
                                                }`}>
                                                <div className="flex items-center gap-3">
                                                    <span className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-white ${isCorrect ? 'bg-success' :
                                                        wasAttempted ? 'bg-danger' : 'bg-warning'
                                                        }`}>
                                                        {index + 1}
                                                    </span>
                                                    <span className={`text-sm sm:text-base font-semibold ${isCorrect ? 'text-success' :
                                                        wasAttempted ? 'text-danger' : 'text-warning'
                                                        }`}>
                                                        {isCorrect ? '✓ Correct' : wasAttempted ? '✗ Wrong' : '⊘ Not Attempted'}
                                                    </span>
                                                </div>
                                                {markedForReview[index] && (
                                                    <span className="text-xs sm:text-sm px-2 py-1 bg-purple-600/20 text-purple-400 rounded-full border border-purple-600/30">
                                                        ⚑ Marked
                                                    </span>
                                                )}
                                            </div>

                                            {/* Question Content */}
                                            <div className="p-4 sm:p-6 space-y-4">
                                                <div className="bg-bg-elevated rounded-lg p-4 border border-border-subtle">
                                                    <h4 className="text-xs sm:text-sm font-medium text-text-muted mb-2">Question:</h4>
                                                    <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-text-primary">
                                                        <ReactMarkdown components={components}>
                                                            {q.question}
                                                        </ReactMarkdown>
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
                                                                className={`p-3 sm:p-4 rounded-lg border-2 ${isCorrectAnswer ? 'border-success bg-success/10' :
                                                                    isUserAnswer ? 'border-danger bg-danger/10' :
                                                                        'border-border-subtle bg-bg-elevated'
                                                                    }`}
                                                            >
                                                                <div className="flex items-start gap-3">
                                                                    <span className={`flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm ${isCorrectAnswer ? 'bg-success text-white' :
                                                                        isUserAnswer ? 'bg-danger text-white' :
                                                                            'bg-bg-body text-text-muted border border-border-subtle'
                                                                        }`}>
                                                                        {String.fromCharCode(65 + optIndex)}
                                                                    </span>
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="prose prose-sm dark:prose-invert max-w-none text-text-secondary">
                                                                            <ReactMarkdown components={components}>
                                                                                {option}
                                                                            </ReactMarkdown>
                                                                        </div>
                                                                        {isCorrectAnswer && (
                                                                            <span className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-success mt-1">
                                                                                <CheckCircle className="w-4 h-4" />
                                                                                Correct Answer
                                                                            </span>
                                                                        )}
                                                                        {isUserAnswer && !isCorrectAnswer && (
                                                                            <span className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-danger mt-1">
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
                                                    <div className="bg-primary/10 rounded-lg p-4 border border-primary/30">
                                                        <h4 className="text-sm sm:text-base font-semibold text-primary mb-2 flex items-center gap-2">
                                                            <Brain className="w-4 h-4" />
                                                            Explanation
                                                        </h4>
                                                        <div className="prose prose-sm dark:prose-invert max-w-none text-text-secondary">
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
                            <Card className="p-4 sm:p-6 bg-gradient-to-br from-bg-card to-bg-elevated border border-border-subtle">
                                <h3 className="text-xl sm:text-2xl font-bold text-text-primary mb-4 flex items-center gap-2">
                                    <Settings className="w-6 h-6 text-accent-warm" />
                                    Personalized Recommendations
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Strengths */}
                                    {results.score >= 60 && (
                                        <div className="bg-success/10 rounded-xl p-4 border border-success/30">
                                            <h4 className="text-base sm:text-lg font-semibold text-success mb-3 flex items-center gap-2">
                                                <CheckCircle className="w-5 h-5" />
                                                Strengths
                                            </h4>
                                            <ul className="space-y-2 text-sm sm:text-base text-text-secondary">
                                                <li className="flex items-start gap-2">
                                                    <span className="text-success mt-1">•</span>
                                                    <span>Good understanding of {formData.topic} fundamentals</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="text-success mt-1">•</span>
                                                    <span>Completed test within time limit</span>
                                                </li>
                                                {results.score >= 80 && (
                                                    <li className="flex items-start gap-2">
                                                        <span className="text-success mt-1">•</span>
                                                        <span>Strong performance indicates readiness for advanced topics</span>
                                                    </li>
                                                )}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Areas for Improvement */}
                                    <div className="bg-accent-warm/10 rounded-xl p-4 border border-accent-warm/30">
                                        <h4 className="text-base sm:text-lg font-semibold text-accent-warm mb-3 flex items-center gap-2">
                                            <Brain className="w-5 h-5" />
                                            Focus Areas
                                        </h4>
                                        <ul className="space-y-2 text-sm sm:text-base text-text-secondary">
                                            {results.score < 60 && (
                                                <li className="flex items-start gap-2">
                                                    <span className="text-accent-warm mt-1">•</span>
                                                    <span>Review core concepts of {formData.topic}</span>
                                                </li>
                                            )}
                                            {results.totalQuestions - results.correctAnswers > 0 && (
                                                <li className="flex items-start gap-2">
                                                    <span className="text-accent-warm mt-1">•</span>
                                                    <span>Study the explanations for {results.totalQuestions - results.correctAnswers} incorrect answers</span>
                                                </li>
                                            )}
                                            <li className="flex items-start gap-2">
                                                <span className="text-accent-warm mt-1">•</span>
                                                <span>Practice more {formData.experience} level questions</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-accent-warm mt-1">•</span>
                                                <span>Review marked questions to clarify doubts</span>
                                            </li>
                                        </ul>
                                    </div>

                                    {/* Next Steps */}
                                    <div className="bg-secondary/10 rounded-xl p-4 border border-secondary/30">
                                        <h4 className="text-base sm:text-lg font-semibold text-secondary mb-3 flex items-center gap-2">
                                            <ChevronRight className="w-5 h-5" />
                                            Next Steps
                                        </h4>
                                        <ul className="space-y-2 text-sm sm:text-base text-text-secondary">
                                            <li className="flex items-start gap-2">
                                                <span className="text-secondary mt-1">•</span>
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
                                        <ul className="space-y-2 text-sm sm:text-base text-text-secondary">
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

    // During test on desktop, render fullscreen layout without container
    if (currentStep === 'test' && window.innerWidth >= 1024) {
        return renderTest();
    }

    return (
        <div className="min-h-screen w-full overflow-x-hidden bg-bg-body">
            <div className="container mx-auto px-4 pb-4 pt-4">
                {/* Content based on current step */}
                {currentStep === 'setup' && renderSetupForm()}
                {currentStep === 'test' && renderTest()}
                {currentStep === 'results' && renderResults()}
            </div>

            {/* Submit Confirmation Modal */}
            {showSubmitConfirmation && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gradient-to-br from-[#1a2332] to-[#141b28] rounded-2xl shadow-2xl border border-primary/30 w-full max-w-md p-6"
                    >
                        <div className="flex items-start gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                                <AlertTriangle className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-white mb-2">Submit Test?</h3>
                                <div className="text-gray-400 text-sm space-y-2">
                                    <p>Are you sure you want to submit your test?</p>
                                    <div className="bg-white/5 rounded-lg p-3 border border-white/10 mt-3">
                                        <div className="flex items-center justify-between text-sm mb-2">
                                            <span className="text-gray-400">Answered:</span>
                                            <span className="text-white font-semibold">{Object.keys(answers).length} / {questions.length}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm mb-2">
                                            <span className="text-gray-400">Unanswered:</span>
                                            <span className="text-yellow-400 font-semibold">{questions.length - Object.keys(answers).length}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-400">Time Remaining:</span>
                                            <span className={`font-semibold ${timeLeft < 300 ? 'text-red-400' : 'text-primary'}`}>{formatTime(timeLeft)}</span>
                                        </div>
                                    </div>
                                    {(fullscreenWarnings > 0 || tabSwitchWarnings > 0) && (
                                        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mt-3">
                                            <p className="text-yellow-400 text-xs font-semibold flex items-center gap-2">
                                                <AlertTriangle className="w-4 h-4" />
                                                Security Warnings: {fullscreenWarnings + tabSwitchWarnings}
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
                                onClick={() => setShowSubmitConfirmation(false)}
                                variant="outline"
                                className="flex-1 bg-white/5 border-white/10 hover:bg-white/10 text-white"
                                disabled={loading}
                            >
                                Continue Test
                            </Button>
                            <Button
                                onClick={() => {
                                    setShowSubmitConfirmation(false);
                                    handleSubmitTest();
                                }}
                                className="flex-1 bg-gradient-to-r from-success to-green-600 hover:opacity-90 text-white"
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
                                        Submit Test
                                    </>
                                )}
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default MCQTest;

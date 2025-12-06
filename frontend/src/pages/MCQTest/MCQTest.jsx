import React, { useState, useEffect, useContext, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { UserContext } from '../../context/UserContext';
import { API } from '../../utils/apiPaths';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Clock, CheckCircle, XCircle, Award, Mail, Brain, Timer, BookOpen, Settings, ChevronLeft, ChevronRight, Code, Copy } from 'lucide-react';

const MCQTest = () => {
    const { user } = useContext(UserContext);
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
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [timeLeft, setTimeLeft] = useState(1800); // Default 30 minutes
    const [testStartTime, setTestStartTime] = useState(null);
    const [testEndTime, setTestEndTime] = useState(null);
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [availableTopics] = useState([
        'JavaScript', 'React', 'Node.js', 'Python', 'Java', 'C++', 'Database',
        'System Design', 'Data Structures', 'Algorithms', 'Machine Learning',
        'DevOps', 'Cloud Computing', 'Cybersecurity', 'Frontend Development',
        'Backend Development'
    ]);

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
                    <div className="relative group my-4 bg-gray-900 rounded-lg border border-gray-700 shadow-lg overflow-hidden">
                        <div className="flex items-center justify-between bg-gray-800 text-gray-300 px-3 sm:px-4 py-2.5 border-b border-gray-700">
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
                                className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs transition-colors opacity-0 group-hover:opacity-100 font-medium"
                                title="Copy code"
                            >
                                <Copy className="w-3 h-3" />
                                Copy
                            </button>
                        </div>
                        <div className="overflow-x-auto bg-gray-900">
                            <SyntaxHighlighter
                                style={tomorrow}
                                language={language || 'text'}
                                PreTag="div"
                                className="!mt-0 !rounded-none !bg-gray-900"
                                customStyle={{
                                    margin: 0,
                                    padding: '1rem 1.5rem',
                                    fontSize: '0.875rem',
                                    lineHeight: '1.6',
                                    backgroundColor: '#111827', // gray-900
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
                <code className="bg-gray-800 text-gray-200 px-2 py-1 rounded text-sm font-mono border border-gray-600" {...props}>
                    {cleanCode}
                </code>
            );
        },
        pre({ children }) {
            return <div className="overflow-x-auto rounded-lg">{children}</div>;
        },
        p({ children }) {
            return <p className="mb-3 last:mb-0 leading-relaxed text-gray-700 dark:text-gray-300">{children}</p>;
        },
        ul({ children }) {
            return <ul className="list-disc list-inside mb-4 space-y-2 text-gray-700 dark:text-gray-300 pl-2">{children}</ul>;
        },
        ol({ children }) {
            return <ol className="list-decimal list-inside mb-4 space-y-2 text-gray-700 dark:text-gray-300 pl-2">{children}</ol>;
        },
        li({ children }) {
            return <li className="leading-relaxed">{children}</li>;
        },
        blockquote({ children }) {
            return (
                <blockquote className="border-l-4 border-orange-500 pl-4 py-3 my-4 bg-orange-50 dark:bg-orange-900/20 rounded-r-lg">
                    <div className="text-gray-700 dark:text-gray-300 italic">
                        {children}
                    </div>
                </blockquote>
            );
        },
        h1({ children }) {
            return <h1 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">{children}</h1>;
        },
        h2({ children }) {
            return <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">{children}</h2>;
        },
        h3({ children }) {
            return <h3 className="text-base font-medium mb-2 text-gray-900 dark:text-white">{children}</h3>;
        },
        strong({ children }) {
            return <strong className="font-semibold text-gray-900 dark:text-white">{children}</strong>;
        },
        em({ children }) {
            return <em className="italic text-gray-700 dark:text-gray-300">{children}</em>;
        },
        table({ children }) {
            return (
                <div className="overflow-x-auto my-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <table className="min-w-full bg-white dark:bg-gray-800">
                        {children}
                    </table>
                </div>
            );
        },
        th({ children }) {
            return (
                <th className="border-b border-gray-200 dark:border-gray-600 px-4 py-3 bg-gray-50 dark:bg-gray-700 font-semibold text-left text-gray-900 dark:text-white text-sm">
                    {children}
                </th>
            );
        },
        td({ children }) {
            return (
                <td className="border-b border-gray-200 dark:border-gray-600 px-4 py-3 text-gray-700 dark:text-gray-300 text-sm">
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
    }, [currentStep, timeLeft]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleStartTest = async () => {
        if (!formData.topic.trim()) {
            toast.error('Please enter a topic for the test');
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
                toast.success(`Test started! You have ${Math.ceil(formData.numberOfQuestions * 2)} minutes to complete.`);
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

    const handleSubmitTest = useCallback(async () => {
        if (Object.keys(answers).length === 0) {
            toast.error('Please answer at least one question before submitting');
            return;
        }

        setLoading(true);
        const endTime = new Date();
        setTestEndTime(endTime);

        // Calculate actual time spent in seconds
        const actualTimeSpent = testStartTime ? Math.floor((endTime - testStartTime) / 1000) : (formData.numberOfQuestions * 120) - timeLeft;

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
                timeSpent: actualTimeSpent
            };

            const response = await axiosInstance.post(API.MCQ.SUBMIT, submissionData);

            if (response.data.success) {
                setResults({
                    ...response.data.data.results,
                    timeSpent: actualTimeSpent
                });
                setCurrentStep('results');
                toast.success('Test submitted successfully! Results sent to your email.');
            }
        } catch (error) {
            console.error('Error submitting test:', error);
            toast.error(error.response?.data?.message || 'Failed to submit test');
        } finally {
            setLoading(false);
        }
    }, [answers, testStartTime, formData, timeLeft, user, questionsWithAnswers]);

    const renderSetupForm = () => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto px-4 sm:px-6"
        >
            <Card className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-900 border-0 shadow-xl">
                <div className="text-center mb-6 sm:mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
                        <Brain className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </div>
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                        MCQ Test Setup
                    </h2>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                        Configure your personalized test with AI-generated questions
                    </p>
                </div>

                <div className="space-y-4 sm:space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Test Topic *
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={formData.topic}
                                onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
                                placeholder="e.g., React Hooks, System Design, Data Structures..."
                                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white transition-all duration-200"
                                list="topics"
                            />
                            <datalist id="topics">
                                {availableTopics.map(topic => (
                                    <option key={topic} value={topic} />
                                ))}
                            </datalist>
                            <BookOpen className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Experience Level
                            </label>
                            <select
                                value={formData.experience}
                                onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white"
                            >
                                <option value="beginner">Beginner (0-1 years)</option>
                                <option value="intermediate">Intermediate (1-3 years)</option>
                                <option value="advanced">Advanced (3-5 years)</option>
                                <option value="expert">Expert (5+ years)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Number of Questions
                            </label>
                            <select
                                value={formData.numberOfQuestions}
                                onChange={(e) => {
                                    const numQuestions = parseInt(e.target.value);
                                    setFormData(prev => ({ ...prev, numberOfQuestions: numQuestions }));
                                    setTimeLeft(numQuestions * 120); // 2 minutes per question
                                }}
                                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white"
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
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Specialization (Optional)
                        </label>
                        <input
                            type="text"
                            value={formData.specialization}
                            onChange={(e) => setFormData(prev => ({ ...prev, specialization: e.target.value }))}
                            placeholder="e.g., Frontend Development, Machine Learning..."
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white"
                        />
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                        <div className="flex items-start space-x-3">
                            <Timer className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                            <div>
                                <h4 className="font-medium text-blue-900 dark:text-blue-100">Test Information</h4>
                                <ul className="text-sm text-blue-700 dark:text-blue-300 mt-1 space-y-1">
                                    <li>• {formData.numberOfQuestions} unique questions generated by AI</li>
                                    <li>• {Math.ceil(formData.numberOfQuestions * 2)} minutes time limit</li>
                                    <li>• Instant AI evaluation and feedback</li>
                                    <li>• Detailed results sent to your email</li>
                                    <li>• ✨ Every test generates completely unique questions</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <Button
                        onClick={handleStartTest}
                        disabled={loading || !formData.topic.trim()}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 font-medium"
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
                </div>
            </Card>
        </motion.div>
    );

    const renderTest = () => (
        <div className="max-w-4xl mx-auto">
            {/* Header with timer and progress */}
            <Card className="p-4 mb-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 border-0">
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <Clock className="w-5 h-5 text-blue-600" />
                            <span className={`font-mono text-lg font-bold ${timeLeft < 300 ? 'text-red-600' : 'text-blue-600'}`}>
                                {formatTime(timeLeft)}
                            </span>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            Question {currentQuestion + 1} of {questions.length}
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Progress:</span>
                        <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                            />
                        </div>
                    </div>
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
                    <Card className="p-6 lg:p-8 mb-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-xl">
                        <div className="mb-6">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6 gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full text-sm font-medium">
                                            Question {currentQuestion + 1} of {questions.length}
                                        </span>
                                        <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                                            <Clock className="w-4 h-4" />
                                            <span>{formatTime(timeLeft)}</span>
                                        </div>
                                        {containsCode(questions[currentQuestion]?.question) && (
                                            <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-xs font-medium flex items-center gap-1">
                                                <Code className="w-3 h-3" />
                                                Code Question
                                            </span>
                                        )}
                                    </div>

                                    {/* Enhanced Question Content Container */}
                                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 lg:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                                        <div className="prose prose-base dark:prose-invert max-w-none markdown-content [&_pre]:!bg-transparent [&_code]:!bg-transparent">
                                            <ReactMarkdown components={components}>
                                                {questions[currentQuestion]?.question}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                </div>

                                {/* Mobile-friendly progress indicator */}
                                <div className="w-full sm:w-auto">
                                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
                                        <span>Progress</span>
                                        <span>{Math.round(((currentQuestion + 1) / questions.length) * 100)}%</span>
                                    </div>
                                    <div className="w-full sm:w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                        <div
                                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500 ease-out"
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
                                        className={`group flex items-start p-4 lg:p-5 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${answers[currentQuestion] === optionIndex
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg shadow-blue-100 dark:shadow-blue-900/30'
                                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50'
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
                                            ? 'border-blue-500 bg-blue-500 shadow-md'
                                            : 'border-gray-300 dark:border-gray-500 group-hover:border-blue-400'
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
                                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                    {String.fromCharCode(65 + optionIndex)}.
                                                    {containsCode(option) && (
                                                        <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs flex items-center gap-1">
                                                            <Code className="w-3 h-3" />
                                                            Code
                                                        </span>
                                                    )}
                                                </span>
                                            </div>

                                            {/* Enhanced Option Content */}
                                            <div className={`prose prose-sm dark:prose-invert max-w-none ${containsCode(option)
                                                ? 'bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3'
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
                </motion.div>
            </AnimatePresence>

            {/* Enhanced Navigation */}
            <div className="space-y-4">
                {/* Question Grid - Mobile Responsive */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Question Navigator</h4>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            {Object.keys(answers).length}/{questions.length} answered
                        </span>
                    </div>
                    <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-15 gap-2">
                        {questions.map((_, index) => (
                            <motion.button
                                key={index}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setCurrentQuestion(index)}
                                className={`w-10 h-10 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center ${index === currentQuestion
                                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                                    : answers[index] !== undefined
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border border-green-300 dark:border-green-700'
                                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                            >
                                {answers[index] !== undefined && index !== currentQuestion && (
                                    <CheckCircle className="w-4 h-4" />
                                )}
                                {index === currentQuestion && (
                                    <span>{index + 1}</span>
                                )}
                                {answers[index] === undefined && index !== currentQuestion && (
                                    <span>{index + 1}</span>
                                )}
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Navigation Controls */}
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <Button
                        variant="outline"
                        onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                        disabled={currentQuestion === 0}
                        className="w-full sm:w-auto flex items-center gap-2"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                    </Button>

                    <div className="flex items-center gap-4">
                        <div className="text-center">
                            <div className="text-sm text-gray-500 dark:text-gray-400">Answered</div>
                            <div className="text-lg font-bold text-gray-900 dark:text-white">
                                {Object.keys(answers).length}/{questions.length}
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-sm text-gray-500 dark:text-gray-400">Time Left</div>
                            <div className={`text-lg font-bold ${timeLeft < 300 ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                                {formatTime(timeLeft)}
                            </div>
                        </div>
                    </div>

                    {currentQuestion === questions.length - 1 ? (
                        <Button
                            onClick={handleSubmitTest}
                            disabled={loading}
                            className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    Submit Test
                                    <CheckCircle className="w-4 h-4" />
                                </>
                            )}
                        </Button>
                    ) : (
                        <Button
                            onClick={() => setCurrentQuestion(prev => Math.min(questions.length - 1, prev + 1))}
                            disabled={currentQuestion === questions.length - 1}
                            className="w-full sm:w-auto flex items-center gap-2"
                        >
                            Next
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );

    const renderResults = () => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
        >
            <Card className="p-8 text-center bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 border-0 shadow-xl">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full mb-6">
                    <Award className="w-10 h-10 text-white" />
                </div>

                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    Test Completed!
                </h2>

                {results && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white dark:bg-gray-700 rounded-lg p-6 shadow-md">
                            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full mx-auto mb-3">
                                <CheckCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Score</h3>
                            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                {results.score}%
                            </p>
                        </div>

                        <div className="bg-white dark:bg-gray-700 rounded-lg p-6 shadow-md">
                            <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full mx-auto mb-3">
                                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Correct</h3>
                            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                                {results.correctAnswers}/{results.totalQuestions}
                            </p>
                        </div>

                        <div className="bg-white dark:bg-gray-700 rounded-lg p-6 shadow-md">
                            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full mx-auto mb-3">
                                <Timer className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Time</h3>
                            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                                {formatTime(results.timeSpent || 0)}
                            </p>
                        </div>
                    </div>
                )}

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 mb-8">
                    <div className="flex items-center justify-center space-x-2 mb-3">
                        <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                            Detailed Results Sent
                        </h3>
                    </div>
                    <p className="text-blue-700 dark:text-blue-300">
                        A comprehensive report with question-wise analysis, explanations, and improvement suggestions
                        has been sent to your email address.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                        onClick={() => {
                            setCurrentStep('setup');
                            setQuestions([]);
                            setAnswers({});
                            setCurrentQuestion(0);
                            setResults(null);
                            setFormData({ topic: '', experience: 'beginner', specialization: '', numberOfQuestions: 30 });
                        }}
                        variant="outline"
                        className="px-8"
                    >
                        Take Another Test
                    </Button>
                    <Button
                        onClick={() => window.location.href = '/dashboard'}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8"
                    >
                        Back to Dashboard
                    </Button>
                </div>
            </Card>
        </motion.div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4">
            <div className="container mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                        MCQ Test Platform
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        Challenge yourself with AI-generated multiple choice questions tailored to your expertise level
                    </p>
                </motion.div>

                {/* Content based on current step */}
                {currentStep === 'setup' && renderSetupForm()}
                {currentStep === 'test' && renderTest()}
                {currentStep === 'results' && renderResults()}
            </div>
        </div>
    );
};

export default MCQTest;

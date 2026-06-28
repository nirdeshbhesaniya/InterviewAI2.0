// src/pages/CodeExecution.jsx
import React, { useState, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Code, Terminal, Copy, Download, RotateCcw, Settings, ChevronDown } from 'lucide-react';
import { AILoaderIcon as Loader2 } from '@/components/ui/Loader';;
import { ButtonLoader } from '../../components/ui/Loader.jsx';
import { API } from '../../utils/apiPaths';
import axios from '../../utils/axiosInstance';
import { toast } from 'react-hot-toast';

// Language Icons as SVG components
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
    C: () => (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7v10l10 5 10-5V7L12 2z" fill="#A8B9CC" stroke="#283593" strokeWidth="1.5" />
            <path d="M16.5 13.5c-.2.8-.6 1.5-1.1 2s-1.2.9-2 1.1c-.8.2-1.6.2-2.4 0-.8-.2-1.5-.6-2-1.1-.5-.5-.9-1.2-1.1-2-.2-.8-.2-1.6 0-2.4.2-.8.6-1.5 1.1-2 .5-.5 1.2-.9 2-1.1.8-.2 1.6-.2 2.4 0 .6.1 1.2.4 1.7.7l-1.2 1.5c-.3-.2-.6-.3-.9-.4-.5-.1-1-.1-1.5 0-.3.1-.6.3-.9.5-.3.2-.5.5-.6.8-.1.3-.2.7 0 1.1.1.3.3.6.5.9.2.3.5.5.8.6.3.1.7.2 1.1 0 .3-.1.6-.3.9-.5.2-.2.4-.5.5-.8h2z" fill="#283593" />
        </svg>
    ),
    CPlusPlus: () => (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7v10l10 5 10-5V7L12 2z" fill="#00599C" stroke="#004482" strokeWidth="1.5" />
            <path d="M16.5 13.5c-.2.8-.6 1.5-1.1 2s-1.2.9-2 1.1c-.8.2-1.6.2-2.4 0-.8-.2-1.5-.6-2-1.1-.5-.5-.9-1.2-1.1-2-.2-.8-.2-1.6 0-2.4.2-.8.6-1.5 1.1-2 .5-.5 1.2-.9 2-1.1.8-.2 1.6-.2 2.4 0 .6.1 1.2.4 1.7.7l-1.2 1.5c-.3-.2-.6-.3-.9-.4-.5-.1-1-.1-1.5 0-.3.1-.6.3-.9.5-.3.2-.5.5-.6.8-.1.3-.2.7 0 1.1.1.3.3.6.5.9.2.3.5.5.8.6.3.1.7.2 1.1 0 .3-.1.6-.3.9-.5.2-.2.4-.5.5-.8h2z" fill="white" />
            <path d="M18 10.5h1v1h1v1h-1v1h-1v-1h-1v-1h1v-1zm3 0h1v1h1v1h-1v1h-1v-1h-1v-1h1v-1z" fill="#00599C" />
        </svg>
    ),
    Kotlin: () => (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
            <defs>
                <linearGradient id="kotlinGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#0095D5" />
                    <stop offset="30%" stopColor="#238AD9" />
                    <stop offset="60%" stopColor="#557BDE" />
                    <stop offset="100%" stopColor="#7F6CE2" />
                </linearGradient>
            </defs>
            <path d="M2 2L12 12L2 22V2z" fill="url(#kotlinGradient)" />
            <path d="M2 2L22 2L12 12L2 2z" fill="url(#kotlinGradient)" />
            <path d="M12 12L22 2V22L12 12z" fill="url(#kotlinGradient)" />
        </svg>
    )
};

const LANGUAGES = [
    {
        id: 63,
        name: 'JavaScript',
        sample: 'console.log("Hello, World!");\n\n// Write your JavaScript code here...\nfunction fibonacci(n) {\n    if (n <= 1) return n;\n    return fibonacci(n - 1) + fibonacci(n - 2);\n}\n\nconsole.log("Fibonacci(10):", fibonacci(10));',
        icon: 'JavaScript'
    },
    {
        id: 71,
        name: 'Python',
        sample: 'print("Hello, World!")\n\n# Write your Python code here...\ndef fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n - 1) + fibonacci(n - 2)\n\nprint(f"Fibonacci(10): {fibonacci(10)}")',
        icon: 'Python'
    },
    {
        id: 62,
        name: 'Java',
        sample: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n        \n        // Write your Java code here...\n        System.out.println("Fibonacci(10): " + fibonacci(10));\n    }\n    \n    static int fibonacci(int n) {\n        if (n <= 1) return n;\n        return fibonacci(n - 1) + fibonacci(n - 2);\n    }\n}',
        icon: 'Java'
    },
    {
        id: 50,
        name: 'C',
        sample: '#include <stdio.h>\n\nint fibonacci(int n) {\n    if (n <= 1) return n;\n    return fibonacci(n - 1) + fibonacci(n - 2);\n}\n\nint main() {\n    printf("Hello, World!\\n");\n    \n    // Write your C code here...\n    printf("Fibonacci(10): %d\\n", fibonacci(10));\n    return 0;\n}',
        icon: 'C'
    },
    {
        id: 54,
        name: 'C++',
        sample: '#include <iostream>\nusing namespace std;\n\nint fibonacci(int n) {\n    if (n <= 1) return n;\n    return fibonacci(n - 1) + fibonacci(n - 2);\n}\n\nint main() {\n    cout << "Hello, World!" << endl;\n    \n    // Write your C++ code here...\n    cout << "Fibonacci(10): " << fibonacci(10) << endl;\n    return 0;\n}',
        icon: 'CPlusPlus'
    },
    {
        id: 78,
        name: 'Kotlin',
        sample: 'fun fibonacci(n: Int): Int {\n    return if (n <= 1) n else fibonacci(n - 1) + fibonacci(n - 2)\n}\n\nfun main() {\n    println("Hello, World!")\n    \n    // Write your Kotlin code here...\n    println("Fibonacci(10): ${fibonacci(10)}")\n}',
        icon: 'Kotlin'
    },
];

// Heuristic to check if code likely requires input
const checkInputRequired = (code, languageName) => {
    const codeStr = code.toLowerCase();

    switch (languageName) {
        case 'Python':
            return codeStr.includes('input(');
        case 'JavaScript':
            return codeStr.includes('readline') || codeStr.includes('alert(') || codeStr.includes('prompt(') || codeStr.includes('process.stdin');
        case 'Java':
            return codeStr.includes('scanner') || codeStr.includes('bufferedreader') || codeStr.includes('system.in') || codeStr.includes('console.readline');
        case 'C':
            return codeStr.includes('scanf') || codeStr.includes('getchar') || codeStr.includes('gets') || codeStr.includes('fgets');
        case 'C++':
            return codeStr.includes('cin') || codeStr.includes('scanf') || codeStr.includes('getline');
        case 'Kotlin':
            return codeStr.includes('readline') || codeStr.includes('scanner');
        default:
            return false;
    }
};

const CodeExecution = () => {
    const [language, setLanguage] = useState(63);
    const [code, setCode] = useState(LANGUAGES.find(l => l.id === 63).sample);
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [loading, setLoading] = useState(false);
    const [fontSize, setFontSize] = useState(14);
    const [showSettings, setShowSettings] = useState(false);

    // Initialize theme based on system preference
    const [theme, setTheme] = useState(() => {
        // Check if user has a saved preference
        const savedTheme = localStorage.getItem('codeEditorTheme');
        if (savedTheme) return savedTheme;

        // Otherwise use system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        return prefersDark ? 'vs-dark' : 'light';
    });

    // Listen for system theme changes
    React.useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const handleThemeChange = (e) => {
            // Only auto-switch if user hasn't manually set a preference
            const savedTheme = localStorage.getItem('codeEditorTheme');
            if (!savedTheme) {
                setTheme(e.matches ? 'vs-dark' : 'light');
            }
        };

        mediaQuery.addEventListener('change', handleThemeChange);
        return () => mediaQuery.removeEventListener('change', handleThemeChange);
    }, []);

    // Save theme preference when changed manually
    const handleThemeChange = (newTheme) => {
        setTheme(newTheme);
        localStorage.setItem('codeEditorTheme', newTheme);
    };

    const runCode = useCallback(async () => {
        if (!code.trim()) {
            toast.error('Please write some code first!');
            return;
        }

        // Check if code expects input but input box is empty
        const needsInput = checkInputRequired(code, selectedLanguage.name);
        if (needsInput && !input.trim()) {
            toast.error('Your code looks like it expects input. Please provide input in the "Input (stdin)" box.', {
                duration: 5000,
                icon: '⚠️',
            });
            // Optional: return; to stop execution, or let them proceed. 
            // Given the EOFError complaint, stopping is better UX.
            return;
        }

        setLoading(true);
        setOutput('');

        try {
            const res = await axios.post(API.CODE.COMPILE, {
                source_code: code,
                language_id: language,
                stdin: input,
            });

            if (res.data.stderr) {
                setOutput(`❌ Compilation Error:\n${res.data.stderr}`);
                toast.error('Compilation error occurred');
            } else if (res.data.stdout) {
                setOutput(`✅ Output:\n${res.data.stdout}`);
                toast.success('Code executed successfully!');
            } else if (res.data.compile_output) {
                setOutput(`❌ Compilation Error:\n${res.data.compile_output}`);
                toast.error('Compilation failed');
            } else {
                setOutput('✅ Code executed successfully (no output)');
                toast.success('Code executed successfully!');
            }
        } catch (err) {
            console.error('Error executing code:', err);

            // More detailed error handling
            if (err.code === 'NETWORK_ERROR' || !err.response) {
                setOutput(`❌ Network Error:\nPlease check if the backend server is running on port 5000.\nMake sure to start the backend with: npm start`);
                toast.error('Backend server not available');
            } else if (err.response?.status === 404) {
                setOutput(`❌ API Error:\nCode execution service not found.\nThe /api/compile endpoint is not available.`);
                toast.error('Code execution service unavailable');
            } else if (err.response?.status === 500) {
                const serverError = err.response?.data?.message || 'Internal server error';
                setOutput(`❌ Server Error:\n${serverError}\n\nThis might be due to:\n• Invalid API key for Judge0\n• Server configuration issues\n• External service unavailable`);
                toast.error('Server error occurred');
            } else {
                const errorMsg = err.response?.data?.message || err.message || 'Failed to execute code. Please try again.';
                setOutput(`❌ Error:\n${errorMsg}`);
                toast.error('Execution failed');
            }
        } finally {
            setLoading(false);
        }
    }, [code, language, input]); const handleLanguageChange = useCallback((id) => {
        setLanguage(id);
        const selected = LANGUAGES.find(l => l.id === id);
        setCode(selected?.sample || '');
        setOutput('');
        toast.success(`Switched to ${selected?.name}`);
    }, []);

    const copyToClipboard = useCallback((text) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard!');
    }, []);

    const downloadCode = useCallback(() => {
        const selected = LANGUAGES.find(l => l.id === language);
        const extension = {
            'JavaScript': 'js',
            'Python': 'py',
            'Java': 'java',
            'C': 'c',
            'C++': 'cpp',
            'Kotlin': 'kt'
        }[selected?.name] || 'txt';

        const blob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `code.${extension}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Code downloaded!');
    }, [code, language]);

    const resetCode = useCallback(() => {
        const selected = LANGUAGES.find(l => l.id === language);
        setCode(selected?.sample || '');
        setOutput('');
        setInput('');
        toast.success('Code reset to template');
    }, [language]);

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    const selectedLanguage = LANGUAGES.find(l => l.id === language);

    // Re-check input requirement when code changes to show visual hint (optional, but good for UX - maybe later)


    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="min-h-screen bg-[rgb(var(--bg-body))] relative overflow-hidden flex flex-col"
        >
            {/* Immersive Background Glow */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[rgb(var(--accent))]/10 rounded-full blur-[100px] -z-10 pointer-events-none translate-x-1/3 -translate-y-1/3"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] -z-10 pointer-events-none -translate-x-1/3 translate-y-1/3"></div>
            
            <div className="flex-1 w-full max-w-[1920px] mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
                
                {/* 1. Immersive Header & Toolbar */}
                <motion.div
                    variants={itemVariants}
                    className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-[rgb(var(--bg-card))]/80 backdrop-blur-2xl p-5 sm:p-6 rounded-3xl shadow-xl border border-[rgb(var(--border-subtle))] relative z-10"
                >
                    <div className="flex items-center gap-5">
                        <div className="p-3.5 bg-gradient-to-br from-[rgb(var(--accent))] to-purple-600 rounded-2xl shadow-[0_0_20px_rgba(var(--accent),0.4)]">
                            <Code className="h-7 w-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[rgb(var(--text-primary))] to-[rgb(var(--accent))]">
                                Code Workspace
                            </h1>
                            <p className="text-[rgb(var(--text-secondary))] font-medium mt-1 text-sm sm:text-base">
                                Build, test, and execute in multiple languages
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                        {/* Language Selector */}
                        <div className="relative group">
                            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[rgb(var(--bg-elevated))]/60 border border-[rgb(var(--border-subtle))] group-hover:border-[rgb(var(--accent))]/50 group-hover:shadow-[0_0_15px_rgba(var(--accent),0.1)] transition-all cursor-pointer min-w-[200px]">
                                <Terminal className="h-5 w-5 text-[rgb(var(--text-muted))]" />
                                {LanguageIcons[selectedLanguage.icon] && React.createElement(LanguageIcons[selectedLanguage.icon])}
                                <span className="flex-1 font-semibold text-[rgb(var(--text-primary))]">{selectedLanguage.name}</span>
                                <ChevronDown className="h-4 w-4 text-[rgb(var(--text-muted))] group-hover:text-[rgb(var(--accent))] transition-colors" />
                            </div>
                            <select
                                className="absolute inset-0 w-full opacity-0 cursor-pointer"
                                value={language}
                                onChange={(e) => handleLanguageChange(Number(e.target.value))}
                            >
                                {LANGUAGES.map((lang) => (
                                    <option key={lang.id} value={lang.id}>{lang.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Action Toolbar */}
                        <div className="flex items-center gap-2 bg-[rgb(var(--bg-elevated))]/40 p-1.5 rounded-2xl border border-[rgb(var(--border-subtle))]">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={runCode}
                                disabled={loading}
                                className="flex items-center gap-2 bg-gradient-to-r from-[rgb(var(--accent))] to-purple-600 hover:from-[rgb(var(--accent-hover))] hover:to-purple-500 text-white px-5 py-2.5 rounded-xl shadow-[0_0_20px_rgba(var(--accent),0.3)] hover:shadow-[0_0_30px_rgba(var(--accent),0.5)] transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                            >
                                {loading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <>
                                        <Play className="h-5 w-5 fill-white group-hover:scale-110 transition-transform" />
                                        <span>Run</span>
                                    </>
                                )}
                            </motion.button>
                            
                            <div className="w-px h-8 bg-[rgb(var(--border-subtle))] mx-1 hidden sm:block"></div>

                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => copyToClipboard(code)} className="p-3 rounded-xl text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--bg-card))] transition-all tooltip-trigger" title="Copy Code">
                                <Copy className="h-5 w-5" />
                            </motion.button>
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={downloadCode} className="p-3 rounded-xl text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--bg-card))] transition-all tooltip-trigger" title="Download Code">
                                <Download className="h-5 w-5" />
                            </motion.button>
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={resetCode} className="p-3 rounded-xl text-[rgb(var(--text-secondary))] hover:text-red-500 hover:bg-red-500/10 transition-all tooltip-trigger" title="Reset to Default">
                                <RotateCcw className="h-5 w-5" />
                            </motion.button>
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowSettings(!showSettings)} className={`p-3 rounded-xl transition-all ${showSettings ? 'bg-[rgb(var(--accent))]/10 text-[rgb(var(--accent))]' : 'text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--bg-card))]'}`} title="Settings">
                                <Settings className="h-5 w-5" />
                            </motion.button>
                        </div>
                    </div>
                </motion.div>

                {/* Settings Panel Expansion */}
                <AnimatePresence>
                    {showSettings && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, marginTop: -20 }}
                            animate={{ opacity: 1, height: 'auto', marginTop: 0 }}
                            exit={{ opacity: 0, height: 0, marginTop: -20 }}
                            className="bg-[rgb(var(--bg-card))]/90 backdrop-blur-md rounded-2xl p-5 border border-[rgb(var(--border-subtle))] shadow-lg relative z-0"
                        >
                            <h3 className="font-bold text-[rgb(var(--text-primary))] mb-4 flex items-center gap-2"><Settings className="w-4 h-4"/> Editor Preferences</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-[rgb(var(--text-secondary))]">Editor Theme</label>
                                    <div className="relative">
                                        <select value={theme} onChange={(e) => handleThemeChange(e.target.value)} className="w-full p-3 rounded-xl bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border-subtle))] text-[rgb(var(--text-primary))] focus:ring-2 focus:ring-[rgb(var(--accent))] outline-none appearance-none cursor-pointer shadow-inner">
                                            <option value="vs-dark">Dark Theme (VS Code)</option>
                                            <option value="light">Light Theme</option>
                                            <option value="hc-black">High Contrast</option>
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--text-muted))] pointer-events-none"/>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-[rgb(var(--text-secondary))]">Font Size</label>
                                    <div className="relative">
                                        <select value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="w-full p-3 rounded-xl bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border-subtle))] text-[rgb(var(--text-primary))] focus:ring-2 focus:ring-[rgb(var(--accent))] outline-none appearance-none cursor-pointer shadow-inner">
                                            {[12,14,16,18,20,22,24].map(size => (
                                                <option key={size} value={size}>{size}px</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--text-muted))] pointer-events-none"/>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* 2. Main Workspace Split View */}
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">
                    {/* Editor Section */}
                    <motion.div
                        variants={itemVariants}
                        className="lg:col-span-8 flex flex-col bg-[rgb(var(--bg-card))]/60 backdrop-blur-md rounded-3xl border border-[rgb(var(--border-subtle))] shadow-xl overflow-hidden relative"
                    >
                        {/* Editor Header */}
                        <div className="flex items-center justify-between px-5 py-3 bg-[rgb(var(--bg-elevated))]/80 border-b border-[rgb(var(--border-subtle))] backdrop-blur-sm">
                            <div className="flex items-center gap-3">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 bg-red-500 rounded-full shadow-sm"></div>
                                    <div className="w-3 h-3 bg-yellow-500 rounded-full shadow-sm"></div>
                                    <div className="w-3 h-3 bg-green-500 rounded-full shadow-sm"></div>
                                </div>
                                <span className="text-sm font-bold text-[rgb(var(--text-secondary))] ml-2 tracking-wide">
                                    main.{selectedLanguage?.name === 'Python' ? 'py' : selectedLanguage?.name === 'JavaScript' ? 'js' : selectedLanguage?.name === 'Java' ? 'java' : selectedLanguage?.name === 'C' ? 'c' : selectedLanguage?.name === 'C++' ? 'cpp' : 'kt'}
                                </span>
                            </div>
                            <div className="text-xs font-mono text-[rgb(var(--text-muted))] bg-[rgb(var(--bg-body))] px-2.5 py-1 rounded-md border border-[rgb(var(--border-subtle))]">
                                {code.split('\n').length} Lines
                            </div>
                        </div>
                        
                        {/* Editor Container */}
                        <div className="flex-1 w-full relative">
                            <div className="absolute inset-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgb(var(--accent))]/30 to-transparent"></div>
                            <Editor
                                height="100%"
                                language={selectedLanguage.name.toLowerCase() === 'c++' ? 'cpp' : selectedLanguage.name.toLowerCase()}
                                theme={theme}
                                value={code}
                                onChange={(value) => setCode(value || '')}
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: fontSize,
                                    wordWrap: 'on',
                                    scrollBeyondLastLine: false,
                                    smoothScrolling: true,
                                    cursorBlinking: 'smooth',
                                    cursorSmoothCaretAnimation: 'on',
                                    formatOnPaste: true,
                                    fontFamily: "'Fira Code', 'JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', monospace",
                                    fontLigatures: true,
                                    padding: { top: 16, bottom: 16 },
                                    lineNumbersMinChars: 3,
                                }}
                                loading={
                                    <div className="flex flex-col items-center justify-center h-full text-[rgb(var(--accent))] space-y-4">
                                        <Loader2 className="w-10 h-10 animate-spin" />
                                        <span className="font-semibold tracking-widest uppercase text-sm">Initializing Editor...</span>
                                    </div>
                                }
                            />
                        </div>
                    </motion.div>

                    {/* I/O Section */}
                    <motion.div
                        variants={itemVariants}
                        className="lg:col-span-4 flex flex-col gap-6"
                    >
                        {/* Standard Input Panel */}
                        <div className="flex-1 flex flex-col bg-[rgb(var(--bg-card))]/60 backdrop-blur-md rounded-3xl border border-[rgb(var(--border-subtle))] shadow-xl overflow-hidden min-h-[250px]">
                            <div className="flex items-center gap-2 px-5 py-3.5 bg-[rgb(var(--bg-elevated))]/80 border-b border-[rgb(var(--border-subtle))]">
                                <Terminal className="w-4 h-4 text-[rgb(var(--text-secondary))]" />
                                <h3 className="font-bold text-[rgb(var(--text-primary))] text-sm tracking-wide">Input (stdin)</h3>
                            </div>
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Enter any standard input required by your program here..."
                                className="flex-1 w-full p-5 bg-transparent text-[rgb(var(--text-primary))] font-mono text-sm resize-none focus:outline-none focus:ring-inset focus:ring-2 focus:ring-[rgb(var(--accent))]/30 custom-scrollbar placeholder:text-[rgb(var(--text-muted))]/50"
                                spellCheck="false"
                            />
                        </div>

                        {/* Output Panel */}
                        <div className="flex-1 flex flex-col bg-[rgb(var(--bg-card))]/60 backdrop-blur-md rounded-3xl border border-[rgb(var(--border-subtle))] shadow-xl overflow-hidden min-h-[300px]">
                            <div className="flex justify-between items-center px-5 py-3.5 bg-[rgb(var(--bg-elevated))]/80 border-b border-[rgb(var(--border-subtle))]">
                                <div className="flex items-center gap-2">
                                    <Terminal className="w-4 h-4 text-[rgb(var(--text-secondary))]" />
                                    <h3 className="font-bold text-[rgb(var(--text-primary))] text-sm tracking-wide">Execution Output</h3>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="relative flex h-2.5 w-2.5">
                                        {loading ? (
                                            <>
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-500"></span>
                                            </>
                                        ) : output ? (
                                            <>
                                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                                            </>
                                        ) : (
                                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[rgb(var(--text-muted))]"></span>
                                        )}
                                    </span>
                                    <span className="text-xs font-semibold text-[rgb(var(--text-muted))] uppercase">
                                        {loading ? 'Running...' : output ? 'Finished' : 'Ready'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex-1 relative bg-[#0d1117] group">
                                <textarea
                                    value={output}
                                    readOnly
                                    placeholder="Run your code to see the output here..."
                                    className={`w-full h-full p-5 bg-transparent font-mono text-sm resize-none focus:outline-none custom-scrollbar-dark ${
                                        output.includes('❌') ? 'text-red-400' : 'text-[#e6edf3]'
                                    }`}
                                />
                                {output && (
                                    <button 
                                        onClick={() => copyToClipboard(output)} 
                                        className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
                                        title="Copy Output"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};

export default CodeExecution;

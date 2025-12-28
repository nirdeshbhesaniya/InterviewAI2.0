// src/pages/CodeExecution.jsx
import React, { useState, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { motion } from 'framer-motion';
import { Play, Code, Terminal, Loader2, Copy, Download, RotateCcw, Settings, ChevronDown } from 'lucide-react';
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
            className="min-h-screen bg-[rgb(var(--bg-body))] p-3 sm:p-6 font-[Urbanist]"
        >
            <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
                {/* Enhanced Header */}
                <motion.div
                    variants={itemVariants}
                    className="flex flex-col gap-4 bg-[rgb(var(--bg-card))] backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-lg border border-[rgb(var(--border-subtle))]"
                >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent-hover))] rounded-xl shadow-lg shadow-[rgb(var(--accent))]/30">
                                <Code className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-[rgb(var(--text-primary))]">
                                    Code Execution Platform
                                </h1>
                                <p className="text-sm text-[rgb(var(--text-muted))] mt-1">
                                    Write, test, and execute code in multiple languages
                                </p>
                            </div>
                        </div>

                        {/* Language Selector */}
                        <div className="relative w-full sm:w-auto">
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <Terminal className="h-4 w-4 text-[rgb(var(--text-muted))] flex-shrink-0" />
                                <div className="relative flex-1 sm:flex-none">
                                    {/* Custom styled select with icon */}
                                    <div className="relative">
                                        <div className="flex items-center gap-2 w-full sm:w-auto p-3 pr-10 rounded-xl bg-gradient-to-r from-gray-800 to-gray-900 text-white border border-gray-700 hover:border-primary hover:shadow-lg shadow-[rgb(var(--accent))]/30 transition-all duration-200 font-medium min-w-[180px] shadow-md">
                                            {LanguageIcons[selectedLanguage.icon] && React.createElement(LanguageIcons[selectedLanguage.icon])}
                                            <span className="flex-1">{selectedLanguage.name}</span>
                                        </div>
                                        <select
                                            className="absolute inset-0 w-full opacity-0 cursor-pointer bg-[rgb(var(--bg-card))] text-[rgb(var(--text-primary))]"
                                            style={{
                                                colorScheme: theme === 'vs-dark' || theme === 'hc-black' ? 'dark' : 'light'
                                            }}
                                            value={language}
                                            onChange={(e) => handleLanguageChange(Number(e.target.value))}
                                        >
                                            {LANGUAGES.map((lang) => (
                                                <option key={lang.id} value={lang.id}>
                                                    {lang.name}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[rgb(var(--border-subtle))]">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={runCode}
                            disabled={loading}
                            className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-400 disabled:to-gray-500 text-white px-4 py-2.5 rounded-lg shadow-md transition-all duration-200 font-medium disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span className="hidden sm:inline">Running...</span>
                                </>
                            ) : (
                                <>
                                    <Play className="h-4 w-4" />
                                    <span className="hidden sm:inline">Execute</span>
                                </>
                            )}
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => copyToClipboard(code)}
                            className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2.5 rounded-lg shadow-md transition-all duration-200 font-medium"
                        >
                            <Copy className="h-4 w-4" />
                            <span className="hidden sm:inline">Copy</span>
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={downloadCode}
                            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded-lg shadow-md transition-all duration-200 font-medium"
                        >
                            <Download className="h-4 w-4" />
                            <span className="hidden sm:inline">Download</span>
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={resetCode}
                            className="flex items-center gap-2 bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent-hover))] hover:shadow-lg shadow-[rgb(var(--accent))]/30 text-white px-4 py-2.5 rounded-lg shadow-md transition-all duration-200 font-medium"
                        >
                            <RotateCcw className="h-4 w-4" />
                            <span className="hidden sm:inline">Reset</span>
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowSettings(!showSettings)}
                            className="flex items-center gap-2 bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent-hover))] hover:shadow-lg shadow-[rgb(var(--accent))]/30 text-white px-4 py-2.5 rounded-lg shadow-md transition-all duration-200 font-medium"
                        >
                            <Settings className="h-4 w-4" />
                            <span className="hidden sm:inline">Settings</span>
                        </motion.button>
                    </div>

                    {/* Settings Panel */}
                    {showSettings && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-[rgb(var(--bg-body))] rounded-xl p-4 border border-[rgb(var(--border-subtle))]"
                        >
                            <h3 className="font-semibold text-[rgb(var(--text-primary))] mb-3">Editor Settings</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-2">
                                        Theme
                                    </label>
                                    <select
                                        value={theme}
                                        onChange={(e) => handleThemeChange(e.target.value)}
                                        className="w-full p-2 border border-[rgb(var(--border-subtle))] rounded-lg bg-[rgb(var(--bg-card))] text-[rgb(var(--text-primary))]"
                                    >
                                        <option value="vs-dark">Dark Theme</option>
                                        <option value="light">Light Theme</option>
                                        <option value="hc-black">High Contrast</option>
                                    </select>
                                    <p className="text-xs text-[rgb(var(--text-muted))] mt-1">Auto-syncs with system theme</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-2">
                                        Font Size
                                    </label>
                                    <select
                                        value={fontSize}
                                        onChange={(e) => setFontSize(Number(e.target.value))}
                                        className="w-full p-2 border border-[rgb(var(--border-subtle))] rounded-lg bg-[rgb(var(--bg-card))] text-[rgb(var(--text-primary))]"
                                    >
                                        <option value={12}>12px</option>
                                        <option value={14}>14px</option>
                                        <option value={16}>16px</option>
                                        <option value={18}>18px</option>
                                        <option value={20}>20px</option>
                                    </select>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </motion.div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
                    {/* Code Editor */}
                    <motion.div
                        variants={itemVariants}
                        className="xl:col-span-2 bg-[rgb(var(--bg-card))] backdrop-blur-sm rounded-2xl shadow-lg border border-[rgb(var(--border-subtle))] overflow-hidden"
                    >
                        <div className="p-3 sm:p-4 border-b border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-body))]">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="flex gap-2">
                                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                    </div>
                                    <span className="text-sm text-[rgb(var(--text-secondary))] ml-2">
                                        {selectedLanguage?.icon} {selectedLanguage?.name} Editor
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-[rgb(var(--text-muted))]">
                                    <span className="hidden sm:inline">Lines: {code.split('\n').length}</span>
                                    <span className="sm:hidden">{code.split('\n').length}L</span>
                                </div>
                            </div>
                        </div>
                        <div className="h-[300px] sm:h-[400px] lg:h-[500px]">
                            <Editor
                                height="100%"
                                language={selectedLanguage?.name.toLowerCase()}
                                value={code}
                                theme={theme}
                                onChange={(value) => setCode(value || '')}
                                options={{
                                    fontSize: fontSize,
                                    minimap: { enabled: window.innerWidth > 768 },
                                    scrollBeyondLastLine: false,
                                    wordWrap: 'on',
                                    lineNumbers: 'on',
                                    folding: true,
                                    bracketPairColorization: { enabled: true },
                                    automaticLayout: true,
                                    tabSize: 2,
                                    insertSpaces: true,
                                    renderWhitespace: 'selection',
                                    contextmenu: true,
                                    selectOnLineNumbers: true,
                                    roundedSelection: false,
                                    readOnly: false,
                                    cursorStyle: 'line',
                                    mouseWheelZoom: true,
                                    smoothScrolling: true,
                                }}
                                loading={
                                    <div className="flex items-center justify-center h-full">
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            <span>Loading editor...</span>
                                        </div>
                                    </div>
                                }
                            />
                        </div>
                    </motion.div>

                    {/* Input & Controls Panel */}
                    <motion.div variants={itemVariants} className="space-y-4 sm:space-y-6">
                        {/* Input Section */}
                        <div className="bg-[rgb(var(--bg-card))] backdrop-blur-sm rounded-2xl shadow-lg border border-[rgb(var(--border-subtle))] p-4 sm:p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-2 bg-secondary/20 rounded-lg">
                                    <Terminal className="h-4 w-4 text-secondary" />
                                </div>
                                <h2 className="font-semibold text-lg text-[rgb(var(--text-primary))]">Input (stdin)</h2>
                            </div>
                            <textarea
                                className="w-full p-3 border border-[rgb(var(--border-subtle))] rounded-xl bg-[rgb(var(--bg-body))] text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 resize-none"
                                placeholder="Enter input data here..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                rows={4}
                            />
                            <p className="text-xs text-[rgb(var(--text-muted))] mt-2">
                                Provide input data that your program will read from stdin
                            </p>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-[rgb(var(--bg-card))] backdrop-blur-sm rounded-2xl shadow-lg border border-[rgb(var(--border-subtle))] p-4 sm:p-6">
                            <h2 className="font-semibold text-lg text-[rgb(var(--text-primary))] mb-4">Quick Actions</h2>
                            <div className="grid grid-cols-2 gap-2">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => copyToClipboard(output)}
                                    disabled={!output}
                                    className="flex items-center justify-center gap-2 bg-[rgb(var(--bg-body))] hover:bg-[rgb(var(--bg-card))] text-[rgb(var(--text-primary))] px-3 py-2 rounded-lg transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm border border-[rgb(var(--border-subtle))]"
                                >
                                    <Copy className="h-3 w-3" />
                                    Copy Output
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setInput('')}
                                    className="flex items-center justify-center gap-2 bg-[rgb(var(--bg-body))] hover:bg-[rgb(var(--bg-card))] text-[rgb(var(--text-primary))] px-3 py-2 rounded-lg transition-all duration-200 font-medium text-sm border border-[rgb(var(--border-subtle))]"
                                >
                                    <RotateCcw className="h-3 w-3" />
                                    Clear Input
                                </motion.button>
                            </div>
                        </div>

                        {/* Execute Button - Mobile Optimized */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={runCode}
                            disabled={loading}
                            className="w-full bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent-hover))] hover:shadow-lg shadow-[rgb(var(--accent))]/30 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-4 rounded-xl shadow-lg transition-all duration-200 font-semibold flex items-center justify-center gap-2 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    <span>Executing Code...</span>
                                </>
                            ) : (
                                <>
                                    <Play className="h-5 w-5" />
                                    <span>Execute Code</span>
                                </>
                            )}
                        </motion.button>
                    </motion.div>
                </div>

                {/* Enhanced Output Section */}
                <motion.div
                    variants={itemVariants}
                    className="bg-[rgb(var(--bg-card))] backdrop-blur-sm rounded-2xl shadow-lg border border-[rgb(var(--border-subtle))] overflow-hidden"
                >
                    <div className="p-4 sm:p-6 border-b border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-body))]">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-green-500/20 rounded-lg">
                                    <Terminal className="h-5 w-5 text-green-400" />
                                </div>
                                <div>
                                    <h2 className="font-semibold text-lg text-[rgb(var(--text-primary))]">Console Output</h2>
                                    <p className="text-xs text-[rgb(var(--text-muted))]">Program execution results</p>
                                </div>
                            </div>
                            {output && (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => copyToClipboard(output)}
                                    className="flex items-center gap-1 bg-[rgb(var(--bg-body))] hover:bg-[rgb(var(--bg-card))] text-[rgb(var(--text-primary))] px-3 py-1.5 rounded-lg transition-all duration-200 text-sm border border-[rgb(var(--border-subtle))]"
                                >
                                    <Copy className="h-3 w-3" />
                                    <span className="hidden sm:inline">Copy</span>
                                </motion.button>
                            )}
                        </div>
                    </div>
                    <div className="p-4 sm:p-6">
                        <div className="bg-gray-900 rounded-xl p-4 min-h-[120px] max-h-[300px] overflow-auto border border-[rgb(var(--border-subtle))]">
                            <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed">
                                {output ? (
                                    <span className={
                                        output.startsWith('❌')
                                            ? 'text-red-400'
                                            : output.startsWith('✅')
                                                ? 'text-green-400'
                                                : 'text-gray-100'
                                    }>
                                        {output}
                                    </span>
                                ) : (
                                    <span className="text-[rgb(var(--text-muted))] italic flex items-center gap-2">
                                        <Terminal className="h-4 w-4" />
                                        Output will appear here after code execution...
                                    </span>
                                )}
                            </pre>
                        </div>
                        {output && (
                            <div className="mt-3 flex items-center justify-between text-xs text-[rgb(var(--text-muted))]">
                                <span>Execution completed</span>
                                <span>{new Date().toLocaleTimeString()}</span>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default CodeExecution;

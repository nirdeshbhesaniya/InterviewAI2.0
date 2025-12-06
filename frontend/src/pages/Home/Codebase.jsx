// src/pages/CodeExecution.jsx
import React, { useState, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { motion } from 'framer-motion';
import { Play, Code, Terminal, Loader2, Copy, Download, RotateCcw, Settings, ChevronDown } from 'lucide-react';
import { API } from '../../utils/apiPaths';
import axios from '../../utils/axiosInstance';
import { toast } from 'react-hot-toast';

const LANGUAGES = [
    {
        id: 63,
        name: 'JavaScript',
        sample: 'console.log("Hello, World!");\n\n// Write your JavaScript code here...\nfunction fibonacci(n) {\n    if (n <= 1) return n;\n    return fibonacci(n - 1) + fibonacci(n - 2);\n}\n\nconsole.log("Fibonacci(10):", fibonacci(10));',
        icon: '🟨'
    },
    {
        id: 71,
        name: 'Python',
        sample: 'print("Hello, World!")\n\n# Write your Python code here...\ndef fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n - 1) + fibonacci(n - 2)\n\nprint(f"Fibonacci(10): {fibonacci(10)}")',
        icon: '🐍'
    },
    {
        id: 62,
        name: 'Java',
        sample: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n        \n        // Write your Java code here...\n        System.out.println("Fibonacci(10): " + fibonacci(10));\n    }\n    \n    static int fibonacci(int n) {\n        if (n <= 1) return n;\n        return fibonacci(n - 1) + fibonacci(n - 2);\n    }\n}',
        icon: '☕'
    },
    {
        id: 50,
        name: 'C',
        sample: '#include <stdio.h>\n\nint fibonacci(int n) {\n    if (n <= 1) return n;\n    return fibonacci(n - 1) + fibonacci(n - 2);\n}\n\nint main() {\n    printf("Hello, World!\\n");\n    \n    // Write your C code here...\n    printf("Fibonacci(10): %d\\n", fibonacci(10));\n    return 0;\n}',
        icon: '🔷'
    },
    {
        id: 54,
        name: 'C++',
        sample: '#include <iostream>\nusing namespace std;\n\nint fibonacci(int n) {\n    if (n <= 1) return n;\n    return fibonacci(n - 1) + fibonacci(n - 2);\n}\n\nint main() {\n    cout << "Hello, World!" << endl;\n    \n    // Write your C++ code here...\n    cout << "Fibonacci(10): " << fibonacci(10) << endl;\n    return 0;\n}',
        icon: '🔶'
    },
    {
        id: 78,
        name: 'Kotlin',
        sample: 'fun fibonacci(n: Int): Int {\n    return if (n <= 1) n else fibonacci(n - 1) + fibonacci(n - 2)\n}\n\nfun main() {\n    println("Hello, World!")\n    \n    // Write your Kotlin code here...\n    println("Fibonacci(10): ${fibonacci(10)}")\n}',
        icon: '🟣'
    },
];

const CodeExecution = () => {
    const [language, setLanguage] = useState(63);
    const [code, setCode] = useState(LANGUAGES.find(l => l.id === 63).sample);
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [loading, setLoading] = useState(false);
    const [theme, setTheme] = useState('vs-dark');
    const [fontSize, setFontSize] = useState(14);
    const [showSettings, setShowSettings] = useState(false);

    const runCode = useCallback(async () => {
        if (!code.trim()) {
            toast.error('Please write some code first!');
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

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-3 sm:p-6 font-[Urbanist]"
        >
            <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
                {/* Enhanced Header */}
                <motion.div
                    variants={itemVariants}
                    className="flex flex-col gap-4 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700"
                >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-lg">
                                <Code className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                                    Code Execution Platform
                                </h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    Write, test, and execute code in multiple languages
                                </p>
                            </div>
                        </div>

                        {/* Language Selector */}
                        <div className="relative w-full sm:w-auto">
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <Terminal className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                <div className="relative flex-1 sm:flex-none">
                                    <select
                                        className="w-full sm:w-auto appearance-none p-3 pr-10 rounded-xl bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 font-medium min-w-[180px] cursor-pointer"
                                        value={language}
                                        onChange={(e) => handleLanguageChange(Number(e.target.value))}
                                    >
                                        {LANGUAGES.map((lang) => (
                                            <option key={lang.id} value={lang.id}>
                                                {lang.icon} {lang.name}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-orange-500 pointer-events-none" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-600">
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
                            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-lg shadow-md transition-all duration-200 font-medium"
                        >
                            <RotateCcw className="h-4 w-4" />
                            <span className="hidden sm:inline">Reset</span>
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowSettings(!showSettings)}
                            className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2.5 rounded-lg shadow-md transition-all duration-200 font-medium"
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
                            className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 border border-gray-200 dark:border-gray-600"
                        >
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Editor Settings</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Theme
                                    </label>
                                    <select
                                        value={theme}
                                        onChange={(e) => setTheme(e.target.value)}
                                        className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                    >
                                        <option value="vs-dark">Dark Theme</option>
                                        <option value="light">Light Theme</option>
                                        <option value="hc-black">High Contrast</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Font Size
                                    </label>
                                    <select
                                        value={fontSize}
                                        onChange={(e) => setFontSize(Number(e.target.value))}
                                        className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
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
                        className="xl:col-span-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                    >
                        <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="flex gap-2">
                                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                    </div>
                                    <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                                        {selectedLanguage?.icon} {selectedLanguage?.name} Editor
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-gray-500">
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
                        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                    <Terminal className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h2 className="font-semibold text-lg text-gray-900 dark:text-white">Input (stdin)</h2>
                            </div>
                            <textarea
                                className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                                placeholder="Enter input data here..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                rows={4}
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                Provide input data that your program will read from stdin
                            </p>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
                            <h2 className="font-semibold text-lg text-gray-900 dark:text-white mb-4">Quick Actions</h2>
                            <div className="grid grid-cols-2 gap-2">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => copyToClipboard(output)}
                                    disabled={!output}
                                    className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                >
                                    <Copy className="h-3 w-3" />
                                    Copy Output
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setInput('')}
                                    className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg transition-all duration-200 font-medium text-sm"
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
                            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-4 rounded-xl shadow-lg transition-all duration-200 font-semibold flex items-center justify-center gap-2 disabled:cursor-not-allowed"
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
                    className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                    <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                    <Terminal className="h-5 w-5 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <h2 className="font-semibold text-lg text-gray-900 dark:text-white">Console Output</h2>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Program execution results</p>
                                </div>
                            </div>
                            {output && (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => copyToClipboard(output)}
                                    className="flex items-center gap-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-lg transition-all duration-200 text-sm"
                                >
                                    <Copy className="h-3 w-3" />
                                    <span className="hidden sm:inline">Copy</span>
                                </motion.button>
                            )}
                        </div>
                    </div>
                    <div className="p-4 sm:p-6">
                        <div className="bg-gray-900 dark:bg-black rounded-xl p-4 min-h-[120px] max-h-[300px] overflow-auto border border-gray-300 dark:border-gray-600">
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
                                    <span className="text-gray-500 italic flex items-center gap-2">
                                        <Terminal className="h-4 w-4" />
                                        Output will appear here after code execution...
                                    </span>
                                )}
                            </pre>
                        </div>
                        {output && (
                            <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
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

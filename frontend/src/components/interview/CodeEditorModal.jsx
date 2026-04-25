import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { X, Play, Send, Loader2, CheckCircle2, RotateCcw } from 'lucide-react';
import axios from '../../utils/axiosInstance';
import toast from 'react-hot-toast';

const CodeEditorModal = ({ isOpen, onClose, onSubmit, initialCode = '', questionData }) => {
    const [code, setCode] = useState(initialCode || '# Write your code here\nprint("Hello World")');
    const [language, setLanguage] = useState('python');
    const [output, setOutput] = useState('');
    const [isRunning, setIsRunning] = useState(false);

    // Language options mapping for Judge0
    // IDs: 71 (Python), 63 (JavaScript), 62 (Java), 54 (C++)
    const languages = [
        { id: 71, name: 'python', label: 'Python (3.8.1)' },
        { id: 63, name: 'javascript', label: 'JavaScript (Node.js 12.14.0)' },
        { id: 62, name: 'java', label: 'Java (OpenJDK 13.0.1)' },
        { id: 54, name: 'cpp', label: 'C++ (GCC 9.2.0)' },
    ];

    // Update code when question or language changes
    React.useEffect(() => {
        if (questionData && questionData.codeTemplates) {
            const template = questionData.codeTemplates[language];
            if (template) {
                setCode(template);
            } else {
                // Fallback defaults if specific template missing
                setCode(language === 'python' ? '# Write your code here' : '// Write your code here');
            }
        }
    }, [questionData, language]);

    if (!isOpen) return null;

    const handleRunCode = async () => {
        setIsRunning(true);
        setOutput('Running...');

        try {
            const selectedLang = languages.find(l => l.name === language);
            const response = await axios.post('/compile', {
                source_code: code,
                language_id: selectedLang?.id || 71,
                stdin: ''
            });

            if (response.data) {
                // Judge0 response format
                const result = response.data;
                const outputText = result.stdout || result.stderr || result.compile_output || 'No output';
                setOutput(outputText);
            }
        } catch (error) {
            console.error(error);
            setOutput('Error running code: ' + (error.response?.data?.message || error.message));
        } finally {
            setIsRunning(false);
        }
    };

    const handleSubmit = () => {
        if (!code.trim()) {
            toast.error("Please write some code before submitting.");
            return;
        }
        onSubmit(code, language);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-[#1e1e1e] w-full max-w-5xl h-[90vh] rounded-xl shadow-2xl flex flex-col border border-gray-700 overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-[#252526] border-b border-gray-700">
                    <div className="flex items-center gap-4">
                        <span className="font-semibold text-gray-200">Code Editor</span>
                        <select
                            value={language}
                            onChange={(e) => setCode(e.target.value === 'python' ? '# Write your code here' : '// Write your code here') || setLanguage(e.target.value)}
                            className="bg-[#3c3c3c] text-gray-200 text-sm px-3 py-1.5 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
                        >
                            {languages.map(lang => (
                                <option key={lang.id} value={lang.name}>{lang.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCode('')}
                            className="p-2 text-gray-400 hover:text-white transition-colors"
                            title="Reset Code"
                        >
                            <RotateCcw className="w-4 h-4" />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-white hover:bg-red-500/20 rounded-lg transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Main Content: Split View (Editor + Output) */}
                <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">

                    {/* Left: Problem Description Panel */}
                    {questionData && (
                        <div className="w-full lg:w-1/3 bg-[#1e1e1e] border-r border-gray-700 flex flex-col overflow-hidden">
                            <div className="p-4 border-b border-gray-700 bg-[#252526]">
                                <h2 className="text-lg font-bold text-gray-100">{questionData.question}</h2>
                            </div>
                            <div className="flex-1 p-4 overflow-y-auto text-gray-300 space-y-4">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-400 uppercase mb-2">Description</h3>
                                    <div className="prose prose-invert prose-sm text-sm" dangerouslySetInnerHTML={{ __html: questionData.description?.replace(/\n/g, '<br/>') || 'No description available.' }} />
                                </div>

                                {questionData.examples && questionData.examples.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-400 uppercase mb-2">Examples</h3>
                                        <div className="space-y-3">
                                            {questionData.examples.map((ex, i) => (
                                                <div key={i} className="bg-[#2d2d2d] p-3 rounded-lg text-xs font-mono">
                                                    <div className="mb-1"><span className="text-blue-400">Input:</span> {ex.input}</div>
                                                    <div className="mb-1"><span className="text-blue-400">Output:</span> {ex.output}</div>
                                                    {ex.explanation && <div className="text-gray-500 italic">// {ex.explanation}</div>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {questionData.constraints && questionData.constraints.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-400 uppercase mb-2">Constraints</h3>
                                        <ul className="list-disc list-inside text-xs text-gray-400 space-y-1">
                                            {questionData.constraints.map((c, i) => (
                                                <li key={i}>{c}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Middle: Editor Area */}
                    <div className="flex-1 flex flex-col relative border-r border-gray-700">
                        <Editor
                            height="100%"
                            defaultLanguage="python"
                            language={language}
                            theme="vs-dark"
                            value={code}
                            onChange={(value) => setCode(value || '')}
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                wordWrap: 'on',
                                automaticLayout: true,
                            }}
                        />
                    </div>

                    {/* Right: Output / Controls Area */}
                    <div className={`w-full lg:w-1/4 bg-[#1e1e1e] flex flex-col ${questionData ? '' : 'lg:w-1/3'}`}>
                        {/* Action Buttons */}
                        <div className="p-4 flex gap-3 border-b border-gray-700">
                            <button
                                onClick={handleRunCode}
                                disabled={isRunning}
                                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                                Run Code
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center gap-2 font-medium transition-colors"
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                Submit
                            </button>
                        </div>

                        {/* Output Console */}
                        <div className="flex-1 flex flex-col p-4 overflow-hidden">
                            <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Console Output</h3>
                            <div className="flex-1 bg-[#0d0d0d] rounded-lg p-3 font-mono text-sm text-gray-300 overflow-auto whitespace-pre-wrap border border-gray-800 shadow-inner">
                                {output || <span className="text-gray-600 italic">Run code to see output...</span>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CodeEditorModal;

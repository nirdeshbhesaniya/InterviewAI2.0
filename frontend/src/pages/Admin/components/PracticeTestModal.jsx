import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, CheckCircle, AlertCircle, Save,Clock , Upload, FileText, Sparkles, Code, Layers, BookOpen, ChevronDown, ChevronUp, Terminal } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import Editor from '@monaco-editor/react';
import toast from 'react-hot-toast';
import { BRANCHES } from '../../../utils/constants';

// ─── Parse bulk MCQ (unchanged) ───
function parseBulkMCQ(text) {
    const parsed = [];
    if (!text || !text.trim()) return parsed;
    const blocks = text.split(/(?=^\s*(?:Q?\.?\s*)?\d+[.):]\s)/m).filter(b => b.trim());

    for (const block of blocks) {
        try {
            const qMatch = block.match(/^\s*(?:Q?\.?\s*)?\d+[.):]\s*([\s\S]*?)(?=^\s*[Aa][.)\s])/m);
            if (!qMatch) continue;
            let rawQuestionText = qMatch[1].trim();
            if (!rawQuestionText) continue;

            let codeSnippet = '';
            const fencedCodeMatch = rawQuestionText.match(/```(?:\w*)?\n?([\s\S]*?)```/);
            if (fencedCodeMatch) {
                codeSnippet = fencedCodeMatch[1].trim();
                rawQuestionText = rawQuestionText.replace(/```(?:\w*)?\n?[\s\S]*?```/, '').trim();
            }
            if (!codeSnippet) {
                const labeledCodeMatch = rawQuestionText.match(/(?:code\s*snippet|code)\s*[:=]\s*([\s\S]+?)$/im);
                if (labeledCodeMatch) {
                    codeSnippet = labeledCodeMatch[1].trim();
                    rawQuestionText = rawQuestionText.replace(/(?:code\s*snippet|code)\s*[:=]\s*[\s\S]+?$/im, '').trim();
                }
            }
            if (!codeSnippet) {
                const standaloneCode = block.match(/(?:code\s*snippet|code)\s*[:=]\s*([\s\S]*?)(?=^\s*[Aa][.)\s])/im);
                if (standaloneCode) codeSnippet = standaloneCode[1].trim();
            }

            const questionText = rawQuestionText;
            const options = ['', '', '', ''];
            const optPatterns = [/^\s*[Aa][.)\s]\s*(.+)/m, /^\s*[Bb][.)\s]\s*(.+)/m, /^\s*[Cc][.)\s]\s*(.+)/m, /^\s*[Dd][.)\s]\s*(.+)/m];
            for (let i = 0; i < 4; i++) {
                const m = block.match(optPatterns[i]);
                if (m) options[i] = m[1].trim();
            }

            const ansMatch = block.match(/(?:answer|correct|right\s*answer)\s*[:=]\s*([A-Da-d])/i);
            let correctAnswer = 0;
            if (ansMatch) correctAnswer = ansMatch[1].toUpperCase().charCodeAt(0) - 65;

            const expMatch = block.match(/(?:explanation|reason)\s*[:=]\s*(.+)/i);
            const explanation = expMatch ? expMatch[1].trim() : '';

            if (options.every(o => o)) {
                parsed.push({ question: questionText, options, correctAnswer, explanation, codeSnippet });
            }
        } catch (e) { continue; }
    }
    return parsed;
}

const toLocalDateTimeString = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '';
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

const LANGUAGE_OPTIONS = [
    { id: 'cpp', name: 'C++' },
    { id: 'java', name: 'Java' },
    { id: 'python', name: 'Python' },
    { id: 'javascript', name: 'JavaScript' }
];

// ─── DSA Question Component ───
const DSAQuestionEditor = ({ question, index, onUpdate, onRemove }) => {
    const [expanded, setExpanded] = useState(true);
    const [activeStarterLang, setActiveStarterLang] = useState(question.allowedLanguages?.[0] || 'python');
    const [activeCodeTab, setActiveCodeTab] = useState('starter'); // 'starter' or 'driver'

    const updateField = (field, value) => onUpdate(index, field, value);

    const addTestCase = (type) => {
        const newCase = type === 'public'
            ? { input: '', expectedOutput: '', explanation: '' }
            : { input: '', expectedOutput: '' };
        const field = type === 'public' ? 'publicTestCases' : 'hiddenTestCases';
        updateField(field, [...(question[field] || []), newCase]);
    };

    const removeTestCase = (type, idx) => {
        const field = type === 'public' ? 'publicTestCases' : 'hiddenTestCases';
        updateField(field, (question[field] || []).filter((_, i) => i !== idx));
    };

    const updateTestCase = (type, idx, field, value) => {
        const arrayField = type === 'public' ? 'publicTestCases' : 'hiddenTestCases';
        const updated = [...(question[arrayField] || [])];
        updated[idx] = { ...updated[idx], [field]: value };
        updateField(arrayField, updated);
    };

    const toggleLanguage = (langId) => {
        const current = question.allowedLanguages || [];
        const updated = current.includes(langId)
            ? current.filter(l => l !== langId)
            : [...current, langId];
        if (updated.length === 0) {
            toast.error('At least one language must be selected');
            return;
        }
        updateField('allowedLanguages', updated);
    };

    const updateStarterCode = (lang, code) => {
        const current = question.starterCode || {};
        updateField('starterCode', { ...current, [lang]: code });
    };

    const updateDriverCode = (lang, code) => {
        const current = question.driverCode || {};
        updateField('driverCode', { ...current, [lang]: code });
    };

    return (
        <div className="bg-[rgb(var(--bg-elevated))] rounded-xl border border-[rgb(var(--border))] relative group">
            {/* Header */}
            <div
                className="flex items-center justify-between p-4 cursor-pointer"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/15 flex items-center justify-center text-cyan-500 text-sm font-bold">
                        {index + 1}
                    </div>
                    <div>
                        <span className="text-sm font-bold text-[rgb(var(--text-primary))]">
                            {question.title || `DSA Problem ${index + 1}`}
                        </span>
                        <span className={`ml-2 text-xs px-2 py-0.5 rounded-full font-semibold
                            ${question.difficulty === 'easy' ? 'bg-green-500/10 text-green-500' :
                                question.difficulty === 'hard' ? 'bg-red-500/10 text-red-500' :
                                    'bg-yellow-500/10 text-yellow-500'}`}>
                            {question.difficulty || 'medium'}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={(e) => { e.stopPropagation(); onRemove(index); }}
                        className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                        <Trash2 className="w-4 h-4" />
                    </button>
                    {expanded ? <ChevronUp className="w-4 h-4 text-[rgb(var(--text-muted))]" /> : <ChevronDown className="w-4 h-4 text-[rgb(var(--text-muted))]" />}
                </div>
            </div>

            {/* Body */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 pb-4 space-y-4 border-t border-[rgb(var(--border))]">
                            {/* Title + Difficulty + Score */}
                            <div className="grid grid-cols-3 gap-3 pt-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-[rgb(var(--text-muted))]">Problem Title *</label>
                                    <input type="text" value={question.title || ''} onChange={(e) => updateField('title', e.target.value)}
                                        className="w-full px-3 py-2 bg-[rgb(var(--bg-main))] border border-[rgb(var(--border))] rounded-lg focus:ring-1 focus:ring-cyan-500 outline-none text-[rgb(var(--text-primary))] text-sm"
                                        placeholder="e.g. Two Sum" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-[rgb(var(--text-muted))]">Difficulty</label>
                                    <select value={question.difficulty || 'medium'} onChange={(e) => updateField('difficulty', e.target.value)}
                                        className="w-full px-3 py-2 bg-[rgb(var(--bg-main))] border border-[rgb(var(--border))] rounded-lg focus:ring-1 focus:ring-cyan-500 outline-none text-[rgb(var(--text-primary))] text-sm">
                                        <option value="easy">Easy</option>
                                        <option value="medium">Medium</option>
                                        <option value="hard">Hard</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-[rgb(var(--text-muted))]">Max Score</label>
                                    <input type="number" min="1" value={question.maxScore || 100} onChange={(e) => updateField('maxScore', parseInt(e.target.value) || 100)}
                                        className="w-full px-3 py-2 bg-[rgb(var(--bg-main))] border border-[rgb(var(--border))] rounded-lg focus:ring-1 focus:ring-cyan-500 outline-none text-[rgb(var(--text-primary))] text-sm" />
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-[rgb(var(--text-muted))]">Problem Description * (Markdown)</label>
                                <textarea value={question.description || ''} onChange={(e) => updateField('description', e.target.value)}
                                    className="w-full px-3 py-2 bg-[rgb(var(--bg-main))] border border-[rgb(var(--border))] rounded-lg focus:ring-1 focus:ring-cyan-500 outline-none text-[rgb(var(--text-primary))] text-sm font-mono"
                                    placeholder="Given an array of integers nums and an integer target, return indices..." rows={4} />
                            </div>

                            {/* Constraints */}
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-[rgb(var(--text-muted))]">Constraints</label>
                                <textarea value={question.constraints || ''} onChange={(e) => updateField('constraints', e.target.value)}
                                    className="w-full px-3 py-2 bg-[rgb(var(--bg-main))] border border-[rgb(var(--border))] rounded-lg focus:ring-1 focus:ring-cyan-500 outline-none text-[rgb(var(--text-primary))] text-sm font-mono"
                                    placeholder="1 <= nums.length <= 10^4&#10;-10^9 <= nums[i] <= 10^9" rows={2} />
                            </div>

                            {/* Time/Memory Limits + Languages */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-[rgb(var(--text-muted))]">Time Limit (seconds)</label>
                                    <input type="number" min="1" max="10" value={question.timeLimit || 2}
                                        onChange={(e) => updateField('timeLimit', parseInt(e.target.value) || 2)}
                                        className="w-full px-3 py-2 bg-[rgb(var(--bg-main))] border border-[rgb(var(--border))] rounded-lg focus:ring-1 focus:ring-cyan-500 outline-none text-[rgb(var(--text-primary))] text-sm" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-[rgb(var(--text-muted))]">Memory Limit (MB)</label>
                                    <input type="number" min="64" max="512" value={question.memoryLimit || 256}
                                        onChange={(e) => updateField('memoryLimit', parseInt(e.target.value) || 256)}
                                        className="w-full px-3 py-2 bg-[rgb(var(--bg-main))] border border-[rgb(var(--border))] rounded-lg focus:ring-1 focus:ring-cyan-500 outline-none text-[rgb(var(--text-primary))] text-sm" />
                                </div>
                            </div>

                            {/* Allowed Languages */}
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-[rgb(var(--text-muted))]">Allowed Languages *</label>
                                <div className="flex gap-2 flex-wrap">
                                    {LANGUAGE_OPTIONS.map(lang => (
                                        <button key={lang.id} onClick={() => toggleLanguage(lang.id)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border
                                                ${(question.allowedLanguages || []).includes(lang.id)
                                                    ? 'bg-cyan-500/15 text-cyan-500 border-cyan-500/30'
                                                    : 'bg-[rgb(var(--bg-main))] text-[rgb(var(--text-muted))] border-[rgb(var(--border))] hover:border-cyan-500/30'
                                                }`}>
                                            {lang.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Code Templates (Starter / Driver) */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 mb-2">
                                    <button type="button" onClick={() => setActiveCodeTab('starter')}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border
                                            ${activeCodeTab === 'starter'
                                                ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-500 font-extrabold'
                                                : 'bg-[rgb(var(--bg-main))] text-[rgb(var(--text-muted))] border-[rgb(var(--border))] hover:border-cyan-500/30'
                                            }`}>
                                        Starter Code (Visible to Student)
                                    </button>
                                    <button type="button" onClick={() => setActiveCodeTab('driver')}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border
                                            ${activeCodeTab === 'driver'
                                                ? 'bg-purple-500/10 border-purple-500/30 text-purple-500 font-extrabold'
                                                : 'bg-[rgb(var(--bg-main))] text-[rgb(var(--text-muted))] border-[rgb(var(--border))] hover:border-cyan-500/30'
                                            }`}>
                                        Driver Code (Hidden Wrapper)
                                    </button>
                                </div>
                                <div className="flex gap-1 mb-2">
                                    {(question.allowedLanguages || ['python']).map(lang => (
                                        <button key={lang} onClick={() => setActiveStarterLang(lang)}
                                            className={`px-3 py-1 rounded-t-lg text-xs font-semibold transition-all
                                                ${activeStarterLang === lang ? 'bg-[rgb(var(--bg-main))] text-cyan-500 border border-b-0 border-[rgb(var(--border))]' : 'text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-secondary))]'}`}>
                                            {LANGUAGE_OPTIONS.find(l => l.id === lang)?.name || lang}
                                        </button>
                                    ))}
                                </div>
                                {activeCodeTab === 'starter' ? (
                                    <div className="border border-[rgb(var(--border))] rounded-lg overflow-hidden" style={{ height: '150px' }}>
                                        <Editor
                                            height="100%"
                                            language={activeStarterLang === 'cpp' ? 'cpp' : activeStarterLang}
                                            value={(question.starterCode || {})[activeStarterLang] || ''}
                                            onChange={(val) => updateStarterCode(activeStarterLang, val || '')}
                                            theme="vs-dark"
                                            options={{ fontSize: 12, minimap: { enabled: false }, lineNumbers: 'on', scrollBeyondLastLine: false, padding: { top: 8 }, automaticLayout: true }}
                                        />
                                    </div>
                                ) : (
                                    <div className="space-y-1">
                                        <div className="border border-[rgb(var(--border))] rounded-lg overflow-hidden" style={{ height: '150px' }}>
                                            <Editor
                                                height="100%"
                                                language={activeStarterLang === 'cpp' ? 'cpp' : activeStarterLang}
                                                value={(question.driverCode || {})[activeStarterLang] || ''}
                                                onChange={(val) => updateDriverCode(activeStarterLang, val || '')}
                                                theme="vs-dark"
                                                options={{ fontSize: 12, minimap: { enabled: false }, lineNumbers: 'on', scrollBeyondLastLine: false, padding: { top: 8 }, automaticLayout: true }}
                                            />
                                        </div>
                                        <span className="text-[10px] text-[rgb(var(--text-muted))] leading-tight block">
                                            Use placeholder <code>// {"{{USER_CODE}}"}</code> or <code># {"{{USER_CODE}}"}</code> to control where the user's code is placed. Otherwise, the driver code is automatically appended to the end.
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* ═══ PUBLIC TEST CASES ═══ */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-semibold text-emerald-500 uppercase flex items-center gap-1.5">
                                        <Terminal className="w-3.5 h-3.5" /> Public Test Cases * (min 2)
                                    </label>
                                    <Button size="sm" onClick={() => addTestCase('public')}
                                        className="bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25 border border-emerald-500/20 text-xs">
                                        <Plus className="w-3 h-3 mr-1" /> Add
                                    </Button>
                                </div>
                                {(question.publicTestCases || []).map((tc, idx) => (
                                    <div key={idx} className="p-3 bg-[rgb(var(--bg-main))] border border-emerald-500/15 rounded-xl space-y-2 relative group/tc">
                                        <button onClick={() => removeTestCase('public', idx)}
                                            className="absolute top-2 right-2 p-1 text-red-500 hover:bg-red-500/10 rounded opacity-0 group-hover/tc:opacity-100 transition-opacity">
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                        <div className="text-xs font-bold text-emerald-500/70 mb-1">Public Case {idx + 1}</div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="text-[10px] font-semibold text-[rgb(var(--text-muted))]">Input *</label>
                                                <textarea value={tc.input} onChange={(e) => updateTestCase('public', idx, 'input', e.target.value)}
                                                    className="w-full px-2 py-1.5 bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border))] rounded-lg text-xs font-mono text-[rgb(var(--text-primary))] outline-none focus:ring-1 focus:ring-emerald-500/30"
                                                    rows={2} placeholder="4&#10;2 7 11 15&#10;9" />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-semibold text-[rgb(var(--text-muted))]">Expected Output *</label>
                                                <textarea value={tc.expectedOutput} onChange={(e) => updateTestCase('public', idx, 'expectedOutput', e.target.value)}
                                                    className="w-full px-2 py-1.5 bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border))] rounded-lg text-xs font-mono text-[rgb(var(--text-primary))] outline-none focus:ring-1 focus:ring-emerald-500/30"
                                                    rows={2} placeholder="0 1" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-semibold text-[rgb(var(--text-muted))]">Explanation</label>
                                            <input type="text" value={tc.explanation || ''} onChange={(e) => updateTestCase('public', idx, 'explanation', e.target.value)}
                                                className="w-full px-2 py-1.5 bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border))] rounded-lg text-xs text-[rgb(var(--text-primary))] outline-none focus:ring-1 focus:ring-emerald-500/30"
                                                placeholder="nums[0] + nums[1] = 9, so return [0, 1]" />
                                        </div>
                                    </div>
                                ))}
                                {(question.publicTestCases || []).length < 2 && (
                                    <div className="text-xs text-red-400 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" /> At least 2 public test cases required
                                    </div>
                                )}
                            </div>

                            {/* ═══ HIDDEN TEST CASES ═══ */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-semibold text-amber-500 uppercase flex items-center gap-1.5">
                                        <AlertCircle className="w-3.5 h-3.5" /> Hidden Test Cases * (min 1)
                                    </label>
                                    <Button size="sm" onClick={() => addTestCase('hidden')}
                                        className="bg-amber-500/15 text-amber-500 hover:bg-amber-500/25 border border-amber-500/20 text-xs">
                                        <Plus className="w-3 h-3 mr-1" /> Add
                                    </Button>
                                </div>
                                {(question.hiddenTestCases || []).map((tc, idx) => (
                                    <div key={idx} className="p-3 bg-[rgb(var(--bg-main))] border border-amber-500/15 rounded-xl space-y-2 relative group/tc">
                                        <button onClick={() => removeTestCase('hidden', idx)}
                                            className="absolute top-2 right-2 p-1 text-red-500 hover:bg-red-500/10 rounded opacity-0 group-hover/tc:opacity-100 transition-opacity">
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                        <div className="text-xs font-bold text-amber-500/70 mb-1">Hidden Case {idx + 1}</div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="text-[10px] font-semibold text-[rgb(var(--text-muted))]">Input *</label>
                                                <textarea value={tc.input} onChange={(e) => updateTestCase('hidden', idx, 'input', e.target.value)}
                                                    className="w-full px-2 py-1.5 bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border))] rounded-lg text-xs font-mono text-[rgb(var(--text-primary))] outline-none focus:ring-1 focus:ring-amber-500/30"
                                                    rows={2} placeholder="Enter hidden test input" />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-semibold text-[rgb(var(--text-muted))]">Expected Output *</label>
                                                <textarea value={tc.expectedOutput} onChange={(e) => updateTestCase('hidden', idx, 'expectedOutput', e.target.value)}
                                                    className="w-full px-2 py-1.5 bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border))] rounded-lg text-xs font-mono text-[rgb(var(--text-primary))] outline-none focus:ring-1 focus:ring-amber-500/30"
                                                    rows={2} placeholder="Expected output" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {(question.hiddenTestCases || []).length < 1 && (
                                    <div className="text-xs text-red-400 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" /> At least 1 hidden test case required
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const sanitizeModulesForType = (modules, type) => {
    let list = [...(modules || [])];
    if (type === 'mcq') {
        list = list.filter(m => m.moduleType === 'mcq');
        if (list.length === 0) {
            list.push({ title: 'Module 1', timeLimit: 30, moduleType: 'mcq' });
        }
    } else if (type === 'dsa') {
        list = list.filter(m => m.moduleType === 'dsa');
        if (list.length === 0) {
            list.push({ title: 'DSA Coding Module', timeLimit: 45, moduleType: 'dsa' });
        } else if (list.length > 1) {
            list = [list[0]];
        }
    } else if (type === 'mixed') {
        const mcqs = list.filter(m => m.moduleType === 'mcq');
        if (mcqs.length === 0) {
            mcqs.push({ title: 'Module 1', timeLimit: 30, moduleType: 'mcq' });
        }
        let dsa = list.find(m => m.moduleType === 'dsa');
        if (!dsa) {
            dsa = { title: 'DSA Coding Module', timeLimit: 45, moduleType: 'dsa' };
        }
        list = [...mcqs, dsa];
    }
    return list;
};

// ─── Main Modal ───
const PracticeTestModal = ({ isOpen, onClose, onSave, testToEdit }) => {
    const [showBulkImport, setShowBulkImport] = useState(false);
    const [showDsaBulkImport, setShowDsaBulkImport] = useState(false);
    const [bulkText, setBulkText] = useState('');
    const [dsaBulkText, setDsaBulkText] = useState('');
    const [activeMcqModuleIndex, setActiveMcqModuleIndex] = useState(0);
    const [formData, setFormData] = useState({
        title: '', description: '', topic: '', branch: 'computer', difficulty: 'medium',
        maxAttempts: 1, timeLimit: 30, passingScore: 40, guidelines: '',
        isTimeRestricted: false, securityEnabled: false, startTime: '', endTime: '', isPublished: true,
        moduleType: 'mcq', modules: [], questions: [], dsaQuestions: []
    });

    useEffect(() => {
        if (isOpen) {
            if (testToEdit) {
                const sanitizedQuestions = (testToEdit.questions || []).filter(q => q);
                const loadedModules = sanitizeModulesForType(testToEdit.modules, testToEdit.moduleType || 'mcq');
                setFormData({
                    title: testToEdit.title || '',
                    description: testToEdit.description || '',
                    topic: testToEdit.topic || '',
                    branch: testToEdit.branch || 'computer',
                    difficulty: testToEdit.difficulty || 'medium',
                    maxAttempts: testToEdit.maxAttempts || 1,
                    passingScore: testToEdit.passingScore || 40,
                    guidelines: testToEdit.guidelines || '',
                    isTimeRestricted: testToEdit.isTimeRestricted || false,
                    securityEnabled: testToEdit.securityEnabled || false,
                    startTime: toLocalDateTimeString(testToEdit.startTime),
                    endTime: toLocalDateTimeString(testToEdit.endTime),
                    isPublished: testToEdit.isPublished !== undefined ? testToEdit.isPublished : true,
                    moduleType: testToEdit.moduleType || 'mcq',
                    modules: loadedModules,
                    questions: sanitizedQuestions,
                    dsaQuestions: testToEdit.dsaQuestions || []
                });
            } else {
                setFormData({
                    title: '', description: '', topic: '', branch: 'computer', difficulty: 'medium',
                    maxAttempts: 1, timeLimit: 30, passingScore: 40, guidelines: '',
                    isTimeRestricted: false, securityEnabled: false, startTime: '', endTime: '', isPublished: true,
                    moduleType: 'mcq', modules: sanitizeModulesForType([], 'mcq'), questions: [], dsaQuestions: []
                });
            }
            setActiveMcqModuleIndex(0);
            setShowBulkImport(false); setShowDsaBulkImport(false);
            setBulkText(''); setDsaBulkText('');
        }
    }, [isOpen, testToEdit]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    // ─── MCQ Module handlers ───
    const addMcqModule = () => {
        setFormData(prev => ({
            ...prev,
            modules: [...prev.modules, { title: `Module ${prev.modules.length + 1}`, timeLimit: 30, moduleType: 'mcq' }]
        }));
    };

    const updateMcqModule = (index, field, value) => {
        const updated = [...formData.modules];
        updated[index][field] = value;
        setFormData(prev => ({ ...prev, modules: updated }));
    };

    const removeMcqModule = (index) => {
        setFormData(prev => ({ 
            ...prev, 
            modules: prev.modules.filter((_, i) => i !== index),
            questions: prev.questions.filter(q => q.moduleIndex !== index).map(q => ({
                ...q,
                moduleIndex: q.moduleIndex > index ? q.moduleIndex - 1 : q.moduleIndex
            }))
        }));
        if (activeMcqModuleIndex >= formData.modules.length - 1) {
            setActiveMcqModuleIndex(Math.max(0, formData.modules.length - 2));
        }
    };

    // ─── MCQ question handlers ───
    const addQuestion = () => {
        setFormData(prev => ({
            ...prev,
            questions: [...prev.questions, { question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '', codeSnippet: '', moduleIndex: activeMcqModuleIndex }]
        }));
    };

    const removeQuestion = (index) => {
        setFormData(prev => ({ ...prev, questions: prev.questions.filter((_, i) => i !== index) }));
    };

    const updateQuestion = (index, field, value) => {
        const updated = [...formData.questions];
        updated[index][field] = value;
        setFormData(prev => ({ ...prev, questions: updated }));
    };

    const updateOption = (qIndex, oIndex, value) => {
        const updated = [...formData.questions];
        updated[qIndex].options[oIndex] = value;
        setFormData(prev => ({ ...prev, questions: updated }));
    };

    const handleBulkImport = () => {
        const parsed = parseBulkMCQ(bulkText);
        if (parsed.length === 0) { toast.error('Could not parse any questions.'); return; }
        const withModule = parsed.map(p => ({ ...p, moduleIndex: activeMcqModuleIndex }));
        setFormData(prev => ({ ...prev, questions: [...prev.questions, ...withModule] }));
        toast.success(`${parsed.length} MCQ question(s) imported to Module ${activeMcqModuleIndex + 1}!`);
        setBulkText(''); setShowBulkImport(false);
    };

    // ─── DSA question handlers ───
    const addDsaQuestion = () => {
        setFormData(prev => ({
            ...prev,
            dsaQuestions: [...prev.dsaQuestions, {
                title: '', description: '', constraints: '', difficulty: 'medium',
                allowedLanguages: ['cpp', 'java', 'python', 'javascript'],
                maxScore: 100, timeLimit: 2, memoryLimit: 256, starterCode: {}, driverCode: {},
                publicTestCases: [{ input: '', expectedOutput: '', explanation: '' }, { input: '', expectedOutput: '', explanation: '' }],
                hiddenTestCases: [{ input: '', expectedOutput: '' }],
                moduleIndex: 0
            }]
        }));
    };

    const removeDsaQuestion = (index) => {
        setFormData(prev => ({ ...prev, dsaQuestions: prev.dsaQuestions.filter((_, i) => i !== index) }));
    };

    const updateDsaQuestion = (index, field, value) => {
        const updated = [...formData.dsaQuestions];
        updated[index] = { ...updated[index], [field]: value };
        setFormData(prev => ({ ...prev, dsaQuestions: updated }));
    };

    const handleDsaBulkImport = () => {
        try {
            const parsed = JSON.parse(dsaBulkText);
            if (!Array.isArray(parsed) || parsed.length === 0) {
                toast.error('Invalid JSON format. Expected an array of DSA questions.'); return;
            }
            let added = 0;
            let skipped = [];
            for (const dq of parsed) {
                const missing = [];
                if (!dq.title) missing.push('Title');
                if (!dq.description) missing.push('Description');
                if (!dq.publicTestCases || dq.publicTestCases.length < 2) {
                    missing.push(`Public Test Cases (got ${dq.publicTestCases?.length || 0}, need at least 2)`);
                }
                if (!dq.hiddenTestCases || dq.hiddenTestCases.length < 1) {
                    missing.push(`Hidden Test Cases (got ${dq.hiddenTestCases?.length || 0}, need at least 1)`);
                }

                if (missing.length === 0) {
                    formData.dsaQuestions.push({
                        title: dq.title, description: dq.description, constraints: Array.isArray(dq.constraints) ? dq.constraints.join('\n') : (dq.constraints || ''),
                        difficulty: dq.difficulty || 'medium',
                        allowedLanguages: dq.allowedLanguages || ['cpp', 'java', 'python', 'javascript'],
                        maxScore: dq.maxScore || 100, timeLimit: dq.timeLimit || 2, memoryLimit: dq.memoryLimit || 256,
                        starterCode: dq.starterCode || {},
                        driverCode: dq.driverCode || {},
                        publicTestCases: dq.publicTestCases, hiddenTestCases: dq.hiddenTestCases, moduleIndex: 0
                    });
                    added++;
                } else {
                    skipped.push(`"${dq.title || 'Untitled'}" (Missing: ${missing.join(', ')})`);
                }
            }
            setFormData(prev => ({ ...prev, dsaQuestions: [...prev.dsaQuestions] }));
            if (added > 0) {
                toast.success(`${added} DSA question(s) imported!`);
            }
            if (skipped.length > 0) {
                toast.error(`Skipped ${skipped.length} question(s):\n${skipped.join('\n')}`, { duration: 6000 });
            }
            if (added > 0) {
                setDsaBulkText(''); setShowDsaBulkImport(false);
            }
        } catch (e) {
            toast.error('Invalid JSON. Please check the format.');
        }
    };

    // ─── Submit ───
    const handleSubmit = async () => {
        if (!formData.title || !formData.topic) { toast.error('Please fill in Title and Topic'); return; }

        if (formData.moduleType === 'mcq' && formData.questions.length === 0) {
            toast.error('MCQ test requires at least 1 question'); return;
        }
        if (formData.moduleType === 'dsa' && formData.dsaQuestions.length === 0) {
            toast.error('DSA test requires at least 1 DSA question'); return;
        }
        if (formData.moduleType === 'mixed' && formData.questions.length === 0 && formData.dsaQuestions.length === 0) {
            toast.error('Mixed test requires at least 1 MCQ or DSA question'); return;
        }

        // Validate MCQ questions
        for (let i = 0; i < formData.questions.length; i++) {
            const q = formData.questions[i];
            if (!q.question.trim()) { toast.error(`MCQ Question ${i + 1} text is empty`); return; }
            if (q.options.some(opt => !opt.trim())) { toast.error(`All options for MCQ Question ${i + 1} must be filled`); return; }
        }

        // Validate DSA questions
        for (let i = 0; i < formData.dsaQuestions.length; i++) {
            const dq = formData.dsaQuestions[i];
            if (!dq.title?.trim()) { toast.error(`DSA Problem ${i + 1} title is empty`); return; }
            if (!dq.description?.trim()) { toast.error(`DSA Problem ${i + 1} description is empty`); return; }
            if (!dq.publicTestCases || dq.publicTestCases.length < 2) { toast.error(`DSA Problem ${i + 1} needs at least 2 public test cases`); return; }
            if (!dq.hiddenTestCases || dq.hiddenTestCases.length < 1) { toast.error(`DSA Problem ${i + 1} needs at least 1 hidden test case`); return; }
            for (let j = 0; j < dq.publicTestCases.length; j++) {
                if (!dq.publicTestCases[j].input?.trim() || !dq.publicTestCases[j].expectedOutput?.trim()) {
                    toast.error(`DSA Problem ${i + 1}, Public Case ${j + 1} input/output is empty`); return;
                }
            }
            for (let j = 0; j < dq.hiddenTestCases.length; j++) {
                if (!dq.hiddenTestCases[j].input?.trim() || !dq.hiddenTestCases[j].expectedOutput?.trim()) {
                    toast.error(`DSA Problem ${i + 1}, Hidden Case ${j + 1} input/output is empty`); return;
                }
            }
        }

        if (formData.isTimeRestricted) {
            if (!formData.startTime || !formData.endTime) { toast.error('Please select both start and end times'); return; }
            if (new Date(formData.startTime) >= new Date(formData.endTime)) { toast.error('Start time must be before end time'); return; }
        }

        const calculatedTimeLimit = formData.modules.reduce((sum, m) => sum + (m.timeLimit || 0), 0);
        const payload = {
            ...formData,
            timeLimit: calculatedTimeLimit,
            passingScore: parseInt(formData.passingScore) || 40,
            maxAttempts: parseInt(formData.maxAttempts) || 1,
            startTime: (formData.isTimeRestricted && formData.startTime) ? new Date(formData.startTime).toISOString() : null,
            endTime: (formData.isTimeRestricted && formData.endTime) ? new Date(formData.endTime).toISOString() : null
        };

        await onSave(testToEdit ? testToEdit._id : null, payload);
    };

    if (!isOpen) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-[rgb(var(--bg-card))] w-full max-w-5xl rounded-2xl border border-[rgb(var(--border))] shadow-2xl flex flex-col max-h-[92vh]"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-[rgb(var(--border))] shrink-0">
                            <h2 className="text-2xl font-bold text-[rgb(var(--text-primary))]">
                                {testToEdit ? 'Edit Practice Test' : 'Create Practice Test'}
                            </h2>
                            <button onClick={onClose} className="p-2 hover:bg-[rgb(var(--bg-elevated))] rounded-full transition-colors">
                                <X className="w-6 h-6 text-[rgb(var(--text-muted))]" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* ═══ Module Type Selector ═══ */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-[rgb(var(--text-secondary))]">Test Module Type</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { id: 'mcq', label: 'MCQ Only', icon: BookOpen, desc: 'Multiple choice questions', color: 'blue' },
                                        { id: 'dsa', label: 'DSA Coding', icon: Code, desc: 'Coding problems with test cases', color: 'cyan' },
                                        { id: 'mixed', label: 'Mixed', icon: Layers, desc: 'MCQ + DSA modules', color: 'violet' }
                                    ].map(type => (
                                        <button key={type.id} onClick={() => setFormData(prev => ({ ...prev, moduleType: type.id, modules: sanitizeModulesForType(prev.modules, type.id) }))}
                                            className={`p-4 rounded-xl border-2 text-left transition-all group
                                                ${formData.moduleType === type.id
                                                    ? `border-${type.color}-500 bg-${type.color}-500/10 shadow-lg shadow-${type.color}-500/10`
                                                    : 'border-[rgb(var(--border))] hover:border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-elevated))]'
                                                }`}
                                        >
                                            <type.icon className={`w-6 h-6 mb-2 ${formData.moduleType === type.id ? `text-${type.color}-500` : 'text-[rgb(var(--text-muted))]'}`} />
                                            <div className={`text-sm font-bold ${formData.moduleType === type.id ? 'text-[rgb(var(--text-primary))]' : 'text-[rgb(var(--text-secondary))]'}`}>{type.label}</div>
                                            <div className="text-xs text-[rgb(var(--text-muted))] mt-0.5">{type.desc}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* ═══ Basic Info ═══ */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-[rgb(var(--text-secondary))]">Test Title</label>
                                    <input type="text" name="title" value={formData.title} onChange={handleChange}
                                        className="w-full px-4 py-2 bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--accent))] outline-none text-[rgb(var(--text-primary))]"
                                        placeholder="e.g. JavaScript Basics Mastery" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-[rgb(var(--text-secondary))]">Topic/Category</label>
                                    <input type="text" name="topic" value={formData.topic} onChange={handleChange}
                                        className="w-full px-4 py-2 bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--accent))] outline-none text-[rgb(var(--text-primary))]"
                                        placeholder="e.g. JavaScript" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-[rgb(var(--text-secondary))]">Branch</label>
                                    <select name="branch" value={formData.branch} onChange={handleChange}
                                        className="w-full px-4 py-2 bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--accent))] outline-none text-[rgb(var(--text-primary))]">
                                        {BRANCHES.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                    </select>
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-sm font-medium text-[rgb(var(--text-secondary))]">Description</label>
                                    <textarea name="description" value={formData.description} onChange={handleChange} rows={2}
                                        className="w-full px-4 py-2 bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--accent))] outline-none text-[rgb(var(--text-primary))]"
                                        placeholder="Brief description..." />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-sm font-medium text-[rgb(var(--text-secondary))]">Guidelines / Instructions</label>
                                    <textarea name="guidelines" value={formData.guidelines} onChange={handleChange} rows={3}
                                        className="w-full px-4 py-2 bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--accent))] outline-none text-[rgb(var(--text-primary))]"
                                        placeholder="Instructions shown to students before starting the test..." />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-[rgb(var(--text-secondary))]">Difficulty</label>
                                    <select name="difficulty" value={formData.difficulty} onChange={handleChange}
                                        className="w-full px-4 py-2 bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--accent))] outline-none text-[rgb(var(--text-primary))]">
                                        <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-[rgb(var(--text-secondary))]">Max Attempts</label>
                                    <input type="number" min="1" name="maxAttempts" value={formData.maxAttempts} onChange={handleChange}
                                        className="w-full px-4 py-2 bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--accent))] outline-none text-[rgb(var(--text-primary))]" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-[rgb(var(--text-secondary))]">Time Limit (mins) <span className="text-xs text-[rgb(var(--text-muted))]">(Auto-calculated)</span></label>
                                    <input type="number" readOnly value={formData.modules.reduce((sum, m) => sum + (m.timeLimit || 0), 0)}
                                        className="w-full px-4 py-2 bg-[rgb(var(--bg-elevated))]/50 border border-[rgb(var(--border))] rounded-lg outline-none text-[rgb(var(--text-primary))] cursor-not-allowed font-semibold" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-[rgb(var(--text-secondary))]">Passing Score (%)</label>
                                    <input type="number" min="1" max="100" name="passingScore" value={formData.passingScore} onChange={handleChange}
                                        className="w-full px-4 py-2 bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--accent))] outline-none text-[rgb(var(--text-primary))]" />
                                </div>

                                {/* Time restriction */}
                                <div className="md:col-span-2 p-4 bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border))] rounded-lg">
                                    <label className="flex items-center space-x-3 cursor-pointer mb-4">
                                        <input type="checkbox" name="isTimeRestricted" checked={formData.isTimeRestricted} onChange={handleChange}
                                            className="w-5 h-5 rounded border-[rgb(var(--border))] text-[rgb(var(--accent))] focus:ring-[rgb(var(--accent))] bg-transparent" />
                                        <span className="text-sm font-medium text-[rgb(var(--text-primary))]">Restrict Test Availability to Specific Date/Time</span>
                                    </label>
                                    {formData.isTimeRestricted && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-[rgb(var(--text-secondary))]">Available From</label>
                                                <input type="datetime-local" name="startTime" value={formData.startTime || ''} onChange={handleChange}
                                                    className="w-full px-4 py-2 bg-[rgb(var(--bg-body-alt))] border border-[rgb(var(--border-subtle))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--accent))] outline-none text-[rgb(var(--text-primary))]" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-[rgb(var(--text-secondary))]">Available Until</label>
                                                <input type="datetime-local" name="endTime" value={formData.endTime || ''} onChange={handleChange}
                                                    className="w-full px-4 py-2 bg-[rgb(var(--bg-body-alt))] border border-[rgb(var(--border-subtle))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--accent))] outline-none text-[rgb(var(--text-primary))]" />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Security toggle */}
                                <div className="md:col-span-2 p-4 bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border))] rounded-lg">
                                    <label className="flex items-center space-x-3 cursor-pointer">
                                        <input type="checkbox" name="securityEnabled" checked={formData.securityEnabled} onChange={handleChange}
                                            className="w-5 h-5 rounded border-[rgb(var(--border))] text-[rgb(var(--accent))] focus:ring-[rgb(var(--accent))] bg-transparent" />
                                        <div>
                                            <span className="text-sm font-medium text-[rgb(var(--text-primary))] block">Security (Proctoring/Fullscreen)</span>
                                            <span className="text-xs text-[rgb(var(--text-secondary))]">When enabled, strict tab-switching and fullscreen monitoring will be enforced.</span>
                                        </div>
                                    </label>
                                </div>

                                {/* Published toggle */}
                                <div className="md:col-span-2 p-4 bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border))] rounded-lg">
                                    <label className="flex items-center space-x-3 cursor-pointer">
                                        <input type="checkbox" name="isPublished" checked={formData.isPublished} onChange={handleChange}
                                            className="w-5 h-5 rounded border-[rgb(var(--border))] text-[rgb(var(--accent))] focus:ring-[rgb(var(--accent))] bg-transparent" />
                                        <div>
                                            <span className="text-sm font-medium text-[rgb(var(--text-primary))] block">Published (Visible to Students)</span>
                                            <span className="text-xs text-[rgb(var(--text-secondary))]">When enabled, this test will appear in the public practice library.</span>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <div className="border-t border-[rgb(var(--border))] my-6"></div>

                            {/* ═══ MCQ MODULES (shown for mcq and mixed) ═══ */}
                            {(formData.moduleType === 'mcq' || formData.moduleType === 'mixed') && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between flex-wrap gap-3">
                                        <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))] flex items-center gap-2">
                                            <Layers className="w-5 h-5 text-indigo-500" /> MCQ Modules ({formData.modules.length})
                                        </h3>
                                        <Button onClick={addMcqModule} size="sm" className="bg-indigo-600 text-white hover:opacity-90">
                                            <Plus className="w-4 h-4 mr-2" /> Add Module
                                        </Button>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {formData.modules.map((mod, mIndex) => (
                                            <button 
                                                key={mIndex} 
                                                onClick={() => setActiveMcqModuleIndex(mIndex)}
                                                className={`px-4 py-2 rounded-xl border text-sm font-semibold transition-all flex items-center gap-2 ${
                                                    activeMcqModuleIndex === mIndex 
                                                        ? 'border-indigo-500 bg-indigo-500/10 text-indigo-500' 
                                                        : 'border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated))] text-[rgb(var(--text-secondary))] hover:border-indigo-500/50'
                                                }`}
                                            >
                                                {mod.title || `Module ${mIndex + 1}`}
                                                {formData.modules.length > 1 && (
                                                    <div 
                                                        onClick={(e) => { e.stopPropagation(); removeMcqModule(mIndex); }}
                                                        className="p-1 rounded-md hover:bg-red-500/20 text-red-500 transition-colors ml-2"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Active Module Settings */}
                                    {formData.modules[activeMcqModuleIndex] && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border))] rounded-xl">
                                            <div className="space-y-2">
                                                <label className="text-xs font-semibold text-[rgb(var(--text-muted))]">Module Title *</label>
                                                <input type="text" value={formData.modules[activeMcqModuleIndex].title} onChange={(e) => updateMcqModule(activeMcqModuleIndex, 'title', e.target.value)}
                                                    className="w-full px-3 py-2 bg-[rgb(var(--bg-main))] border border-[rgb(var(--border))] rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none text-[rgb(var(--text-primary))] text-sm" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-semibold text-[rgb(var(--text-muted))]">Time Limit (mins) *</label>
                                                <input type="number" min="1" value={formData.modules[activeMcqModuleIndex].timeLimit} onChange={(e) => updateMcqModule(activeMcqModuleIndex, 'timeLimit', parseInt(e.target.value) || 1)}
                                                    className="w-full px-3 py-2 bg-[rgb(var(--bg-main))] border border-[rgb(var(--border))] rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none text-[rgb(var(--text-primary))] text-sm" />
                                            </div>
                                        </div>
                                    )}

                                    <div className="border-t border-[rgb(var(--border))] my-6"></div>

                                    <div className="flex items-center justify-between flex-wrap gap-3">
                                        <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))] flex items-center gap-2">
                                            <BookOpen className="w-5 h-5 text-blue-500" /> Questions in {formData.modules[activeMcqModuleIndex]?.title || 'Module'} ({formData.questions.filter(q => q.moduleIndex === activeMcqModuleIndex).length})
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <Button onClick={() => setShowBulkImport(!showBulkImport)} size="sm"
                                                className={`border transition-all ${showBulkImport ? 'bg-purple-500/10 text-purple-600 border-purple-500/30' : 'bg-[rgb(var(--bg-elevated))] text-[rgb(var(--text-secondary))] border-[rgb(var(--border))] hover:border-purple-500/40'}`}>
                                                <Upload className="w-4 h-4 mr-2" /> Bulk Import
                                            </Button>
                                            <Button onClick={addQuestion} size="sm" className="bg-[rgb(var(--accent))] text-white hover:opacity-90">
                                                <Plus className="w-4 h-4 mr-2" /> Add Question
                                            </Button>
                                        </div>
                                    </div>

                                    {/* MCQ Bulk Import (same as original) */}
                                    <AnimatePresence>
                                        {showBulkImport && (
                                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                                                <div className="bg-gradient-to-br from-purple-500/5 to-blue-500/5 border border-purple-500/20 rounded-2xl p-5 space-y-4">
                                                    <div className="flex items-start gap-3">
                                                        <div className="bg-purple-500/10 p-2 rounded-xl shrink-0"><Sparkles className="w-5 h-5 text-purple-500" /></div>
                                                        <div>
                                                            <h4 className="text-sm font-bold text-[rgb(var(--text-primary))] mb-1">Bulk Import MCQ Questions</h4>
                                                            <p className="text-xs text-[rgb(var(--text-secondary))]">Paste MCQ questions in numbered format with A/B/C/D options and Answer: X</p>
                                                        </div>
                                                    </div>
                                                    <div className="bg-[rgb(var(--bg-main))] border border-[rgb(var(--border))] rounded-xl p-3 text-xs font-mono text-[rgb(var(--text-secondary))]">
                                                        <div className="text-[10px] font-bold text-[rgb(var(--text-muted))] uppercase tracking-wider mb-2 font-sans">Format (Optional: Code Snippet & Explanation)</div>
                                                        {"1. Question text here\ncode snippet:\n```js\nconsole.log('hi');\n```\nA) Option A\nB) Option B\nC) Option C\nD) Option D\nAnswer: A\nExplanation: Why A is correct"}
                                                    </div>
                                                    <textarea value={bulkText} onChange={(e) => setBulkText(e.target.value)} rows={8}
                                                        className="w-full px-4 py-3 bg-[rgb(var(--bg-main))] border border-[rgb(var(--border))] rounded-xl focus:ring-2 focus:ring-purple-500/30 outline-none text-[rgb(var(--text-primary))] text-sm font-mono resize-y"
                                                        placeholder={"1. What is the output?\nA) 10\nB) 11\nC) undefined\nD) NaN\nAnswer: A\nExplanation: ..."} />
                                                    <div className="flex justify-between items-center gap-2">
                                                        <Button size="sm" variant="outline" onClick={() => setBulkText("1. What is the time complexity of binary search?\nA) O(1)\nB) O(n)\nC) O(log n)\nD) O(n^2)\nAnswer: C\nExplanation: Binary search halves the search space in each step, leading to a logarithmic time complexity.\n\n2. Which of the following is a dynamically typed language?\nA) Java\nB) C++\nC) Python\nD) C#\nAnswer: C\nExplanation: Python determines variable types at runtime, making it dynamically typed.")} className="text-purple-600 border-purple-500/30 hover:bg-purple-500/10 hidden sm:flex text-xs">Load Demo Format</Button>
                                                        <div className="flex gap-2">
                                                            <Button size="sm" variant="ghost" onClick={() => { setShowBulkImport(false); setBulkText(''); }}>Cancel</Button>
                                                            <Button size="sm" onClick={handleBulkImport} disabled={!bulkText.trim()}
                                                                className="bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-40">
                                                                <Sparkles className="w-4 h-4 mr-2" /> Parse & Import
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* MCQ Question List */}
                                    {formData.questions.filter(q => q.moduleIndex === activeMcqModuleIndex).length === 0 && !showBulkImport ? (
                                        <div className="text-center py-8 border-2 border-dashed border-[rgb(var(--border))] rounded-xl bg-[rgb(var(--bg-elevated))]/30 text-[rgb(var(--text-muted))]">
                                            No MCQ questions added to this module yet.
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {formData.questions.map((q, qIndex) => {
                                                if (!q || q.moduleIndex !== activeMcqModuleIndex) return null;
                                                return (
                                                    <div key={qIndex} className="bg-[rgb(var(--bg-elevated))] p-4 rounded-xl border border-[rgb(var(--border))] relative group">
                                                        <button onClick={() => removeQuestion(qIndex)}
                                                            className="absolute top-4 right-4 text-red-500 hover:bg-red-500/10 p-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                        <div className="mb-3 pr-10">
                                                            <label className="text-xs font-semibold text-[rgb(var(--text-muted))] uppercase mb-1 block">Question {qIndex + 1}</label>
                                                            <textarea value={q.question} onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                                                                className="w-full px-3 py-2 bg-[rgb(var(--bg-main))] border border-[rgb(var(--border))] rounded-lg focus:ring-1 focus:ring-[rgb(var(--accent))] outline-none text-[rgb(var(--text-primary))] text-sm"
                                                                placeholder="Enter question text..." rows={2} />
                                                        </div>
                                                        <div className="mb-3 pr-10">
                                                            <label className="text-xs font-semibold text-[rgb(var(--text-muted))] uppercase mb-1 block">Code Snippet (Optional)</label>
                                                            <textarea value={q.codeSnippet || ''} onChange={(e) => updateQuestion(qIndex, 'codeSnippet', e.target.value)}
                                                                className="w-full px-3 py-2 bg-[rgb(var(--bg-main))] border border-[rgb(var(--border))] rounded-lg focus:ring-1 focus:ring-[rgb(var(--accent))] outline-none text-[rgb(var(--text-primary))] font-mono text-sm"
                                                                placeholder="// Paste code here..." rows={2} />
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                                                            {q.options.map((opt, oIndex) => (
                                                                <div key={oIndex} className="flex items-center gap-2">
                                                                    <input type="radio" name={`correct-${qIndex}`} checked={q.correctAnswer === oIndex}
                                                                        onChange={() => updateQuestion(qIndex, 'correctAnswer', oIndex)}
                                                                        className="w-4 h-4 text-[rgb(var(--accent))]" />
                                                                    <input type="text" value={opt} onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                                                                        className={`flex-1 px-3 py-1.5 bg-[rgb(var(--bg-main))] border rounded-lg outline-none text-sm ${q.correctAnswer === oIndex ? 'border-green-500/50 ring-1 ring-green-500/20' : 'border-[rgb(var(--border))]'}`}
                                                                        placeholder={`Option ${String.fromCharCode(65 + oIndex)}`} />
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <div>
                                                            <label className="text-xs font-semibold text-[rgb(var(--text-muted))] uppercase mb-1 block">Explanation (Optional)</label>
                                                            <textarea value={q.explanation} onChange={(e) => updateQuestion(qIndex, 'explanation', e.target.value)}
                                                                className="w-full px-3 py-2 bg-[rgb(var(--bg-main))] border border-[rgb(var(--border))] rounded-lg focus:ring-1 focus:ring-[rgb(var(--accent))] outline-none text-[rgb(var(--text-primary))] text-sm"
                                                                placeholder="Explain the correct answer..." rows={1} />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ═══ DSA QUESTIONS (shown for dsa and mixed) ═══ */}
                            {(formData.moduleType === 'dsa' || formData.moduleType === 'mixed') && (
                                <>
                                    {formData.moduleType === 'mixed' && <div className="border-t border-[rgb(var(--border))] my-6"></div>}
                                    <div className="space-y-4">
                                        {/* DSA Module Config (Time Limit in Minutes) */}
                                        {formData.modules.find(m => m.moduleType === 'dsa') && (
                                            <div className="p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-xl space-y-3">
                                                <h4 className="text-sm font-bold text-[rgb(var(--text-primary))] flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-cyan-500" /> DSA Coding Module Config
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-1">
                                                        <label className="text-xs font-semibold text-[rgb(var(--text-muted))]">Module Title</label>
                                                        <input type="text"
                                                            value={formData.modules.find(m => m.moduleType === 'dsa').title}
                                                            onChange={(e) => {
                                                                const updated = formData.modules.map(m => m.moduleType === 'dsa' ? { ...m, title: e.target.value } : m);
                                                                setFormData(prev => ({ ...prev, modules: updated }));
                                                            }}
                                                            className="w-full px-3 py-1.5 bg-[rgb(var(--bg-main))] border border-[rgb(var(--border))] rounded-lg focus:ring-1 focus:ring-cyan-500 outline-none text-[rgb(var(--text-primary))] text-sm" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-xs font-semibold text-[rgb(var(--text-muted))]">DSA Coding Time Limit (minutes) *</label>
                                                        <input type="number" min="1"
                                                            value={formData.modules.find(m => m.moduleType === 'dsa').timeLimit}
                                                            onChange={(e) => {
                                                                const updated = formData.modules.map(m => m.moduleType === 'dsa' ? { ...m, timeLimit: parseInt(e.target.value) || 1 } : m);
                                                                setFormData(prev => ({ ...prev, modules: updated }));
                                                            }}
                                                            className="w-full px-3 py-1.5 bg-[rgb(var(--bg-main))] border border-[rgb(var(--border))] rounded-lg focus:ring-1 focus:ring-cyan-500 outline-none text-[rgb(var(--text-primary))] text-sm" />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between flex-wrap gap-3">
                                            <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))] flex items-center gap-2">
                                                <Code className="w-5 h-5 text-cyan-500" /> DSA Coding Problems ({formData.dsaQuestions.length})
                                            </h3>
                                            <div className="flex items-center gap-2">
                                                <Button onClick={() => setShowDsaBulkImport(!showDsaBulkImport)} size="sm"
                                                    className={`border transition-all ${showDsaBulkImport ? 'bg-cyan-500/10 text-cyan-600 border-cyan-500/30' : 'bg-[rgb(var(--bg-elevated))] text-[rgb(var(--text-secondary))] border-[rgb(var(--border))] hover:border-cyan-500/40'}`}>
                                                    <Upload className="w-4 h-4 mr-2" /> Bulk Import JSON
                                                </Button>
                                                <Button onClick={addDsaQuestion} size="sm" className="bg-cyan-500 text-white hover:bg-cyan-600">
                                                    <Plus className="w-4 h-4 mr-2" /> Add Problem
                                                </Button>
                                            </div>
                                        </div>

                                        {/* DSA Bulk Import */}
                                        <AnimatePresence>
                                            {showDsaBulkImport && (
                                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                                                    <div className="bg-gradient-to-br from-cyan-500/5 to-blue-500/5 border border-cyan-500/20 rounded-2xl p-5 space-y-4">
                                                        <div className="flex items-start gap-3">
                                                            <div className="bg-cyan-500/10 p-2 rounded-xl shrink-0"><Code className="w-5 h-5 text-cyan-500" /></div>
                                                            <div>
                                                                <h4 className="text-sm font-bold text-[rgb(var(--text-primary))] mb-1">Bulk Import DSA Questions (JSON)</h4>
                                                                <p className="text-xs text-[rgb(var(--text-secondary))]">Paste a JSON array of DSA questions with public/hidden test cases</p>
                                                            </div>
                                                        </div>
                                                        <div className="bg-[rgb(var(--bg-main))] border border-[rgb(var(--border))] rounded-xl p-3 text-xs font-mono text-[rgb(var(--text-secondary))] whitespace-pre-wrap">
                                                            <div className="text-[10px] font-bold text-[rgb(var(--text-muted))] uppercase tracking-wider mb-2 font-sans">Format</div>
                                                            {'[\n  {\n    "title": "Two Sum",\n    "description": "...",\n    "difficulty": "easy",\n    "publicTestCases": [{"input": "...", "expectedOutput": "...", "explanation": "..."}],\n    "hiddenTestCases": [{"input": "...", "expectedOutput": "..."}]\n  }\n]'}
                                                        </div>
                                                        <textarea value={dsaBulkText} onChange={(e) => setDsaBulkText(e.target.value)} rows={8}
                                                            className="w-full px-4 py-3 bg-[rgb(var(--bg-main))] border border-[rgb(var(--border))] rounded-xl focus:ring-2 focus:ring-cyan-500/30 outline-none text-[rgb(var(--text-primary))] text-sm font-mono resize-y"
                                                            placeholder='[{"title": "Two Sum", "description": "Given an array...", ...}]' />
                                                        <div className="flex justify-between items-center gap-2">
                                                            <Button size="sm" variant="outline" onClick={() => setDsaBulkText('[\n  {\n    "title": "Two Sum",\n    "difficulty": "Easy",\n    "description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",\n    "allowedLanguages": ["javascript", "python", "cpp", "java"],\n    "publicTestCases": [\n      {\n        "input": "nums = [2,7,11,15]\\ntarget = 9",\n        "expectedOutput": "[0,1]",\n        "explanation": "Because nums[0] + nums[1] == 9, we return [0, 1]."\n      },\n      {\n        "input": "nums = [3,2,4]\\ntarget = 6",\n        "expectedOutput": "[1,2]",\n        "explanation": "Because nums[1] + nums[2] == 6, we return [1, 2]."\n      }\n    ],\n    "hiddenTestCases": [\n      {\n        "input": "nums = [3,3]\\ntarget = 6",\n        "expectedOutput": "[0,1]"\n      }\n    ]\n  }\n]')} className="text-cyan-600 border-cyan-500/30 hover:bg-cyan-500/10 hidden sm:flex text-xs">Load Demo Format</Button>
                                                            <div className="flex gap-2">
                                                                <Button size="sm" variant="ghost" onClick={() => { setShowDsaBulkImport(false); setDsaBulkText(''); }}>Cancel</Button>
                                                                <Button size="sm" onClick={handleDsaBulkImport} disabled={!dsaBulkText.trim()}
                                                                    className="bg-cyan-600 text-white hover:bg-cyan-700 disabled:opacity-40">
                                                                    <Sparkles className="w-4 h-4 mr-2" /> Parse & Import
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* DSA Question List */}
                                        {formData.dsaQuestions.length === 0 && !showDsaBulkImport ? (
                                            <div className="text-center py-8 border-2 border-dashed border-cyan-500/20 rounded-xl bg-cyan-500/5 text-[rgb(var(--text-muted))]">
                                                No DSA problems added yet. Click "Add Problem" or use "Bulk Import JSON".
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {formData.dsaQuestions.map((dq, idx) => (
                                                    <DSAQuestionEditor
                                                        key={idx}
                                                        question={dq}
                                                        index={idx}
                                                        onUpdate={updateDsaQuestion}
                                                        onRemove={removeDsaQuestion}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-[rgb(var(--border))] flex justify-end gap-3 bg-[rgb(var(--bg-card))] rounded-b-2xl shrink-0">
                            <Button variant="outline" onClick={onClose} className="border-[rgb(var(--border))] text-[rgb(var(--text-secondary))]">Cancel</Button>
                            <Button onClick={handleSubmit} className="bg-[rgb(var(--accent))] text-white hover:opacity-90 shadow-lg shadow-[rgb(var(--accent))]/20">
                                <Save className="w-4 h-4 mr-2" /> Save Test
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default PracticeTestModal;

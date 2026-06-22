import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, CheckCircle, AlertCircle, Save, Upload, FileText, Sparkles } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import toast from 'react-hot-toast';
import { BRANCHES } from '../../../utils/constants';

/**
 * Parse bulk MCQ text into structured question objects.
 * Supports formats:
 *   1. Question text?
 *   ```
 *   code here
 *   ```
 *   A) Option A  /  A. Option A  /  a) Option A
 *   B) Option B
 *   C) Option C
 *   D) Option D
 *   ANSWER: A  /  Answer: B  /  Correct: C  /  Right Answer: D
 *   Explanation: ...
 *
 * Code snippets can also be specified with:
 *   Code: <single-line code>
 *   Code Snippet: <single-line code>
 */
function parseBulkMCQ(text) {
    const parsed = [];
    if (!text || !text.trim()) return parsed;

    // Split into question blocks by numbered pattern (1. / 1) / Q1.)
    const blocks = text.split(/(?=^\s*(?:Q?\.?\s*)?\d+[.):]\s)/m).filter(b => b.trim());

    for (const block of blocks) {
        try {
            // Extract question text (everything before first option)
            const qMatch = block.match(/^\s*(?:Q?\.?\s*)?\d+[.):]\s*([\s\S]*?)(?=^\s*[Aa][.)\s])/m);
            if (!qMatch) continue;
            let rawQuestionText = qMatch[1].trim();
            if (!rawQuestionText) continue;

            // --- Extract code snippets from question text ---
            let codeSnippet = '';

            // 1. Fenced code blocks: ```lang\ncode\n``` or ```\ncode\n```
            const fencedCodeMatch = rawQuestionText.match(/```(?:\w*)?\n?([\s\S]*?)```/);
            if (fencedCodeMatch) {
                codeSnippet = fencedCodeMatch[1].trim();
                // Remove the code block from question text
                rawQuestionText = rawQuestionText.replace(/```(?:\w*)?\n?[\s\S]*?```/, '').trim();
            }

            // 2. "Code:" or "Code Snippet:" labeled blocks (if no fenced block found)
            if (!codeSnippet) {
                const labeledCodeMatch = rawQuestionText.match(/(?:code\s*snippet|code)\s*[:=]\s*([\s\S]+?)$/im);
                if (labeledCodeMatch) {
                    codeSnippet = labeledCodeMatch[1].trim();
                    rawQuestionText = rawQuestionText.replace(/(?:code\s*snippet|code)\s*[:=]\s*[\s\S]+?$/im, '').trim();
                }
            }

            // 3. Also check the full block for a standalone "Code Snippet:" section between question and options
            if (!codeSnippet) {
                const standaloneCode = block.match(/(?:code\s*snippet|code)\s*[:=]\s*([\s\S]*?)(?=^\s*[Aa][.)\s])/im);
                if (standaloneCode) {
                    codeSnippet = standaloneCode[1].trim();
                }
            }

            const questionText = rawQuestionText;

            // Extract options A-D
            const options = ['', '', '', ''];
            const optPatterns = [
                /^\s*[Aa][.)\s]\s*(.+)/m,
                /^\s*[Bb][.)\s]\s*(.+)/m,
                /^\s*[Cc][.)\s]\s*(.+)/m,
                /^\s*[Dd][.)\s]\s*(.+)/m
            ];
            for (let i = 0; i < 4; i++) {
                const m = block.match(optPatterns[i]);
                if (m) options[i] = m[1].trim();
            }

            // Extract correct answer
            const ansMatch = block.match(/(?:answer|correct|right\s*answer)\s*[:=]\s*([A-Da-d])/i);
            let correctAnswer = 0;
            if (ansMatch) {
                correctAnswer = ansMatch[1].toUpperCase().charCodeAt(0) - 65;
            }

            // Extract explanation if present
            const expMatch = block.match(/(?:explanation|reason)\s*[:=]\s*(.+)/i);
            const explanation = expMatch ? expMatch[1].trim() : '';

            if (options.every(o => o)) {
                parsed.push({
                    question: questionText,
                    options,
                    correctAnswer,
                    explanation,
                    codeSnippet
                });
            }
        } catch (e) {
            // Skip unparseable blocks
            continue;
        }
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

const PracticeTestModal = ({ isOpen, onClose, onSave, testToEdit }) => {
    const [step, setStep] = useState(1);
    const [showBulkImport, setShowBulkImport] = useState(false);
    const [bulkText, setBulkText] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        topic: '',
        branch: 'computer',
        difficulty: 'medium',
        maxAttempts: 1,
        timeLimit: 30,
        passingScore: 40,
        guidelines: '',
        isTimeRestricted: false,
        startTime: '',
        endTime: '',
        isPublished: true,
        questions: []
    });

    // Reset or populate form on open
    useEffect(() => {
        if (isOpen) {
            if (testToEdit) {
                // Sanitize questions to remove nulls
                const sanitizedQuestions = (testToEdit.questions || []).filter(q => q);
                setFormData({ 
                    ...testToEdit, 
                    questions: sanitizedQuestions,
                    startTime: toLocalDateTimeString(testToEdit.startTime),
                    endTime: toLocalDateTimeString(testToEdit.endTime)
                });
                setStep(1);
            } else {
                setFormData({
                    title: '',
                    description: '',
                    topic: '',
                    branch: 'computer',
                    difficulty: 'medium',
                    maxAttempts: 1,
                    timeLimit: 30,
                    passingScore: 40,
                    guidelines: '',
                    isTimeRestricted: false,
                    startTime: '',
                    endTime: '',
                    isPublished: true,
                    questions: []
                });
                setStep(1);
            }
            setShowBulkImport(false);
            setBulkText('');
        }
    }, [isOpen, testToEdit]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const addQuestion = () => {
        setFormData(prev => ({
            ...prev,
            questions: [
                ...prev.questions,
                {
                    question: '',
                    options: ['', '', '', ''],
                    correctAnswer: 0,
                    explanation: '',
                    codeSnippet: '' // Added
                }
            ]
        }));
    };

    const handleBulkImport = () => {
        const parsed = parseBulkMCQ(bulkText);
        if (parsed.length === 0) {
            toast.error('Could not parse any questions. Please check the format.');
            return;
        }
        setFormData(prev => ({
            ...prev,
            questions: [...prev.questions, ...parsed]
        }));
        toast.success(`${parsed.length} question${parsed.length > 1 ? 's' : ''} imported successfully!`);
        setBulkText('');
        setShowBulkImport(false);
    };

    const removeQuestion = (index) => {
        setFormData(prev => ({
            ...prev,
            questions: prev.questions.filter((_, i) => i !== index)
        }));
    };

    const updateQuestion = (index, field, value) => {
        const updatedQuestions = [...formData.questions];
        updatedQuestions[index][field] = value;
        setFormData(prev => ({ ...prev, questions: updatedQuestions }));
    };

    const updateOption = (qIndex, oIndex, value) => {
        const updatedQuestions = [...formData.questions];
        updatedQuestions[qIndex].options[oIndex] = value;
        setFormData(prev => ({ ...prev, questions: updatedQuestions }));
    };

    const handleSubmit = async () => {
        // Validation
        if (!formData.title || !formData.topic) {
            toast.error('Please fill in Title and Topic');
            return;
        }
        if (formData.questions.length === 0) {
            toast.error('Please add at least one question');
            return;
        }
        if (formData.isTimeRestricted) {
            if (!formData.startTime || !formData.endTime) {
                toast.error('Please select both start and end times for restricted availability');
                return;
            }
            if (new Date(formData.startTime) >= new Date(formData.endTime)) {
                toast.error('Start time must be before end time');
                return;
            }
        }
        for (let i = 0; i < formData.questions.length; i++) {
            const q = formData.questions[i];
            if (!q.question.trim()) {
                toast.error(`Question ${i + 1} text is empty`);
                return;
            }
            if (q.options.some(opt => !opt.trim())) {
                toast.error(`All options for Question ${i + 1} must be filled`);
                return;
            }
        }

        const payload = {
            ...formData,
            timeLimit: parseInt(formData.timeLimit) || 30,
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
                        className="bg-[rgb(var(--bg-card))] w-full max-w-4xl rounded-2xl border border-[rgb(var(--border))] shadow-2xl flex flex-col max-h-[90vh]"
                    >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-[rgb(var(--border))]">
                    <h2 className="text-2xl font-bold text-[rgb(var(--text-primary))]">
                        {testToEdit ? 'Edit Practice Test' : 'Create Practice Test'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-[rgb(var(--bg-elevated))] rounded-full transition-colors">
                        <X className="w-6 h-6 text-[rgb(var(--text-muted))]" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[rgb(var(--text-secondary))]">Test Title</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--accent))] outline-none text-[rgb(var(--text-primary))]"
                                placeholder="e.g. JavaScript Basics Mastery"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[rgb(var(--text-secondary))]">Topic/Category</label>
                            <input
                                type="text"
                                name="topic"
                                value={formData.topic}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--accent))] outline-none text-[rgb(var(--text-primary))]"
                                placeholder="e.g. JavaScript"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[rgb(var(--text-secondary))]">Branch</label>
                            <select
                                name="branch"
                                value={formData.branch}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--accent))] outline-none text-[rgb(var(--text-primary))]"
                            >
                                {BRANCHES.map(branch => (
                                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-sm font-medium text-[rgb(var(--text-secondary))]">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={2}
                                className="w-full px-4 py-2 bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--accent))] outline-none text-[rgb(var(--text-primary))]"
                                placeholder="Brief description of what this test covers..."
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[rgb(var(--text-secondary))]">Difficulty</label>
                            <select
                                name="difficulty"
                                value={formData.difficulty}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--accent))] outline-none text-[rgb(var(--text-primary))]"
                            >
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[rgb(var(--text-secondary))]">Max Attempts</label>
                            <input
                                type="number"
                                min="1"
                                name="maxAttempts"
                                value={formData.maxAttempts}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--accent))] outline-none text-[rgb(var(--text-primary))]"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[rgb(var(--text-secondary))]">Time Limit (mins)</label>
                            <input
                                type="number"
                                min="1"
                                name="timeLimit"
                                value={formData.timeLimit}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--accent))] outline-none text-[rgb(var(--text-primary))]"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[rgb(var(--text-secondary))]">Passing Score (%)</label>
                            <input
                                type="number"
                                min="1"
                                max="100"
                                name="passingScore"
                                value={formData.passingScore}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--accent))] outline-none text-[rgb(var(--text-primary))]"
                            />
                        </div>
                        
                        <div className="md:col-span-2 p-4 bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border))] rounded-lg">
                            <label className="flex items-center space-x-3 cursor-pointer mb-4">
                                <input
                                    type="checkbox"
                                    name="isTimeRestricted"
                                    checked={formData.isTimeRestricted}
                                    onChange={handleChange}
                                    className="w-5 h-5 rounded border-[rgb(var(--border))] text-[rgb(var(--accent))] focus:ring-[rgb(var(--accent))] bg-transparent"
                                />
                                <span className="text-sm font-medium text-[rgb(var(--text-primary))]">Restrict Test Availability to Specific Date/Time</span>
                            </label>
                            
                            {formData.isTimeRestricted && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-[rgb(var(--text-secondary))]">Available From</label>
                                        <input
                                            type="datetime-local"
                                            name="startTime"
                                            value={formData.startTime || ''}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 bg-[rgb(var(--bg-body-alt))] border border-[rgb(var(--border-subtle))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--accent))] outline-none text-[rgb(var(--text-primary))]"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-[rgb(var(--text-secondary))]">Available Until</label>
                                        <input
                                            type="datetime-local"
                                            name="endTime"
                                            value={formData.endTime || ''}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 bg-[rgb(var(--bg-body-alt))] border border-[rgb(var(--border-subtle))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--accent))] outline-none text-[rgb(var(--text-primary))]"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="md:col-span-2 p-4 bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border))] rounded-lg">
                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="isPublished"
                                    checked={formData.isPublished}
                                    onChange={handleChange}
                                    className="w-5 h-5 rounded border-[rgb(var(--border))] text-[rgb(var(--accent))] focus:ring-[rgb(var(--accent))] bg-transparent"
                                />
                                <div>
                                    <span className="text-sm font-medium text-[rgb(var(--text-primary))] block">Published (Visible to Students)</span>
                                    <span className="text-xs text-[rgb(var(--text-secondary))]">When enabled, this test will appear in the public practice library.</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div className="border-t border-[rgb(var(--border))] my-6"></div>

                    {/* Questions Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between flex-wrap gap-3">
                            <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))]">Questions ({formData.questions.length})</h3>
                            <div className="flex items-center gap-2">
                                <Button
                                    onClick={() => setShowBulkImport(!showBulkImport)}
                                    size="sm"
                                    className={`border transition-all ${
                                        showBulkImport
                                            ? 'bg-purple-500/10 text-purple-600 border-purple-500/30 hover:bg-purple-500/20'
                                            : 'bg-[rgb(var(--bg-elevated))] text-[rgb(var(--text-secondary))] border-[rgb(var(--border))] hover:border-purple-500/40 hover:text-purple-600'
                                    }`}
                                >
                                    <Upload className="w-4 h-4 mr-2" /> Bulk Import
                                </Button>
                                <Button onClick={addQuestion} size="sm" className="bg-[rgb(var(--accent))] text-white hover:opacity-90">
                                    <Plus className="w-4 h-4 mr-2" /> Add Question
                                </Button>
                            </div>
                        </div>

                        {/* Bulk Import Panel */}
                        <AnimatePresence>
                            {showBulkImport && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="bg-gradient-to-br from-purple-500/5 to-blue-500/5 border border-purple-500/20 rounded-2xl p-5 space-y-4">
                                        <div className="flex items-start gap-3">
                                            <div className="bg-purple-500/10 p-2 rounded-xl shrink-0">
                                                <Sparkles className="w-5 h-5 text-purple-500" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-[rgb(var(--text-primary))] mb-1">Bulk Import MCQ Questions</h4>
                                                <p className="text-xs text-[rgb(var(--text-secondary))] leading-relaxed">
                                                    Paste all your MCQ questions below. Each question should follow this format:
                                                </p>
                                            </div>
                                        </div>

                                        {/* Format examples - two columns */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div className="bg-[rgb(var(--bg-main))] border border-[rgb(var(--border))] rounded-xl p-3 text-xs font-mono text-[rgb(var(--text-secondary))] leading-relaxed">
                                                <div className="text-[10px] font-bold text-[rgb(var(--text-muted))] uppercase tracking-wider mb-2 font-sans">Basic Format</div>
                                                <span className="text-purple-500">1.</span> What is the capital of France?<br/>
                                                <span className="text-blue-500">A)</span> London<br/>
                                                <span className="text-blue-500">B)</span> Paris<br/>
                                                <span className="text-blue-500">C)</span> Berlin<br/>
                                                <span className="text-blue-500">D)</span> Madrid<br/>
                                                <span className="text-emerald-500">Answer: B</span><br/>
                                                <span className="text-amber-500">Explanation: Paris is the capital.</span>
                                            </div>
                                            <div className="bg-[rgb(var(--bg-main))] border border-[rgb(var(--border))] rounded-xl p-3 text-xs font-mono text-[rgb(var(--text-secondary))] leading-relaxed">
                                                <div className="text-[10px] font-bold text-[rgb(var(--text-muted))] uppercase tracking-wider mb-2 font-sans">With Code Snippet</div>
                                                <span className="text-purple-500">2.</span> What will this code output?<br/>
                                                <span className="text-cyan-500">{'```'}</span><br/>
                                                <span className="text-cyan-500">console.log(typeof null);</span><br/>
                                                <span className="text-cyan-500">{'```'}</span><br/>
                                                <span className="text-blue-500">A)</span> null<br/>
                                                <span className="text-blue-500">B)</span> object<br/>
                                                <span className="text-blue-500">C)</span> undefined<br/>
                                                <span className="text-blue-500">D)</span> string<br/>
                                                <span className="text-emerald-500">Answer: B</span>
                                            </div>
                                        </div>

                                        <textarea
                                            value={bulkText}
                                            onChange={(e) => setBulkText(e.target.value)}
                                            rows={10}
                                            className="w-full px-4 py-3 bg-[rgb(var(--bg-main))] border border-[rgb(var(--border))] rounded-xl focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50 outline-none text-[rgb(var(--text-primary))] text-sm font-mono placeholder:text-[rgb(var(--text-muted))] resize-y"
                                            placeholder={`1. What is the output of this code?\n\`\`\`\nlet x = 10;\nconsole.log(x++);\n\`\`\`\nA) 10\nB) 11\nC) undefined\nD) NaN\nAnswer: A\nExplanation: Post-increment returns original value.\n\n2. Your next question here?\nA) Option A\nB) Option B\nC) Option C\nD) Option D\nAnswer: C`}
                                        />

                                        <div className="flex items-center justify-between">
                                            <p className="text-xs text-[rgb(var(--text-muted))]">
                                                <FileText className="w-3.5 h-3.5 inline mr-1" />
                                                Questions will be parsed and added as editable entries below.
                                            </p>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => { setShowBulkImport(false); setBulkText(''); }}
                                                    className="text-[rgb(var(--text-muted))] hover:text-red-500"
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    onClick={handleBulkImport}
                                                    disabled={!bulkText.trim()}
                                                    className="bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-40 shadow-lg shadow-purple-600/20"
                                                >
                                                    <Sparkles className="w-4 h-4 mr-2" /> Parse & Import
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {formData.questions.length === 0 && !showBulkImport ? (
                            <div className="text-center py-12 border-2 border-dashed border-[rgb(var(--border))] rounded-xl bg-[rgb(var(--bg-elevated))]/30 text-[rgb(var(--text-muted))]">
                                No questions added yet. Click "Add Question" or use "Bulk Import" to get started.
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {formData.questions.map((q, qIndex) => {
                                    if (!q) return null;
                                    return (
                                        <div key={qIndex} className="bg-[rgb(var(--bg-elevated))] p-4 rounded-xl border border-[rgb(var(--border))] relative group">
                                            <button
                                                onClick={() => removeQuestion(qIndex)}
                                                className="absolute top-4 right-4 text-red-500 hover:bg-red-500/10 p-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                title="Remove Question"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>

                                            <div className="mb-4 pr-10">
                                                <label className="text-xs font-semibold text-[rgb(var(--text-muted))] uppercase mb-1 block">Question {qIndex + 1}</label>
                                                <textarea
                                                    value={q.question}
                                                    onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                                                    className="w-full px-3 py-2 bg-[rgb(var(--bg-main))] border border-[rgb(var(--border))] rounded-lg focus:ring-1 focus:ring-[rgb(var(--accent))] outline-none text-[rgb(var(--text-primary))] text-sm"
                                                    placeholder="Enter question text..."
                                                    rows={2}
                                                />
                                            </div>

                                            <div className="mb-4 pr-10">
                                                <label className="text-xs font-semibold text-[rgb(var(--text-muted))] uppercase mb-1 block">Code Snippet (Optional)</label>
                                                <textarea
                                                    value={q.codeSnippet || ''}
                                                    onChange={(e) => updateQuestion(qIndex, 'codeSnippet', e.target.value)}
                                                    className="w-full px-3 py-2 bg-[rgb(var(--bg-main))] border border-[rgb(var(--border))] rounded-lg focus:ring-1 focus:ring-[rgb(var(--accent))] outline-none text-[rgb(var(--text-primary))] font-mono text-sm"
                                                    placeholder="// Paste your code here..."
                                                    rows={3}
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                                {q.options.map((opt, oIndex) => (
                                                    <div key={oIndex} className="flex items-center gap-2">
                                                        <input
                                                            type="radio"
                                                            name={`correct-${qIndex}`}
                                                            checked={q.correctAnswer === oIndex}
                                                            onChange={() => updateQuestion(qIndex, 'correctAnswer', oIndex)}
                                                            className="w-4 h-4 text-[rgb(var(--accent))] focus:ring-[rgb(var(--accent))]"
                                                        />
                                                        <input
                                                            type="text"
                                                            value={opt}
                                                            onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                                                            className={`flex-1 px-3 py-1.5 bg-[rgb(var(--bg-main))] border rounded-lg outline-none text-sm transition-colors ${q.correctAnswer === oIndex
                                                                ? 'border-green-500/50 ring-1 ring-green-500/20'
                                                                : 'border-[rgb(var(--border))] focus:border-[rgb(var(--accent))]'
                                                                }`}
                                                            placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                                                        />
                                                    </div>
                                                ))}
                                            </div>

                                            <div>
                                                <label className="text-xs font-semibold text-[rgb(var(--text-muted))] uppercase mb-1 block">Explanation (Optional)</label>
                                                <textarea
                                                    value={q.explanation}
                                                    onChange={(e) => updateQuestion(qIndex, 'explanation', e.target.value)}
                                                    className="w-full px-3 py-2 bg-[rgb(var(--bg-main))] border border-[rgb(var(--border))] rounded-lg focus:ring-1 focus:ring-[rgb(var(--accent))] outline-none text-[rgb(var(--text-primary))] text-sm"
                                                    placeholder="Explain why the correct answer is right..."
                                                    rows={1}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-[rgb(var(--border))] flex justify-end gap-3 bg-[rgb(var(--bg-card))] rounded-b-2xl">
                    <Button variant="outline" onClick={onClose} className="border-[rgb(var(--border))] text-[rgb(var(--text-secondary))]">
                        Cancel
                    </Button>
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

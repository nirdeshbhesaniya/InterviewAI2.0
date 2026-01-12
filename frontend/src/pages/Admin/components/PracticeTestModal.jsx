import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, CheckCircle, AlertCircle, Save } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import toast from 'react-hot-toast';

const PracticeTestModal = ({ isOpen, onClose, onSave, testToEdit }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        topic: '',
        difficulty: 'medium',
        questions: []
    });

    // Reset or populate form on open
    useEffect(() => {
        if (isOpen) {
            if (testToEdit) {
                setFormData(testToEdit);
                setStep(1);
            } else {
                setFormData({
                    title: '',
                    description: '',
                    topic: '',
                    difficulty: 'medium',
                    questions: []
                });
                setStep(1);
            }
        }
    }, [isOpen, testToEdit]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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

        await onSave(testToEdit ? testToEdit._id : null, formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
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
                    </div>

                    <div className="border-t border-[rgb(var(--border))] my-6"></div>

                    {/* Questions Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))]">Questions ({formData.questions.length})</h3>
                            <Button onClick={addQuestion} size="sm" className="bg-[rgb(var(--accent))] text-white hover:opacity-90">
                                <Plus className="w-4 h-4 mr-2" /> Add Question
                            </Button>
                        </div>

                        {formData.questions.length === 0 ? (
                            <div className="text-center py-12 border-2 border-dashed border-[rgb(var(--border))] rounded-xl bg-[rgb(var(--bg-elevated))]/30 text-[rgb(var(--text-muted))]">
                                No questions added yet. Click "Add Question" to start.
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {formData.questions.map((q, qIndex) => (
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
                                ))}
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
    );
};

export default PracticeTestModal;

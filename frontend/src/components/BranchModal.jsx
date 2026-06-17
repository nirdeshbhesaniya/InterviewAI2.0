import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, X } from 'lucide-react';
import { BRANCHES } from '../utils/constants';

const BranchModal = ({ isOpen, onClose, currentBranch, onSelectBranch }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div
                    className="bg-[rgb(var(--bg-card))] rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-[rgb(var(--border-subtle))] max-h-[90vh] flex flex-col"
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                >
                    <div className="flex items-center justify-between mb-6 flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[rgb(var(--accent))]/10 rounded-xl flex items-center justify-center text-[rgb(var(--accent))]">
                                <BookOpen className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-[rgb(var(--text-primary))]">Select Your Branch</h2>
                                <p className="text-sm text-[rgb(var(--text-muted))]">Personalize your dashboard content</p>
                            </div>
                        </div>
                        {currentBranch && (
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-[rgb(var(--bg-body-alt))] rounded-lg transition-colors text-[rgb(var(--text-muted))]"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2 pr-2 mb-6">
                        {BRANCHES.map((branch) => {
                            const Icon = branch.icon;
                            return (
                                <button
                                    key={branch.id}
                                    onClick={() => onSelectBranch(branch.id)}
                                    className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                                        currentBranch === branch.id
                                            ? 'bg-[rgb(var(--accent))]/10 border-[rgb(var(--accent))] shadow-sm'
                                            : 'bg-[rgb(var(--bg-body-alt))] border-[rgb(var(--border-subtle))] hover:border-[rgb(var(--text-muted))] hover:bg-[rgb(var(--bg-body))]'
                                    }`}
                                >
                                    <div className={`p-2 rounded-lg bg-gradient-to-br ${branch.color} flex-shrink-0`}>
                                        <Icon className="w-4 h-4 text-white" />
                                    </div>
                                    <div>
                                        <h3 className={`font-semibold ${currentBranch === branch.id ? 'text-[rgb(var(--accent))]' : 'text-[rgb(var(--text-primary))]'}`}>
                                            {branch.name}
                                        </h3>
                                        <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5 line-clamp-1">{branch.description}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default BranchModal;

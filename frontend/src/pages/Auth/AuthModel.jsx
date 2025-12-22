import React from 'react';
import { X, Bot } from 'lucide-react';
import { motion } from 'framer-motion';

const AuthModal = ({ show, onClose, children }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/60 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        className="bg-[rgb(var(--bg-card))] rounded-2xl w-full max-w-md relative shadow-2xl border-2 border-[rgb(var(--border-subtle))] overflow-hidden"
      >
        {/* Header with Bot Icon */}
        <div className="bg-[rgb(var(--bg-card-alt))] dark:bg-[rgb(var(--bg-elevated))] border-b border-[rgb(var(--border-subtle))] px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Bot className="w-8 h-8 text-[rgb(var(--accent))] drop-shadow-lg" />
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[rgb(var(--accent))] rounded-full animate-pulse"></div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-[rgb(var(--text-primary))]">
                  Interview<span className="text-[rgb(var(--accent))]">AI</span>
                </h2>
                <p className="text-xs text-[rgb(var(--text-muted))]">Smart Interview Prep</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[rgb(var(--bg-body-alt))] dark:hover:bg-[rgb(var(--bg-elevated-alt))] rounded-lg transition-all duration-200 text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-primary))] group"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {children}
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[rgb(var(--accent))]/5 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[rgb(var(--accent))]/5 rounded-full blur-3xl -z-10"></div>
      </motion.div>
    </div>
  );
};

export default AuthModal;

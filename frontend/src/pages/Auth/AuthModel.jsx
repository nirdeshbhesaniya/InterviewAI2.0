import React from 'react';
import { X } from 'lucide-react';

const AuthModal = ({ show, onClose, children }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/60">
      <div className="bg-bg-card rounded-xl w-full max-w-md relative p-6 shadow-2xl border border-border-subtle">
        <button onClick={onClose} className="absolute top-4 right-4 text-text-muted hover:text-text-primary transition-colors">
          <X size={20} />
        </button>
        {children}
      </div>
    </div>
  );
};

export default AuthModal;

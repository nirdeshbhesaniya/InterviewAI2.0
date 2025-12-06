import React from 'react';
import { X } from 'lucide-react';

const AuthModal = ({ show, onClose, children }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30">
      <div className="bg-white rounded-xl w-full max-w-md relative p-6 shadow-xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-black">
          <X size={20} />
        </button>
        {children}
      </div>
    </div>
  );
};

export default AuthModal;

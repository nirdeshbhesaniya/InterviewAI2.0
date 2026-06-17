import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { Button } from '../components/ui/button';

const ConfirmContext = createContext(null);

export const useConfirm = () => {
    const context = useContext(ConfirmContext);
    if (!context) {
        throw new Error('useConfirm must be used within a ConfirmProvider');
    }
    return context;
};

export const ConfirmProvider = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const resolver = useRef(null);

    const confirm = useCallback((msg) => {
        setMessage(msg);
        setIsOpen(true);
        return new Promise((resolve) => {
            resolver.current = resolve;
        });
    }, []);

    const handleConfirm = useCallback(() => {
        setIsOpen(false);
        if (resolver.current) {
            resolver.current(true);
            resolver.current = null;
        }
    }, []);

    const handleCancel = useCallback(() => {
        setIsOpen(false);
        if (resolver.current) {
            resolver.current(false);
            resolver.current = null;
        }
    }, []);

    // Handle ESC key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) {
                handleCancel();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, handleCancel]);

    return (
        <ConfirmContext.Provider value={{ confirm }}>
            {children}
            
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                        onClick={handleCancel}
                    />
                    
                    {/* Modal */}
                    <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 text-left shadow-2xl transition-all flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/20 sm:h-12 sm:w-12">
                                    <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                                </div>
                                <h3 className="text-lg font-semibold leading-6 text-gray-900 dark:text-gray-100">
                                    Confirm Action
                                </h3>
                            </div>
                            <button
                                onClick={handleCancel}
                                className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        
                        {/* Body */}
                        <div className="text-sm text-gray-600 dark:text-gray-300 px-1">
                            {message}
                        </div>
                        
                        {/* Footer */}
                        <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 gap-3 sm:gap-0 mt-2">
                            <Button
                                variant="outline"
                                onClick={handleCancel}
                                className="w-full sm:w-auto"
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleConfirm}
                                className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white"
                            >
                                Confirm
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </ConfirmContext.Provider>
    );
};

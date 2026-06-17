import React from 'react';
import { Loader2 as LucideLoader2 } from 'lucide-react';

// Drop-in replacement for lucide-react Loader2
export const AILoaderIcon = ({ className = '' }) => {
    // Strip animate-spin since we have our own animations
    const safeClassName = className.replace(/\banimate-spin\b/g, '').trim();
    
    return (
        <div className={`loader-ai-container relative flex items-center justify-center ${safeClassName}`}>
            <div className="loader-ai-outer w-full h-full absolute border-[currentColor]"></div>
            <div className="loader-ai-middle absolute border-[currentColor]"></div>
            <div className="loader-ai-inner w-[35%] h-[35%] absolute bg-[currentColor]"></div>
        </div>
    );
};

// Amazing AI Loader inspired by modern AI tools like ChatGPT
export const Loader = ({
    size = 'md',
    text = '',
    fullScreen = false,
    className = ''
}) => {
    // Determine dimensions based on size
    const sizeMap = {
        sm: { outer: 'w-6 h-6', textSize: 'text-xs' },
        md: { outer: 'w-10 h-10', textSize: 'text-sm' },
        lg: { outer: 'w-16 h-16', textSize: 'text-base' },
        xl: { outer: 'w-24 h-24', textSize: 'text-lg' }
    };
    
    const { outer, textSize } = sizeMap[size] || sizeMap.md;

    const loaderElement = (
        <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
            <AILoaderIcon className={`${outer} text-[rgb(var(--accent))]`} />
            {text && (
                <div className="flex flex-col items-center gap-1.5">
                    <p className={`font-medium bg-gradient-to-r from-[rgb(var(--accent))] to-[rgb(var(--accent-hover))] bg-clip-text text-transparent animate-pulse ${textSize}`}>
                        {text}
                    </p>
                    <div className="flex gap-1">
                        <span className="typing-dot bg-[rgb(var(--accent))]"></span>
                        <span className="typing-dot bg-[rgb(var(--accent))]"></span>
                        <span className="typing-dot bg-[rgb(var(--accent))]"></span>
                    </div>
                </div>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="min-h-screen fixed inset-0 z-50 flex items-center justify-center bg-[rgb(var(--bg-body))]/80 backdrop-blur-md transition-all duration-300">
                {loaderElement}
            </div>
        );
    }

    return loaderElement;
};

// Button loader - for inline button loading states, uses ChatGPT-like 3 bouncing dots
export const ButtonLoader = ({ text = 'Loading...', className = '' }) => {
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            {text && <span>{text}</span>}
            <div className="flex gap-[3px] items-center ml-1">
                <span className="typing-dot w-1 h-1"></span>
                <span className="typing-dot w-1 h-1"></span>
                <span className="typing-dot w-1 h-1"></span>
            </div>
        </div>
    );
};

export default Loader;

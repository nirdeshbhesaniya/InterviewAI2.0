import React from 'react';
import { Loader2 } from 'lucide-react';

// Consistent loader component used across the entire website
export const Loader = ({
    size = 'md',
    text = '',
    fullScreen = false,
    className = ''
}) => {
    const sizeMap = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
        xl: 'w-12 h-12'
    };

    // Only pass valid props to Loader2 (className only)
    const iconClassName = `${sizeMap[size]} animate-spin text-[rgb(var(--accent))]`;

    const loaderElement = (
        <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
            <Loader2 className={iconClassName} />
            {text && (
                <p className="text-sm text-[rgb(var(--text-secondary))] font-medium animate-pulse">
                    {text}
                </p>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--bg-body))]">
                {loaderElement}
            </div>
        );
    }

    return loaderElement;
};

// Button loader - for inline button loading states
export const ButtonLoader = ({ text = 'Loading...', className = '' }) => {
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{text}</span>
        </div>
    );
};

export default Loader;

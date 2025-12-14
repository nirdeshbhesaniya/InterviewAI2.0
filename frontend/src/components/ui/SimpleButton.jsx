import React from 'react';

const Button = ({
    children,
    onClick,
    variant = 'default',
    size = 'default',
    disabled = false,
    className = '',
    ...props
}) => {
    const getVariantClasses = () => {
        switch (variant) {
            case 'outline':
                return 'border border-[rgb(var(--border-subtle))] bg-transparent text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-card-alt))] hover:text-[rgb(var(--text-primary))]';
            case 'ghost':
                return 'bg-transparent text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-card-alt))] hover:text-[rgb(var(--text-primary))]';
            case 'destructive':
                return 'bg-danger text-white hover:bg-red-600';
            case 'secondary':
                return 'bg-[rgb(var(--accent))] text-white hover:bg-[rgb(var(--accent-hover))]';
            default:
                return 'bg-[rgb(var(--accent))] text-white hover:bg-[rgb(var(--accent-hover))] hover:scale-[1.02] shadow-md hover:shadow-lg';
        }
    };

    const getSizeClasses = () => {
        switch (size) {
            case 'sm':
                return 'px-3 py-1.5 text-sm h-8 rounded-lg';
            case 'lg':
                return 'px-6 py-3 text-lg h-11 rounded-xl';
            default:
                return 'px-4 py-2 text-sm h-9 rounded-xl';
        }
    };

    const baseClasses = 'inline-flex items-center justify-center font-medium transition-all focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]/50 focus:ring-offset-2 focus:ring-offset-[rgb(var(--bg-body))] disabled:opacity-50 disabled:cursor-not-allowed';

    const classes = `${baseClasses} ${getVariantClasses()} ${getSizeClasses()} ${className}`;

    return (
        <button
            className={classes}
            onClick={onClick}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;

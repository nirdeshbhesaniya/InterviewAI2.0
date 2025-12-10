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
                return 'border border-border-subtle bg-transparent text-text-secondary hover:bg-bg-card-alt hover:text-text-primary';
            case 'ghost':
                return 'bg-transparent text-text-secondary hover:bg-bg-card-alt hover:text-text-primary';
            case 'destructive':
                return 'bg-danger text-white hover:bg-red-600';
            case 'secondary':
                return 'bg-primary text-white hover:bg-indigo-500';
            default:
                return 'bg-gradient-to-r from-highlight to-pink-500 text-white hover:shadow-button-hover hover:scale-[1.02] shadow-button-primary';
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

    const baseClasses = 'inline-flex items-center justify-center font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-bg-body disabled:opacity-50 disabled:cursor-not-allowed';

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

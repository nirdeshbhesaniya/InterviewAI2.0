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
                return 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700';
            case 'ghost':
                return 'bg-transparent text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800';
            case 'destructive':
                return 'bg-red-600 text-white hover:bg-red-700';
            default:
                return 'bg-blue-600 text-white hover:bg-blue-700';
        }
    };

    const getSizeClasses = () => {
        switch (size) {
            case 'sm':
                return 'px-3 py-1.5 text-sm h-8';
            case 'lg':
                return 'px-6 py-3 text-lg h-11';
            default:
                return 'px-4 py-2 text-sm h-9';
        }
    };

    const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

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

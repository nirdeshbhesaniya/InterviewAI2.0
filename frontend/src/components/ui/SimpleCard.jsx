import React from 'react';

const Card = ({
    children,
    className = '',
    ...props
}) => {
    const baseClasses = 'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm';
    const classes = `${baseClasses} ${className}`;

    return (
        <div className={classes} {...props}>
            {children}
        </div>
    );
};

const CardHeader = ({
    children,
    className = '',
    ...props
}) => {
    const classes = `px-6 py-4 border-b border-gray-200 dark:border-gray-700 ${className}`;

    return (
        <div className={classes} {...props}>
            {children}
        </div>
    );
};

const CardContent = ({
    children,
    className = '',
    ...props
}) => {
    const classes = `px-6 py-4 ${className}`;

    return (
        <div className={classes} {...props}>
            {children}
        </div>
    );
};

const CardFooter = ({
    children,
    className = '',
    ...props
}) => {
    const classes = `px-6 py-4 border-t border-gray-200 dark:border-gray-700 ${className}`;

    return (
        <div className={classes} {...props}>
            {children}
        </div>
    );
};

export default Card;
export { CardHeader, CardContent, CardFooter };

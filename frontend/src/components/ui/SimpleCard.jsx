import React from 'react';

const Card = ({
    children,
    className = '',
    ...props
}) => {
    const baseClasses = 'bg-bg-card rounded-xl border border-border-subtle shadow-sm hover:bg-bg-card-alt transition-all';
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
    const classes = `px-6 py-4 border-b border-border-subtle ${className}`;

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
    const classes = `px-6 py-4 border-t border-border-subtle ${className}`;

    return (
        <div className={classes} {...props}>
            {children}
        </div>
    );
};

export default Card;
export { CardHeader, CardContent, CardFooter };

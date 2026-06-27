import React from 'react';
import { motion } from 'framer-motion';

const Icon3D = ({
    children,
    className = '',
    size = 'md',
    color = 'primary',
    animated = true,
    onClick,
    disabled = false
}) => {
    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-12 h-12',
        lg: 'w-16 h-16',
        xl: 'w-20 h-20'
    };

    const colorClasses = {
        primary: 'bg-[rgb(var(--accent))] text-white shadow-[rgb(var(--accent))]/25',
        secondary: 'bg-gradient-to-br from-[rgb(var(--accent))] via-[rgb(var(--accent-warm))] to-[rgb(var(--secondary-accent))] text-white shadow-[rgb(var(--accent))]/25',
        success: 'bg-gradient-to-br from-[rgb(var(--success))] to-[rgb(var(--secondary-accent))] text-white shadow-[rgb(var(--success))]/25',
        dark: 'bg-gradient-to-br from-[rgb(var(--text-secondary))] to-[rgb(var(--text-primary))] text-white shadow-[rgb(var(--text-primary))]/25'
    };

    const baseClasses = `
    ${sizeClasses[size]} 
    ${colorClasses[color]}
    rounded-xl
    flex items-center justify-center
    shadow-lg
    transition-all duration-300
    transform-gpu
    relative
    overflow-hidden
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105 hover:shadow-xl active:scale-95'}
    ${className}
  `;

    const Component = animated ? motion.div : 'div';

    const animationProps = animated ? {
        whileHover: disabled ? {} : {
            scale: 1.05,
            rotate: [0, -5, 5, 0],
            transition: { duration: 0.3 }
        },
        whileTap: disabled ? {} : {
            scale: 0.95,
            transition: { duration: 0.1 }
        },
        initial: { scale: 0, rotate: -180 },
        animate: { scale: 1, rotate: 0 },
        transition: {
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.1
        }
    } : {};

    return (
        <Component
            className={baseClasses}
            onClick={disabled ? undefined : onClick}
            {...animationProps}
        >
            {/* 3D Effect Background */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl" />

            {/* Glossy Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent rounded-xl" />

            {/* Content */}
            <div className="relative z-10 flex items-center justify-center">
                {children}
            </div>

            {/* Glow Effect */}
            <div className="absolute inset-0 rounded-xl blur-sm opacity-50 bg-gradient-to-br from-current to-current"
                style={{ transform: 'scale(1.1)' }} />
        </Component>
    );
};

export default Icon3D;

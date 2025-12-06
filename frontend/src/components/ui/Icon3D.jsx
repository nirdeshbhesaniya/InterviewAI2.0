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
        primary: 'bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 text-white shadow-orange-500/25',
        secondary: 'bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-500 text-white shadow-blue-500/25',
        success: 'bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 text-white shadow-green-500/25',
        dark: 'bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 text-white shadow-gray-700/25'
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

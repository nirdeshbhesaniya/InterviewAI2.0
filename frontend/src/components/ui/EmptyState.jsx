import React from 'react';
import { motion } from 'framer-motion';
import { Search, FolderOpen } from 'lucide-react';

export const EmptyState = ({
  title = "No content found",
  description = "There is nothing to display here right now.",
  icon: Icon,
  imgSrc,
  actionButton,
  isSearch = false,
  className = ""
}) => {
  return (
    <motion.div
      className={`flex flex-col items-center justify-center min-h-[40vh] sm:min-h-[50vh] text-center px-4 sm:px-6 w-full ${className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="relative mb-6 sm:mb-8 flex justify-center items-center">
        {imgSrc ? (
          <>
            <img
              src={imgSrc}
              alt={title}
              className="w-32 h-32 sm:w-48 sm:h-48 md:w-56 md:h-56 object-contain opacity-90 drop-shadow-lg animate-pulse"
            />
            {/* Subtle glow behind image */}
            <div className="absolute inset-0 bg-gradient-to-t from-[rgb(var(--accent))]/10 to-transparent blur-3xl rounded-full -z-10 animate-pulse-ring"></div>
          </>
        ) : (
          <div className="w-24 h-24 sm:w-32 sm:h-32 bg-[rgb(var(--bg-body-alt))] rounded-full flex items-center justify-center border border-[rgb(var(--border-subtle))] shadow-inner relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[rgb(var(--accent))]/10 to-transparent rounded-full opacity-50"></div>
            {isSearch ? (
              <Search className="w-10 h-10 sm:w-14 sm:h-14 text-[rgb(var(--text-muted))]/60 drop-shadow-md" />
            ) : Icon ? (
              <Icon className="w-10 h-10 sm:w-14 sm:h-14 text-[rgb(var(--text-muted))]/60 drop-shadow-md" />
            ) : (
              <FolderOpen className="w-10 h-10 sm:w-14 sm:h-14 text-[rgb(var(--text-muted))]/60 drop-shadow-md" />
            )}
          </div>
        )}
      </div>

      <h3 className="text-xl sm:text-2xl font-bold text-[rgb(var(--text-primary))] mb-3 tracking-tight">
        {title}
      </h3>
      
      <p className="text-[rgb(var(--text-secondary))] mb-6 sm:mb-8 max-w-md text-sm sm:text-base leading-relaxed">
        {description}
      </p>

      {actionButton && (
        <div className="mt-2">
          {actionButton}
        </div>
      )}
    </motion.div>
  );
};

export default EmptyState;

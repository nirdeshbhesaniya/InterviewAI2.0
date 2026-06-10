import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckSquare, Square, ChevronDown } from 'lucide-react';

const TopicNode = ({ topic, isCompleted, onToggle }) => {
  const [showMore, setShowMore] = useState(false);

  return (
    <motion.div
      layout
      className={`group flex items-start gap-3 p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
        isCompleted
          ? 'bg-green-500/10 border-green-500/30'
          : 'bg-[rgb(var(--bg-body))] border-[rgb(var(--border))] hover:border-[rgb(var(--accent))]/40 hover:bg-[rgb(var(--accent))]/5'
      }`}
      onClick={() => onToggle(topic.id)}
      whileHover={{ x: 3 }}
      whileTap={{ scale: 0.99 }}
    >
      {/* Checkbox */}
      <motion.div
        className="flex-shrink-0 mt-0.5"
        animate={isCompleted ? { scale: [1, 1.2, 1] } : { scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        {isCompleted ? (
          <CheckSquare className="w-4 h-4 text-green-500" />
        ) : (
          <Square className="w-4 h-4 text-[rgb(var(--text-muted))] group-hover:text-[rgb(var(--accent))] transition-colors" />
        )}
      </motion.div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={`text-sm font-medium leading-tight ${
            isCompleted
              ? 'text-green-400 line-through decoration-green-500/50'
              : 'text-[rgb(var(--text-primary))]'
          }`}>
            {topic.name}
          </p>
          {topic.description && (
            <button
              onClick={(e) => { e.stopPropagation(); setShowMore(!showMore); }}
              className="flex-shrink-0 text-[rgb(var(--text-muted))] hover:text-[rgb(var(--accent))] transition-colors"
            >
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showMore ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>

        <AnimatePresence>
          {showMore && topic.description && (
            <motion.p
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="text-xs text-[rgb(var(--text-muted))] mt-1 leading-relaxed overflow-hidden"
            >
              {topic.description}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default TopicNode;

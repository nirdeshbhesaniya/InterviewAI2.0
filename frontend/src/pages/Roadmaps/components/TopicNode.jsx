import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckSquare, Square, ChevronDown, Bot } from 'lucide-react';
import { ChatbotContext } from '../../../context/ChatBotContext';

const TopicNode = ({ topic, isCompleted, isCleared, onToggle }) => {
  const [showMore, setShowMore] = useState(false);
  const chatbotCtx = useContext(ChatbotContext);

  return (
    <motion.div
      layout
      className={`group flex items-start gap-3 p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
        isCleared
          ? 'bg-green-500/10 border-green-500/30'
          : isCompleted
            ? 'bg-red-500/10 border-red-500/30'
            : 'bg-[rgb(var(--bg-body))] border-[rgb(var(--border))] hover:border-[rgb(var(--accent))]/40 hover:bg-[rgb(var(--accent))]/5'
      } ${isCleared ? 'cursor-default' : ''}`}
      onClick={() => !isCleared && onToggle(topic.id)}
      whileHover={{ x: isCleared ? 0 : 3 }}
      whileTap={{ scale: 0.99 }}
    >
      {/* Checkbox */}
      <motion.div
        className="flex-shrink-0 mt-0.5"
        animate={isCompleted ? { scale: [1, 1.2, 1] } : { scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        {isCleared ? (
          <CheckSquare className="w-4 h-4 text-green-500" />
        ) : isCompleted ? (
          <CheckSquare className="w-4 h-4 text-red-500" />
        ) : (
          <Square className="w-4 h-4 text-[rgb(var(--text-muted))] group-hover:text-[rgb(var(--accent))] transition-colors" />
        )}
      </motion.div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className={`text-sm font-medium leading-tight ${
            isCleared
              ? 'text-green-400 line-through decoration-green-500/50'
              : isCompleted
                ? 'text-red-400 line-through decoration-red-500/50'
                : 'text-[rgb(var(--text-primary))]'
          }`}>
            {topic.name}
          </p>
          <div className="flex items-center gap-1.5 ml-auto sm:ml-2">
            <button
              onClick={(e) => { 
                e.stopPropagation();
                if (chatbotCtx) {
                  chatbotCtx.toggleChatbot && chatbotCtx.toggleChatbot();
                  setTimeout(() => {
                    chatbotCtx.sendMessage?.(`Explain ${topic.name} in simple terms with examples and key concepts.`);
                  }, 300);
                }
              }}
              title="Ask AI"
              className="flex items-center justify-center gap-1.5 px-3 py-1 text-xs font-semibold text-white bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-full shadow-sm hover:shadow-md transition-all duration-200"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Ask AI</span>
            </button>
            {topic.description && (
              <button
                onClick={(e) => { e.stopPropagation(); setShowMore(!showMore); }}
                className="flex items-center justify-center p-1.5 text-[rgb(var(--text-muted))] hover:text-[rgb(var(--accent))] hover:bg-[rgb(var(--accent))]/10 rounded-md transition-colors"
              >
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showMore ? 'rotate-180' : ''}`} />
              </button>
            )}
          </div>
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

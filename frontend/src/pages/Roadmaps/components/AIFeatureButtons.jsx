import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChatbotContext } from '../../../context/ChatBotContext';
import {
  Bot,
  FileText,
  Brain,
  Mic,
  Lightbulb,
  BookOpen,
  ExternalLink,
} from 'lucide-react';

const AI_BUTTONS = [
  {
    id: 'ask-ai',
    label: 'Ask AI',
    icon: Bot,
    gradient: 'from-blue-500 to-cyan-500',
    hoverShadow: 'hover:shadow-blue-500/30',
    description: 'Get AI explanation',
  },
  {
    id: 'notes',
    label: 'Notes',
    icon: FileText,
    gradient: 'from-purple-500 to-violet-500',
    hoverShadow: 'hover:shadow-purple-500/30',
    description: 'Generate study notes',
  },
  {
    id: 'mcq',
    label: 'MCQ Test',
    icon: Brain,
    gradient: 'from-green-500 to-emerald-500',
    hoverShadow: 'hover:shadow-green-500/30',
    description: 'Practice with MCQs',
  },
  {
    id: 'mock-interview',
    label: 'Interview',
    icon: Mic,
    gradient: 'from-orange-500 to-red-500',
    hoverShadow: 'hover:shadow-orange-500/30',
    description: 'Mock interview practice',
  },
  {
    id: 'projects',
    label: 'Projects',
    icon: Lightbulb,
    gradient: 'from-yellow-500 to-amber-500',
    hoverShadow: 'hover:shadow-yellow-500/30',
    description: 'Project ideas',
  },
  {
    id: 'resources',
    label: 'Resources',
    icon: BookOpen,
    gradient: 'from-teal-500 to-cyan-500',
    hoverShadow: 'hover:shadow-teal-500/30',
    description: 'Learning resources',
  },
];

const AIFeatureButtons = ({ topicName, stageName, careerTitle, compact = false }) => {
  const navigate = useNavigate();
  const chatbotCtx = useContext(ChatbotContext);

  const handleAction = (actionId) => {
    const topicContext = `${topicName || stageName} in ${careerTitle}`;
    
    switch (actionId) {
      case 'ask-ai':
        // Open chatbot and send a message
        if (chatbotCtx) {
          chatbotCtx.toggleChatbot && chatbotCtx.toggleChatbot();
          setTimeout(() => {
            chatbotCtx.sendMessage?.(`Explain ${topicContext} in simple terms with examples and key concepts.`);
          }, 300);
        }
        break;
      case 'notes':
        navigate('/notes', { state: { autoGenerate: true, topic: topicContext } });
        break;
      case 'mcq':
        navigate('/mcq-test', { state: { topic: topicContext } });
        break;
      case 'mock-interview':
        navigate('/mock-interview/create', { state: { topic: topicContext } });
        break;
      case 'projects':
        if (chatbotCtx) {
          chatbotCtx.toggleChatbot && chatbotCtx.toggleChatbot();
          setTimeout(() => {
            chatbotCtx.sendMessage?.(`Give me 5 project ideas to practice ${topicContext}. Include difficulty level and what skills I'll build.`);
          }, 300);
        }
        break;
      case 'resources':
        navigate('/resources', { state: { search: topicName || stageName } });
        break;
      default:
        break;
    }
  };

  if (compact) {
    return (
      <div className="flex flex-wrap gap-1.5">
        {AI_BUTTONS.map((btn) => {
          const Icon = btn.icon;
          return (
            <motion.button
              key={btn.id}
              onClick={(e) => { e.stopPropagation(); handleAction(btn.id); }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title={btn.description}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-white bg-gradient-to-r ${btn.gradient} shadow-sm hover:shadow-md ${btn.hoverShadow} transition-all duration-200`}
            >
              <Icon className="w-3 h-3" />
              <span>{btn.label}</span>
            </motion.button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {AI_BUTTONS.map((btn, idx) => {
        const Icon = btn.icon;
        return (
          <motion.button
            key={btn.id}
            onClick={(e) => { e.stopPropagation(); handleAction(btn.id); }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className={`group flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r ${btn.gradient} shadow-md hover:shadow-lg ${btn.hoverShadow} transition-all duration-200`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{btn.label}</span>
            <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.button>
        );
      })}
    </div>
  );
};

export default AIFeatureButtons;

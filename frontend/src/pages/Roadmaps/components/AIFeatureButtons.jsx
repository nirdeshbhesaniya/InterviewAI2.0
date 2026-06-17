import React, { useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChatbotContext } from '../../../context/ChatBotContext';
import axiosInstance from '../../../utils/axiosInstance';

// Helper: use Gemini AI (via backend) to get a direct resource URL and open it
const openResourceUrl = async (topic, type, fallbackUrl) => {
  try {
    const res = await axiosInstance.get(`/roadmaps/resource-urls?topic=${encodeURIComponent(topic)}&type=${type}`);
    const url = res.data?.url;
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      window.open(fallbackUrl, '_blank', 'noopener,noreferrer');
    }
  } catch {
    window.open(fallbackUrl, '_blank', 'noopener,noreferrer');
  }
};
import {
  Bot,
  Brain,
  Mic,
  Lightbulb,
  ExternalLink,
  X,
  Play,
  Youtube,
  Github,
  BookOpen,
  Search
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
];

const AIFeatureButtons = ({ topicName, stageName, phaseTitle, topics, careerTitle, compact = false }) => {
  const navigate = useNavigate();
  const chatbotCtx = useContext(ChatbotContext);
  const [showMCQModal, setShowMCQModal] = useState(false);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [showProjectsModal, setShowProjectsModal] = useState(false);
  const [currentTopicContext, setCurrentTopicContext] = useState('');

  const handleAction = (actionId) => {
    const topicsStr = topics ? topics.map(t => t.name).join(' ') : '';
    const topicContext = `${careerTitle} ${phaseTitle || ''} ${stageName} ${topicName || ''} ${topicsStr}`.replace(/\s+/g, ' ').trim();
    
    switch (actionId) {
      case 'ask-ai':
        if (chatbotCtx) {
          chatbotCtx.toggleChatbot && chatbotCtx.toggleChatbot();
          setTimeout(() => {
            chatbotCtx.sendMessage?.(`Explain ${topicContext} in simple terms with examples and key concepts.`);
          }, 300);
        }
        break;
      case 'mcq':
        setCurrentTopicContext(topicContext);
        setShowMCQModal(true);
        break;
      case 'mock-interview':
        setCurrentTopicContext(topicContext);
        setShowInterviewModal(true);
        break;
      case 'projects':
        setCurrentTopicContext(topicContext);
        setShowProjectsModal(true);
        break;
      default:
        break;
    }
  };

  const handleStartMCQ = () => {
    setShowMCQModal(false);
    navigate('/mcq-test', { state: { autoGenerateMCQ: true, topic: currentTopicContext, numberOfQuestions: 10 } });
  };

  const handleStartInterview = () => {
    setShowInterviewModal(false);
    navigate('/mock-interview/create', { state: { autoGenerateInterview: true, topic: currentTopicContext } });
  };

  const renderButtons = () => {
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

  return (
    <>
      {renderButtons()}

      <AnimatePresence>
        {showMCQModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[rgb(var(--bg-card))] rounded-2xl shadow-2xl border border-[rgb(var(--border-subtle))] w-full max-w-md p-6 relative overflow-hidden"
            >
              <button 
                onClick={(e) => { e.stopPropagation(); setShowMCQModal(false); }}
                className="absolute top-4 right-4 text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-primary))] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-3 mb-4 text-[rgb(var(--accent))]">
                <div className="w-10 h-10 rounded-full bg-[rgb(var(--accent))]/10 flex items-center justify-center">
                  <Brain className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-[rgb(var(--text-primary))]">AI Practice Test</h3>
              </div>
              
              <div className="text-[rgb(var(--text-secondary))] mb-6 space-y-3 text-sm">
                <p>You are about to start a practice test for:</p>
                <p className="font-semibold text-[rgb(var(--text-primary))] bg-[rgb(var(--bg-body-alt))] p-3 rounded-lg border border-[rgb(var(--border-subtle))]">
                  {currentTopicContext}
                </p>
                <ul className="list-disc list-inside space-y-1 mt-4 ml-1">
                  <li><strong>10</strong> AI-generated questions</li>
                  <li><strong>20</strong> minutes time limit</li>
                  <li>Instant results & explanations</li>
                </ul>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={(e) => { e.stopPropagation(); setShowMCQModal(false); }}
                  className="flex-1 px-4 py-2.5 rounded-xl font-medium bg-[rgb(var(--bg-body-alt))] text-[rgb(var(--text-primary))] border border-[rgb(var(--border-subtle))] hover:bg-[rgb(var(--bg-body))] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleStartMCQ(); }}
                  className="flex-1 px-4 py-2.5 rounded-xl font-medium bg-[rgb(var(--accent))] text-white hover:bg-[rgb(var(--accent-hover))] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[rgb(var(--accent))]/20"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Start Test
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showInterviewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[rgb(var(--bg-card))] rounded-2xl shadow-2xl border border-[rgb(var(--border-subtle))] w-full max-w-md p-6 relative overflow-hidden"
            >
              <button 
                onClick={(e) => { e.stopPropagation(); setShowInterviewModal(false); }}
                className="absolute top-4 right-4 text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-primary))] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-3 mb-4 text-[rgb(var(--accent))]">
                <div className="w-10 h-10 rounded-full bg-[rgb(var(--accent))]/10 flex items-center justify-center">
                  <Mic className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-[rgb(var(--text-primary))]">AI Mock Interview</h3>
              </div>
              
              <div className="text-[rgb(var(--text-secondary))] mb-6 space-y-3 text-sm">
                <p>You are about to start a mock interview for:</p>
                <p className="font-semibold text-[rgb(var(--text-primary))] bg-[rgb(var(--bg-body-alt))] p-3 rounded-lg border border-[rgb(var(--border-subtle))]">
                  {currentTopicContext}
                </p>
                <ul className="list-disc list-inside space-y-1 mt-4 ml-1">
                  <li><strong>5</strong> AI-generated interview questions</li>
                  <li>Technical assessment focus</li>
                  <li>Real-time AI feedback</li>
                </ul>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={(e) => { e.stopPropagation(); setShowInterviewModal(false); }}
                  className="flex-1 px-4 py-2.5 rounded-xl font-medium bg-[rgb(var(--bg-body-alt))] text-[rgb(var(--text-primary))] border border-[rgb(var(--border-subtle))] hover:bg-[rgb(var(--bg-body))] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleStartInterview(); }}
                  className="flex-1 px-4 py-2.5 rounded-xl font-medium bg-[rgb(var(--accent))] text-white hover:bg-[rgb(var(--accent-hover))] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[rgb(var(--accent))]/20"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Start Interview
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showProjectsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[rgb(var(--bg-card))] rounded-2xl shadow-2xl border border-[rgb(var(--border-subtle))] w-full max-w-md p-6 relative overflow-hidden"
            >
              <button 
                onClick={(e) => { e.stopPropagation(); setShowProjectsModal(false); }}
                className="absolute top-4 right-4 text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-primary))] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-3 mb-4 text-[rgb(var(--accent))]">
                <div className="w-10 h-10 rounded-full bg-[rgb(var(--accent))]/10 flex items-center justify-center">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-[rgb(var(--text-primary))]">Project Resources</h3>
              </div>
              
              <div className="text-[rgb(var(--text-secondary))] mb-6 space-y-3 text-sm">
                <p>Find related projects and tutorials for:</p>
                <p className="font-semibold text-[rgb(var(--text-primary))] bg-[rgb(var(--bg-body-alt))] p-3 rounded-lg border border-[rgb(var(--border-subtle))]">
                  {currentTopicContext}
                </p>
                <p>Choose where you want to search for resources:</p>
              </div>
              
              <div className="flex flex-col gap-3">
                <button
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(currentTopicContext + ' projects tutorial')}`, '_blank');
                  }}
                  className="w-full px-4 py-3 rounded-xl font-medium bg-[#FF0000]/10 text-[#FF0000] border border-[#FF0000]/20 hover:bg-[#FF0000]/20 transition-colors flex items-center justify-center gap-2"
                >
                  <Youtube className="w-5 h-5" />
                  Search on YouTube
                </button>
                <button
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    window.open(`https://github.com/search?q=${encodeURIComponent(currentTopicContext + ' projects')}&type=repositories`, '_blank');
                  }}
                  className="w-full px-4 py-3 rounded-xl font-medium bg-[#333]/10 text-[rgb(var(--text-primary))] dark:bg-white/10 border border-[#333]/20 dark:border-white/20 hover:bg-[#333]/20 dark:hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
                >
                  <Github className="w-5 h-5" />
                  Search on GitHub
                </button>
                <button
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    openResourceUrl(
                      currentTopicContext,
                      'gfg',
                      `https://www.geeksforgeeks.org/search/?q=${encodeURIComponent(currentTopicContext)}`
                    );
                  }}
                  className="w-full px-4 py-3 rounded-xl font-medium bg-[#0f9d58]/10 text-[#0f9d58] border border-[#0f9d58]/20 hover:bg-[#0f9d58]/20 transition-colors flex items-center justify-center gap-2"
                >
                  <BookOpen className="w-5 h-5" />
                  Read on GeeksforGeeks
                </button>
                <button
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    window.open(`https://www.google.com/search?q=${encodeURIComponent(currentTopicContext + ' programming projects and resources')}`, '_blank');
                  }}
                  className="w-full px-4 py-3 rounded-xl font-medium bg-[#4285F4]/10 text-[#4285F4] border border-[#4285F4]/20 hover:bg-[#4285F4]/20 transition-colors flex items-center justify-center gap-2"
                >
                  <Search className="w-5 h-5" />
                  Google Search
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setShowProjectsModal(false); }}
                  className="w-full mt-2 px-4 py-2.5 rounded-xl font-medium bg-[rgb(var(--bg-body-alt))] text-[rgb(var(--text-primary))] border border-[rgb(var(--border-subtle))] hover:bg-[rgb(var(--bg-body))] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIFeatureButtons;

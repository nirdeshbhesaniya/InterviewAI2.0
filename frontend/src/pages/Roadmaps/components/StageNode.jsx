import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  Clock,
  Folder,
  BookOpen,
  Zap,
  Rocket,
  Library,
  Youtube,
  Search,
} from 'lucide-react';
import TopicNode from './TopicNode';
import AIFeatureButtons from './AIFeatureButtons';
import AssessmentModal from './AssessmentModal';
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

const StageNode = ({ stage, phaseTitle, phaseColor, completedTopics, clearedModules, onTopicToggle, onModuleClear, careerTitle }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);

  const completedCount = stage.topics.filter(t => completedTopics.includes(t.id)).length;
  const totalTopics = stage.topics.length;
  const progressPct = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;
  
  // A stage is fully done ONLY if it's in clearedModules
  const isCleared = clearedModules?.includes(stage.id);
  const allTopicsLearned = completedCount === totalTopics && totalTopics > 0;
  const isAllDone = isCleared; // The checkmark in Stage header relies on this

  return (
    <motion.div
      layout
      className={`rounded-2xl border overflow-hidden transition-all duration-300 ${
        isAllDone
          ? 'border-green-500/40 bg-green-500/5'
          : isOpen
          ? 'border-[rgb(var(--accent))]/40 bg-[rgb(var(--bg-elevated))]'
          : 'border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated))] hover:border-[rgb(var(--accent))]/30'
      }`}
    >
      {/* Stage Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-4 p-4 text-left"
      >
        {/* Status circle */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
          isAllDone
            ? 'bg-green-500 shadow-lg shadow-green-500/30'
            : progressPct > 0
            ? `${phaseColor} opacity-80`
            : 'bg-[rgb(var(--bg-body))] border border-[rgb(var(--border))]'
        }`}>
          {isAllDone ? (
            <Zap className="w-5 h-5 text-white" />
          ) : progressPct > 0 ? (
            <span className="text-white text-xs font-bold">{progressPct}%</span>
          ) : (
            <Folder className="w-4 h-4 text-[rgb(var(--text-muted))]" />
          )}
        </div>

        {/* Stage info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-bold text-[rgb(var(--text-primary))] truncate">
              {stage.title}
            </h4>
            {isAllDone && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 font-semibold flex-shrink-0">
                ✓ Complete
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-[rgb(var(--text-muted))]">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {stage.estimatedTime}
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              {completedCount}/{totalTopics} topics
            </span>
          </div>
        </div>

        {/* Progress mini bar */}
        <div className="hidden sm:block w-20">
          <div className="w-full h-1.5 bg-[rgb(var(--border))] rounded-full overflow-hidden">
            <motion.div
              className={`h-full ${isAllDone ? 'bg-green-500' : phaseColor.replace('bg-', 'bg-')}`}
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.6 }}
            />
          </div>
        </div>

        {/* Chevron */}
        <ChevronDown
          className={`w-5 h-5 text-[rgb(var(--text-muted))] transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-5 space-y-5 border-t border-[rgb(var(--border))]">
              {/* Topics */}
              <div className="pt-4">
                <h5 className="text-xs font-bold text-[rgb(var(--text-muted))] uppercase tracking-wider mb-3 flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5" />
                  Topics to Learn
                </h5>
                <div className="space-y-2">
                  {stage.topics.map((topic) => (
                    <TopicNode
                      key={topic.id}
                      topic={topic}
                      isCompleted={completedTopics.includes(topic.id)}
                      isCleared={isCleared}
                      onToggle={onTopicToggle}
                    />
                  ))}
                </div>
              </div>

              {/* Assessment Test Button */}
              {allTopicsLearned && !isCleared && (
                <div className="pt-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsAssessmentModalOpen(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl shadow-lg hover:shadow-orange-500/25 transition-all animate-pulse"
                  >
                    <Zap className="w-5 h-5" />
                    Assessment Test
                  </button>
                </div>
              )}

              {/* AI Feature Buttons */}
              <div>
                <h5 className="text-xs font-bold text-[rgb(var(--text-muted))] uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5" />
                  AI-Powered Practice
                </h5>
                <AIFeatureButtons
                  stageName={stage.title}
                  careerTitle={careerTitle}
                  phaseTitle={phaseTitle}
                  topics={stage.topics}
                  compact
                />
              </div>

              {/* Projects */}
              {stage.projects?.length > 0 && (
                <div>
                  <h5 className="text-xs font-bold text-[rgb(var(--text-muted))] uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Rocket className="w-3.5 h-3.5" />
                    Practice Projects
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {stage.projects.map((project, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-3 py-1.5 rounded-lg bg-[rgb(var(--accent))]/10 text-[rgb(var(--accent))] border border-[rgb(var(--accent))]/20 font-medium flex items-center gap-1.5"
                      >
                        <Rocket className="w-3 h-3" />
                        {project}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested Resources */}
              <div>
                <h5 className="text-xs font-bold text-[rgb(var(--text-muted))] uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Library className="w-3.5 h-3.5" />
                  Suggested Resources
                </h5>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const topicsStr = stage.topics.map(t => t.name).join(' ');
                      const searchQuery = `${careerTitle} ${phaseTitle || ''} ${stage.title} ${topicsStr}`;
                      window.open(`https://www.google.com/search?q=site:geeksforgeeks.org+${encodeURIComponent(searchQuery)}`, '_blank');
                    }}
                    className="text-xs px-3 py-1.5 rounded-lg bg-[rgb(var(--bg-body))] text-[rgb(var(--text-primary))] hover:text-[#0f9d58] border border-[rgb(var(--border))] hover:border-[#0f9d58]/30 transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <BookOpen className="w-3 h-3 flex-shrink-0" />
                    GFG Article
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const topicsStr = stage.topics.map(t => t.name).join(' ');
                      const searchQuery = `${careerTitle} ${phaseTitle || ''} ${stage.title} ${topicsStr}`;
                      window.open(`https://www.google.com/search?q=site:w3schools.com+${encodeURIComponent(searchQuery)}`, '_blank');
                    }}
                    className="text-xs px-3 py-1.5 rounded-lg bg-[rgb(var(--bg-body))] text-[rgb(var(--text-primary))] hover:text-[#04AA6D] border border-[rgb(var(--border))] hover:border-[#04AA6D]/30 transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <BookOpen className="w-3 h-3 flex-shrink-0" />
                    W3Schools
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const topicsStr = stage.topics.map(t => t.name).join(' ');
                      const searchQuery = `${careerTitle} ${phaseTitle || ''} ${stage.title} ${topicsStr}`;
                      window.open(`https://www.google.com/search?q=site:developer.mozilla.org+${encodeURIComponent(searchQuery)}`, '_blank');
                    }}
                    className="text-xs px-3 py-1.5 rounded-lg bg-[rgb(var(--bg-body))] text-[rgb(var(--text-primary))] hover:text-blue-500 border border-[rgb(var(--border))] hover:border-blue-500/30 transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <BookOpen className="w-3 h-3 flex-shrink-0" />
                    Official Docs
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const topicsStr = stage.topics.map(t => t.name).join(' ');
                      const searchQuery = `${careerTitle} ${phaseTitle || ''} ${stage.title} ${topicsStr} tutorial`;
                      window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`, '_blank');
                    }}
                    className="text-xs px-3 py-1.5 rounded-lg bg-[rgb(var(--bg-body))] text-[rgb(var(--text-primary))] hover:text-[#FF0000] border border-[rgb(var(--border))] hover:border-[#FF0000]/30 transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <Youtube className="w-3 h-3 flex-shrink-0" />
                    YouTube Search
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const topicsStr = stage.topics.map(t => t.name).join(' ');
                      const searchQuery = `${careerTitle} ${phaseTitle || ''} ${stage.title} ${topicsStr} programming resources`;
                      window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, '_blank');
                    }}
                    className="text-xs px-3 py-1.5 rounded-lg bg-[rgb(var(--bg-body))] text-[rgb(var(--text-primary))] hover:text-[#4285F4] border border-[rgb(var(--border))] hover:border-[#4285F4]/30 transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <Search className="w-3 h-3 flex-shrink-0" />
                    Google Search
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AssessmentModal
        isOpen={isAssessmentModalOpen}
        onClose={() => setIsAssessmentModalOpen(false)}
        moduleTitle={stage.title}
        topics={stage.topics.map(t => t.name)}
        onClear={() => {
          onModuleClear(stage.id);
          setIsAssessmentModalOpen(false);
        }}
      />
    </motion.div>
  );
};

export default StageNode;

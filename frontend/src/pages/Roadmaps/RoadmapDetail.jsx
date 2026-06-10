import React, { useState, useContext, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  TrendingUp,
  IndianRupee,
  BookOpen,
  Share2,
  RotateCcw,
  ChevronRight,
  Mic,
  Map,
  Trophy,
} from 'lucide-react';
import * as Icons from 'lucide-react';
import { UserContext } from '../../context/UserContext';
import {
  getRoadmapById,
  getProgress,
  saveProgress,
  countTotalTopics,
  computeXP,
} from './data/roadmapsData';
import PhaseNode from './components/PhaseNode';
import StatsPanel from './components/StatsPanel';
import { toast } from 'react-hot-toast';

const RoadmapDetail = () => {
  const { careerId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  const userId = user?._id || user?.email || 'guest';
  const roadmap = getRoadmapById(careerId);

  const [completedTopics, setCompletedTopics] = useState([]);

  // Load progress from localStorage on mount
  useEffect(() => {
    if (roadmap) {
      const { completedTopics: saved } = getProgress(userId, roadmap.id);
      setCompletedTopics(saved || []);
    }
  }, [userId, roadmap?.id]);

  // Save on change
  useEffect(() => {
    if (roadmap && userId) {
      saveProgress(userId, roadmap.id, completedTopics);
    }
  }, [completedTopics, userId, roadmap?.id]);

  const handleTopicToggle = (topicId) => {
    setCompletedTopics(prev => {
      const updated = prev.includes(topicId)
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId];
      
      // Milestone toasts
      const total = countTotalTopics(roadmap);
      const pct = Math.round((updated.length / total) * 100);
      if (pct === 25 && !prev.includes(topicId)) toast.success('🌱 25% done! Keep going!', { icon: '🎉' });
      if (pct === 50 && !prev.includes(topicId)) toast.success('⚡ Halfway there! You\'re amazing!', { icon: '🎊' });
      if (pct === 75 && !prev.includes(topicId)) toast.success('🔥 Almost there! Final stretch!', { icon: '💪' });
      if (pct === 100 && !prev.includes(topicId)) toast.success('🏆 Roadmap Complete! You\'re a champion!', { icon: '🚀' });

      return updated;
    });
  };

  const handleReset = () => {
    if (window.confirm('Reset all progress for this roadmap?')) {
      setCompletedTopics([]);
      toast.success('Progress reset');
    }
  };

  if (!roadmap) {
    return (
      <div className="min-h-screen bg-[rgb(var(--bg-body))] flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 rounded-2xl bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border))] flex items-center justify-center mx-auto mb-4">
            <Map className="w-8 h-8 text-[rgb(var(--text-muted))]" />
          </div>
          <h2 className="text-2xl font-bold text-[rgb(var(--text-primary))] mb-2">Roadmap not found</h2>
          <button
            onClick={() => navigate('/roadmaps')}
            className="text-[rgb(var(--accent))] hover:underline mt-4"
          >
            ← Back to Roadmaps
          </button>
        </div>
      </div>
    );
  }

  const totalTopics = countTotalTopics(roadmap);
  const progressPercent = totalTopics > 0 ? Math.round((completedTopics.length / totalTopics) * 100) : 0;
  const xp = computeXP(completedTopics);

  return (
    <div className="min-h-screen bg-[rgb(var(--bg-body))]">
      {/* ─── HERO HEADER ─── */}
      <div className={`relative overflow-hidden bg-gradient-to-br ${roadmap.cardGradient} border-b border-[rgb(var(--border))]`}>
        <div className="absolute inset-0 bg-[rgb(var(--bg-body))]/60" />
        
        {/* Decorative blobs */}
        <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${roadmap.gradient} rounded-full opacity-10 blur-3xl transform translate-x-32 -translate-y-32`} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Nav row */}
          <div className="flex items-center gap-3 mb-6 text-sm text-[rgb(var(--text-muted))]">
            <button
              onClick={() => navigate('/roadmaps')}
              className="flex items-center gap-1 hover:text-[rgb(var(--accent))] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Roadmaps
            </button>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[rgb(var(--text-primary))] font-medium">{roadmap.title}</span>
          </div>

          {/* Hero content */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex items-start gap-5">
              {/* Icon box */}
              <div className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br ${roadmap.gradient} flex items-center justify-center shadow-xl`}>
                {(() => {
                  const IC = Icons[roadmap.icon] || Icons.Briefcase;
                  return <IC className="w-8 h-8 sm:w-10 sm:h-10 text-white" />;
                })()}
              </div>

              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${roadmap.difficultyColor}`}>
                    {roadmap.difficulty}
                  </span>
                  <span className="text-xs text-[rgb(var(--text-muted))] capitalize bg-[rgb(var(--bg-elevated))]/80 px-2.5 py-1 rounded-full border border-[rgb(var(--border))]">
                    {roadmap.category.replace('-', ' & ')}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[rgb(var(--text-primary))] mb-2">
                  {roadmap.title}
                </h1>
                <p className="text-sm sm:text-base text-[rgb(var(--text-secondary))] max-w-xl leading-relaxed">
                  {roadmap.description}
                </p>

                {/* Quick stats */}
                <div className="flex flex-wrap gap-4 mt-4 text-sm text-[rgb(var(--text-muted))]">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[rgb(var(--accent))]" />
                    <span><span className="font-semibold text-[rgb(var(--text-primary))]">{roadmap.duration}</span> to complete</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <IndianRupee className="w-4 h-4 text-green-400" />
                    <span><span className="font-semibold text-green-400">{roadmap.salary.replace(/₹/g, '').replace(/L/g, '')} LPA</span> salary range</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${roadmap.demandColor}`}>
                    <TrendingUp className="w-4 h-4" />
                    <span><span className="font-semibold">{roadmap.demand}</span> demand</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-[rgb(var(--accent))]" />
                    <span><span className="font-semibold text-[rgb(var(--text-primary))]">{totalTopics}</span> topics</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {roadmap.tags.map(tag => (
                    <span key={tag} className="text-xs px-3 py-1 rounded-full bg-[rgb(var(--accent))]/10 text-[rgb(var(--accent))] border border-[rgb(var(--accent))]/20 font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap lg:flex-col gap-2 lg:min-w-max">
              <motion.button
                onClick={() => navigate('/mock-interview/create', { state: { topic: roadmap.title } })}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r ${roadmap.gradient} text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all text-sm`}
              >
                <Mic className="w-4 h-4" />
                Mock Interview
              </motion.button>
              <motion.button
                onClick={handleReset}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2.5 border border-[rgb(var(--border))] text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-primary))] rounded-xl text-sm transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                Reset Progress
              </motion.button>
            </div>
          </div>

          {/* Progress bar (full width) */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-xs text-[rgb(var(--text-muted))] mb-2">
              <span>Overall Progress</span>
              <span className="font-bold text-[rgb(var(--text-primary))]">{progressPercent}% ({completedTopics.length}/{totalTopics} topics)</span>
            </div>
            <div className="w-full h-3 bg-[rgb(var(--border))] rounded-full overflow-hidden">
              <motion.div
                className={`h-full bg-gradient-to-r ${roadmap.gradient} rounded-full`}
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ─── MAIN CONTENT ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Roadmap Timeline (main) */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-[rgb(var(--text-primary))]">
                Learning Roadmap
              </h2>
              <span className="text-sm text-[rgb(var(--text-muted))]">
                Click topics to mark as complete
              </span>
            </div>

            <div className="space-y-2">
              {roadmap.phases.map((phase, idx) => (
                <PhaseNode
                  key={phase.id}
                  phase={phase}
                  index={idx}
                  totalPhases={roadmap.phases.length}
                  completedTopics={completedTopics}
                  onTopicToggle={handleTopicToggle}
                  careerTitle={roadmap.title}
                />
              ))}
            </div>

            {/* Completion message */}
            <AnimatePresence>
              {progressPercent === 100 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="mt-8 p-8 rounded-3xl bg-gradient-to-br from-green-500/20 via-emerald-500/10 to-teal-500/10 border border-green-500/30 text-center"
                >
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-green-500/30">
                    <Trophy className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-black text-green-400 mb-2">Roadmap Mastered!</h3>
                  <p className="text-[rgb(var(--text-secondary))] mb-4">
                    You've completed the {roadmap.title} roadmap. You're industry-ready!
                  </p>
                  <motion.button
                    onClick={() => navigate('/mock-interview/create', { state: { topic: roadmap.title } })}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-2xl shadow-xl shadow-green-500/30"
                  >
                    🎤 Take Final Mock Interview
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Stats sidebar (sticky) */}
          <div className="lg:w-72 xl:w-80 flex-shrink-0">
            <div className="sticky top-24">
              <StatsPanel
                roadmap={roadmap}
                progressPercent={progressPercent}
                completedCount={completedTopics.length}
                totalCount={totalTopics}
                xp={xp}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoadmapDetail;

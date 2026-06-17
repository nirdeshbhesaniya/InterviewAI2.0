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
  Search,
} from 'lucide-react';
import * as Icons from 'lucide-react';
import { UserContext } from '../../context/UserContext';
import {
  getRoadmapById,
  countTotalTopics,
  computeXP,
} from './data/roadmapsData';
import { roadmapService } from '../../services/roadmapService';
import PhaseNode from './components/PhaseNode';
import StatsPanel from './components/StatsPanel';
import JobSearchModal from './components/JobSearchModal';
import { toast } from 'react-hot-toast';
import { useConfirm } from '../../context/ConfirmContext';

const RoadmapDetail = () => {
  const { careerId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const { confirm } = useConfirm();

  const userId = user?._id || user?.email || 'guest';
  const roadmap = getRoadmapById(careerId);

  const [completedTopics, setCompletedTopics] = useState([]);
  const [clearedModules, setClearedModules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);

  // Compute effective completed topics: includes raw completedTopics PLUS all topics inside clearedModules
  const effectiveCompletedTopics = useMemo(() => {
    if (!roadmap) return [];
    const effectiveSet = new Set(completedTopics);
    roadmap.phases.forEach(phase => {
      phase.stages.forEach(stage => {
        if (clearedModules.includes(stage.id)) {
          stage.topics.forEach(t => effectiveSet.add(t.id));
        }
      });
    });
    return Array.from(effectiveSet);
  }, [roadmap, completedTopics, clearedModules]);

  // Load progress from API on mount
  useEffect(() => {
    let isMounted = true;
    const fetchProgress = async () => {
      if (!roadmap) return;
      try {
        setIsLoading(true);
        if (userId && userId !== 'guest') {
          const progressData = await roadmapService.getProgress(roadmap.id);
          if (isMounted) {
            setCompletedTopics(progressData?.completedTopics || []);
            setClearedModules(progressData?.clearedModules || []);
          }
        }
      } catch (error) {
        console.error('Failed to load roadmap progress:', error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchProgress();

    return () => { isMounted = false; };
  }, [userId, roadmap?.id]);

  const handleTopicToggle = async (topicId) => {
    try {
      let updated = [];
      setCompletedTopics(prev => {
        updated = prev.includes(topicId)
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

      if (userId && userId !== 'guest') {
        await roadmapService.saveProgress(roadmap.id, updated, clearedModules);
      }
    } catch (error) {
      console.error('Failed to save roadmap progress:', error);
      toast.error('Failed to save progress. Please try again.');
    }
  };

  const handleReset = async () => {
    if (await confirm('Reset all progress for this roadmap?')) {
      try {
        setCompletedTopics([]);
        setClearedModules([]);
        if (userId && userId !== 'guest') {
          await roadmapService.saveProgress(roadmap.id, [], []);
        }
        toast.success('Progress reset');
      } catch (error) {
        console.error('Failed to reset roadmap progress:', error);
        toast.error('Failed to reset progress. Please try again.');
      }
    }
  };

  const handleModuleClear = async (moduleId) => {
    try {
      const updatedClearedModules = [...clearedModules, moduleId];
      setClearedModules(updatedClearedModules);
      if (userId && userId !== 'guest') {
        await roadmapService.saveProgress(roadmap.id, completedTopics, updatedClearedModules);
      }
      toast.success('Module Mastered! Topics are now green.', { icon: '🎓' });
    } catch (error) {
      console.error('Failed to save module clear progress:', error);
      toast.error('Failed to save module progress.');
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
  const progressPercent = totalTopics > 0 ? Math.round((effectiveCompletedTopics.length / totalTopics) * 100) : 0;
  const xp = computeXP(effectiveCompletedTopics);

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
              <span className="font-bold text-[rgb(var(--text-primary))]">{progressPercent}% ({effectiveCompletedTopics.length}/{totalTopics} topics)</span>
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
                  completedTopics={effectiveCompletedTopics}
                  clearedModules={clearedModules}
                  onTopicToggle={handleTopicToggle}
                  onModuleClear={handleModuleClear}
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

            {/* Search Jobs Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-8 p-6 sm:p-8 rounded-3xl bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border))] flex flex-col sm:flex-row items-center justify-between gap-6"
            >
              <div>
                <h3 className="text-xl font-black text-[rgb(var(--text-primary))] mb-2 flex items-center gap-2">
                  <Search className="w-5 h-5 text-blue-500" />
                  Ready to apply?
                </h3>
                <p className="text-[rgb(var(--text-secondary))] text-sm">
                  Find the latest hand-picked job openings for {roadmap.title}. We have opportunities for both freshers and experienced professionals.
                </p>
              </div>
              <motion.button
                onClick={() => setIsJobModalOpen(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all flex items-center justify-center gap-2 flex-shrink-0"
              >
                <Search className="w-4 h-4" />
                Search Jobs
              </motion.button>
            </motion.div>
          </div>

          {/* Stats sidebar (sticky) */}
          <div className="lg:w-72 xl:w-80 flex-shrink-0">
            <div className="sticky top-24">
              <StatsPanel
                roadmap={roadmap}
                progressPercent={progressPercent}
                completedCount={effectiveCompletedTopics.length}
                totalCount={totalTopics}
                xp={xp}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <JobSearchModal 
        isOpen={isJobModalOpen} 
        onClose={() => setIsJobModalOpen(false)} 
        careerTitle={roadmap.title} 
        branch={roadmap.branch || roadmap.category || 'software'}
      />
    </div>
  );
};

export default RoadmapDetail;

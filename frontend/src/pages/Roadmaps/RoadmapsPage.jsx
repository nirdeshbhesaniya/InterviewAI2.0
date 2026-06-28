import React, { useState, useMemo, useContext, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Map, Zap, Users, TrendingUp, GitCompare, Sparkles, Bot } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROADMAPS, getRoadmapsByCategory, countTotalTopics, getCategoriesForBranch, getEffectiveCompletedTopics } from './data/roadmapsData';
import CareerCard from './components/CareerCard';
import FilterBar from './components/FilterBar';
import { UserContext } from '../../context/UserContext';
import BranchModal from '../../components/BranchModal';
import { BRANCHES } from '../../utils/constants';
import { roadmapService } from '../../services/roadmapService';

// Animated background blobs
const BackgroundBlobs = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
    <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl animate-blob1" />
    <div className="absolute top-40 right-10 w-96 h-96 bg-cyan-500/8 rounded-full blur-3xl animate-blob2" />
    <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-purple-500/8 rounded-full blur-3xl animate-blob3" />
  </div>
);

const StatCard = ({ icon: Icon, value, label, gradient }) => (
  <motion.div
    whileHover={{ y: -4 }}
    className="flex items-center gap-3 px-5 py-4 rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated))]/80 backdrop-blur-sm"
  >
    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center`}>
      <Icon className="w-5 h-5 text-white" />
    </div>
    <div>
      <p className="text-xl font-black text-[rgb(var(--text-primary))]">{value}</p>
      <p className="text-xs text-[rgb(var(--text-muted))]">{label}</p>
    </div>
  </motion.div>
);

const RoadmapsPage = () => {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const [currentBranch, setCurrentBranch] = useState(localStorage.getItem('dashboard_branch') || 'computer');
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [allProgress, setAllProgress] = useState({});

  useEffect(() => {
      if (currentBranch) {
          localStorage.setItem('dashboard_branch', currentBranch);
      }
  }, [currentBranch]);

  const userId = user?._id || user?.email || null;

  useEffect(() => {
    let isMounted = true;
    const fetchAllProgress = async () => {
      if (userId && userId !== 'guest') {
        try {
          const progresses = await roadmapService.getAllProgress();
          const progressMap = {};
          progresses.forEach(p => {
            const rmap = ROADMAPS.find(r => r.id === p.roadmapId);
            if (rmap) {
               const effective = getEffectiveCompletedTopics(rmap, p.completedTopics, p.clearedModules);
               progressMap[p.roadmapId] = effective.length;
            } else {
               progressMap[p.roadmapId] = p.completedTopics?.length || 0;
            }
          });
          if (isMounted) setAllProgress(progressMap);
        } catch (error) {
          console.error('Failed to fetch all roadmap progress:', error);
        }
      }
    };
    fetchAllProgress();
    return () => { isMounted = false; };
  }, [userId]);

  const currentBranchInfo = BRANCHES.find(b => b.id === currentBranch) || BRANCHES[0];

  const isComputerBranch = ['computer', 'it', 'cs-ds'].includes(currentBranch);

  const branchRoadmaps = useMemo(() => {
    let list = isComputerBranch ? getRoadmapsByCategory(activeCategory) : ROADMAPS;
    if (isComputerBranch) {
        list = list.filter(r => !['ece-core', 'ee-core', 'mech-core', 'civil-core', 'chem-core'].includes(r.id) && !r.branch);
    } else if (currentBranch === 'electronics') {
        list = list.filter(r => r.id === 'ece-core' || r.branch === 'electronics');
    } else if (currentBranch === 'electrical') {
        list = list.filter(r => r.id === 'ee-core' || r.branch === 'electrical');
    } else if (currentBranch === 'mechanical') {
        list = list.filter(r => r.id === 'mech-core' || r.branch === 'mechanical');
    } else if (currentBranch === 'civil') {
        list = list.filter(r => r.id === 'civil-core' || r.branch === 'civil');
    } else if (currentBranch === 'chemical') {
        list = list.filter(r => r.id === 'chem-core' || r.branch === 'chemical');
    } else {
        list = list.filter(r => !['ece-core', 'ee-core', 'mech-core', 'civil-core', 'chem-core'].includes(r.id) && !r.branch);
    }
    return list;
  }, [activeCategory, currentBranch, isComputerBranch]);

  const totalCareerPaths = branchRoadmaps.length;
  const totalSkillTopics = useMemo(() => {
    return branchRoadmaps.reduce((acc, roadmap) => acc + countTotalTopics(roadmap), 0);
  }, [branchRoadmaps]);

  const filteredRoadmaps = useMemo(() => {
    let list = branchRoadmaps;

    if (activeCategory !== 'all') {
      list = list.filter(r => r.category === activeCategory);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(r =>
        r.title.toLowerCase().includes(q) ||
        r.tags.some(t => t.toLowerCase().includes(q)) ||
        r.description.toLowerCase().includes(q)
      );
    }
    return list;
  }, [searchTerm, branchRoadmaps, activeCategory]);

  return (
    <div className="min-h-screen bg-[rgb(var(--bg-body))] relative overflow-hidden flex flex-col pb-12">
      {/* Background Decorative Glow */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[rgb(var(--accent))]/10 rounded-full blur-[120px] -z-10 pointer-events-none translate-x-1/3 -translate-y-1/3"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] -z-10 pointer-events-none -translate-x-1/3 translate-y-1/3"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">

        {/* ─── HERO SECTION ─── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[rgb(var(--accent))]/10 border border-[rgb(var(--accent))]/30 text-[rgb(var(--accent))] text-sm font-semibold mb-6"
          >
            <Sparkles className="w-4 h-4" />
            AI-Powered Career Roadmaps
          </motion.div>

          <div className="flex flex-col items-center justify-center mb-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[rgb(var(--text-primary))] leading-tight text-center">
              Explore <span className="text-[rgb(var(--text-secondary))]">{currentBranchInfo?.name || 'Computer Engineering'}</span> Career{' '}
              <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Roadmaps
              </span>
            </h1>
          </div>
          
          <div className="flex justify-center mb-6">
              <button
                  onClick={() => setShowBranchModal(true)}
                  className="px-5 py-2 rounded-xl text-sm font-bold bg-[rgb(var(--bg-elevated))]/40 border border-[rgb(var(--border-subtle))] text-[rgb(var(--text-secondary))] hover:text-white hover:bg-[rgb(var(--accent))] hover:border-[rgb(var(--accent))] transition-all backdrop-blur-sm"
              >
                  Change Branch
              </button>
          </div>

          <p className="text-lg text-[rgb(var(--text-secondary))] max-w-2xl mx-auto leading-relaxed mb-8">
            Choose your dream tech career and follow a step-by-step roadmap from{' '}
            <span className="text-[rgb(var(--accent))] font-semibold">beginner</span> to{' '}
            <span className="text-emerald-400 font-semibold">industry-ready professional</span>.
          </p>

          {/* Stats row */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
            <StatCard icon={Map} value={totalCareerPaths} label="Career Paths" gradient="from-blue-500 to-cyan-500" />
            <StatCard icon={Zap} value={`${totalSkillTopics}+`} label="Skill Topics" gradient="from-purple-500 to-violet-500" />
            <StatCard icon={Bot} value="AI" label="Mentor Guidance" gradient="from-emerald-500 to-green-500" />
            <StatCard icon={TrendingUp} value="XP" label="Gamified Progress" gradient="from-orange-500 to-red-500" />
          </div>

          {/* Search */}
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-[rgb(var(--text-muted))]" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search careers, skills, technologies..."
              className="w-full pl-14 pr-12 py-4 rounded-full border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-elevated))]/60 backdrop-blur-md text-[rgb(var(--text-primary))] placeholder-[rgb(var(--text-muted))] focus:outline-none focus:border-[rgb(var(--accent))] transition-all text-base shadow-lg shadow-black/5"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-5 text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-primary))] transition-colors text-sm"
              >
                ✕
              </button>
            )}
          </div>
        </motion.div>

        {/* ─── FILTER BAR ─── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <FilterBar 
                activeCategory={activeCategory} 
                onCategoryChange={setActiveCategory} 
                categories={getCategoriesForBranch(currentBranch)}
              />
            </div>
            <motion.button
              onClick={() => navigate('/roadmaps/compare')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[rgb(var(--bg-elevated))]/40 border border-[rgb(var(--border-subtle))] text-[rgb(var(--text-primary))] text-sm font-bold hover:bg-[rgb(var(--accent))] hover:text-white hover:border-[rgb(var(--accent))] flex-shrink-0 transition-all backdrop-blur-sm group"
            >
              <GitCompare className="w-4 h-4 text-[rgb(var(--accent))] group-hover:text-white transition-colors" />
              Compare Careers
            </motion.button>
          </div>
        </motion.div>

        {/* ─── RESULTS HEADER ─── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-between mb-6"
        >
          <p className="text-sm font-medium text-[rgb(var(--text-muted))]">
            <span className="font-bold text-[rgb(var(--text-primary))]">{filteredRoadmaps.length}</span> career paths found
          </p>
          <button
            onClick={() => navigate('/roadmaps/compare')}
            className="sm:hidden flex items-center gap-1.5 text-sm text-[rgb(var(--text-primary))] bg-[rgb(var(--bg-elevated))] px-3 py-1.5 rounded-lg border border-[rgb(var(--border-subtle))] font-semibold"
          >
            <GitCompare className="w-4 h-4 text-[rgb(var(--accent))]" />
            Compare
          </button>
        </motion.div>

        {/* ─── CAREER GRID ─── */}
        <AnimatePresence mode="popLayout">
          {filteredRoadmaps.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-24 text-center bg-[rgb(var(--bg-card))]/40 backdrop-blur-sm rounded-3xl border border-[rgb(var(--border-subtle))]"
            >
              <div className="w-20 h-20 rounded-2xl bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border-subtle))] flex items-center justify-center mb-6 shadow-sm">
                <Search className="w-8 h-8 text-[rgb(var(--text-muted))]" />
              </div>
              <h3 className="text-xl font-bold text-[rgb(var(--text-primary))] mb-2">No careers found</h3>
              <p className="text-[rgb(var(--text-secondary))] mb-6 max-w-md mx-auto">We couldn't find any career paths matching your search. Try a different term or category.</p>
              <button
                onClick={() => { setSearchTerm(''); setActiveCategory('all'); }}
                className="px-6 py-2.5 bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border-subtle))] rounded-xl text-[rgb(var(--text-primary))] font-bold hover:bg-[rgb(var(--accent))] hover:text-white hover:border-[rgb(var(--accent))] transition-all"
              >
                Clear filters
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {filteredRoadmaps.map((roadmap, index) => (
                <CareerCard
                  key={roadmap.id}
                  roadmap={roadmap}
                  userId={userId}
                  index={index}
                  completedTopicsCount={allProgress[roadmap.id] || 0}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── BOTTOM CTA ─── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-20 rounded-3xl bg-[rgb(var(--bg-card))]/60 backdrop-blur-xl border border-indigo-500/20 p-8 text-center relative overflow-hidden shadow-2xl"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-cyan-500/10 pointer-events-none" />
          <div className="relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-5 shadow-[0_0_20px_rgba(99,102,241,0.4)]">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-black text-[rgb(var(--text-primary))] mb-3">
              Not sure which path to choose?
            </h2>
            <p className="text-[rgb(var(--text-secondary))] mb-8 max-w-lg mx-auto font-medium">
              Use the Career Comparison tool to compare salaries, demand, difficulty, and required skills side by side.
            </p>
            <motion.button
              onClick={() => navigate('/roadmaps/compare')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] transition-all"
            >
              <GitCompare className="w-5 h-5" />
              Compare Careers Now
            </motion.button>
          </div>
        </motion.div>
      </div>

      <BranchModal
        isOpen={showBranchModal}
        onClose={() => setShowBranchModal(false)}
        onSelectBranch={(branchId) => {
            setCurrentBranch(branchId);
            setShowBranchModal(false);
        }}
        currentBranch={currentBranch}
      />
    </div>
  );
};

export default RoadmapsPage;

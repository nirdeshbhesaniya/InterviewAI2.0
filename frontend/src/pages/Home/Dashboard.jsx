import React, { useState, useEffect, useContext } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  PlusCircle,
  Trash2,
  Bot,
  Search,
  Calendar,
  Users,
  Target,
  TrendingUp,
  Clock,
  BookOpen,
  Filter,
  Grid,
  List,
  X,
  MoreVertical,
  Eye,
  Library
} from 'lucide-react';
import CreateCardModal from '../../components/Cards/CreateCardForm';
import CreatorInfoModal from '../../components/Cards/CreatorInfoModal';
import axios from '../../utils/axiosInstance';
import { API } from '../../utils/apiPaths';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/badge';
import { Loader } from '../../components/ui/Loader';
import emptyStateImg from '../../assets/empty-state.jpg';
import { Input } from '@/components/ui/input';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Pagination from '../../components/common/Pagination';
import { UserContext } from '../../context/UserContext';
import { BRANCHES } from '../../utils/constants';
import BranchModal from '../../components/BranchModal';

export const Dashboard = () => {
  const { user } = useContext(UserContext);
  const [cards, setCards] = useState([]);
  const [filteredCards, setFilteredCards] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [creatorModalOpen, setCreatorModalOpen] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBranch, setSelectedBranch] = useState(localStorage.getItem('dashboard_branch') || '');
  const [showBranchModal, setShowBranchModal] = useState(!localStorage.getItem('dashboard_branch'));
  const ITEMS_PER_PAGE = 12;
  const navigate = useNavigate();

  const userEmail = user?.email || JSON.parse(localStorage.getItem("user"))?.email;
  const userRole = user?.role || JSON.parse(localStorage.getItem("user"))?.role;

  const gradients = [
    'from-primary/20 via-primary/10 to-bg-card',
    'from-secondary/20 via-secondary/10 to-bg-card',
    'from-highlight/20 via-pink-500/10 to-bg-card',
    'from-green-500/20 via-emerald-500/10 to-bg-card',
    'from-yellow-500/20 via-amber-500/10 to-bg-card',
    'from-indigo-500/20 via-blue-500/10 to-bg-card',
    'from-pink-500/20 via-rose-500/10 to-bg-card',
    'from-teal-500/20 via-green-500/10 to-bg-card'
  ];

  const badgeColors = [
    'bg-blue-500/20 text-blue-300 border-blue-500/30',
    'bg-purple-500/20 text-purple-300 border-purple-500/30',
    'bg-green-500/20 text-green-300 border-green-500/30',
    'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    'bg-pink-500/20 text-pink-300 border-pink-500/30',
    'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    'bg-teal-500/20 text-teal-300 border-teal-500/30'
  ];

  const fetchCards = async () => {
    try {
      setLoading(true);
      await new Promise((res) => setTimeout(res, 1000));
      const res = await axios.get(API.INTERVIEW.GET_ALL);
      setCards(res.data);
      setFilteredCards(res.data);
    } catch (err) {
      console.error('Failed to load cards', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  // Handle Search Navigation Auto-Open
  const location = useLocation();
  useEffect(() => {
    if (location.state?.highlightId && cards.length > 0) {
      const targetId = location.state.highlightId;
      const targetCard = cards.find(c => c.sessionId === targetId || c._id === targetId);
      if (targetCard && targetCard.qna && targetCard.qna.length > 0) {
        navigate(`/interview-prep/${targetCard.sessionId}`);
        // Clear state so it doesn't reopen on refresh
        window.history.replaceState({}, document.title);
      } else if (targetCard) {
        // If it's empty, just highlight it (stay on dashboard)
        window.history.replaceState({}, document.title);
      }
    }
  }, [location.state, cards]);

  const handleCreated = (sessionId) => {
    fetchCards();
    if (sessionId) {
      navigate(`/interview-prep/${sessionId}`);
    }
  };

  const handleDeleteClick = (sessionId) => {
    console.log('Delete clicked for session:', sessionId);
    console.log('User role:', userRole);
    console.log('User email:', userEmail);
    setSelectedCardId(sessionId);
    setConfirmModal(true);
  };

  const confirmDelete = async () => {
    try {
      // Use the userRole from component state/context
      if (userRole === 'admin' || userRole === 'owner') {
        await axios.delete(API.ADMIN.DELETE_INTERVIEW(selectedCardId));
      } else {
        await axios.delete(API.INTERVIEW.DELETE(selectedCardId));
      }
      toast.success("Session deleted successfully");
      setConfirmModal(false);
      setSelectedCardId(null);
      fetchCards();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.response?.data?.message || "Failed to delete session");
    }
  };

  const handleInitialize = async (e, sessionId) => {
    e.stopPropagation();
    const loadingToast = toast.loading("Generating Interview Content... This may take a moment.");
    try {
      await axios.post(API.INTERVIEW.INITIALIZE(sessionId));
      toast.dismiss(loadingToast);
      toast.success("Interview Content Generated! 🚀");
      fetchCards();
      navigate(`/interview-prep/${sessionId}`);
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error(err?.response?.data?.message || "Failed to generate content");
    }
  };

  const handleCreatorClick = (e, card) => {
    e.stopPropagation();
    const creator = card.creatorDetails || {
      fullName: 'Unknown Creator',
      email: card.creatorEmail,
      bio: 'No information available.',
      photo: null
    };

    // Always open if we at least have an email
    if (creator.email || (creator.fullName && creator.fullName !== 'Unknown Creator')) {
      setSelectedCreator(creator);
      setCreatorModalOpen(true);
    }
  };

  // Debounced Search and Branch Filtering
  useEffect(() => {
    setCurrentPage(1); // Reset to first page on search
    const delayDebounce = setTimeout(() => {
      const filtered = cards.filter((card) => {
        const combinedText = `${card.title} ${card.desc} ${card.tag}`.toLowerCase();
        const matchesSearch = combinedText.includes(searchTerm.toLowerCase());
        const cardBranch = card.branch || 'computer';
        const matchesBranch = !selectedBranch || cardBranch === selectedBranch;
        return matchesSearch && matchesBranch;
      });
      setFilteredCards(filtered);
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm, cards, selectedBranch]);

  // Pagination Logic
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentCards = filteredCards.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCards.length / ITEMS_PER_PAGE);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const branchCards = cards.filter(card => !selectedBranch || (card.branch || 'computer') === selectedBranch);

  return (
    <div className="min-h-screen bg-[rgb(var(--bg-body))] pb-12">
      {/* 1. Hero / Welcome Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[rgb(var(--bg-card))] to-[rgb(var(--bg-body))] border-b border-[rgb(var(--border-subtle))] py-10 sm:py-16">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-[rgb(var(--accent))]/5 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 rounded-full bg-purple-500/5 blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-3 z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border-subtle))] text-xs font-medium text-[rgb(var(--text-secondary))] mb-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                System Online
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[rgb(var(--text-primary))] flex flex-wrap items-center gap-3">
                Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}!
                <span className="text-3xl sm:text-4xl inline-block hover:animate-bounce cursor-default">👋</span>
              </h1>
              <p className="text-[rgb(var(--text-secondary))] text-base sm:text-lg max-w-2xl leading-relaxed">
                Ready to ace your next interview? Manage your <span className="font-semibold text-[rgb(var(--text-primary))]">{selectedBranch ? BRANCHES.find(b => b.id === selectedBranch)?.name : 'AI'}</span> preparation sessions below and track your progress.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto z-10">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowBranchModal(true)}
                className="flex-1 md:flex-none px-4 py-3 bg-[rgb(var(--bg-elevated))]/80 backdrop-blur-sm border border-[rgb(var(--border-subtle))] rounded-xl text-[rgb(var(--text-primary))] hover:border-[rgb(var(--accent))]/50 transition-all flex items-center justify-center gap-2 shadow-sm font-medium"
              >
                <Filter className="w-4 h-4 text-[rgb(var(--accent))]" /> 
                <span className="hidden sm:inline">Change</span> Branch
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setModalOpen(true)}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent-hover))] text-white px-5 py-3 rounded-xl shadow-[0_0_20px_rgba(var(--accent),0.2)] hover:shadow-[0_0_30px_rgba(var(--accent),0.4)] transition-all font-medium"
              >
                <PlusCircle className="w-5 h-5" />
                New Session
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* 2. Stats Section with Glassmorphism */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              icon: BookOpen,
              label: 'Total Sessions',
              value: branchCards.length,
              color: 'text-blue-500',
              bgLight: 'bg-blue-500/10'
            },
            {
              icon: Target,
              label: 'Questions',
              value: branchCards.reduce((acc, card) => acc + (card.qna?.length || 0), 0),
              color: 'text-green-500',
              bgLight: 'bg-green-500/10'
            },
            {
              icon: TrendingUp,
              label: 'This Week',
              value: branchCards.filter(card => {
                const cardDate = new Date(card.createdAt);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return cardDate >= weekAgo;
              }).length,
              color: 'text-purple-500',
              bgLight: 'bg-purple-500/10'
            },
            {
              icon: Clock,
              label: 'Prep Time',
              value: (() => {
                const totalQuestions = branchCards.reduce((acc, card) => acc + (card.qna?.length || 0), 0);
                const totalMinutes = totalQuestions * 5;
                if (totalMinutes < 60) return `${totalMinutes}m`;
                return `${(totalMinutes / 60).toFixed(1)}h`;
              })(),
              color: 'text-orange-500',
              bgLight: 'bg-orange-500/10'
            }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-[rgb(var(--bg-card))]/60 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-[rgb(var(--border-subtle))] shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center ${stat.bgLight} group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-[rgb(var(--text-muted))] font-medium mb-1">
                    {stat.label}
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-[rgb(var(--text-primary))]">
                    {stat.value}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* 3. Sticky Toolbar Section */}
        <div className="sticky top-0 z-20 bg-[rgb(var(--bg-body))]/80 backdrop-blur-xl py-4 border-b border-[rgb(var(--border-subtle))] flex flex-col sm:flex-row gap-4 justify-between items-center -mx-4 px-4 sm:mx-0 sm:px-0 sm:rounded-b-none">
          <div className="relative w-full sm:max-w-md group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-[rgb(var(--text-muted))] group-focus-within:text-[rgb(var(--accent))] transition-colors" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search sessions, tags, or branches..."
              className="block w-full pl-10 pr-3 py-2.5 border border-[rgb(var(--border-subtle))] rounded-xl bg-[rgb(var(--bg-card))]/50 text-[rgb(var(--text-primary))] placeholder-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]/50 focus:border-[rgb(var(--accent))] transition-all sm:text-sm"
            />
          </div>
          
          <div className="flex items-center justify-between w-full sm:w-auto gap-3">
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/mcq-test')}
                className="flex items-center justify-center gap-2 bg-[rgb(var(--bg-card))] hover:bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border-subtle))] text-[rgb(var(--text-primary))] px-3 py-2.5 rounded-xl transition-all duration-200 shadow-sm"
                title="MCQ Test"
              >
                <Bot className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-medium hidden md:inline">MCQ Test</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/resources')}
                className="flex items-center justify-center gap-2 bg-[rgb(var(--bg-card))] hover:bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border-subtle))] text-[rgb(var(--text-primary))] px-3 py-2.5 rounded-xl transition-all duration-200 shadow-sm"
                title="Resources"
              >
                <Library className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium hidden md:inline">Resources</span>
              </motion.button>
            </div>

            <div className="flex rounded-lg bg-[rgb(var(--bg-card))] p-1 border border-[rgb(var(--border-subtle))]">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 sm:p-2 rounded-md transition-all ${viewMode === 'grid'
                  ? 'bg-[rgb(var(--bg-elevated))] text-[rgb(var(--text-primary))] shadow-sm border border-[rgb(var(--border-subtle))]'
                  : 'text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-secondary))]'
                  }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 sm:p-2 rounded-md transition-all ${viewMode === 'list'
                  ? 'bg-[rgb(var(--bg-elevated))] text-[rgb(var(--text-primary))] shadow-sm border border-[rgb(var(--border-subtle))]'
                  : 'text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-secondary))]'
                  }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 4. Content Section */}
        {loading ? (
          <div className="min-h-[40vh] flex flex-col items-center justify-center space-y-4">
            <Loader size="xl" />
            <p className="text-[rgb(var(--text-muted))] animate-pulse">Loading your dashboard...</p>
          </div>
        ) : filteredCards.length === 0 ? (
          <EmptyState
            title={searchTerm ? 'No matching sessions found' : 'No interview sessions yet'}
            description={searchTerm 
              ? 'Try adjusting your search terms or clearing the filters.' 
              : 'Your journey starts here. Create your first AI interview session.'}
            icon={Bot}
            isSearch={!!searchTerm}
            actionButton={
              !searchTerm && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setModalOpen(true)}
                  className="flex items-center gap-2 bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent-hover))] text-white px-6 py-3 rounded-xl shadow-[0_0_20px_rgba(var(--accent),0.3)] transition-all font-medium mt-4"
                >
                  <PlusCircle className="w-5 h-5" />
                  Create First Session
                </motion.button>
              )
            }
          />
        ) : (
          <div className="space-y-6">
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {currentCards.map((card, index) => {
                  const showDelete = card.creatorEmail === userEmail || userRole === 'admin' || userRole === 'owner';
                  const isReady = card.qna && card.qna.length > 0;

                  return (
                    <motion.div
                      key={card.sessionId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      whileHover={{ y: -4, transition: { duration: 0.2 } }}
                      className="group flex flex-col bg-[rgb(var(--bg-card))] rounded-2xl border border-[rgb(var(--border-subtle))] shadow-sm hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] overflow-hidden cursor-pointer relative"
                      onClick={() => {
                        if (card.status === 'pending' || card.status === 'rejected') return;
                        if (isReady) navigate(`/interview-prep/${card.sessionId}`);
                      }}
                    >
                      {/* Top Color Accent Line */}
                      <div className="h-1 w-full bg-gradient-to-r from-[rgb(var(--accent))] to-purple-500 opacity-70 group-hover:opacity-100 transition-opacity"></div>
                      
                      <div className="p-5 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-4 gap-2">
                          <div className="w-12 h-12 bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border-subtle))] rounded-xl flex items-center justify-center font-bold text-[rgb(var(--text-primary))] shadow-sm shrink-0">
                            {card.initials || "??"}
                          </div>
                          
                          {showDelete && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(card.sessionId);
                              }}
                              className="p-2 text-[rgb(var(--text-muted))] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                              title="Delete Session"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        <h3 className="text-lg font-bold text-[rgb(var(--text-primary))] mb-2 line-clamp-2 leading-tight">
                          {card.title || "Untitled Session"}
                        </h3>
                        
                        <p className="text-sm text-[rgb(var(--text-secondary))] mb-4 line-clamp-2 flex-1">
                          {card.desc || "No description provided."}
                        </p>

                        <div className="flex flex-wrap gap-1.5 mb-5">
                          {(card.tag || '').split(',').filter(t => t.trim()).slice(0, 3).map((tag, i) => (
                            <span key={i} className="px-2 py-1 text-xs font-medium bg-[rgb(var(--bg-body))] border border-[rgb(var(--border-subtle))] text-[rgb(var(--text-secondary))] rounded-md">
                              {tag.trim()}
                            </span>
                          ))}
                          {(card.tag || '').split(',').filter(t => t.trim()).length > 3 && (
                            <span className="px-2 py-1 text-xs font-medium bg-[rgb(var(--bg-body))] border border-[rgb(var(--border-subtle))] text-[rgb(var(--text-muted))] rounded-md">
                              +{(card.tag || '').split(',').filter(t => t.trim()).length - 3}
                            </span>
                          )}
                        </div>

                        {/* Status/Action Area */}
                        <div className="mt-auto">
                          {card.status === 'pending' ? (
                            <div className="w-full py-2 text-center rounded-lg bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 border border-yellow-500/20 text-sm font-medium">Pending Approval</div>
                          ) : card.status === 'rejected' ? (
                            <div className="w-full py-2 text-center rounded-lg bg-red-500/10 text-red-600 dark:text-red-500 border border-red-500/20 text-sm font-medium">Rejected</div>
                          ) : (!isReady && showDelete) ? (
                            <button
                              onClick={(e) => handleInitialize(e, card.sessionId)}
                              className="w-full py-2.5 bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent-hover))] text-white rounded-lg shadow-sm transition-all text-sm font-bold flex items-center justify-center gap-2 group/btn"
                            >
                              Generate Content 
                              <Bot className="w-4 h-4 group-hover/btn:animate-bounce" />
                            </button>
                          ) : (!isReady) ? (
                            <div className="w-full py-2 text-center rounded-lg bg-[rgb(var(--bg-elevated))] text-[rgb(var(--text-muted))] border border-[rgb(var(--border-subtle))] text-sm font-medium flex items-center justify-center gap-2">
                              <Loader size="sm" /> Initializing...
                            </div>
                          ) : (
                            <div className="flex items-center justify-between text-xs text-[rgb(var(--text-muted))] pt-3 border-t border-[rgb(var(--border-subtle))]">
                              <div 
                                onClick={(e) => handleCreatorClick(e, card)}
                                className="flex items-center gap-1.5 hover:text-[rgb(var(--accent))] transition-colors"
                              >
                                {card.creatorDetails?.photo ? (
                                  <img src={card.creatorDetails.photo} alt="Creator" className="w-5 h-5 rounded-full object-cover border border-[rgb(var(--border-subtle))]" />
                                ) : (
                                  <div className="w-5 h-5 rounded-full bg-[rgb(var(--bg-elevated))] flex items-center justify-center border border-[rgb(var(--border-subtle))]">
                                    <Users className="w-3 h-3" />
                                  </div>
                                )}
                                <span className="truncate max-w-[80px]">{card.creatorDetails?.fullName?.split(' ')[0] || 'Unknown'}</span>
                              </div>
                              
                              <div className="flex items-center gap-3">
                                <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {card.qna?.length || 0}</span>
                                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(card.updatedAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {currentCards.map((card, index) => {
                  const showDelete = card.creatorEmail === userEmail || userRole === 'admin' || userRole === 'owner';
                  const isReady = card.qna && card.qna.length > 0;

                  return (
                    <motion.div
                      key={card.sessionId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      onClick={() => {
                        if (card.status === 'pending' || card.status === 'rejected') return;
                        if (isReady) navigate(`/interview-prep/${card.sessionId}`);
                      }}
                      className="flex flex-col sm:flex-row bg-[rgb(var(--bg-card))] rounded-xl border border-[rgb(var(--border-subtle))] p-4 shadow-sm hover:shadow-md transition-all cursor-pointer items-start sm:items-center gap-4 group relative overflow-hidden"
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[rgb(var(--accent))] to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      
                      <div className="w-12 h-12 bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border-subtle))] rounded-xl flex items-center justify-center font-bold text-[rgb(var(--text-primary))] shadow-sm shrink-0 ml-1">
                        {card.initials || "??"}
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-[rgb(var(--text-primary))] truncate">
                            {card.title || "Untitled Session"}
                          </h3>
                          {card.status === 'pending' && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 uppercase tracking-wider">Pending</span>}
                        </div>
                        <p className="text-sm text-[rgb(var(--text-secondary))] truncate">
                          {card.desc || "No description provided."}
                        </p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-[rgb(var(--text-muted))]">
                          <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> {card.qna?.length || 0} Q&A</span>
                          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(card.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto mt-3 sm:mt-0 pt-3 sm:pt-0 border-t border-[rgb(var(--border-subtle))] sm:border-t-0">
                        {(!isReady && showDelete && card.status !== 'pending' && card.status !== 'rejected') ? (
                          <button
                            onClick={(e) => handleInitialize(e, card.sessionId)}
                            className="flex-1 sm:flex-none px-4 py-2 bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent-hover))] text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            Generate Content
                          </button>
                        ) : (isReady) && (
                          <button
                            className="hidden sm:flex p-2 text-[rgb(var(--text-muted))] group-hover:text-[rgb(var(--accent))] group-hover:bg-[rgb(var(--bg-elevated))] rounded-lg transition-colors"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        )}
                        
                        {showDelete && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(card.sessionId);
                            }}
                            className="p-2 text-[rgb(var(--text-muted))] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Delete Session"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
            
            <div className="mt-8 flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {modalOpen && (
        <CreateCardModal
          onClose={() => setModalOpen(false)}
          onCreated={handleCreated}
          defaultBranch={selectedBranch || 'computer'}
        />
      )}

      {creatorModalOpen && (
        <CreatorInfoModal
          isOpen={creatorModalOpen}
          onClose={() => setCreatorModalOpen(false)}
          creator={selectedCreator}
        />
      )}

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmModal && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-[rgb(var(--bg-card))] rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-[rgb(var(--border-subtle))]"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.4 }}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center shrink-0">
                  <Trash2 className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[rgb(var(--text-primary))]">Delete Session</h2>
                  <p className="text-sm text-[rgb(var(--text-muted))]">This action cannot be undone</p>
                </div>
              </div>
              <p className="text-[rgb(var(--text-secondary))] mb-8 leading-relaxed">
                Are you sure you want to delete this interview session? All questions, answers, and progress will be permanently removed.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmModal(false)}
                  className="flex-1 px-4 py-2.5 text-[rgb(var(--text-secondary))] bg-[rgb(var(--bg-elevated))] hover:bg-[rgb(var(--bg-body))] rounded-xl transition-colors font-medium border border-[rgb(var(--border-subtle))]"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors font-medium shadow-md shadow-red-600/20"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Branch Modal */}
      {showBranchModal && (
        <BranchModal
          isOpen={showBranchModal}
          onClose={() => setShowBranchModal(false)}
          currentBranch={selectedBranch}
          onSelectBranch={(branchId) => {
            setSelectedBranch(branchId);
            localStorage.setItem('dashboard_branch', branchId);
            setShowBranchModal(false);
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  MoreVertical,
  Eye,
  Library
} from 'lucide-react';
import CreateCardModal from '../../components/Cards/CreateCardForm';
import axios from '../../utils/axiosInstance';
import { API } from '../../utils/apiPaths';
import { Badge } from '@/components/ui/badge';
import emptyStateImg from '../../assets/empty-state.jpg';
import { Input } from '@/components/ui/input';
import { toast } from 'react-hot-toast';

export const Dashboard = () => {
  const [cards, setCards] = useState([]);
  const [filteredCards, setFilteredCards] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const navigate = useNavigate();

  const userEmail = JSON.parse(localStorage.getItem("user"))?.email;

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
    'bg-highlight/20 text-highlight border-highlight/30',
    'bg-secondary/20 text-secondary border-secondary/30',
    'bg-green-500/20 text-green-400 border-green-500/30',
    'bg-primary/20 text-primary border-primary/30',
    'bg-pink-500/20 text-pink-400 border-pink-500/30',
    'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    'bg-teal-500/20 text-teal-400 border-teal-500/30'
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

  const handleCreated = (sessionId) => {
    navigate(`/interview-prep/${sessionId}`);
  };

  const handleDeleteClick = (sessionId) => {
    setSelectedCardId(sessionId);
    setConfirmModal(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(API.INTERVIEW.DELETE(selectedCardId));
      toast.success("Card deleted successfully");
      setConfirmModal(false);
      setSelectedCardId(null);
      fetchCards();
    } catch {
      toast.error("Failed to delete card");
    }
  };

  // Debounced Search
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      const filtered = cards.filter((card) => {
        const combinedText = `${card.title} ${card.desc} ${card.tag}`.toLowerCase();
        return combinedText.includes(searchTerm.toLowerCase());
      });
      setFilteredCards(filtered);
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm, cards]);

  return (
    <div className="min-h-screen bg-[rgb(var(--bg-body))]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 font-[Urbanist]">
        {/* Enhanced Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:items-center lg:justify-between">
            {/* Title Section */}
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[rgb(var(--accent))] rounded-xl flex items-center justify-center shadow-md">
                    <Bot className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[rgb(var(--text-primary))]">
                    Interview AI
                  </h1>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs sm:text-sm">
                    {cards.length} Sessions
                  </Badge>
                  <Badge className="bg-[rgb(var(--accent))]/20 text-[rgb(var(--accent))] border-[rgb(var(--accent))]/30 text-xs sm:text-sm sm:hidden">
                    {cards.reduce((acc, card) => acc + (card.qna?.length || 0), 0)} Q&A
                  </Badge>
                </div>
              </div>
              <p className="text-[rgb(var(--text-secondary))] text-sm sm:text-base">
                Manage your AI-powered interview preparation sessions
              </p>
            </div>

            {/* Controls Section - Improved Mobile Layout */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
              {/* Search Bar - Full width on mobile */}
              <div className="relative flex-1 lg:min-w-[300px] lg:max-w-[400px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[rgb(var(--text-muted))]" />
                <Input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search sessions..."
                  className="pl-10 pr-4 py-2.5 w-full rounded-xl border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))]/50 backdrop-blur-sm focus:ring-2 focus:ring-[rgb(var(--accent))] focus:border-transparent transition-all text-sm sm:text-base text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))]"
                />
              </div>

              {/* Action Controls - Better mobile layout */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between sm:justify-end gap-2">
                {/* View Mode Toggle - Hidden on small screens */}
                <div className="hidden sm:flex rounded-lg bg-[rgb(var(--bg-card))] p-1 shadow-sm border border-[rgb(var(--border-subtle))]">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-all ${viewMode === 'grid'
                      ? 'bg-[rgb(var(--accent))] text-white shadow-sm'
                      : 'text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-secondary))]'
                      }`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-all ${viewMode === 'list'
                      ? 'bg-[rgb(var(--accent))] text-white shadow-sm'
                      : 'text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-secondary))]'
                      }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>

                {/* Mobile: Two-row layout for buttons */}
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  {/* First row on mobile */}
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate('/mcq-test')}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-3 py-2.5 sm:px-4 sm:py-2.5 rounded-xl shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-200"
                    >
                      <Bot className="w-4 h-4" />
                      <span className="text-sm sm:text-base font-medium">MCQ Test</span>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate('/resources')}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-3 py-2.5 sm:px-4 sm:py-2.5 rounded-xl shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 transition-all duration-200"
                    >
                      <Library className="w-4 h-4" />
                      <span className="text-sm sm:text-base font-medium">Resources</span>
                    </motion.button>
                  </div>

                  {/* Second row on mobile */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setModalOpen(true)}
                    className="flex items-center justify-center gap-2 bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent-hover))] text-white px-3 py-2.5 sm:px-4 sm:py-2.5 rounded-xl shadow-lg shadow-[rgb(var(--accent))]/30 hover:shadow-xl hover:shadow-[rgb(var(--accent))]/40 transition-all duration-200"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span className="text-sm sm:text-base font-medium">New Session</span>
                  </motion.button>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Stats Cards - Better Mobile Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6">
            {[
              {
                icon: BookOpen,
                label: 'Total Sessions',
                value: cards.length,
                color: 'from-blue-500 to-cyan-500',
                shortLabel: 'Sessions'
              },
              {
                icon: Target,
                label: 'Questions',
                value: cards.reduce((acc, card) => acc + (card.qna?.length || 0), 0),
                color: 'from-green-500 to-emerald-500',
                shortLabel: 'Questions'
              },
              {
                icon: TrendingUp,
                label: 'This Week',
                value: cards.filter(card => {
                  const cardDate = new Date(card.createdAt);
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return cardDate >= weekAgo;
                }).length,
                color: 'from-purple-500 to-pink-500',
                shortLabel: 'Weekly'
              },
              {
                icon: Clock,
                label: 'Avg. Prep Time',
                value: '2.5h',
                color: 'from-orange-500 to-red-500',
                shortLabel: 'Avg Time'
              }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-[rgb(var(--bg-card))]/80 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-[rgb(var(--border-subtle))] shadow-sm hover:shadow-lg hover:shadow-[rgb(var(--accent))]/10 transition-all"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center shadow-md flex-shrink-0`}>
                    <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-[rgb(var(--text-muted))] truncate">
                      <span className="sm:hidden">{stat.shortLabel}</span>
                      <span className="hidden sm:inline">{stat.label}</span>
                    </p>
                    <p className="text-lg sm:text-xl font-bold text-[rgb(var(--text-primary))]">{stat.value}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Content Section - Enhanced Loading */}
        {loading ? (
          <div className="min-h-[50vh] sm:min-h-[60vh] flex items-center justify-center px-4">
            <div className="flex flex-col items-center gap-4 sm:gap-6">
              <div className="flex space-x-2 sm:space-x-3">
                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-[rgb(var(--accent))] animate-ping [animation-delay:-0.30s]"></div>
                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-[rgb(var(--accent))] animate-ping [animation-delay:-0.35s]"></div>
                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-[rgb(var(--accent))] animate-ping"></div>
              </div>
              <div className="flex items-center justify-center gap-2 sm:gap-3 animate-pulse">
                <Bot className="w-6 h-6 sm:w-8 sm:h-8 text-[rgb(var(--accent))] drop-shadow-md" />
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-[rgb(var(--accent))] tracking-wide">Loading Dashboard</h1>
              </div>
              <p className="text-xs sm:text-sm text-[rgb(var(--text-secondary))] text-center px-4">Setting up your smart dashboard...</p>
            </div>
          </div>
        ) : filteredCards.length === 0 ? (
          <motion.div
            className="flex flex-col items-center justify-center h-[50vh] sm:h-[60vh] text-center px-4 sm:px-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative mb-6 sm:mb-8">
              <img
                src={emptyStateImg}
                alt="No Sessions"
                className="w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 opacity-80 animate-pulse"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent rounded-full"></div>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-[rgb(var(--text-primary))] mb-2">
              {searchTerm ? 'No matching sessions found' : 'No interview sessions yet'}
            </h3>
            <p className="text-[rgb(var(--text-secondary))] mb-4 sm:mb-6 max-w-md text-sm sm:text-base">
              {searchTerm
                ? 'Try adjusting your search terms or create a new session'
                : 'Start your interview preparation journey by creating your first session'
              }
            </p>
            {!searchTerm && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setModalOpen(true)}
                className="flex items-center gap-2 bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent-hover))] text-white px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl shadow-lg shadow-[rgb(var(--accent))]/30 hover:shadow-xl hover:shadow-[rgb(var(--accent))]/40 transition-all duration-200 text-sm sm:text-base"
              >
                <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                Create Your First Session
              </motion.button>
            )}
          </motion.div>
        ) : (
          <>
            {/* Grid View - Enhanced Mobile Responsive */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
                {filteredCards.map((card, index) => {
                  const gradient = gradients[index % gradients.length];
                  const showDelete = card.creatorEmail === userEmail;

                  return (
                    <motion.div
                      key={card.sessionId}
                      className={`group relative bg-gradient-to-br ${gradient} rounded-2xl p-4 sm:p-6 shadow-md hover:shadow-xl hover:shadow-[rgb(var(--accent))]/20 border border-[rgb(var(--border-subtle))] backdrop-blur-sm transition-all duration-300 cursor-pointer overflow-hidden`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      whileHover={{ y: -5, transition: { duration: 0.2 } }}
                      onClick={() => navigate(`/interview-prep/${card.sessionId}`)}
                    >
                      {/* Background Pattern */}
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-white rounded-full transform translate-x-6 -translate-y-6"></div>
                        <div className="absolute bottom-0 left-0 w-16 h-16 bg-white rounded-full transform -translate-x-4 translate-y-4"></div>
                      </div>

                      {/* Header - Mobile Optimized */}
                      <div className="relative z-10 flex justify-between items-start mb-3 sm:mb-4">
                        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[rgb(var(--bg-card))]/90 backdrop-blur-sm text-[rgb(var(--text-primary))] font-bold rounded-xl flex items-center justify-center shadow-sm border border-[rgb(var(--border-subtle))] text-sm sm:text-base flex-shrink-0">
                            {card.initials || "??"}
                          </div>
                          <div className="text-xs sm:text-sm text-[rgb(var(--text-muted))] min-w-0">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span className="truncate">{new Date(card.updatedAt).toLocaleDateString('en-GB')}</span>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons - Always visible on mobile */}
                        <div className="flex items-center gap-1 sm:gap-1">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/interview-prep/${card.sessionId}`);
                            }}
                            className="p-1.5 sm:p-2 bg-[rgb(var(--bg-card))] rounded-lg shadow-sm border border-[rgb(var(--border-subtle))] text-[rgb(var(--text-primary))] hover:text-[rgb(var(--accent))] transition-all"
                          >
                            <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </motion.button>

                          {showDelete && (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(card.sessionId);
                              }}
                              className="p-1.5 sm:p-2 bg-[rgb(var(--bg-card))] rounded-lg shadow-sm border border-[rgb(var(--border-subtle))] text-[rgb(var(--text-primary))] hover:text-red-500 transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </motion.button>
                          )}
                        </div>
                      </div>

                      {/* Content - Mobile Optimized Typography */}
                      <div className="relative z-10">
                        <h3 className="text-base sm:text-lg font-bold text-[rgb(var(--text-primary))] mb-2 line-clamp-2 leading-tight">
                          {card.title || "Untitled Session"}
                        </h3>
                        <p className="text-xs sm:text-sm text-[rgb(var(--text-secondary))] mb-3 sm:mb-4 line-clamp-3 leading-relaxed">
                          {card.desc || "No description provided."}
                        </p>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {(card.tag || '')
                            .split(',')
                            .filter(tag => tag.trim())
                            .slice(0, 3)
                            .map((tag, i) => (
                              <Badge
                                key={i}
                                className={`${badgeColors[i % badgeColors.length]} text-xs px-2 py-1 rounded-md border`}
                              >
                                {tag.trim()}
                              </Badge>
                            ))}
                          {(card.tag || '').split(',').filter(tag => tag.trim()).length > 3 && (
                            <Badge className="bg-gray-100 text-gray-600 border-gray-200 text-xs px-2 py-1 rounded-md border">
                              +{(card.tag || '').split(',').filter(tag => tag.trim()).length - 3}
                            </Badge>
                          )}
                        </div>

                        {/* Footer Stats */}
                        <div className="flex items-center justify-between text-xs text-[rgb(var(--text-secondary))]">
                          <div className="flex items-center gap-1">
                            <Target className="w-3 h-3" />
                            <span>Exp: {card.experience || "N/A"}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            <span>{card.qna?.length || 0} Q&A</span>
                          </div>
                        </div>
                      </div>

                      {/* Hover Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-[rgb(var(--accent))]/10 to-[rgb(var(--accent))]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              /* List View - Mobile Enhanced */
              <div className="space-y-3 sm:space-y-4">
                {filteredCards.map((card, index) => {
                  const showDelete = card.creatorEmail === userEmail;

                  return (
                    <motion.div
                      key={card.sessionId}
                      className="group bg-[rgb(var(--bg-card))]/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-md hover:shadow-lg hover:shadow-[rgb(var(--accent))]/10 border border-[rgb(var(--border-subtle))] transition-all duration-300 cursor-pointer"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      onClick={() => navigate(`/interview-prep/${card.sessionId}`)}
                    >
                      <div className="flex items-start sm:items-center justify-between">
                        <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[rgb(var(--accent))] text-white font-bold rounded-xl flex items-center justify-center shadow-md shadow-[rgb(var(--accent))]/30 flex-shrink-0 text-sm sm:text-base">
                            {card.initials || "??"}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-1 sm:mb-1">
                              <h3 className="text-base sm:text-lg font-semibold text-[rgb(var(--text-primary))] truncate">
                                {card.title || "Untitled Session"}
                              </h3>
                              <div className="flex flex-wrap gap-1">
                                {(card.tag || '')
                                  .split(',')
                                  .filter(tag => tag.trim())
                                  .slice(0, 2)
                                  .map((tag, i) => (
                                    <Badge
                                      key={i}
                                      className={`${badgeColors[i % badgeColors.length]} text-xs px-2 py-0.5 rounded border`}
                                    >
                                      {tag.trim()}
                                    </Badge>
                                  ))}
                              </div>
                            </div>
                            <p className="text-xs sm:text-sm text-[rgb(var(--text-secondary))] line-clamp-2 mb-2 sm:mb-2">
                              {card.desc || "No description provided."}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-[rgb(var(--text-muted))]">
                              <span className="flex items-center gap-1">
                                <Target className="w-3 h-3" />
                                <span className="hidden sm:inline">{card.experience || "N/A"}</span>
                                <span className="sm:hidden">{(card.experience || "N/A").split(' ')[0]}</span>
                              </span>
                              <span className="flex items-center gap-1">
                                <BookOpen className="w-3 h-3" />
                                {card.qna?.length || 0} Q&A
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span className="hidden sm:inline">{new Date(card.updatedAt).toLocaleDateString('en-GB')}</span>
                                <span className="sm:hidden">{new Date(card.updatedAt).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 sm:gap-2 ml-2 sm:ml-4 flex-shrink-0">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/interview-prep/${card.sessionId}`);
                            }}
                            className="p-1.5 sm:p-2 text-[rgb(var(--text-primary))] hover:text-[rgb(var(--accent))] hover:bg-[rgb(var(--accent))]/10 rounded-lg transition-all"
                          >
                            <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </motion.button>

                          {showDelete && (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(card.sessionId);
                              }}
                              className="p-1.5 sm:p-2 text-[rgb(var(--text-primary))] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </motion.button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Modals */}
        {modalOpen && (
          <CreateCardModal
            onClose={() => setModalOpen(false)}
            onCreated={handleCreated}
          />
        )}

        {/* Enhanced Delete Confirmation Modal */}
        <AnimatePresence>
          {confirmModal && (
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-[rgb(var(--bg-card))] rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-[rgb(var(--border-subtle))]"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                    <Trash2 className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[rgb(var(--text-primary))]">Delete Session</h2>
                    <p className="text-sm text-[rgb(var(--text-muted))]">This action cannot be undone</p>
                  </div>
                </div>

                <p className="text-[rgb(var(--text-secondary))] mb-6 leading-relaxed">
                  Are you sure you want to delete this interview session? All questions, answers, and progress will be permanently removed.
                </p>

                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setConfirmModal(false)}
                    className="flex-1 px-4 py-2.5 text-[rgb(var(--text-secondary))] bg-[rgb(var(--bg-body))] hover:bg-[rgb(var(--bg-body-alt))] rounded-xl transition-colors font-medium border border-[rgb(var(--border-subtle))]"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={confirmDelete}
                    className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors font-medium shadow-lg"
                  >
                    Delete
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Floating Action Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setModalOpen(true)}
          className="fixed bottom-6 right-6 sm:hidden bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent-hover))] text-white p-4 rounded-full shadow-lg shadow-[rgb(var(--accent))]/30 hover:shadow-xl hover:shadow-[rgb(var(--accent))]/40 transition-all duration-200 z-40"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <PlusCircle className="w-6 h-6" />
        </motion.button>
      </div>
    </div>
  );
};

export default Dashboard;

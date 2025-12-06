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
  Eye
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
    'from-orange-100 via-orange-50 to-red-50',
    'from-blue-100 via-cyan-50 to-teal-50',
    'from-purple-100 via-pink-50 to-rose-50',
    'from-green-100 via-emerald-50 to-lime-50',
    'from-yellow-100 via-amber-50 to-orange-50',
    'from-indigo-100 via-blue-50 to-cyan-50',
    'from-pink-100 via-rose-50 to-red-50',
    'from-teal-100 via-green-50 to-lime-50'
  ];

  const badgeColors = [
    'bg-orange-100 text-orange-700 border-orange-200',
    'bg-blue-100 text-blue-700 border-blue-200',
    'bg-green-100 text-green-700 border-green-200',
    'bg-purple-100 text-purple-700 border-purple-200',
    'bg-pink-100 text-pink-700 border-pink-200',
    'bg-yellow-100 text-yellow-700 border-yellow-200',
    'bg-indigo-100 text-indigo-700 border-indigo-200',
    'bg-teal-100 text-teal-700 border-teal-200'
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 font-[Urbanist]">
        {/* Enhanced Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:items-center lg:justify-between">
            {/* Title Section */}
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Bot className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                    Interview AI
                  </h1>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-green-100 text-green-700 border-green-200 text-xs sm:text-sm">
                    {cards.length} Sessions
                  </Badge>
                  <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs sm:text-sm sm:hidden">
                    {cards.reduce((acc, card) => acc + (card.qna?.length || 0), 0)} Q&A
                  </Badge>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                Manage your AI-powered interview preparation sessions
              </p>
            </div>

            {/* Controls Section - Improved Mobile Layout */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
              {/* Search Bar - Full width on mobile */}
              <div className="relative flex-1 lg:min-w-[300px] lg:max-w-[400px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search sessions..."
                  className="pl-10 pr-4 py-2.5 w-full rounded-xl border-gray-200 dark:border-gray-600 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-sm sm:text-base"
                />
              </div>

              {/* Action Controls - Better mobile layout */}
              <div className="flex items-center justify-between sm:justify-end gap-2">
                {/* View Mode Toggle - Hidden on small screens */}
                <div className="hidden sm:flex rounded-lg bg-white dark:bg-gray-800 p-1 shadow-sm border border-gray-200 dark:border-gray-600">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-all ${viewMode === 'grid'
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                      }`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-all ${viewMode === 'list'
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                      }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>

                {/* Quick Filter - Mobile only */}
                <button className="sm:hidden p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-sm">
                  <Filter className="w-4 h-4 text-gray-500" />
                </button>

                {/* Add New Button - Responsive */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/mcq-test')}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-2.5 sm:px-4 sm:py-2.5 rounded-xl shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 min-w-[80px] sm:min-w-auto"
                >
                  <Bot className="w-4 h-4" />
                  <span className="text-sm sm:text-base font-medium">
                    <span className="hidden sm:inline">MCQ Test</span>
                    <span className="sm:hidden">MCQ</span>
                  </span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setModalOpen(true)}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-2.5 sm:px-4 sm:py-2.5 rounded-xl shadow-lg hover:shadow-xl hover:from-orange-600 hover:to-red-600 transition-all duration-200 min-w-[80px] sm:min-w-auto"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span className="text-sm sm:text-base font-medium">
                    <span className="hidden sm:inline">New Session</span>
                    <span className="sm:hidden">New</span>
                  </span>
                </motion.button>
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
                className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center shadow-sm flex-shrink-0`}>
                    <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                      <span className="sm:hidden">{stat.shortLabel}</span>
                      <span className="hidden sm:inline">{stat.label}</span>
                    </p>
                    <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
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
                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-orange-500 animate-ping [animation-delay:-0.30s]"></div>
                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-orange-500 animate-ping [animation-delay:-0.35s]"></div>
                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-orange-500 animate-ping"></div>
              </div>
              <div className="flex items-center justify-center gap-2 sm:gap-3 animate-pulse">
                <Bot className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600 drop-shadow-md" />
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-orange-600 tracking-wide">Loading Dashboard</h1>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 text-center px-4">Setting up your smart dashboard...</p>
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
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {searchTerm ? 'No matching sessions found' : 'No interview sessions yet'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 max-w-md text-sm sm:text-base">
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
                className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base"
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
                      className={`group relative bg-gradient-to-br ${gradient} rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-xl border border-gray-200/50 dark:border-gray-600/50 backdrop-blur-sm transition-all duration-300 cursor-pointer overflow-hidden`}
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
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/80 backdrop-blur-sm text-gray-700 font-bold rounded-xl flex items-center justify-center shadow-sm border border-white/50 text-sm sm:text-base flex-shrink-0">
                            {card.initials || "??"}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-600 min-w-0">
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
                            className="p-1.5 sm:p-2 bg-white/60 hover:bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border border-white/50 text-gray-600 hover:text-blue-600 transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
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
                              className="p-1.5 sm:p-2 bg-white/60 hover:bg-red-50 backdrop-blur-sm rounded-lg shadow-sm border border-white/50 text-gray-600 hover:text-red-600 transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                            >
                              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </motion.button>
                          )}
                        </div>
                      </div>

                      {/* Content - Mobile Optimized Typography */}
                      <div className="relative z-10">
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 leading-tight">
                          {card.title || "Untitled Session"}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 mb-3 sm:mb-4 line-clamp-3 leading-relaxed">
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
                        <div className="flex items-center justify-between text-xs text-gray-600">
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
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
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
                      className="group bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-lg border border-gray-200 dark:border-gray-600 transition-all duration-300 cursor-pointer"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      onClick={() => navigate(`/interview-prep/${card.sessionId}`)}
                    >
                      <div className="flex items-start sm:items-center justify-between">
                        <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl flex items-center justify-center shadow-sm flex-shrink-0 text-sm sm:text-base">
                            {card.initials || "??"}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-1 sm:mb-1">
                              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">
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
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2 sm:mb-2">
                              {card.desc || "No description provided."}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-gray-500">
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
                            className="p-1.5 sm:p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
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
                              className="p-1.5 sm:p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
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
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-gray-200 dark:border-gray-600"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                    <Trash2 className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Delete Session</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">This action cannot be undone</p>
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  Are you sure you want to delete this interview session? All questions, answers, and progress will be permanently removed.
                </p>

                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setConfirmModal(false)}
                    className="flex-1 px-4 py-2.5 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors font-medium"
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
          className="fixed bottom-6 right-6 sm:hidden bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-40"
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

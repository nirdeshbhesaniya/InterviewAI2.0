import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Play, Code2, Sparkles, Users, Star, Trophy, Terminal, Cpu, Clock, CheckCircle, AlertCircle, MessageSquare, ChevronRight, BookOpen, Target, TrendingUp, Filter, Grid, List, PlusCircle, Search, Calendar, Trash2, Eye, Bot, Loader2, FileCode } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API, API_BASE_URL } from '../../../utils/apiPaths';
import { UserContext } from '../../../context/UserContext';
import AIBackground from './AIBackground';
import SearchResultModal from '../../../components/ui/SearchResultModal';

const HeroSection = ({ onStart, onLogin }) => {
    const { user } = useContext(UserContext);
    const navigate = useNavigate();

    // Stats State
    const [stats, setStats] = useState({
        totalUsers: '10K+',
        questionsSolved: '50K+',
        successRate: '94%',
        companies: '50+'
    });

    // Mockup State
    const [activeMockup, setActiveMockup] = useState('interview'); // 'interview' | 'mcq'
    const [userSessions, setUserSessions] = useState([]);
    const [timer, setTimer] = useState(900); // 15 minutes in seconds

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedResult, setSelectedResult] = useState(null); // Modal State

    // Debounced Search Effect
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchQuery.trim().length >= 2) {
                setIsSearching(true);
                try {
                    const response = await axios.get(`${API_BASE_URL}/public/search?q=${encodeURIComponent(searchQuery)}`);
                    if (response.data.success) {
                        setSearchResults(response.data.results);
                    }
                } catch (error) {
                    console.error("Search failed:", error);
                    setSearchResults([]);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults([]);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    // Handle Search Input
    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    const getIconComponent = (iconName) => {
        const icons = {
            BookOpen: BookOpen,
            FileText: FileCode, // Mapping Resource to FileCode
            CheckCircle: CheckCircle,
            Bot: Bot,
            Code2: Code2,
            Grid: Grid
        };
        return icons[iconName] || Search;
    };

    // Handle Search Result Click (Opens Modal)
    const handleResultClick = (result) => {
        setSelectedResult(result);
        setIsSearchFocused(false);
    };

    // Handle Modal Action (Actual Navigation/View)
    const handleModalAction = (result, action) => {
        console.log(`Action: ${action} on`, result);

        if (action === 'view') {
            if (!user) {
                onLogin?.();
                return;
            }

            // For Practice Tests and Interviews, navigate to the page
            if (result.type === 'Test' || result.type === 'Interview') {
                const path = result.link || result.path;
                navigate(path);
                setSelectedResult(null);
            }
            // For Notes and Resources, open content directly in new tab
            else if (result.link) {
                window.open(result.link, '_blank');
                setSelectedResult(null);
            }
            // Fallback: Navigate to page if no direct link
            else {
                const path = result.path;
                const id = result.id;
                navigate(path, { state: { highlightId: id, fromSearch: true } });
                setSelectedResult(null);
            }
        }
    };

    // Auto-switch mockup every 5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveMockup(prev => prev === 'interview' ? 'mcq' : 'interview');
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    // Live Timer for MCQ Tab
    useEffect(() => {
        let interval;
        if (activeMockup === 'mcq') {
            interval = setInterval(() => {
                setTimer(prev => (prev > 0 ? prev - 1 : 900));
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [activeMockup]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Fetch Public Stats (Global) & User Sessions
    useEffect(() => {
        const fetchStatsAndSessions = async () => {
            // 1. Fetch Public Stats
            try {
                const response = await axios.get(API.PUBLIC.GET_STATS);
                if (response.data.success) {
                    const val = response.data.stats.totalUsers;
                    const formatted = val > 10000 ? (val / 1000).toFixed(1) + 'K+' : val.toLocaleString();

                    const publicQuestions = response.data.stats.totalQuestionsSolved;
                    const formattedQuestions = publicQuestions ? (publicQuestions > 10000 ? (publicQuestions / 1000).toFixed(1) + 'K+' : publicQuestions.toLocaleString()) : '50K+';

                    setStats(prev => ({
                        ...prev,
                        totalUsers: formatted,
                        questionsSolved: user ? prev.questionsSolved : formattedQuestions
                    }));
                }
            } catch (error) {
                console.error('Failed to fetch public stats', error);
            }

            // 2. Fetch User Sessions (if logged in)
            if (user) {
                try {
                    const res = await axios.get(API.INTERVIEW.GET_ALL);
                    const sessions = res.data;
                    const totalQuestions = sessions.reduce((acc, card) => acc + (card.qna?.length || 0), 0);

                    setStats(prev => ({ ...prev, questionsSolved: totalQuestions.toString() }));
                    setUserSessions(sessions);

                } catch (error) {
                    console.error('Failed to fetch user stats/sessions:', error);
                }
            }
        };

        fetchStatsAndSessions();
    }, [user]);

    // Mock Data for Dashboard View (Fallback)
    const mockSessions = [
        {
            sessionId: 'mock-1',
            title: "Frontend Developer",
            desc: "Preparing for product-based company interviews with focus on React and Performance.",
            tag: "React.js, DOM, CSS",
            initials: "FD",
            qnaCount: 15,
            updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            gradient: "from-blue-500/20 via-cyan-500/10 to-[rgb(var(--bg-card))]"
        },
        {
            sessionId: 'mock-2',
            title: "Backend System Design",
            desc: "Distributed systems, scaling strategies and database design patterns.",
            tag: "Node.js, System Design",
            initials: "BD",
            qnaCount: 24,
            updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
            gradient: "from-purple-500/20 via-pink-500/10 to-[rgb(var(--bg-card))]"
        },
        {
            sessionId: 'mock-3',
            title: "Full Stack MERN",
            desc: "Comprehensive review of full stack concepts.",
            tag: "MERN, Auth",
            initials: "FS",
            qnaCount: 12,
            updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            gradient: "from-green-500/20 via-emerald-500/10 to-[rgb(var(--bg-card))]"
        }
    ];

    // Determine which sessions to display
    const displaySessions = user && userSessions.length > 0 ? userSessions.slice(0, 3) : mockSessions;

    // Helper to format date relative (simple version)
    const getRelativeTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor(diff / (1000 * 60 * 60));

        if (days > 7) return date.toLocaleDateString();
        if (days > 0) return `${days} days ago`;
        if (hours > 0) return `${hours} hours ago`;
        return 'Just now';
    }

    return (
        <section className="relative pt-16 pb-12 sm:pt-24 sm:pb-16 md:pt-32 md:pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-[rgb(var(--bg-body))]">
            {/* Modal */}
            <SearchResultModal
                isOpen={!!selectedResult}
                onClose={() => setSelectedResult(null)}
                result={selectedResult}
                onAction={handleModalAction}
            />

            {/* New AI Era Background */}
            <AIBackground />

            {/* Grid Overlay for Texture */}
            <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.03] z-0 pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 relative z-10 text-center">

                {/* Global Search Bar (Centered Top) */}
                <div className="relative max-w-2xl mx-auto mb-6 sm:mb-8 md:mb-12">
                    <div className={`relative flex items-center bg-[rgb(var(--bg-elevated))]/80 backdrop-blur-xl border-2 transition-all duration-300 rounded-full shadow-2xl ${isSearchFocused ? 'border-[rgb(var(--accent))] shadow-[0_0_30px_rgba(var(--accent),0.2)]' : 'border-[rgb(var(--border))]'}`}>
                        <Search className={`ml-3 sm:ml-4 w-4 h-4 sm:w-5 sm:h-5 shrink-0 ${isSearchFocused ? 'text-[rgb(var(--accent))]' : 'text-[rgb(var(--text-muted))]'}`} />
                        <input
                            type="text"
                            placeholder="Search (e.g., 'React Interview')..."
                            className="w-full bg-transparent border-none py-2.5 sm:py-3 md:py-4 px-2 sm:px-3 text-[rgb(var(--text-primary))] placeholder-[rgb(var(--text-muted))] focus:outline-none focus:border-none focus:ring-0 text-sm sm:text-base md:text-lg"
                            value={searchQuery}
                            onChange={handleSearch}
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)} // Delay to allow click
                        />
                        {searchQuery && (
                            <button onClick={() => { setSearchQuery(''); setIsSearchFocused(false); }} className="mr-3 sm:mr-4 text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-primary))] shrink-0">
                                <span className="sr-only">Clear</span>
                                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 rotate-45" /> {/* Just x icon visual */}
                            </button>
                        )}
                    </div>

                    {/* Search Results Dropdown */}
                    <AnimatePresence>
                        {isSearchFocused && searchQuery && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute top-full left-0 right-0 mt-2 bg-[rgb(var(--bg-card))] border border-[rgb(var(--border))] rounded-2xl shadow-2xl overflow-hidden z-50 text-left"
                            >
                                {isSearching ? (
                                    <div className="p-8 text-center text-[rgb(var(--text-muted))]">
                                        <Loader2 className="w-6 h-6 mx-auto animate-spin mb-2" />
                                        <p>Searching database...</p>
                                    </div>
                                ) : searchResults.length > 0 ? (
                                    <ul className="py-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                                        {searchResults.map((result) => {
                                            const IconComp = getIconComponent(result.icon);
                                            // Highlight matching text logic
                                            const highlightMatch = (text, query) => {
                                                if (!query) return text;
                                                const parts = text.split(new RegExp(`(${query})`, 'gi'));
                                                return parts.map((part, index) =>
                                                    part.toLowerCase() === query.toLowerCase()
                                                        ? <span key={index} className="text-[rgb(var(--accent))] font-bold">{part}</span>
                                                        : part
                                                );
                                            };

                                            return (
                                                <li key={result.id} className="border-b border-[rgb(var(--border-subtle))] last:border-none">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleResultClick(result)}
                                                        className="w-full px-4 py-3 flex items-start gap-4 hover:bg-[rgb(var(--bg-elevated))] transition-all duration-200 group text-left"
                                                    >
                                                        <div className={`p-2.5 rounded-xl transition-colors ${result.type === 'Interview' ? 'bg-purple-500/10 text-purple-400' : result.type === 'Test' ? 'bg-green-500/10 text-green-400' : 'bg-[rgb(var(--bg-elevated-alt))] text-[rgb(var(--text-secondary))]'}`}>
                                                            <IconComp className="w-5 h-5" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between mb-0.5">
                                                                <h4 className="font-semibold text-[rgb(var(--text-primary))] truncate text-sm sm:text-base">
                                                                    {highlightMatch(result.title, searchQuery)}
                                                                </h4>
                                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${result.type === 'Interview' ? 'border-purple-500/20 text-purple-400 bg-purple-500/5' : 'border-[rgb(var(--border))] text-[rgb(var(--text-secondary))]'}`}>
                                                                    {result.type}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-[rgb(var(--text-secondary))] line-clamp-1 group-hover:text-[rgb(var(--text-primary))] transition-colors">
                                                                {result.desc}
                                                            </p>
                                                        </div>
                                                        {!user && <div className="self-center"><span className="text-[10px] bg-[rgb(var(--bg-elevated-alt))] text-[rgb(var(--text-muted))] px-1.5 py-0.5 rounded">Login</span></div>}
                                                    </button>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                ) : (
                                    <div className="p-8 text-center text-[rgb(var(--text-muted))]">
                                        <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                        <p>No results found for "{searchQuery}"</p>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Pill Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border))] shadow-sm mb-4 sm:mb-6"
                >
                    <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[rgb(var(--accent))] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-[rgb(var(--accent))]"></span>
                    </span>
                    <span className="text-[10px] sm:text-xs md:text-sm font-medium text-[rgb(var(--text-secondary))]">AI-Powered Interview Assistant</span>
                </motion.div>

                {/* Main Headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-[rgb(var(--text-primary))] mb-4 sm:mb-6 leading-tight px-4 sm:px-0"
                >
                    Master Your Interview <br className="hidden sm:block" />
                    <span className="sm:hidden"> </span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[rgb(var(--accent))] to-purple-500">
                        With AI Confidence
                    </span>
                </motion.h1>

                {/* Subheadline */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-sm sm:text-base md:text-lg lg:text-xl text-[rgb(var(--text-secondary))] mb-6 sm:mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed px-4 sm:px-6"
                >
                    Practice with realistic AI interviewers, get instant feedback on your code and communication, and land your dream job faster.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-12 sm:mb-16 md:mb-20 px-4"
                >
                    <button
                        onClick={() => {
                            if (user) {
                                navigate('/dashboard');
                            } else {
                                onStart();
                            }
                        }}
                        className="group relative inline-flex w-full sm:w-auto justify-center items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 md:py-4 bg-[rgb(var(--accent))] text-white rounded-full font-bold text-sm sm:text-base md:text-lg hover:bg-[rgb(var(--accent-hover))] transition-all duration-300 hover:shadow-[0_0_20px_rgba(var(--accent),0.4)]"
                    >
                        {user ? 'Go to Dashboard' : 'Start Preparing Free'}
                        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <button className="inline-flex w-full sm:w-auto justify-center items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 md:py-4 bg-[rgb(var(--bg-elevated))] text-[rgb(var(--text-primary))] border border-[rgb(var(--border))] rounded-full font-bold text-sm sm:text-base md:text-lg hover:bg-[rgb(var(--bg-elevated-alt))] transition-colors">
                        <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                        See How It Works
                    </button>
                </motion.div>

                {/* Stats / Trust Indicators */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8 max-w-4xl mx-auto pt-6 sm:pt-8 md:pt-10 border-t border-[rgb(var(--border-subtle))] px-4"
                >
                    {[
                        { label: "Active Users", value: stats.totalUsers, icon: Users },
                        { label: "Questions Solved", value: stats.questionsSolved, icon: Code2 },
                        { label: "Success Rate", value: stats.successRate, icon: Trophy },
                        { label: "Companies Cracked", value: stats.companies, icon: Star }
                    ].map((stat, idx) => (
                        <div key={idx} className="text-center group">
                            <div className="flex justify-center mb-2 sm:mb-3">
                                <div className="p-2 sm:p-2.5 md:p-3 bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border))] rounded-lg sm:rounded-xl group-hover:border-[rgb(var(--accent))] transition-colors shadow-sm">
                                    <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-[rgb(var(--accent))]" />
                                </div>
                            </div>
                            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-[rgb(var(--text-primary))] mb-0.5 sm:mb-1">{stat.value}</h3>
                            <p className="text-xs sm:text-sm text-[rgb(var(--text-secondary))]">{stat.label}</p>
                        </div>
                    ))}
                </motion.div>

                {/* High-Fidelity UI Mockup */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="mt-12 sm:mt-16 md:mt-20 relative mx-auto max-w-5xl px-2 sm:px-4"
                >
                    <div className="relative rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] shadow-2xl overflow-hidden ring-1 ring-[rgb(var(--border-subtle))]">

                        {/* Glow Effect */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-2 bg-[rgb(var(--accent))]/50 blur-xl"></div>

                        {/* Window Chrome & Tabs */}
                        <div className="bg-[rgb(var(--bg-elevated))] border-b border-[rgb(var(--border))] px-2 sm:px-4 pt-2 sm:pt-3 flex items-center justify-between">
                            <div className="flex gap-1.5 sm:gap-2 mb-2">
                                <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-500/80"></div>
                                <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-yellow-500/80"></div>
                                <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-500/80"></div>
                            </div>

                            {/* Tab Switcher */}
                            <div className="flex space-x-0.5 sm:space-x-1">
                                <button
                                    onClick={() => setActiveMockup('interview')}
                                    className={`px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-t-lg transition-colors border-t border-x border-transparent ${activeMockup === 'interview' ? 'bg-[rgb(var(--bg-card))] text-[rgb(var(--accent))] border-[rgb(var(--border))] border-b-[rgb(var(--bg-card))]' : 'text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-elevated-alt))]'}`}
                                >
                                    <div className="flex items-center gap-1 sm:gap-2">
                                        <Bot className="w-3 h-3 sm:w-4 sm:h-4" />
                                        <span className="hidden sm:inline">Dashboard</span>
                                    </div>
                                </button>
                                <button
                                    onClick={() => setActiveMockup('mcq')}
                                    className={`px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-t-lg transition-colors border-t border-x border-transparent ${activeMockup === 'mcq' ? 'bg-[rgb(var(--bg-card))] text-[rgb(var(--accent))] border-[rgb(var(--border))] border-b-[rgb(var(--bg-card))]' : 'text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-elevated-alt))]'}`}
                                >
                                    <div className="flex items-center gap-1 sm:gap-2">
                                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                                        <span className="hidden sm:inline">MCQ Test</span>
                                    </div>
                                </button>
                            </div>
                            <div className="w-8 sm:w-16"></div>
                        </div>

                        {/* Content Area */}
                        <div className="bg-[rgb(var(--bg-body-alt))] min-h-[350px] sm:min-h-[400px] md:min-h-[450px] relative overflow-hidden text-left">
                            <AnimatePresence mode="wait">
                                {activeMockup === 'interview' ? (
                                    <motion.div
                                        key="interview"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                        className="p-3 sm:p-4 md:p-6 h-full flex flex-col gap-4 sm:gap-5 md:gap-6"
                                    >
                                        {/* Dashboard Header Mockup */}
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
                                            <div>
                                                <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                                                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-[rgb(var(--accent))] flex items-center justify-center">
                                                        <Bot className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-white" />
                                                    </div>
                                                    <h2 className="text-base sm:text-lg md:text-xl font-bold text-[rgb(var(--text-primary))]">Interview AI</h2>
                                                </div>
                                                <p className="text-xs sm:text-sm text-[rgb(var(--text-secondary))] hidden sm:block">Manage your AI-powered interview preparation sessions</p>
                                            </div>
                                            <div className="flex items-center gap-2 sm:gap-3">
                                                <div className="relative hidden sm:block">
                                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-[rgb(var(--text-muted))]" />
                                                    <input type="text" placeholder="Search..." className="pl-8 sm:pl-9 pr-3 sm:pr-4 py-1.5 sm:py-2 bg-[rgb(var(--bg-card))] border border-[rgb(var(--border-subtle))] rounded-lg text-xs sm:text-sm w-32 sm:w-48 focus:outline-none focus:border-[rgb(var(--accent))]" />
                                                </div>
                                                <button className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-[rgb(var(--accent))] text-white text-xs sm:text-sm font-medium rounded-lg shadow-lg shadow-[rgb(var(--accent))]/20">
                                                    <PlusCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> <span>New</span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Mock Stats Row */}
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                                            {[
                                                { label: "Total Sessions", value: userSessions.length || "12", icon: BookOpen, color: "text-blue-400" },
                                                { label: "Questions", value: stats.questionsSolved === "50K+" ? "145" : stats.questionsSolved, icon: Target, color: "text-green-400" },
                                                {
                                                    label: "This Week",
                                                    value: user && userSessions.length > 0 ? userSessions.filter(s => {
                                                        const cardDate = new Date(s.createdAt);
                                                        const weekAgo = new Date();
                                                        weekAgo.setDate(weekAgo.getDate() - 7);
                                                        return cardDate >= weekAgo;
                                                    }).length : "4",
                                                    icon: TrendingUp,
                                                    color: "text-purple-400"
                                                },
                                                {
                                                    label: "Prep Time",
                                                    value: user && userSessions.length > 0 ? (() => {
                                                        const totalQuestions = userSessions.reduce((acc, card) => acc + (card.qna?.length || 0), 0);
                                                        const totalMinutes = totalQuestions * 5;
                                                        if (totalMinutes < 60) return `${totalMinutes}m`;
                                                        return `${(totalMinutes / 60).toFixed(1)}h`;
                                                    })() : "12h",
                                                    icon: Clock,
                                                    color: "text-orange-400"
                                                },
                                            ].map((s, i) => (
                                                <div key={i} className="bg-[rgb(var(--bg-card))] border border-[rgb(var(--border-subtle))] p-2 sm:p-2.5 md:p-3 rounded-lg sm:rounded-xl flex items-center gap-2 sm:gap-3">
                                                    <div className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-md sm:rounded-lg bg-[rgb(var(--bg-elevated))] flex items-center justify-center ${s.color}`}>
                                                        <s.icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                                                    </div>
                                                    <div>
                                                        <div className="text-[10px] sm:text-xs text-[rgb(var(--text-muted))]">{s.label}</div>
                                                        <div className="text-sm sm:text-base md:text-lg font-bold text-[rgb(var(--text-primary))]">{s.value}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Mock Sessions Grid (Real Data if logged in) */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                            {displaySessions.map((session, idx) => {
                                                const grad = session.gradient || mockSessions[idx % mockSessions.length].gradient;
                                                const qCount = session.qna?.length || session.qnaCount;
                                                const dateStr = getRelativeTime(session.updatedAt);

                                                return (
                                                    <div key={session.sessionId || session.id} className={`group relative rounded-lg sm:rounded-xl border border-[rgb(var(--border-subtle))] p-3 sm:p-4 bg-gradient-to-br ${grad} hover:shadow-lg transition-all`}>
                                                        <div className="flex justify-between items-start mb-2 sm:mb-3">
                                                            <div className="flex items-center gap-2 sm:gap-3">
                                                                <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-md sm:rounded-lg bg-[rgb(var(--bg-card))] border border-[rgb(var(--border-subtle))] flex items-center justify-center font-bold text-xs sm:text-sm text-[rgb(var(--text-primary))]">
                                                                    {session.initials}
                                                                </div>
                                                                <div className="text-[10px] sm:text-xs text-[rgb(var(--text-muted))] flex items-center gap-0.5 sm:gap-1">
                                                                    <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> <span className="hidden sm:inline">{dateStr}</span>
                                                                </div>
                                                            </div>
                                                            <button className="p-1 sm:p-1.5 hover:bg-[rgb(var(--bg-elevated))] rounded text-[rgb(var(--text-muted))]">
                                                                <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                                            </button>
                                                        </div>

                                                        <h3 className="font-bold text-sm sm:text-base text-[rgb(var(--text-primary))] mb-0.5 sm:mb-1 truncate">{session.title}</h3>
                                                        <p className="text-[10px] sm:text-xs text-[rgb(var(--text-secondary))] line-clamp-2 mb-2 sm:mb-3 min-h-[2rem] sm:min-h-[2.5rem]">{session.desc}</p>

                                                        <div className="flex flex-wrap gap-1 mb-3 sm:mb-4">
                                                            {(session.tag || "").split(',').slice(0, 3).map((t, i) => (
                                                                <span key={i} className="px-1 sm:px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] border border-blue-500/20 bg-blue-500/10 text-blue-300">{t.trim()}</span>
                                                            ))}
                                                        </div>

                                                        <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-[rgb(var(--border-subtle))]">
                                                            <div className="flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs text-[rgb(var(--text-secondary))]">
                                                                <BookOpen className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> {qCount} Q&A
                                                            </div>
                                                            <button className="p-1 sm:p-1.5 bg-[rgb(var(--accent))]/10 text-[rgb(var(--accent))] rounded hover:bg-[rgb(var(--accent))]/20 transition-colors">
                                                                <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="mcq"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                        className="p-4 sm:p-6 md:p-8 h-full flex flex-col items-center justify-center max-w-4xl mx-auto"
                                    >
                                        {/* Top Bar: Live Timer & Progress */}
                                        <div className="w-full flex items-center justify-between mb-4 sm:mb-6 md:mb-8">
                                            <div className="flex items-center gap-1.5 sm:gap-2 text-[rgb(var(--text-primary))] font-medium bg-[rgb(var(--bg-elevated))] px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-full border border-[rgb(var(--border))]">
                                                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[rgb(var(--accent))]" />
                                                <span className="font-mono text-xs sm:text-sm">{formatTime(timer)}<span className="hidden sm:inline"> remaining</span></span>
                                            </div>
                                            <div className="text-xs sm:text-sm text-[rgb(var(--text-muted))]">Q 5<span className="hidden sm:inline">uestion</span> <span className="hidden sm:inline">of</span>/20</div>
                                        </div>

                                        {/* Question Block */}
                                        <div className="w-full bg-[rgb(var(--bg-card))] border border-[rgb(var(--border))] rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 shadow-sm">
                                            <h3 className="text-sm sm:text-base md:text-lg font-bold text-[rgb(var(--text-primary))] mb-3 sm:mb-4">
                                                What is the output of the following JavaScript code?
                                            </h3>
                                            <div className="bg-[#1e1e1e] p-2.5 sm:p-3 md:p-4 rounded-md sm:rounded-lg font-mono text-xs sm:text-sm text-gray-300 mb-2 border border-white/5 overflow-x-auto">
                                                console.log(1 + "2" + "2");
                                            </div>
                                        </div>

                                        {/* Options Grid */}
                                        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 md:gap-4">
                                            {[
                                                { id: 'A', text: "122", selected: true },
                                                { id: 'B', text: "32", selected: false },
                                                { id: 'C', text: "14", selected: false },
                                                { id: 'D', text: "NaN", selected: false },
                                            ].map((opt) => (
                                                <div
                                                    key={opt.id}
                                                    className={`p-3 sm:p-3.5 md:p-4 rounded-lg sm:rounded-xl border flex items-center gap-2 sm:gap-3 transition-all ${opt.selected ? 'bg-[rgb(var(--accent))]/10 border-[rgb(var(--accent))] shadow-[0_0_15px_rgba(var(--accent),0.2)]' : 'bg-[rgb(var(--bg-elevated))] border-[rgb(var(--border))] opacity-60'}`}
                                                >
                                                    <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold ${opt.selected ? 'bg-[rgb(var(--accent))] text-white' : 'bg-[rgb(var(--bg-body-alt))] text-[rgb(var(--text-secondary))]'}`}>
                                                        {opt.id}
                                                    </div>
                                                    <span className={`font-mono text-xs sm:text-sm ${opt.selected ? 'text-[rgb(var(--text-primary))] font-bold' : 'text-[rgb(var(--text-secondary))]'}`}>
                                                        {opt.text}
                                                    </span>
                                                    {opt.selected && (
                                                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[rgb(var(--accent))] ml-auto" />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default HeroSection;

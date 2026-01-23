import React, { useContext, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../../context/UserContext';
import {
  BrainCircuit,
  Sparkles,
  Star,
  CheckCircle,
  Zap,
  Trophy,
  ArrowRight,
  FileCode,
  Users,
  Bot,
  Play,
  Shield,
  Clock,
  Target
} from 'lucide-react';
import AIAnimatedBackground from './AIAnimatedBackground';
import axios from '../../../utils/axiosInstance';
import { API } from '../../../utils/apiPaths';

const HeroSection = ({ onLoginClick, stats = { totalUsers: '10K+' } }) => {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [questionsSolved, setQuestionsSolved] = useState('50K+');

  useEffect(() => {
    const fetchUserStats = async () => {
      if (user) {
        try {
          const res = await axios.get(API.INTERVIEW.GET_ALL);
          const totalQuestions = res.data.reduce((acc, card) => acc + (card.qna?.length || 0), 0);
          setQuestionsSolved(totalQuestions.toString());
        } catch (error) {
          console.error('Failed to fetch user stats:', error);
        }
      }
    };
    fetchUserStats();
  }, [user]);

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      onLoginClick?.();
    }
  };

  const handleGoCodebase = () => {
    if (user) {
      navigate('/codebase');
    } else {
      onLoginClick?.();
    }
  };
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-gray-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-purple-950">

      {/* AI-Themed Animated Background */}
      <AIAnimatedBackground />


      {/* Main Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">

        {/* AI Badge - Enhanced */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex justify-center mb-6 sm:mb-8 lg:mb-10"
        >
          <div className="group relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-green-500 to-blue-500 rounded-full blur-lg opacity-70 group-hover:opacity-90 transition duration-300 animate-gradient-x"></div>
            <span className="relative inline-flex items-center gap-2 sm:gap-3 px-4 py-2 sm:px-6 sm:py-3 lg:px-8 lg:py-4 text-xs sm:text-sm lg:text-base font-semibold bg-white dark:bg-gradient-to-r dark:from-slate-900 dark:to-slate-800 backdrop-blur-xl rounded-full border border-purple-400/30 hover:border-pink-400/50 transition-all duration-300 shadow-2xl">
              <BrainCircuit className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-purple-500 dark:text-purple-400 animate-pulse" />
              <span className="hidden sm:inline bg-gradient-to-r from-purple-600 via-green-600 to-blue-600 dark:from-purple-300 dark:via-green-300 dark:to-blue-300 bg-clip-text text-transparent font-bold">AI-Powered Interview Assistant</span>
              <span className="sm:hidden bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-300 dark:to-pink-300 bg-clip-text text-transparent font-bold">AI Interview Assistant</span>
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-pink-500 dark:text-pink-400 animate-spin" style={{ animationDuration: '3s' }} />
            </span>
          </div>
        </motion.div>

        {/* Hero Title - Enhanced Typography */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          className="text-center space-y-4 sm:space-y-6 lg:space-y-8 mb-8 sm:mb-10 lg:mb-12"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold leading-[1.1] tracking-tight">
            <span className="block text-gray-900 dark:text-white drop-shadow-2xl mb-2 sm:mb-4">
              Ace Interviews with
            </span>
            <span className="block bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 dark:from-cyan-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent drop-shadow-2xl animate-gradient-x">
              AI-Powered Learning
            </span>
          </h1>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8"
          >
            {/* Star Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, rotate: -180, scale: 0 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.8 + i * 0.1 }}
                  >
                    <Star className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 fill-yellow-400 text-yellow-400" />
                  </motion.div>
                ))}
              </div>
              <span className="text-gray-700 dark:text-white/90 text-sm sm:text-base lg:text-lg font-medium">
                <span className="hidden sm:inline text-green-600 dark:text-green-500">Trusted by {stats.totalUsers} developers</span>
                <span className="sm:hidden text-gray-900 dark:text-white">{stats.totalUsers} developers</span>
              </span>
            </div>

            {/* Verification Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 backdrop-blur-sm rounded-full border border-emerald-500/50 dark:border-emerald-400/40 shadow-lg shadow-emerald-500/20">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-emerald-700 dark:text-emerald-300 text-xs sm:text-sm lg:text-base font-semibold">Verified Platform</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Enhanced Description */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="text-center space-y-6 sm:space-y-8 mb-12 sm:mb-16 lg:mb-20"
        >
          <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl text-gray-700 dark:text-white/90 leading-relaxed max-w-4xl mx-auto font-light">
            Master interviews with <span className="font-semibold text-purple-600 dark:text-purple-400">AI-generated Q&A sessions</span>, practice with <span className="font-semibold text-purple-600 dark:text-purple-400">MCQ tests</span>, and sharpen your coding skills on our integrated platform.
          </p>

          {/* Enhanced Feature Highlights */}
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 lg:gap-6">
            {[
              { icon: CheckCircle, text: "AI Q&A Sessions", shortText: "AI Q&A", color: "text-emerald-400", bgGrad: "from-emerald-500/20 to-green-500/10" },
              { icon: Zap, text: "MCQ Tests", shortText: "MCQ Tests", color: "text-yellow-400", bgGrad: "from-yellow-500/20 to-orange-500/10" },
              { icon: FileCode, text: "Code Practice", shortText: "Code", color: "text-cyan-400", bgGrad: "from-cyan-500/20 to-blue-500/10" },
              { icon: Trophy, text: "Save & Export", shortText: "Export", color: "text-purple-400", bgGrad: "from-purple-500/20 to-pink-500/10" }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 1 + index * 0.1, duration: 0.6 }}
                whileHover={{ scale: 1.05, y: -2 }}
                className="group relative"
              >
                <div className={`absolute -inset-0.5 bg-gradient-to-r ${feature.bgGrad} rounded-2xl blur-md opacity-50 group-hover:opacity-100 transition duration-300`}></div>
                <div className="relative flex items-center gap-2 sm:gap-3 px-4 py-2.5 sm:px-5 sm:py-3 lg:px-6 lg:py-4 bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm rounded-2xl border border-gray-300 dark:border-white/20 group-hover:border-purple-400 dark:group-hover:border-white/50 transition-all duration-300 shadow-lg">
                  <feature.icon className={`w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 ${feature.color} drop-shadow-lg`} />
                  <span className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 dark:text-white">
                    <span className="hidden sm:inline">{feature.text}</span>
                    <span className="sm:hidden">{feature.shortText}</span>
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Enhanced CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 lg:gap-8 mb-16 sm:mb-20 lg:mb-24"
        >
          {/* Primary CTA */}
          <motion.button
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.98 }}
            className="group relative w-full sm:w-auto min-w-[200px] lg:min-w-[240px] overflow-hidden"
            onClick={handleGetStarted}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 rounded-full blur-xl opacity-60 group-hover:opacity-80 transition-opacity duration-300 animate-gradient-x"></div>
            <div className="relative px-6 py-4 sm:px-8 sm:py-5 lg:px-10 lg:py-6 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 hover:from-purple-500 hover:via-pink-400 hover:to-orange-400 text-white rounded-full font-bold text-base sm:text-lg lg:text-xl transition-all duration-300 shadow-2xl">
              <div className="absolute inset-0 bg-white/30 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <div className="relative flex items-center justify-center gap-3">
                <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current drop-shadow-lg" />
                <span className="drop-shadow-lg">Get Started Free</span>
                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform duration-300 drop-shadow-lg" />
              </div>
            </div>
          </motion.button>

          {/* Secondary CTA */}
          <motion.button


            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.98 }}
            className="group relative w-full sm:w-auto min-w-[200px] lg:min-w-[240px] overflow-hidden"
            onClick={handleGoCodebase}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-full blur-xl opacity-50 group-hover:opacity-70 transition-opacity duration-300"></div>
            <div className="relative px-6 py-4 sm:px-8 sm:py-5 lg:px-10 lg:py-6 bg-white dark:bg-slate-900/70 text-gray-900 dark:text-white border-2 border-cyan-500 dark:border-cyan-400/50 rounded-full font-bold text-base sm:text-lg lg:text-xl hover:bg-gray-50 dark:hover:bg-slate-800/70 hover:border-purple-500 dark:hover:border-purple-400/70 backdrop-blur-xl transition-all duration-300 shadow-2xl">
              <div className="flex items-center justify-center gap-3">
                <FileCode className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-600 dark:text-cyan-400 group-hover:rotate-12 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-all duration-300" />
                <span className="bg-gradient-to-r from-cyan-600 to-purple-600 dark:from-cyan-300 dark:to-purple-300 bg-clip-text text-transparent group-hover:from-purple-600 group-hover:to-pink-600 dark:group-hover:from-purple-300 dark:group-hover:to-pink-300 transition-all duration-300">Explore Codebase</span>
              </div>
            </div>
          </motion.button>
        </motion.div>

        {/* Enhanced Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 max-w-5xl mx-auto"
        >
          {[
            { number: stats.totalUsers, label: "Active Users", icon: Users, color: "from-purple-500 via-pink-500 to-rose-500", glow: "from-purple-500/30 to-pink-500/20" },
            { number: questionsSolved, label: "Questions Solved", icon: FileCode, color: "from-cyan-500 via-blue-500 to-indigo-500", glow: "from-cyan-500/30 to-blue-500/20" },
            { number: "95%", label: "Success Rate", icon: Trophy, color: "from-yellow-500 via-orange-500 to-red-500", glow: "from-yellow-500/30 to-orange-500/20" },
            { number: "24/7", label: "AI Support", icon: Bot, color: "from-emerald-500 via-teal-500 to-cyan-500", glow: "from-emerald-500/30 to-teal-500/20" }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 1.6 + index * 0.1, duration: 0.6 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="group relative"
            >
              <div className={`absolute -inset-0.5 bg-gradient-to-r ${stat.glow} rounded-2xl blur-lg opacity-60 group-hover:opacity-100 transition duration-300`}></div>
              <div className="relative text-center p-4 sm:p-6 lg:p-8 bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm rounded-2xl border border-gray-300 dark:border-white/20 group-hover:border-purple-400 dark:group-hover:border-white/50 transition-all duration-300 shadow-xl">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-18 lg:h-18 mx-auto mb-3 sm:mb-4 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="w-6 h-6 sm:w-7 sm:h-7 lg:w-10 lg:h-10 text-white drop-shadow-lg" />
                </div>
                <div className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold text-gray-900 dark:bg-gradient-to-r dark:from-white dark:to-white/80 dark:bg-clip-text dark:text-transparent mb-1 sm:mb-2">{stat.number}</div>
                <div className="text-xs sm:text-sm lg:text-base text-gray-700 dark:text-white/80 font-semibold">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Enhanced Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 0.8 }}
        className="absolute bottom-6 sm:bottom-8 lg:bottom-12 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="group cursor-pointer"
        >
          <div className="w-6 h-10 sm:w-7 sm:h-12 lg:w-8 lg:h-14 border-2 border-purple-500 dark:border-purple-400/50 group-hover:border-pink-500 dark:group-hover:border-pink-400/70 rounded-full flex justify-center transition-colors duration-300 shadow-lg shadow-purple-500/30">
            <motion.div
              animate={{ y: [0, 16, 0], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-1 h-3 sm:w-1.5 sm:h-4 lg:w-2 lg:h-5 bg-gradient-to-b from-purple-500 to-pink-500 dark:from-purple-400 dark:to-pink-400 group-hover:from-pink-500 group-hover:to-orange-500 dark:group-hover:from-pink-400 dark:group-hover:to-orange-400 rounded-full mt-2 transition-colors duration-300 shadow-lg"
            />
          </div>
          <div className="text-purple-600 dark:text-purple-300/60 group-hover:text-pink-600 dark:group-hover:text-pink-300/80 text-xs mt-2 text-center transition-colors duration-300 font-medium">
            Scroll
          </div>
        </motion.div>
      </motion.div>

      {/* CSS for gradient animation */}
      <style>{`
        @keyframes gradient-x {
          0%, 100% {
            background-size: 200% 200%;
            background-position: left center;
          }
          50% {
            background-size: 200% 200%;
            background-position: right center;
          }
        }
        .animate-gradient-x {
          animation: gradient-x 3s ease infinite;
        }
      `}</style>
    </section >
  );
};

export default HeroSection;
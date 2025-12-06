import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
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

const HeroSection = () => {
      const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/dashboard');
  };

  const handleGoCodebase = () => {
    navigate('/codebase');
  };
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      
      {/* Enhanced Background with Multiple Layers */}
      <div className="absolute inset-0 z-0">
        {/* Primary Video Background */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-15 sm:opacity-25"
        >
          <source src="/assets/hero.mp4" type="video/mp4" />
        </video>
        
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-900/60 via-blue-900/50 to-purple-900/60"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20"></div>
        
        {/* Animated Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] animate-pulse"></div>
      </div>

      {/* Enhanced Floating Elements */}
      <div className="absolute inset-0 z-0 hidden md:block">
        {/* Top Left Orb */}
        <motion.div
          className="absolute top-20 left-10 w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-orange-400/30 to-red-500/20 rounded-full blur-xl"
          animate={{
            x: [0, 40, 0],
            y: [0, -30, 0],
            scale: [1, 1.3, 1],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Bottom Right Orb */}
        <motion.div
          className="absolute bottom-40 right-20 w-32 h-32 lg:w-40 lg:h-40 bg-gradient-to-br from-blue-400/30 to-purple-500/20 rounded-full blur-xl"
          animate={{
            x: [0, -50, 0],
            y: [0, 40, 0],
            scale: [1, 0.7, 1],
            rotate: [360, 180, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Center Accent */}
        <motion.div
          className="absolute top-1/2 left-1/4 w-16 h-16 bg-gradient-to-br from-yellow-400/20 to-orange-500/15 rounded-full blur-lg"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

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
            <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-400 to-red-500 rounded-full blur opacity-60 group-hover:opacity-80 transition duration-300"></div>
            <span className="relative inline-flex items-center gap-2 sm:gap-3 px-4 py-2 sm:px-6 sm:py-3 lg:px-8 lg:py-4 text-xs sm:text-sm lg:text-base font-semibold text-white bg-black/80 backdrop-blur-xl rounded-full border border-white/20 hover:border-white/40 transition-all duration-300">
              <BrainCircuit className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-orange-400 animate-pulse" />
              <span className="hidden sm:inline">AI-Powered Interview Assistant</span>
              <span className="sm:hidden">AI Interview Assistant</span>
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-yellow-400 animate-spin" style={{ animationDuration: '3s' }} />
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
            <span className="block text-white drop-shadow-2xl mb-2 sm:mb-4">
              Ace Interviews with
            </span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-yellow-400 to-red-500 animate-gradient-x filter drop-shadow-lg">
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
              <span className="text-white/90 text-sm sm:text-base lg:text-lg font-medium">
                <span className="hidden sm:inline">Trusted by 10,000+ developers</span>
                <span className="sm:hidden">10k+ developers</span>
              </span>
            </div>

            {/* Verification Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-green-500/20 backdrop-blur-sm rounded-full border border-green-400/30">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
              <span className="text-green-300 text-xs sm:text-sm lg:text-base font-medium">Verified Platform</span>
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
          <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl text-white/90 leading-relaxed max-w-4xl mx-auto font-light">
            Get <span className="font-semibold text-orange-300">role-specific questions</span>, expand answers when needed, and dive deeper into concepts with our <span className="font-semibold text-blue-300">intelligent AI assistant</span>.
          </p>

          {/* Enhanced Feature Highlights */}
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 lg:gap-6">
            {[
              { icon: CheckCircle, text: "Personalized Questions", shortText: "Personalized", color: "text-green-400" },
              { icon: Zap, text: "Instant Feedback", shortText: "Instant", color: "text-yellow-400" },
              { icon: Trophy, text: "Track Progress", shortText: "Progress", color: "text-purple-400" },
              { icon: Target, text: "Role-Specific", shortText: "Targeted", color: "text-orange-400" }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 1 + index * 0.1, duration: 0.6 }}
                whileHover={{ scale: 1.05, y: -2 }}
                className="group relative"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-white/20 to-white/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
                <div className="relative flex items-center gap-2 sm:gap-3 px-4 py-2.5 sm:px-5 sm:py-3 lg:px-6 lg:py-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 group-hover:border-white/40 transition-all duration-300">
                  <feature.icon className={`w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 ${feature.color}`} />
                  <span className="text-sm sm:text-base lg:text-lg font-medium text-white">
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
            <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl blur-lg opacity-50 group-hover:opacity-70 transition-opacity duration-300"></div>
            <div className="relative px-6 py-4 sm:px-8 sm:py-5 lg:px-10 lg:py-6 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl font-semibold text-base sm:text-lg lg:text-xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-2xl">
              <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <div className="relative flex items-center justify-center gap-3">
                <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
                <span>Get Started Free</span>
                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform duration-300" />
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
            <div className="absolute inset-0 bg-white/10 rounded-2xl blur-lg opacity-50 group-hover:opacity-70 transition-opacity duration-300"></div>
            <div className="relative px-6 py-4 sm:px-8 sm:py-5 lg:px-10 lg:py-6 bg-white/10 text-white border-2 border-white/30 rounded-2xl font-semibold text-base sm:text-lg lg:text-xl hover:bg-white/20 hover:border-white/50 backdrop-blur-xl transition-all duration-300 shadow-2xl">
              <div className="flex items-center justify-center gap-3">
                <FileCode className="w-5 h-5 sm:w-6 sm:h-6 group-hover:rotate-12 transition-transform duration-300" />
                <span>Explore Codebase</span>
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
            { number: "10K+", label: "Active Users", icon: Users, color: "from-blue-400 to-blue-600" },
            { number: "50K+", label: "Questions Solved", icon: FileCode, color: "from-green-400 to-green-600" },
            { number: "95%", label: "Success Rate", icon: Trophy, color: "from-yellow-400 to-yellow-600" },
            { number: "24/7", label: "AI Support", icon: Bot, color: "from-purple-400 to-purple-600" }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 1.6 + index * 0.1, duration: 0.6 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="group relative"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-white/20 to-white/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative text-center p-4 sm:p-6 lg:p-8 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 group-hover:border-white/40 transition-all duration-300">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 mx-auto mb-3 sm:mb-4 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                  <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-white" />
                </div>
                <div className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-white mb-1 sm:mb-2">{stat.number}</div>
                <div className="text-xs sm:text-sm lg:text-base text-white/70 font-medium">{stat.label}</div>
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
          <div className="w-6 h-10 sm:w-7 sm:h-12 lg:w-8 lg:h-14 border-2 border-white/40 group-hover:border-white/60 rounded-full flex justify-center transition-colors duration-300">
            <motion.div
              animate={{ y: [0, 16, 0], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-1 h-3 sm:w-1.5 sm:h-4 lg:w-2 lg:h-5 bg-white/60 group-hover:bg-white/80 rounded-full mt-2 transition-colors duration-300"
            />
          </div>
          <div className="text-white/40 group-hover:text-white/60 text-xs mt-2 text-center transition-colors duration-300">
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
    </section>
  );
};

export default HeroSection;
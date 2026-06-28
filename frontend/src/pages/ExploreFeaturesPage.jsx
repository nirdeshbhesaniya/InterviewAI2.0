import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import { motion } from 'framer-motion';
import {
  Bot,
  ShieldAlert,
  Shield,
  FileQuestion,
  Code,
  BookOpen,
  Library,
  Mic,
  ArrowRight,
  LayoutGrid,
  Map
} from 'lucide-react';

const ExploreFeaturesPage = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const features = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      description: 'Your central hub for tracking progress, recent activity, and quick stats.',
      icon: <Bot className="w-8 h-8 md:w-10 md:h-10 text-[rgb(var(--accent))]" />,
      route: '/dashboard',
      colorRef: 'hover:border-[rgb(var(--accent))]/40 hover:shadow-[rgb(var(--accent))]/10'
    },
    {
      id: 'mock-interview',
      title: 'Mock Interview',
      description: 'AI-driven, real-time voice and text mock interviews tailored to your resume.',
      icon: <Mic className="w-8 h-8 md:w-10 md:h-10 text-[rgb(var(--secondary-accent))]" />,
      route: '/mock-interview',
      colorRef: 'hover:border-[rgb(var(--secondary-accent))]/40 hover:shadow-[rgb(var(--secondary-accent))]/10'
    },
    {
      id: 'ai-tests',
      title: 'AI MCQ Tests',
      description: 'Test your knowledge with adaptive AI-generated multiple choice questions.',
      icon: <Shield className="w-8 h-8 md:w-10 md:h-10 text-[rgb(var(--accent-warm))]" />,
      route: '/mcq-test',
      colorRef: 'hover:border-[rgb(var(--accent-warm))]/40 hover:shadow-[rgb(var(--accent-warm))]/10'
    },
    {
      id: 'practice-tests',
      title: 'Practice Tests',
      description: 'Take pre-defined practice tests curated for popular tech interview topics.',
      icon: <FileQuestion className="w-8 h-8 md:w-10 md:h-10 text-[rgb(var(--accent))]" />,
      route: '/mcq-test/practice',
      colorRef: 'hover:border-[rgb(var(--accent))]/40 hover:shadow-[rgb(var(--accent))]/10'
    },
    {
      id: 'code-editor',
      title: 'Code Editor',
      description: 'Fully featured multi-language code playground to test out your algorithms.',
      icon: <Code className="w-8 h-8 md:w-10 md:h-10 text-[rgb(var(--secondary-accent))]" />,
      route: '/codebase',
      colorRef: 'hover:border-[rgb(var(--secondary-accent))]/40 hover:shadow-[rgb(var(--secondary-accent))]/10'
    },
    {
      id: 'notes',
      title: 'Notes',
      description: 'Organize your study notes, code snippets, and interview prep highlights.',
      icon: <BookOpen className="w-8 h-8 md:w-10 md:h-10 text-[rgb(var(--accent-warm))]" />,
      route: '/notes',
      colorRef: 'hover:border-[rgb(var(--accent-warm))]/40 hover:shadow-[rgb(var(--accent-warm))]/10'
    },
    {
      id: 'resources',
      title: 'Resources',
      description: 'Explore a rich library of learning materials, cheat sheets, and guides.',
      icon: <Library className="w-8 h-8 md:w-10 md:h-10 text-[rgb(var(--accent))]" />,
      route: '/resources',
      colorRef: 'hover:border-[rgb(var(--accent))]/40 hover:shadow-[rgb(var(--accent))]/10'
    },
    {
      id: 'roadmaps',
      title: 'Career Roadmaps',
      description: 'Follow structured IT career roadmaps from beginner to industry-ready with AI guidance and progress tracking.',
      icon: <Map className="w-8 h-8 md:w-10 md:h-10 text-[rgb(var(--secondary-accent))]" />,
      route: '/roadmaps',
      colorRef: 'hover:border-[rgb(var(--secondary-accent))]/40 hover:shadow-[rgb(var(--secondary-accent))]/10'
    }
  ];

  const adminFeature = {
    id: 'admin',
    title: 'Admin Console',
    description: 'System administration, user management, and advanced platform analytics.',
    icon: <ShieldAlert className="w-8 h-8 md:w-10 md:h-10 text-[rgb(var(--danger))]" />,
    route: '/admin',
    colorRef: 'hover:border-[rgb(var(--danger))]/40 hover:shadow-[rgb(var(--danger))]/10'
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen bg-[rgb(var(--bg-body))] relative overflow-hidden pb-20 pt-12">
      {/* Immersive Glowing Orbs (Glassmorphism aesthetics) */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[rgb(var(--accent))]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[150px] pointer-events-none hidden md:block" />
      <div className="absolute top-[40%] right-[10%] w-[300px] h-[300px] bg-[rgb(var(--secondary-accent))]/10 rounded-full blur-[100px] pointer-events-none hidden lg:block" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[rgb(var(--bg-elevated))]/80 backdrop-blur-md border border-[rgb(var(--border-subtle))] text-sm font-bold text-[rgb(var(--accent))] uppercase tracking-wider mb-6 shadow-sm"
          >
            <LayoutGrid className="w-5 h-5" />
            Platform Capabilities
          </motion.div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-[rgb(var(--text-primary))] tracking-tight mb-6">
            Explore <span className="bg-clip-text text-transparent bg-gradient-to-r from-[rgb(var(--accent))] to-purple-500">Hub</span>
          </h1>
          <p className="text-lg md:text-xl text-[rgb(var(--text-secondary))] leading-relaxed max-w-2xl mx-auto">
            Your centralized portal for accessing every tool, assessment, and resource designed to elevate your interview game.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 xl:gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {features.map((feature) => (
            <motion.div key={feature.id} variants={itemVariants}>
              <div
                className="group cursor-pointer h-full border border-[rgb(var(--border-subtle))] hover:border-[rgb(var(--accent))]/40 bg-[rgb(var(--bg-card))]/60 backdrop-blur-md hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 flex flex-col rounded-3xl relative overflow-hidden"
                onClick={() => navigate(feature.route)}
              >
                {/* Interactive Animated Gradient Hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-[rgb(var(--accent))]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                
                <div className="p-6 sm:p-8 flex-grow flex flex-col h-full relative z-10">
                  {/* Subtle Background Icon */}
                  <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] group-hover:scale-125 transition-all duration-500 pointer-events-none transform origin-top-right text-[rgb(var(--accent))]">
                    {React.cloneElement(feature.icon, { className: 'w-32 h-32' })}
                  </div>

                  <div className="mb-6 inline-flex p-4 rounded-2xl bg-[rgb(var(--bg-elevated))] shadow-inner border border-[rgb(var(--border-subtle))] group-hover:scale-110 group-hover:border-[rgb(var(--accent))]/30 transition-all duration-300 ease-out z-10 w-fit">
                    {feature.icon}
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-[rgb(var(--text-primary))] group-hover:text-[rgb(var(--accent))] transition-colors mb-3 z-10">
                    {feature.title}
                  </h3>

                  <p className="text-[rgb(var(--text-secondary))] text-sm leading-relaxed mb-8 flex-grow z-10">
                    {feature.description}
                  </p>

                  <div className="mt-auto flex items-center justify-between z-10 pt-4 border-t border-[rgb(var(--border-subtle))]">
                    <span className="text-[rgb(var(--accent))] font-bold text-sm tracking-wide">Explore</span>
                    <div className="w-10 h-10 rounded-full bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border-subtle))] text-[rgb(var(--text-primary))] flex items-center justify-center group-hover:bg-[rgb(var(--accent))] group-hover:text-white group-hover:border-[rgb(var(--accent))] transition-all duration-300 shadow-sm">
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Admin Block conditional */}
          {(user?.role === 'admin' || user?.role === 'owner') && (
            <motion.div key={adminFeature.id} variants={itemVariants}>
              <div
                className="group cursor-pointer h-full border border-[rgb(var(--border-subtle))] hover:border-red-500/40 bg-[rgb(var(--bg-card))]/60 backdrop-blur-md hover:shadow-[0_8px_30px_rgb(239,68,68,0.15)] transition-all duration-300 flex flex-col rounded-3xl relative overflow-hidden"
                onClick={() => navigate(adminFeature.route)}
              >
                {/* Admin Animated Gradient Hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                <div className="p-6 sm:p-8 flex-grow flex flex-col h-full relative z-10">
                  <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] group-hover:scale-125 transition-all duration-500 pointer-events-none transform origin-top-right text-red-500">
                    {React.cloneElement(adminFeature.icon, { className: 'w-32 h-32' })}
                  </div>

                  <div className="mb-6 inline-flex p-4 rounded-2xl bg-[rgb(var(--bg-elevated))] shadow-inner border border-[rgb(var(--border-subtle))] group-hover:scale-110 group-hover:border-red-500/30 transition-all duration-300 ease-out z-10 w-fit">
                    {adminFeature.icon}
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-[rgb(var(--text-primary))] group-hover:text-red-500 transition-colors mb-3 z-10 drop-shadow-sm">
                    {adminFeature.title}
                  </h3>

                  <p className="text-[rgb(var(--text-secondary))] text-sm leading-relaxed mb-8 flex-grow z-10">
                    {adminFeature.description}
                  </p>

                  <div className="mt-auto flex items-center justify-between z-10 pt-4 border-t border-[rgb(var(--border-subtle))] group-hover:border-red-500/20">
                    <span className="text-red-500 font-bold text-sm tracking-wide">Access Console</span>
                    <div className="w-10 h-10 rounded-full bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border-subtle))] text-[rgb(var(--text-primary))] flex items-center justify-center group-hover:bg-red-500 group-hover:text-white group-hover:border-red-500 transition-all duration-300 shadow-sm">
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ExploreFeaturesPage;

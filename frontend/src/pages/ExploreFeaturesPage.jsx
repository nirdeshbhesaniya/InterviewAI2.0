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
  LayoutGrid
} from 'lucide-react';
import Card from '../components/ui/SimpleCard';

const ExploreFeaturesPage = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const features = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      description: 'Your central hub for tracking progress, recent activity, and quick stats.',
      icon: <Bot className="w-8 h-8 md:w-10 md:h-10 text-blue-500" />,
      route: '/dashboard',
      colorRef: 'bg-blue-500/10 border-blue-500/20 hover:border-blue-500/40'
    },
    {
      id: 'mock-interview',
      title: 'Mock Interview',
      description: 'AI-driven, real-time voice and text mock interviews tailored to your resume.',
      icon: <Mic className="w-8 h-8 md:w-10 md:h-10 text-purple-500" />,
      route: '/mock-interview',
      colorRef: 'bg-purple-500/10 border-purple-500/20 hover:border-purple-500/40'
    },
    {
      id: 'ai-tests',
      title: 'AI MCQ Tests',
      description: 'Test your knowledge with adaptive AI-generated multiple choice questions.',
      icon: <Shield className="w-8 h-8 md:w-10 md:h-10 text-emerald-500" />,
      route: '/mcq-test',
      colorRef: 'bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-500/40'
    },
    {
      id: 'practice-tests',
      title: 'Practice Tests',
      description: 'Take pre-defined practice tests curated for popular tech interview topics.',
      icon: <FileQuestion className="w-8 h-8 md:w-10 md:h-10 text-amber-500" />,
      route: '/mcq-test/practice',
      colorRef: 'bg-amber-500/10 border-amber-500/20 hover:border-amber-500/40'
    },
    {
      id: 'code-editor',
      title: 'Code Editor',
      description: 'Fully featured multi-language code playground to test out your algorithms.',
      icon: <Code className="w-8 h-8 md:w-10 md:h-10 text-rose-500" />,
      route: '/codebase',
      colorRef: 'bg-rose-500/10 border-rose-500/20 hover:border-rose-500/40'
    },
    {
      id: 'notes',
      title: 'Notes',
      description: 'Organize your study notes, code snippets, and interview prep highlights.',
      icon: <BookOpen className="w-8 h-8 md:w-10 md:h-10 text-indigo-500" />,
      route: '/notes',
      colorRef: 'bg-indigo-500/10 border-indigo-500/20 hover:border-indigo-500/40'
    },
    {
      id: 'resources',
      title: 'Resources',
      description: 'Explore a rich library of learning materials, cheat sheets, and guides.',
      icon: <Library className="w-8 h-8 md:w-10 md:h-10 text-teal-500" />,
      route: '/resources',
      colorRef: 'bg-teal-500/10 border-teal-500/20 hover:border-teal-500/40'
    }
  ];

  const adminFeature = {
    id: 'admin',
    title: 'Admin Console',
    description: 'System administration, user management, and advanced platform analytics.',
    icon: <ShieldAlert className="w-8 h-8 md:w-10 md:h-10 text-red-500" />,
    route: '/admin',
    colorRef: 'bg-red-500/10 border-red-500/30 hover:border-red-500/50 hover:bg-red-500/20'
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
    <div className="min-h-screen bg-[rgb(var(--bg-body))] relative overflow-hidden py-12">
      {/* Background decoration elements */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-[rgb(var(--accent))]/5 to-transparent pointer-events-none" />
      <div className="absolute top-10 right-10 w-64 h-64 bg-[rgb(var(--accent))]/10 rounded-full blur-[100px] pointer-events-none hidden md:block" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none hidden md:block" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center justify-center p-3 sm:p-4 rounded-2xl bg-[rgb(var(--accent))]/10 text-[rgb(var(--accent))] mb-6 shadow-inner border border-[rgb(var(--accent))]/20">
            <LayoutGrid className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[rgb(var(--text-primary))] tracking-tight mb-6">
            Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-[rgb(var(--accent))] to-purple-500 dark:to-purple-400">Hub</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-[rgb(var(--text-secondary))] leading-relaxed">
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
              <Card
                className={`group cursor-pointer h-full border ${feature.colorRef} bg-[rgb(var(--bg-card))]/80 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col`}
                onClick={() => navigate(feature.route)}
              >
                <div className="p-6 md:p-8 flex-grow flex flex-col h-full rounded-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 group-hover:scale-150 transition-all duration-500 pointer-events-none">
                    {feature.icon}
                  </div>

                  <div className="mb-6 inline-block p-4 rounded-2xl bg-[rgb(var(--bg-body-alt))] shadow-sm group-hover:scale-110 transition-transform duration-300 ease-out z-10 w-fit">
                    {feature.icon}
                  </div>

                  <h3 className="text-xl md:text-2xl font-bold text-[rgb(var(--text-primary))] mb-3 z-10">
                    {feature.title}
                  </h3>

                  <p className="text-[rgb(var(--text-secondary))] text-sm leading-relaxed mb-8 flex-grow z-10">
                    {feature.description}
                  </p>

                  <div className="mt-auto flex items-center justify-between z-10 pt-4 border-t border-[rgb(var(--border-subtle))]">
                    <span className="text-[rgb(var(--accent))] font-semibold text-sm group-hover:underline">Explore</span>
                    <div className="w-8 h-8 rounded-full bg-[rgb(var(--accent))]/10 text-[rgb(var(--accent))] flex items-center justify-center group-hover:bg-[rgb(var(--accent))] group-hover:text-white transition-all duration-300">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}

          {/* Admin Block conditional */}
          {(user?.role === 'admin' || user?.role === 'owner') && (
            <motion.div key={adminFeature.id} variants={itemVariants}>
              <Card
                className={`group cursor-pointer h-full border ${adminFeature.colorRef} bg-[rgb(var(--bg-card))]/80 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col relative overflow-hidden`}
                onClick={() => navigate(adminFeature.route)}
              >
                {/* Pattern overlay for admin card */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0i MiIgY3k9IjIiIHI9IjEiIGZpbGw9IiNGRjAwMDAiIGZpbGwtb3BhY2l0eT0iMC4xIi8+PC9zdmc+')] opacity-50 z-0"></div>

                <div className="p-6 md:p-8 flex-grow flex flex-col h-full rounded-2xl relative z-10">
                  <div className="mb-6 inline-block p-4 rounded-2xl bg-red-500/10 shadow-sm group-hover:scale-110 transition-transform duration-300 ease-out w-fit">
                    {adminFeature.icon}
                  </div>

                  <h3 className="text-xl md:text-2xl font-bold text-red-500 mb-3 drop-shadow-sm">
                    {adminFeature.title}
                  </h3>

                  <p className="text-[rgb(var(--text-secondary))] text-sm leading-relaxed mb-8 flex-grow">
                    {adminFeature.description}
                  </p>

                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-red-500/20">
                    <span className="text-red-500 font-semibold text-sm group-hover:underline">Access Console</span>
                    <div className="w-8 h-8 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-colors duration-300">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ExploreFeaturesPage;

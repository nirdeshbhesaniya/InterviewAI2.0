import React from 'react';
import { motion } from 'framer-motion';
import { Clock, TrendingUp, IndianRupee, ArrowRight, CheckCircle2 } from 'lucide-react';
import * as Icons from 'lucide-react';
import { computeProgressPercent } from '../data/roadmapsData';
import { useNavigate } from 'react-router-dom';

const CareerCard = ({ roadmap, userId, index, completedTopicsCount = 0 }) => {
  const navigate = useNavigate();
  const progress = computeProgressPercent(completedTopicsCount, roadmap);

  // Dynamically resolve icon component from lucide-react
  const IconComponent = Icons[roadmap.icon] || Icons.Briefcase;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      onClick={() => navigate(`/roadmaps/${roadmap.id}`)}
      className="group relative cursor-pointer rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated))] overflow-hidden hover:shadow-2xl hover:shadow-black/20 transition-all duration-300"
    >
      {/* Gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${roadmap.cardGradient} opacity-60 group-hover:opacity-90 transition-opacity duration-300`} />

      {/* Animated border on hover */}
      <div className={`absolute inset-0 rounded-2xl border-2 ${roadmap.borderColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

      {/* Content */}
      <div className="relative z-10 p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${roadmap.gradient} flex items-center justify-center shadow-lg`}>
            <IconComponent className="w-6 h-6 text-white" />
          </div>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${roadmap.difficultyColor}`}>
            {roadmap.difficulty}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-[rgb(var(--text-primary))] mb-1 group-hover:text-blue-500 transition-colors duration-300 line-clamp-1">
          {roadmap.title}
        </h3>
        <p className="text-xs text-[rgb(var(--text-muted))] mb-4 line-clamp-2 leading-relaxed">
          {roadmap.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {roadmap.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-[rgb(var(--text-muted))] border border-white/10">
              {tag}
            </span>
          ))}
          {roadmap.tags.length > 3 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-[rgb(var(--text-muted))] border border-white/10">
              +{roadmap.tags.length - 3}
            </span>
          )}
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-3 text-xs text-[rgb(var(--text-muted))] mb-4">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{roadmap.duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <IndianRupee className="w-3 h-3" />
            <span>{roadmap.salary.replace(/₹/g, '').replace(/L/g, '')} LPA</span>
          </div>
          <div className={`flex items-center gap-1 ml-auto ${roadmap.demandColor}`}>
            <TrendingUp className="w-3 h-3" />
            <span>{roadmap.demand}</span>
          </div>
        </div>

        {/* Progress bar (if started) */}
        {progress > 0 && (
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-[rgb(var(--text-muted))]">Progress</span>
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-green-400" />
                <span className="text-[10px] text-green-400 font-semibold">{progress}%</span>
              </div>
            </div>
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className={`h-full bg-gradient-to-r ${roadmap.gradient} rounded-full`}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, delay: index * 0.05 + 0.3 }}
              />
            </div>
          </div>
        )}

        {/* CTA */}
        <motion.div
          className="flex items-center justify-between"
          whileHover={{ x: 4 }}
        >
          <span className="text-xs font-semibold text-[rgb(var(--text-secondary))] group-hover:text-blue-500 transition-colors">
            {progress > 0 ? 'Continue Learning' : 'Start Roadmap'}
          </span>
          <div className={`w-7 h-7 rounded-full bg-gradient-to-r ${roadmap.gradient} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
            <ArrowRight className="w-3.5 h-3.5 text-white" />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CareerCard;

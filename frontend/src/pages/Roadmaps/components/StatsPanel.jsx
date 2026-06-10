import React from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  Zap,
  Star,
  Leaf,
  BookOpen,
  Flame,
  TrendingUp,
  Award,
  CheckCircle2,
} from 'lucide-react';
import { getEarnedBadges, BADGES } from '../data/roadmapsData';

const BADGE_ICONS = {
  starter: Leaf,
  learner: BookOpen,
  halfway: Zap,
  almost: Flame,
  master: Trophy,
};

const StatsPanel = ({ roadmap, progressPercent, completedCount, totalCount, xp }) => {
  const earnedBadges = getEarnedBadges(progressPercent);

  // Compute SVG circle for progress ring
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="space-y-4">
      {/* Progress Ring Card */}
      <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated))] p-5">
        <h3 className="text-sm font-bold text-[rgb(var(--text-primary))] mb-4 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-yellow-400" />
          Your Progress
        </h3>

        {/* Circular progress */}
        <div className="flex justify-center mb-4">
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 -rotate-90" viewBox="0 0 112 112">
              {/* Background circle */}
              <circle
                cx="56"
                cy="56"
                r={radius}
                fill="none"
                stroke="rgb(var(--border))"
                strokeWidth="8"
              />
              {/* Progress circle */}
              <motion.circle
                cx="56"
                cy="56"
                r={radius}
                fill="none"
                stroke={`url(#progressGrad-${roadmap.id})`}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
              />
              <defs>
                <linearGradient id={`progressGrad-${roadmap.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#22d3ee" />
                </linearGradient>
              </defs>
            </svg>
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-[rgb(var(--text-primary))]">{progressPercent}%</span>
              <span className="text-[10px] text-[rgb(var(--text-muted))] font-medium">Complete</span>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 rounded-xl bg-[rgb(var(--bg-body))] border border-[rgb(var(--border))]">
            <p className="text-xl font-black text-[rgb(var(--text-primary))]">{completedCount}</p>
            <p className="text-xs text-[rgb(var(--text-muted))]">Topics Done</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-[rgb(var(--bg-body))] border border-[rgb(var(--border))]">
            <p className="text-xl font-black text-[rgb(var(--accent))]">{xp}</p>
            <p className="text-xs text-[rgb(var(--text-muted))]">XP Earned</p>
          </div>
        </div>

        {/* XP bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-[rgb(var(--text-muted))] mb-1">
            <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> XP Level</span>
            <span>{xp}/{totalCount * 10} XP</span>
          </div>
          <div className="w-full h-2 bg-[rgb(var(--border))] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1 }}
            />
          </div>
        </div>
      </div>

      {/* Badges Card */}
      <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated))] p-5">
        <h3 className="text-sm font-bold text-[rgb(var(--text-primary))] mb-4 flex items-center gap-2">
          <Award className="w-4 h-4 text-yellow-400" />
          Achievements
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {BADGES.map((badge) => {
            const isEarned = earnedBadges.some(b => b.id === badge.id);
            const BadgeIcon = BADGE_ICONS[badge.id] || Star;
            return (
              <motion.div
                key={badge.id}
                whileHover={{ scale: 1.03 }}
                title={badge.description}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border text-center transition-all ${
                  isEarned
                    ? 'bg-yellow-500/10 border-yellow-500/30'
                    : 'bg-[rgb(var(--bg-body))] border-[rgb(var(--border))] opacity-40 grayscale'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isEarned ? 'bg-yellow-500/20' : 'bg-[rgb(var(--border))]'
                }`}>
                  <BadgeIcon className={`w-4 h-4 ${isEarned ? 'text-yellow-400' : 'text-[rgb(var(--text-muted))]'}`} />
                </div>
                <span className={`text-[10px] font-semibold leading-tight ${
                  isEarned ? 'text-yellow-400' : 'text-[rgb(var(--text-muted))]'
                }`}>
                  {badge.name}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StatsPanel;

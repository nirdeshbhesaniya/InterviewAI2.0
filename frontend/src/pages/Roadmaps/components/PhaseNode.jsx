import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Lock } from 'lucide-react';
import StageNode from './StageNode';

const PhaseNode = ({ phase, index, completedTopics, clearedModules, onTopicToggle, onModuleClear, careerTitle, totalPhases }) => {
  const [isOpen, setIsOpen] = useState(index === 0);

  const phaseTopics = phase.stages.flatMap(s => s.topics);
  const completedInPhase = phaseTopics.filter(t => completedTopics.includes(t.id)).length;
  const totalInPhase = phaseTopics.length;
  const phasePct = totalInPhase > 0 ? Math.round((completedInPhase / totalInPhase) * 100) : 0;
  const isComplete = phasePct === 100;

  const phaseColors = [
    { bg: 'bg-blue-500', text: 'text-blue-400', ring: 'ring-blue-500/40', gradient: 'from-blue-500 to-cyan-500', light: 'bg-blue-500/10 border-blue-500/30' },
    { bg: 'bg-yellow-500', text: 'text-yellow-400', ring: 'ring-yellow-500/40', gradient: 'from-yellow-500 to-amber-500', light: 'bg-yellow-500/10 border-yellow-500/30' },
    { bg: 'bg-green-500', text: 'text-green-400', ring: 'ring-green-500/40', gradient: 'from-green-500 to-emerald-500', light: 'bg-green-500/10 border-green-500/30' },
    { bg: 'bg-purple-500', text: 'text-purple-400', ring: 'ring-purple-500/40', gradient: 'from-purple-500 to-violet-500', light: 'bg-purple-500/10 border-purple-500/30' },
    { bg: 'bg-orange-500', text: 'text-orange-400', ring: 'ring-orange-500/40', gradient: 'from-orange-500 to-red-500', light: 'bg-orange-500/10 border-orange-500/30' },
  ];

  const color = phaseColors[index % phaseColors.length];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative"
    >
      {/* Vertical connector line */}
      {index < totalPhases - 1 && (
        <div className="absolute left-5 top-16 bottom-0 w-0.5 bg-gradient-to-b from-[rgb(var(--border))] to-transparent z-0" />
      )}

      {/* Phase header button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative z-10 w-full flex items-center gap-4 mb-3"
      >
        {/* Phase circle */}
        <motion.div
          className={`flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br ${color.gradient} flex items-center justify-center shadow-lg ring-4 ${color.ring} ring-offset-2 ring-offset-[rgb(var(--bg-body))]`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <span className="text-white text-sm font-bold">{index + 1}</span>
        </motion.div>

        {/* Phase info */}
        <div className="flex-1 text-left">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-bold text-[rgb(var(--text-primary))]">
              {phase.title}
            </h3>
            {isComplete && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 font-bold">
                ✓ Done
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <span className={`text-xs ${color.text} font-medium`}>
              {phase.estimatedTime}
            </span>
            <span className="text-xs text-[rgb(var(--text-muted))]">
              {completedInPhase}/{totalInPhase} topics
            </span>
            <div className="flex-1 h-1.5 bg-[rgb(var(--border))] rounded-full overflow-hidden max-w-24">
              <motion.div
                className={`h-full bg-gradient-to-r ${color.gradient}`}
                initial={{ width: 0 }}
                animate={{ width: `${phasePct}%` }}
                transition={{ duration: 0.8, delay: index * 0.1 + 0.3 }}
              />
            </div>
          </div>
        </div>

        <ChevronDown
          className={`w-5 h-5 text-[rgb(var(--text-muted))] transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Phase content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="overflow-hidden pl-14 mb-6"
          >
            <div className="space-y-3">
              {phase.stages.map((stage) => (
                <StageNode
                  key={stage.id}
                  stage={stage}
                  phaseColor={color.bg}
                  completedTopics={completedTopics}
                  clearedModules={clearedModules}
                  onTopicToggle={onTopicToggle}
                  onModuleClear={onModuleClear}
                  careerTitle={careerTitle}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PhaseNode;

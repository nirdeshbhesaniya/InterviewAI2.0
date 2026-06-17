import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import * as Icons from 'lucide-react';
import {
  ArrowLeft,
  GitCompare,
  TrendingUp,
  Clock,
  IndianRupee,
  Star,
  Zap,
  ChevronRight,
  ArrowRight,
  CheckCircle,
  XCircle,
  Briefcase,
} from 'lucide-react';
import { ROADMAPS } from './data/roadmapsData';
import { CAREER_COMPARE_DATA, COMPARISON_PRESETS } from './data/careerCompareData';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';

// Metric row component
const MetricRow = ({ label, leftValue, rightValue, leftColor, rightColor, isBar }) => {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] gap-4 items-center py-3 border-b border-[rgb(var(--border))] last:border-0">
      {/* Left value */}
      <div className="text-right min-w-0">
        {isBar ? (
          <div className="flex items-center justify-end gap-2 min-w-0">
            <div className="flex-1 h-2 bg-[rgb(var(--border))] rounded-full overflow-hidden max-w-20 ml-auto min-w-0">
              <motion.div
                className={`h-full ${leftColor}`}
                initial={{ width: 0 }}
                animate={{ width: `${leftValue}%` }}
                transition={{ duration: 0.8 }}
              />
            </div>
            <span className="text-sm font-bold text-[rgb(var(--text-primary))] w-8 shrink-0">{leftValue}%</span>
          </div>
        ) : (
          <span className="text-sm font-semibold text-[rgb(var(--text-primary))]">{leftValue}</span>
        )}
      </div>

      {/* Label */}
      <div className="text-center shrink-0">
        <span className="text-[10px] sm:text-xs font-bold text-[rgb(var(--text-muted))] uppercase tracking-wider whitespace-normal sm:whitespace-nowrap px-1 sm:px-2">
          {label}
        </span>
      </div>

      {/* Right value */}
      <div className="text-left min-w-0">
        {isBar ? (
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm font-bold text-[rgb(var(--text-primary))] w-8 shrink-0">{rightValue}%</span>
            <div className="flex-1 h-2 bg-[rgb(var(--border))] rounded-full overflow-hidden max-w-20 min-w-0">
              <motion.div
                className={`h-full ${rightColor}`}
                initial={{ width: 0 }}
                animate={{ width: `${rightValue}%` }}
                transition={{ duration: 0.8, delay: 0.1 }}
              />
            </div>
          </div>
        ) : (
          <span className="text-sm font-semibold text-[rgb(var(--text-primary))]">{rightValue}</span>
        )}
      </div>
    </div>
  );
};

const CareerSelect = ({ value, onChange, label, options }) => (
  <div className="flex flex-col gap-2">
    <label className="text-xs font-bold text-[rgb(var(--text-muted))] uppercase tracking-wider">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated))] text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))] text-sm font-medium"
    >
      {options.map(r => (
        <option key={r.id} value={r.id}>{r.title}</option>
      ))}
    </select>
  </div>
);

const CareerComparePage = () => {
  const navigate = useNavigate();
  
  const currentBranch = localStorage.getItem('dashboard_branch') || 'computer';
  const isComputerBranch = ['computer', 'it', 'cs-ds'].includes(currentBranch);

  const branchRoadmaps = React.useMemo(() => {
    let list = ROADMAPS;
    if (isComputerBranch) {
        list = list.filter(r => !['ece-core', 'ee-core', 'mech-core', 'civil-core', 'chem-core'].includes(r.id) && !r.branch);
    } else if (currentBranch === 'electronics') {
        list = list.filter(r => r.id === 'ece-core' || r.branch === 'electronics');
    } else if (currentBranch === 'electrical') {
        list = list.filter(r => r.id === 'ee-core' || r.branch === 'electrical');
    } else if (currentBranch === 'mechanical') {
        list = list.filter(r => r.id === 'mech-core' || r.branch === 'mechanical');
    } else if (currentBranch === 'civil') {
        list = list.filter(r => r.id === 'civil-core' || r.branch === 'civil');
    } else if (currentBranch === 'chemical') {
        list = list.filter(r => r.id === 'chem-core' || r.branch === 'chemical');
    } else {
        list = list.filter(r => !['ece-core', 'ee-core', 'mech-core', 'civil-core', 'chem-core'].includes(r.id) && !r.branch);
    }
    return list;
  }, [currentBranch, isComputerBranch]);

  const [leftId, setLeftId] = useState(branchRoadmaps[0]?.id || 'ai-engineer');
  const [rightId, setRightId] = useState(branchRoadmaps[1]?.id || 'data-scientist');

  // If the selected roadmap IDs aren't in the branch, reset them
  React.useEffect(() => {
    if (branchRoadmaps.length >= 2) {
      if (!branchRoadmaps.find(r => r.id === leftId)) setLeftId(branchRoadmaps[0].id);
      if (!branchRoadmaps.find(r => r.id === rightId)) setRightId(branchRoadmaps[1].id);
    }
  }, [branchRoadmaps, leftId, rightId]);

  const getCompareData = (roadmap) => {
    if (!roadmap) return null;
    if (CAREER_COMPARE_DATA[roadmap.id]) return CAREER_COMPARE_DATA[roadmap.id];

    let minSal = 5, maxSal = 15;
    if (roadmap.salary) {
      const match = roadmap.salary.match(/(\d+)/g);
      if (match && match.length >= 2) {
        minSal = parseInt(match[0]);
        maxSal = parseInt(match[1]);
        if (roadmap.salary.includes('K')) {
          minSal = Math.round(minSal * 83 / 100);
          maxSal = Math.round(maxSal * 83 / 100);
        }
      }
    }

    return {
      salary: { min: minSal, max: maxSal, currency: '₹L' },
      demand: roadmap.demand === 'High' ? 85 : 70,
      difficulty: roadmap.difficulty === 'Intermediate' ? 65 : 80,
      timeToLearn: roadmap.duration || '6-8 months',
      growth: 80,
      jobRoles: [roadmap.title, 'Senior ' + roadmap.title],
      topSkills: roadmap.tags || [],
      topCompanies: ['Top Industry Firms', 'Enterprises', 'Startups'],
      pros: ['Great career growth potential', 'High industry demand'],
      cons: ['Requires continuous learning', 'Competitive field']
    };
  };

  const leftRoadmap = ROADMAPS.find(r => r.id === leftId);
  const rightRoadmap = ROADMAPS.find(r => r.id === rightId);
  const leftData = getCompareData(leftRoadmap);
  const rightData = getCompareData(rightRoadmap);

  const radarData = [
    { metric: 'Demand', left: leftData?.demand || 0, right: rightData?.demand || 0 },
    { metric: 'Salary', left: Math.min(100, (leftData?.salary.max || 0) * 2), right: Math.min(100, (rightData?.salary.max || 0) * 2) },
    { metric: 'Growth', left: leftData?.growth || 0, right: rightData?.growth || 0 },
    { metric: 'Ease', left: 100 - (leftData?.difficulty || 0), right: 100 - (rightData?.difficulty || 0) },
    { metric: 'Entry', left: 80 - (leftData?.difficulty || 0) * 0.5, right: 80 - (rightData?.difficulty || 0) * 0.5 },
  ];

  return (
    <div className="min-h-screen bg-[rgb(var(--bg-body))]">
      {/* Header */}
      <div className="border-b border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated))]/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/roadmaps')}
            className="flex items-center gap-2 text-sm text-[rgb(var(--text-muted))] hover:text-[rgb(var(--accent))] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Roadmaps
          </button>
          <ChevronRight className="w-4 h-4 text-[rgb(var(--text-muted))]" />
          <span className="text-sm font-bold text-[rgb(var(--text-primary))] flex items-center gap-2">
            <GitCompare className="w-4 h-4 text-[rgb(var(--accent))]" />
            Career Comparison
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl sm:text-4xl font-black text-[rgb(var(--text-primary))] mb-3">
            Career{' '}
            <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              Comparison
            </span>
          </h1>
          <p className="text-[rgb(var(--text-secondary))]">
            Compare salaries, demand, difficulty, and skills side by side to make the right career choice.
          </p>
        </motion.div>

        {/* Preset buttons */}
        {isComputerBranch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-2 justify-center mb-8"
          >
            {COMPARISON_PRESETS.map(preset => (
              <button
                key={preset.label}
                onClick={() => { setLeftId(preset.left); setRightId(preset.right); }}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  leftId === preset.left && rightId === preset.right
                    ? 'bg-[rgb(var(--accent))] text-white border-[rgb(var(--accent))]'
                    : 'bg-[rgb(var(--bg-elevated))] text-[rgb(var(--text-secondary))] border-[rgb(var(--border))] hover:border-[rgb(var(--accent))]/50'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </motion.div>
        )}

        {/* Career selectors */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8"
        >
          <div className={`p-5 rounded-2xl bg-gradient-to-br ${leftRoadmap?.cardGradient} border ${leftRoadmap?.borderColor}`}>
            <CareerSelect value={leftId} onChange={setLeftId} label="Career A" options={branchRoadmaps} />
            {leftRoadmap && (
              <div className="mt-3 flex items-center gap-3">
                {(() => {
                  const IC = Icons[leftRoadmap.icon] || Icons.Briefcase;
                  return (
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${leftRoadmap.gradient} flex items-center justify-center`}>
                      <IC className="w-5 h-5 text-white" />
                    </div>
                  );
                })()}
                <div>
                  <p className="font-bold text-[rgb(var(--text-primary))]">{leftRoadmap.title}</p>
                  <p className="text-xs text-[rgb(var(--text-muted))]">{leftRoadmap.duration}</p>
                </div>
              </div>
            )}
          </div>

          <div className={`p-5 rounded-2xl bg-gradient-to-br ${rightRoadmap?.cardGradient} border ${rightRoadmap?.borderColor}`}>
            <CareerSelect value={rightId} onChange={setRightId} label="Career B" options={branchRoadmaps} />
            {rightRoadmap && (
              <div className="mt-3 flex items-center gap-3">
                {(() => {
                  const IC = Icons[rightRoadmap.icon] || Icons.Briefcase;
                  return (
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${rightRoadmap.gradient} flex items-center justify-center`}>
                      <IC className="w-5 h-5 text-white" />
                    </div>
                  );
                })()}
                <div>
                  <p className="font-bold text-[rgb(var(--text-primary))]">{rightRoadmap.title}</p>
                  <p className="text-xs text-[rgb(var(--text-muted))]">{rightRoadmap.duration}</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {leftData && rightData && (
          <>
            {/* Radar Chart */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="mb-8 p-6 rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated))]"
            >
              <h2 className="text-base font-bold text-[rgb(var(--text-primary))] mb-5 flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-400" />
                Skill Radar Comparison
              </h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgb(var(--border))" />
                    <PolarAngleAxis
                      dataKey="metric"
                      tick={{ fill: 'rgb(var(--text-muted))', fontSize: 11 }}
                    />
                    <Radar
                      name={leftRoadmap?.title}
                      dataKey="left"
                      stroke="#6366f1"
                      fill="#6366f1"
                      fillOpacity={0.2}
                    />
                    <Radar
                      name={rightRoadmap?.title}
                      dataKey="right"
                      stroke="#22d3ee"
                      fill="#22d3ee"
                      fillOpacity={0.2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center gap-6 mt-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-indigo-500" />
                  <span className="text-xs text-[rgb(var(--text-muted))]">{leftRoadmap?.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-cyan-400" />
                  <span className="text-xs text-[rgb(var(--text-muted))]">{rightRoadmap?.title}</span>
                </div>
              </div>
            </motion.div>

            {/* Metrics comparison */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="p-6 rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated))] mb-8"
            >
              {/* Column headers */}
              <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] gap-4 mb-4">
                <div className={`flex items-center justify-center gap-2 p-3 rounded-xl bg-gradient-to-br ${leftRoadmap?.cardGradient} border ${leftRoadmap?.borderColor} min-w-0`}>
                  {(() => { const IC = Icons[leftRoadmap?.icon] || Icons.Briefcase; return <IC className="w-4 h-4 shrink-0 text-white" />; })()}
                  <span className="text-sm font-bold text-[rgb(var(--text-primary))] truncate">{leftRoadmap?.title}</span>
                </div>
                <div className="flex items-center justify-center shrink-0">
                  <GitCompare className="w-5 h-5 text-[rgb(var(--text-muted))]" />
                </div>
                <div className={`flex items-center justify-center gap-2 p-3 rounded-xl bg-gradient-to-br ${rightRoadmap?.cardGradient} border ${rightRoadmap?.borderColor} min-w-0`}>
                  {(() => { const IC = Icons[rightRoadmap?.icon] || Icons.Briefcase; return <IC className="w-4 h-4 shrink-0 text-white" />; })()}
                  <span className="text-sm font-bold text-[rgb(var(--text-primary))] truncate">{rightRoadmap?.title}</span>
                </div>
              </div>

              <MetricRow
                label="Salary Range"
                leftValue={
                  <span className="flex items-center justify-end gap-1">
                    <IndianRupee className="w-3.5 h-3.5 text-green-400" />
                    <span>{leftData.salary.min}L - {leftData.salary.max}L</span>
                  </span>
                }
                rightValue={
                  <span className="flex items-center justify-start gap-1">
                    <IndianRupee className="w-3.5 h-3.5 text-green-400" />
                    <span>{rightData.salary.min}L - {rightData.salary.max}L</span>
                  </span>
                }
              />
              <MetricRow
                label="Job Demand"
                leftValue={leftData.demand}
                rightValue={rightData.demand}
                leftColor="bg-indigo-500"
                rightColor="bg-cyan-400"
                isBar
              />
              <MetricRow
                label="Difficulty"
                leftValue={leftData.difficulty}
                rightValue={rightData.difficulty}
                leftColor="bg-orange-500"
                rightColor="bg-orange-500"
                isBar
              />
              <MetricRow
                label="Growth Potential"
                leftValue={leftData.growth}
                rightValue={rightData.growth}
                leftColor="bg-green-500"
                rightColor="bg-green-500"
                isBar
              />
              <MetricRow
                label="Time to Learn"
                leftValue={leftData.timeToLearn}
                rightValue={rightData.timeToLearn}
              />
            </motion.div>

            {/* Skills & Pros/Cons grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8"
            >
              {[
                { roadmap: leftRoadmap, data: leftData, colorClass: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10' },
                { roadmap: rightRoadmap, data: rightData, colorClass: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10' },
              ].map(({ roadmap: r, data: d, colorClass }) => (
                <div key={r.id} className={`p-5 rounded-2xl border ${colorClass}`}>
                  <h3 className="font-bold text-[rgb(var(--text-primary))] mb-4 flex items-center gap-3">
                    {(() => {
                      const IC = Icons[r.icon] || Icons.Briefcase;
                      return (
                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${r.gradient} flex items-center justify-center`}>
                          <IC className="w-4 h-4 text-white" />
                        </div>
                      );
                    })()}
                    {r.title}
                  </h3>

                  <div className="mb-4">
                    <p className="text-xs font-bold text-[rgb(var(--text-muted))] uppercase tracking-wider mb-2">Top Skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {d.topSkills.map(s => (
                        <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-[rgb(var(--bg-body))] border border-[rgb(var(--border))] text-[rgb(var(--text-secondary))]">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-xs font-bold text-green-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5" /> Pros
                    </p>
                    <ul className="space-y-1">
                      {d.pros.map(p => (
                        <li key={p} className="text-xs text-[rgb(var(--text-secondary))] flex items-start gap-1.5">
                          <span className="text-green-400 mt-0.5">•</span>
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <XCircle className="w-3.5 h-3.5" /> Cons
                    </p>
                    <ul className="space-y-1">
                      {d.cons.map(c => (
                        <li key={c} className="text-xs text-[rgb(var(--text-secondary))] flex items-start gap-1.5">
                          <span className="text-red-400 mt-0.5">•</span>
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <motion.button
                    onClick={() => navigate(`/roadmaps/${r.id}`)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`mt-5 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r ${r.gradient} text-white text-sm font-bold shadow-lg hover:shadow-xl transition-all`}
                  >
                    Start {r.title} Roadmap
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              ))}
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default CareerComparePage;

import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, ChevronDown, ChevronUp, BookOpen, Lightbulb, Target, Zap, Star, ArrowRight, TrendingUp, Award, Brain, MessageSquare, Shield } from 'lucide-react';

// Animated counter hook
export const useAnimatedCounter = (end, duration = 1500) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
        if (!end) return;
        let start = 0;
        const step = end / (duration / 16);
        const timer = setInterval(() => {
            start += step;
            if (start >= end) { setCount(end); clearInterval(timer); }
            else setCount(Math.round(start));
        }, 16);
        return () => clearInterval(timer);
    }, [end, duration]);
    return count;
};

// Radar Chart Component (pure SVG)
export const RadarChart = ({ scores }) => {
    const labels = ['Technical', 'Communication', 'Problem Solving', 'Confidence', 'STAR Method'];
    const cx = 150, cy = 150, r = 110;
    const angleStep = (2 * Math.PI) / 5;

    const getPoint = (index, value) => {
        const angle = (index * angleStep) - Math.PI / 2;
        const dist = (value / 10) * r;
        return { x: cx + dist * Math.cos(angle), y: cy + dist * Math.sin(angle) };
    };

    const gridLevels = [0.25, 0.5, 0.75, 1];
    const dataPoints = scores.map((s, i) => getPoint(i, s));
    const pathD = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + 'Z';

    return (
        <svg viewBox="0 0 300 300" className="w-full max-w-[320px] mx-auto" style={{ filter: 'drop-shadow(0 4px 12px rgba(99,102,241,0.15))' }}>
            {gridLevels.map((level, li) => (
                <polygon key={li} points={Array.from({ length: 5 }, (_, i) => { const p = getPoint(i, level * 10); return `${p.x},${p.y}`; }).join(' ')}
                    fill="none" stroke="rgb(var(--border))" strokeWidth="0.8" opacity={0.5} />
            ))}
            {Array.from({ length: 5 }, (_, i) => {
                const p = getPoint(i, 10);
                return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgb(var(--border))" strokeWidth="0.5" opacity={0.4} />;
            })}
            <polygon points={pathD.replace(/[MLZ]/g, ' ').trim()} fill="rgba(99,102,241,0.15)" stroke="rgb(99,102,241)" strokeWidth="2.5">
                <animate attributeName="opacity" from="0" to="1" dur="0.8s" fill="freeze" />
            </polygon>
            {dataPoints.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r="5" fill="rgb(99,102,241)" stroke="white" strokeWidth="2">
                    <animate attributeName="r" from="0" to="5" dur="0.5s" begin={`${i * 0.1}s`} fill="freeze" />
                </circle>
            ))}
            {labels.map((label, i) => {
                const p = getPoint(i, 12.5);
                return <text key={i} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle"
                    className="text-[10px] font-semibold" fill="rgb(var(--text-muted))">{label}</text>;
            })}
            {scores.map((s, i) => {
                const p = getPoint(i, s + 1.5);
                return <text key={`s${i}`} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle"
                    className="text-[11px] font-bold" fill="rgb(99,102,241)">{s}</text>;
            })}
        </svg>
    );
};

// Score Ring Component
export const ScoreRing = ({ score, size = 160 }) => {
    const animatedScore = useAnimatedCounter(score);
    const radius = (size - 16) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (animatedScore / 100) * circumference;
    const color = score >= 70 ? '34,197,94' : score >= 50 ? '234,179,8' : '239,68,68';

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90">
                <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgb(var(--border))" strokeWidth="10" opacity="0.3" />
                <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={`rgb(${color})`} strokeWidth="10"
                    strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 1.5s ease-out' }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black" style={{ color: `rgb(${color})` }}>{animatedScore}</span>
                <span className="text-xs text-[rgb(var(--text-muted))] font-medium">out of 100</span>
            </div>
        </div>
    );
};

// Readiness Badge
export const ReadinessBadge = ({ readiness }) => {
    const config = {
        'Exceptional': { bg: 'from-emerald-500 to-green-600', icon: Star, text: 'white' },
        'Interview Ready': { bg: 'from-green-500 to-emerald-600', icon: CheckCircle, text: 'white' },
        'Almost Ready': { bg: 'from-blue-500 to-indigo-600', icon: TrendingUp, text: 'white' },
        'Needs More Practice': { bg: 'from-amber-500 to-orange-600', icon: AlertCircle, text: 'white' },
        'Not Ready': { bg: 'from-red-500 to-rose-600', icon: XCircle, text: 'white' },
    };
    const c = config[readiness] || config['Needs More Practice'];
    const Icon = c.icon;
    return (
        <div className={`inline-flex items-center gap-2 bg-gradient-to-r ${c.bg} text-${c.text} px-5 py-2.5 rounded-full shadow-lg`}>
            <Icon className="w-5 h-5" />
            <span className="font-bold text-sm tracking-wide">{readiness}</span>
        </div>
    );
};

// Score Bar
export const ScoreBar = ({ label, score, max = 10, icon: Icon }) => {
    const pct = (score / max) * 100;
    const color = pct >= 70 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500';
    return (
        <div className="flex items-center gap-3">
            {Icon && <Icon className="w-4 h-4 text-[rgb(var(--text-muted))] flex-shrink-0" />}
            <div className="flex-1">
                <div className="flex justify-between mb-1">
                    <span className="text-xs font-semibold text-[rgb(var(--text-secondary))]">{label}</span>
                    <span className="text-xs font-bold text-[rgb(var(--text-primary))]">{score}/{max}</span>
                </div>
                <div className="h-2 bg-[rgb(var(--border))]/30 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${color} transition-all duration-1000 ease-out`} style={{ width: `${pct}%` }} />
                </div>
            </div>
        </div>
    );
};

// Collapsible Question Card (enhanced)
export const CollapsibleQuestion = ({ questionData, index }) => {
    const [isOpen, setIsOpen] = useState(false);
    const rating = questionData.rating || 0;
    const ratingPct = (rating / 10) * 100;
    const ratingColor = rating >= 8 ? 'text-emerald-500' : rating >= 5 ? 'text-amber-500' : 'text-red-500';
    const ratingBg = rating >= 8 ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' : rating >= 5 ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
    const RIcon = rating >= 8 ? CheckCircle : rating >= 5 ? AlertCircle : XCircle;

    return (
        <div className="bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border))] rounded-2xl overflow-hidden transition-all shadow-sm hover:shadow-lg group">
            <button onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-5 text-left hover:bg-[rgb(var(--bg-elevated-alt))]/50 transition-colors">
                <div className="flex-1 pr-4">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-[rgb(var(--text-muted))] text-[10px] uppercase tracking-widest font-bold bg-[rgb(var(--bg-card))] px-2.5 py-1 rounded-md">Q{index}</span>
                        {rating > 0 && (
                            <div className={`flex items-center gap-1 ${ratingBg} border px-2.5 py-1 rounded-md`}>
                                <RIcon className={`w-3.5 h-3.5 ${ratingColor}`} />
                                <span className={`font-bold text-xs ${ratingColor}`}>{rating}/10</span>
                            </div>
                        )}
                    </div>
                    <p className="text-[rgb(var(--text-primary))] font-medium text-sm leading-relaxed">{questionData.question}</p>
                </div>
                <div className="flex items-center gap-3">
                    {rating > 0 && (
                        <div className="hidden sm:block w-20 h-1.5 bg-[rgb(var(--border))]/30 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all duration-700 ${rating >= 8 ? 'bg-emerald-500' : rating >= 5 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${ratingPct}%` }} />
                        </div>
                    )}
                    {isOpen ? <ChevronUp className="w-5 h-5 text-[rgb(var(--text-muted))]" /> : <ChevronDown className="w-5 h-5 text-[rgb(var(--text-muted))]" />}
                </div>
            </button>

            {isOpen && (
                <div className="p-5 border-t border-[rgb(var(--border))] space-y-4 animate-in slide-in-from-top-2" style={{ animation: 'fadeSlideIn 0.3s ease-out' }}>
                    {/* User's Answer */}
                    {questionData.userAns && (
                        <div className="bg-slate-50 dark:bg-slate-900/30 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-2 mb-2">
                                <MessageSquare className="w-4 h-4 text-slate-500" />
                                <strong className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Your Answer</strong>
                            </div>
                            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{questionData.userAns}</p>
                        </div>
                    )}

                    {/* Question Strengths & Improvements side by side */}
                    {((questionData.questionStrengths?.length > 0) || (questionData.questionImprovements?.length > 0)) && (
                        <div className="grid md:grid-cols-2 gap-3">
                            {questionData.questionStrengths?.length > 0 && (
                                <div className="bg-emerald-50 dark:bg-emerald-900/10 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800">
                                    <h5 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase mb-2 flex items-center gap-1.5">
                                        <CheckCircle className="w-3.5 h-3.5" /> What You Did Well
                                    </h5>
                                    {questionData.questionStrengths.map((s, i) => (
                                        <p key={i} className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed mb-1">• {s}</p>
                                    ))}
                                </div>
                            )}
                            {questionData.questionImprovements?.length > 0 && (
                                <div className="bg-amber-50 dark:bg-amber-900/10 p-3 rounded-xl border border-amber-200 dark:border-amber-800">
                                    <h5 className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase mb-2 flex items-center gap-1.5">
                                        <TrendingUp className="w-3.5 h-3.5" /> How to Improve
                                    </h5>
                                    {questionData.questionImprovements.map((s, i) => (
                                        <p key={i} className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed mb-1">• {s}</p>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* AI Feedback */}
                    {questionData.feedback && (
                        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/10 dark:to-indigo-900/10 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
                            <div className="flex items-center gap-2 mb-2">
                                <Lightbulb className="w-4 h-4 text-purple-500" />
                                <strong className="text-xs font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wide">AI Coach Feedback</strong>
                            </div>
                            <p className="text-sm text-purple-900 dark:text-purple-200 leading-relaxed">{questionData.feedback}</p>
                        </div>
                    )}

                    {/* Ideal Approach */}
                    {questionData.idealApproach && (
                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                            <div className="flex items-center gap-2 mb-2">
                                <Target className="w-4 h-4 text-blue-500" />
                                <strong className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wide">Ideal Approach</strong>
                            </div>
                            <p className="text-sm text-blue-900 dark:text-blue-200 leading-relaxed">{questionData.idealApproach}</p>
                        </div>
                    )}

                    {/* Rewritten Professional Answer */}
                    {questionData.rewrittenAnswer && (
                        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800">
                            <div className="flex items-center gap-2 mb-2">
                                <Star className="w-4 h-4 text-emerald-500" />
                                <strong className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">How You Should Have Answered (Polished Version)</strong>
                            </div>
                            <p className="text-sm text-emerald-900 dark:text-emerald-200 leading-relaxed italic">"{questionData.rewrittenAnswer}"</p>
                        </div>
                    )}

                    {/* Reference Answer */}
                    {questionData.correctAnswer && (
                        <details className="group/ref">
                            <summary className="cursor-pointer text-xs font-semibold text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-primary))] flex items-center gap-1.5 py-1">
                                <BookOpen className="w-3.5 h-3.5" /> View Reference Answer
                            </summary>
                            <div className="mt-2 bg-[rgb(var(--bg-card))] p-3 rounded-lg border border-[rgb(var(--border))]">
                                <p className="text-xs text-[rgb(var(--text-secondary))] leading-relaxed">{questionData.correctAnswer}</p>
                            </div>
                        </details>
                    )}
                </div>
            )}
        </div>
    );
};

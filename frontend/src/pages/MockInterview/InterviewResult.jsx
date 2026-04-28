import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../utils/axiosInstance';
import { Loader2, ArrowLeft, Award, Lightbulb, CheckCircle, XCircle, AlertCircle, TrendingUp, Target, Eye, Brain, MessageSquare, Shield, Zap, ArrowRight, Star, BookOpen, Crosshair } from 'lucide-react';
import { ScoreRing, RadarChart, ReadinessBadge, ScoreBar, CollapsibleQuestion } from './FeedbackComponents';

const InterviewResult = () => {
    const { mockId } = useParams();
    const navigate = useNavigate();
    const [interview, setInterview] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInterview = async () => {
            try {
                const response = await axios.get(`/mock-interview/${mockId}`);
                setInterview(response.data);
            } catch (error) {
                console.error("Failed to fetch interview", error);
            } finally {
                setLoading(false);
            }
        };
        fetchInterview();
    }, [mockId]);

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin w-10 h-10 text-[rgb(var(--accent))]" /></div>;
    if (!interview) return <div className="text-center py-20">Interview not found</div>;

    const { overallFeedback, status } = interview;
    const isCompleted = status === 'completed';
    const fb = overallFeedback || {};

    const radarScores = [
        fb.technicalScore || 0,
        fb.communicationScore || 0,
        fb.problemSolvingScore || 0,
        fb.confidenceScore || 0,
        fb.starMethodAdherence || 0
    ];

    const avgScore = Math.round(radarScores.reduce((a, b) => a + b, 0) / 5);

    return (
        <div className="min-h-screen bg-[rgb(var(--bg-background))] p-4 md:p-8 max-w-7xl mx-auto">
            {/* CSS animations */}
            <style>{`
                @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                .anim-fade { animation: fadeSlideIn 0.5s ease-out both; }
                .anim-d1 { animation-delay: 0.1s; }
                .anim-d2 { animation-delay: 0.2s; }
                .anim-d3 { animation-delay: 0.3s; }
                .anim-d4 { animation-delay: 0.4s; }
                .anim-d5 { animation-delay: 0.5s; }
                .anim-d6 { animation-delay: 0.6s; }
                .glass-card { background: rgba(var(--bg-elevated), 0.7); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgb(var(--border)); }
            `}</style>

            <button onClick={() => navigate('/mock-interview')} className="mb-6 flex items-center gap-2 text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-primary))] transition-colors group">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
            </button>

            {!isCompleted ? (
                <div className="bg-amber-50 dark:bg-amber-900/10 border-2 border-amber-200 dark:border-amber-900/30 rounded-2xl p-10 text-center">
                    <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-amber-800 dark:text-amber-300 mb-2">Interview Not Completed</h2>
                    <p className="text-amber-700 dark:text-amber-400 mb-6">Start the interview to receive detailed AI-powered feedback.</p>
                    <button onClick={() => navigate(`/mock-interview/${mockId}/start`)} className="bg-[rgb(var(--accent))] text-white px-8 py-3 rounded-xl font-semibold hover:opacity-90 transition-all shadow-lg">
                        Start Interview
                    </button>
                </div>
            ) : (
                <>
                    {/* ===== HERO SECTION ===== */}
                    <div className="glass-card rounded-3xl p-8 mb-6 anim-fade shadow-xl">
                        <div className="flex flex-col lg:flex-row gap-8 items-center">
                            <div className="flex flex-col items-center gap-4">
                                <ScoreRing score={fb.score || 0} size={170} />
                                <ReadinessBadge readiness={fb.interviewReadiness || 'Needs More Practice'} />
                            </div>
                            <div className="flex-1 text-center lg:text-left">
                                <h1 className="text-3xl font-black text-[rgb(var(--text-primary))] mb-1 flex items-center justify-center lg:justify-start gap-2">
                                    <Award className="w-8 h-8 text-amber-500" /> Performance Report
                                </h1>
                                <p className="text-sm text-[rgb(var(--text-muted))] mb-4">
                                    {interview.interviewType} Interview · {interview.difficulty} · {interview.focusArea}
                                </p>
                                <p className="text-[rgb(var(--text-secondary))] leading-relaxed text-sm max-w-2xl">
                                    {fb.summary || "Great job completing the interview!"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ===== RADAR + SCORE BARS ===== */}
                    <div className="grid lg:grid-cols-2 gap-6 mb-6 anim-fade anim-d1">
                        <div className="glass-card rounded-2xl p-6 shadow-md">
                            <h3 className="text-lg font-bold text-[rgb(var(--text-primary))] mb-4 flex items-center gap-2">
                                <Crosshair className="w-5 h-5 text-indigo-500" /> Skill Radar
                            </h3>
                            <RadarChart scores={radarScores} />
                        </div>
                        <div className="glass-card rounded-2xl p-6 shadow-md">
                            <h3 className="text-lg font-bold text-[rgb(var(--text-primary))] mb-5 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-indigo-500" /> Score Breakdown
                            </h3>
                            <div className="space-y-4">
                                <ScoreBar label="Technical Knowledge" score={fb.technicalScore || 0} icon={Brain} />
                                <ScoreBar label="Communication" score={fb.communicationScore || 0} icon={MessageSquare} />
                                <ScoreBar label="Problem Solving" score={fb.problemSolvingScore || 0} icon={Target} />
                                <ScoreBar label="Confidence" score={fb.confidenceScore || 0} icon={Shield} />
                                <ScoreBar label="STAR Method" score={fb.starMethodAdherence || 0} icon={Star} />
                            </div>
                            <div className="mt-5 pt-4 border-t border-[rgb(var(--border))] flex justify-between items-center">
                                <span className="text-sm font-semibold text-[rgb(var(--text-muted))]">Average</span>
                                <span className="text-lg font-black text-indigo-500">{avgScore}/10</span>
                            </div>
                        </div>
                    </div>

                    {/* ===== STRENGTHS & WEAKNESSES ===== */}
                    {((fb.strengths?.length > 0) || (fb.weaknesses?.length > 0)) && (
                        <div className="grid md:grid-cols-2 gap-6 mb-6 anim-fade anim-d2">
                            {fb.strengths?.length > 0 && (
                                <div className="glass-card rounded-2xl p-6 shadow-md border-l-4 border-l-emerald-500">
                                    <h3 className="text-lg font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2 mb-4">
                                        <CheckCircle className="w-5 h-5" /> Your Strengths
                                    </h3>
                                    <div className="space-y-3">
                                        {fb.strengths.map((s, i) => (
                                            <div key={i} className="flex items-start gap-3 bg-emerald-50 dark:bg-emerald-900/10 p-3 rounded-xl">
                                                <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">{i+1}</div>
                                                <p className="text-sm text-emerald-900 dark:text-emerald-200 leading-relaxed">{s}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {fb.weaknesses?.length > 0 && (
                                <div className="glass-card rounded-2xl p-6 shadow-md border-l-4 border-l-rose-500">
                                    <h3 className="text-lg font-bold text-rose-700 dark:text-rose-400 flex items-center gap-2 mb-4">
                                        <XCircle className="w-5 h-5" /> Areas to Improve
                                    </h3>
                                    <div className="space-y-3">
                                        {fb.weaknesses.map((w, i) => (
                                            <div key={i} className="flex items-start gap-3 bg-rose-50 dark:bg-rose-900/10 p-3 rounded-xl">
                                                <div className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">{i+1}</div>
                                                <p className="text-sm text-rose-900 dark:text-rose-200 leading-relaxed">{w}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ===== BEHAVIORAL ANALYSIS ===== */}
                    {interview.behaviorAnalysis && (
                        <div className="glass-card rounded-2xl p-6 mb-6 shadow-md anim-fade anim-d3">
                            <h3 className="text-lg font-bold text-[rgb(var(--text-primary))] flex items-center gap-2 mb-5">
                                <Eye className="w-5 h-5 text-indigo-500" /> AI Behavioral Analysis
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                                {[
                                    { label: 'Eye Contact', value: `${interview.behaviorAnalysis.eyeContact}%`, icon: Eye, color: 'blue' },
                                    { label: 'Confidence', value: `${interview.behaviorAnalysis.overallScore}/100`, icon: Award, color: 'purple' },
                                    { label: 'Engagement', value: `${interview.behaviorAnalysis.engagementScore}%`, icon: Lightbulb, color: 'pink' }
                                ].map((m, i) => (
                                    <div key={i} className={`bg-${m.color}-50 dark:bg-${m.color}-900/10 p-4 rounded-xl border border-${m.color}-200 dark:border-${m.color}-800 text-center`}>
                                        <m.icon className={`w-8 h-8 text-${m.color}-500 mx-auto mb-2`} />
                                        <div className="text-2xl font-black text-[rgb(var(--text-primary))]">{m.value}</div>
                                        <div className="text-xs text-[rgb(var(--text-muted))] font-medium mt-1">{m.label}</div>
                                    </div>
                                ))}
                            </div>
                            {interview.behaviorAnalysis.feedback?.length > 0 && (
                                <div className="space-y-2 mt-4">
                                    {interview.behaviorAnalysis.feedback.map((item, i) => (
                                        <div key={i} className="flex items-start gap-2 text-sm text-[rgb(var(--text-secondary))]">
                                            <CheckCircle className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                                            <span>{item}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ===== SKILL GAPS ===== */}
                    {fb.skillGaps?.length > 0 && (
                        <div className="glass-card rounded-2xl p-6 mb-6 shadow-md anim-fade anim-d3">
                            <h3 className="text-lg font-bold text-[rgb(var(--text-primary))] flex items-center gap-2 mb-5">
                                <Zap className="w-5 h-5 text-amber-500" /> Skill Gap Analysis
                            </h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                {fb.skillGaps.map((gap, i) => (
                                    <div key={i} className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 p-4 rounded-xl border border-amber-200 dark:border-amber-800">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-bold text-sm text-amber-900 dark:text-amber-200">{gap.skill}</span>
                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${gap.level === 'Beginner' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : gap.level === 'Intermediate' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
                                                {gap.level}
                                            </span>
                                        </div>
                                        <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed flex items-start gap-1.5">
                                            <Lightbulb className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" /> {gap.recommendation}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ===== QUESTION-BY-QUESTION ===== */}
                    <div className="mb-4 anim-fade anim-d4">
                        <h2 className="text-2xl font-black text-[rgb(var(--text-primary))] flex items-center gap-2 mb-1">
                            <Target className="w-6 h-6 text-[rgb(var(--accent))]" /> Question Deep Dive
                        </h2>
                        <p className="text-sm text-[rgb(var(--text-muted))] mb-5">Expand each question for detailed feedback, strengths, and ideal approach</p>
                    </div>
                    <div className="space-y-4 mb-6 anim-fade anim-d4">
                        {interview.mockInterviewResult.map((q, idx) => (
                            <CollapsibleQuestion key={idx} questionData={q} index={idx + 1} />
                        ))}
                    </div>

                    {/* ===== ACTION PLAN ===== */}
                    {fb.overallRecommendations?.length > 0 && (
                        <div className="glass-card rounded-2xl p-6 mb-6 shadow-md anim-fade anim-d5">
                            <h3 className="text-lg font-bold text-[rgb(var(--text-primary))] flex items-center gap-2 mb-5">
                                <BookOpen className="w-5 h-5 text-indigo-500" /> Personalized Action Plan
                            </h3>
                            <div className="space-y-3">
                                {fb.overallRecommendations.map((rec, i) => (
                                    <div key={i} className="flex items-start gap-4 bg-[rgb(var(--bg-card))] p-4 rounded-xl border border-[rgb(var(--border))]">
                                        <div className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${rec.priority === 'High' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : rec.priority === 'Medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                                            {rec.priority}
                                        </div>
                                        <div className="flex-1">
                                            <span className="text-xs font-bold text-[rgb(var(--text-muted))] uppercase tracking-wide">{rec.category}</span>
                                            <p className="text-sm text-[rgb(var(--text-primary))] leading-relaxed mt-0.5">{rec.tip}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ===== NEXT STEPS ===== */}
                    {fb.nextSteps?.length > 0 && (
                        <div className="glass-card rounded-2xl p-6 mb-8 shadow-md bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/10 dark:to-purple-900/10 anim-fade anim-d6">
                            <h3 className="text-lg font-bold text-indigo-700 dark:text-indigo-400 flex items-center gap-2 mb-5">
                                <ArrowRight className="w-5 h-5" /> Your Next Steps
                            </h3>
                            <div className="space-y-3">
                                {fb.nextSteps.map((step, i) => (
                                    <div key={i} className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center flex-shrink-0 font-bold text-sm shadow-lg">{i+1}</div>
                                        <p className="text-sm text-indigo-900 dark:text-indigo-200 leading-relaxed font-medium">{step}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ===== IMPROVEMENT TIPS (legacy) ===== */}
                    {fb.improvements?.length > 0 && (
                        <div className="glass-card rounded-2xl p-6 mb-8 shadow-md anim-fade anim-d6">
                            <h3 className="text-lg font-bold text-orange-700 dark:text-orange-400 flex items-center gap-2 mb-4">
                                <Lightbulb className="w-5 h-5" /> Quick Improvement Tips
                            </h3>
                            <div className="grid md:grid-cols-2 gap-3">
                                {fb.improvements.map((imp, idx) => (
                                    <div key={idx} className="flex items-start gap-3 bg-orange-50 dark:bg-orange-900/10 p-3 rounded-xl border border-orange-200 dark:border-orange-800">
                                        <div className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold text-xs">{idx+1}</div>
                                        <p className="text-sm text-orange-900 dark:text-orange-200 leading-relaxed">{imp}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ===== ACTION BUTTONS ===== */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center anim-fade anim-d6">
                        <button onClick={() => navigate(`/mock-interview/${mockId}/start`)}
                            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-3.5 rounded-xl font-bold hover:opacity-90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                            Retake Interview
                        </button>
                        <button onClick={() => navigate('/mock-interview/create')}
                            className="border-2 border-[rgb(var(--border))] text-[rgb(var(--text-primary))] px-8 py-3.5 rounded-xl font-bold hover:bg-[rgb(var(--bg-elevated-alt))] transition-all">
                            Create New Interview
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default InterviewResult;

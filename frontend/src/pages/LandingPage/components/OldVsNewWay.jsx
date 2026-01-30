import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import {
    X, Check, Clock, DollarSign, Target, TrendingUp,
    BookOpen, Bot, Zap, Users, Award, Brain,
    AlertCircle, CheckCircle2, ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API } from '../../../utils/apiPaths';
import { UserContext } from '../../../context/UserContext';

const OldVsNewWay = ({ onJoin }) => {
    const { user } = useContext(UserContext);
    const navigate = useNavigate();

    const [stats, setStats] = useState({
        totalUsers: '0',
        questionsSolved: '0',
        avgTimeSaved: '12',
        successRate: '94'
    });

    // Fetch real stats from backend
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axios.get(API.PUBLIC.GET_STATS);
                if (response.data.success) {
                    const users = response.data.stats.totalUsers;
                    const questions = response.data.stats.totalQuestionsSolved;

                    setStats(prev => ({
                        ...prev,
                        totalUsers: users > 1000 ? `${(users / 1000).toFixed(1)}K` : users.toString(),
                        questionsSolved: questions > 1000 ? `${(questions / 1000).toFixed(0)}K` : questions.toString()
                    }));
                }
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            }
        };

        fetchStats();
    }, []);

    const comparisons = [
        {
            category: "Interview Preparation",
            oldWay: {
                icon: BookOpen,
                title: "Traditional Method",
                points: [
                    { text: "Search random questions on Google", negative: true },
                    { text: "No personalized feedback", negative: true },
                    { text: "Generic study materials", negative: true },
                    { text: "No progress tracking", negative: true },
                    { text: "Expensive coaching classes ($500-2000)", negative: true }
                ],
                time: "3-6 months",
                cost: "$500-2000",
                success: "~60%"
            },
            newWay: {
                icon: Bot,
                title: "Interview AI Way",
                points: [
                    { text: "AI-generated personalized questions", positive: true },
                    { text: "Instant feedback on every answer", positive: true },
                    { text: "Adaptive learning based on your level", positive: true },
                    { text: "Real-time progress analytics", positive: true },
                    { text: "100% Free with unlimited access", positive: true }
                ],
                time: "2-4 weeks",
                cost: "FREE",
                success: "94%"
            }
        },
        {
            category: "Practice & Testing",
            oldWay: {
                icon: AlertCircle,
                title: "Old Approach",
                points: [
                    { text: "Static question banks", negative: true },
                    { text: "No adaptive difficulty", negative: true },
                    { text: "Manual answer checking", negative: true },
                    { text: "Limited test attempts", negative: true },
                    { text: "No detailed explanations", negative: true }
                ],
                time: "Hours per test",
                cost: "$50-200/month",
                success: "~65%"
            },
            newWay: {
                icon: Zap,
                title: "Interview AI Way",
                points: [
                    { text: `${stats.questionsSolved}+ AI-generated questions`, positive: true },
                    { text: "Adaptive difficulty levels", positive: true },
                    { text: "Instant AI-powered grading", positive: true },
                    { text: "Unlimited practice tests", positive: true },
                    { text: "Detailed explanations for every answer", positive: true }
                ],
                time: "Minutes per test",
                cost: "FREE",
                success: "94%"
            }
        },
        {
            category: "Learning & Support",
            oldWay: {
                icon: BookOpen,
                title: "Traditional Learning",
                points: [
                    { text: "Wait for tutor availability", negative: true },
                    { text: "Limited Q&A sessions", negative: true },
                    { text: "Scattered resources", negative: true },
                    { text: "No 24/7 support", negative: true },
                    { text: "Generic study plans", negative: true }
                ],
                time: "Days for response",
                cost: "$100-500/month",
                success: "~55%"
            },
            newWay: {
                icon: Brain,
                title: "Interview AI Way",
                points: [
                    { text: "24/7 AI chatbot assistance", positive: true },
                    { text: "Unlimited Q&A sessions", positive: true },
                    { text: "Curated resource library", positive: true },
                    { text: "Instant help anytime", positive: true },
                    { text: "Personalized study plans", positive: true }
                ],
                time: "Instant response",
                cost: "FREE",
                success: "94%"
            }
        }
    ];

    const benefits = [
        {
            icon: Clock,
            title: "Save Time",
            value: `${stats.avgTimeSaved}+ hours/week`,
            description: "Focus on learning, not searching"
        },
        {
            icon: DollarSign,
            title: "Save Money",
            value: "$1000+",
            description: "No expensive coaching needed"
        },
        {
            icon: Target,
            title: "Better Results",
            value: `${stats.successRate}%`,
            description: "Success rate of our users"
        },
        {
            icon: Users,
            title: "Join Community",
            value: `${stats.totalUsers}+`,
            description: "Active learners worldwide"
        }
    ];

    return (
        <section className="py-24 bg-gradient-to-b from-[rgb(var(--bg-body))] to-[rgb(var(--bg-elevated))] relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-[rgb(var(--accent))]/10 rounded-full blur-[120px] -z-10"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] -z-10"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[rgb(var(--text-primary))] mb-4">
                        The Old Way vs{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[rgb(var(--accent))] to-purple-500">
                            The Interview AI Way
                        </span>
                    </h2>
                    <p className="text-base sm:text-lg md:text-xl text-[rgb(var(--text-secondary))] max-w-3xl mx-auto">
                        See how Interview AI transforms your preparation journey with real data and proven results
                    </p>
                </motion.div>

                {/* Comparisons */}
                <div className="space-y-16 mb-20">
                    {comparisons.map((comparison, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            {/* Category Title */}
                            <h3 className="text-xl sm:text-2xl font-bold text-[rgb(var(--text-primary))] mb-8 text-center">
                                {comparison.category}
                            </h3>

                            <div className="grid md:grid-cols-2 gap-8">
                                {/* Old Way */}
                                <div className="relative bg-[rgb(var(--bg-card))] border-2 border-red-500/20 rounded-2xl p-4 sm:p-6 md:p-8 hover:border-red-500/40 transition-all">
                                    {/* Negative Badge */}
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-red-500/10 border border-red-500/30 rounded-full">
                                        <span className="text-sm font-semibold text-red-400">Outdated</span>
                                    </div>

                                    <div className="flex items-center gap-2 sm:gap-3 mb-6 mt-2">
                                        <div className="p-3 bg-red-500/10 rounded-xl">
                                            <comparison.oldWay.icon className="w-6 h-6 text-red-400" />
                                        </div>
                                        <h4 className="text-lg sm:text-xl font-bold text-[rgb(var(--text-primary))]">
                                            {comparison.oldWay.title}
                                        </h4>
                                    </div>

                                    <ul className="space-y-3 mb-6">
                                        {comparison.oldWay.points.map((point, i) => (
                                            <li key={i} className="flex items-start gap-3">
                                                <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                                <span className="text-[rgb(var(--text-secondary))] text-sm">
                                                    {point.text}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>

                                    {/* Stats */}
                                    <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[rgb(var(--border-subtle))]">
                                        <div>
                                            <div className="text-xs text-[rgb(var(--text-muted))] mb-1">Time</div>
                                            <div className="text-sm font-semibold text-red-400">{comparison.oldWay.time}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-[rgb(var(--text-muted))] mb-1">Cost</div>
                                            <div className="text-sm font-semibold text-red-400">{comparison.oldWay.cost}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-[rgb(var(--text-muted))] mb-1">Success</div>
                                            <div className="text-sm font-semibold text-red-400">{comparison.oldWay.success}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* New Way */}
                                <div className="relative bg-gradient-to-br from-[rgb(var(--accent))]/5 to-purple-500/5 border-2 border-[rgb(var(--accent))]/30 rounded-2xl p-4 sm:p-6 md:p-8 hover:border-[rgb(var(--accent))]/60 transition-all hover:shadow-[0_0_30px_rgba(var(--accent),0.15)]">
                                    {/* Positive Badge */}
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-[rgb(var(--accent))] rounded-full">
                                        <span className="text-sm font-semibold text-white">Modern & Smart</span>
                                    </div>

                                    <div className="flex items-center gap-2 sm:gap-3 mb-6 mt-2">
                                        <div className="p-3 bg-[rgb(var(--accent))]/10 rounded-xl">
                                            <comparison.newWay.icon className="w-6 h-6 text-[rgb(var(--accent))]" />
                                        </div>
                                        <h4 className="text-lg sm:text-xl font-bold text-[rgb(var(--text-primary))]">
                                            {comparison.newWay.title}
                                        </h4>
                                    </div>

                                    <ul className="space-y-3 mb-6">
                                        {comparison.newWay.points.map((point, i) => (
                                            <li key={i} className="flex items-start gap-3">
                                                <CheckCircle2 className="w-5 h-5 text-[rgb(var(--accent))] flex-shrink-0 mt-0.5" />
                                                <span className="text-[rgb(var(--text-primary))] text-sm font-medium">
                                                    {point.text}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>

                                    {/* Stats */}
                                    <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[rgb(var(--accent))]/20">
                                        <div>
                                            <div className="text-xs text-[rgb(var(--text-muted))] mb-1">Time</div>
                                            <div className="text-sm font-semibold text-[rgb(var(--accent))]">{comparison.newWay.time}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-[rgb(var(--text-muted))] mb-1">Cost</div>
                                            <div className="text-sm font-semibold text-[rgb(var(--accent))]">{comparison.newWay.cost}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-[rgb(var(--text-muted))] mb-1">Success</div>
                                            <div className="text-sm font-semibold text-[rgb(var(--accent))]">{comparison.newWay.success}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Benefits Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-12"
                >
                    <h3 className="text-2xl sm:text-3xl font-bold text-[rgb(var(--text-primary))] mb-8 text-center">
                        Real Results from Real Users
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        {benefits.map((benefit, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-[rgb(var(--bg-card))] border border-[rgb(var(--border))] rounded-xl p-4 sm:p-6 text-center hover:border-[rgb(var(--accent))]/50 transition-all hover:shadow-lg"
                            >
                                <div className="inline-flex p-4 bg-[rgb(var(--accent))]/10 rounded-full mb-4">
                                    <benefit.icon className="w-8 h-8 text-[rgb(var(--accent))]" />
                                </div>
                                <h4 className="text-sm font-medium text-[rgb(var(--text-secondary))] mb-2">
                                    {benefit.title}
                                </h4>
                                <div className="text-2xl sm:text-3xl font-bold text-[rgb(var(--text-primary))] mb-2">
                                    {benefit.value}
                                </div>
                                <p className="text-xs text-[rgb(var(--text-muted))]">
                                    {benefit.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center"
                >
                    <div className="inline-flex flex-col items-center gap-4 bg-gradient-to-r from-[rgb(var(--accent))]/10 to-purple-500/10 border border-[rgb(var(--accent))]/30 rounded-2xl p-6 sm:p-8 w-full max-w-4xl">
                        <div className="flex-1 text-center sm:text-left">
                            <h4 className="text-xl sm:text-2xl font-bold text-[rgb(var(--text-primary))] mb-2">
                                Ready to Transform Your Interview Prep?
                            </h4>
                            <p className="text-sm sm:text-base text-[rgb(var(--text-secondary))]">
                                Join {stats.totalUsers}+ users who are already preparing smarter, not harder.
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                if (user) {
                                    navigate('/dashboard');
                                } else {
                                    onJoin?.();
                                }
                            }}
                            className="group inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-[rgb(var(--accent))] text-white rounded-full font-bold text-base sm:text-lg hover:bg-[rgb(var(--accent-hover))] transition-all duration-300 hover:shadow-[0_0_20px_rgba(var(--accent),0.4)] whitespace-nowrap"
                        >
                            {user ? 'Go to Dashboard' : 'Start Free Now'}
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default OldVsNewWay;

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/axiosInstance';
import { Loader2, Mic, CheckCircle, Briefcase, Code, Target, Clock, Award, TrendingUp, ExternalLink, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import InterviewCreationWizard from './InterviewCreationWizard';

const MockInterviewDashboard = () => {
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchInterviews();
    }, []);

    const fetchInterviews = async () => {
        setLoading(true); // Show loading when refreshing too
        try {
            const response = await axios.get('/mock-interview/user/all');
            setInterviews(response.data);
        } catch (error) {
            console.error("Failed to fetch interviews:", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusConfig = (status) => {
        switch (status) {
            case 'completed':
                return {
                    label: 'Completed',
                    bgColor: 'bg-green-500/10',
                    textColor: 'text-green-600 dark:text-green-400',
                    borderColor: 'border-green-500/30',
                    icon: CheckCircle,
                    gradientFrom: 'from-green-500/20',
                    gradientTo: 'to-emerald-500/5'
                };
            case 'aborted':
                return {
                    label: 'Aborted',
                    bgColor: 'bg-red-500/10',
                    textColor: 'text-red-600 dark:text-red-400',
                    borderColor: 'border-red-500/30',
                    icon: null,
                    gradientFrom: 'from-red-500/20',
                    gradientTo: 'to-red-500/5'
                };
            default: // pending
                return {
                    label: 'Not Started',
                    bgColor: 'bg-blue-500/10',
                    textColor: 'text-blue-600 dark:text-blue-400',
                    borderColor: 'border-blue-500/30',
                    icon: null,
                    gradientFrom: 'from-blue-500/20',
                    gradientTo: 'to-blue-500/5'
                };
        }
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty?.toLowerCase()) {
            case 'basic':
                return 'bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/40';
            case 'intermediate':
                return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border-yellow-500/40';
            case 'advanced':
                return 'bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/40';
            default:
                return 'bg-gray-500/20 text-gray-700 dark:text-gray-300 border-gray-500/40';
        }
    };

    // Callback when wizard creates a new interview
    const handleInterviewCreated = (newInterview) => {
        fetchInterviews();
        if (newInterview && newInterview._id) {
            navigate(`/mock-interview/${newInterview._id}`);
        }
    };

    const handleDelete = async (e, mockId) => {
        e.stopPropagation(); // Prevent card click
        if (!window.confirm("Are you sure you want to delete this interview? This action cannot be undone.")) return;

        try {
            await axios.delete(`/mock-interview/${mockId}`);
            setInterviews(prev => prev.filter(i => i._id !== mockId));
        } catch (error) {
            console.error("Failed to delete interview:", error);
            // Optional: show toast error here
        }
    };

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-[calc(100vh-200px)]">
            <div className="mb-10">
                <h2 className="font-bold text-3xl text-[rgb(var(--text-primary))] mb-2">Mock Interview AI</h2>
                <p className="text-[rgb(var(--text-muted))]">Create a new interview session or continue your preparation history.</p>
            </div>

            {/* Creation Wizard */}
            <InterviewCreationWizard onInterviewCreated={handleInterviewCreated} />

            <div className="mt-12">
                <h3 className="text-xl font-bold text-[rgb(var(--text-primary))] mb-6 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-[rgb(var(--accent))]" /> Recent Interviews
                </h3>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="animate-spin w-10 h-10 text-[rgb(var(--accent))]" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
                        {interviews.length > 0 ? (
                            interviews.map((interview) => {
                                const statusConfig = getStatusConfig(interview.status);
                                const StatusIcon = statusConfig.icon;

                                return (
                                    <motion.div
                                        key={interview._id}
                                        whileHover={{ y: -6, scale: 1.01 }}
                                        className={`relative bg-gradient-to-br ${statusConfig.gradientFrom} ${statusConfig.gradientTo} backdrop-blur-sm border border-[rgb(var(--border))] rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300`}
                                    >
                                        {/* Card Content */}
                                        <div className="bg-[rgb(var(--bg-elevated))]/80 backdrop-blur-sm p-6">
                                            {/* Header */}
                                            <div className="mb-4">
                                                {/* Title row: icon + title + badge + delete */}
                                                <div className="flex items-start gap-2 mb-2">
                                                    <Briefcase className="w-5 h-5 text-[rgb(var(--accent))] mt-0.5 flex-shrink-0" />
                                                    <h3 className="font-bold text-lg text-[rgb(var(--text-primary))] leading-tight flex-1 min-w-0">
                                                        {interview.jobPosition || interview.focusArea}
                                                    </h3>
                                                    {/* Status Badge + Delete in same row as title */}
                                                    <div className="flex items-center gap-1.5 flex-shrink-0 ml-1">
                                                        {interview.status === 'completed' && (
                                                            <div className={`flex items-center gap-1 ${statusConfig.bgColor} ${statusConfig.textColor} px-2 py-1 rounded-full border ${statusConfig.borderColor} shadow-sm backdrop-blur-sm`}>
                                                                {StatusIcon && <StatusIcon className="w-3.5 h-3.5" />}
                                                                <span className="text-xs font-semibold whitespace-nowrap">{statusConfig.label}</span>
                                                            </div>
                                                        )}
                                                        <button
                                                            onClick={(e) => handleDelete(e, interview._id)}
                                                            className="p-1.5 bg-white/10 hover:bg-red-500/20 text-gray-400 hover:text-red-500 border border-transparent hover:border-red-500/30 rounded-full transition-all backdrop-blur-sm"
                                                            title="Delete Interview"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Interview Type Badge */}
                                                <div className="flex items-center gap-2 flex-wrap mt-2">
                                                    <span className="text-xs bg-[rgb(var(--accent))]/10 text-[rgb(var(--accent))] px-2.5 py-1 rounded-full border border-[rgb(var(--accent))]/20 font-medium">
                                                        {interview.interviewType || 'Technical'}
                                                    </span>
                                                    <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${getDifficultyColor(interview.difficulty)}`}>
                                                        {interview.difficulty || interview.jobExperience}
                                                    </span>
                                                </div>

                                            </div>


                                            {/* Details Grid */}
                                            <div className="space-y-3 mb-4">
                                                {/* Skills/Tech Stack */}
                                                {interview.skills && (
                                                    <div className="flex items-start gap-2">
                                                        <Code className="w-4 h-4 text-[rgb(var(--text-muted))] mt-0.5 flex-shrink-0" />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs text-[rgb(var(--text-muted))] mb-0.5">Skills</p>
                                                            <p className="text-sm text-[rgb(var(--text-primary))] font-medium truncate">
                                                                {interview.skills}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Degree */}
                                                {interview.degree && (
                                                    <div className="flex items-start gap-2">
                                                        <Award className="w-4 h-4 text-[rgb(var(--text-muted))] mt-0.5 flex-shrink-0" />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs text-[rgb(var(--text-muted))] mb-0.5">Education</p>
                                                            <p className="text-sm text-[rgb(var(--text-primary))] font-medium truncate">
                                                                {interview.degree}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Focus Area */}
                                                {interview.focusArea && (
                                                    <div className="flex items-start gap-2">
                                                        <Target className="w-4 h-4 text-[rgb(var(--text-muted))] mt-0.5 flex-shrink-0" />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs text-[rgb(var(--text-muted))] mb-0.5">Focus Area</p>
                                                            <p className="text-sm text-[rgb(var(--text-primary))] font-medium truncate">
                                                                {interview.focusArea}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Footer Info */}
                                            <div className="flex items-center justify-between pt-3 border-t border-[rgb(var(--border))]/50">
                                                <div className="flex items-center gap-1.5 text-xs text-[rgb(var(--text-muted))]">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    <span>{new Date(interview.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs font-medium text-[rgb(var(--accent))]">
                                                    <TrendingUp className="w-3.5 h-3.5" />
                                                    <span>{interview.questionCount || 5} Questions</span>
                                                </div>
                                            </div>

                                            {/* Status Badge for non-completed */}
                                            {interview.status !== 'completed' && (
                                                <div className="mt-3">
                                                    <div className={`text-center ${statusConfig.bgColor} ${statusConfig.textColor} px-3 py-1.5 rounded-lg border ${statusConfig.borderColor} text-xs font-semibold`}>
                                                        {statusConfig.label}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Score Display for Completed */}
                                            {interview.status === 'completed' && interview.overallFeedback?.score && (
                                                <div className="mt-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg p-3">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs font-medium text-green-700 dark:text-green-300">Overall Score</span>
                                                        <span className="text-lg font-bold text-green-600 dark:text-green-400">
                                                            {interview.overallFeedback.score}/100
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Action Buttons */}
                                            <div className="flex gap-3 mt-4">
                                                <button
                                                    onClick={() => navigate(`/mock-interview/${interview._id}/feedback`)}
                                                    className="flex-1 border-2 border-[rgb(var(--border))] text-[rgb(var(--text-primary))] py-2.5 rounded-lg text-sm font-semibold hover:bg-[rgb(var(--bg-elevated-alt))] hover:border-[rgb(var(--accent))]/30 transition-all"
                                                >
                                                    Feedback
                                                </button>

                                                {/* Start/Join Button - Opens Details Page */}
                                                <button
                                                    onClick={() => navigate(`/mock-interview/${interview._id}`)}
                                                    className="flex-1 flex items-center justify-center gap-2 bg-[rgb(var(--accent))] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-[rgb(var(--accent-hover))] transition-all shadow-md hover:shadow-lg"
                                                >
                                                    {interview.status === 'completed' ? 'Retake' : 'Start'} <ExternalLink className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })
                        ) : (
                            <div className="col-span-full text-center py-20 text-[rgb(var(--text-muted))]">
                                <Mic className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                <p className="text-lg font-medium">No previous interviews found.</p>
                                <p className="text-sm mt-2">Use the form above to create your first interview session!</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MockInterviewDashboard;


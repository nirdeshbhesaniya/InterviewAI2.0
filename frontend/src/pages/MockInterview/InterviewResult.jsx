import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../utils/axiosInstance';
import { Loader2, ArrowLeft, Award, Lightbulb, ChevronDown, ChevronUp, CheckCircle, XCircle, AlertCircle, TrendingUp, Target, BookOpen, Eye } from 'lucide-react';

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

    return (
        <div className="min-h-screen bg-[rgb(var(--bg-background))] p-6 md:p-10 max-w-6xl mx-auto">
            <button onClick={() => navigate('/mock-interview')} className="mb-6 flex items-center gap-2 text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-primary))] transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </button>

            <h1 className="text-3xl font-bold text-[rgb(var(--text-primary))] mb-2">Interview Feedback</h1>
            <p className="text-[rgb(var(--text-muted))] mb-8">Role: {interview.jobPosition || interview.focusArea}</p>

            {/* Check if interview is completed */}
            {!isCompleted ? (
                <div className="bg-yellow-50 dark:bg-yellow-900/10 border-2 border-yellow-200 dark:border-yellow-900/30 rounded-xl p-8 text-center">
                    <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-yellow-800 dark:text-yellow-300 mb-2">Interview Not Completed</h2>
                    <p className="text-yellow-700 dark:text-yellow-400 mb-6">
                        This interview hasn't been completed yet. Start the interview to receive detailed feedback.
                    </p>
                    <button
                        onClick={() => navigate(`/mock-interview/${mockId}/start`)}
                        className="bg-[rgb(var(--accent))] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[rgb(var(--accent-hover))] transition-all shadow-md"
                    >
                        Start Interview
                    </button>
                </div>
            ) : (
                <>
                    {/* Overall Performance Summary */}
                    <div className="bg-gradient-to-br from-[rgb(var(--bg-elevated))] to-[rgb(var(--bg-card))] border border-[rgb(var(--border))] rounded-xl p-8 mb-8 shadow-lg">
                        <div className="flex flex-col md:flex-row gap-8 items-center">
                            {/* Score Circle */}
                            <div className="relative">
                                <div className="bg-gradient-to-br from-[rgb(var(--accent))]/20 to-[rgb(var(--accent))]/5 p-8 rounded-full w-40 h-40 flex flex-col items-center justify-center border-4 border-[rgb(var(--accent))] shadow-lg">
                                    <span className="text-5xl font-bold text-[rgb(var(--accent))]">{overallFeedback?.score || 0}</span>
                                    <span className="text-sm text-[rgb(var(--text-muted))] font-medium">out of 10</span>
                                </div>
                                <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-2 rounded-full shadow-lg">
                                    <CheckCircle className="w-6 h-6" />
                                </div>
                            </div>

                            {/* Summary Content */}
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-[rgb(var(--text-primary))] flex items-center gap-2 mb-3">
                                    <Award className="w-6 h-6 text-yellow-500" /> Performance Summary
                                </h2>
                                <p className="text-[rgb(var(--text-secondary))] leading-relaxed mb-4">
                                    {overallFeedback?.summary || "Great job completing the interview! Review the detailed feedback below to understand your performance."}
                                </p>

                                {/* Performance Badge */}
                                <div className="inline-flex items-center gap-2 bg-[rgb(var(--accent))]/10 text-[rgb(var(--accent))] px-4 py-2 rounded-full border border-[rgb(var(--accent))]/20">
                                    <TrendingUp className="w-4 h-4" />
                                    <span className="text-sm font-semibold">
                                        {overallFeedback?.score >= 8 ? 'Excellent Performance' :
                                            overallFeedback?.score >= 6 ? 'Good Performance' :
                                                overallFeedback?.score >= 4 ? 'Average Performance' : 'Needs Improvement'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Behavior Analysis Section */}
                    {interview.behaviorAnalysis && (
                        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/10 dark:to-purple-900/10 border-2 border-indigo-200 dark:border-indigo-900/30 rounded-xl p-6 mb-8 shadow-md">
                            <h2 className="text-xl font-bold text-indigo-800 dark:text-indigo-300 flex items-center gap-2 mb-6">
                                <Award className="w-6 h-6" /> AI Behavioral Analysis
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                {/* Eye Contact */}
                                <div className="bg-white dark:bg-gray-800/50 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/20 shadow-sm text-center">
                                    <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-2">
                                        <Eye className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div className="text-3xl font-bold text-[rgb(var(--text-primary))]">{interview.behaviorAnalysis.eyeContact}%</div>
                                    <div className="text-sm text-[rgb(var(--text-muted))]">Eye Contact</div>
                                </div>

                                {/* Confidence */}
                                <div className="bg-white dark:bg-gray-800/50 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/20 shadow-sm text-center">
                                    <div className="mx-auto w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-2">
                                        <Award className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <div className="text-3xl font-bold text-[rgb(var(--text-primary))]">{interview.behaviorAnalysis.overallScore}/100</div>
                                    <div className="text-sm text-[rgb(var(--text-muted))]">Confidence Score</div>
                                </div>

                                {/* Engagement */}
                                <div className="bg-white dark:bg-gray-800/50 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/20 shadow-sm text-center">
                                    <div className="mx-auto w-12 h-12 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center mb-2">
                                        <Lightbulb className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                                    </div>
                                    <div className="text-3xl font-bold text-[rgb(var(--text-primary))]">{interview.behaviorAnalysis.engagementScore}%</div>
                                    <div className="text-sm text-[rgb(var(--text-muted))]">Engagement Level</div>
                                </div>
                            </div>

                            {interview.behaviorAnalysis.feedback && interview.behaviorAnalysis.feedback.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="font-semibold text-indigo-900 dark:text-indigo-200 mb-2">Behavioral Feedback:</h4>
                                    {interview.behaviorAnalysis.feedback.map((item, i) => (
                                        <div key={i} className="flex items-start gap-2 text-sm text-indigo-800 dark:text-indigo-300">
                                            <CheckCircle className="w-4 h-4 text-indigo-500 mt-0.5" />
                                            <span>{item}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Improvement Areas */}
                    {overallFeedback?.improvements && overallFeedback.improvements.length > 0 && (
                        <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/10 dark:to-red-900/10 border-2 border-orange-200 dark:border-orange-900/30 rounded-xl p-6 mb-8 shadow-md">
                            <h3 className="text-xl font-bold text-orange-800 dark:text-orange-300 flex items-center gap-2 mb-4">
                                <Lightbulb className="w-6 h-6" /> Areas for Improvement & Tips
                            </h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                {overallFeedback.improvements.map((imp, idx) => (
                                    <div key={idx} className="bg-white dark:bg-gray-800/50 p-4 rounded-lg border border-orange-200 dark:border-orange-900/30 shadow-sm">
                                        <div className="flex items-start gap-3">
                                            <div className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold text-sm">
                                                {idx + 1}
                                            </div>
                                            <p className="text-sm text-orange-900 dark:text-orange-200 leading-relaxed">{imp}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Detailed Question Analysis */}
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-[rgb(var(--text-primary))] flex items-center gap-2 mb-4">
                            <Target className="w-6 h-6 text-[rgb(var(--accent))]" /> Question-by-Question Analysis
                        </h2>
                        <p className="text-[rgb(var(--text-muted))] mb-6">Expand each question to see the reference answer and detailed feedback</p>
                    </div>

                    <div className="space-y-4">
                        {interview.mockInterviewResult.map((q, idx) => (
                            <CollapsibleQuestion key={idx} questionData={q} index={idx + 1} />
                        ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => navigate(`/mock-interview/${mockId}/start`)}
                            className="bg-[rgb(var(--accent))] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[rgb(var(--accent-hover))] transition-all shadow-md"
                        >
                            Retake Interview
                        </button>
                        <button
                            onClick={() => navigate('/mock-interview/create')}
                            className="border-2 border-[rgb(var(--border))] text-[rgb(var(--text-primary))] px-6 py-3 rounded-lg font-semibold hover:bg-[rgb(var(--bg-elevated-alt))] transition-all"
                        >
                            Create New Interview
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

const CollapsibleQuestion = ({ questionData, index }) => {
    const [isOpen, setIsOpen] = useState(false);

    // Determine color based on rating
    let ratingColor = 'text-gray-500';
    let ratingBg = 'bg-gray-100 dark:bg-gray-800';
    let ratingIcon = AlertCircle;

    if (questionData.rating >= 8) {
        ratingColor = 'text-green-600 dark:text-green-400';
        ratingBg = 'bg-green-100 dark:bg-green-900/30';
        ratingIcon = CheckCircle;
    } else if (questionData.rating >= 5) {
        ratingColor = 'text-yellow-600 dark:text-yellow-400';
        ratingBg = 'bg-yellow-100 dark:bg-yellow-900/30';
        ratingIcon = AlertCircle;
    } else if (questionData.rating > 0) {
        ratingColor = 'text-red-600 dark:text-red-400';
        ratingBg = 'bg-red-100 dark:bg-red-900/30';
        ratingIcon = XCircle;
    }

    const RatingIcon = ratingIcon;

    return (
        <div className="bg-[rgb(var(--bg-elevated))] border-2 border-[rgb(var(--border))] rounded-xl overflow-hidden transition-all shadow-sm hover:shadow-md">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-5 text-left hover:bg-[rgb(var(--bg-elevated-alt))] transition-colors"
            >
                <div className="flex-1 pr-4">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[rgb(var(--text-muted))] text-xs uppercase tracking-wide font-bold bg-[rgb(var(--bg-card))] px-2 py-1 rounded">
                            Question {index}
                        </span>
                        {questionData.rating > 0 && (
                            <div className={`flex items-center gap-1 ${ratingBg} px-2 py-1 rounded`}>
                                <RatingIcon className={`w-3.5 h-3.5 ${ratingColor}`} />
                                <span className={`font-bold text-sm ${ratingColor}`}>{questionData.rating}/10</span>
                            </div>
                        )}
                    </div>
                    <p className="text-[rgb(var(--text-primary))] font-medium">{questionData.question}</p>
                </div>
                {isOpen ? <ChevronUp className="w-5 h-5 text-[rgb(var(--text-muted))]" /> : <ChevronDown className="w-5 h-5 text-[rgb(var(--text-muted))]" />}
            </button>

            {isOpen && (
                <div className="p-5 border-t-2 border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated-alt))]/30 space-y-4">
                    {/* Reference Answer */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 p-4 rounded-lg border-2 border-blue-200 dark:border-blue-900/30 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                            <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <strong className="text-sm font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wide">
                                Reference Answer
                            </strong>
                        </div>
                        <p className="text-sm text-blue-900 dark:text-blue-200 leading-relaxed">
                            {questionData.correctAnswer}
                        </p>
                    </div>

                    {/* AI Feedback */}
                    {questionData.feedback && (
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 p-4 rounded-lg border-2 border-purple-200 dark:border-purple-900/30 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <Lightbulb className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                <strong className="text-sm font-bold text-purple-800 dark:text-purple-300 uppercase tracking-wide">
                                    AI Feedback & Tips
                                </strong>
                            </div>
                            <p className="text-sm text-purple-900 dark:text-purple-200 leading-relaxed">
                                {questionData.feedback}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default InterviewResult;

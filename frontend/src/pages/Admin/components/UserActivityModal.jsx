import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Activity, User, BookOpen, PenSquare, FileText, FileQuestion, Calendar, Bot, Sparkles } from 'lucide-react';
import { AILoaderIcon as Loader2 } from '@/components/ui/Loader';
import axios from '../../../utils/axiosInstance';
import { API } from '../../../utils/apiPaths';
import toast from 'react-hot-toast';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const StatCard = ({ title, value, icon: Icon, color, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="bg-[rgb(var(--bg-elevated))] p-4 sm:p-5 rounded-2xl border border-[rgb(var(--border))] flex items-center gap-4 hover:shadow-md transition-all"
    >
        <div className={`p-3 rounded-xl ${color} shrink-0`}>
            <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div className="min-w-0">
            <p className="text-[10px] sm:text-xs font-bold text-[rgb(var(--text-muted))] uppercase tracking-wider truncate">{title}</p>
            <h3 className="text-xl sm:text-2xl font-black text-[rgb(var(--text-primary))] truncate">{value}</h3>
        </div>
    </motion.div>
);

const UserActivityModal = ({ isOpen, onClose, userId }) => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    useEffect(() => {
        if (isOpen && userId) {
            fetchActivity();
        }
    }, [isOpen, userId]);

    const fetchActivity = async () => {
        try {
            setLoading(true);
            const res = await axios.get(API.ADMIN.GET_USER_ACTIVITY(userId));
            setData(res.data);
        } catch (error) {
            console.error('Error fetching user activity:', error);
            toast.error('Failed to load user activity data');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <AnimatePresence>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-5xl max-h-[85vh] sm:max-h-[90vh] bg-[rgb(var(--bg-card))] rounded-3xl shadow-2xl border border-[rgb(var(--border))] flex flex-col overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex-none p-6 sm:p-8 border-b border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated))] flex justify-between items-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
                        <div className="relative z-10 flex items-center gap-3 sm:gap-4 w-full pr-8">
                            <div className="p-2 sm:p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl shadow-lg text-white shrink-0">
                                <Activity className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h2 className="text-lg sm:text-2xl font-black text-[rgb(var(--text-primary))] flex items-center gap-2 truncate">
                                    Activity Dashboard
                                </h2>
                                <p className="text-xs sm:text-sm font-medium text-[rgb(var(--text-secondary))] flex items-center gap-1.5 mt-0.5 sm:mt-1 truncate">
                                    <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                                    <span className="truncate">{data?.user?.fullName || 'Loading...'}</span> 
                                    <span className="text-[rgb(var(--text-muted))] truncate hidden sm:inline">({data?.user?.email})</span>
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 z-10 p-2 rounded-full bg-[rgb(var(--bg-body))] border border-[rgb(var(--border))] text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--bg-elevated-alt))] transition-all"
                        >
                            <X className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 sm:p-8">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-64">
                                <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mb-4" />
                                <p className="text-[rgb(var(--text-muted))] font-medium">Aggregating user analytics...</p>
                            </div>
                        ) : data ? (
                            <div className="space-y-8">
                                {/* Stats Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <StatCard 
                                        title="Q&A Sessions" 
                                        value={data.stats.interviewsCount} 
                                        icon={FileText} 
                                        color="bg-blue-500/10 text-blue-500" 
                                        delay={0.1} 
                                    />
                                    <StatCard 
                                        title="AI Mock Interviews" 
                                        value={data.stats.aiInterviewsCount} 
                                        icon={Bot} 
                                        color="bg-indigo-500/10 text-indigo-500" 
                                        delay={0.15} 
                                    />
                                    <StatCard 
                                        title="Practice Tests" 
                                        value={data.stats.testsCount} 
                                        icon={FileQuestion} 
                                        color="bg-purple-500/10 text-purple-500" 
                                        delay={0.2} 
                                    />
                                    <StatCard 
                                        title="AI MCQ Tests" 
                                        value={data.stats.aiMcqTestsCount} 
                                        icon={Sparkles} 
                                        color="bg-fuchsia-500/10 text-fuchsia-500" 
                                        delay={0.25} 
                                    />
                                    <StatCard 
                                        title="Roadmaps Active" 
                                        value={data.stats.roadmapsCount} 
                                        icon={BookOpen} 
                                        color="bg-green-500/10 text-green-500" 
                                        delay={0.3} 
                                    />
                                    <StatCard 
                                        title="Notes & Resources" 
                                        value={data.stats.notesCount + data.stats.resourcesCount} 
                                        icon={PenSquare} 
                                        color="bg-orange-500/10 text-orange-500" 
                                        delay={0.4} 
                                    />
                                </div>

                                {/* Graphical View */}
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="bg-[rgb(var(--bg-elevated))] p-6 rounded-2xl border border-[rgb(var(--border))] shadow-sm"
                                >
                                    <div className="flex items-center gap-2 mb-6">
                                        <Calendar className="w-5 h-5 text-[rgb(var(--text-muted))]" />
                                        <h3 className="text-lg font-bold text-[rgb(var(--text-primary))]">6-Month Activity Trend</h3>
                                    </div>
                                    
                                    <div className="h-64 sm:h-72 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart
                                                data={data.timeline}
                                                margin={{ top: 10, right: 10, left: -25, bottom: 25 }}
                                            >
                                                <defs>
                                                    <linearGradient id="colorInterviews" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                    </linearGradient>
                                                    <linearGradient id="colorAiInterviews" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                                    </linearGradient>
                                                    <linearGradient id="colorTests" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                                    </linearGradient>
                                                    <linearGradient id="colorAiTests" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#d946ef" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#d946ef" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" vertical={false} />
                                                <XAxis 
                                                    dataKey="month" 
                                                    stroke="rgb(var(--text-muted))" 
                                                    fontSize={12} 
                                                    tickLine={false} 
                                                    axisLine={false}
                                                    tickFormatter={(tick) => {
                                                        const [year, month] = tick.split('-');
                                                        const date = new Date(year, month - 1);
                                                        // Use shorter month names on mobile if necessary
                                                        return window.innerWidth < 640 
                                                            ? date.toLocaleString('default', { month: 'narrow' }) 
                                                            : date.toLocaleString('default', { month: 'short' });
                                                    }}
                                                />
                                                <YAxis stroke="rgb(var(--text-muted))" fontSize={window.innerWidth < 640 ? 10 : 12} tickLine={false} axisLine={false} allowDecimals={false} />
                                                <Tooltip 
                                                    contentStyle={{ 
                                                        backgroundColor: 'rgb(var(--bg-card))', 
                                                        borderColor: 'rgb(var(--border))',
                                                        borderRadius: '12px',
                                                        color: 'rgb(var(--text-primary))'
                                                    }} 
                                                    itemStyle={{ color: 'rgb(var(--text-primary))' }}
                                                />
                                                <Legend 
                                                    iconType="circle" 
                                                    wrapperStyle={{ 
                                                        fontSize: window.innerWidth < 640 ? '10px' : '12px', 
                                                        color: 'rgb(var(--text-muted))',
                                                        paddingTop: '10px'
                                                    }} 
                                                />
                                                <Area 
                                                    type="monotone" 
                                                    name="Q&A Sessions" 
                                                    dataKey="interviews" 
                                                    stroke="#3b82f6" 
                                                    strokeWidth={3} 
                                                    fillOpacity={1} 
                                                    fill="url(#colorInterviews)" 
                                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                                />
                                                <Area 
                                                    type="monotone" 
                                                    name="AI Mock Interviews" 
                                                    dataKey="aiInterviews" 
                                                    stroke="#6366f1" 
                                                    strokeWidth={3} 
                                                    fillOpacity={1} 
                                                    fill="url(#colorAiInterviews)" 
                                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                                />
                                                <Area 
                                                    type="monotone" 
                                                    name="Practice Tests" 
                                                    dataKey="tests" 
                                                    stroke="#8b5cf6" 
                                                    strokeWidth={3} 
                                                    fillOpacity={1} 
                                                    fill="url(#colorTests)" 
                                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                                />
                                                <Area 
                                                    type="monotone" 
                                                    name="AI MCQ Tests" 
                                                    dataKey="aiTests" 
                                                    stroke="#d946ef" 
                                                    strokeWidth={3} 
                                                    fillOpacity={1} 
                                                    fill="url(#colorAiTests)" 
                                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </motion.div>
                            </div>
                        ) : (
                            <div className="py-12 text-center text-red-500">
                                Failed to load activity data.
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>,
        document.body
    );
};

export default UserActivityModal;

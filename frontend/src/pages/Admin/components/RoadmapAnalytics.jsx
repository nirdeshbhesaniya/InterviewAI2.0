import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Map, BarChart3, Users, Clock, CheckCircle2, X, Search, Loader2, Filter } from 'lucide-react';
import { ROADMAPS, countTotalTopics, getEffectiveCompletedTopics } from '../../Roadmaps/data/roadmapsData';
import { BRANCHES } from '../../../utils/constants';
import axiosInstance from '../../../utils/axiosInstance';
import toast from 'react-hot-toast';

const RoadmapAnalytics = () => {
    const [selectedRoadmap, setSelectedRoadmap] = useState(null);
    const [analyticsData, setAnalyticsData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const [roadmapSearchQuery, setRoadmapSearchQuery] = useState('');
    const [selectedBranch, setSelectedBranch] = useState('all');

    // Filter roadmaps by branch and search query
    const filteredRoadmaps = ROADMAPS.filter(roadmap => {
        const matchesSearch = roadmap.title.toLowerCase().includes(roadmapSearchQuery.toLowerCase()) || 
                              (roadmap.description && roadmap.description.toLowerCase().includes(roadmapSearchQuery.toLowerCase()));
        
        let matchesBranch = true;
        if (selectedBranch !== 'all') {
            if (selectedBranch === 'computer') {
                matchesBranch = !roadmap.branch || roadmap.branch === 'computer' || roadmap.branch === 'it' || roadmap.branch === 'cs-ds';
            } else {
                matchesBranch = roadmap.branch === selectedBranch;
            }
        }
        
        return matchesSearch && matchesBranch;
    });

    // Group filtered roadmaps by category
    const groupedRoadmaps = filteredRoadmaps.reduce((acc, roadmap) => {
        const cat = roadmap.category || 'other';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(roadmap);
        return acc;
    }, {});

    const fetchAnalytics = async (roadmap) => {
        setSelectedRoadmap(roadmap);
        setIsLoading(true);
        try {
            const res = await axiosInstance.get(`/admin/roadmaps/${roadmap.id}/analytics`);
            if (res.data.success) {
                setAnalyticsData(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching analytics:', error);
            toast.error('Failed to load roadmap analytics');
        } finally {
            setIsLoading(false);
        }
    };

    const getModuleTitle = (roadmap, moduleId) => {
        for (const phase of roadmap.phases) {
            for (const stage of phase.stages) {
                if (stage.id === moduleId) {
                    return stage.title;
                }
            }
        }
        return 'Unknown Module';
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-[rgb(var(--text-primary))] flex items-center gap-2">
                        <Map className="w-6 h-6 text-indigo-500" />
                        Roadmap Analytics
                    </h2>
                    <p className="text-sm text-[rgb(var(--text-muted))] mt-1">Track user progress across all learning paths</p>
                </div>
            </div>

            {/* Filter & Search Bar for Roadmaps Grid */}
            {!selectedRoadmap && (
                <div className="flex flex-col sm:flex-row gap-4 bg-[rgb(var(--bg-elevated))] p-4 rounded-2xl border border-[rgb(var(--border))]">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--text-muted))]" />
                        <input
                            type="text"
                            placeholder="Search roadmaps by title or description..."
                            value={roadmapSearchQuery}
                            onChange={(e) => setRoadmapSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-[rgb(var(--bg-body))] border border-[rgb(var(--border))] rounded-xl text-sm text-[rgb(var(--text-primary))] focus:border-[rgb(var(--accent))] focus:outline-none transition-colors"
                        />
                    </div>
                    <div className="relative w-full sm:w-64 flex-shrink-0">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--text-muted))]" />
                        <select
                            value={selectedBranch}
                            onChange={(e) => setSelectedBranch(e.target.value)}
                            className="w-full pl-9 pr-10 py-2 bg-[rgb(var(--bg-body))] border border-[rgb(var(--border))] rounded-xl text-sm text-[rgb(var(--text-primary))] focus:border-[rgb(var(--accent))] focus:outline-none transition-colors appearance-none cursor-pointer"
                        >
                            <option value="all">All Branches</option>
                            {BRANCHES.map(branch => (
                                <option key={branch.id} value={branch.id}>
                                    {branch.name}
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[rgb(var(--text-muted))]">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>
                </div>
            )}

            <AnimatePresence mode="wait">
                {!selectedRoadmap ? (
                    <motion.div
                        key="grid"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-8"
                    >
                        {Object.entries(groupedRoadmaps).map(([category, roadmaps]) => (
                            <div key={category}>
                                <h3 className="text-lg font-bold text-[rgb(var(--text-primary))] capitalize mb-4 border-b border-[rgb(var(--border))] pb-2">
                                    {category.replace('-', ' & ')}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {roadmaps.map(roadmap => (
                                        <div 
                                            key={roadmap.id}
                                            className="bg-[rgb(var(--bg-body))] border border-[rgb(var(--border))] rounded-2xl p-5 flex flex-col justify-between hover:border-[rgb(var(--accent))]/50 transition-colors shadow-sm"
                                        >
                                            <div>
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${roadmap.gradient} flex items-center justify-center shadow-md`}>
                                                        <Map className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-[rgb(var(--text-primary))] line-clamp-1" title={roadmap.title}>
                                                            {roadmap.title}
                                                        </h4>
                                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roadmap.difficultyColor}`}>
                                                            {roadmap.difficulty}
                                                        </span>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-[rgb(var(--text-muted))] line-clamp-2 mb-4">
                                                    {roadmap.description}
                                                </p>
                                            </div>
                                            
                                            <button
                                                onClick={() => fetchAnalytics(roadmap)}
                                                className="w-full flex items-center justify-center gap-2 py-2.5 bg-[rgb(var(--bg-elevated))] hover:bg-[rgb(var(--accent))]/10 border border-[rgb(var(--border))] hover:border-[rgb(var(--accent))]/30 text-[rgb(var(--text-primary))] hover:text-[rgb(var(--accent))] rounded-xl font-medium transition-all text-sm"
                                            >
                                                <BarChart3 className="w-4 h-4" />
                                                View Analytics
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </motion.div>
                ) : (
                    <motion.div
                        key="analytics"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="bg-[rgb(var(--bg-body))] rounded-2xl border border-[rgb(var(--border))] overflow-hidden shadow-sm"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-[rgb(var(--border))] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div>
                                <button
                                    onClick={() => setSelectedRoadmap(null)}
                                    className="text-sm text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-primary))] mb-2 flex items-center gap-1 transition-colors"
                                >
                                    ← Back to Roadmaps
                                </button>
                                <h3 className="text-xl font-bold text-[rgb(var(--text-primary))] flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${selectedRoadmap.gradient} flex items-center justify-center`}>
                                        <Map className="w-4 h-4 text-white" />
                                    </div>
                                    {selectedRoadmap.title} Analytics
                                </h3>
                            </div>
                            
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--text-muted))]" />
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border))] rounded-xl text-sm text-[rgb(var(--text-primary))] focus:border-[rgb(var(--accent))] focus:outline-none transition-colors"
                                />
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-0">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center py-20">
                                    <Loader2 className="w-8 h-8 text-[rgb(var(--accent))] animate-spin mb-4" />
                                    <p className="text-[rgb(var(--text-muted))]">Loading analytics data...</p>
                                </div>
                            ) : analyticsData.length === 0 ? (
                                <div className="text-center py-20 px-4">
                                    <div className="w-16 h-16 bg-[rgb(var(--bg-elevated))] rounded-full flex items-center justify-center mx-auto mb-4 border border-[rgb(var(--border))]">
                                        <Users className="w-8 h-8 text-[rgb(var(--text-muted))]" />
                                    </div>
                                    <h4 className="text-lg font-bold text-[rgb(var(--text-primary))] mb-1">No Active Users</h4>
                                    <p className="text-[rgb(var(--text-secondary))]">No users have started this roadmap yet.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-[rgb(var(--bg-elevated))] text-[rgb(var(--text-muted))] uppercase text-xs">
                                            <tr>
                                                <th className="px-6 py-4 font-semibold">User</th>
                                                <th className="px-6 py-4 font-semibold">Progress</th>
                                                <th className="px-6 py-4 font-semibold">Last Cleared Module</th>
                                                <th className="px-6 py-4 font-semibold">Last Updated</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[rgb(var(--border))] text-[rgb(var(--text-primary))]">
                                            {analyticsData
                                                .filter(data => 
                                                    !searchQuery || 
                                                    data.userId?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                                    data.userId?.email?.toLowerCase().includes(searchQuery.toLowerCase())
                                                )
                                                .map((data) => {
                                                    const totalTopics = countTotalTopics(selectedRoadmap);
                                                    const effectiveTopics = getEffectiveCompletedTopics(selectedRoadmap, data.completedTopics, data.clearedModules);
                                                    const completedCount = effectiveTopics.length;
                                                    const progressPct = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;
                                                    
                                                    const lastModuleId = data.clearedModules && data.clearedModules.length > 0 
                                                        ? data.clearedModules[data.clearedModules.length - 1] 
                                                        : null;
                                                    
                                                    const lastModuleTitle = lastModuleId 
                                                        ? getModuleTitle(selectedRoadmap, lastModuleId) 
                                                        : 'None';

                                                    return (
                                                        <tr key={data._id} className="hover:bg-[rgb(var(--bg-elevated))]/50 transition-colors">
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8 rounded-full bg-[rgb(var(--accent))]/10 text-[rgb(var(--accent))] flex items-center justify-center font-bold text-xs uppercase flex-shrink-0">
                                                                        {data.userId?.fullName?.charAt(0) || '?'}
                                                                    </div>
                                                                    <div>
                                                                        <div className="font-semibold text-[rgb(var(--text-primary))]">
                                                                            {data.userId?.fullName || 'Unknown User'}
                                                                        </div>
                                                                        <div className="text-xs text-[rgb(var(--text-muted))]">
                                                                            {data.userId?.email || 'No email'}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="flex-1 h-2 bg-[rgb(var(--border))] rounded-full overflow-hidden max-w-[100px]">
                                                                        <div 
                                                                            className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" 
                                                                            style={{ width: `${progressPct}%` }}
                                                                        />
                                                                    </div>
                                                                    <span className="font-semibold text-[rgb(var(--text-secondary))] w-10">
                                                                        {progressPct}%
                                                                    </span>
                                                                </div>
                                                                <div className="text-[10px] text-[rgb(var(--text-muted))] mt-1">
                                                                    {completedCount} / {totalTopics} topics
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-2">
                                                                    {lastModuleId ? (
                                                                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                                                                    ) : (
                                                                        <div className="w-4 h-4 rounded-full border border-[rgb(var(--text-muted))] border-dashed flex-shrink-0" />
                                                                    )}
                                                                    <span className={`text-sm ${lastModuleId ? 'font-medium' : 'text-[rgb(var(--text-muted))]'}`}>
                                                                        {lastModuleTitle}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-2 text-[rgb(var(--text-secondary))]">
                                                                    <Clock className="w-4 h-4 text-[rgb(var(--text-muted))]" />
                                                                    {new Date(data.lastUpdated).toLocaleDateString('en-US', {
                                                                        year: 'numeric',
                                                                        month: 'short',
                                                                        day: 'numeric'
                                                                    })}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default RoadmapAnalytics;

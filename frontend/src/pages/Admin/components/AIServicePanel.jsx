import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity,
    Shield,
    ShieldAlert,
    ShieldCheck,
    Lock,
    Unlock,
    Server,
    Cpu,
    RefreshCw,
    AlertTriangle,
    BarChart3,
    Clock,
    Zap,
    ToggleLeft,
    ToggleRight,
    Settings2
} from 'lucide-react';
import axios from '../../../utils/axiosInstance';
import toast from 'react-hot-toast';
import { Button } from '../../../components/ui/button';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

const API_PATH = {
    DASHBOARD: '/ai/dashboard',
    CONTROL: '/ai/control',
    LOGS: '/ai/logs',
    FEATURES: '/ai/features',
    TOGGLE_FEATURE: '/ai/features/toggle'
};

const AIServicePanel = ({ currentUserRole }) => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [logs, setLogs] = useState([]);
    const [features, setFeatures] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    // Logs State
    const [logFilters, setLogFilters] = useState({ search: '', provider: 'all', status: 'all' });
    const [logPagination, setLogPagination] = useState({ page: 1, limit: 10, totalPages: 1, totalCount: 0 });
    const searchTimeoutRef = useRef(null);

    useEffect(() => {
        fetchData();
    }, []);

    // Effect to refetch logs when page changes
    // We intentionally don't put logFilters in dependency array to avoid double fetch with debounce
    // handled in the change handler or separate effect
    useEffect(() => {
        fetchLogs(logPagination.page, logFilters);
    }, [logPagination.page]);

    const fetchData = async () => {
        setRefreshing(true);
        try {
            const [statsRes, featuresRes] = await Promise.all([
                axios.get(API_PATH.DASHBOARD),
                axios.get(API_PATH.FEATURES)
            ]);
            setStats(statsRes.data);
            setFeatures(featuresRes.data.features);

            // Initial logs fetch is handled by the useEffect above or explicit call
            await fetchLogs(logPagination.page, logFilters);

        } catch (error) {
            console.error('Failed to fetch AI stats:', error);
            toast.error('Failed to load AI dashboard data');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const fetchLogs = async (page, filters) => {
        try {
            const query = new URLSearchParams({
                page,
                limit: logPagination.limit,
                search: filters.search,
                provider: filters.provider,
                status: filters.status
            }).toString();

            const res = await axios.get(`${API_PATH.LOGS}?${query}`);
            if (res.data.status === 'success') {
                setLogs(res.data.logs);
                if (res.data.pagination) {
                    setLogPagination(prev => ({
                        ...prev,
                        page: res.data.pagination.page,
                        totalPages: res.data.pagination.totalPages,
                        totalCount: res.data.pagination.totalCount
                    }));
                }
            }
        } catch (error) {
            console.error('Failed to fetch logs:', error);
            toast.error('Failed to load transaction logs');
        }
    };

    const handleLogFilterChange = (key, value) => {
        const newFilters = { ...logFilters, [key]: value };
        setLogFilters(newFilters);
        // Reset to page 1 and fetch immediately (debouncing can be added for search if needed)
        // For search, we might want a small delay, but for dropdowns immediate is fine.
        if (key === 'search') {
            // Simple debounce could be done here or use a useEffect
            // For now, let's just fetch (or use a timeout ref if we wanted strict debounce)
            // To prevent UI lag, typically we set state then fetch.
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
            searchTimeoutRef.current = setTimeout(() => {
                setLogPagination(prev => ({ ...prev, page: 1 }));
                fetchLogs(1, newFilters);
            }, 500);
        } else {
            setLogPagination(prev => ({ ...prev, page: 1 }));
            fetchLogs(1, newFilters);
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= logPagination.totalPages) {
            setLogPagination(prev => ({ ...prev, page: newPage }));
            // useEffect will trigger fetch
        }
    };

    const handleKeyControl = async (key, action) => {
        if (currentUserRole !== 'owner') {
            toast.error('Only the Owner can manage API keys.');
            return;
        }

        const confirmMsg = action === 'lock'
            ? 'Are you sure you want to LOCK this key? It will not be used for any requests.'
            : 'Are you sure you want to UNLOCK this key? It will be immediately available for rotation.';

        if (!window.confirm(confirmMsg)) return;

        try {
            const res = await axios.post(API_PATH.CONTROL, {
                action,
                key, // Send the full key if available, or identification.
                provider: 'openRouter'
            });

            toast.success(res.data.message);
            // Update local state with new status
            if (stats && stats.systemStatus && stats.systemStatus.openRouter) {
                const updatedKeys = stats.systemStatus.openRouter.keys.map(k => {
                    if (k.fullKey === key) {
                        return { ...k, isManuallyDisabled: action === 'lock' };
                    }
                    return k;
                });
                setStats({
                    ...stats,
                    systemStatus: {
                        ...stats.systemStatus,
                        openRouter: {
                            ...stats.systemStatus.openRouter,
                            keys: updatedKeys
                        }
                    }
                });
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Action failed');
        }
    };

    const handleFeatureToggle = async (key, currentStatus) => {
        if (currentUserRole !== 'owner') {
            toast.error('Only the Owner can toggle features.');
            return;
        }

        try {
            const res = await axios.post(API_PATH.TOGGLE_FEATURE, {
                key,
                isEnabled: !currentStatus
            });

            toast.success(res.data.message);

            // Update local features state
            setFeatures(features.map(f =>
                f.key === key ? { ...f, isEnabled: !currentStatus } : f
            ));

        } catch (error) {
            console.error('Feature toggle error:', error);
            toast.error(error.response?.data?.message || 'Failed to toggle feature');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center gap-2">
                    <RefreshCw className="w-8 h-8 text-[rgb(var(--accent))] animate-spin" />
                    <span className="text-sm text-[rgb(var(--text-muted))]">Loading AI Status...</span>
                </div>
            </div>
        );
    }

    if (!stats) return null;

    const { systemStatus, usageStats, todayTotals } = stats;

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            {/* Header / Refresh */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-[rgb(var(--text-primary))] flex items-center gap-2">
                        <Cpu className="w-6 h-6 text-[rgb(var(--accent))]" />
                        AI Service Status
                    </h2>
                    <p className="text-sm text-[rgb(var(--text-secondary))]">Real-time monitoring and control of AI providers</p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchData}
                    disabled={refreshing}
                    className="gap-2"
                >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* Feature Controls (Owner) */}
            <div className="bg-[rgb(var(--bg-card))] rounded-2xl border border-[rgb(var(--border))] shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated))] flex justify-between items-center">
                    <h3 className="font-semibold text-[rgb(var(--text-primary))] flex items-center gap-2">
                        <Settings2 className="w-5 h-5 text-[rgb(var(--accent))]" />
                        Feature Controls
                    </h3>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {features.map((feature) => (
                        <div key={feature.key} className="flex items-center justify-between p-4 rounded-xl bg-[rgb(var(--bg-elevated))]/30 border border-[rgb(var(--border))]">
                            <div>
                                <h4 className="font-medium text-[rgb(var(--text-primary))]">{feature.label}</h4>
                                <p className="text-xs text-[rgb(var(--text-muted))] mt-1">
                                    {feature.isEnabled ? 'Active' : 'Disabled'}
                                </p>
                            </div>
                            {currentUserRole === 'owner' ? (
                                <button
                                    onClick={() => handleFeatureToggle(feature.key, feature.isEnabled)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))] focus:ring-offset-2 ${feature.isEnabled ? 'bg-green-500' : 'bg-gray-500'
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${feature.isEnabled ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                            ) : (
                                <div className={`px-2 py-1 rounded text-xs font-medium ${feature.isEnabled ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500'
                                    }`}>
                                    {feature.isEnabled ? 'ON' : 'OFF'}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Status Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* OpenRouter Status */}
                <div className="bg-[rgb(var(--bg-card))] p-5 rounded-2xl border border-[rgb(var(--border))] shadow-sm relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-sm font-medium text-[rgb(var(--text-muted))]">OpenRouter Health</p>
                            <h3 className="text-2xl font-bold text-[rgb(var(--text-primary))] mt-1">
                                {systemStatus.openRouter.activeKeys} / {systemStatus.openRouter.totalKeys}
                            </h3>
                            <p className="text-xs text-[rgb(var(--text-secondary))] mt-1">Active Keys</p>
                        </div>
                        <div className={`p-2 rounded-lg ${systemStatus.openRouter.activeKeys > 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                            <Activity className="w-5 h-5" />
                        </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-[rgb(var(--bg-elevated))] rounded-full overflow-hidden">
                        <div
                            className="h-full bg-green-500 transition-all duration-500"
                            style={{ width: `${(systemStatus.openRouter.activeKeys / systemStatus.openRouter.totalKeys) * 100}%` }}
                        />
                    </div>
                </div>

                {/* OpenAI Status */}
                <div className="bg-[rgb(var(--bg-card))] p-5 rounded-2xl border border-[rgb(var(--border))] shadow-sm relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-sm font-medium text-[rgb(var(--text-muted))]">OpenAI Health</p>
                            <h3 className="text-2xl font-bold text-[rgb(var(--text-primary))] mt-1">
                                {systemStatus.openAI.available ? 'Active' : 'Inactive'}
                            </h3>
                            <p className="text-xs text-[rgb(var(--text-secondary))] mt-1">
                                {systemStatus.openAI.keyMasked}
                            </p>
                        </div>
                        <div className={`p-2 rounded-lg ${systemStatus.openAI.available ? 'bg-sky-500/10 text-sky-500' : 'bg-gray-500/10 text-gray-500'}`}>
                            <Activity className="w-5 h-5" />
                        </div>
                    </div>
                    {/* Status Bar */}
                    <div className="w-full h-1.5 bg-[rgb(var(--bg-elevated))] rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all duration-500 ${systemStatus.openAI.available ? 'bg-sky-500 w-full' : 'bg-gray-500 w-0'}`}
                        />
                    </div>
                </div>



                {/* Usage Today */}
                <div className="bg-[rgb(var(--bg-card))] p-5 rounded-2xl border border-[rgb(var(--border))] shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <p className="text-sm font-medium text-[rgb(var(--text-muted))]">Usage (Today)</p>
                            <h3 className="text-2xl font-bold text-[rgb(var(--text-primary))] mt-1">
                                {todayTotals.totalRequests}
                            </h3>
                        </div>
                        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                            <Zap className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1 text-xs mt-3">
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-purple-500" />
                            <span className="text-[rgb(var(--text-secondary))]">OpenRouter: {todayTotals.totalOpenRouter}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-sky-500" />
                            <span className="text-[rgb(var(--text-secondary))]">OpenAI: {todayTotals.totalOpenAI}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="bg-[rgb(var(--bg-card))] p-6 rounded-2xl border border-[rgb(var(--border))] shadow-sm">
                <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))] mb-6 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-[rgb(var(--text-muted))]" />
                    Usage Trends (Last 7 Days)
                </h3>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={usageStats} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgb(var(--border))" />
                            <XAxis
                                dataKey="date"
                                tickLine={false}
                                axisLine={false}
                                tick={{ fill: 'rgb(var(--text-muted))', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tick={{ fill: 'rgb(var(--text-muted))', fontSize: 12 }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgb(var(--bg-elevated))',
                                    border: '1px solid rgb(var(--border))',
                                    borderRadius: '12px',
                                    color: 'rgb(var(--text-primary))'
                                }}
                                cursor={{ stroke: 'rgb(var(--border))', strokeWidth: 2 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="openRouter"
                                name="OpenRouter"
                                stroke="#a855f7"
                                strokeWidth={3}
                                dot={{ fill: '#a855f7', strokeWidth: 2 }}
                                activeDot={{ r: 6, strokeWidth: 0 }}
                            />

                            <Line
                                type="monotone"
                                dataKey="openai"
                                name="OpenAI"
                                stroke="#0ea5e9"
                                strokeWidth={3}
                                dot={{ fill: '#0ea5e9', strokeWidth: 2 }}
                                activeDot={{ r: 6, strokeWidth: 0 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Keys Management - OpenRouter */}
            <div className="bg-[rgb(var(--bg-card))] rounded-2xl border border-[rgb(var(--border))] shadow-sm overflow-hidden mb-6">
                <div className="px-6 py-4 border-b border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated))] flex justify-between items-center">
                    <h3 className="font-semibold text-[rgb(var(--text-primary))] flex items-center gap-2">
                        <Server className="w-5 h-5 text-[rgb(var(--accent))]" />
                        OpenRouter Keys
                    </h3>
                    {currentUserRole === 'owner' && (
                        <span className="text-xs bg-yellow-500/10 text-yellow-600 px-2 py-1 rounded border border-yellow-500/20">
                            Owner Access Enabled
                        </span>
                    )}
                </div>

                <div className="overflow-x-auto">
                    {/* ... Existing OpenRouter Table Body ... */}
                    <table className="w-full text-left">
                        <thead className="bg-[rgb(var(--bg-elevated))]/50">
                            <tr>
                                <th className="px-6 py-3 text-xs font-semibold text-[rgb(var(--text-muted))] uppercase">Key ID</th>
                                <th className="px-6 py-3 text-xs font-semibold text-[rgb(var(--text-muted))] uppercase">Status</th>
                                <th className="px-6 py-3 text-xs font-semibold text-[rgb(var(--text-muted))] uppercase">Usage</th>
                                <th className="px-6 py-3 text-xs font-semibold text-[rgb(var(--text-muted))] uppercase">Failures</th>
                                <th className="px-6 py-3 text-xs font-semibold text-[rgb(var(--text-muted))] uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[rgb(var(--border))]">
                            {systemStatus.openRouter.keys.map((key, index) => (
                                <tr key={index} className="hover:bg-[rgb(var(--bg-elevated))]/30 transition-colors">
                                    <td className="px-6 py-4 text-sm font-mono text-[rgb(var(--text-secondary))]">
                                        {key.keyMasked}
                                    </td>
                                    <td className="px-6 py-4">
                                        {key.isManuallyDisabled ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-600 border border-red-200">
                                                <Lock className="w-3 h-3" /> Locked
                                            </span>
                                        ) : key.isTempDisabled ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-500/10 text-orange-600 border border-orange-200">
                                                <Clock className="w-3 h-3" /> Cooldown
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-600 border border-green-200">
                                                <ShieldCheck className="w-3 h-3" /> Active
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-[rgb(var(--text-primary))]">
                                        {key.usageCount}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-[rgb(var(--text-primary))]">
                                        {key.failures > 0 ? (
                                            <span className="text-red-500 font-bold">{key.failures}</span>
                                        ) : (
                                            <span className="text-[rgb(var(--text-muted))]">0</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {currentUserRole === 'owner' ? (
                                            key.isManuallyDisabled ? (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleKeyControl(key.fullKey, 'unlock')}
                                                    className="h-8 text-xs bg-green-50 hover:bg-green-100 text-green-600 border-green-200"
                                                >
                                                    <Unlock className="w-3.5 h-3.5 mr-1" /> Unlock
                                                </Button>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleKeyControl(key.fullKey, 'lock')}
                                                    className="h-8 text-xs hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                                                >
                                                    <Lock className="w-3.5 h-3.5 mr-1" /> Lock
                                                </Button>
                                            )
                                        ) : (
                                            <span className="text-xs text-[rgb(var(--text-muted))] italic">View Only</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>



            {/* Recent Logs Logs */}
            <div className="bg-[rgb(var(--bg-card))] rounded-2xl border border-[rgb(var(--border))] shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated))] flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h3 className="font-semibold text-[rgb(var(--text-primary))]">Recent Transactions</h3>

                    {/* Filters */}
                    <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                        <input
                            type="text"
                            placeholder="Search user or email..."
                            className="bg-[rgb(var(--bg-input))] border border-[rgb(var(--border))] text-[rgb(var(--text-primary))] rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]"
                            value={logFilters.search}
                            onChange={(e) => handleLogFilterChange('search', e.target.value)}
                        />
                        <select
                            className="bg-[rgb(var(--bg-input))] border border-[rgb(var(--border))] text-[rgb(var(--text-primary))] rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]"
                            value={logFilters.provider}
                            onChange={(e) => handleLogFilterChange('provider', e.target.value)}
                        >
                            <option value="all">All Providers</option>
                            <option value="openRouter">OpenRouter</option>

                            <option value="openai">OpenAI</option>
                        </select>
                        <select
                            className="bg-[rgb(var(--bg-input))] border border-[rgb(var(--border))] text-[rgb(var(--text-primary))] rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]"
                            value={logFilters.status}
                            onChange={(e) => handleLogFilterChange('status', e.target.value)}
                        >
                            <option value="all">All Status</option>
                            <option value="success">Success</option>
                            <option value="failed">Failed</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto max-h-[500px]">
                    <table className="w-full text-left">
                        <thead className="bg-[rgb(var(--bg-elevated))]/50 sticky top-0 z-10 backdrop-blur-sm">
                            <tr>
                                <th className="px-6 py-3 text-xs font-semibold text-[rgb(var(--text-muted))] uppercase">Time</th>
                                <th className="px-6 py-3 text-xs font-semibold text-[rgb(var(--text-muted))] uppercase">User</th>
                                <th className="px-6 py-3 text-xs font-semibold text-[rgb(var(--text-muted))] uppercase">Provider</th>
                                <th className="px-6 py-3 text-xs font-semibold text-[rgb(var(--text-muted))] uppercase">Model</th>
                                <th className="px-6 py-3 text-xs font-semibold text-[rgb(var(--text-muted))] uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[rgb(var(--border))]">
                            {logs.map((log, i) => (
                                <tr key={i} className="hover:bg-[rgb(var(--bg-elevated))]/30 transition-colors text-sm">
                                    <td className="px-6 py-3 text-[rgb(var(--text-secondary))] whitespace-nowrap">
                                        {new Date(log.timestamp).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-3 text-[rgb(var(--text-primary))]">
                                        <div className="flex flex-col">
                                            <span>{log.userName || 'Unknown'}</span>
                                            <span className="text-xs text-[rgb(var(--text-muted))]">{log.userEmail}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-3">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${log.provider === 'openRouter'
                                            ? 'bg-purple-500/10 text-purple-600'

                                            : 'bg-blue-500/10 text-blue-600'
                                            }`}>
                                            {log.provider}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 text-[rgb(var(--text-secondary))] font-mono text-xs">
                                        {log.model}
                                    </td>
                                    <td className="px-6 py-3">
                                        {log.status === 'success' ? (
                                            <span className="text-green-600">Success</span>
                                        ) : (
                                            <span className="text-red-500 flex items-center gap-1">
                                                <AlertTriangle className="w-3 h-3" /> Failed
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {logs.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-[rgb(var(--text-muted))]">
                                        No transactions found matching your filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                <div className="px-6 py-4 border-t border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated))]/50 flex justify-between items-center">
                    <div className="text-sm text-[rgb(var(--text-muted))]">
                        Page {logPagination.page} of {logPagination.totalPages || 1} <span className="mx-1">•</span> Total {logPagination.totalCount} records
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={logPagination.page === 1}
                            onClick={() => handlePageChange(logPagination.page - 1)}
                            className="bg-transparent border-[rgb(var(--border))]"
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={logPagination.page >= logPagination.totalPages}
                            onClick={() => handlePageChange(logPagination.page + 1)}
                            className="bg-transparent border-[rgb(var(--border))]"
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIServicePanel;

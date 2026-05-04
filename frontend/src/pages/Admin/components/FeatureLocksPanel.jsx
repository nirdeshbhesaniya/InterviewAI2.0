import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Unlock, Sparkles, ShieldAlert, Layers3, RefreshCw, AlertTriangle } from 'lucide-react';
import axios from '../../../utils/axiosInstance';
import { API } from '../../../utils/apiPaths';
import toast from 'react-hot-toast';

const CATEGORY_STYLE = {
    AI: 'from-cyan-500/15 to-blue-500/10 text-cyan-600 dark:text-cyan-300',
    Assessments: 'from-amber-500/15 to-orange-500/10 text-amber-600 dark:text-amber-300',
    Interview: 'from-fuchsia-500/15 to-pink-500/10 text-fuchsia-600 dark:text-fuchsia-300',
    Tools: 'from-emerald-500/15 to-lime-500/10 text-emerald-600 dark:text-emerald-300'
};

const FeatureLocksPanel = () => {
    const [features, setFeatures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [savingKey, setSavingKey] = useState(null);
    // readOnly = true when admin endpoint is missing (404) and we fell back to public endpoint
    const [readOnly, setReadOnly] = useState(false);

    const fetchFeatureLocks = async () => {
        setLoading(true);
        try {
            const res = await axios.get(API.ADMIN.FEATURE_LOCKS, {
                params: { _t: Date.now() }
            });
            setReadOnly(false);
            setFeatures((res.data.features || []).map((f) => ({ ...f, isLocked: !f.isEnabled })));
        } catch (error) {
            const status = error?.response?.status;
            const msg = error?.response?.data?.message || error?.message || 'Unknown error';
            console.error('Failed to load feature locks:', { status, msg });

            if (status === 404) {
                // Admin route not on deployed server yet — use public endpoint as read-only fallback
                try {
                    const fallback = await axios.get(API.PUBLIC.FEATURE_LOCKS, {
                        params: { _t: Date.now() }
                    });
                    setFeatures((fallback.data.features || []).map((f) => ({ ...f, isLocked: !f.isEnabled })));
                    setReadOnly(true);
                } catch {
                    toast.error('Could not load feature locks from server.');
                    setFeatures([]);
                }
            } else if (status === 401) {
                toast.error('Session expired — please log in again.');
                setFeatures([]);
            } else if (status === 403) {
                toast.error('Access denied. Admin or Owner role required.');
                setFeatures([]);
            } else {
                toast.error(`Failed to load feature locks (${status || 'network error'}): ${msg}`);
                setFeatures([]);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeatureLocks();
    }, []);

    const summary = useMemo(() => {
        const locked = features.filter((f) => f.isLocked).length;
        return { total: features.length, locked, unlocked: features.length - locked };
    }, [features]);

    const handleToggle = async (feature) => {
        if (readOnly) {
            toast.error('Read-only mode — deploy the latest backend to enable toggling.');
            return;
        }
        const nextEnabled = !feature.isEnabled;
        setSavingKey(feature.key);
        try {
            const res = await axios.patch(API.ADMIN.UPDATE_FEATURE_LOCK(feature.key), {
                isEnabled: nextEnabled
            });
            setFeatures((current) => current.map((item) =>
                item.key === feature.key
                    ? { ...item, isEnabled: nextEnabled, isLocked: !nextEnabled }
                    : item
            ));
            toast.success(res.data.message || 'Feature lock updated successfully');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update feature lock');
        } finally {
            setSavingKey(null);
        }
    };

    const groupedFeatures = useMemo(() => {
        return features.reduce((acc, feature) => {
            if (!acc[feature.category]) acc[feature.category] = [];
            acc[feature.category].push(feature);
            return acc;
        }, {});
    }, [features]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[440px]">
                <div className="flex flex-col items-center gap-3 text-center">
                    <RefreshCw className="w-8 h-8 text-[rgb(var(--accent))] animate-spin" />
                    <p className="text-sm text-[rgb(var(--text-secondary))]">Loading feature locks...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Read-only warning banner */}
            {readOnly && (
                <div className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4">
                    <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                    <div>
                        <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">Backend not updated yet — Read-only mode</p>
                        <p className="text-xs text-amber-600/80 dark:text-amber-400/70 mt-0.5">
                            The deployed server does not have the feature-lock admin endpoint. Deploy the latest backend code to enable toggling. Current states are shown from the public endpoint.
                        </p>
                    </div>
                </div>
            )}

            <div className="relative overflow-hidden rounded-[2rem] border border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated))] p-6 sm:p-8">
                <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.15),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(236,72,153,0.14),transparent_30%)]" />
                <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                    <div className="space-y-3 max-w-2xl">
                        <div className="inline-flex items-center gap-2 rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))]/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[rgb(var(--text-secondary))]">
                            <Layers3 className="w-3.5 h-3.5 text-[rgb(var(--accent))]" />
                            Feature lock control
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[rgb(var(--text-primary))]">
                            Lock features without touching code.
                        </h2>
                        <p className="text-[rgb(var(--text-secondary))] leading-relaxed max-w-2xl">
                            Owner and admin users can instantly turn site features on or off from this tab. The lock state is applied server-side and reflected in the user interface.
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-3 sm:gap-4">
                        {[
                            { label: 'Total', value: summary.total },
                            { label: 'Locked', value: summary.locked },
                            { label: 'Open', value: summary.unlocked }
                        ].map((item) => (
                            <div key={item.label} className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))]/80 p-4 text-center min-w-[84px]">
                                <div className="text-2xl font-black text-[rgb(var(--text-primary))]">{item.value}</div>
                                <div className="text-xs uppercase tracking-[0.2em] text-[rgb(var(--text-secondary))] mt-1">{item.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {features.length === 0 && !loading && (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                    <Layers3 className="w-10 h-10 text-[rgb(var(--text-muted))]" />
                    <p className="text-[rgb(var(--text-secondary))]">No features found.</p>
                    <button
                        onClick={fetchFeatureLocks}
                        className="mt-2 text-sm text-[rgb(var(--accent))] hover:underline flex items-center gap-1"
                    >
                        <RefreshCw className="w-3.5 h-3.5" /> Retry
                    </button>
                </div>
            )}

            {Object.entries(groupedFeatures).map(([category, items], categoryIndex) => (
                <div key={category} className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className={`px-3 py-1.5 rounded-full bg-gradient-to-r ${CATEGORY_STYLE[category] || 'from-slate-500/15 to-slate-500/10 text-slate-600 dark:text-slate-300'} border border-[rgb(var(--border))] text-sm font-semibold`}>
                            {category}
                        </div>
                        <p className="text-sm text-[rgb(var(--text-secondary))]">{items.length} feature{items.length === 1 ? '' : 's'}</p>
                    </div>

                    <div className="grid gap-4 xl:grid-cols-2">
                        {items.map((feature, index) => {
                            const locked = feature.isLocked;
                            const isSaving = savingKey === feature.key;

                            return (
                                <motion.div
                                    key={feature.key}
                                    initial={{ opacity: 0, y: 18 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: (categoryIndex * 0.08) + (index * 0.05) }}
                                    className="relative overflow-hidden rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] p-5 sm:p-6 shadow-sm"
                                >
                                    <div className={`absolute inset-0 bg-gradient-to-br ${locked ? 'from-rose-500/10 via-transparent to-orange-500/5' : 'from-emerald-500/10 via-transparent to-cyan-500/5'} pointer-events-none`} />

                                    <div className="relative space-y-5">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    {locked ? <Lock className="w-5 h-5 text-rose-500" /> : <Unlock className="w-5 h-5 text-emerald-500" />}
                                                    <h3 className="text-xl font-bold text-[rgb(var(--text-primary))]">{feature.label}</h3>
                                                </div>
                                                <p className="text-sm text-[rgb(var(--text-secondary))] leading-relaxed max-w-xl">
                                                    {feature.description}
                                                </p>
                                            </div>

                                            <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold border ${locked ? 'bg-rose-500/10 text-rose-600 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'}`}>
                                                {locked ? <ShieldAlert className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                                                {locked ? 'Locked' : 'Unlocked'}
                                            </span>
                                        </div>

                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated))] p-4">
                                            <div>
                                                <p className="text-sm font-semibold text-[rgb(var(--text-primary))]">
                                                    {locked ? 'Feature access is disabled for everyone' : 'Feature is available to users'}
                                                </p>
                                                <p className="text-xs text-[rgb(var(--text-secondary))] mt-1">
                                                    {readOnly ? 'Read-only — deploy backend to enable toggling.' : 'Changes apply immediately after saving.'}
                                                </p>
                                            </div>

                                            <button
                                                onClick={() => handleToggle(feature)}
                                                disabled={isSaving || readOnly}
                                                className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all border ${locked
                                                    ? 'bg-emerald-500 text-white border-emerald-500 hover:brightness-110'
                                                    : 'bg-rose-500 text-white border-rose-500 hover:brightness-110'
                                                    } disabled:opacity-60 disabled:cursor-not-allowed`}
                                            >
                                                {isSaving ? (
                                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                                ) : locked ? (
                                                    <Unlock className="w-4 h-4" />
                                                ) : (
                                                    <Lock className="w-4 h-4" />
                                                )}
                                                {isSaving ? 'Saving...' : readOnly ? 'Read-only' : locked ? 'Unlock feature' : 'Lock feature'}
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default FeatureLocksPanel;
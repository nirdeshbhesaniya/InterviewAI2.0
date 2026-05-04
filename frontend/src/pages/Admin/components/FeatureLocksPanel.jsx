import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Unlock, Sparkles, ShieldAlert, Layers3, RefreshCw } from 'lucide-react';
import axios from '../../../utils/axiosInstance';
import { API } from '../../../utils/apiPaths';
import toast from 'react-hot-toast';

const CATEGORY_COLORS = {
    AI:          'from-cyan-500/15 to-blue-500/10 text-cyan-600 dark:text-cyan-300',
    Assessments: 'from-amber-500/15 to-orange-500/10 text-amber-600 dark:text-amber-300',
    Interview:   'from-fuchsia-500/15 to-pink-500/10 text-fuchsia-600 dark:text-fuchsia-300',
    Tools:       'from-emerald-500/15 to-lime-500/10 text-emerald-600 dark:text-emerald-300',
};

/* ─────────────────────────────────────────────────────────────────────────────
   FeatureLocksPanel
   GET  /api/ai/features           → load all features
   PATCH /api/ai/features/:key     → toggle (after backend update deployed)
   POST  /api/ai/features/toggle   → toggle fallback (already on server)
───────────────────────────────────────────────────────────────────────────── */
const FeatureLocksPanel = () => {
    const [features, setFeatures]   = useState([]);
    const [loading, setLoading]     = useState(true);
    const [savingKey, setSavingKey] = useState(null);

    // ── Fetch ────────────────────────────────────────────────────────────────
    const load = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(API.ADMIN.FEATURE_LOCKS, {
                params: { _t: Date.now() }
            });
            // normalize: new backend returns data.features; old returns the same field
            const raw = data.features || [];
            setFeatures(raw.map((f) => ({ ...f, isLocked: !f.isEnabled })));
        } catch (err) {
            const code = err?.response?.status;
            if (code === 401) toast.error('Session expired — please log in again.');
            else if (code === 403) toast.error('Admin or Owner access required.');
            else toast.error('Could not load feature locks.');
            setFeatures([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    // ── Toggle ───────────────────────────────────────────────────────────────
    const toggle = async (feature) => {
        const nextEnabled = !feature.isEnabled;
        setSavingKey(feature.key);
        try {
            // Try PATCH first (new endpoint). Fall back to POST toggle if 404/405.
            let res;
            try {
                res = await axios.patch(API.ADMIN.PATCH_FEATURE_LOCK(feature.key), {
                    isEnabled: nextEnabled
                });
            } catch (patchErr) {
                if (patchErr?.response?.status === 404 || patchErr?.response?.status === 405) {
                    res = await axios.post(API.ADMIN.TOGGLE_FEATURE_LOCK, {
                        key: feature.key,
                        isEnabled: nextEnabled
                    });
                } else {
                    throw patchErr;
                }
            }
            // Update local state immediately — no re-fetch needed
            setFeatures((prev) =>
                prev.map((f) =>
                    f.key === feature.key
                        ? { ...f, isEnabled: nextEnabled, isLocked: !nextEnabled }
                        : f
                )
            );
            toast.success(res.data.message || `${feature.label} ${nextEnabled ? 'unlocked' : 'locked'}`);
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to update feature lock');
        } finally {
            setSavingKey(null);
        }
    };

    // ── Derived state ────────────────────────────────────────────────────────
    const summary = useMemo(() => {
        const locked = features.filter((f) => f.isLocked).length;
        return { total: features.length, locked, unlocked: features.length - locked };
    }, [features]);

    const grouped = useMemo(() =>
        features.reduce((acc, f) => {
            const cat = f.category || 'Other';
            (acc[cat] = acc[cat] || []).push(f);
            return acc;
        }, {}),
        [features]
    );

    // ── Loading ──────────────────────────────────────────────────────────────
    if (loading) return (
        <div className="flex items-center justify-center min-h-[440px]">
            <div className="flex flex-col items-center gap-3">
                <RefreshCw className="w-8 h-8 text-[rgb(var(--accent))] animate-spin" />
                <p className="text-sm text-[rgb(var(--text-secondary))]">Loading feature locks…</p>
            </div>
        </div>
    );

    // ── Main render ──────────────────────────────────────────────────────────
    return (
        <div className="space-y-8">

            {/* ── Summary header ── */}
            <div className="relative overflow-hidden rounded-[2rem] border border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated))] p-6 sm:p-8">
                <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.15),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(236,72,153,0.14),transparent_30%)]" />
                <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                    <div className="space-y-3 max-w-2xl">
                        <div className="inline-flex items-center gap-2 rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))]/80 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[rgb(var(--text-secondary))]">
                            <Layers3 className="w-3.5 h-3.5 text-[rgb(var(--accent))]" />
                            Feature lock control
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[rgb(var(--text-primary))]">
                            Lock features without touching code.
                        </h2>
                        <p className="text-[rgb(var(--text-secondary))] leading-relaxed">
                            Turn any site feature on or off instantly. Changes are applied server-side and take effect immediately for all users.
                        </p>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { label: 'Total',  value: summary.total },
                            { label: 'Locked', value: summary.locked },
                            { label: 'Open',   value: summary.unlocked },
                        ].map((s) => (
                            <div key={s.label} className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))]/80 p-4 text-center min-w-[80px]">
                                <div className="text-2xl font-black text-[rgb(var(--text-primary))]">{s.value}</div>
                                <div className="text-xs uppercase tracking-widest text-[rgb(var(--text-secondary))] mt-1">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Empty state ── */}
            {features.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
                    <Layers3 className="w-10 h-10 text-[rgb(var(--text-muted))]" />
                    <p className="text-[rgb(var(--text-secondary))]">No features returned from server.</p>
                    <button onClick={load} className="flex items-center gap-1.5 text-sm text-[rgb(var(--accent))] hover:underline">
                        <RefreshCw className="w-3.5 h-3.5" /> Retry
                    </button>
                </div>
            )}

            {/* ── Feature cards ── */}
            {Object.entries(grouped).map(([category, items], catIdx) => (
                <div key={category} className="space-y-4">
                    {/* Category label */}
                    <div className="flex items-center gap-3">
                        <span className={`px-3 py-1.5 rounded-full bg-gradient-to-r ${CATEGORY_COLORS[category] || 'from-slate-500/15 to-slate-500/10 text-slate-600 dark:text-slate-300'} border border-[rgb(var(--border))] text-sm font-semibold`}>
                            {category}
                        </span>
                        <p className="text-sm text-[rgb(var(--text-secondary))]">
                            {items.length} feature{items.length !== 1 ? 's' : ''}
                        </p>
                    </div>

                    {/* Cards grid */}
                    <div className="grid gap-4 xl:grid-cols-2">
                        {items.map((feature, idx) => {
                            const locked   = feature.isLocked;
                            const isSaving = savingKey === feature.key;
                            return (
                                <motion.div
                                    key={feature.key}
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: catIdx * 0.06 + idx * 0.04 }}
                                    className="relative overflow-hidden rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] p-5 sm:p-6 shadow-sm"
                                >
                                    {/* Gradient tint */}
                                    <div className={`absolute inset-0 pointer-events-none bg-gradient-to-br ${locked ? 'from-rose-500/10 via-transparent to-orange-500/5' : 'from-emerald-500/10 via-transparent to-cyan-500/5'}`} />

                                    <div className="relative space-y-5">
                                        {/* Title row */}
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-2">
                                                    {locked
                                                        ? <Lock   className="w-5 h-5 text-rose-500" />
                                                        : <Unlock className="w-5 h-5 text-emerald-500" />}
                                                    <h3 className="text-lg font-bold text-[rgb(var(--text-primary))]">{feature.label}</h3>
                                                </div>
                                                {feature.description && (
                                                    <p className="text-sm text-[rgb(var(--text-secondary))] leading-relaxed">
                                                        {feature.description}
                                                    </p>
                                                )}
                                            </div>
                                            <span className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border ${locked ? 'bg-rose-500/10 text-rose-600 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'}`}>
                                                {locked ? <ShieldAlert className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                                                {locked ? 'Locked' : 'Live'}
                                            </span>
                                        </div>

                                        {/* Action row */}
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated))] p-4">
                                            <p className="text-sm text-[rgb(var(--text-secondary))]">
                                                {locked ? 'Disabled for all users.' : 'Available to all users.'}
                                            </p>
                                            <button
                                                onClick={() => toggle(feature)}
                                                disabled={isSaving}
                                                className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold border transition-all disabled:opacity-50 disabled:cursor-not-allowed ${locked
                                                    ? 'bg-emerald-500 text-white border-emerald-500 hover:brightness-110'
                                                    : 'bg-rose-500   text-white border-rose-500   hover:brightness-110'}`}
                                            >
                                                {isSaving
                                                    ? <RefreshCw className="w-4 h-4 animate-spin" />
                                                    : locked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                                                {isSaving ? 'Saving…' : locked ? 'Unlock' : 'Lock'}
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
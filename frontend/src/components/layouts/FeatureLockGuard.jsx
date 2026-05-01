import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, Lock, Sparkles, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/axiosInstance';
import { API } from '../../utils/apiPaths';
import { useUser } from '../../context/UserContext';

const FeatureLockGuard = ({ featureKey, children, title, description }) => {
    const navigate = useNavigate();
    const { user } = useUser();
    const [loading, setLoading] = useState(true);
    const [isLocked, setIsLocked] = useState(false);
    const [feature, setFeature] = useState(null);

    useEffect(() => {
        let active = true;

        const fetchFeatureLocks = async () => {
            try {
                const res = await axios.get(API.PUBLIC.FEATURE_LOCKS);
                if (!active) return;

                const matchedFeature = (res.data.features || []).find((item) => item.key === featureKey);
                setFeature(matchedFeature || null);
                setIsLocked(Boolean(matchedFeature && matchedFeature.isLocked));
            } catch (error) {
                if (active) {
                    setIsLocked(false);
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        fetchFeatureLocks();

        return () => {
            active = false;
        };
    }, [featureKey]);

    const featureTitle = useMemo(() => title || feature?.label || 'Feature temporarily locked', [feature?.label, title]);
    const featureDescription = useMemo(() => description || feature?.description || 'This feature is temporarily locked by the admin for system maintenance or updates. Please try again later.', [description, feature?.description]);

    if (loading) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center bg-[rgb(var(--bg-main))] px-6">
                <div className="flex flex-col items-center gap-3 text-center">
                    <Loader2 className="w-9 h-9 text-[rgb(var(--accent))] animate-spin" />
                    <p className="text-sm text-[rgb(var(--text-secondary))]">Checking feature availability...</p>
                </div>
            </div>
        );
    }

    if (!isLocked) {
        return children;
    }

    return (
        <div className="min-h-[80vh] bg-[rgb(var(--bg-main))] px-4 py-8 sm:px-6 lg:px-8 flex items-center justify-center overflow-hidden relative">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-24 -right-20 h-80 w-80 rounded-full bg-[rgb(var(--accent))]/20 blur-3xl" />
                <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-fuchsia-500/15 blur-3xl" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.35 }}
                className="relative z-10 w-full max-w-2xl rounded-[2rem] border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))]/95 backdrop-blur-xl shadow-[0_30px_90px_rgba(15,23,42,0.18)] overflow-hidden"
            >
                <div className="h-2 bg-gradient-to-r from-[rgb(var(--accent))] via-cyan-400 to-fuchsia-500" />

                <div className="p-6 sm:p-10 space-y-8">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-[rgb(var(--accent))]/10 text-[rgb(var(--accent))] flex items-center justify-center border border-[rgb(var(--accent))]/20 shrink-0">
                            <Lock className="w-8 h-8" />
                        </div>

                        <div className="space-y-2">
                            <div className="inline-flex items-center gap-2 rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated))] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[rgb(var(--text-secondary))]">
                                <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                                Temporarily unavailable
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[rgb(var(--text-primary))]">
                                {featureTitle}
                            </h1>
                            <p className="text-[rgb(var(--text-secondary))] leading-relaxed max-w-xl">
                                {featureDescription}
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated))] p-4">
                            <div className="flex items-center gap-3 mb-2">
                                <Sparkles className="w-5 h-5 text-[rgb(var(--accent))]" />
                                <p className="font-semibold text-[rgb(var(--text-primary))]">Why you’re seeing this</p>
                            </div>
                            <p className="text-sm text-[rgb(var(--text-secondary))] leading-relaxed">
                                The admin team has temporarily locked this feature for maintenance or system updates. You can continue browsing other parts of the site.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated))] p-4">
                            <div className="flex items-center gap-3 mb-2">
                                <ShieldAlert className="w-5 h-5 text-rose-500" />
                                <p className="font-semibold text-[rgb(var(--text-primary))]">Status</p>
                            </div>
                            <p className="text-sm text-[rgb(var(--text-secondary))] leading-relaxed">
                                {user?.role === 'owner' || user?.role === 'admin'
                                    ? 'You can change this from the Feature Locks tab in the admin panel.'
                                    : 'Please try again later or contact an administrator if you need access.'}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 bg-[rgb(var(--bg-elevated))] text-[rgb(var(--text-primary))] border border-[rgb(var(--border))] hover:border-[rgb(var(--accent))]/30 hover:bg-[rgb(var(--accent))]/10 transition-all"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Go back
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default FeatureLockGuard;
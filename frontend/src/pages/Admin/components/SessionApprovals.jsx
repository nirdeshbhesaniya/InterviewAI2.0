import React, { useState, useEffect } from 'react';
import { Search, CheckCircle, XCircle, Clock, User, Calendar, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from '../../../utils/axiosInstance';
import { API } from '../../../utils/apiPaths';
import toast from 'react-hot-toast';
import { Button } from '../../../components/ui/button';

const SessionApprovalItem = ({ session, onApprove, onReject }) => {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-[rgb(var(--bg-main))] rounded-2xl border border-[rgb(var(--border))] hover:border-[rgb(var(--accent))]/50 transition-colors shadow-sm overflow-hidden p-5"
        >
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-500 text-xs font-medium border border-blue-500/20">
                            Session Request
                        </span>
                        <span className="text-xs text-[rgb(var(--text-muted))] flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(session.createdAt).toLocaleDateString()}
                        </span>
                    </div>

                    <h3 className="text-lg font-bold text-[rgb(var(--text-primary))] mb-1">
                        {session.title}
                    </h3>

                    <p className="text-sm text-[rgb(var(--text-secondary))] mb-3 line-clamp-2">
                        {session.desc}
                    </p>

                    <div className="flex flex-wrap gap-2 text-xs text-[rgb(var(--text-muted))]">
                        <div className="flex items-center gap-1 bg-[rgb(var(--bg-elevated))] px-2 py-1 rounded-md">
                            <User className="w-3 h-3" />
                            <span className="font-medium text-[rgb(var(--text-primary))]">
                                {session.creatorDetails?.fullName || session.creatorEmail}
                            </span>
                        </div>
                        {session.tag && (
                            <div className="flex items-center gap-1 bg-[rgb(var(--bg-elevated))] px-2 py-1 rounded-md">
                                <FileText className="w-3 h-3" />
                                <span>{session.tag}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-1 bg-[rgb(var(--bg-elevated))] px-2 py-1 rounded-md">
                            <Clock className="w-3 h-3" />
                            <span>{session.experience} Exp</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 shrink-0 w-full md:w-auto mt-4 md:mt-0">
                    <Button
                        size="sm"
                        className="flex-1 md:flex-none bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20 border-hidden"
                        onClick={() => onApprove(session.sessionId)}
                    >
                        <CheckCircle className="w-4 h-4 mr-2" /> Approve
                    </Button>
                    <Button
                        size="sm"
                        variant="destructive"
                        className="flex-1 md:flex-none shadow-lg shadow-red-600/20"
                        onClick={() => onReject(session.sessionId)}
                    >
                        <XCircle className="w-4 h-4 mr-2" /> Reject
                    </Button>
                </div>
            </div>
        </motion.div>
    );
};

const SessionApprovals = () => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchSessions = async () => {
        setLoading(true);
        try {
            const res = await axios.get(API.ADMIN.GET_PENDING_SESSIONS);
            setSessions(res.data || []);
        } catch (error) {
            console.error('Error fetching pending sessions:', error);
            toast.error('Failed to load pending sessions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, []);

    const handleAction = async (sessionId, action) => {
        try {
            if (action === 'approve') {
                await axios.post(API.INTERVIEW.APPROVE_SESSION(sessionId));
                toast.success('Session Approved & User Notified');
            } else {
                await axios.post(API.INTERVIEW.REJECT_SESSION(sessionId));
                toast.success('Session Rejected');
            }
            // Remove from list
            setSessions(prev => prev.filter(s => s.sessionId !== sessionId));
        } catch (error) {
            console.error(error);
            toast.error('Failed to process request');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-[rgb(var(--text-primary))]">Session Approvals</h2>
                <span className="px-3 py-1 rounded-full bg-[rgb(var(--accent))]/10 text-[rgb(var(--accent))] text-sm font-medium">
                    {sessions.length} Pending
                </span>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="w-8 h-8 rounded-full border-2 border-[rgb(var(--accent))] border-t-transparent animate-spin" />
                </div>
            ) : sessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-[rgb(var(--border))] rounded-2xl bg-[rgb(var(--bg-elevated))]/30">
                    <div className="p-4 bg-green-500/10 rounded-full mb-4">
                        <CheckCircle className="w-12 h-12 text-green-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))]">All caught up!</h3>
                    <p className="text-[rgb(var(--text-secondary))] max-w-xs mx-auto mt-2">
                        No pending session requests at the moment.
                    </p>
                </div>
            ) : (
                <div className="grid gap-4">
                    <AnimatePresence>
                        {sessions.map((session) => (
                            <SessionApprovalItem
                                key={session.sessionId}
                                session={session}
                                onApprove={(sid) => handleAction(sid, 'approve')}
                                onReject={(sid) => handleAction(sid, 'reject')}
                            />
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default SessionApprovals;

import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../../context/UserContext';
import axios from '../../utils/axiosInstance';
import { API } from '../../utils/apiPaths';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCircle, Trash2, Loader2, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

const NotificationPage = () => {
    const { user } = useContext(UserContext);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, unread

    useEffect(() => {
        if (user) fetchNotifications();
    }, [user, filter]);

    const fetchNotifications = async () => {
        if (!user?._id && !user?.email) return;
        setLoading(true);
        try {
            const params = { limit: 50 };
            if (filter === 'unread') params.unreadOnly = true;

            const userId = user._id || user.email;
            // Backend expects userId in path
            const res = await axios.get(API.NOTIFICATIONS.GET_ALL(userId), { params });
            setNotifications(res.data.notifications || []);
        } catch (error) {
            console.error('Failed to fetch notifications', error);
            toast.error('Could not load notifications');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkRead = async (id) => {
        try {
            const userId = user._id || user.email;
            await axios.patch(API.NOTIFICATIONS.MARK_READ, {
                notificationIds: [id],
                userId: userId
            });
            // Update local state
            setNotifications(notifications.map(n =>
                n._id === id ? { ...n, isRead: true, read: true } : n
            ));
            toast.success('Marked as read');
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleMarkAllRead = async () => {
        try {
            const userId = user._id || user.email;
            await axios.patch(API.NOTIFICATIONS.MARK_READ, {
                userId: userId,
                markAll: true
            });
            setNotifications(notifications.map(n => ({ ...n, isRead: true, read: true })));
            toast.success('All marked as read');
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this notification?")) return;
        try {
            await axios.delete(API.NOTIFICATIONS.DELETE, {
                data: { notificationIds: [id], userId: user._id }
            });
            setNotifications(notifications.filter(n => n._id !== id));
            toast.success('Deleted');
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    return (
        <div className="min-h-screen bg-[rgb(var(--bg-main))] p-4 sm:p-8 pt-24">
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-[rgb(var(--text-primary))] to-[rgb(var(--text-secondary))] bg-clip-text text-transparent flex items-center gap-3">
                            <Bell className="w-8 h-8 text-[rgb(var(--accent))]" />
                            Notifications
                        </h1>
                        <p className="text-[rgb(var(--text-secondary))] mt-1">Stay updated with important announcements and alerts.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex bg-[rgb(var(--bg-elevated))] p-1 rounded-lg border border-[rgb(var(--border))]">
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${filter === 'all' ? 'bg-[rgb(var(--accent))] text-white shadow-sm' : 'text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))]'}`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setFilter('unread')}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${filter === 'unread' ? 'bg-[rgb(var(--accent))] text-white shadow-sm' : 'text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))]'}`}
                            >
                                Unread
                            </button>
                        </div>

                        <button
                            onClick={handleMarkAllRead}
                            className="px-4 py-2 bg-[rgb(var(--bg-elevated))] hover:bg-[rgb(var(--bg-elevated-alt))] text-[rgb(var(--text-primary))] border border-[rgb(var(--border))] rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                        >
                            <CheckCircle className="w-4 h-4" />
                            Mark all read
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-10 h-10 animate-spin text-[rgb(var(--accent))]" />
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="text-center py-20 bg-[rgb(var(--bg-elevated))] rounded-2xl border border-[rgb(var(--border))]">
                        <Bell className="w-16 h-16 mx-auto text-[rgb(var(--text-muted))] mb-4 opacity-50" />
                        <h3 className="text-xl font-semibold text-[rgb(var(--text-primary))]">No notifications</h3>
                        <p className="text-[rgb(var(--text-secondary))]">You're all caught up!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <AnimatePresence>
                            {notifications.map((notif) => (
                                <motion.div
                                    key={notif._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className={`relative p-6 rounded-2xl border transition-all ${notif.isRead
                                        ? 'bg-[rgb(var(--bg-card))] border-[rgb(var(--border))]'
                                        : 'bg-[rgb(var(--bg-elevated))] border-[rgb(var(--accent))]/30 shadow-sm'
                                        }`}
                                >
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                {!notif.isRead && (
                                                    <span className="w-2 h-2 rounded-full bg-[rgb(var(--accent))]" />
                                                )}
                                                <h3 className={`font-semibold text-lg ${notif.isRead ? 'text-[rgb(var(--text-primary))]' : 'text-[rgb(var(--accent))]'}`}>
                                                    {notif.title}
                                                </h3>
                                                <span className="text-xs text-[rgb(var(--text-muted))] ml-auto md:ml-0">
                                                    {new Date(notif.createdAt).toLocaleDateString(undefined, {
                                                        weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>
                                            <p className="text-[rgb(var(--text-secondary))] leading-relaxed">
                                                {notif.message}
                                            </p>
                                        </div>

                                        <div className="flex flex-col gap-2 shrink-0">
                                            {!notif.isRead && (
                                                <button
                                                    onClick={() => handleMarkRead(notif._id)}
                                                    className="p-2 text-[rgb(var(--accent))] hover:bg-[rgb(var(--accent))]/10 rounded-lg transition-colors"
                                                    title="Mark as read"
                                                >
                                                    <CheckCircle className="w-5 h-5" />
                                                </button>
                                            )}
                                            {/* Only allow delete for individual notifications, broadcasts can only be marked read (hidden logic needed for broadcast delete, but for MVP keep simple) */}
                                            <button
                                                onClick={() => handleDelete(notif._id)}
                                                className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationPage;

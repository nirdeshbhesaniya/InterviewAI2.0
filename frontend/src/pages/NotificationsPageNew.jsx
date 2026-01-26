// Complete working Notifications Page with real backend integration
import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Bell,
    Check,
    X,
    AlertCircle,
    Info,
    CheckCircle,
    AlertTriangle,
    Trash2
} from 'lucide-react';
import { Loader } from '../components/ui/Loader';
import axios from '../utils/axiosInstance';
import { API } from '../utils/apiPaths';
import toast from 'react-hot-toast';
import moment from 'moment';

const NotificationsPageNew = () => {
    const { user } = useContext(UserContext);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [filter, setFilter] = useState('all'); // 'all' or 'unread'

    useEffect(() => {
        fetchNotifications();
    }, [user, filter]);

    const fetchNotifications = async () => {
        const userId = user?._id || user?.email;
        if (!userId) return;

        try {
            const unreadOnly = filter === 'unread';
            const response = await axios.get(API.NOTIFICATIONS.GET_ALL(userId), {
                params: { unreadOnly }
            });

            if (response.data.success) {
                setNotifications(response.data.notifications);
                setUnreadCount(response.data.unreadCount);
            }
        } catch (error) {
            console.error('Fetch notifications error:', error);
            toast.error('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (notificationId) => {
        try {
            const userId = user._id || user.email;
            await axios.patch(API.NOTIFICATIONS.MARK_READ, {
                notificationIds: [notificationId],
                userId: userId
            });

            setNotifications(prev =>
                prev.map(n => n._id === notificationId ? { ...n, read: true, isRead: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
            toast.success('Marked as read');
        } catch (error) {
            console.error('Mark read error:', error);
            toast.error('Failed to mark as read');
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            const userId = user._id || user.email;
            await axios.patch(API.NOTIFICATIONS.MARK_READ, {
                userId: userId,
                markAll: true
            });

            setNotifications(prev => prev.map(n => ({ ...n, read: true, isRead: true })));
            setUnreadCount(0);
            toast.success('All notifications marked as read');
            setTimeout(fetchNotifications, 500);
        } catch (error) {
            console.error('Mark all read error:', error);
            toast.error('Failed to mark all as read');
        }
    };

    const handleDelete = async (notificationId) => {
        try {
            await axios.delete(API.NOTIFICATIONS.DELETE, {
                data: { notificationIds: [notificationId] }
            });

            setNotifications(prev => prev.filter(n => n._id !== notificationId));
            toast.success('Notification deleted');
        } catch (error) {
            console.error('Delete notification error:', error);
            toast.error('Failed to delete notification');
        }
    };

    const handleDeleteAll = async () => {
        if (!window.confirm('Are you sure you want to delete all notifications?')) return;

        try {
            await axios.delete(API.NOTIFICATIONS.DELETE, {
                data: { userId: user.email, deleteAll: true }
            });

            setNotifications([]);
            setUnreadCount(0);
            toast.success('All notifications deleted');
        } catch (error) {
            console.error('Delete all error:', error);
            toast.error('Failed to delete all notifications');
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'success':
                return <CheckCircle className="w-6 h-6 text-green-500" />;
            case 'warning':
                return <AlertTriangle className="w-6 h-6 text-yellow-500" />;
            case 'error':
                return <AlertCircle className="w-6 h-6 text-red-500" />;
            default:
                return <Info className="w-6 h-6 text-blue-500" />;
        }
    };

    if (loading) {
        return <Loader fullScreen size="lg" text="Loading notifications..." />;
    }

    return (
        <div className="min-h-screen bg-[rgb(var(--bg-body))] py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-[rgb(var(--bg-body-alt))] rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-[rgb(var(--text-muted))]" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-[rgb(var(--text-primary))]">Notifications</h1>
                            <p className="text-[rgb(var(--text-secondary))]">
                                {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="px-4 py-2 bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent-hover))] text-white rounded-lg font-medium shadow-lg shadow-[rgb(var(--accent))]/30 transition-all flex items-center gap-2"
                            >
                                <Check className="w-4 h-4" />
                                Mark All Read
                            </button>
                        )}
                        {notifications.length > 0 && (
                            <button
                                onClick={handleDeleteAll}
                                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium shadow-lg shadow-red-500/30 transition-all flex items-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete All
                            </button>
                        )}
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all shadow-md ${filter === 'all'
                            ? 'bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent-hover))] text-white shadow-[rgb(var(--accent))]/30'
                            : 'bg-[rgb(var(--bg-card))] text-[rgb(var(--text-secondary))] border border-[rgb(var(--border-subtle))] hover:bg-[rgb(var(--bg-body-alt))] hover:text-[rgb(var(--text-primary))]'
                            }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter('unread')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all shadow-md ${filter === 'unread'
                            ? 'bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent-hover))] text-white shadow-[rgb(var(--accent))]/30'
                            : 'bg-[rgb(var(--bg-card))] text-[rgb(var(--text-secondary))] border border-[rgb(var(--border-subtle))] hover:bg-[rgb(var(--bg-body-alt))] hover:text-[rgb(var(--text-primary))]'
                            }`}
                    >
                        Unread ({unreadCount})
                    </button>
                </div>

                {/* Notifications List */}
                {notifications.length === 0 ? (
                    <div className="text-center py-12">
                        <Bell className="w-16 h-16 text-[rgb(var(--text-muted))]/30 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-[rgb(var(--text-secondary))] mb-2">
                            No notifications
                        </h3>
                        <p className="text-[rgb(var(--text-muted))]">
                            You're all caught up!
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {notifications.map((notification) => (
                            <div
                                key={notification._id}
                                className={`bg-[rgb(var(--bg-card))] rounded-xl shadow-md border transition-all duration-200 p-5 ${!notification.isRead && !notification.read
                                    ? 'border-l-4 border-l-[rgb(var(--accent))] shadow-[rgb(var(--accent))]/10'
                                    : 'border-l-4 border-l-transparent border border-[rgb(var(--border-subtle))]'
                                    }`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0">
                                        {getIcon(notification.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4 mb-2">
                                            <h3 className="font-semibold text-[rgb(var(--text-primary))]">
                                                {notification.title}
                                            </h3>
                                            <span className="text-xs text-[rgb(var(--text-muted))] whitespace-nowrap">
                                                {moment(notification.createdAt).fromNow()}
                                            </span>
                                        </div>
                                        <p className="text-[rgb(var(--text-secondary))] mb-3">
                                            {notification.message}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            {notification.action && (
                                                <button
                                                    onClick={() => {
                                                        if (notification.action === 'review_qna') {
                                                            if (user.role === 'admin') {
                                                                navigate('/admin');
                                                            } else {
                                                                // Redirect to session
                                                                // The URL should be in actionUrl or we assume it
                                                                navigate(notification.actionUrl);
                                                            }
                                                        } else {
                                                            navigate(notification.actionUrl);
                                                        }
                                                    }}
                                                    className="px-3 py-1 bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent-hover))] text-white rounded-lg text-sm font-medium shadow-md shadow-[rgb(var(--accent))]/30 transition-all"
                                                >
                                                    {notification.action === 'review_qna' ? 'Review Request' : notification.action}
                                                </button>
                                            )}
                                            {!(notification.isRead || notification.read) && (
                                                <button
                                                    onClick={() => handleMarkAsRead(notification._id)}
                                                    className="px-3 py-1 bg-[rgb(var(--bg-body))] hover:bg-[rgb(var(--bg-body-alt))] text-[rgb(var(--text-primary))] border border-[rgb(var(--border))] rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                                                >
                                                    <Check className="w-3 h-3" />
                                                    Mark Read
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(notification._id)}
                                                className="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                                            >
                                                <X className="w-3 h-3" />
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsPageNew;

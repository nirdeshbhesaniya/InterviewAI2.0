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
    Trash2,
    Loader2
} from 'lucide-react';
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
        if (!user?.email) return;

        try {
            const unreadOnly = filter === 'unread';
            const response = await axios.get(API.NOTIFICATIONS.GET_ALL(user.email), {
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
            await axios.patch(API.NOTIFICATIONS.MARK_READ, {
                notificationIds: [notificationId]
            });

            setNotifications(prev =>
                prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
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
            await axios.patch(API.NOTIFICATIONS.MARK_READ, {
                userId: user.email,
                markAll: true
            });

            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
            toast.success('All notifications marked as read');
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
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notifications</h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                            >
                                <Check className="w-4 h-4" />
                                Mark All Read
                            </button>
                        )}
                        {notifications.length > 0 && (
                            <button
                                onClick={handleDeleteAll}
                                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
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
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'all'
                                ? 'bg-orange-500 text-white'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter('unread')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'unread'
                                ? 'bg-orange-500 text-white'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}
                    >
                        Unread ({unreadCount})
                    </button>
                </div>

                {/* Notifications List */}
                {notifications.length === 0 ? (
                    <div className="text-center py-12">
                        <Bell className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                            No notifications
                        </h3>
                        <p className="text-gray-500 dark:text-gray-500">
                            You're all caught up!
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {notifications.map((notification) => (
                            <div
                                key={notification._id}
                                className={`bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 transition-all duration-200 ${!notification.read
                                        ? 'border-l-4 border-orange-500'
                                        : 'border-l-4 border-transparent'
                                    }`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0">
                                        {getIcon(notification.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4 mb-2">
                                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                                {notification.title}
                                            </h3>
                                            <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                                {moment(notification.createdAt).fromNow()}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-300 mb-3">
                                            {notification.message}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            {notification.action && notification.actionUrl && (
                                                <button
                                                    onClick={() => navigate(notification.actionUrl)}
                                                    className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors"
                                                >
                                                    {notification.action}
                                                </button>
                                            )}
                                            {!notification.read && (
                                                <button
                                                    onClick={() => handleMarkAsRead(notification._id)}
                                                    className="px-3 py-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                                                >
                                                    <Check className="w-3 h-3" />
                                                    Mark Read
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(notification._id)}
                                                className="px-3 py-1 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
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

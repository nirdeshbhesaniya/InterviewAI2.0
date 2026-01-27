import React, { useState, useEffect } from 'react';
import { Search, Send, Megaphone, Trash2 } from 'lucide-react';
import axios from '../../../utils/axiosInstance';
import { API } from '../../../utils/apiPaths';
import toast from 'react-hot-toast';
import { Button } from '../../../components/ui/button';
import useDebounce from '../../../hooks/useDebounce';

const NotificationCenter = () => {
    // Notification State
    const [notifForm, setNotifForm] = useState({
        title: '',
        message: '',
        recipientType: 'all',
        recipientId: '',
        isEmailSent: false
    });
    const [recipientSearch, setRecipientSearch] = useState('');
    const debouncedRecipientSearch = useDebounce(recipientSearch, 500);
    const [recipientResults, setRecipientResults] = useState([]);
    const [searching, setSearching] = useState(false);

    // Search users for notification targeting
    useEffect(() => {
        const searchRecipients = async () => {
            if (!debouncedRecipientSearch || (notifForm.recipientType !== 'user' && notifForm.recipientType !== 'admin')) {
                setRecipientResults([]);
                return;
            }
            setSearching(true);
            try {
                // We'll use a direct search endpoint if available, otherwise fetch all users and filter (less efficient but matches previous logic if no search endpoint)
                // Assuming we might not want to fetch ALL users here for just a search if the list is huge.
                // But sticking to original logic's intent: fetch users if needed.
                // Ideally, backend should have a search endpoint. 
                // Using GET_USERS for now as per refactor.
                const res = await axios.get(API.ADMIN.GET_USERS);
                const sourceUsers = res.data;

                const filtered = sourceUsers.filter(u =>
                    (notifForm.recipientType === 'admin' ? u.role === 'admin' : true) &&
                    (u.fullName.toLowerCase().includes(debouncedRecipientSearch.toLowerCase()) ||
                        u.email.toLowerCase().includes(debouncedRecipientSearch.toLowerCase()))
                ).slice(0, 5);
                setRecipientResults(filtered);
            } catch (err) {
                console.error("Recipient search error", err);
            } finally {
                setSearching(false);
            }
        };
        searchRecipients();
    }, [debouncedRecipientSearch, notifForm.recipientType]);


    const [broadcasts, setBroadcasts] = useState([]);
    const [loadingBroadcasts, setLoadingBroadcasts] = useState(true);

    // Fetch Broadcasts
    const fetchBroadcasts = async () => {
        try {
            const res = await axios.get(API.ADMIN.GET_BROADCASTS);
            setBroadcasts(res.data.broadcasts);
        } catch (error) {
            console.error('Error fetching broadcasts:', error);
            toast.error('Failed to load broadcasts');
        } finally {
            setLoadingBroadcasts(false);
        }
    };

    useEffect(() => {
        fetchBroadcasts();
    }, []);

    const handleSendNotification = async (e) => {
        e.preventDefault();
        try {
            await axios.post(API.ADMIN.CREATE_NOTIFICATION, notifForm);
            toast.success('Notification sent successfully!');
            setNotifForm({
                title: '',
                message: '',
                recipientType: 'all',
                recipientId: '',
                isEmailSent: false
            });
            setRecipientSearch('');
            fetchBroadcasts(); // Refresh list
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send notification');
        }
    };

    const handleDeleteBroadcast = async (id) => {
        if (window.confirm('SYSTEM ALERT: Are you sure you want to permanently delete this broadcast? This will remove it from all users\' notifications.')) {
            try {
                await axios.delete(API.ADMIN.DELETE_BROADCAST(id));
                toast.success('Broadcast deleted permanently');
                fetchBroadcasts();
            } catch (error) {
                toast.error('Failed to delete broadcast');
            }
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'warning': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
            case 'error': return 'text-red-500 bg-red-500/10 border-red-500/20';
            case 'success': return 'text-green-500 bg-green-500/10 border-green-500/20';
            default: return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
        }
    };

    return (
        <div className="space-y-8">
            <h2 className="text-xl font-bold text-[rgb(var(--text-primary))]">Send Notifications</h2>

            <div className="bg-[rgb(var(--bg-elevated))] p-6 rounded-2xl border border-[rgb(var(--border))] max-w-2xl">
                {/* Form Content - same as before */}
                <form onSubmit={handleSendNotification} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1">Title</label>
                        <input
                            type="text"
                            required
                            value={notifForm.title}
                            onChange={e => setNotifForm(prev => ({ ...prev, title: e.target.value }))}
                            className="w-full px-4 py-2 bg-[rgb(var(--bg-main))] border border-[rgb(var(--border))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--accent))]/20 outline-none transition-colors"
                            placeholder="Notification title..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1">Message</label>
                        <textarea
                            required
                            value={notifForm.message}
                            onChange={e => setNotifForm(prev => ({ ...prev, message: e.target.value }))}
                            className="w-full px-4 py-2 bg-[rgb(var(--bg-main))] border border-[rgb(var(--border))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--accent))]/20 outline-none transition-colors h-24 resize-none"
                            placeholder="Type your message..."
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1">Recipient Type</label>
                            <select
                                value={notifForm.recipientType}
                                onChange={e => {
                                    setNotifForm(prev => ({ ...prev, recipientType: e.target.value, recipientId: '' }));
                                    setRecipientSearch('');
                                }}
                                className="w-full px-4 py-2 bg-[rgb(var(--bg-main))] border border-[rgb(var(--border))] rounded-lg outline-none"
                            >
                                <option value="all">All Users</option>
                                <option value="all_admins">All Admins</option>
                                <option value="user">Specific User</option>
                                <option value="admin">Specific Admin</option>
                            </select>
                        </div>
                        {(notifForm.recipientType === 'user' || notifForm.recipientType === 'admin') && (
                            <div className="relative">
                                <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1">Search User</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-[rgb(var(--text-muted))]" />
                                    <input
                                        type="text"
                                        value={recipientSearch}
                                        onChange={e => setRecipientSearch(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2 bg-[rgb(var(--bg-main))] border border-[rgb(var(--border))] rounded-lg outline-none"
                                        placeholder="Type name or email..."
                                    />
                                </div>
                                {recipientResults.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border))] rounded-lg shadow-xl z-50 overflow-hidden">
                                        {recipientResults.map(user => (
                                            <div
                                                key={user._id}
                                                onClick={() => {
                                                    setNotifForm(prev => ({ ...prev, recipientId: user._id }));
                                                    setRecipientSearch(`${user.fullName} (${user.email})`);
                                                    setRecipientResults([]);
                                                }}
                                                className="px-4 py-2 hover:bg-[rgb(var(--bg-main))] cursor-pointer text-sm"
                                            >
                                                <div className="font-medium text-[rgb(var(--text-primary))]">{user.fullName}</div>
                                                <div className="text-xs text-[rgb(var(--text-muted))]">{user.email}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                        <input
                            type="checkbox"
                            id="sendEmail"
                            checked={notifForm.isEmailSent}
                            onChange={e => setNotifForm(prev => ({ ...prev, isEmailSent: e.target.checked }))}
                            className="rounded border-[rgb(var(--border))] text-[rgb(var(--accent))]"
                        />
                        <label htmlFor="sendEmail" className="text-sm text-[rgb(var(--text-secondary))]">Also send as email</label>
                    </div>
                    <Button type="submit" className="w-full bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent))]/90 text-white">
                        <Send className="w-4 h-4 mr-2" /> Send Notification
                    </Button>
                </form>
            </div>

            {/* Active Broadcasts List */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-[rgb(var(--text-primary))] flex items-center gap-2">
                    <Megaphone className="w-5 h-5 text-[rgb(var(--accent))]" />
                    Active Broadcasts
                </h3>

                {loadingBroadcasts ? (
                    <div className="text-center py-8 text-[rgb(var(--text-muted))]">Loading broadcasts...</div>
                ) : broadcasts.length === 0 ? (
                    <div className="text-center py-8 bg-[rgb(var(--bg-elevated))] rounded-xl border border-dashed border-[rgb(var(--border))] text-[rgb(var(--text-muted))]">
                        No active broadcast notifications
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {broadcasts.map(broadcast => (
                            <div key={broadcast._id} className="group relative bg-[rgb(var(--bg-main))] rounded-xl p-5 border border-[rgb(var(--border))] shadow-sm hover:shadow-md transition-all overflow-hidden">
                                {/* Amazing Tag UI - Decorative Gradient */}
                                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[rgb(var(--accent))] to-transparent opacity-50" />

                                <div className="flex justify-between items-start mb-3">
                                    <div className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getTypeColor(broadcast.type)}`}>
                                        {broadcast.type.toUpperCase()}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-[rgb(var(--text-muted))]">
                                            {new Date(broadcast.createdAt).toLocaleDateString()}
                                        </span>
                                        <button
                                            onClick={() => handleDeleteBroadcast(broadcast._id)}
                                            className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                            title="Delete Broadcast"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <h4 className="font-semibold text-[rgb(var(--text-primary))] mb-1 line-clamp-1">{broadcast.title}</h4>
                                <p className="text-sm text-[rgb(var(--text-secondary))] line-clamp-2 mb-3">{broadcast.message}</p>

                                <div className="flex items-center justify-between mt-auto">
                                    <div className="flex items-center gap-2 text-xs">
                                        <span className="bg-[rgb(var(--bg-elevated))] px-2 py-0.5 rounded text-[rgb(var(--text-muted))] border border-[rgb(var(--border))]">
                                            To: {broadcast.targetAudience === 'admins' ? 'Admins Only' : 'All Users'}
                                        </span>
                                        {broadcast.emailSent && (
                                            <span className="bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded border border-blue-500/20">
                                                Email Sent
                                            </span>
                                        )}
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

export default NotificationCenter;

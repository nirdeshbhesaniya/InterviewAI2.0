import React, { useState, useEffect } from 'react';
import { Search, Send } from 'lucide-react';
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
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send notification');
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-[rgb(var(--text-primary))]">Send Notifications</h2>

            <div className="bg-[rgb(var(--bg-elevated))] p-6 rounded-2xl border border-[rgb(var(--border))] max-w-2xl">
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
        </div>
    );
};

export default NotificationCenter;

import React, { useState, useEffect } from 'react';
import { Search, Users, ShieldAlert, CheckCircle, PenSquare, Loader2 } from 'lucide-react';
import axios from '../../../utils/axiosInstance';
import { API } from '../../../utils/apiPaths';
import toast from 'react-hot-toast';
import { Button } from '../../../components/ui/button';
import UserEditModal from './UserEditModal';
import Pagination from '../../../components/common/Pagination';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [usersPage, setUsersPage] = useState(1);
    const [userSearch, setUserSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const ITEMS_PER_PAGE = 10;

    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                const usersRes = await axios.get(API.ADMIN.GET_USERS);
                setUsers(usersRes.data);
            } catch (error) {
                console.error('Error fetching users:', error);
                toast.error('Failed to load users');
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    useEffect(() => {
        setUsersPage(1);
    }, [userSearch]);

    const handleBanToggle = async (userId, currentStatus) => {
        try {
            const res = await axios.patch(API.ADMIN.BAN_USER(userId), {
                isBanned: !currentStatus
            });
            toast.success(res.data.message);
            setUsers(users.map(u => u._id === userId ? { ...u, isBanned: !currentStatus } : u));
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update user status');
        }
    };

    const handleEditUser = (user) => {
        setSelectedUser(user);
        setIsEditModalOpen(true);
    };

    const handleSaveUser = async (userId, updatedData) => {
        try {
            await axios.put(API.ADMIN.UPDATE_USER(userId), updatedData);
            toast.success('User profile updated successfully');

            // Update local state
            setUsers(users.map(u => u._id === userId ? { ...u, ...updatedData } : u));
            setIsEditModalOpen(false);
        } catch (error) {
            console.error('Update failed:', error);
            toast.error(error.response?.data?.message || 'Failed to update user');
        }
    };

    const filteredUsers = users.filter(user =>
        user.fullName?.toLowerCase().includes(userSearch.toLowerCase()) ||
        user.email?.toLowerCase().includes(userSearch.toLowerCase())
    );

    // Pagination Logic for Users (Client-side)
    const indexOfLastItem = usersPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
    const totalUserPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <Loader2 className="w-10 h-10 text-[rgb(var(--accent))] animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center gap-4 flex-wrap">
                <h2 className="text-xl font-bold text-[rgb(var(--text-primary))]">User Management</h2>
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--text-muted))]" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border))] rounded-xl text-sm text-[rgb(var(--text-primary))] focus:ring-2 focus:ring-[rgb(var(--accent))]/20 focus:border-[rgb(var(--accent))] outline-none transition-all"
                    />
                </div>
            </div>

            {/* Mobile View: User Cards */}
            <div className="md:hidden space-y-4 pb-24">
                {currentUsers.map((user) => (
                    <div key={user._id} className="bg-[rgb(var(--bg-elevated))] p-4 rounded-xl border border-[rgb(var(--border))] shadow-sm active:scale-[0.99] transition-transform">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="relative shrink-0">
                                    <img src={user.photo || '/default-avatar.jpg'} alt="" className="w-10 h-10 rounded-full object-cover ring-2 ring-[rgb(var(--bg-main))]" />
                                    <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[rgb(var(--bg-elevated))] ${user.isBanned ? 'bg-red-500' : 'bg-green-500'}`} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="font-semibold text-[rgb(var(--text-primary))] truncate">{user.fullName}</div>
                                    <div className="text-xs text-[rgb(var(--text-muted))] truncate">{user.email}</div>
                                </div>
                            </div>
                            {user.isBanned ? (
                                <span className="shrink-0 inline-flex items-center gap-1.5 text-red-600 dark:text-red-400 font-medium text-xs bg-red-500/10 px-2 py-1 rounded-full">
                                    <ShieldAlert className="w-3 h-3" /> Suspended
                                </span>
                            ) : (
                                <span className="shrink-0 inline-flex items-center gap-1.5 text-green-600 dark:text-green-400 font-medium text-xs bg-green-500/10 px-2 py-1 rounded-full">
                                    <CheckCircle className="w-3 h-3" /> Active
                                </span>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-[rgb(var(--border))]">
                            <div>
                                <span className="text-xs text-[rgb(var(--text-muted))] block mb-1">Role</span>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${user.role === 'admin'
                                    ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-900'
                                    : 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
                                    }`}>
                                    {user.role}
                                </span>
                            </div>
                            <div>
                                <span className="text-xs text-[rgb(var(--text-muted))] block mb-1">Joined</span>
                                <span className="text-sm text-[rgb(var(--text-primary))]">
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleEditUser(user)} className="h-9 px-4 text-xs">
                                <PenSquare className="w-3.5 h-3.5 mr-1.5" /> Edit
                            </Button>
                            {user.role !== 'admin' && user.role !== 'owner' && (
                                <Button
                                    size="sm"
                                    variant={user.isBanned ? "outline" : "ghost"}
                                    onClick={() => handleBanToggle(user._id, user.isBanned)}
                                    className={`h-9 px-4 text-xs ${user.isBanned
                                        ? "bg-green-500/10 text-green-600 hover:bg-green-500/20 shadow-none border-green-200"
                                        : "text-red-500 hover:bg-red-500/10 hover:text-red-600 bg-red-500/5"
                                        }`}
                                >
                                    {user.isBanned ? (
                                        <> <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Unban </>
                                    ) : (
                                        <> <ShieldAlert className="w-3.5 h-3.5 mr-1.5" /> Ban </>
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
                {filteredUsers.length === 0 && (
                    <div className="py-12 text-center text-[rgb(var(--text-muted))] bg-[rgb(var(--bg-elevated))] rounded-xl border border-[rgb(var(--border))]">
                        No users found.
                    </div>
                )}
            </div>

            {/* Desktop View: Table */}
            <div className="hidden md:block overflow-x-auto rounded-xl border border-[rgb(var(--border))]">
                <table className="w-full text-left">
                    <thead className="bg-[rgb(var(--bg-elevated))]">
                        <tr>
                            <th className="py-4 px-6 text-xs font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wider">User</th>
                            <th className="hidden md:table-cell py-4 px-6 text-xs font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wider">Role</th>
                            <th className="py-4 px-6 text-xs font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wider">Status</th>
                            <th className="hidden lg:table-cell py-4 px-6 text-xs font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wider">Joined</th>
                            <th className="py-4 px-6 text-right text-xs font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[rgb(var(--border))]">
                        {currentUsers.map((user) => (
                            <tr key={user._id} className="group hover:bg-[rgb(var(--bg-elevated-alt))] transition-colors">
                                <td className="py-4 px-6">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <img src={user.photo || '/default-avatar.jpg'} alt="" className="w-10 h-10 rounded-full object-cover ring-2 ring-[rgb(var(--bg-main))]" />
                                            <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[rgb(var(--bg-card))] ${user.isBanned ? 'bg-red-500' : 'bg-green-500'}`} />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-[rgb(var(--text-primary))]">{user.fullName}</div>
                                            <div className="text-xs text-[rgb(var(--text-muted))]">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="hidden md:table-cell py-4 px-6">
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${user.role === 'admin'
                                        ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-900'
                                        : 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
                                        }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="py-4 px-6">
                                    {user.isBanned ? (
                                        <span className="inline-flex items-center gap-1.5 text-red-600 dark:text-red-400 font-medium text-sm">
                                            <ShieldAlert className="w-4 h-4" /> Suspended
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 text-green-600 dark:text-green-400 font-medium text-sm">
                                            <CheckCircle className="w-4 h-4" /> Active
                                        </span>
                                    )}
                                </td>
                                <td className="hidden lg:table-cell py-4 px-6 text-sm text-[rgb(var(--text-secondary))]">
                                    {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                </td>
                                <td className="py-4 px-6 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleEditUser(user)}
                                            className="h-8 w-8 p-0 rounded-full border-[rgb(var(--border))]"
                                            title="Edit User"
                                        >
                                            <PenSquare className="w-4 h-4 text-[rgb(var(--text-secondary))]" />
                                        </Button>

                                        {user.role !== 'admin' && user.role !== 'owner' && (
                                            <Button
                                                size="sm"
                                                variant={user.isBanned ? "outline" : "ghost"}
                                                onClick={() => handleBanToggle(user._id, user.isBanned)}
                                                className={`h-8 w-8 p-0 rounded-full ${user.isBanned
                                                    ? "bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 hover:bg-green-500/20"
                                                    : "text-red-500 dark:text-red-400 hover:bg-red-500/10"
                                                    }`}
                                                title={user.isBanned ? "Unban User" : "Ban User"}
                                            >
                                                {user.isBanned ? <CheckCircle className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                                            </Button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredUsers.length === 0 && (
                            <tr>
                                <td colSpan="5" className="py-12 text-center text-[rgb(var(--text-muted))]">
                                    No users found matching your search.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <Pagination
                currentPage={usersPage}
                totalPages={totalUserPages}
                onPageChange={setUsersPage}
            />

            {/* Edit User Modal */}
            <UserEditModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                user={selectedUser}
                onSave={handleSaveUser}
                currentUserRole={JSON.parse(localStorage.getItem("user"))?.role}
            />
        </div>
    );
};

export default UserManagement;

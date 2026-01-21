import React, { useState, useEffect } from 'react';
import { Search, FileIcon, UserCheck, CheckCircle, XCircle } from 'lucide-react';
import axios from '../../../utils/axiosInstance';
import { API } from '../../../utils/apiPaths';
import toast from 'react-hot-toast';
import { Button } from '../../../components/ui/button';
import Pagination from '../../../components/common/Pagination';

const PendingNotes = () => {
    const [pendingNotes, setPendingNotes] = useState([]);
    const [notesPage, setNotesPage] = useState(1);
    const [notesTotalPages, setNotesTotalPages] = useState(1);
    const [notesType, setNotesType] = useState('all');
    const [notesSearch, setNotesSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        const fetchNotes = async () => {
            setLoading(true);
            try {
                const notesRes = await axios.get(API.NOTES.ADMIN_PENDING, {
                    params: {
                        page: notesPage,
                        limit: ITEMS_PER_PAGE,
                        type: notesType,
                        search: notesSearch
                    }
                });
                setPendingNotes(notesRes.data.notes || []);
                setNotesTotalPages(notesRes.data.pagination?.totalPages || 1);
            } catch (error) {
                console.error('Error fetching notes:', error);
                // toast.error('Failed to load pending notes');
            } finally {
                setLoading(false);
            }
        };
        fetchNotes();
    }, [notesPage, notesType, notesSearch]);

    const handleNoteAction = async (noteId, status) => {
        try {
            await axios.patch(API.NOTES.UPDATE_STATUS(noteId), { status });
            toast.success(`Note ${status}`);
            setPendingNotes(pendingNotes.filter(n => n._id !== noteId));
        } catch (error) {
            toast.error('Failed to update note status');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <h2 className="text-xl font-bold text-[rgb(var(--text-primary))]">Pending Notes</h2>

                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto items-center">
                    <div className="relative w-full sm:w-auto">
                        <Search className="w-5 h-5 absolute left-3 top-2.5 text-[rgb(var(--text-muted))]" />
                        <input
                            type="text"
                            placeholder="Search notes..."
                            value={notesSearch}
                            onChange={(e) => setNotesSearch(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border))] rounded-lg text-sm text-[rgb(var(--text-primary))] focus:ring-[rgb(var(--accent))] focus:border-[rgb(var(--accent))] outline-none w-full sm:w-64"
                        />
                    </div>
                    <select
                        value={notesType}
                        onChange={(e) => setNotesType(e.target.value)}
                        className="bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border))] text-[rgb(var(--text-primary))] text-sm rounded-lg focus:ring-[rgb(var(--accent))] focus:border-[rgb(var(--accent))] block p-2.5 outline-none w-full sm:w-auto"
                    >
                        <option value="all">All Types</option>
                        <option value="General">General</option>
                        <option value="Interview">Interview</option>
                        <option value="Technical">Technical</option>
                    </select>
                </div>
            </div>

            {pendingNotes.length === 0 ? (
                <div className="py-16 text-center text-[rgb(var(--text-muted))] bg-[rgb(var(--bg-elevated))]/50 rounded-2xl border-2 border-dashed border-[rgb(var(--border))]">
                    <FileIcon className="mx-auto h-12 w-12 text-[rgb(var(--text-muted))]" />
                    <h3 className="mt-2 text-sm font-semibold text-[rgb(var(--text-primary))]">No pending notes</h3>
                </div>
            ) : (
                <div className="grid gap-4">
                    {pendingNotes.map((note) => (
                        <div key={note._id} className="bg-[rgb(var(--bg-main))] p-5 rounded-2xl border border-[rgb(var(--border))] hover:border-[rgb(var(--accent))]/30 transition-shadow shadow-sm">
                            <div className="flex justify-between items-start gap-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))] line-clamp-1">{note.title}</h3>
                                        <span className="px-2 py-0.5 rounded-full bg-[rgb(var(--accent))]/10 text-[rgb(var(--accent))] text-xs font-medium border border-[rgb(var(--accent))]/20">
                                            {note.type}
                                        </span>
                                    </div>
                                    {note.description && (
                                        <p className="text-sm text-[rgb(var(--text-secondary))] mb-3 line-clamp-2">{note.description}</p>
                                    )}
                                    <div className="flex items-center gap-4 text-xs text-[rgb(var(--text-muted))]">
                                        <span className="flex items-center gap-1.5">
                                            <UserCheck className="w-3.5 h-3.5" />
                                            {note.userName || 'Unknown User'}
                                        </span>
                                        <span>•</span>
                                        <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-9 px-3 border-[rgb(var(--border))] hover:bg-[rgb(var(--bg-elevated))]"
                                        onClick={() => window.open(note.link, '_blank')}
                                        title="View Content"
                                    >
                                        <div className="flex items-center gap-2">
                                            {note.type === 'youtube' ? (
                                                <span className="text-red-500 font-bold text-xs">YT</span>
                                            ) : (
                                                <span className="text-blue-500 font-bold text-xs">PDF</span>
                                            )}
                                        </div>
                                    </Button>
                                    <Button
                                        size="sm"
                                        className="h-9 px-3 bg-green-600 hover:bg-green-700 text-white border-0 shadow-sm"
                                        onClick={() => handleNoteAction(note._id, 'approved')}
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        className="h-9 px-3 shadow-sm bg-red-600 hover:bg-red-700"
                                        onClick={() => handleNoteAction(note._id, 'rejected')}
                                    >
                                        <XCircle className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {pendingNotes.length > 0 && (
                <Pagination
                    currentPage={notesPage}
                    totalPages={notesTotalPages}
                    onPageChange={setNotesPage}
                />
            )}
        </div>
    );
};

export default PendingNotes;

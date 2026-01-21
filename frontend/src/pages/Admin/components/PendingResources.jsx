import React, { useState, useEffect } from 'react';
import { Search, BookOpen, CheckCircle, XCircle } from 'lucide-react';
import axios from '../../../utils/axiosInstance';
import { API } from '../../../utils/apiPaths';
import toast from 'react-hot-toast';
import { Button } from '../../../components/ui/button';
import Pagination from '../../../components/common/Pagination';
import { BRANCHES } from '../../../utils/constants';

const PendingResources = () => {
    const [pendingResources, setPendingResources] = useState([]);
    const [resourcesPage, setResourcesPage] = useState(1);
    const [resourcesTotalPages, setResourcesTotalPages] = useState(1);
    const [resourceBranch, setResourceBranch] = useState('all');
    const [resourceSemester, setResourceSemester] = useState('all');
    const [resourceSearch, setResourceSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        const fetchResources = async () => {
            setLoading(true);
            try {
                const resourcesRes = await axios.get(API.RESOURCES.ADMIN_PENDING, {
                    params: {
                        page: resourcesPage,
                        limit: ITEMS_PER_PAGE,
                        branch: resourceBranch,
                        semester: resourceSemester,
                        search: resourceSearch
                    }
                });
                setPendingResources(resourcesRes.data.resources || []);
                setResourcesTotalPages(resourcesRes.data.pagination?.totalPages || 1);
            } catch (error) {
                console.error('Error fetching resources:', error);
                // toast.error('Failed to load pending resources');
            } finally {
                setLoading(false);
            }
        };
        fetchResources();
    }, [resourcesPage, resourceBranch, resourceSemester, resourceSearch]);

    const handleResourceAction = async (resourceId, status) => {
        try {
            await axios.patch(API.RESOURCES.UPDATE_STATUS(resourceId), { status });
            toast.success(`Resource ${status}`);
            setPendingResources(pendingResources.filter(r => r._id !== resourceId));
        } catch (error) {
            toast.error('Failed to update resource status');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <h2 className="text-xl font-bold text-[rgb(var(--text-primary))]">Pending Resources</h2>

                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto items-center">
                    <div className="relative w-full sm:w-auto">
                        <Search className="w-5 h-5 absolute left-3 top-2.5 text-[rgb(var(--text-muted))]" />
                        <input
                            type="text"
                            placeholder="Search resources..."
                            value={resourceSearch}
                            onChange={(e) => setResourceSearch(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border))] rounded-lg text-sm text-[rgb(var(--text-primary))] focus:ring-[rgb(var(--accent))] focus:border-[rgb(var(--accent))] outline-none w-full sm:w-64"
                        />
                    </div>
                    <select
                        value={resourceBranch}
                        onChange={(e) => setResourceBranch(e.target.value)}
                        className="bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border))] text-[rgb(var(--text-primary))] text-sm rounded-lg focus:ring-[rgb(var(--accent))] focus:border-[rgb(var(--accent))] block p-2.5 outline-none w-full sm:w-auto"
                    >
                        <option value="all">All Branches</option>
                        {BRANCHES.map(b => (
                            <option key={b.id} value={b.name}>{b.name}</option>
                        ))}
                    </select>
                    <select
                        value={resourceSemester}
                        onChange={(e) => setResourceSemester(e.target.value)}
                        className="bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border))] text-[rgb(var(--text-primary))] text-sm rounded-lg focus:ring-[rgb(var(--accent))] focus:border-[rgb(var(--accent))] block p-2.5 outline-none w-full sm:w-auto"
                    >
                        <option value="all">All Semesters</option>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                            <option key={s} value={s}>Sem {s}</option>
                        ))}
                    </select>
                </div>
            </div>

            {pendingResources.length === 0 ? (
                <div className="py-16 text-center text-[rgb(var(--text-muted))] bg-[rgb(var(--bg-elevated))]/50 rounded-2xl border-2 border-dashed border-[rgb(var(--border))]">
                    <BookOpen className="mx-auto h-12 w-12 text-[rgb(var(--text-muted))]" />
                    <h3 className="mt-2 text-sm font-semibold text-[rgb(var(--text-primary))]">No pending resources</h3>
                </div>
            ) : (
                <div className="grid gap-4">
                    {pendingResources.map((resource) => (
                        <div key={resource._id} className="bg-[rgb(var(--bg-main))] p-5 rounded-2xl border border-[rgb(var(--border))] hover:border-[rgb(var(--accent))]/30 transition-shadow shadow-sm">
                            <div className="flex justify-between items-start gap-4">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))] line-clamp-1">{resource.subject}</h3>
                                        <span className="px-2 py-0.5 rounded-full bg-[rgb(var(--accent))]/10 text-[rgb(var(--accent))] text-xs font-medium border border-[rgb(var(--accent))]/20">
                                            {resource.branch} • Sem:  {resource.semester}
                                        </span>
                                    </div>
                                    <div className="text-sm text-[rgb(var(--text-secondary))] mb-3">
                                        <a href={resource.link} target="_blank" rel="noopener noreferrer" className="text-[rgb(var(--accent))] hover:underline flex items-center gap-1">
                                            <BookOpen className="w-3.5 h-3.5" /> View Resource
                                        </a>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-[rgb(var(--text-muted))]">
                                        <span>Uploaded by: {resource.uploadedBy?.fullName || 'Unknown'}</span>
                                        <span>•</span>
                                        <span>{new Date(resource.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                    <Button
                                        size="sm"
                                        className="h-9 px-3 bg-green-600 hover:bg-green-700 text-white border-0 shadow-sm"
                                        onClick={() => handleResourceAction(resource._id, 'approved')}
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        className="h-9 px-3 shadow-sm bg-red-600 hover:bg-red-700"
                                        onClick={() => handleResourceAction(resource._id, 'rejected')}
                                    >
                                        <XCircle className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {pendingResources.length > 0 && (
                <Pagination
                    currentPage={resourcesPage}
                    totalPages={resourcesTotalPages}
                    onPageChange={setResourcesPage}
                />
            )}
        </div>
    );
};

export default PendingResources;

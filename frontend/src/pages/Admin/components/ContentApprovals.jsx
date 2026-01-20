import React, { useState, useEffect } from 'react';
import { Search, CheckCircle, ExternalLink, ChevronDown, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from '../../../utils/axiosInstance';
import { API } from '../../../utils/apiPaths';
import toast from 'react-hot-toast';
import { Button } from '../../../components/ui/button';
import AnswerRenderer from '../../../components/interview/AnswerRenderer';
import Pagination from '../../../components/common/Pagination';

const ApprovalItem = ({ req, onApprove, onReject }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <motion.div
            layout
            className="bg-[rgb(var(--bg-main))] rounded-2xl border border-[rgb(var(--border))] hover:border-[rgb(var(--accent))]/50 transition-colors shadow-sm overflow-hidden"
        >
            <div className="p-5">
                <div className="flex flex-col gap-4">
                    {/* Header: Meta info */}
                    <div className="flex items-center gap-3 text-xs flex-wrap">
                        <span className="px-2.5 py-1 rounded-md bg-[rgb(var(--accent))]/10 text-[rgb(var(--accent))] font-medium border border-[rgb(var(--accent))]/20">
                            {req.category}
                        </span>
                        <span className="text-[rgb(var(--text-muted))]">
                            Requested by <span className="text-[rgb(var(--text-primary))] font-medium">{req.requestedBy.fullName || 'Unknown'}</span>
                        </span>
                        <span className="w-1 h-1 rounded-full bg-[rgb(var(--text-muted))]" />
                        <span className="text-[rgb(var(--text-muted))]">
                            {new Date(req.createdAt).toLocaleDateString()}
                        </span>
                    </div>

                    {/* Question & Actions */}
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-start">
                        <div className="flex-1 min-w-0">
                            <h3 className="text-base font-semibold text-[rgb(var(--text-primary))] mb-2">
                                <a
                                    href={`/interview-prep/${req.sessionId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-[rgb(var(--accent))] hover:underline flex items-center gap-2 transition-colors break-words"
                                >
                                    {req.question}
                                    <ExternalLink className="w-3.5 h-3.5 inline-block opacity-50 shrink-0" />
                                </a>
                            </h3>
                        </div>

                        <div className="flex gap-2 shrink-0 w-full md:w-auto">
                            <Button
                                size="sm"
                                className="flex-1 md:flex-none bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20 border-hidden"
                                onClick={() => onApprove(req.sessionId, req.qnaId)}
                            >
                                <CheckCircle className="w-4 h-4 mr-2" /> Approve
                            </Button>
                            <Button
                                size="sm"
                                variant="destructive"
                                className="flex-1 md:flex-none shadow-lg shadow-red-600/20"
                                onClick={() => onReject(req.sessionId, req.qnaId)}
                            >
                                <XCircle className="w-4 h-4 mr-2" /> Reject
                            </Button>
                        </div>
                    </div>

                    {/* Expand Toggle */}
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex items-center gap-2 text-xs font-medium text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--accent))] transition-colors w-fit"
                    >
                        {isExpanded ? 'Hide Answer' : 'View Answer'}
                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Expanded Answer Content */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="px-5 pb-5 border-t border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated))]/30">
                            <div className="pt-4">
                                <AnswerRenderer answer={req.answerParts} />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const ContentApprovals = () => {
    const [qnaRequests, setQnaRequests] = useState([]);
    const [qnaPage, setQnaPage] = useState(1);
    const [qnaTotalPages, setQnaTotalPages] = useState(1);
    const [qnaCategory, setQnaCategory] = useState('');
    const [qnaSearch, setQnaSearch] = useState('');
    const [qnaTotal, setQnaTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        const fetchRequests = async () => {
            setLoading(true);
            try {
                const qnaRes = await axios.get(API.ADMIN.GET_QNA_REQUESTS, {
                    params: {
                        page: qnaPage,
                        limit: ITEMS_PER_PAGE,
                        category: qnaCategory,
                        search: qnaSearch
                    }
                });
                setQnaRequests(qnaRes.data.data || []);
                setQnaTotalPages(qnaRes.data.pagination?.totalPages || 1);
                setQnaTotal(qnaRes.data.pagination?.totalRequests || 0);
            } catch (error) {
                console.error('Error fetching QnA requests:', error);
                // toast.error('Failed to load QnA requests');
            } finally {
                setLoading(false);
            }
        };
        fetchRequests();
    }, [qnaPage, qnaCategory, qnaSearch]);

    const handleQnaAction = async (sessionId, qnaId, action) => {
        try {
            if (action === 'approve') {
                await axios.patch(API.ADMIN.APPROVE_QNA(sessionId, qnaId));
                toast.success('Question approved');
            } else {
                await axios.patch(API.ADMIN.REJECT_QNA(sessionId, qnaId));
                toast.success('Question rejected');
            }
            setQnaRequests(qnaRequests.filter(q => q.qnaId !== qnaId));
        } catch (error) {
            toast.error('Failed to process request');
        }
    };

    const handleApproveAll = async () => {
        if (!window.confirm('Are you sure you want to approve ALL pending questions? This cannot be undone.')) {
            return;
        }

        try {
            const response = await axios.post(API.ADMIN.APPROVE_ALL_QNA);
            toast.success(response.data.message);
            // Refresh data
            const qnaRes = await axios.get(API.ADMIN.GET_QNA_REQUESTS);
            setQnaRequests(qnaRes.data);
            setQnaTotalPages(1); // Assuming quick reset or refetch handled above if we kept using the same func
            setQnaTotal(0);
        } catch (error) {
            console.error('Error approving all:', error);
            toast.error('Failed to approve all requests');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <h2 className="text-xl font-bold text-[rgb(var(--text-primary))]">Content Approvals</h2>

                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto items-center">
                    <div className="relative w-full sm:w-auto">
                        <Search className="w-5 h-5 absolute left-3 top-2.5 text-[rgb(var(--text-muted))]" />
                        <input
                            type="text"
                            placeholder="Search requests..."
                            value={qnaSearch}
                            onChange={(e) => setQnaSearch(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border))] rounded-lg text-sm text-[rgb(var(--text-primary))] focus:ring-[rgb(var(--accent))] focus:border-[rgb(var(--accent))] outline-none w-full sm:w-64"
                        />
                    </div>
                    <select
                        value={qnaCategory}
                        onChange={(e) => setQnaCategory(e.target.value)}
                        className="bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border))] text-[rgb(var(--text-primary))] text-sm rounded-lg focus:ring-[rgb(var(--accent))] focus:border-[rgb(var(--accent))] block p-2.5 outline-none w-full sm:w-auto"
                    >
                        <option value="">All Categories</option>
                        <option value="Technical">Technical</option>
                        <option value="HR">HR</option>
                        <option value="Behavioral">Behavioral</option>
                    </select>

                    {qnaRequests.length > 0 && (
                        <button
                            onClick={handleApproveAll}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 transition-colors font-medium shadow-sm whitespace-nowrap w-full sm:w-auto justify-center"
                        >
                            <CheckCircle className="w-5 h-5" />
                            Approve All ({qnaTotal})
                        </button>
                    )}
                </div>
            </div>

            {qnaRequests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-[rgb(var(--border))] rounded-2xl bg-[rgb(var(--bg-elevated))]/30">
                    <div className="p-4 bg-green-500/10 rounded-full mb-4">
                        <CheckCircle className="w-12 h-12 text-green-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))]">All caught up!</h3>
                    <p className="text-[rgb(var(--text-secondary))] max-w-xs mx-auto mt-2">There are no pending QA requests requiring your attention right now.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {qnaRequests.map((req) => (
                        <ApprovalItem
                            key={req.qnaId}
                            req={req}
                            onApprove={(sid, qid) => handleQnaAction(sid, qid, 'approve')}
                            onReject={(sid, qid) => handleQnaAction(sid, qid, 'reject')}
                        />
                    ))}
                </div>
            )}
            {qnaRequests.length > 0 && (
                <Pagination
                    currentPage={qnaPage}
                    totalPages={qnaTotalPages}
                    onPageChange={setQnaPage}
                />
            )}
        </div>
    );
};

export default ContentApprovals;

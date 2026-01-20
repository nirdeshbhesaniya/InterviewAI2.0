import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Clock, FileQuestion, ChevronDown, CheckCircle, PenSquare } from 'lucide-react';
import axios from '../../../utils/axiosInstance';
import { API } from '../../../utils/apiPaths';
import toast from 'react-hot-toast';
import { Button } from '../../../components/ui/button';
import Pagination from '../../../components/common/Pagination';
import PracticeTestModal from './PracticeTestModal'; // Adjusted import path if needed, assuming sibling or check path

const PracticeTestsManagement = () => {
    const [practiceTests, setPracticeTests] = useState([]);
    const [practicePage, setPracticePage] = useState(1);
    const [practiceTotalPages, setPracticeTotalPages] = useState(1);
    const [practiceSearch, setPracticeSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const ITEMS_PER_PAGE = 10;

    // Modal State
    const [isPracticeModalOpen, setIsPracticeModalOpen] = useState(false);
    const [selectedTest, setSelectedTest] = useState(null);

    useEffect(() => {
        const fetchTests = async () => {
            setLoading(true);
            try {
                const practiceRes = await axios.get(API.MCQ.PRACTICE_LIST, {
                    params: {
                        page: practicePage,
                        limit: ITEMS_PER_PAGE,
                        search: practiceSearch
                    }
                });
                setPracticeTests(practiceRes.data.data || []);
                setPracticeTotalPages(practiceRes.data.pagination?.totalPages || 1);
            } catch (error) {
                console.error('Error fetching practice tests:', error);
                // toast.error('Failed to load practice tests');
            } finally {
                setLoading(false);
            }
        };
        fetchTests();
    }, [practicePage, practiceSearch]);

    const handleCreateTest = () => {
        setSelectedTest(null);
        setIsPracticeModalOpen(true);
    };

    const handleSaveTest = async (id, data) => {
        try {
            if (id) {
                await axios.put(API.ADMIN.UPDATE_PRACTICE_TEST(id), data);
                toast.success('Test updated successfully');
            } else {
                await axios.post(API.ADMIN.CREATE_PRACTICE_TEST, data);
                toast.success('Test created successfully');
            }
            setIsPracticeModalOpen(false);
            // Refresh list
            const res = await axios.get(API.MCQ.PRACTICE_LIST, {
                params: { page: practicePage, limit: ITEMS_PER_PAGE, search: practiceSearch }
            });
            setPracticeTests(res.data.data || []);
        } catch (error) {
            console.error('Save failed:', error);
            toast.error('Failed to save test');
        }
    };

    const handleDeleteTest = async (id) => {
        if (!window.confirm('Are you sure you want to delete this test?')) return;
        try {
            await axios.delete(API.ADMIN.DELETE_PRACTICE_TEST(id));
            toast.success('Test deleted');
            setPracticeTests(practiceTests.filter(t => t._id !== id));
        } catch (error) {
            toast.error('Failed to delete test');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <h2 className="text-xl font-bold text-[rgb(var(--text-primary))]">Practice Tests</h2>

                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto items-center">
                    <div className="relative w-full sm:w-auto">
                        <Search className="w-5 h-5 absolute left-3 top-2.5 text-[rgb(var(--text-muted))]" />
                        <input
                            type="text"
                            placeholder="Search tests..."
                            value={practiceSearch}
                            onChange={(e) => setPracticeSearch(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border))] rounded-lg text-sm text-[rgb(var(--text-primary))] focus:ring-[rgb(var(--accent))] focus:border-[rgb(var(--accent))] outline-none w-full sm:w-64"
                        />
                    </div>
                    <Button onClick={handleCreateTest} className="w-full sm:w-auto bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent))]/90 text-white">
                        <Plus className="w-4 h-4 mr-2" /> Create Test
                    </Button>
                </div>
            </div>

            {practiceTests.length === 0 ? (
                <div className="py-16 text-center text-[rgb(var(--text-muted))] bg-[rgb(var(--bg-elevated))]/50 rounded-2xl border-2 border-dashed border-[rgb(var(--border))]">
                    <FileQuestion className="mx-auto h-12 w-12 text-[rgb(var(--text-muted))]" />
                    <h3 className="mt-2 text-sm font-semibold text-[rgb(var(--text-primary))]">No practice tests found</h3>
                    <p className="text-xs mt-1">Create one to get started!</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {practiceTests.map((test) => (
                        <div key={test._id} className="bg-[rgb(var(--bg-main))] p-5 rounded-2xl border border-[rgb(var(--border))] hover:border-[rgb(var(--accent))]/30 transition-shadow shadow-sm group">
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))]">{test.title}</h3>
                                        <span className="px-2.5 py-0.5 rounded-full bg-[rgb(var(--bg-elevated))] text-[rgb(var(--text-secondary))] text-xs font-medium border border-[rgb(var(--border))]">
                                            {test.questions?.length || 0} Questions
                                        </span>
                                    </div>
                                    <p className="text-sm text-[rgb(var(--text-secondary))] mb-3 line-clamp-2">{test.description}</p>

                                    <div className="flex items-center gap-4 text-xs text-[rgb(var(--text-muted))]">
                                        <div className="flex items-center gap-1.5 bg-[rgb(var(--bg-elevated))] px-2 py-1 rounded-md">
                                            <Clock className="w-3.5 h-3.5" />
                                            {test.timeLimit || (test.questions?.length || 0) * 2} mins
                                        </div>
                                        <span>Created: {new Date(test.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <div className="flex gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => { setSelectedTest(test); setIsPracticeModalOpen(true); }}
                                        className="h-9 w-9 p-0 rounded-lg border-[rgb(var(--border))]"
                                    >
                                        <PenSquare className="w-4 h-4 text-[rgb(var(--text-secondary))]" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => handleDeleteTest(test._id)}
                                        className="h-9 w-9 p-0 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-600 border-0 shadow-none"
                                        title="Delete Test"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {practiceTests.length > 0 && (
                <Pagination
                    currentPage={practicePage}
                    totalPages={practiceTotalPages}
                    onPageChange={setPracticePage}
                />
            )}

            <PracticeTestModal
                isOpen={isPracticeModalOpen}
                onClose={() => setIsPracticeModalOpen(false)}
                onSave={handleSaveTest}
                testToEdit={selectedTest}
            />
        </div>
    );
};

export default PracticeTestsManagement;

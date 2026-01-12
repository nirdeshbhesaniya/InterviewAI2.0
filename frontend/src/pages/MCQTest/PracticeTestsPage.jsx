import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileQuestion, Clock, ArrowRight, BookOpen, BarChart2 } from 'lucide-react';
import axios from '../../utils/axiosInstance';
import { API } from '../../utils/apiPaths';
import { Button } from '../../components/ui/button';
import toast from 'react-hot-toast';

const PracticeTestsPage = () => {
    const navigate = useNavigate();
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTests = async () => {
            try {
                const res = await axios.get(API.MCQ.PRACTICE_LIST);
                setTests(res.data.data || []);
            } catch (error) {
                console.error('Error fetching practice tests:', error);
                toast.error('Failed to load practice tests');
            } finally {
                setLoading(false);
            }
        };
        fetchTests();
    }, []);

    const handleStartTest = (testId) => {
        navigate(`/mcq-test/practice/${testId}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-24 px-6 flex justify-center">
                <div className="w-8 h-8 border-4 border-[rgb(var(--accent))] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 px-6 pb-12 bg-background">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center space-y-4">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl font-bold bg-gradient-to-r from-[rgb(var(--accent))] to-purple-500 bg-clip-text text-transparent"
                    >
                        Practice Tests
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-[rgb(var(--text-secondary))] text-lg max-w-2xl mx-auto"
                    >
                        Challenge yourself with curated practice tests created by experts.
                    </motion.p>
                </div>

                {/* Tests Grid */}
                {tests.length === 0 ? (
                    <div className="text-center py-16 bg-[rgb(var(--bg-card))] rounded-2xl border border-[rgb(var(--border))]">
                        <FileQuestion className="w-16 h-16 text-[rgb(var(--text-muted))] mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-[rgb(var(--text-primary))]">No Practice Tests Available</h3>
                        <p className="text-[rgb(var(--text-secondary))] mt-2">Check back later for new tests.</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tests.map((test, index) => (
                            <motion.div
                                key={test._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-[rgb(var(--bg-card))] rounded-2xl border border-[rgb(var(--border))] overflow-hidden hover:shadow-lg transition-all hover:border-[rgb(var(--accent))]/50 group"
                            >
                                <div className="p-6 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className="px-3 py-1 bg-[rgb(var(--bg-elevated))] rounded-full text-xs font-medium text-[rgb(var(--text-secondary))] uppercase tracking-wider">
                                            {test.topic}
                                        </div>
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize 
                                            ${test.difficulty === 'easy' ? 'bg-green-500/10 text-green-500' :
                                                test.difficulty === 'hard' ? 'bg-red-500/10 text-red-500' :
                                                    'bg-yellow-500/10 text-yellow-500'}`}>
                                            {test.difficulty}
                                        </span>
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-bold text-[rgb(var(--text-primary))] group-hover:text-[rgb(var(--accent))] transition-colors">
                                            {test.title}
                                        </h3>
                                        <p className="text-[rgb(var(--text-secondary))] text-sm mt-2 line-clamp-2">
                                            {test.description}
                                        </p>
                                    </div>

                                    <div className="pt-4 border-t border-[rgb(var(--border))] flex items-center justify-between text-sm text-[rgb(var(--text-secondary))]">
                                        <div className="flex items-center gap-2">
                                            <BookOpen className="w-4 h-4" />
                                            <span>{test.questions.length || 0} Questions</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <BarChart2 className="w-4 h-4" />
                                            <span>{test.attempts || 0} Attempts</span>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={() => handleStartTest(test._id)}
                                        className="w-full bg-[rgb(var(--bg-elevated))] hover:bg-[rgb(var(--accent))] hover:text-white text-[rgb(var(--text-primary))] transition-all group-hover:shadow-lg group-hover:shadow-[rgb(var(--accent))]/20"
                                    >
                                        Start Practice <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PracticeTestsPage;

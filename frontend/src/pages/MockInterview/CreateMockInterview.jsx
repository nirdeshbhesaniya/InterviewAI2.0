import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/axiosInstance';
import { Loader2, ArrowLeft, BrainCircuit, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';

const CreateMockInterview = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        degree: '',
        skills: '',
        interviewType: 'Technical',
        difficulty: 'Basic',
        focusArea: '',
        questionCount: '5',
        resumeFile: null
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type === "application/pdf") {
            if (file.size > 5 * 1024 * 1024) {
                toast.error("File size must be less than 5MB");
                return;
            }
            setFormData({ ...formData, resumeFile: file });
        } else {
            toast.error("Please upload a valid PDF file");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Must use FormData to send files
            const submitData = new FormData();
            Object.keys(formData).forEach(key => {
                if (key === 'resumeFile' && formData[key]) {
                    submitData.append('resume', formData[key]);
                } else if (key !== 'resumeFile') {
                    submitData.append(key, formData[key]);
                }
            });

            const response = await axios.post('/mock-interview', submitData);

            if (response.data) {
                toast.success("Interview Created Successfully!");
                navigate('/mock-interview');
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to create interview. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[rgb(var(--bg-background))] p-6 md:p-10 flex flex-col items-center">
            <div className="w-full max-w-2xl">
                <button onClick={() => navigate('/mock-interview')} className="mb-6 flex items-center gap-2 text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-primary))] transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back
                </button>

                <div className="bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border))] shadow-xl rounded-2xl p-8">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-[rgb(var(--accent))]/10 rounded-lg">
                            <BrainCircuit className="w-8 h-8 text-[rgb(var(--accent))]" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-[rgb(var(--text-primary))]">Setup Interview</h1>
                            <p className="text-[rgb(var(--text-muted))]">Customize your AI mock interview session</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1">Current Degree / Status</label>
                                <input
                                    type="text"
                                    name="degree"
                                    required
                                    placeholder="Ex. B.Tech CSE, Final Year"
                                    className="w-full p-3 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated-alt))] text-[rgb(var(--text-primary))] focus:ring-2 focus:ring-[rgb(var(--accent))] outline-none"
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1">Interview Type</label>
                                <select
                                    name="interviewType"
                                    required
                                    className="w-full p-3 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated-alt))] text-[rgb(var(--text-primary))] focus:ring-2 focus:ring-[rgb(var(--accent))] outline-none"
                                    onChange={handleChange}
                                >
                                    <option value="Technical">Technical</option>
                                    <option value="Behavioral">Behavioral</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1">Tech Stack / Skills</label>
                            <textarea
                                name="skills"
                                required
                                placeholder="Ex. React, Node.js, MongoDB, Java, System Design..."
                                className="w-full p-3 h-24 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated-alt))] text-[rgb(var(--text-primary))] focus:ring-2 focus:ring-[rgb(var(--accent))] outline-none resize-none"
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1">Focus Topics (Optional)</label>
                            <input
                                type="text"
                                name="focusArea"
                                required
                                placeholder="Ex. React Hooks, Database Indexing, API Security"
                                className="w-full p-3 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated-alt))] text-[rgb(var(--text-primary))] focus:ring-2 focus:ring-[rgb(var(--accent))] outline-none"
                                onChange={handleChange}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1">Difficulty Level</label>
                                <select
                                    name="difficulty"
                                    required
                                    className="w-full p-3 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated-alt))] text-[rgb(var(--text-primary))] focus:ring-2 focus:ring-[rgb(var(--accent))] outline-none"
                                    onChange={handleChange}
                                >
                                    <option value="Basic">Basic</option>
                                    <option value="Intermediate">Intermediate</option>
                                    <option value="Advanced">Advanced</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1">Question Count</label>
                                <select
                                    name="questionCount"
                                    required
                                    className="w-full p-3 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated-alt))] text-[rgb(var(--text-primary))] focus:ring-2 focus:ring-[rgb(var(--accent))] outline-none"
                                    onChange={handleChange}
                                    value={formData.questionCount}
                                >
                                    <option value="3">3 Questions</option>
                                    <option value="5">5 Questions</option>
                                </select>
                            </div>
                        </div>

                        {/* Resume Upload Section */}
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1">Upload Resume (Optional)</label>
                            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-[rgb(var(--border))] border-dashed rounded-lg cursor-pointer bg-[rgb(var(--bg-elevated-alt))] hover:bg-[rgb(var(--bg-elevated))] transition-colors">
                                <div className="flex flex-col items-center justify-center pt-3 pb-3">
                                    <Briefcase className="w-6 h-6 mb-2 text-[rgb(var(--text-muted))]" />
                                    <p className="mb-1 text-sm text-[rgb(var(--text-muted))]"><span className="font-semibold">Click to upload resume</span> (PDF)</p>
                                    <p className="text-xs text-[rgb(var(--text-muted))]">
                                        {formData.resumeFile ? formData.resumeFile.name : "Max 5MB"}
                                    </p>
                                </div>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept=".pdf"
                                    onChange={handleFileChange}
                                />
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-4 bg-[rgb(var(--accent))] text-white font-bold py-3 rounded-lg hover:bg-[rgb(var(--accent-hover))] transition-all disabled:opacity-50 flex justify-center items-center gap-2"
                        >
                            {loading ? <><Loader2 className="animate-spin w-5 h-5" /> Generating Questions...</> : 'Create Interview'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateMockInterview;

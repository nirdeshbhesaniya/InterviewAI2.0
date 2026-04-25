import React, { useState, useRef } from 'react';
import { useUser } from '../../context/UserContext';
import { Loader2, Check, ArrowRight, ArrowLeft, Briefcase, User, GraduationCap, Code, Target, Sliders, Zap, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from '../../utils/axiosInstance';
import toast from 'react-hot-toast';

const steps = [
    { number: 1, title: "Basic Details", icon: User },
    { number: 2, title: "Interview Type", icon: Briefcase },
    { number: 3, title: "Configuration", icon: Sliders }
];

const InterviewCreationWizard = ({ onInterviewCreated }) => {
    const { user } = useUser();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [skillTags, setSkillTags] = useState([]);
    const [skillInput, setSkillInput] = useState('');
    const skillInputRef = useRef(null);

    const [formData, setFormData] = useState({
        // Step 1
        name: user?.fullName || '',
        email: user?.email || '',
        degree: '',
        skills: '',
        jobRole: '',
        jobExperience: '0',

        // Step 2
        interviewType: 'Technical',

        // Step 3
        difficulty: 'Intermediate',
        questionCount: '5',
        focusArea: '',

        resumeContext: '',
        resumeFile: null
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const addSkillTag = (raw) => {
        const tag = raw.trim().replace(/,+$/, '').trim();
        if (!tag) return;
        if (skillTags.includes(tag)) return; // no duplicates
        const updated = [...skillTags, tag];
        setSkillTags(updated);
        setFormData(prev => ({ ...prev, skills: updated.join(', ') }));
    };

    const removeSkillTag = (tag) => {
        const updated = skillTags.filter(t => t !== tag);
        setSkillTags(updated);
        setFormData(prev => ({ ...prev, skills: updated.join(', ') }));
    };

    const handleSkillKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addSkillTag(skillInput);
            setSkillInput('');
        } else if (e.key === 'Backspace' && !skillInput && skillTags.length > 0) {
            // Remove last tag on Backspace when input is empty
            removeSkillTag(skillTags[skillTags.length - 1]);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

            if (!isPdf) {
                toast.error('Please upload a valid PDF file.');
                e.target.value = '';
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                toast.error('Resume PDF must be 5MB or smaller.');
                e.target.value = '';
                return;
            }

            setFormData({ ...formData, resumeFile: file });
        }
    };

    const handleNext = () => {
        if (currentStep === 1) {
            if (!formData.degree || !formData.skills || !formData.jobRole) {
                toast.error("Please fill in all required fields (Degree, Skills, Job Role)");
                return;
            }
        } else if (currentStep === 3) {
            if (!formData.focusArea) {
                toast.error("Please specify a focus area");
                return;
            }
        }
        setCurrentStep(prev => Math.min(prev + 1, 3));
    };

    const handlePrev = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const handleSubmit = async () => {
        if (!formData.focusArea) {
            toast.error("Please specify a focus area");
            return;
        }

        setLoading(true);

        try {
            const data = new FormData();

            // Avoid sending non-API fields or null file markers in multipart payload.
            const payload = {
                skills: formData.skills,
                degree: formData.degree,
                interviewType: formData.interviewType,
                difficulty: formData.difficulty,
                focusArea: formData.focusArea,
                questionCount: formData.questionCount,
                jobRole: formData.jobRole,
                jobExperience: formData.jobExperience,
                resumeContext: formData.resumeContext
            };

            Object.entries(payload).forEach(([key, value]) => {
                data.append(key, value ?? '');
            });

            if (formData.resumeFile) {
                data.append('resume', formData.resumeFile);
            }

            const response = await axios.post('/mock-interview', data);
            if (response.data) {
                toast.success("Interview Created Successfully!");
                if (response.data.resumeParsing?.parseError) {
                    toast(`Resume note: ${response.data.resumeParsing.parseError}`);
                }
                if (onInterviewCreated) onInterviewCreated(response.data);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to create interview. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const variants = {
        enter: (direction) => ({
            x: direction > 0 ? 100 : -100,
            opacity: 0
        }),
        center: {
            x: 0,
            opacity: 1
        },
        exit: (direction) => ({
            x: direction < 0 ? 100 : -100,
            opacity: 0
        })
    };

    return (
        <div className="bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border))] rounded-2xl shadow-lg p-6 md:p-8 mb-8">
            {/* Header / Stepper */}
            <div className="mb-8">
                <div className="flex justify-between items-center relative after:content-[''] after:absolute after:top-1/2 after:-translate-y-1/2 after:left-0 after:right-0 after:h-1 after:bg-[rgb(var(--border))] after:-z-10">
                    {steps.map((step) => (
                        <div key={step.number} className="flex flex-col items-center gap-2 relative z-10 bg-[rgb(var(--bg-elevated))] px-2">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300
                                    ${currentStep >= step.number
                                        ? 'bg-[rgb(var(--accent))] text-white shadow-[0_0_15px_rgba(var(--accent),0.4)] scale-110'
                                        : 'bg-[rgb(var(--bg-elevated-alt))] text-[rgb(var(--text-muted))] border border-[rgb(var(--border))]'
                                    }`}
                            >
                                {currentStep > step.number ? <Check className="w-5 h-5" /> : step.number}
                            </div>
                            <span className={`text-xs font-medium hidden md:block transition-colors ${currentStep >= step.number ? 'text-[rgb(var(--accent))]' : 'text-[rgb(var(--text-muted))]'}`}>
                                {step.title}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="min-h-[300px] flex flex-col">
                <AnimatePresence mode="wait">
                    {currentStep === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-4"
                        >
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-[rgb(var(--text-primary))]">
                                <User className="w-5 h-5 text-[rgb(var(--accent))]" />
                                Candidate Details
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        readOnly
                                        className="w-full p-3 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated-alt))]/50 text-[rgb(var(--text-muted))] cursor-not-allowed"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1">Email ID</label>
                                    <input
                                        type="text"
                                        value={formData.email}
                                        readOnly
                                        className="w-full p-3 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated-alt))]/50 text-[rgb(var(--text-muted))] cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1">Current Degree / Status <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <GraduationCap className="absolute top-3.5 left-3 w-5 h-5 text-[rgb(var(--text-muted))]" />
                                    <input
                                        type="text"
                                        name="degree"
                                        value={formData.degree}
                                        required
                                        placeholder="Ex. B.Tech CSE, Final Year"
                                        className="w-full p-3 pl-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated-alt))] text-[rgb(var(--text-primary))] focus:ring-2 focus:ring-[rgb(var(--accent))] outline-none transition-all"
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1">Tech Stack / Skills <span className="text-red-500">*</span></label>
                                {/* Tag / Chip Input */}
                                <div
                                    className="min-h-[80px] w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated-alt))] px-3 pt-3 pb-2 focus-within:ring-2 focus-within:ring-[rgb(var(--accent))] focus-within:border-[rgb(var(--accent))] transition-all cursor-text"
                                    onClick={() => skillInputRef.current?.focus()}
                                >
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {skillTags.map(tag => (
                                            <span
                                                key={tag}
                                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated))] text-[rgb(var(--text-primary))] text-sm font-medium max-w-[160px] group"
                                            >
                                                <span className="truncate">{tag}</span>
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); removeSkillTag(tag); }}
                                                    className="flex-shrink-0 text-[rgb(var(--text-muted))] hover:text-[rgb(var(--danger))] transition-colors"
                                                    aria-label={`Remove ${tag}`}
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                    <input
                                        ref={skillInputRef}
                                        type="text"
                                        value={skillInput}
                                        onChange={e => setSkillInput(e.target.value)}
                                        onKeyDown={handleSkillKeyDown}
                                        onBlur={() => { if (skillInput.trim()) { addSkillTag(skillInput); setSkillInput(''); } }}
                                        placeholder={skillTags.length === 0 ? 'Enter your key skills (press Enter or comma to add)' : 'Add more...'}
                                        className="bg-transparent outline-none text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] w-full min-w-[160px]"
                                    />
                                </div>
                                <p className="text-xs text-[rgb(var(--text-muted))] mt-1.5">Press <kbd className="px-1 py-0.5 rounded border border-[rgb(var(--border))] text-[10px] font-mono">Enter</kbd> or <kbd className="px-1 py-0.5 rounded border border-[rgb(var(--border))] text-[10px] font-mono">,</kbd> to add a skill</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1">Job Role / Target Position <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <Briefcase className="absolute top-3.5 left-3 w-5 h-5 text-[rgb(var(--text-muted))]" />
                                        <input
                                            type="text"
                                            name="jobRole"
                                            value={formData.jobRole}
                                            required
                                            placeholder="Ex. Senior React Developer"
                                            className="w-full p-3 pl-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated-alt))] text-[rgb(var(--text-primary))] focus:ring-2 focus:ring-[rgb(var(--accent))] outline-none transition-all"
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1">Years of Experience</label>
                                    <input
                                        type="number"
                                        name="jobExperience"
                                        min="0"
                                        max="50"
                                        value={formData.jobExperience}
                                        className="w-full p-3 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated-alt))] text-[rgb(var(--text-primary))] focus:ring-2 focus:ring-[rgb(var(--accent))] outline-none transition-all"
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {currentStep === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-[rgb(var(--text-primary))]">
                                <Briefcase className="w-5 h-5 text-[rgb(var(--accent))]" />
                                Select Interview Type
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Technical Card */}
                                <div
                                    onClick={() => setFormData({ ...formData, interviewType: 'Technical' })}
                                    className={`cursor-pointer p-6 rounded-xl border-2 transition-all duration-300 flex flex-col items-center text-center gap-4 relative overflow-hidden group
                                        ${formData.interviewType === 'Technical'
                                            ? 'border-[rgb(var(--accent))] bg-[rgb(var(--accent))]/5 shadow-[0_0_20px_rgba(var(--accent),0.15)]'
                                            : 'border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated-alt))] hover:border-[rgb(var(--accent))]/50'
                                        }`}
                                >
                                    {/* Recommended Badge */}
                                    <div className="absolute top-0 right-0 bg-[rgb(var(--accent))] text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg shadow-sm">
                                        RECOMMENDED
                                    </div>
                                    <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors 
                                        ${formData.interviewType === 'Technical' ? 'bg-[rgb(var(--accent))] text-white' : 'bg-[rgb(var(--bg-elevated))] text-[rgb(var(--text-muted))]'}`}>
                                        <Code className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-[rgb(var(--text-primary))]">Technical Interview</h3>
                                        <p className="text-sm text-[rgb(var(--text-muted))] mt-2">Recommended for SDE roles. Focuses on coding, algorithms, and system design.</p>
                                    </div>
                                    {formData.interviewType === 'Technical' && (
                                        <div className="absolute top-8 right-3 text-[rgb(var(--accent))]">
                                            <CheckCircle className="w-6 h-6" />
                                        </div>
                                    )}
                                </div>

                                {/* Behavioral Card */}
                                <div
                                    onClick={() => setFormData({ ...formData, interviewType: 'Behavioral' })}
                                    className={`cursor-pointer p-6 rounded-xl border-2 transition-all duration-300 flex flex-col items-center text-center gap-4 relative overflow-hidden group
                                        ${formData.interviewType === 'Behavioral'
                                            ? 'border-[rgb(var(--accent))] bg-[rgb(var(--accent))]/5 shadow-[0_0_20px_rgba(var(--accent),0.15)]'
                                            : 'border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated-alt))] hover:border-[rgb(var(--accent))]/50'
                                        }`}
                                >
                                    <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors 
                                        ${formData.interviewType === 'Behavioral' ? 'bg-[rgb(var(--accent))] text-white' : 'bg-[rgb(var(--bg-elevated))] text-[rgb(var(--text-muted))]'}`}>
                                        <User className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-[rgb(var(--text-primary))]">Behavioral Interview</h3>
                                        <p className="text-sm text-[rgb(var(--text-muted))] mt-2">Focuses on soft skills, leadership, and situational questions (STAR method).</p>
                                    </div>
                                    {formData.interviewType === 'Behavioral' && (
                                        <div className="absolute top-3 right-3 text-[rgb(var(--accent))]">
                                            <CheckCircle className="w-6 h-6" />
                                        </div>
                                    )}
                                </div>

                                {/* DSA Interview Card */}
                                <div
                                    onClick={() => setFormData({ ...formData, interviewType: 'DSA' })}
                                    className={`cursor-pointer p-6 rounded-xl border-2 transition-all duration-300 flex flex-col items-center text-center gap-4 relative overflow-hidden group
                                        ${formData.interviewType === 'DSA'
                                            ? 'border-[rgb(var(--accent))] bg-[rgb(var(--accent))]/5 shadow-[0_0_20px_rgba(var(--accent),0.15)]'
                                            : 'border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated-alt))] hover:border-[rgb(var(--accent))]/50'
                                        }`}
                                >
                                    <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors 
                                        ${formData.interviewType === 'DSA' ? 'bg-[rgb(var(--accent))] text-white' : 'bg-[rgb(var(--bg-elevated))] text-[rgb(var(--text-muted))]'}`}>
                                        <Code className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-[rgb(var(--text-primary))]">DSA Interview</h3>
                                        <p className="text-sm text-[rgb(var(--text-muted))] mt-2">Data Structures & Skills. Coding problems with integrated editor.</p>
                                    </div>
                                    {formData.interviewType === 'DSA' && (
                                        <div className="absolute top-3 right-3 text-[rgb(var(--accent))]">
                                            <CheckCircle className="w-6 h-6" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )
                    }

                    {
                        currentStep === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-[rgb(var(--text-primary))]">
                                    <Sliders className="w-5 h-5 text-[rgb(var(--accent))]" />
                                    Configure Setup
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-2">Question Count</label>
                                        <div className="flex gap-2">
                                            {['3', '5'].map(count => (
                                                <button
                                                    key={count}
                                                    onClick={() => setFormData({ ...formData, questionCount: count })}
                                                    className={`flex-1 py-3 px-4 rounded-lg font-medium border-2 transition-all
                                                    ${formData.questionCount === count
                                                            ? 'border-[rgb(var(--accent))] bg-[rgb(var(--accent))]/10 text-[rgb(var(--accent))]'
                                                            : 'border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated-alt))] text-[rgb(var(--text-muted))] hover:border-[rgb(var(--accent))]/30'
                                                        }`}
                                                >
                                                    {count} Questions
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-2">Difficulty Level</label>
                                        <select
                                            name="difficulty"
                                            value={formData.difficulty}
                                            onChange={handleChange}
                                            className="w-full p-3 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated-alt))] text-[rgb(var(--text-primary))] focus:ring-2 focus:ring-[rgb(var(--accent))] outline-none"
                                        >
                                            <option value="Basic">Basic - Testing fundamentals</option>
                                            <option value="Intermediate">Intermediate - Real-world scenarios</option>
                                            <option value="Advanced">Advanced - Deep dive & System Design</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1">
                                        {formData.interviewType === 'Technical' ? 'Focus Topics / Tech Stack' : 'Core Competencies / Situations'} <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Target className="absolute top-3.5 left-3 w-5 h-5 text-[rgb(var(--text-muted))]" />
                                        <input
                                            type="text"
                                            name="focusArea"
                                            value={formData.focusArea}
                                            required
                                            placeholder={formData.interviewType === 'Technical'
                                                ? "Ex. React Hooks, Database Indexing, System Design"
                                                : "Ex. Leadership, Conflict Resolution, Time Management"}
                                            className="w-full p-3 pl-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated-alt))] text-[rgb(var(--text-primary))] focus:ring-2 focus:ring-[rgb(var(--accent))] outline-none transition-all shadow-sm focus:shadow-md"
                                            onChange={handleChange}
                                        />
                                    </div>

                                    {/* Suggestions Chips */}
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        <span className="text-xs text-[rgb(var(--text-muted))] self-center mr-1">Suggestions:</span>
                                        {(formData.interviewType === 'Technical'
                                            ? ['React.js', 'Node.js', 'SQL', 'System Design', 'AWS']
                                            : formData.interviewType === 'DSA'
                                                ? ['Arrays', 'Linked Lists', 'Trees', 'Graphs', 'Dynamic Programming', 'Sorting']
                                                : ['Leadership', 'Teamwork', 'Conflict Resolution', 'Adaptability', 'Project Management']
                                        ).map(topic => (
                                            <button
                                                key={topic}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, focusArea: formData.focusArea ? `${formData.focusArea}, ${topic}` : topic })}
                                                className="text-xs px-2.5 py-1 rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated))] text-[rgb(var(--text-secondary))] hover:border-[rgb(var(--accent))] hover:text-[rgb(var(--accent))] transition-colors"
                                            >
                                                + {topic}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-2">
                                        Project / Resume Context <span className="text-[rgb(var(--text-muted))] text-xs font-normal">(Optional - you can skip)</span>
                                    </label>
                                    <textarea
                                        name="resumeContext"
                                        value={formData.resumeContext}
                                        placeholder="Paste a summary of your recent project or key resume highlights here. The AI will ask specific questions about this."
                                        className="w-full p-3 h-32 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated-alt))] text-[rgb(var(--text-primary))] focus:ring-2 focus:ring-[rgb(var(--accent))] outline-none resize-none transition-all mb-4"
                                        onChange={handleChange}
                                    />

                                    <div className="flex items-center gap-4">
                                        <div className="h-px bg-[rgb(var(--border))] flex-1"></div>
                                        <span className="text-xs text-[rgb(var(--text-muted))]">OPTIONAL PDF RESUME</span>
                                        <div className="h-px bg-[rgb(var(--border))] flex-1"></div>
                                    </div>

                                    <div className="mt-4">
                                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-[rgb(var(--border))] border-dashed rounded-lg cursor-pointer bg-[rgb(var(--bg-elevated-alt))] hover:bg-[rgb(var(--bg-elevated))] transition-colors">
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <Briefcase className="w-8 h-8 mb-3 text-[rgb(var(--text-muted))]" />
                                                <p className="mb-2 text-sm text-[rgb(var(--text-muted))]"><span className="font-semibold">Upload resume (optional)</span> (PDF)</p>
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
                                </div>
                            </motion.div>
                        )}
                </AnimatePresence>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-[rgb(var(--border))]">
                <button
                    onClick={handlePrev}
                    disabled={currentStep === 1 || loading}
                    className="px-6 py-2.5 rounded-lg font-semibold text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--bg-elevated-alt))] transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" /> Back
                </button>

                {
                    currentStep < 3 ? (
                        <button
                            onClick={handleNext}
                            className="bg-[rgb(var(--accent))] text-white px-8 py-2.5 rounded-lg font-bold hover:bg-[rgb(var(--accent-hover))] transition-all shadow-md hover:shadow-lg flex items-center gap-2 hover:translate-x-1"
                        >
                            Next Step <ArrowRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="bg-[rgb(var(--accent))] text-white px-8 py-2.5 rounded-lg font-bold hover:bg-[rgb(var(--accent-hover))] transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2 disabled:opacity-70 disabled:scale-100 disabled:cursor-not-allowed min-w-[160px] justify-center"
                        >
                            {loading ? (
                                <><Loader2 className="animate-spin w-5 h-5" /> Creating...</>
                            ) : (
                                <><Zap className="w-5 h-5 fill-current" /> Create Interview</>
                            )}
                        </button>
                    )
                }
            </div>
        </div>
    );
};

// Helper Icon
const CheckCircle = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export default InterviewCreationWizard;

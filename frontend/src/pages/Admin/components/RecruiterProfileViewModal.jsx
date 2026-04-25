import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Briefcase, FileText, CheckCircle, GraduationCap, MapPin, Mail, Phone, Link as LinkIcon, Building2, Code2, Award, User } from 'lucide-react';

const RecruiterProfileViewModal = ({ user, isOpen, onClose }) => {
    if (!isOpen || !user) return null;

    const profile = user?.careerProfile?.recruiterProfile || user?.recruiterProfile;
    
    const hasProfileData = profile && (
        profile.basic?.headline || 
        profile.basic?.currentCompany || 
        profile.contact?.phone || 
        profile.career?.industry ||
        (profile.workExperience && profile.workExperience.length > 0) ||
        (profile.education && profile.education.length > 0)
    );

    if (!hasProfileData) {
        return (
            <AnimatePresence>
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-sm bg-[rgb(var(--bg-card))] border border-[rgb(var(--border))] rounded-2xl shadow-2xl p-6 text-center">
                        <User className="w-12 h-12 text-[rgb(var(--text-muted))] mx-auto mb-3" />
                        <h2 className="text-xl font-bold text-[rgb(var(--text-primary))] mb-2">No Profile Found</h2>
                        <p className="text-sm text-[rgb(var(--text-secondary))] mb-6">This user has not set up their recruiter profile yet.</p>
                        <button onClick={onClose} className="w-full py-2 bg-[rgb(var(--bg-elevated))] hover:bg-[rgb(var(--bg-elevated-alt))] text-[rgb(var(--text-primary))] rounded-xl font-medium transition-colors border border-[rgb(var(--border))]">Close</button>
                    </motion.div>
                </div>
            </AnimatePresence>
        );
    }

    const SectionHeader = ({ icon: Icon, title }) => (
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[rgb(var(--border))]">
            <Icon className="w-5 h-5 text-[rgb(var(--accent))]" />
            <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))]">{title}</h3>
        </div>
    );

    const DataRow = ({ label, value }) => {
        if (!value) return null;
        return (
            <div className="mb-2">
                <span className="text-xs font-medium text-[rgb(var(--text-muted))] uppercase tracking-wider block mb-0.5">{label}</span>
                <span className="text-sm text-[rgb(var(--text-primary))] block">{value}</span>
            </div>
        );
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-4xl bg-[rgb(var(--bg-card))] border border-[rgb(var(--border-subtle))] rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-[rgb(var(--border-subtle))] bg-gradient-to-r from-[rgb(var(--bg-elevated))] to-[rgb(var(--bg-main))]">
                        <div className="flex items-center gap-4">
                            <img src={user.photo || '/default-avatar.jpg'} alt="" className="w-12 h-12 rounded-full border border-[rgb(var(--border))] object-cover bg-[rgb(var(--bg-body))]" />
                            <div>
                                <h2 className="text-lg font-bold text-[rgb(var(--text-primary))]">{user.fullName}</h2>
                                <p className="text-xs text-[rgb(var(--accent))] font-medium tracking-wide uppercase">Recruiter Profile View</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-[rgb(var(--bg-elevated-alt))] rounded-full text-[rgb(var(--text-muted))] transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8 bg-[rgb(var(--bg-body))] custom-scrollbar">
                        
                        {/* Headline & Summary */}
                        {profile.summary || profile.basic?.headline ? (
                            <div className="bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border-subtle))] rounded-xl p-5 shadow-sm">
                                <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))] mb-2">{profile.basic?.headline || 'Profile Summary'}</h3>
                                {profile.summary && <p className="text-sm text-[rgb(var(--text-secondary))] leading-relaxed">{profile.summary}</p>}
                            </div>
                        ) : null}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Basic Details */}
                            <div className="space-y-6">
                                <div>
                                    <SectionHeader icon={Briefcase} title="Professional Details" />
                                    <div className="bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border-subtle))] rounded-xl p-4 grid grid-cols-2 gap-4">
                                        <DataRow label="Experience" value={profile.basic?.experienceYears ? `${profile.basic.experienceYears}y ${profile.basic.experienceMonths || 0}m` : null} />
                                        <DataRow label="Current Company" value={profile.basic?.currentCompany} />
                                        <DataRow label="Current Salary" value={profile.basic?.currentSalary} />
                                        <DataRow label="Expected Salary" value={profile.basic?.expectedSalary} />
                                        <DataRow label="Notice Period" value={profile.basic?.noticePeriod} />
                                    </div>
                                </div>

                                <div>
                                    <SectionHeader icon={Mail} title="Contact & Location" />
                                    <div className="bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border-subtle))] rounded-xl p-4 grid grid-cols-1 gap-4">
                                        <DataRow label="Email" value={profile.contact?.emailVerified ? <span className="flex items-center gap-1">{user.email} <CheckCircle className="w-3 h-3 text-green-500"/></span> : user.email} />
                                        <DataRow label="Phone" value={profile.contact?.phone} />
                                        <DataRow label="Address" value={profile.contact?.address} />
                                        <DataRow label="Preferred Location" value={profile.contact?.preferredLocation} />
                                    </div>
                                </div>
                            </div>

                            {/* Career & Skills */}
                            <div className="space-y-6">
                                <div>
                                    <SectionHeader icon={BaggageClaim} title="Career Preferences" />
                                    <div className="bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border-subtle))] rounded-xl p-4 grid grid-cols-2 gap-4">
                                        <DataRow label="Industry" value={profile.career?.industry} />
                                        <DataRow label="Functional Area" value={profile.career?.functionalArea} />
                                        <DataRow label="Role" value={profile.career?.role} />
                                        <DataRow label="Job Type" value={profile.career?.jobType} />
                                    </div>
                                </div>

                                <div>
                                    <SectionHeader icon={Code2} title="Skills" />
                                    <div className="bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border-subtle))] rounded-xl p-4">
                                        {profile.skills?.keySkills?.length > 0 ? (
                                            <div className="mb-4">
                                                <span className="text-xs font-medium text-[rgb(var(--text-muted))] uppercase tracking-wider block mb-2">Key Skills</span>
                                                <div className="flex flex-wrap gap-2">
                                                    {profile.skills.keySkills.map((skill, idx) => (
                                                        <span key={idx} className="px-2.5 py-1 bg-[rgb(var(--accent))]/10 text-[rgb(var(--accent))] border border-[rgb(var(--accent))]/20 rounded-lg text-xs font-medium">{skill}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : <p className="text-xs text-[rgb(var(--text-muted))]">No basic skills added.</p>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Experience Section */}
                        {profile.workExperience?.length > 0 && (
                            <div>
                                <SectionHeader icon={Building2} title="Work Experience" />
                                <div className="space-y-4">
                                    {profile.workExperience.map((exp, idx) => (
                                        <div key={idx} className="bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border-subtle))] rounded-xl p-5 relative overflow-hidden">
                                            <div className="absolute top-0 left-0 w-1 h-full bg-[rgb(var(--accent))] opacity-50"></div>
                                            <h4 className="text-base font-bold text-[rgb(var(--text-primary))]">{exp.title}</h4>
                                            <p className="text-sm font-medium text-[rgb(var(--accent))]">{exp.company}</p>
                                            <p className="text-xs text-[rgb(var(--text-muted))] mt-1 mb-3">{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</p>
                                            <p className="text-sm text-[rgb(var(--text-secondary))]">{exp.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Education Section */}
                        {profile.education?.length > 0 && (
                            <div>
                                <SectionHeader icon={GraduationCap} title="Education" />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {profile.education.map((edu, idx) => (
                                        <div key={idx} className="bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border-subtle))] rounded-xl p-4">
                                            <h4 className="text-sm font-bold text-[rgb(var(--text-primary))]">{edu.degree}</h4>
                                            <p className="text-sm text-[rgb(var(--text-secondary))]">{edu.institution}</p>
                                            <p className="text-xs text-[rgb(var(--text-muted))] mt-1">{edu.yearOfCompletion}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {/* Links Section */}
                        {(profile.onlineProfiles?.linkedin || profile.onlineProfiles?.github || profile.onlineProfiles?.portfolio) && (
                            <div>
                                <SectionHeader icon={LinkIcon} title="Online Profiles" />
                                <div className="flex gap-3 flex-wrap">
                                    {profile.onlineProfiles.linkedin && (
                                        <a href={profile.onlineProfiles.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border-subtle))] rounded-xl text-sm text-[rgb(var(--text-primary))] hover:border-[rgb(var(--accent))] transition-colors">
                                            LinkedIn
                                        </a>
                                    )}
                                    {profile.onlineProfiles.github && (
                                        <a href={profile.onlineProfiles.github} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border-subtle))] rounded-xl text-sm text-[rgb(var(--text-primary))] hover:border-[rgb(var(--accent))] transition-colors">
                                            GitHub
                                        </a>
                                    )}
                                    {profile.onlineProfiles.portfolio && (
                                        <a href={profile.onlineProfiles.portfolio} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border-subtle))] rounded-xl text-sm text-[rgb(var(--text-primary))] hover:border-[rgb(var(--accent))] transition-colors">
                                            Portfolio
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}

                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

// SVG Icon Helper
const BaggageClaim = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 18H6a2 2 0 0 1-2-2V7a2 2 0 0 0-2-2"/><path d="M17 14V4a2 2 0 0 0-2-2h-1a2 2 0 0 0-2 2v10"/><rect width="13" height="8" x="8" y="6" rx="1"/><circle cx="18" cy="20" r="2"/><circle cx="9" cy="20" r="2"/></svg>
);

export default RecruiterProfileViewModal;

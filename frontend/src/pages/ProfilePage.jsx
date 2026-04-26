import React, { useState, useContext, useEffect, useRef } from 'react';
import { UserContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
    User,
    Mail,
    Calendar,
    Camera,
    Edit3,
    Save,
    X,
    Upload,
    Lock,
    Eye,
    EyeOff,
    Check,
    AlertCircle,
    ArrowLeft,
    Shield,
    Bell,
    Globe,
    Trash2,
    TrendingUp,
    Award,
    Sparkles,
    MapPin,
    Link2,
    Github,
    Linkedin,
    FileText,
    Clock,
    CheckCircle2,
    XCircle,
    Phone,
    Building2,
    Briefcase,
    GraduationCap,
    Target,
    BadgeCheck,
    Search,
    WandSparkles
} from 'lucide-react';
import AnswerRenderer from '../components/interview/AnswerRenderer';
import Button from '../components/ui/SimpleButton';
import Card from '../components/ui/SimpleCard';
import axiosInstance from '../utils/axiosInstance';
import { API } from '../utils/apiPaths';
import toast from 'react-hot-toast';

const TagInput = ({ value, onChange, placeholder }) => {
    const inputRef = useRef(null);
    const tags = Array.isArray(value) ? value : (value ? String(value).split(',').map((t) => t.trim()).filter(Boolean) : []);

    const addTag = (tag) => {
        const newTags = tag.split(',').map((t) => t.trim()).filter(Boolean);
        if (!newTags.length) return;
        const uniqueTags = Array.from(new Set([...tags, ...newTags]));
        // onChange provides the array if it was passed an array, string if passed a string.
        // But since we want to support both, we'll normalize it based on original `value` type.
        onChange(Array.isArray(value) ? uniqueTags : uniqueTags.join(', '));
    };

    const removeTag = (tagToRemove) => {
        const newTags = tags.filter((t) => t !== tagToRemove);
        onChange(Array.isArray(value) ? newTags : newTags.join(', '));
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const val = e.target.value.trim();
            if (val) {
                addTag(val);
                e.target.value = '';
            }
        }
    };

    return (
        <div
            className="flex min-h-[46px] w-full flex-wrap gap-2 items-center rounded-lg border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-body))] px-3 py-2 cursor-text focus-within:ring-2 focus-within:ring-primary focus-within:outline-none transition-shadow"
            onClick={() => inputRef.current?.focus()}
        >
            {tags.map((tag, idx) => (
                <span
                    key={`${tag}-${idx}`}
                    className="flex items-center gap-1 rounded-full bg-[rgb(var(--accent))]/10 border border-[rgb(var(--border-subtle))] px-2.5 py-0.5 text-sm text-[rgb(var(--accent))]"
                >
                    {tag}
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); removeTag(tag); }}
                        className="text-[rgb(var(--accent))]/70 hover:text-[rgb(var(--accent))] ml-1 focus:outline-none transition-colors leading-none"
                    >
                        ✕
                    </button>
                </span>
            ))}
            <input
                ref={inputRef}
                type="text"
                placeholder={tags.length === 0 ? placeholder : "Add more..."}
                onKeyDown={handleKeyDown}
                onBlur={(e) => {
                    const val = e.target.value.trim();
                    if (val) {
                        addTag(val);
                        e.target.value = '';
                    }
                }}
                className="flex-1 bg-transparent px-1 py-0.5 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none border-none min-w-[120px]"
            />
        </div>
    );
};

const ProfilePage = () => {
    const { user, setUser } = useContext(UserContext);
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('profile');
    const [isEditing, setIsEditing] = useState(false);
    const [isEditingRecruiter, setIsEditingRecruiter] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showPasswordForm, setShowPasswordForm] = useState(false);

    const passwordSectionRef = useRef(null);
    const hydratedUserKeyRef = useRef('');

    const [profileData, setProfileData] = useState({
        fullName: '',
        email: '',
        bio: '',
        location: '',
        website: '',
        linkedin: '',
        github: ''
    });

    const getEmptyRecruiterProfile = () => ({
        basic: {
            headline: '',
            experienceYears: '',
            experienceMonths: '',
            currentCompany: '',
            currentSalary: '',
            expectedSalary: '',
            noticePeriod: ''
        },
        contact: {
            phone: '',
            address: '',
            preferredLocation: '',
            emailVerified: false,
            phoneVerified: false,
            privacy: 'recruiter'
        },
        career: {
            industry: '',
            functionalArea: '',
            role: '',
            jobType: 'Full-time',
            preferredShift: '',
            employmentType: ''
        },
        workExperience: [],
        education: [],
        skills: {
            keySkills: [],
            secondarySkills: [],
            levels: []
        },
        resume: {
            fileName: '',
            parsedSummary: ''
        },
        projects: [],
        accomplishments: {
            certifications: [],
            awards: [],
            publications: [],
            patents: []
        },
        onlineProfiles: {
            linkedin: '',
            github: '',
            portfolio: ''
        },
        summary: ''
    });

    const getEmptyCareerProfile = () => ({
        personal: {
            phone: '',
            gender: '',
            dateOfBirth: ''
        },
        preferences: {
            jobTypes: [],
            availability: '',
            preferredLocations: []
        },
        profileSummary: '',
        keySkills: [],
        languages: [],
        education: [],
        internships: [],
        projects: [],
        accomplishments: [],
        competitiveExams: [],
        employment: [],
        academicAchievements: []
    });

    const [careerProfile, setCareerProfile] = useState(getEmptyCareerProfile());
    const [recruiterProfile, setRecruiterProfile] = useState(getEmptyRecruiterProfile());
    const [careerModalOpen, setCareerModalOpen] = useState(false);
    const [careerModalSection, setCareerModalSection] = useState('');
    const [careerModalIndex, setCareerModalIndex] = useState(-1);
    const [careerModalData, setCareerModalData] = useState({});

    // Password form data
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    // Profile picture upload
    const [uploadingPhoto, setUploadingPhoto] = useState(false);

    // Preferences state
    const [preferences, setPreferences] = useState({
        emailNotifications: true,
        testReminders: true,
        weeklyDigest: false,
        language: 'en',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });

    // Security state
    const [sessions, setSessions] = useState([]);
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
    const [loadingSecurity, setLoadingSecurity] = useState(false);

    // Stats state
    const [stats, setStats] = useState({
        interviewsSessions: 0,
        mcqTestsTaken: 0,
        notesShared: 0,
        activityTimeline: [],
        performanceByCategory: []
    });

    const [myUploads, setMyUploads] = useState({
        notes: [],
        resources: []
    });

    const [skillInput, setSkillInput] = useState({ keySkills: '', secondarySkills: '' });
    // pendingApprovals removed

    useEffect(() => {
        if (!user) {
            hydratedUserKeyRef.current = '';
            return;
        }

        if (user) {
            const userKey = user?._id || user?.id || user?.email || '';
            if (hydratedUserKeyRef.current === userKey) {
                return;
            }
            hydratedUserKeyRef.current = userKey;

            setProfileData({
                fullName: user.fullName || '',
                email: user.email || '',
                bio: user.bio || '',
                location: user.location || '',
                website: user.website || '',
                linkedin: user.linkedin || '',
                github: user.github || ''
            });

            const nextCareer = getEmptyCareerProfile();
            const incoming = user.careerProfile || {};
            setCareerProfile({
                ...nextCareer,
                ...incoming,
                personal: {
                    ...nextCareer.personal,
                    ...(incoming.personal || {})
                },
                preferences: {
                    ...nextCareer.preferences,
                    ...(incoming.preferences || {}),
                    jobTypes: Array.isArray(incoming.preferences?.jobTypes) ? incoming.preferences.jobTypes : [],
                    preferredLocations: Array.isArray(incoming.preferences?.preferredLocations) ? incoming.preferences.preferredLocations : []
                },
                keySkills: Array.isArray(incoming.keySkills) ? incoming.keySkills : [],
                languages: Array.isArray(incoming.languages) ? incoming.languages : [],
                education: Array.isArray(incoming.education) ? incoming.education : [],
                internships: Array.isArray(incoming.internships) ? incoming.internships : [],
                projects: Array.isArray(incoming.projects) ? incoming.projects : [],
                accomplishments: Array.isArray(incoming.accomplishments) ? incoming.accomplishments : [],
                competitiveExams: Array.isArray(incoming.competitiveExams) ? incoming.competitiveExams : [],
                employment: Array.isArray(incoming.employment) ? incoming.employment : [],
                academicAchievements: Array.isArray(incoming.academicAchievements) ? incoming.academicAchievements : []
            });

            const incomingRecruiter = incoming.recruiterProfile || {};
            const baseRecruiter = getEmptyRecruiterProfile();
            setRecruiterProfile({
                ...baseRecruiter,
                ...incomingRecruiter,
                basic: { ...baseRecruiter.basic, ...(incomingRecruiter.basic || {}) },
                contact: {
                    ...baseRecruiter.contact,
                    ...(incomingRecruiter.contact || {}),
                    emailVerified: Boolean(incomingRecruiter.contact?.emailVerified || user.isEmailVerified),
                    phoneVerified: Boolean(incomingRecruiter.contact?.phoneVerified)
                },
                career: { ...baseRecruiter.career, ...(incomingRecruiter.career || {}) },
                workExperience: Array.isArray(incomingRecruiter.workExperience) ? incomingRecruiter.workExperience : [],
                education: Array.isArray(incomingRecruiter.education) ? incomingRecruiter.education : [],
                skills: {
                    ...baseRecruiter.skills,
                    ...(incomingRecruiter.skills || {}),
                    keySkills: Array.isArray(incomingRecruiter.skills?.keySkills) ? incomingRecruiter.skills.keySkills : [],
                    secondarySkills: Array.isArray(incomingRecruiter.skills?.secondarySkills) ? incomingRecruiter.skills.secondarySkills : [],
                    levels: Array.isArray(incomingRecruiter.skills?.levels) ? incomingRecruiter.skills.levels : []
                },
                resume: { ...baseRecruiter.resume, ...(incomingRecruiter.resume || {}) },
                projects: Array.isArray(incomingRecruiter.projects) ? incomingRecruiter.projects : [],
                accomplishments: {
                    ...baseRecruiter.accomplishments,
                    ...(incomingRecruiter.accomplishments || {}),
                    certifications: Array.isArray(incomingRecruiter.accomplishments?.certifications) ? incomingRecruiter.accomplishments.certifications : [],
                    awards: Array.isArray(incomingRecruiter.accomplishments?.awards) ? incomingRecruiter.accomplishments.awards : [],
                    publications: Array.isArray(incomingRecruiter.accomplishments?.publications) ? incomingRecruiter.accomplishments.publications : [],
                    patents: Array.isArray(incomingRecruiter.accomplishments?.patents) ? incomingRecruiter.accomplishments.patents : []
                },
                onlineProfiles: { ...baseRecruiter.onlineProfiles, ...(incomingRecruiter.onlineProfiles || {}) },
                summary: incomingRecruiter.summary || ''
            });

            // Fetch preferences and security data
            fetchPreferences();
            fetchSecurityInfo();
            fetchStats();
            fetchMyUploads();
            // fetchPendingApprovals removed
        }
    }, [user?._id, user?.id, user?.email]);

    const fetchMyUploads = async () => {
        try {
            // Fetch user's notes and resources
            // Assuming user object has _id or id
            const userId = user._id || user.id;
            if (!userId) return;

            const [notesRes, resourcesRes] = await Promise.all([
                axiosInstance.get(API.NOTES.GET_USER_NOTES(user.email)), // Notes are stored by email
                axiosInstance.get(API.RESOURCES.MY_UPLOADS)
            ]);

            setMyUploads({
                notes: notesRes.data.success ? notesRes.data.notes : [],
                resources: resourcesRes.data || [] // Resources endpoint returns array directly or inside data? Checked resources.js: res.json(resources) -> Array
            });
        } catch (error) {
            console.error('Error fetching uploads:', error);
        }
    };

    // pending approvals logic removed

    const fetchStats = async () => {
        try {
            const response = await axiosInstance.get(API.PROFILE.GET_STATS);
            if (response.data.success) {
                setStats(response.data.data.stats);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const fetchPreferences = async () => {
        try {
            const response = await axiosInstance.get(API.PROFILE.GET_PREFERENCES);
            if (response.data.success) {
                setPreferences(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching preferences:', error);
        }
    };

    const fetchSecurityInfo = async () => {
        try {
            const response = await axiosInstance.get(API.PROFILE.GET_SECURITY);
            if (response.data.success) {
                setSessions(response.data.data.sessions || []);
                setTwoFactorEnabled(response.data.data.twoFactorEnabled || false);
            }
        } catch (error) {
            console.error('Error fetching security info:', error);
        }
    };

    const handleInputChange = (field, value) => {
        setProfileData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handlePasswordChange = (field, value) => {
        setPasswordData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const updateRecruiterSection = (section, field, value) => {
        setRecruiterProfile((prev) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    const updateArrayItem = (section, index, field, value) => {
        setRecruiterProfile((prev) => ({
            ...prev,
            [section]: (prev[section] || []).map((item, idx) => (idx === index ? { ...item, [field]: value } : item))
        }));
    };

    const addSkillTag = (key) => {
        const raw = skillInput[key] || '';
        const tags = raw.split(',').map((t) => t.trim()).filter(Boolean);
        if (!tags.length) return;

        setRecruiterProfile((prev) => ({
            ...prev,
            skills: {
                ...prev.skills,
                [key]: Array.from(new Set([...(prev.skills[key] || []), ...tags]))
            }
        }));
        setSkillInput((prev) => ({ ...prev, [key]: '' }));
    };

    const removeSkillTag = (key, value) => {
        setRecruiterProfile((prev) => ({
            ...prev,
            skills: {
                ...prev.skills,
                [key]: (prev.skills[key] || []).filter((tag) => tag !== value)
            }
        }));
    };


    const generateAIBullets = (index) => {
        const description = recruiterProfile.workExperience[index]?.description || '';
        if (!description.trim()) {
            toast.error('Please add work description first');
            return;
        }

        const lines = description
            .split(/[.!?\n]/)
            .map((line) => line.trim())
            .filter(Boolean)
            .slice(0, 5)
            .map((line) => `- ${line.charAt(0).toUpperCase()}${line.slice(1)}`)
            .join('\n');

        updateArrayItem('workExperience', index, 'description', lines || description);
        toast.success('Generated bullet-style highlights');
    };

    const handleResumeSelect = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setRecruiterProfile((prev) => ({
            ...prev,
            resume: {
                ...prev.resume,
                fileName: file.name
            }
        }));
        toast.success('Resume selected. Save profile to keep this info.');
    };

    const recruiterSections = [
        { key: 'basic', title: 'A. Basic Details' },
        { key: 'contact', title: 'B. Contact Details' },
        { key: 'career', title: 'C. Career Profile' },
        { key: 'workExperience', title: 'D. Work Experience' },
        { key: 'education', title: 'E. Education' },
        { key: 'skills', title: 'F. Skills' },
        { key: 'resume', title: 'G. Resume Upload' },
        { key: 'projects', title: 'H. Projects' },
        { key: 'accomplishments', title: 'I. Accomplishments' },
        { key: 'onlineProfiles', title: 'J. Online Profiles' },
        { key: 'summary', title: 'K. Summary / About Me' }
    ];

    const recruiterModalTitles = {
        recruiterWorkExperience: 'Work Experience',
        recruiterEducation: 'Education',
        recruiterProject: 'Project',
        recruiterAccomplishmentCertifications: 'Certification',
        recruiterAccomplishmentAwards: 'Award',
        recruiterAccomplishmentPublications: 'Publication',
        recruiterAccomplishmentPatents: 'Patent'
    };

    const getRecruiterSectionCount = (section) => {
        const p = recruiterProfile;
        switch (section) {
            case 'basic':
                return [profileData.fullName, p.basic.headline, profileData.location, p.basic.currentCompany, p.basic.noticePeriod].filter((v) => String(v || '').trim()).length;
            case 'contact':
                return [profileData.email, p.contact.phone, p.contact.address, p.contact.preferredLocation].filter((v) => String(v || '').trim()).length;
            case 'career':
                return [p.career.industry, p.career.functionalArea, p.career.role, p.career.jobType, p.career.preferredShift, p.career.employmentType].filter((v) => String(v || '').trim()).length;
            case 'workExperience':
                return (p.workExperience || []).length;
            case 'education':
                return (p.education || []).length;
            case 'skills':
                return (p.skills?.keySkills || []).length + (p.skills?.secondarySkills || []).length + (p.skills?.levels || []).length;
            case 'resume':
                return p.resume?.fileName ? 1 : 0;
            case 'projects':
                return (p.projects || []).length;
            case 'accomplishments':
                return (p.accomplishments?.certifications || []).length + (p.accomplishments?.awards || []).length + (p.accomplishments?.publications || []).length + (p.accomplishments?.patents || []).length;
            case 'onlineProfiles':
                return [p.onlineProfiles?.linkedin, p.onlineProfiles?.github, p.onlineProfiles?.portfolio].filter((v) => String(v || '').trim()).length;
            case 'summary':
                return p.summary?.trim() ? 1 : 0;
            default:
                return 0;
        }
    };

    const getCareerCompletion = () => {
        const completed = recruiterSections.filter((section) => getRecruiterSectionCount(section.key) > 0).length;
        return Math.round((completed / recruiterSections.length) * 100);
    };

    const getSectionInitialData = (section) => {
        switch (section) {
            case 'recruiterWorkExperience':
                return { companyName: '', role: '', startDate: '', endDate: '', description: '', keySkills: '' };
            case 'recruiterEducation':
                return { degree: '', collegeName: '', yearOfPassing: '', score: '' };
            case 'recruiterProject':
                return { title: '', description: '', techStack: '', githubLink: '', liveLink: '' };
            case 'recruiterAccomplishmentCertifications':
            case 'recruiterAccomplishmentAwards':
            case 'recruiterAccomplishmentPublications':
            case 'recruiterAccomplishmentPatents':
                return { value: '' };
            case 'preferences':
                return {
                    jobTypes: (careerProfile.preferences?.jobTypes || []).join(', '),
                    availability: careerProfile.preferences?.availability || '',
                    preferredLocations: (careerProfile.preferences?.preferredLocations || []).join(', ')
                };
            case 'profileSummary':
                return { value: careerProfile.profileSummary || '' };
            case 'keySkills':
            case 'accomplishments':
            case 'academicAchievements':
                return { value: '' };
            case 'languages':
                return { name: '', proficiency: '' };
            case 'education':
                return { degree: '', institute: '', graduationYear: '', courseType: '', score: '' };
            case 'internships':
                return { company: '', role: '', duration: '', description: '' };
            case 'projects':
                return { title: '', technologies: '', description: '', link: '' };
            case 'competitiveExams':
                return { examName: '', score: '', year: '' };
            case 'employment':
                return { company: '', role: '', duration: '', description: '' };
            default:
                return {};
        }
    };

    const openCareerModal = (section, index = -1) => {
        setCareerModalSection(section);
        setCareerModalIndex(index);

        if (index >= 0) {
            let item = (careerProfile[section] || [])[index] || {};
            if (section === 'recruiterWorkExperience') item = (recruiterProfile.workExperience || [])[index] || {};
            if (section === 'recruiterEducation') item = (recruiterProfile.education || [])[index] || {};
            if (section === 'recruiterProject') item = (recruiterProfile.projects || [])[index] || {};
            if (section.startsWith('recruiterAccomplishment')) {
                const keyMap = {
                    recruiterAccomplishmentCertifications: 'certifications',
                    recruiterAccomplishmentAwards: 'awards',
                    recruiterAccomplishmentPublications: 'publications',
                    recruiterAccomplishmentPatents: 'patents'
                };
                const key = keyMap[section];
                item = { value: (recruiterProfile.accomplishments?.[key] || [])[index] || '' };
            }
            if (section === 'projects') {
                setCareerModalData({
                    ...item,
                    technologies: Array.isArray(item.technologies) ? item.technologies.join(', ') : ''
                });
            } else if (['keySkills', 'accomplishments', 'academicAchievements'].includes(section)) {
                setCareerModalData({ value: item || '' });
            } else {
                setCareerModalData(item);
            }
        } else {
            setCareerModalData(getSectionInitialData(section));
        }

        setCareerModalOpen(true);
    };

    const closeCareerModal = () => {
        setCareerModalOpen(false);
        setCareerModalSection('');
        setCareerModalIndex(-1);
        setCareerModalData({});
    };

    const saveCareerProfile = async (nextCareerProfile) => {
        setLoading(true);
        try {
            const payload = {
                ...profileData,
                email: user.email,
                careerProfile: nextCareerProfile
            };

            const response = await axiosInstance.put(API.PROFILE.UPDATE, payload);
            if (response.data.success) {
                const updatedUser = response.data.data?.user || { ...user, ...profileData, careerProfile: nextCareerProfile };
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));
                setCareerProfile(nextCareerProfile);
                toast.success('Career profile updated successfully!');
                closeCareerModal();
            }
        } catch (error) {
            console.error('Error updating career profile:', error);
            toast.error(error.response?.data?.message || 'Failed to update career profile');
        } finally {
            setLoading(false);
        }
    };

    const saveRecruiterProfile = async () => {
        const nextCareerProfile = {
            ...careerProfile,
            recruiterProfile
        };
        await saveCareerProfile(nextCareerProfile);
    };

    const submitCareerModal = async () => {
        const normalizeCsv = (value) => String(value || '')
            .split(',')
            .map((v) => v.trim())
            .filter(Boolean);

        const next = JSON.parse(JSON.stringify(careerProfile));
        const section = careerModalSection;

        if (section === 'recruiterWorkExperience') {
            const list = [...(recruiterProfile.workExperience || [])];
            if (careerModalIndex >= 0) list[careerModalIndex] = { ...careerModalData };
            else list.push({ ...careerModalData });
            setRecruiterProfile((prev) => ({ ...prev, workExperience: list }));
            closeCareerModal();
            return;
        }

        if (section === 'recruiterEducation') {
            const list = [...(recruiterProfile.education || [])];
            if (careerModalIndex >= 0) list[careerModalIndex] = { ...careerModalData };
            else list.push({ ...careerModalData });
            setRecruiterProfile((prev) => ({ ...prev, education: list }));
            closeCareerModal();
            return;
        }

        if (section === 'recruiterProject') {
            const list = [...(recruiterProfile.projects || [])];
            if (careerModalIndex >= 0) list[careerModalIndex] = { ...careerModalData };
            else list.push({ ...careerModalData });
            setRecruiterProfile((prev) => ({ ...prev, projects: list }));
            closeCareerModal();
            return;
        }

        if (section.startsWith('recruiterAccomplishment')) {
            const keyMap = {
                recruiterAccomplishmentCertifications: 'certifications',
                recruiterAccomplishmentAwards: 'awards',
                recruiterAccomplishmentPublications: 'publications',
                recruiterAccomplishmentPatents: 'patents'
            };
            const key = keyMap[section];
            const value = String(careerModalData.value || '').trim();
            if (!value) {
                toast.error('Please enter a value');
                return;
            }
            const list = [...(recruiterProfile.accomplishments?.[key] || [])];
            if (careerModalIndex >= 0) list[careerModalIndex] = value;
            else list.push(value);

            setRecruiterProfile((prev) => ({
                ...prev,
                accomplishments: {
                    ...prev.accomplishments,
                    [key]: list
                }
            }));
            closeCareerModal();
            return;
        }

        if (section === 'preferences') {
            next.preferences = {
                jobTypes: normalizeCsv(careerModalData.jobTypes),
                availability: String(careerModalData.availability || '').trim(),
                preferredLocations: normalizeCsv(careerModalData.preferredLocations)
            };
            await saveCareerProfile(next);
            return;
        }

        if (section === 'profileSummary') {
            next.profileSummary = String(careerModalData.value || '').trim();
            await saveCareerProfile(next);
            return;
        }

        if (['keySkills', 'accomplishments', 'academicAchievements'].includes(section)) {
            const value = String(careerModalData.value || '').trim();
            if (!value) {
                toast.error('Please enter a value');
                return;
            }
            const list = Array.isArray(next[section]) ? next[section] : [];
            if (careerModalIndex >= 0) list[careerModalIndex] = value;
            else list.push(value);
            next[section] = list;
            await saveCareerProfile(next);
            return;
        }

        let item = { ...careerModalData };
        if (section === 'projects') {
            item.technologies = normalizeCsv(careerModalData.technologies);
        }

        const hasAnyValue = Object.values(item).some((v) => {
            if (Array.isArray(v)) return v.length > 0;
            return String(v || '').trim().length > 0;
        });

        if (!hasAnyValue) {
            toast.error('Please fill at least one field');
            return;
        }

        const list = Array.isArray(next[section]) ? next[section] : [];
        if (careerModalIndex >= 0) list[careerModalIndex] = item;
        else list.push(item);
        next[section] = list;

        await saveCareerProfile(next);
    };

    const deleteRecruiterItem = (section, index) => {
        if (section === 'recruiterWorkExperience') {
            setRecruiterProfile((prev) => ({
                ...prev,
                workExperience: (prev.workExperience || []).filter((_, idx) => idx !== index)
            }));
            return;
        }

        if (section === 'recruiterEducation') {
            setRecruiterProfile((prev) => ({
                ...prev,
                education: (prev.education || []).filter((_, idx) => idx !== index)
            }));
            return;
        }

        if (section === 'recruiterProject') {
            setRecruiterProfile((prev) => ({
                ...prev,
                projects: (prev.projects || []).filter((_, idx) => idx !== index)
            }));
            return;
        }

        if (section.startsWith('recruiterAccomplishment')) {
            const keyMap = {
                recruiterAccomplishmentCertifications: 'certifications',
                recruiterAccomplishmentAwards: 'awards',
                recruiterAccomplishmentPublications: 'publications',
                recruiterAccomplishmentPatents: 'patents'
            };
            const key = keyMap[section];
            setRecruiterProfile((prev) => ({
                ...prev,
                accomplishments: {
                    ...prev.accomplishments,
                    [key]: (prev.accomplishments?.[key] || []).filter((_, idx) => idx !== index)
                }
            }));
        }
    };

    const handlePhotoUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size should be less than 5MB');
            return;
        }

        setUploadingPhoto(true);
        const formData = new FormData();
        formData.append('photo', file);
        formData.append('email', user.email); // Add user email for authentication

        try {
            const response = await axiosInstance.post(API.PROFILE.UPLOAD_PHOTO, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                const updatedUser = { ...user, photo: response.data.data.photoUrl };
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));
                toast.success('Profile photo updated successfully!');
            }
        } catch (error) {
            console.error('Error uploading photo:', error);
            toast.error(error.response?.data?.message || 'Failed to upload photo');
        } finally {
            setUploadingPhoto(false);
        }
    };

    const handleSaveProfile = async () => {
        setLoading(true);
        try {
            const updateData = {
                ...profileData,
                email: user.email // Include user email for authentication
            };

            const response = await axiosInstance.put(API.PROFILE.UPDATE, updateData);

            if (response.data.success) {
                const updatedUser = { ...user, ...profileData };
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));
                setIsEditing(false);
                toast.success('Profile updated successfully!');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handlePreferenceChange = (field, value) => {
        setPreferences(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSavePreferences = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.put(API.PROFILE.UPDATE_PREFERENCES, preferences);
            if (response.data.success) {
                toast.success('Preferences updated successfully!');
            }
        } catch (error) {
            console.error('Error updating preferences:', error);
            toast.error(error.response?.data?.message || 'Failed to update preferences');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            return;
        }

        setLoadingSecurity(true);
        try {
            const response = await axiosInstance.delete(API.PROFILE.DELETE_ACCOUNT);
            if (response.data.success) {
                toast.success('Account deleted successfully');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setUser(null);
                navigate('/');
            }
        } catch (error) {
            console.error('Error deleting account:', error);
            toast.error(error.response?.data?.message || 'Failed to delete account');
        } finally {
            setLoadingSecurity(false);
        }
    };

    const handleRevokeSession = async (sessionId) => {
        setLoadingSecurity(true);
        try {
            const response = await axiosInstance.post(API.PROFILE.REVOKE_SESSION, { sessionId });
            if (response.data.success) {
                toast.success('Session revoked successfully');
                fetchSecurityInfo();
            }
        } catch (error) {
            console.error('Error revoking session:', error);
            toast.error(error.response?.data?.message || 'Failed to revoke session');
        } finally {
            setLoadingSecurity(false);
        }
    };

    const handleToggle2FA = async (enabled) => {
        setLoadingSecurity(true);
        try {
            const response = await axiosInstance.post(API.PROFILE.TOGGLE_2FA, { enabled });
            if (response.data.success) {
                setTwoFactorEnabled(enabled);
                toast.success(response.data.message);
            }
        } catch (error) {
            console.error('Error toggling 2FA:', error);
            toast.error(error.response?.data?.message || 'Failed to toggle two-factor authentication');
            setTwoFactorEnabled(!enabled); // Revert on error
        } finally {
            setLoadingSecurity(false);
        }
    };

    const handleChangePassword = async (e) => {
        if (e) e.preventDefault();

        if (!passwordData.currentPassword) {
            toast.error('Please enter your current password');
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            toast.error('Password must be at least 6 characters long');
            return;
        }

        setLoading(true);
        try {
            const response = await axiosInstance.put(API.PROFILE.CHANGE_PASSWORD, {
                email: user.email, // Include email for backend authentication
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });

            if (response.data.success) {
                setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
                setShowPasswordForm(false);
                toast.success('Password changed successfully!');
            }
        } catch (error) {
            console.error('Error changing password:', error);
            toast.error(error.response?.data?.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    const careerSections = [
        { key: 'preferences', title: 'Preference' },
        { key: 'education', title: 'Education' },
        { key: 'keySkills', title: 'Key Skills' },
        { key: 'languages', title: 'Languages' },
        { key: 'internships', title: 'Internships' },
        { key: 'projects', title: 'Projects' },
        { key: 'profileSummary', title: 'Profile Summary' },
        { key: 'accomplishments', title: 'Accomplishments' },
        { key: 'competitiveExams', title: 'Competitive Exams' },
        { key: 'employment', title: 'Employment' },
        { key: 'academicAchievements', title: 'Academic Achievements' }
    ];

    const profileSurfaceClass = 'overflow-hidden rounded-[28px] border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] shadow-[0_24px_70px_rgba(15,23,42,0.08)]';
    const profilePanelClass = 'rounded-2xl border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-elevated))] shadow-sm';
    const profilePillClass = 'inline-flex items-center gap-2 rounded-full border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-body))] px-3 py-1.5 text-xs font-medium text-[rgb(var(--text-secondary))]';
    const profileAccentButtonClass = 'rounded-full bg-[rgb(var(--accent))] px-5 py-3 font-semibold text-white shadow-lg shadow-[rgb(var(--accent))]/20 transition-all hover:bg-[rgb(var(--accent-hover))] hover:shadow-[0_18px_30px_rgba(59,130,246,0.28)]';

    const renderCareerModalFields = () => {
        const section = careerModalSection;
        const data = careerModalData || {};

        const field = (key, label, placeholder = '', type = 'text') => (
            <div>
                <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">{label}</label>
                {type === 'textarea' ? (
                    <textarea
                        value={data[key] || ''}
                        onChange={(e) => setCareerModalData((prev) => ({ ...prev, [key]: e.target.value }))}
                        placeholder={placeholder}
                        rows={4}
                        className="w-full px-4 py-3 border border-[rgb(var(--border-subtle))] rounded-lg bg-[rgb(var(--bg-body))] text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))]"
                    />
                ) : type === 'chip' ? (
                    <TagInput
                        value={data[key] || ''}
                        onChange={(val) => setCareerModalData((prev) => ({ ...prev, [key]: val }))}
                        placeholder={placeholder}
                    />
                ) : (
                    <input
                        type={type}
                        value={data[key] || ''}
                        onChange={(e) => setCareerModalData((prev) => ({ ...prev, [key]: e.target.value }))}
                        placeholder={placeholder}
                        className="w-full px-4 py-3 border border-[rgb(var(--border-subtle))] rounded-lg bg-[rgb(var(--bg-body))] text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))]"
                    />
                )}
            </div>
        );

        if (section === 'preferences') {
            return (
                <div className="grid grid-cols-1 gap-4">
                    {field('jobTypes', 'Preferred Job Types', 'e.g. Remote, Internship, Full-time', 'chip')}
                    {field('availability', 'Availability', 'More than 3 Months')}
                    {field('preferredLocations', 'Preferred Locations', 'Ahmedabad, Bengaluru, Pune', 'chip')}
                </div>
            );
        }

        if (section === 'recruiterWorkExperience') {
            return <div className="grid grid-cols-1 gap-4">{field('companyName', 'Company Name')}{field('role', 'Role / Position')}{field('startDate', 'Start Date', 'Jan 2024')}{field('endDate', 'End Date / Present', 'Present')}{field('description', 'Description', 'Responsibilities and achievements', 'textarea')}{field('keySkills', 'Key Skills Used', 'React, Node, MongoDB', 'chip')}</div>;
        }

        if (section === 'recruiterEducation') {
            return <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{field('degree', 'Degree')}{field('collegeName', 'College Name')}{field('yearOfPassing', 'Year of Passing')}{field('score', 'Percentage / CGPA')}</div>;
        }

        if (section === 'recruiterProject') {
            return <div className="grid grid-cols-1 gap-4">{field('title', 'Project Title')}{field('description', 'Description', 'What this project solves', 'textarea')}{field('techStack', 'Tech Stack', 'React, Express, MongoDB', 'chip')}{field('githubLink', 'GitHub Link', 'https://github.com/...')}{field('liveLink', 'Live Link', 'https://...')}</div>;
        }

        if (section.startsWith('recruiterAccomplishment')) {
            return field('value', recruiterModalTitles[section] || 'Accomplishment', 'Add detail');
        }

        if (section === 'profileSummary') return field('value', 'Profile Summary', 'Write your professional summary', 'textarea');
        if (['keySkills', 'accomplishments', 'academicAchievements'].includes(section)) return field('value', 'Details', 'Enter one item');
        if (section === 'languages') return <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{field('name', 'Language', 'English')}{field('proficiency', 'Proficiency', 'Fluent')}</div>;
        if (section === 'education') return <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{field('degree', 'Degree')}{field('institute', 'Institute')}{field('graduationYear', 'Graduation Year')}{field('courseType', 'Course Type', 'Full Time')}{field('score', 'Score / Grade')}</div>;
        if (section === 'internships') return <div className="grid grid-cols-1 gap-4">{field('company', 'Company')}{field('role', 'Role')}{field('duration', 'Duration', 'Jan 2025 - Mar 2025')}{field('description', 'Description', 'What you worked on', 'textarea')}</div>;
        if (section === 'projects') return <div className="grid grid-cols-1 gap-4">{field('title', 'Project Title')}{field('technologies', 'Technologies', 'React, Node.js, MongoDB', 'chip')}{field('description', 'Description', 'What the project does', 'textarea')}{field('link', 'Project Link', 'https://github.com/...')}</div>;
        if (section === 'competitiveExams') return <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">{field('examName', 'Exam Name')}{field('score', 'Score / Rank')}{field('year', 'Year')}</div>;
        if (section === 'employment') return <div className="grid grid-cols-1 gap-4">{field('company', 'Company')}{field('role', 'Role')}{field('duration', 'Duration')}{field('description', 'Description', 'Key responsibilities', 'textarea')}</div>;
        return null;
    };

    const scrollToCareerSection = (sectionKey) => {
        if (!isEditingRecruiter) {
            setIsEditingRecruiter(true);
        }
        setTimeout(() => {
            const node = document.getElementById(`recruiter-${sectionKey}`);
            if (node) {
                const yOffset = -100;
                const y = node.getBoundingClientRect().top + window.scrollY + yOffset;
                window.scrollTo({ top: y, behavior: 'smooth' });
            }
        }, 150);
    };

    const renderProfileTab = () => (
        <div className="space-y-6 sm:space-y-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Card className={profileSurfaceClass}>
                    <div className="relative overflow-hidden p-5 sm:p-7 lg:p-8">
                        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-[rgb(var(--accent))]/10 via-transparent to-[rgb(var(--success))]/10" />
                        <div className="relative grid grid-cols-1 xl:grid-cols-[1.4fr_0.8fr] gap-5 lg:gap-6">
                            <div className="flex flex-col gap-5 rounded-[24px] border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-elevated))] p-5 sm:p-6 lg:flex-row lg:items-start">
                                <div className="relative shrink-0">
                                    <div
                                        className="w-36 h-36 rounded-full p-[5px] shadow-[0_20px_40px_rgba(15,23,42,0.12)]"
                                        style={{
                                            background: `conic-gradient(rgb(var(--accent)) ${getCareerCompletion() * 3.6}deg, rgb(var(--border)) ${getCareerCompletion() * 3.6}deg)`
                                        }}
                                    >
                                        <div className="w-full h-full rounded-full bg-[rgb(var(--bg-card))] p-1">
                                            <img
                                                src={user?.photo || '/default-avatar.jpg'}
                                                alt="Profile"
                                                className="w-full h-full rounded-full object-cover"
                                            />
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] px-3 py-1 text-sm font-bold text-[rgb(var(--accent))] shadow-sm">
                                        {getCareerCompletion()}%
                                    </div>
                                    <label className="absolute right-1 top-1 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] shadow-sm transition-transform hover:scale-105 hover:bg-[rgb(var(--bg-body-alt))]">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handlePhotoUpload}
                                            className="hidden"
                                            disabled={uploadingPhoto}
                                        />
                                        {uploadingPhoto ? (
                                            <div className="w-5 h-5 border-2 border-[rgb(var(--accent))] border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <Camera className="w-5 h-5 text-[rgb(var(--accent))]" />
                                        )}
                                    </label>
                                </div>

                                <div className="flex-1 pt-1">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <h2 className="text-3xl font-bold tracking-tight text-[rgb(var(--text-primary))]">
                                            {user?.fullName || user?.email?.split('@')[0]}
                                        </h2>
                                        <button
                                            onClick={() => {
                                                setIsEditing(!isEditing);
                                                if (!isEditing) {
                                                    setTimeout(() => {
                                                        const node = document.getElementById('personal-information-section');
                                                        if (node) {
                                                            const yOffset = -100;
                                                            const y = node.getBoundingClientRect().top + window.scrollY + yOffset;
                                                            window.scrollTo({ top: y, behavior: 'smooth' });
                                                        }
                                                    }, 150);
                                                }
                                            }}
                                            className="rounded-full border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] p-2 text-[rgb(var(--text-muted))] transition-colors hover:border-[rgb(var(--accent))]/40 hover:text-[rgb(var(--accent))]"
                                            title="Edit profile"
                                        >
                                            <Edit3 className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <p className="mt-2 text-xl font-semibold text-[rgb(var(--text-secondary))]">
                                        {recruiterProfile.basic.headline || recruiterProfile.career.role || (recruiterProfile.education || [])[0]?.degree || 'Add your headline / degree'}
                                    </p>
                                    <p className="mt-1 text-base text-[rgb(var(--text-muted))] sm:text-lg">
                                        {recruiterProfile.basic.currentCompany ? `at ${recruiterProfile.basic.currentCompany}` : ((recruiterProfile.education || [])[0]?.collegeName || user?.bio || 'Add your current company / college')}
                                    </p>

                                    <div className="my-5 h-px bg-[rgb(var(--border-subtle))]" />

                                    <div className="grid grid-cols-1 gap-3 text-[rgb(var(--text-secondary))] sm:grid-cols-2">
                                        <div className={profilePillClass}>
                                            <MapPin className="h-4 w-4 text-[rgb(var(--accent))]" />
                                            <span>{profileData.location || recruiterProfile.contact.preferredLocation || 'Location not added'}</span>
                                        </div>
                                        <div className={profilePillClass}>
                                            <Mail className="h-4 w-4 text-[rgb(var(--accent))]" />
                                            <span className="truncate">{user?.email}</span>
                                        </div>
                                        <div className={profilePillClass}>
                                            <Briefcase className="h-4 w-4 text-[rgb(var(--accent))]" />
                                            <span>{recruiterProfile.career.industry || 'Add Industry'}</span>
                                        </div>
                                        <div className={profilePillClass}>
                                            <Phone className="h-4 w-4 text-[rgb(var(--accent))]" />
                                            <span>{recruiterProfile.contact.phone || 'Add phone number'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col justify-between gap-5 rounded-[24px] border border-[rgb(var(--border-subtle))] bg-gradient-to-br from-[rgb(var(--bg-elevated))] to-[rgb(var(--bg-body-alt))] p-5 sm:p-6">
                                <div>
                                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[rgb(var(--text-muted))]">Profile completion</p>
                                    <div className="mt-3 flex items-end gap-3">
                                        <span className="text-4xl font-black tracking-tight text-[rgb(var(--accent))]">{getCareerCompletion()}%</span>
                                        <span className="pb-1 text-sm text-[rgb(var(--text-muted))]">Complete your profile to get better interview matches</span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {recruiterSections
                                        .filter((section) => getRecruiterSectionCount(section.key) === 0)
                                        .slice(0, 3)
                                        .map((section) => (
                                            <div 
                                                key={section.key} 
                                                onClick={() => scrollToCareerSection(section.key)}
                                                className="flex items-center justify-between rounded-2xl border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] px-4 py-3 cursor-pointer group hover:border-[rgb(var(--accent))]/50 transition-all"
                                            >
                                                <p className="font-medium text-[rgb(var(--text-secondary))] group-hover:text-[rgb(var(--accent))] transition-colors">Add {section.title.replace(/^[A-Z]\.\s*/, '').toLowerCase()}</p>
                                                <div className="flex items-center gap-3">
                                                    <span className="rounded-full bg-[rgb(var(--success))]/10 px-2.5 py-1 text-xs font-bold text-[rgb(var(--success))]">+{Math.max(3, Math.floor(100 / recruiterSections.length))}%</span>
                                                    <div className="rounded-full bg-[rgb(var(--bg-body))] p-1.5 group-hover:bg-[rgb(var(--accent))]/10 transition-colors">
                                                        <Edit3 className="w-3.5 h-3.5 text-[rgb(var(--text-muted))] group-hover:text-[rgb(var(--accent))] transition-colors" />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                                <button
                                    onClick={() => scrollToCareerSection(recruiterSections.find((s) => getRecruiterSectionCount(s.key) === 0)?.key || 'basic')}
                                    className={`${profileAccentButtonClass} mt-2 w-full`}
                                >
                                    Add missing details
                                </button>
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* Stats Cards */}
            {/* Stats Cards */}
            <motion.div
                className="grid grid-cols-1 gap-4 sm:grid-cols-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
            >
                <Card className="group border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[rgb(var(--accent))]/40 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)] sm:p-6">
                    <div className="flex items-center gap-4">
                        <div className="rounded-2xl p-3 text-[rgb(var(--accent))] transition-colors duration-300" style={{ backgroundColor: 'rgba(var(--accent), 0.12)' }}>
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-[rgb(var(--text-primary))] sm:text-3xl">{stats.mcqTestsTaken}</p>
                            <p className="text-sm text-[rgb(var(--text-muted))]">Tests Taken</p>
                        </div>
                    </div>
                </Card>

                <Card className="group border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[rgb(var(--accent))]/40 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)] sm:p-6">
                    <div className="flex items-center gap-4">
                        <div className="rounded-2xl p-3 text-[rgb(var(--warning))] transition-colors duration-300" style={{ backgroundColor: 'rgba(var(--warning), 0.14)' }}>
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-[rgb(var(--text-primary))] sm:text-3xl">{stats.notesShared}</p>
                            <p className="text-sm text-[rgb(var(--text-muted))]">Notes Shared</p>
                        </div>
                    </div>
                </Card>

                <Card className="group border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[rgb(var(--accent))]/40 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)] sm:p-6">
                    <div className="flex items-center gap-4">
                        <div className="rounded-2xl p-3 text-[rgb(var(--success))] transition-colors duration-300" style={{ backgroundColor: 'rgba(var(--success), 0.14)' }}>
                            <Award className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-[rgb(var(--text-primary))] sm:text-3xl">
                                {Math.floor((Date.now() - new Date(user?.createdAt || Date.now()).getTime()) / (1000 * 60 * 60 * 24))}
                            </p>
                            <p className="text-sm text-[rgb(var(--text-muted))]">Days Active</p>
                        </div>
                    </div>
                </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.5 }}>
                <Card className={profilePanelClass + ' p-4 sm:p-6'}>
                    <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))] sm:text-xl">Recruiter Ready Profile</h3>
                            <p className="text-sm text-[rgb(var(--text-muted))]">A to K sections for profile showcase and recruiter search matching.</p>
                        </div>
                        {isEditingRecruiter ? (
                            <div className="flex gap-2">
                                <Button onClick={() => setIsEditingRecruiter(false)} variant="outline">Cancel</Button>
                                <Button onClick={async () => { await saveRecruiterProfile(); setIsEditingRecruiter(false); }} disabled={loading} className="bg-[rgb(var(--accent))] text-white hover:bg-[rgb(var(--accent-hover))]">{loading ? 'Saving...' : 'Save Profile'}</Button>
                            </div>
                        ) : (
                            <Button onClick={() => setIsEditingRecruiter(true)} className="bg-[rgb(var(--accent))] text-white hover:bg-[rgb(var(--accent-hover))] flex items-center justify-center">
                                <Edit3 className="w-4 h-4 mr-2" />
                                Edit Profile
                            </Button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                        <div className="lg:col-span-1">
                            <div className="sticky top-4 rounded-[24px] border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] p-4">
                                <p className="mb-3 font-semibold text-[rgb(var(--text-primary))]">Quick links</p>
                                <div className="space-y-2">
                                    {recruiterSections.map((section) => (
                                        <button key={section.key} onClick={() => scrollToCareerSection(section.key)} className="flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-left transition-colors hover:bg-[rgb(var(--bg-body-alt))]">
                                            <span className="text-sm text-[rgb(var(--text-secondary))]">{section.title}</span>
                                            <span className={`text-xs font-semibold ${getRecruiterSectionCount(section.key) > 0 ? 'text-[rgb(var(--success))]' : 'text-[rgb(var(--accent))]'}`}>{getRecruiterSectionCount(section.key) > 0 ? 'Filled' : 'Pending'}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 lg:col-span-2">
                            {!isEditingRecruiter && (
                                <div className="space-y-8 animate-fade-in block">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div id="recruiter-basic-view" className="rounded-[24px] border border-[rgb(var(--border-subtle))] bg-gradient-to-br from-[rgb(var(--bg-card))] to-[rgb(var(--bg-body-alt))] p-5 shadow-sm hover:shadow-md transition-shadow">
                                            <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-[rgb(var(--accent))] flex items-center gap-2"><User className="w-4 h-4" /> Basic Details</h4>
                                            <div className="space-y-4">
                                                <div><p className="text-xs text-[rgb(var(--text-muted))] mb-1">Headline</p><p className="font-medium text-[rgb(var(--text-primary))]">{recruiterProfile.basic.headline || 'Not specified'}</p></div>
                                                <div><p className="text-xs text-[rgb(var(--text-muted))] mb-1">Current Role</p><p className="font-medium text-[rgb(var(--text-primary))]">{recruiterProfile.basic.currentCompany ? `at ${recruiterProfile.basic.currentCompany}` : 'Not specified'}</p></div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div><p className="text-xs text-[rgb(var(--text-muted))] mb-1">Current Salary</p><p className="font-medium text-[rgb(var(--text-primary))]">{recruiterProfile.basic.currentSalary || 'N/A'}</p></div>
                                                    <div><p className="text-xs text-[rgb(var(--text-muted))] mb-1">Expected Salary</p><p className="font-medium text-[rgb(var(--text-primary))]">{recruiterProfile.basic.expectedSalary || 'N/A'}</p></div>
                                                </div>
                                                <div><p className="text-xs text-[rgb(var(--text-muted))] mb-1">Notice Period</p><p className="font-medium text-[rgb(var(--text-primary))]">{recruiterProfile.basic.noticePeriod || 'Not specified'}</p></div>
                                            </div>
                                        </div>
                                        <div id="recruiter-contact-view" className="rounded-[24px] border border-[rgb(var(--border-subtle))] bg-gradient-to-br from-[rgb(var(--bg-card))] to-[rgb(var(--bg-body-alt))] p-5 shadow-sm hover:shadow-md transition-shadow">
                                            <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-[rgb(var(--accent))] flex items-center gap-2"><Phone className="w-4 h-4" /> Contact & Preferences</h4>
                                            <div className="space-y-4">
                                                <div><p className="text-xs text-[rgb(var(--text-muted))] mb-1">Email</p><p className="font-medium text-[rgb(var(--text-primary))] flex items-center gap-2">{profileData.email || user?.email} {recruiterProfile.contact.emailVerified && <BadgeCheck className="w-4 h-4 text-[rgb(var(--success))]" />}</p></div>
                                                <div><p className="text-xs text-[rgb(var(--text-muted))] mb-1">Phone</p><p className="font-medium text-[rgb(var(--text-primary))]">{recruiterProfile.contact.phone || 'Not specified'}</p></div>
                                                <div><p className="text-xs text-[rgb(var(--text-muted))] mb-1">Address</p><p className="font-medium text-[rgb(var(--text-primary))]">{recruiterProfile.contact.address || 'Not specified'}</p></div>
                                                <div><p className="text-xs text-[rgb(var(--text-muted))] mb-1">Preferred Location</p><p className="font-medium text-[rgb(var(--text-primary))]">{recruiterProfile.contact.preferredLocation || 'Not specified'}</p></div>
                                            </div>
                                        </div>
                                    </div>

                                    <div id="recruiter-career-view" className="rounded-[24px] border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-body-alt))]/50 p-6 shadow-sm border-l-[6px] border-l-[rgb(var(--accent))]">
                                        <h4 className="mb-5 text-sm font-bold uppercase tracking-wider text-[rgb(var(--accent))] flex items-center gap-2"><Target className="w-4 h-4" /> Career Profile</h4>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                            <div><p className="text-xs text-[rgb(var(--text-muted))] mb-1">Industry</p><p className="font-medium text-[rgb(var(--text-primary))]">{recruiterProfile.career.industry || 'N/A'}</p></div>
                                            <div><p className="text-xs text-[rgb(var(--text-muted))] mb-1">Functional Area</p><p className="font-medium text-[rgb(var(--text-primary))]">{recruiterProfile.career.functionalArea || 'N/A'}</p></div>
                                            <div><p className="text-xs text-[rgb(var(--text-muted))] mb-1">Role</p><p className="font-medium text-[rgb(var(--text-primary))]">{recruiterProfile.career.role || 'N/A'}</p></div>
                                            <div><p className="text-xs text-[rgb(var(--text-muted))] mb-1">Job Type</p><p className="font-medium text-[rgb(var(--text-primary))]">{recruiterProfile.career.jobType || 'N/A'}</p></div>
                                            <div><p className="text-xs text-[rgb(var(--text-muted))] mb-1">Employment Type</p><p className="font-medium text-[rgb(var(--text-primary))]">{recruiterProfile.career.employmentType || 'N/A'}</p></div>
                                            <div><p className="text-xs text-[rgb(var(--text-muted))] mb-1">Preferred Shift</p><p className="font-medium text-[rgb(var(--text-primary))]">{recruiterProfile.career.preferredShift || 'N/A'}</p></div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                        <div id="recruiter-workExperience-view" className="space-y-4">
                                            <h4 className="text-sm font-bold uppercase tracking-wider text-[rgb(var(--accent))] flex items-center gap-2"><Briefcase className="w-4 h-4" /> Experience</h4>
                                            {(recruiterProfile.workExperience || []).length === 0 ? (
                                                <p className="text-sm text-[rgb(var(--text-muted))]/80 italic">No experience added.</p>
                                            ) : (
                                                <div className="space-y-4 pt-1">
                                                {(recruiterProfile.workExperience || []).map((exp, index) => (
                                                    <div key={`view-exp-${index}`} className="relative pl-6 before:absolute before:left-0 before:top-2 before:h-full before:w-px before:bg-[rgb(var(--border-subtle))] last:before:bg-transparent">
                                                        <div className="absolute left-[-4px] top-1.5 h-2 w-2 rounded-full bg-[rgb(var(--accent))] ring-4 ring-[rgb(var(--bg-card))]"></div>
                                                        <h5 className="text-base font-bold text-[rgb(var(--text-primary))]">{exp.role}</h5>
                                                        <p className="text-sm text-[rgb(var(--accent))] font-medium mt-0.5">{exp.companyName}</p>
                                                        <p className="text-xs font-semibold text-[rgb(var(--text-muted))] mt-1 uppercase tracking-wide">{exp.startDate} {exp.startDate && exp.endDate && '—'} {exp.endDate}</p>
                                                        {exp.description && <p className="text-sm text-[rgb(var(--text-secondary))] mt-3 whitespace-pre-wrap">{exp.description}</p>}
                                                    </div>
                                                ))}
                                                </div>
                                            )}
                                        </div>

                                        <div id="recruiter-education-view" className="space-y-4">
                                            <h4 className="text-sm font-bold uppercase tracking-wider text-[rgb(var(--accent))] flex items-center gap-2"><GraduationCap className="w-4 h-4" /> Education</h4>
                                            {(recruiterProfile.education || []).length === 0 ? (
                                                <p className="text-sm text-[rgb(var(--text-muted))]/80 italic">No education added.</p>
                                            ) : (
                                                <div className="space-y-4 pt-1">
                                                {(recruiterProfile.education || []).map((edu, index) => (
                                                    <div key={`view-edu-${index}`} className="relative pl-6 before:absolute before:left-0 before:top-2 before:h-full before:w-px before:bg-[rgb(var(--border-subtle))] last:before:bg-transparent">
                                                        <div className="absolute left-[-4px] top-1.5 h-2 w-2 rounded-full bg-[rgb(var(--success))] ring-4 ring-[rgb(var(--bg-card))]"></div>
                                                        <h5 className="text-base font-bold text-[rgb(var(--text-primary))]">{edu.degree}</h5>
                                                        <p className="text-sm text-[rgb(var(--text-secondary))] font-medium mt-0.5">{edu.collegeName}</p>
                                                        <p className="text-xs font-semibold text-[rgb(var(--text-muted))] mt-1 uppercase tracking-wide">Class of {edu.yearOfPassing} <span className="mx-1">•</span> {edu.score}</p>
                                                    </div>
                                                ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div id="recruiter-skills-view" className="rounded-[24px] border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] p-6 shadow-sm">
                                        <h4 className="mb-5 text-sm font-bold uppercase tracking-wider text-[rgb(var(--accent))] flex items-center gap-2"><WandSparkles className="w-4 h-4" /> Skills</h4>
                                        <div className="space-y-5">
                                            <div>
                                                <p className="text-xs font-semibold text-[rgb(var(--text-muted))] mb-3 uppercase tracking-wide">Key Skills</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {(recruiterProfile.skills?.keySkills || []).length === 0 ? <span className="text-sm text-[rgb(var(--text-muted))] italic">None added</span> : 
                                                    recruiterProfile.skills.keySkills.map((skill, idx) => (
                                                        <span key={idx} className="bg-[rgb(var(--accent))]/10 border border-[rgb(var(--accent))]/20 text-[rgb(var(--accent))] px-3.5 py-1.5 rounded-xl text-sm font-semibold">{skill}</span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold text-[rgb(var(--text-muted))] mb-3 uppercase tracking-wide">Secondary Skills</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {(recruiterProfile.skills?.secondarySkills || []).length === 0 ? <span className="text-sm text-[rgb(var(--text-muted))] italic">None added</span> : 
                                                    recruiterProfile.skills.secondarySkills.map((skill, idx) => (
                                                        <span key={idx} className="bg-[rgb(var(--bg-body-alt))] border border-[rgb(var(--border-subtle))] text-[rgb(var(--text-secondary))] px-3.5 py-1.5 rounded-xl text-sm font-medium">{skill}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {recruiterProfile.resume?.fileName && (
                                        <div id="recruiter-resume-view" className="rounded-[24px] border border-[rgb(var(--border-subtle))] bg-gradient-to-r from-[rgb(var(--bg-card))] to-[rgb(var(--bg-body-alt))] p-6 flex items-center justify-between shadow-sm">
                                            <div className="flex items-center gap-5">
                                                <div className="p-3.5 bg-[rgb(var(--warning))]/10 rounded-2xl text-[rgb(var(--warning))] shadow-inner"><FileText className="w-6 h-6" /></div>
                                                <div>
                                                    <h4 className="text-base font-bold text-[rgb(var(--text-primary))]">Uploaded Resume</h4>
                                                    <p className="text-sm font-medium text-[rgb(var(--text-secondary))] mt-1">{recruiterProfile.resume.fileName}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div id="recruiter-projects-view" className="space-y-4">
                                        <h4 className="text-sm font-bold uppercase tracking-wider text-[rgb(var(--accent))] flex items-center gap-2"><Building2 className="w-4 h-4" /> Projects</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            {(recruiterProfile.projects || []).length === 0 ? (
                                                <p className="text-sm text-[rgb(var(--text-muted))]/80 italic col-span-2">No projects added.</p>
                                            ) : (
                                                (recruiterProfile.projects || []).map((project, index) => (
                                                    <div key={`view-proj-${index}`} className="flex flex-col rounded-2xl border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] p-6 shadow-sm hover:border-[rgb(var(--accent))]/40 hover:shadow-md transition-all">
                                                        <h5 className="font-bold text-lg text-[rgb(var(--text-primary))] mb-2">{project.title}</h5>
                                                        <div className="flex flex-wrap gap-1.5 mb-4">
                                                            {(project.techStack || '').split(',').filter(Boolean).map((t, idx) => (
                                                                <span key={idx} className="text-[11px] font-semibold bg-[rgb(var(--bg-body))] px-2.5 py-1 rounded-md text-[rgb(var(--text-secondary))] border border-[rgb(var(--border-subtle))]">{t.trim()}</span>
                                                            ))}
                                                        </div>
                                                        <p className="text-sm text-[rgb(var(--text-secondary))] mb-5 line-clamp-3 leading-relaxed">{project.description}</p>
                                                        <div className="flex gap-4 mt-auto">
                                                            {project.githubLink && <a href={project.githubLink} target="_blank" rel="noreferrer" className="text-[rgb(var(--accent))] hover:text-[rgb(var(--accent-hover))] font-medium flex items-center gap-1.5 text-sm transition-colors"><Github className="w-4 h-4" /> GitHub</a>}
                                                            {project.liveLink && <a href={project.liveLink} target="_blank" rel="noreferrer" className="text-[rgb(var(--success))] hover:text-emerald-500 font-medium flex items-center gap-1.5 text-sm transition-colors"><Link2 className="w-4 h-4" /> Live Demo</a>}
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div id="recruiter-accomplishments-view" className="rounded-[24px] border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] p-6 shadow-sm">
                                        <h4 className="mb-5 text-sm font-bold uppercase tracking-wider text-[rgb(var(--accent))] flex items-center gap-2"><Award className="w-4 h-4" /> Accomplishments</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                            {['certifications', 'awards', 'publications', 'patents'].map((key) => (
                                                <div key={`view-${key}`}>
                                                    <p className="text-xs font-semibold text-[rgb(var(--text-muted))] mb-3 uppercase tracking-wide">{key}</p>
                                                    <ul className="space-y-2.5">
                                                        {(recruiterProfile.accomplishments[key] || []).length === 0 ? <li className="text-sm text-[rgb(var(--text-muted))] italic">None added</li> :
                                                        (recruiterProfile.accomplishments[key] || []).map((item, idx) => (
                                                            <li key={idx} className="text-sm font-medium text-[rgb(var(--text-primary))] flex items-start gap-2.5 leading-tight">
                                                                <span className="text-[rgb(var(--accent))] mt-[2px] text-xs">◆</span> <span>{item}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div id="recruiter-onlineProfiles-view" className="flex flex-wrap gap-4 pt-2">
                                        {recruiterProfile.onlineProfiles?.linkedin && <a href={recruiterProfile.onlineProfiles.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-5 py-3 rounded-xl border border-[rgb(var(--border-subtle))] bg-[#0A66C2]/10 text-[#0A66C2] hover:bg-[#0A66C2]/20 font-semibold shadow-sm transition-all hover:-translate-y-0.5"><Linkedin className="w-5 h-5"/> LinkedIn Profile</a>}
                                        {recruiterProfile.onlineProfiles?.github && <a href={recruiterProfile.onlineProfiles.github} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-5 py-3 rounded-xl border border-[rgb(var(--border-subtle))] bg-[rgb(var(--text-primary))]/10 text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--text-primary))]/20 font-semibold shadow-sm transition-all hover:-translate-y-0.5"><Github className="w-5 h-5"/> GitHub Profile</a>}
                                        {recruiterProfile.onlineProfiles?.portfolio && <a href={recruiterProfile.onlineProfiles.portfolio} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-5 py-3 rounded-xl border border-[rgb(var(--border-subtle))] bg-[rgb(var(--accent))]/10 text-[rgb(var(--accent))] hover:bg-[rgb(var(--accent))]/20 font-semibold shadow-sm transition-all hover:-translate-y-0.5"><Link2 className="w-5 h-5"/> Portfolio Website</a>}
                                    </div>
                                    
                                    {recruiterProfile.summary && (
                                        <div id="recruiter-summary-view" className="bg-[rgb(var(--bg-body-alt))] p-6 sm:p-8 rounded-[24px] border-l-[8px] border-[rgb(var(--accent))] shadow-inner relative overflow-hidden">
                                            <div className="absolute right-0 top-0 opacity-5"><FileText className="w-48 h-48 -mr-10 -mt-10" /></div>
                                            <h4 className="text-xs font-bold uppercase tracking-widest text-[rgb(var(--text-muted))] mb-4 relative z-10">About Me / Summary</h4>
                                            <p className="text-[rgb(var(--text-primary))] leading-relaxed text-sm md:text-base whitespace-pre-wrap font-medium relative z-10">{recruiterProfile.summary}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {isEditingRecruiter && (
                                <div className="space-y-4 animate-fade-in block">
                                    <div id="recruiter-basic" className="rounded-2xl border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] p-4 shadow-sm">
                                <h4 className="mb-3 text-base font-semibold text-[rgb(var(--text-primary))]">A. Basic Details</h4>
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <input value={profileData.fullName} onChange={(e) => handleInputChange('fullName', e.target.value)} placeholder="Full Name" className="rounded-lg border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-body))] px-3 py-2 text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))]" />
                                    <input value={recruiterProfile.basic.headline} onChange={(e) => updateRecruiterSection('basic', 'headline', e.target.value)} placeholder="Headline" className="rounded-lg border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-body))] px-3 py-2 text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))]" />
                                    <input value={profileData.location} onChange={(e) => handleInputChange('location', e.target.value)} placeholder="Current Location" className="rounded-lg border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-body))] px-3 py-2 text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))]" />
                                    <input value={recruiterProfile.basic.currentCompany} onChange={(e) => updateRecruiterSection('basic', 'currentCompany', e.target.value)} placeholder="Current Company" className="rounded-lg border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-body))] px-3 py-2 text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))]" />
                                    <input value={recruiterProfile.basic.currentSalary} onChange={(e) => updateRecruiterSection('basic', 'currentSalary', e.target.value)} placeholder="Current Salary" className="rounded-lg border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-body))] px-3 py-2 text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))]" />
                                    <input value={recruiterProfile.basic.expectedSalary} onChange={(e) => updateRecruiterSection('basic', 'expectedSalary', e.target.value)} placeholder="Expected Salary" className="rounded-lg border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-body))] px-3 py-2 text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))]" />
                                    <input value={recruiterProfile.basic.noticePeriod} onChange={(e) => updateRecruiterSection('basic', 'noticePeriod', e.target.value)} placeholder="Notice Period" className="rounded-lg border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-body))] px-3 py-2 text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))]" />
                                </div>
                            </div>

                            <div id="recruiter-contact" className="rounded-2xl border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] p-4 shadow-sm">
                                <h4 className="mb-3 text-base font-semibold text-[rgb(var(--text-primary))]">B. Contact Details</h4>
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <div className="rounded-lg border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-body))] px-3 py-2 text-sm text-[rgb(var(--text-primary))]">{profileData.email || user?.email} {recruiterProfile.contact.emailVerified ? '(verified)' : '(not verified)'}</div>
                                    <input value={recruiterProfile.contact.phone} onChange={(e) => updateRecruiterSection('contact', 'phone', e.target.value)} placeholder="Phone number" className="rounded-lg border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-body))] px-3 py-2 text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))]" />
                                    <input value={recruiterProfile.contact.address} onChange={(e) => updateRecruiterSection('contact', 'address', e.target.value)} placeholder="Address" className="rounded-lg border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-body))] px-3 py-2 sm:col-span-2 text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))]" />
                                    <input value={recruiterProfile.contact.preferredLocation} onChange={(e) => updateRecruiterSection('contact', 'preferredLocation', e.target.value)} placeholder="Preferred location" className="rounded-lg border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-body))] px-3 py-2 text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))]" />
                                    <select value={recruiterProfile.contact.privacy} onChange={(e) => updateRecruiterSection('contact', 'privacy', e.target.value)} className="rounded-lg border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-body))] px-3 py-2 text-[rgb(var(--text-primary))]"><option value="public">Public</option><option value="recruiter">Recruiter only</option></select>
                                </div>
                            </div>

                            <div id="recruiter-career" className="rounded-2xl border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] p-4 shadow-sm">
                                <h4 className="mb-3 text-base font-semibold text-[rgb(var(--text-primary))]">C. Career Profile</h4>
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <input value={recruiterProfile.career.industry} onChange={(e) => updateRecruiterSection('career', 'industry', e.target.value)} placeholder="Current Industry" className="rounded-lg border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-body))] px-3 py-2 text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))]" />
                                    <input value={recruiterProfile.career.functionalArea} onChange={(e) => updateRecruiterSection('career', 'functionalArea', e.target.value)} placeholder="Functional Area" className="rounded-lg border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-body))] px-3 py-2 text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))]" />
                                    <input value={recruiterProfile.career.role} onChange={(e) => updateRecruiterSection('career', 'role', e.target.value)} placeholder="Role" className="rounded-lg border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-body))] px-3 py-2 text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))]" />
                                    <select value={recruiterProfile.career.jobType} onChange={(e) => updateRecruiterSection('career', 'jobType', e.target.value)} className="rounded-lg border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-body))] px-3 py-2 text-[rgb(var(--text-primary))]"><option>Full-time</option><option>Internship</option></select>
                                    <input value={recruiterProfile.career.preferredShift} onChange={(e) => updateRecruiterSection('career', 'preferredShift', e.target.value)} placeholder="Preferred Shift" className="rounded-lg border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-body))] px-3 py-2 text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))]" />
                                    <input value={recruiterProfile.career.employmentType} onChange={(e) => updateRecruiterSection('career', 'employmentType', e.target.value)} placeholder="Expected Employment Type" className="rounded-lg border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-body))] px-3 py-2 text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))]" />
                                </div>
                            </div>

                            <div id="recruiter-workExperience" className="rounded-2xl border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] p-4 shadow-sm">
                                <div className="mb-3 flex items-center justify-between"><h4 className="text-base font-semibold text-[rgb(var(--text-primary))]">D. Work Experience</h4><Button variant="outline" onClick={() => openCareerModal('recruiterWorkExperience')}>Add</Button></div>
                                {(recruiterProfile.workExperience || []).length === 0 && <p className="text-sm text-[rgb(var(--text-muted))]">No work experience added yet.</p>}
                                {(recruiterProfile.workExperience || []).map((exp, index) => (
                                    <div key={`exp-${index}`} className="mb-3 rounded-xl border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-body))] p-3">
                                        <p className="font-semibold text-[rgb(var(--text-primary))]">{exp.role || 'Role'} at {exp.companyName || 'Company'}</p>
                                        <p className="text-xs text-[rgb(var(--text-muted))] mt-1">{exp.startDate || 'Start'} - {exp.endDate || 'Present'}</p>
                                        {exp.description && <p className="text-sm text-[rgb(var(--text-secondary))] mt-2 line-clamp-3">{exp.description}</p>}
                                        <div className="mt-3 flex flex-wrap gap-2"><Button variant="outline" onClick={() => openCareerModal('recruiterWorkExperience', index)}>Edit</Button><Button variant="outline" onClick={() => generateAIBullets(index)}>AI bullets</Button><Button variant="outline" onClick={() => deleteRecruiterItem('recruiterWorkExperience', index)}>Delete</Button></div>
                                    </div>
                                ))}
                            </div>

                            <div id="recruiter-education" className="rounded-2xl border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] p-4 shadow-sm">
                                <div className="mb-3 flex items-center justify-between"><h4 className="text-base font-semibold text-[rgb(var(--text-primary))]">E. Education</h4><Button variant="outline" onClick={() => openCareerModal('recruiterEducation')}>Add</Button></div>
                                {(recruiterProfile.education || []).length === 0 && <p className="text-sm text-[rgb(var(--text-muted))]">No education added yet.</p>}
                                {(recruiterProfile.education || []).map((edu, index) => (
                                    <div key={`edu-${index}`} className="mb-3 rounded-xl border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-body))] p-3">
                                        <p className="font-semibold text-[rgb(var(--text-primary))]">{edu.degree || 'Degree'}</p>
                                        <p className="text-sm text-[rgb(var(--text-secondary))] mt-1">{edu.collegeName || 'College'} • {edu.yearOfPassing || 'Year'} • {edu.score || 'Score'}</p>
                                        <div className="mt-3 flex gap-2"><Button variant="outline" onClick={() => openCareerModal('recruiterEducation', index)}>Edit</Button><Button variant="outline" onClick={() => deleteRecruiterItem('recruiterEducation', index)}>Delete</Button></div>
                                    </div>
                                ))}
                            </div>

                            <div id="recruiter-skills" className="rounded-2xl border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] p-4 shadow-sm">
                                <h4 className="mb-3 text-base font-semibold text-[rgb(var(--text-primary))]">F. Skills</h4>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">Key Skills</label>
                                        <TagInput
                                            value={recruiterProfile.skills.keySkills || []}
                                            onChange={(val) => setRecruiterProfile(prev => ({ ...prev, skills: { ...prev.skills, keySkills: val } }))}
                                            placeholder="Add key skills..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">Secondary Skills</label>
                                        <TagInput
                                            value={recruiterProfile.skills.secondarySkills || []}
                                            onChange={(val) => setRecruiterProfile(prev => ({ ...prev, skills: { ...prev.skills, secondarySkills: val } }))}
                                            placeholder="Add secondary skills..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <div id="recruiter-resume" className="rounded-2xl border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] p-4 shadow-sm">
                                <h4 className="mb-3 text-base font-semibold text-[rgb(var(--text-primary))]">G. Resume Upload</h4>
                                <input type="file" accept=".pdf,.doc,.docx" onChange={handleResumeSelect} className="block w-full text-sm" />
                                {recruiterProfile.resume.fileName && <p className="mt-2 text-sm text-[rgb(var(--text-secondary))]">Selected: {recruiterProfile.resume.fileName}</p>}
                            </div>

                            <div id="recruiter-projects" className="rounded-2xl border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] p-4 shadow-sm">
                                <div className="mb-3 flex items-center justify-between"><h4 className="text-base font-semibold text-[rgb(var(--text-primary))]">H. Projects</h4><Button variant="outline" onClick={() => openCareerModal('recruiterProject')}>Add</Button></div>
                                {(recruiterProfile.projects || []).length === 0 && <p className="text-sm text-[rgb(var(--text-muted))]">No projects added yet.</p>}
                                {(recruiterProfile.projects || []).map((project, index) => (
                                    <div key={`project-${index}`} className="mb-3 rounded-xl border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-body))] p-3">
                                        <p className="font-semibold text-[rgb(var(--text-primary))]">{project.title || 'Project title'}</p>
                                        {project.techStack && <p className="text-xs text-[rgb(var(--text-muted))] mt-1">{project.techStack}</p>}
                                        {project.description && <p className="text-sm text-[rgb(var(--text-secondary))] mt-2 line-clamp-3">{project.description}</p>}
                                        <div className="mt-3 flex gap-2"><Button variant="outline" onClick={() => openCareerModal('recruiterProject', index)}>Edit</Button><Button variant="outline" onClick={() => deleteRecruiterItem('recruiterProject', index)}>Delete</Button></div>
                                    </div>
                                ))}
                            </div>

                            <div id="recruiter-accomplishments" className="rounded-2xl border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] p-4 shadow-sm">
                                <h4 className="mb-3 text-base font-semibold text-[rgb(var(--text-primary))]">I. Accomplishments</h4>
                                {['certifications', 'awards', 'publications', 'patents'].map((key) => (
                                    <div key={key} className="mb-3 rounded-xl border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-body))] p-3">
                                        <div className="flex items-center justify-between gap-2"><p className="text-sm font-semibold capitalize text-[rgb(var(--text-primary))]">{key}</p><Button variant="outline" onClick={() => openCareerModal(`recruiterAccomplishment${key.charAt(0).toUpperCase()}${key.slice(1)}`)}>Add</Button></div>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {(recruiterProfile.accomplishments[key] || []).length === 0 && <p className="text-xs text-[rgb(var(--text-muted))]">No entries</p>}
                                            {(recruiterProfile.accomplishments[key] || []).map((item, idx) => (
                                                <div key={`${key}-${idx}`} className="inline-flex items-center gap-2 rounded-full bg-[rgb(var(--bg-card))] border border-[rgb(var(--border-subtle))] px-3 py-1 text-xs text-[rgb(var(--text-secondary))]">
                                                    <span>{item}</span>
                                                    <button onClick={() => deleteRecruiterItem(`recruiterAccomplishment${key.charAt(0).toUpperCase()}${key.slice(1)}`, idx)} className="text-[rgb(var(--danger))]">✕</button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div id="recruiter-onlineProfiles" className="rounded-2xl border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] p-4 shadow-sm">
                                <h4 className="mb-3 text-base font-semibold text-[rgb(var(--text-primary))]">J. Online Profiles</h4>
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                    <input value={recruiterProfile.onlineProfiles.linkedin} onChange={(e) => updateRecruiterSection('onlineProfiles', 'linkedin', e.target.value)} placeholder="LinkedIn" className="rounded-lg border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-body))] px-3 py-2 text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))]" />
                                    <input value={recruiterProfile.onlineProfiles.github} onChange={(e) => updateRecruiterSection('onlineProfiles', 'github', e.target.value)} placeholder="GitHub" className="rounded-lg border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-body))] px-3 py-2 text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))]" />
                                    <input value={recruiterProfile.onlineProfiles.portfolio} onChange={(e) => updateRecruiterSection('onlineProfiles', 'portfolio', e.target.value)} placeholder="Portfolio" className="rounded-lg border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-body))] px-3 py-2 text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))]" />
                                </div>
                            </div>

                            <div id="recruiter-summary" className="rounded-2xl border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] p-4 shadow-sm">
                                <h4 className="mb-3 text-base font-semibold text-[rgb(var(--text-primary))]">K. Summary / About Me</h4>
                                <textarea value={recruiterProfile.summary} onChange={(e) => setRecruiterProfile((prev) => ({ ...prev, summary: e.target.value }))} rows={4} placeholder="Rich text style summary with search keywords" className="w-full rounded-lg border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-body))] px-3 py-2 text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))]" />
                            </div>
                                </div>
                            )}
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* Progress Summary Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="mt-8"
            >
                <Card className="p-4 sm:p-8 bg-[rgb(var(--bg-card))] border border-[rgb(var(--border-subtle))] shadow-lg overflow-hidden relative">

                    <div className="mb-6 sm:mb-8">
                        <div className="flex items-center gap-3 sm:gap-4 mb-2">
                            <motion.div
                                className="p-3 bg-[rgb(var(--accent))]/10 text-[rgb(var(--accent))] rounded-2xl"
                                whileHover={{ scale: 1.05, rotate: 5 }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7" />
                            </motion.div>
                            <div>
                                <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[rgb(var(--text-primary))]">
                                    Your Progress Summary
                                </h3>
                                <p className="text-xs sm:text-sm text-[rgb(var(--text-muted))] mt-1">
                                    Track your learning journey over the last 30 days
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
                        {/* Activity Timeline Chart */}
                        <motion.div
                            className="bg-[rgb(var(--bg-elevated))] rounded-2xl p-5 sm:p-6 border border-[rgb(var(--border-subtle))] hover:border-[rgb(var(--accent))] transition-colors duration-300 shadow-sm"
                            whileHover={{ y: -5 }}
                        >
                            <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl">
                                        <Calendar className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-base sm:text-lg font-bold text-[rgb(var(--text-primary))]">
                                            Activity Timeline
                                        </h4>
                                        <p className="text-xs text-[rgb(var(--text-muted))]">Daily engagement</p>
                                    </div>
                                </div>
                            </div>

                            {stats.activityTimeline && stats.activityTimeline.length > 0 ? (
                                <div className="h-[280px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={stats.activityTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                                            <defs>
                                                <linearGradient id="colorTests" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                                                </linearGradient>
                                                <linearGradient id="colorNotes" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8} />
                                                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0} />
                                                </linearGradient>
                                                <linearGradient id="colorInterviews" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border-subtle))" opacity={0.5} />
                                            <XAxis
                                                dataKey="date"
                                                stroke="rgb(var(--text-muted))"
                                                tick={{ fontSize: 11, fill: 'rgb(var(--text-secondary))' }}
                                                tickFormatter={(value) => {
                                                    const date = new Date(value);
                                                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                                }}
                                                angle={-35}
                                                textAnchor="end"
                                                height={70}
                                            />
                                            <YAxis
                                                stroke="rgb(var(--text-muted))"
                                                tick={{ fontSize: 11, fill: 'rgb(var(--text-secondary))' }}
                                                width={35}
                                                allowDecimals={false}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: 'rgb(var(--bg-elevated))',
                                                    borderColor: 'rgb(var(--border))',
                                                    color: 'rgb(var(--text-primary))',
                                                    borderRadius: '12px',
                                                    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                                                    padding: '12px',
                                                    fontSize: '13px'
                                                }}
                                                labelStyle={{ fontWeight: 'bold', marginBottom: '8px', color: 'rgb(var(--text-primary))' }}
                                                labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', {
                                                    weekday: 'short',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            />
                                            <Legend
                                                wrapperStyle={{
                                                    fontSize: '12px',
                                                    paddingTop: '15px',
                                                    fontWeight: '600',
                                                    color: 'rgb(var(--text-primary))'
                                                }}
                                                iconType="circle"
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="tests"
                                                stroke="#3b82f6"
                                                strokeWidth={3}
                                                fillOpacity={1}
                                                fill="url(#colorTests)"
                                                name="MCQ Tests"
                                                activeDot={{ r: 6, strokeWidth: 2, stroke: 'rgb(var(--bg-card))' }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="notes"
                                                stroke="#a855f7"
                                                strokeWidth={3}
                                                fillOpacity={1}
                                                fill="url(#colorNotes)"
                                                name="Notes Shared"
                                                activeDot={{ r: 6, strokeWidth: 2, stroke: 'rgb(var(--bg-card))' }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="interviews"
                                                stroke="#10b981"
                                                strokeWidth={3}
                                                fillOpacity={1}
                                                fill="url(#colorInterviews)"
                                                name="Interview Prep"
                                                activeDot={{ r: 6, strokeWidth: 2, stroke: 'rgb(var(--bg-card))' }}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="h-[280px] flex items-center justify-center bg-[rgb(var(--bg-body))]/50 rounded-xl">
                                    <div className="text-center px-6">
                                        <motion.div
                                            animate={{ y: [0, -10, 0] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                        >
                                            <Calendar className="w-16 h-16 mx-auto mb-4 text-[rgb(var(--text-muted))]" />
                                        </motion.div>
                                        <p className="text-base font-semibold text-[rgb(var(--text-primary))] mb-2">No activity data yet</p>
                                        <p className="text-sm text-[rgb(var(--text-muted))]">Start your learning journey today!</p>
                                    </div>
                                </div>
                            )}
                        </motion.div>

                        {/* Performance by Category Chart */}
                        <motion.div
                            className="bg-[rgb(var(--bg-elevated))] rounded-2xl p-5 sm:p-6 border border-[rgb(var(--border-subtle))] hover:border-[rgb(var(--accent))] transition-colors duration-300 shadow-sm"
                            whileHover={{ y: -5 }}
                        >
                            <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-purple-500/10 text-purple-500 rounded-xl">
                                        <Award className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-base sm:text-lg font-bold text-[rgb(var(--text-primary))]">
                                            Performance by Topic
                                        </h4>
                                        <p className="text-xs text-[rgb(var(--text-muted))]">Average scores</p>
                                    </div>
                                </div>
                            </div>

                            {stats.performanceByCategory && stats.performanceByCategory.length > 0 ? (
                                <div className="h-[280px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={stats.performanceByCategory}
                                            layout="vertical"
                                            margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border-subtle))" opacity={0.5} />
                                            <XAxis
                                                type="number"
                                                domain={[0, 100]}
                                                stroke="rgb(var(--text-muted))"
                                                tick={{ fontSize: 11, fill: 'rgb(var(--text-secondary))' }}
                                                label={{ value: 'Score (%)', position: 'bottom', fontSize: 12, fill: 'rgb(var(--text-muted))' }}
                                            />
                                            <YAxis
                                                dataKey="category"
                                                type="category"
                                                width={90}
                                                stroke="rgb(var(--text-muted))"
                                                tick={{ fontSize: 11, fill: 'rgb(var(--text-secondary))', fontWeight: '600' }}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: 'rgb(var(--bg-elevated))',
                                                    borderColor: 'rgb(var(--border))',
                                                    color: 'rgb(var(--text-primary))',
                                                    borderRadius: '12px',
                                                    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                                                    padding: '12px',
                                                    fontSize: '13px'
                                                }}
                                                cursor={{ fill: 'rgba(168, 85, 247, 0.1)' }}
                                                formatter={(value, name, props) => {
                                                    if (name === 'score') {
                                                        const tests = props.payload.tests || 0;
                                                        return [
                                                            <div key="score">
                                                                <div className="font-bold text-[rgb(var(--accent))]">{value}%</div>
                                                                <div className="text-xs text-[rgb(var(--text-muted))]">{tests} test{tests !== 1 ? 's' : ''} taken</div>
                                                            </div>,
                                                            'Score'
                                                        ];
                                                    }
                                                    return [value, name];
                                                }}
                                            />
                                            <Bar
                                                dataKey="score"
                                                radius={[0, 12, 12, 0]}
                                                label={{
                                                    position: 'right',
                                                    fill: 'rgb(var(--accent))',
                                                    fontSize: 12,
                                                    fontWeight: 'bold',
                                                    formatter: (value) => `${value}%`
                                                }}
                                            >
                                                <defs>
                                                    <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                                                        <stop offset="0%" stopColor="rgb(var(--accent))" stopOpacity={0.8} />
                                                        <stop offset="100%" stopColor="rgb(var(--accent))" />
                                                    </linearGradient>
                                                </defs>
                                                {stats.performanceByCategory.map((entry, index) => (
                                                    <motion.rect
                                                        key={`bar-${index}`}
                                                        initial={{ scaleX: 0 }}
                                                        animate={{ scaleX: 1 }}
                                                        transition={{ duration: 0.5, delay: index * 0.1 }}
                                                        fill="url(#barGradient)"
                                                    />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="h-[280px] flex items-center justify-center bg-[rgb(var(--bg-body))]/50 rounded-xl">
                                    <div className="text-center px-6">
                                        <motion.div
                                            animate={{ rotate: [0, 10, -10, 0] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                        >
                                            <Award className="w-16 h-16 mx-auto mb-4 text-[rgb(var(--text-muted))]" />
                                        </motion.div>
                                        <p className="text-base font-semibold text-[rgb(var(--text-primary))] mb-2">No performance data yet</p>
                                        <p className="text-sm text-[rgb(var(--text-muted))]">Complete MCQ tests to track your progress!</p>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </Card>
            </motion.div>

            {/* Profile Form */}
            <Card id="personal-information-section" className="p-4 sm:p-6 bg-[rgb(var(--bg-card))] border border-[rgb(var(--border-subtle))]">
                <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2">
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-[rgb(var(--accent))]" />
                    <span className="text-[rgb(var(--text-primary))]">Personal Information</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="sm:col-span-1">
                        <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                            Full Name
                        </label>
                        <input
                            type="text"
                            value={profileData.fullName}
                            onChange={(e) => handleInputChange('fullName', e.target.value)}
                            disabled={!isEditing}
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-[rgb(var(--border-subtle))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--accent))] focus:border-transparent bg-[rgb(var(--bg-body))] text-[rgb(var(--text-primary))] disabled:bg-[rgb(var(--bg-body))]/50 disabled:cursor-not-allowed"
                        />
                    </div>

                    <div className="sm:col-span-1">
                        <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={profileData.email}
                            disabled
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-[rgb(var(--border-subtle))] rounded-lg bg-[rgb(var(--bg-body))]/30 cursor-not-allowed text-[rgb(var(--text-muted))]"
                        />
                        <p className="text-xs text-[rgb(var(--text-muted))] mt-1">Email cannot be changed</p>
                    </div>

                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                            Bio
                        </label>
                        <textarea
                            value={profileData.bio}
                            onChange={(e) => handleInputChange('bio', e.target.value)}
                            disabled={!isEditing}
                            rows={3}
                            placeholder="Tell us about yourself..."
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-[rgb(var(--border-subtle))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--accent))] focus:border-transparent bg-[rgb(var(--bg-body))] text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] disabled:bg-[rgb(var(--bg-body))]/50 disabled:cursor-not-allowed resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                            Location
                        </label>
                        <input
                            type="text"
                            value={profileData.location}
                            onChange={(e) => handleInputChange('location', e.target.value)}
                            disabled={!isEditing}
                            placeholder="City, Country"
                            className="w-full px-4 py-3 border border-[rgb(var(--border-subtle))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--accent))] focus:border-transparent bg-[rgb(var(--bg-body))] text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] disabled:bg-[rgb(var(--bg-body))]/50 disabled:cursor-not-allowed"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                            Website
                        </label>
                        <input
                            type="url"
                            value={profileData.website}
                            onChange={(e) => handleInputChange('website', e.target.value)}
                            disabled={!isEditing}
                            placeholder="https://yourwebsite.com"
                            className="w-full px-4 py-3 border border-[rgb(var(--border-subtle))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--accent))] focus:border-transparent bg-[rgb(var(--bg-body))] text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] disabled:bg-[rgb(var(--bg-body))]/50 disabled:cursor-not-allowed"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                            LinkedIn
                        </label>
                        <input
                            type="url"
                            value={profileData.linkedin}
                            onChange={(e) => handleInputChange('linkedin', e.target.value)}
                            disabled={!isEditing}
                            placeholder="https://linkedin.com/in/username"
                            className="w-full px-4 py-3 border border-[rgb(var(--border-subtle))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--accent))] focus:border-transparent bg-[rgb(var(--bg-body))] text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] disabled:bg-[rgb(var(--bg-body))]/50 disabled:cursor-not-allowed"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                            GitHub
                        </label>
                        <input
                            type="url"
                            value={profileData.github}
                            onChange={(e) => handleInputChange('github', e.target.value)}
                            disabled={!isEditing}
                            placeholder="https://github.com/username"
                            className="w-full px-4 py-3 border border-[rgb(var(--border-subtle))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--accent))] focus:border-transparent bg-[rgb(var(--bg-body))] text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] disabled:bg-[rgb(var(--bg-body))]/50 disabled:cursor-not-allowed"
                        />
                    </div>
                </div>

                {isEditing && (
                    <div className="flex gap-3 mt-6">
                        <Button
                            onClick={handleSaveProfile}
                            disabled={loading}
                            className="bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent-hover))] text-white shadow-lg shadow-[rgb(var(--accent))]/30"
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>Saving...</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Save className="w-4 h-4" />
                                    <span>Save Changes</span>
                                </div>
                            )}
                        </Button>
                        <Button
                            onClick={() => setIsEditing(false)}
                            variant="outline"
                            className="border-[rgb(var(--border))] bg-[rgb(var(--bg-body))] hover:bg-[rgb(var(--bg-body-alt))] text-[rgb(var(--text-primary))]"
                        >
                            Cancel
                        </Button>
                    </div>
                )}
            </Card>

            {/* Password Change Form */}
            {showPasswordForm && (
                <Card ref={passwordSectionRef} className="p-6 bg-[rgb(var(--bg-card))] border border-[rgb(var(--border-subtle))]">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Lock className="w-5 h-5 text-[rgb(var(--accent))]" />
                        <span className="text-[rgb(var(--text-primary))]">Change Password</span>
                    </h3>

                    <div className="space-y-4 max-w-md">
                        <div>
                            <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                                Current Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPasswords.current ? 'text' : 'password'}
                                    value={passwordData.currentPassword}
                                    onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                                    className="w-full px-4 py-3 pr-12 border border-[rgb(var(--border-subtle))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--accent))] focus:border-transparent bg-[rgb(var(--bg-body))] text-[rgb(var(--text-primary))]"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-primary))]"
                                >
                                    {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                                New Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPasswords.new ? 'text' : 'password'}
                                    value={passwordData.newPassword}
                                    onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                                    className="w-full px-4 py-3 pr-12 border border-[rgb(var(--border-subtle))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--accent))] focus:border-transparent bg-[rgb(var(--bg-body))] text-[rgb(var(--text-primary))]"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-primary))]"
                                >
                                    {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                                Confirm New Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPasswords.confirm ? 'text' : 'password'}
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                                    className="w-full px-4 py-3 pr-12 border border-[rgb(var(--border-subtle))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--accent))] focus:border-transparent bg-[rgb(var(--bg-body))] text-[rgb(var(--text-primary))]"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-primary))]"
                                >
                                    {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button
                                onClick={handleChangePassword}
                                disabled={loading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                                className="bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent-hover))] text-white shadow-lg shadow-[rgb(var(--accent))]/30"
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        <span>Changing...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Check className="w-4 h-4" />
                                        <span>Change Password</span>
                                    </div>
                                )}
                            </Button>
                            <Button
                                onClick={() => setShowPasswordForm(false)}
                                variant="outline"
                                className="border-[rgb(var(--border))] bg-[rgb(var(--bg-body))] hover:bg-[rgb(var(--bg-body-alt))] text-[rgb(var(--text-primary))]"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );

    if (!user) {
        navigate('/');
        return null;
    }

    return (
        <div className="min-h-screen bg-[rgb(var(--bg-body))]">
            {/* Header */}
            <div className="bg-[rgb(var(--bg-card))] shadow-sm border-b border-[rgb(var(--border-subtle))]">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-[rgb(var(--bg-body-alt))] rounded-lg transition-colors hover:scale-105 active:scale-95">
                            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-[rgb(var(--text-muted))]" />
                        </button>
                        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-[rgb(var(--text-primary))]">Profile Settings</h1>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
                <div className="space-y-6 sm:space-y-8">
                    <Card className="border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] p-3 sm:p-4 shadow-sm">
                        <nav className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`flex items-center gap-2 rounded-full px-4 py-3 text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'profile'
                                    ? 'bg-[rgb(var(--accent))]/15 text-[rgb(var(--accent))] ring-1 ring-[rgb(var(--accent))]/30'
                                    : 'text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-body-alt))] hover:text-[rgb(var(--accent))]'
                                    }`}
                            >
                                <User className="w-4 h-4" />
                                <span>Profile</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('preferences')}
                                className={`flex items-center gap-2 rounded-full px-4 py-3 text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'preferences'
                                    ? 'bg-[rgb(var(--accent))]/15 text-[rgb(var(--accent))] ring-1 ring-[rgb(var(--accent))]/30'
                                    : 'text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-body-alt))] hover:text-[rgb(var(--accent))]'
                                    }`}
                            >
                                <Bell className="w-4 h-4" />
                                <span>Preferences</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('security')}
                                className={`flex items-center gap-2 rounded-full px-4 py-3 text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'security'
                                    ? 'bg-[rgb(var(--accent))]/15 text-[rgb(var(--accent))] ring-1 ring-[rgb(var(--accent))]/30'
                                    : 'text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-body-alt))] hover:text-[rgb(var(--accent))]'
                                    }`}
                            >
                                <Shield className="w-4 h-4" />
                                <span>Security</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('uploads')}
                                className={`flex items-center gap-2 rounded-full px-4 py-3 text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'uploads'
                                    ? 'bg-[rgb(var(--accent))]/15 text-[rgb(var(--accent))] ring-1 ring-[rgb(var(--accent))]/30'
                                    : 'text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-body-alt))] hover:text-[rgb(var(--accent))]'
                                    }`}
                            >
                                <FileText className="w-4 h-4" />
                                <span>My Uploads</span>
                            </button>
                        </nav>
                    </Card>

                    <div className="animate-fade-in space-y-4 sm:space-y-6">
                        {activeTab === 'profile' && renderProfileTab()}

                        {activeTab === 'preferences' && (
                            <div className="space-y-6">
                                <Card className="p-4 sm:p-6 bg-[rgb(var(--bg-card))] border border-[rgb(var(--border-subtle))] shadow-sm">
                                    <h3 className="mb-4 flex items-center gap-2 text-base font-semibold sm:text-lg">
                                        <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-[rgb(var(--accent))]" />
                                        <span className="text-[rgb(var(--text-primary))]">Notification Preferences</span>
                                    </h3>

                                    <div className="space-y-4">
                                        <div className="flex flex-col gap-3 border-b border-[rgb(var(--border-subtle))] py-3 sm:flex-row sm:items-center sm:justify-between">
                                            <div className="flex-1">
                                                <h4 className="text-sm font-medium text-[rgb(var(--text-primary))]">Email Notifications</h4>
                                                <p className="mt-1 text-xs text-[rgb(var(--text-muted))] sm:text-sm">Receive email updates about your account activity</p>
                                            </div>
                                            <label className="relative inline-flex cursor-pointer items-center">
                                                <input type="checkbox" checked={preferences.emailNotifications} onChange={(e) => handlePreferenceChange('emailNotifications', e.target.checked)} className="sr-only peer" />
                                                <div className="peer h-6 w-11 rounded-full bg-[rgb(var(--border-subtle))] after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-[rgb(var(--border))] after:bg-[rgb(var(--bg-body))] after:transition-all after:content-[''] peer-checked:bg-[rgb(var(--accent))] peer-checked:after:translate-x-full peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[rgb(var(--accent))]"></div>
                                            </label>
                                        </div>

                                        <div className="flex flex-col gap-3 border-b border-[rgb(var(--border-subtle))] py-3 sm:flex-row sm:items-center sm:justify-between">
                                            <div className="flex-1">
                                                <h4 className="text-sm font-medium text-[rgb(var(--text-primary))]">Test Reminders</h4>
                                                <p className="mt-1 text-xs text-[rgb(var(--text-muted))] sm:text-sm">Get notified about upcoming scheduled tests</p>
                                            </div>
                                            <label className="relative inline-flex cursor-pointer items-center">
                                                <input type="checkbox" checked={preferences.testReminders} onChange={(e) => handlePreferenceChange('testReminders', e.target.checked)} className="sr-only peer" />
                                                <div className="peer h-6 w-11 rounded-full bg-[rgb(var(--border-subtle))] after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-[rgb(var(--border))] after:bg-[rgb(var(--bg-body))] after:transition-all after:content-[''] peer-checked:bg-[rgb(var(--accent))] peer-checked:after:translate-x-full peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[rgb(var(--accent))]"></div>
                                            </label>
                                        </div>

                                        <div className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
                                            <div className="flex-1">
                                                <h4 className="text-sm font-medium text-[rgb(var(--text-primary))]">Weekly Digest</h4>
                                                <p className="mt-1 text-xs text-[rgb(var(--text-muted))] sm:text-sm">Receive weekly summary of your progress</p>
                                            </div>
                                            <label className="relative inline-flex cursor-pointer items-center">
                                                <input type="checkbox" checked={preferences.weeklyDigest} onChange={(e) => handlePreferenceChange('weeklyDigest', e.target.checked)} className="sr-only peer" />
                                                <div className="peer h-6 w-11 rounded-full bg-[rgb(var(--border-subtle))] after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-[rgb(var(--border))] after:bg-[rgb(var(--bg-body))] after:transition-all after:content-[''] peer-checked:bg-[rgb(var(--accent))] peer-checked:after:translate-x-full peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[rgb(var(--accent))]"></div>
                                            </label>
                                        </div>
                                    </div>
                                </Card>

                                <Card className="p-4 sm:p-6 bg-[rgb(var(--bg-card))] border border-[rgb(var(--border-subtle))] shadow-sm">
                                    <h3 className="mb-4 flex items-center gap-2 text-base font-semibold sm:text-lg">
                                        <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-[rgb(var(--accent))]" />
                                        <span className="text-[rgb(var(--text-primary))]">Localization</span>
                                    </h3>

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-[rgb(var(--text-primary))]">Language</label>
                                            <select value={preferences.language} onChange={(e) => handlePreferenceChange('language', e.target.value)} className="w-full rounded-lg border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-body))] px-4 py-3 text-[rgb(var(--text-primary))] focus:border-transparent focus:ring-2 focus:ring-[rgb(var(--accent))]">
                                                <option value="en">English</option>
                                                <option value="es">Spanish</option>
                                                <option value="fr">French</option>
                                                <option value="de">German</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-[rgb(var(--text-primary))]">Timezone</label>
                                            <input type="text" value={preferences.timezone} readOnly className="w-full cursor-not-allowed rounded-lg border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-body))]/30 px-4 py-3 text-[rgb(var(--text-muted))]" />
                                        </div>
                                    </div>
                                </Card>

                                <div className="flex flex-col gap-3 sm:flex-row">
                                    <Button onClick={handleSavePreferences} disabled={loading} className="bg-[rgb(var(--accent))] text-white shadow-lg shadow-[rgb(var(--accent))]/30 hover:bg-[rgb(var(--accent-hover))]">
                                        {loading ? (
                                            <div className="flex items-center gap-2">
                                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                                <span>Saving...</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <Save className="w-4 h-4" />
                                                <span>Save Preferences</span>
                                            </div>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="space-y-6">
                                <Card className="p-4 sm:p-6 bg-[rgb(var(--bg-card))] border border-[rgb(var(--border-subtle))] shadow-sm">
                                    <h3 className="mb-4 flex items-center gap-2 text-base font-semibold sm:text-lg">
                                        <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-[rgb(var(--accent))]" />
                                        <span className="text-[rgb(var(--text-primary))]">Password & Authentication</span>
                                    </h3>

                                    <div className="space-y-4">
                                        <div className="flex flex-col gap-3 border-b border-[rgb(var(--border-subtle))] py-3 sm:flex-row sm:items-center sm:justify-between">
                                            <div className="flex-1">
                                                <h4 className="text-sm font-medium text-[rgb(var(--text-primary))]">Password</h4>
                                                <p className="mt-1 text-xs text-[rgb(var(--text-muted))] sm:text-sm">Last changed: Never</p>
                                            </div>
                                            <Button onClick={() => setShowPasswordForm(!showPasswordForm)} variant="outline" size="sm" className="border-[rgb(var(--border))] bg-[rgb(var(--bg-body))] text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--bg-body-alt))]">
                                                Change Password
                                            </Button>
                                        </div>

                                        <div className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
                                            <div className="flex-1">
                                                <h4 className="text-sm font-medium text-[rgb(var(--text-primary))]">Two-Factor Authentication</h4>
                                                <p className="mt-1 text-xs text-[rgb(var(--text-muted))] sm:text-sm">Add an extra layer of security to your account</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-[rgb(var(--text-muted))]">{twoFactorEnabled ? 'Enabled' : 'Disabled'}</span>
                                                <label className="relative inline-flex cursor-pointer items-center">
                                                    <input type="checkbox" checked={twoFactorEnabled} onChange={(e) => handleToggle2FA(e.target.checked)} disabled={loadingSecurity} className="sr-only peer" />
                                                    <div className="peer h-6 w-11 rounded-full bg-[rgb(var(--border-subtle))] after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-[rgb(var(--border))] after:bg-[rgb(var(--bg-body))] after:transition-all after:content-[''] peer-checked:bg-[rgb(var(--accent))] peer-checked:after:translate-x-full peer-disabled:cursor-not-allowed peer-disabled:opacity-50 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[rgb(var(--accent))]"></div>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </Card>

                                <Card className="p-4 sm:p-6 bg-[rgb(var(--bg-card))] border border-[rgb(var(--border-subtle))] shadow-sm">
                                    <h3 className="mb-4 flex items-center gap-2 text-base font-semibold sm:text-lg">
                                        <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-[rgb(var(--accent))]" />
                                        <span className="text-[rgb(var(--text-primary))]">Active Sessions</span>
                                    </h3>

                                    {sessions.length > 0 ? (
                                        <div className="space-y-3">
                                            {sessions.map((session, index) => (
                                                <div key={index} className="flex items-center justify-between rounded-xl border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-body-alt))] p-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="text-sm font-medium text-[rgb(var(--text-primary))]">{session.device || 'Unknown Device'}</h4>
                                                            {session.current && <span className="rounded-full bg-[rgb(var(--accent))]/20 px-2 py-0.5 text-xs text-[rgb(var(--accent))]">Current</span>}
                                                        </div>
                                                        <p className="mt-1 text-xs text-[rgb(var(--text-muted))]">{session.location || 'Unknown Location'} • Last active: {new Date(session.lastActive).toLocaleDateString()}</p>
                                                    </div>
                                                    {!session.current && (
                                                        <Button onClick={() => handleRevokeSession(session.id)} variant="ghost" size="sm" disabled={loadingSecurity} className="text-red-500 hover:bg-red-50 hover:text-red-600">
                                                            Revoke
                                                        </Button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-8 text-center">
                                            <Shield className="mx-auto mb-3 h-12 w-12 text-[rgb(var(--text-muted))]" />
                                            <p className="text-[rgb(var(--text-secondary))]">No active sessions found</p>
                                        </div>
                                    )}
                                </Card>

                                <Card className="border border-red-200 bg-[rgb(var(--bg-card))] p-4 shadow-sm sm:p-6">
                                    <h3 className="mb-4 flex items-center gap-2 text-base font-semibold sm:text-lg">
                                        <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                                        <span className="text-red-600">Danger Zone</span>
                                    </h3>

                                    <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                            <div className="flex-1">
                                                <h4 className="text-sm font-medium text-red-900">Delete Account</h4>
                                                <p className="mt-1 text-xs text-red-700 sm:text-sm">Permanently delete your account and all associated data. This action cannot be undone.</p>
                                            </div>
                                            <Button onClick={handleDeleteAccount} disabled={loadingSecurity} className="flex items-center gap-2 bg-red-600 text-white hover:bg-red-700">
                                                {loadingSecurity ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Trash2 className="w-4 h-4" />}
                                                <span>Delete Account</span>
                                            </Button>
                                        </div>
                                    </div>
                                </Card>

                                {showPasswordForm && (
                                    <Card ref={passwordSectionRef} className="p-6 bg-[rgb(var(--bg-card))] border border-[rgb(var(--border-subtle))] shadow-sm">
                                        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                                            <Lock className="w-5 h-5 text-[rgb(var(--accent))]" />
                                            <span className="text-[rgb(var(--text-primary))]">Change Password</span>
                                        </h3>

                                        <div className="space-y-4 max-w-md">
                                            <div>
                                                <label className="mb-2 block text-sm font-medium text-[rgb(var(--text-primary))]">Current Password</label>
                                                <div className="relative">
                                                    <input type={showPasswords.current ? 'text' : 'password'} value={passwordData.currentPassword} onChange={(e) => handlePasswordChange('currentPassword', e.target.value)} className="w-full rounded-lg border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-body))] px-4 py-3 pr-12 text-[rgb(var(--text-primary))] focus:border-transparent focus:ring-2 focus:ring-[rgb(var(--accent))]" />
                                                    <button type="button" onClick={() => setShowPasswords((prev) => ({ ...prev, current: !prev.current }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-primary))]">
                                                        {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                    </button>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="mb-2 block text-sm font-medium text-[rgb(var(--text-primary))]">New Password</label>
                                                <div className="relative">
                                                    <input type={showPasswords.new ? 'text' : 'password'} value={passwordData.newPassword} onChange={(e) => handlePasswordChange('newPassword', e.target.value)} className="w-full rounded-lg border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-body))] px-4 py-3 pr-12 text-[rgb(var(--text-primary))] focus:border-transparent focus:ring-2 focus:ring-[rgb(var(--accent))]" />
                                                    <button type="button" onClick={() => setShowPasswords((prev) => ({ ...prev, new: !prev.new }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-primary))]">
                                                        {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                    </button>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="mb-2 block text-sm font-medium text-[rgb(var(--text-primary))]">Confirm New Password</label>
                                                <div className="relative">
                                                    <input type={showPasswords.confirm ? 'text' : 'password'} value={passwordData.confirmPassword} onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)} className="w-full rounded-lg border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-body))] px-4 py-3 pr-12 text-[rgb(var(--text-primary))] focus:border-transparent focus:ring-2 focus:ring-[rgb(var(--accent))]" />
                                                    <button type="button" onClick={() => setShowPasswords((prev) => ({ ...prev, confirm: !prev.confirm }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-primary))]">
                                                        {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                                                <Button onClick={handleChangePassword} disabled={loading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword} className="bg-[rgb(var(--accent))] text-white shadow-lg shadow-[rgb(var(--accent))]/30 hover:bg-[rgb(var(--accent-hover))]">
                                                    {loading ? <div className="flex items-center gap-2"><div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /><span>Changing...</span></div> : <div className="flex items-center gap-2"><Check className="w-4 h-4" /><span>Change Password</span></div>}
                                                </Button>
                                                <Button onClick={() => setShowPasswordForm(false)} variant="outline" className="border-[rgb(var(--border))] bg-[rgb(var(--bg-body))] text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--bg-body-alt))]">
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                )}
                            </div>
                        )}

                        {activeTab === 'uploads' && (
                            <div className="space-y-6">
                                <Card className="p-4 sm:p-6 bg-[rgb(var(--bg-card))] border border-[rgb(var(--border-subtle))] shadow-sm">
                                    <div className="mb-4 flex items-center justify-between">
                                        <h3 className="flex items-center gap-2 text-base font-semibold sm:text-lg">
                                            <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-[rgb(var(--accent))]" />
                                            <span className="text-[rgb(var(--text-primary))]">My Notes</span>
                                        </h3>
                                        <button onClick={() => navigate('/notes')} className="text-sm font-medium text-[rgb(var(--accent))] hover:underline">Upload New</button>
                                    </div>

                                    {myUploads.notes.length === 0 ? (
                                        <div className="rounded-lg border border-dashed border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-body-alt))] py-8 text-center">
                                            <FileText className="mx-auto mb-2 h-10 w-10 text-[rgb(var(--text-muted))]" />
                                            <p className="text-[rgb(var(--text-secondary))]">You haven't uploaded any notes yet</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {myUploads.notes.map((note) => (
                                                <div key={note._id} className="rounded-xl border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-body-alt))] p-4 transition-colors hover:border-[rgb(var(--accent))]/30">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="flex-1">
                                                            <h4 className="line-clamp-1 font-medium text-[rgb(var(--text-primary))]">{note.title}</h4>
                                                            <p className="mt-1 line-clamp-1 text-xs text-[rgb(var(--text-muted))]">{note.description}</p>
                                                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                                                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${note.status === 'approved'
                                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                                    : note.status === 'rejected'
                                                                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                                    }`}>
                                                                    {note.status ? note.status.charAt(0).toUpperCase() + note.status.slice(1) : 'Pending'}
                                                                </span>
                                                                <span className="text-xs text-[rgb(var(--text-muted))]">•</span>
                                                                <span className="text-xs text-[rgb(var(--text-muted))]">{note.type === 'video' ? 'Video' : 'PDF'}</span>
                                                                <span className="text-xs text-[rgb(var(--text-muted))]">•</span>
                                                                <span className="text-xs text-[rgb(var(--text-muted))]">{note.views || 0} views</span>
                                                            </div>
                                                        </div>
                                                        {note.status === 'approved' ? <CheckCircle2 className="w-5 h-5 shrink-0 text-green-500" /> : note.status === 'rejected' ? <XCircle className="w-5 h-5 shrink-0 text-red-500" /> : <Clock className="w-5 h-5 shrink-0 text-yellow-500" />}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </Card>

                                <Card className="p-4 sm:p-6 bg-[rgb(var(--bg-card))] border border-[rgb(var(--border-subtle))] shadow-sm">
                                    <div className="mb-4 flex items-center justify-between">
                                        <h3 className="flex items-center gap-2 text-base font-semibold sm:text-lg">
                                            <Link2 className="w-4 h-4 sm:w-5 sm:h-5 text-[rgb(var(--accent))]" />
                                            <span className="text-[rgb(var(--text-primary))]">My Resources</span>
                                        </h3>
                                        <button onClick={() => navigate('/resources')} className="text-sm font-medium text-[rgb(var(--accent))] hover:underline">Upload New</button>
                                    </div>

                                    {myUploads.resources.length === 0 ? (
                                        <div className="rounded-lg border border-dashed border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-body-alt))] py-8 text-center">
                                            <Link2 className="mx-auto mb-2 h-10 w-10 text-[rgb(var(--text-muted))]" />
                                            <p className="text-[rgb(var(--text-secondary))]">You haven't uploaded any resources yet</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {myUploads.resources.map((res) => (
                                                <div key={res._id} className="rounded-xl border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-body-alt))] p-4 transition-colors hover:border-[rgb(var(--accent))]/30">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="flex-1">
                                                            <h4 className="line-clamp-1 font-medium text-[rgb(var(--text-primary))]">{res.title}</h4>
                                                            <p className="mt-1 line-clamp-1 text-xs text-[rgb(var(--text-muted))]">{res.description}</p>
                                                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                                                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${res.status === 'approved'
                                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                                    : res.status === 'rejected'
                                                                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                                    }`}>
                                                                    {res.status ? res.status.charAt(0).toUpperCase() + res.status.slice(1) : 'Pending'}
                                                                </span>
                                                                <span className="text-xs text-[rgb(var(--text-muted))]">•</span>
                                                                <span className="rounded border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-body))] px-1.5 py-0.5 text-xs text-[rgb(var(--text-secondary))]">{res.branch}</span>
                                                                <span className="rounded border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-body))] px-1.5 py-0.5 text-xs text-[rgb(var(--text-secondary))]">Sem {res.semester}</span>
                                                                <span className="text-xs text-[rgb(var(--text-muted))]">{res.views || 0} views</span>
                                                            </div>
                                                        </div>
                                                        {res.status === 'approved' ? <CheckCircle2 className="w-5 h-5 shrink-0 text-green-500" /> : res.status === 'rejected' ? <XCircle className="w-5 h-5 shrink-0 text-red-500" /> : <Clock className="w-5 h-5 shrink-0 text-yellow-500" />}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </Card>
                            </div>
                        )}
                    </div>

                    <AnimatePresence>
                        {careerModalOpen && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
                                onClick={closeCareerModal}
                            >
                                <motion.div
                                    initial={{ opacity: 0, y: 20, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 20, scale: 0.98 }}
                                    transition={{ duration: 0.2 }}
                                    className="w-full max-w-2xl bg-[rgb(var(--bg-card))] rounded-2xl shadow-2xl border border-[rgb(var(--border-subtle))]"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="flex items-center justify-between px-6 py-4 border-b border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-elevated))] rounded-t-2xl">
                                        <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))]">
                                            {careerModalIndex >= 0 ? 'Edit' : 'Add'} {recruiterModalTitles[careerModalSection] || careerSections.find((item) => item.key === careerModalSection)?.title || 'Details'}
                                        </h3>
                                        <button onClick={closeCareerModal} className="p-2 rounded-lg hover:bg-[rgb(var(--bg-body-alt))] text-[rgb(var(--text-muted))]">
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">
                                        {renderCareerModalFields()}
                                    </div>

                                    <div className="px-6 py-4 border-t border-[rgb(var(--border-subtle))] flex items-center justify-end gap-3 bg-[rgb(var(--bg-elevated))] rounded-b-2xl">
                                        <Button
                                            onClick={closeCareerModal}
                                            variant="outline"
                                            className="border-[rgb(var(--border))] bg-[rgb(var(--bg-body))] hover:bg-[rgb(var(--bg-body-alt))] text-[rgb(var(--text-primary))]"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={submitCareerModal}
                                            disabled={loading}
                                            className="bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent-hover))] text-white"
                                        >
                                            {loading ? 'Saving...' : 'Save details'}
                                        </Button>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;

import React, { useState } from 'react';
import axios from '../../utils/axiosInstance';
import { API } from '../../utils/apiPaths';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Target, Tag, User, Clock, Mail, FileText } from 'lucide-react';
import { ButtonLoader } from '../ui/Loader';

const CreateCardModal = ({ onClose, onCreated }) => {
  const [form, setForm] = useState({
    title: '',
    tag: '',
    initials: '',
    experience: '',
    desc: '',
    creatorEmail: JSON.parse(localStorage.getItem("user"))?.email || '',
    color: 'from-green-100 to-green-50',
  });
  const [loading, setLoading] = useState(false);
  const [similarSessions, setSimilarSessions] = useState([]);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const createSession = async () => {
    setLoading(true);
    try {
      const res = await axios.post(API.INTERVIEW.CREATE, form);
      toast.success('🎉 Card created successfully!');
      onCreated(res.data.sessionId);
    } catch (err) {
      toast.error(err?.response?.data?.message || '❌ Failed to create card');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Check for duplicates
      const checkRes = await axios.post(API.INTERVIEW.CHECK_DUPLICATES, { title: form.title, tag: form.tag });

      if (checkRes.data && checkRes.data.length > 0) {
        setSimilarSessions(checkRes.data);
        setShowDuplicateWarning(true);
        setLoading(false);
        return;
      }

      // 2. If no duplicates, create immediately
      await createSession();
    } catch (err) {
      console.error("Duplicate check failed:", err);
      // Fallback to creation if check fails
      await createSession();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4 lg:p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          className="bg-[rgb(var(--bg-card))] rounded-2xl lg:rounded-3xl w-full max-w-xs sm:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl max-h-[98vh] sm:max-h-[95vh] lg:max-h-[90vh] shadow-2xl border border-[rgb(var(--border-subtle))] overflow-hidden flex flex-col"
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {/* Header - Optimized for all screen sizes */}
          <div className="bg-[rgb(var(--accent))] px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-5 text-white relative overflow-hidden flex-shrink-0">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute top-0 right-0 w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32 bg-white/10 rounded-full transform translate-x-8 sm:translate-x-12 lg:translate-x-16 -translate-y-8 sm:-translate-y-12 lg:-translate-y-16"></div>
            <div className="absolute bottom-0 left-0 w-12 h-12 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-white/5 rounded-full transform -translate-x-6 sm:-translate-x-10 lg:-translate-x-12 translate-y-6 sm:translate-y-10 lg:translate-y-12"></div>

            <div className="relative z-10 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 lg:gap-3 flex-1 min-w-0">
                <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                  <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-sm sm:text-lg lg:text-xl font-bold truncate leading-tight">
                    {showDuplicateWarning ? 'Similar Sessions Found' : 'Create Interview Session'}
                  </h2>
                  <p className="text-white/80 text-xs sm:text-sm lg:text-sm truncate opacity-90">
                    {showDuplicateWarning ? 'Avoid duplication by checking these results' : 'AI-powered preparation journey'}
                  </p>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-all duration-200 flex-shrink-0 backdrop-blur-sm"
              >
                <X className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4" />
              </motion.button>
            </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            {showDuplicateWarning ? (
              <div className="p-4 sm:p-6 space-y-4">
                <div className="bg-[rgb(var(--bg-body-alt))] p-4 rounded-xl border border-[rgb(var(--border))]">
                  <h3 className="font-semibold text-[rgb(var(--text-primary))] mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4 text-orange-500" />
                    Found {similarSessions.length} Similar Session{similarSessions.length > 1 ? 's' : ''}
                  </h3>
                  <p className="text-sm text-[rgb(var(--text-muted))] mb-4">
                    We found existing sessions that match your title. You can avoid duplication by using one of these instead.
                  </p>

                  <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-1">
                    {similarSessions.map((session) => (
                      <div key={session.sessionId} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-[rgb(var(--bg-card))] rounded-lg border border-[rgb(var(--border-subtle))] hover:border-[rgb(var(--accent))] transition-colors">
                        <div className="min-w-0">
                          <h4 className="font-medium text-[rgb(var(--text-primary))] truncate">{session.title}</h4>
                          <div className="flex items-center gap-3 mt-1 text-xs text-[rgb(var(--text-muted))]">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {session.creatorDetails?.fullName || 'Unknown'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(session.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        {/* Option to create a button to view/navigate, for now just informational */}
                        <div className="flex-shrink-0 text-xs px-2 py-1 bg-[rgb(var(--bg-elevated))] rounded text-[rgb(var(--text-muted))]">
                          Existing
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <motion.button
                    onClick={() => setShowDuplicateWarning(false)}
                    className="flex-1 py-2.5 rounded-xl border border-[rgb(var(--border))] font-medium text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--bg-body-alt))] transition-colors"
                  >
                    Back to Edit
                  </motion.button>
                  <motion.button
                    onClick={createSession}
                    className="flex-1 py-2.5 rounded-xl bg-[rgb(var(--accent))] text-white font-medium hover:bg-[rgb(var(--accent-hover))] transition-colors shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    <span>Create Anyway</span>
                  </motion.button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4 lg:space-y-5">

                {/* Title Input */}
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-[rgb(var(--text-primary))]">
                    <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[rgb(var(--accent))] flex-shrink-0" />
                    <span>Interview Title</span>
                  </label>
                  <input
                    name="title"
                    type="text"
                    placeholder="e.g., Frontend Developer Interview"
                    value={form.title}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 sm:px-3 sm:py-2.5 lg:px-4 lg:py-3 border border-[rgb(var(--border))] rounded-xl bg-[rgb(var(--bg-body-alt))] text-[rgb(var(--text-primary))] focus:ring-2 focus:ring-[rgb(var(--accent))] focus:border-transparent transition-all placeholder:text-[rgb(var(--text-muted))] text-sm sm:text-base"
                  />
                </div>

                {/* Tags Input */}
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-[rgb(var(--text-primary))]">
                    <Tag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[rgb(var(--accent))] flex-shrink-0" />
                    <span>Skills & Technologies</span>
                  </label>
                  <input
                    name="tag"
                    type="text"
                    placeholder="e.g., React, JavaScript, Node.js"
                    value={form.tag}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 sm:px-3 sm:py-2.5 lg:px-4 lg:py-3 border border-[rgb(var(--border))] rounded-xl bg-[rgb(var(--bg-body-alt))] text-[rgb(var(--text-primary))] focus:ring-2 focus:ring-[rgb(var(--accent))] focus:border-transparent transition-all placeholder:text-[rgb(var(--text-muted))] text-sm sm:text-base"
                  />
                  <p className="text-xs text-[rgb(var(--text-muted))]">Separate multiple tags with commas</p>
                </div>

                {/* Grid for smaller inputs - Responsive columns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">

                  {/* Initials */}
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-[rgb(var(--text-primary))]">
                      <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[rgb(var(--accent))] flex-shrink-0" />
                      <span>Initials</span>
                    </label>
                    <input
                      name="initials"
                      type="text"
                      placeholder="FE"
                      value={form.initials}
                      onChange={handleChange}
                      required
                      maxLength={3}
                      className="w-full px-3 py-2 sm:px-3 sm:py-2.5 lg:px-4 lg:py-3 border border-[rgb(var(--border))] rounded-xl bg-[rgb(var(--bg-body-alt))] text-[rgb(var(--text-primary))] focus:ring-2 focus:ring-[rgb(var(--accent))] focus:border-transparent transition-all placeholder:text-[rgb(var(--text-muted))] text-center font-bold uppercase text-sm sm:text-base"
                    />
                  </div>

                  {/* Experience */}
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-[rgb(var(--text-primary))]">
                      <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[rgb(var(--accent))] flex-shrink-0" />
                      <span>Experience</span>
                    </label>
                    <input
                      name="experience"
                      type="text"
                      placeholder="2 Years"
                      value={form.experience}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 sm:px-3 sm:py-2.5 lg:px-4 lg:py-3 border border-[rgb(var(--border))] rounded-xl bg-[rgb(var(--bg-body-alt))] text-[rgb(var(--text-primary))] focus:ring-2 focus:ring-[rgb(var(--accent))] focus:border-transparent transition-all placeholder:text-[rgb(var(--text-muted))] text-sm sm:text-base"
                    />
                  </div>
                </div>

                {/* Email Input */}
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-[rgb(var(--text-primary))]">
                    <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[rgb(var(--accent))] flex-shrink-0" />
                    <span>Creator Email</span>
                  </label>
                  <input
                    name="creatorEmail"
                    type="email"
                    value={form.creatorEmail}
                    readOnly
                    className="w-full px-3 py-2 sm:px-3 sm:py-2.5 lg:px-4 lg:py-3 border border-[rgb(var(--border))] rounded-xl bg-[rgb(var(--bg-elevated))] text-[rgb(var(--text-muted))] cursor-not-allowed focus:ring-0 focus:border-[rgb(var(--border))] transition-all text-sm sm:text-base"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-[rgb(var(--text-primary))]">
                    <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[rgb(var(--accent))] flex-shrink-0" />
                    <span>Description</span>
                  </label>
                  <textarea
                    name="desc"
                    placeholder="Describe your interview preparation goals and focus areas..."
                    value={form.desc}
                    onChange={handleChange}
                    required
                    rows={3}
                    className="w-full px-3 py-2 sm:px-3 sm:py-2.5 lg:px-4 lg:py-3 border border-[rgb(var(--border))] rounded-xl bg-[rgb(var(--bg-body-alt))] text-[rgb(var(--text-primary))] focus:ring-2 focus:ring-[rgb(var(--accent))] focus:border-transparent transition-all placeholder:text-[rgb(var(--text-muted))] resize-none text-sm sm:text-base"
                  />
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  disabled={loading}
                  className={`w-full flex items-center justify-center gap-2 sm:gap-3 py-2.5 sm:py-3 lg:py-3.5 rounded-xl font-semibold transition-all shadow-lg text-sm sm:text-base ${loading
                    ? 'bg-[rgb(var(--bg-elevated))] cursor-not-allowed text-[rgb(var(--text-muted))]'
                    : 'bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent-hover))] text-white hover:shadow-xl active:shadow-md'
                    }`}
                >
                  {loading ? (
                    <ButtonLoader text="Processing..." />
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>Create Interview Session</span>
                    </>
                  )}
                </motion.button>
              </form>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CreateCardModal;
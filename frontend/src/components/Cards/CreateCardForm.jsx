import React, { useState } from 'react';
import axios from '../../utils/axiosInstance';
import { API } from '../../utils/apiPaths';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, X, Sparkles, Target, Tag, User, Clock, Mail, FileText } from 'lucide-react';

const CreateCardModal = ({ onClose, onCreated }) => {
  const [form, setForm] = useState({
    title: '',
    tag: '',
    initials: '',
    experience: '',
    desc: '',
    creatorEmail: '',
    color: 'from-green-100 to-green-50',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(API.INTERVIEW.CREATE, form);
      toast.success('🎉 Card created successfully!');
      onCreated(res.data.sessionId);
    } catch (err) {
      toast.error(err?.response?.data?.message || '❌ Failed to create card');
    } finally {
      setLoading(false);
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
          className="bg-white dark:bg-gray-900 rounded-2xl lg:rounded-3xl w-full max-w-xs sm:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl max-h-[98vh] sm:max-h-[95vh] lg:max-h-[90vh] shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col"
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {/* Header - Optimized for all screen sizes */}
          <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-5 text-white relative overflow-hidden flex-shrink-0">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute top-0 right-0 w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32 bg-white/10 rounded-full transform translate-x-8 sm:translate-x-12 lg:translate-x-16 -translate-y-8 sm:-translate-y-12 lg:-translate-y-16"></div>
            <div className="absolute bottom-0 left-0 w-12 h-12 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-white/5 rounded-full transform -translate-x-6 sm:-translate-x-10 lg:-translate-x-12 translate-y-6 sm:translate-y-10 lg:translate-y-12"></div>

            <div className="relative z-10 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 lg:gap-3 flex-1 min-w-0">
                <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                  <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-sm sm:text-lg lg:text-xl font-bold truncate leading-tight">Create Interview Session</h2>
                  <p className="text-orange-100 text-xs sm:text-sm lg:text-sm truncate opacity-90">AI-powered preparation journey</p>
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

          {/* Form Container - Scrollable */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            <form onSubmit={handleSubmit} className="p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4 lg:space-y-5">
              
              {/* Title Input */}
              <div className="space-y-1.5 sm:space-y-2">
                <label className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                  <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-500 flex-shrink-0" />
                  <span>Interview Title</span>
                </label>
                <input
                  name="title"
                  type="text"
                  placeholder="e.g., Frontend Developer Interview"
                  value={form.title}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 sm:px-3 sm:py-2.5 lg:px-4 lg:py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all placeholder-gray-400 dark:placeholder-gray-500 text-sm sm:text-base"
                />
              </div>

              {/* Tags Input */}
              <div className="space-y-1.5 sm:space-y-2">
                <label className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                  <Tag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-500 flex-shrink-0" />
                  <span>Skills & Technologies</span>
                </label>
                <input
                  name="tag"
                  type="text"
                  placeholder="e.g., React, JavaScript, Node.js"
                  value={form.tag}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 sm:px-3 sm:py-2.5 lg:px-4 lg:py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all placeholder-gray-400 dark:placeholder-gray-500 text-sm sm:text-base"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">Separate multiple tags with commas</p>
              </div>

              {/* Grid for smaller inputs - Responsive columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                
                {/* Initials */}
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                    <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-500 flex-shrink-0" />
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
                    className="w-full px-3 py-2 sm:px-3 sm:py-2.5 lg:px-4 lg:py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all placeholder-gray-400 dark:placeholder-gray-500 text-center font-bold uppercase text-sm sm:text-base"
                  />
                </div>

                {/* Experience */}
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-500 flex-shrink-0" />
                    <span>Experience</span>
                  </label>
                  <input
                    name="experience"
                    type="text"
                    placeholder="2 Years"
                    value={form.experience}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 sm:px-3 sm:py-2.5 lg:px-4 lg:py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all placeholder-gray-400 dark:placeholder-gray-500 text-sm sm:text-base"
                  />
                </div>
              </div>

              {/* Email Input */}
              <div className="space-y-1.5 sm:space-y-2">
                <label className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                  <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-500 flex-shrink-0" />
                  <span>Creator Email</span>
                </label>
                <input
                  name="creatorEmail"
                  type="email"
                  placeholder="your.email@example.com"
                  value={form.creatorEmail}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 sm:px-3 sm:py-2.5 lg:px-4 lg:py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all placeholder-gray-400 dark:placeholder-gray-500 text-sm sm:text-base"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5 sm:space-y-2">
                <label className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                  <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-500 flex-shrink-0" />
                  <span>Description</span>
                </label>
                <textarea
                  name="desc"
                  placeholder="Describe your interview preparation goals and focus areas..."
                  value={form.desc}
                  onChange={handleChange}
                  required
                  rows={3}
                  className="w-full px-3 py-2 sm:px-3 sm:py-2.5 lg:px-4 lg:py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all placeholder-gray-400 dark:placeholder-gray-500 resize-none text-sm sm:text-base"
                />
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                disabled={loading}
                className={`w-full flex items-center justify-center gap-2 sm:gap-3 py-2.5 sm:py-3 lg:py-3.5 rounded-xl font-semibold transition-all shadow-lg text-sm sm:text-base ${
                  loading
                    ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed text-gray-500 dark:text-gray-400'
                    : 'bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white hover:from-orange-600 hover:via-red-600 hover:to-pink-600 hover:shadow-xl active:shadow-md'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                    <span>Creating Session...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Create Interview Session</span>
                  </>
                )}
              </motion.button>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CreateCardModal;
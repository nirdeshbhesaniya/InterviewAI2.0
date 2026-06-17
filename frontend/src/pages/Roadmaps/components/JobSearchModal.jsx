import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Building2, MapPin, IndianRupee, ExternalLink, Briefcase, Sparkles, Loader2, GraduationCap } from 'lucide-react';
import axiosInstance from '../../../utils/axiosInstance';
import { toast } from 'react-hot-toast';

const JobCard = ({ job, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      className="p-5 rounded-2xl bg-[rgb(var(--bg-body))] border border-[rgb(var(--border))] hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all group flex flex-col h-full"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center border border-blue-500/30 group-hover:scale-105 transition-transform">
            <Building2 className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[rgb(var(--text-primary))] line-clamp-1 group-hover:text-blue-400 transition-colors">
              {job.role}
            </h3>
            <p className="text-sm text-[rgb(var(--text-muted))] font-medium flex items-center gap-1.5">
              {job.companyName}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border))] text-xs font-medium text-[rgb(var(--text-secondary))]">
          <MapPin className="w-3.5 h-3.5 text-orange-400" />
          {job.location}
        </span>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border))] text-xs font-medium text-[rgb(var(--text-secondary))]">
          <IndianRupee className="w-3.5 h-3.5 text-green-400" />
          {job.salary}
        </span>
      </div>

      <p className="text-sm text-[rgb(var(--text-muted))] mb-6 line-clamp-3 leading-relaxed flex-grow">
        {job.description}
      </p>

      <a
        href={job.applyUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-auto flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold text-sm hover:from-blue-600 hover:to-cyan-600 shadow-md hover:shadow-lg transition-all"
      >
        Apply Now
        <ExternalLink className="w-4 h-4" />
      </a>
    </motion.div>
  );
};

const JobSearchModal = ({ isOpen, onClose, careerTitle, branch }) => {
  const [activeTab, setActiveTab] = useState('freshers');
  const [isLoading, setIsLoading] = useState(false);
  const [jobsData, setJobsData] = useState(null);

  useEffect(() => {
    if (isOpen && !jobsData) {
      fetchJobs();
    }
  }, [isOpen]);

  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      const res = await axiosInstance.get(`/jobs/search?role=${encodeURIComponent(careerTitle)}&branch=${encodeURIComponent(branch || 'software')}`);
      setJobsData(res.data);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      toast.error('Failed to load live job postings. Please try again.');
      setJobsData({ freshers: [], experienced: [] });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 mt-16 md:mt-0">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[rgb(var(--bg-body))]/80 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-5xl max-h-[85vh] bg-[rgb(var(--bg-elevated))] rounded-3xl shadow-2xl border border-[rgb(var(--border))] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="relative p-6 sm:p-8 border-b border-[rgb(var(--border))] bg-gradient-to-r from-blue-500/10 via-cyan-500/5 to-transparent overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-[rgb(var(--text-primary))] flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30 text-white">
                    <Search className="w-6 h-6" />
                  </div>
                  Latest {careerTitle} Jobs
                </h2>
                <p className="text-[rgb(var(--text-muted))] mt-2 font-medium flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-yellow-500" />
                  AI-Curated real-time job postings
                </p>
              </div>
              <button
                onClick={onClose}
                className="absolute top-4 right-4 sm:static p-2.5 rounded-full bg-[rgb(var(--bg-body))] border border-[rgb(var(--border))] text-[rgb(var(--text-muted))] hover:text-red-500 hover:border-red-500/30 hover:bg-red-500/10 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content area */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8">
            {/* Tabs */}
            <div className="flex bg-[rgb(var(--bg-body))] p-1.5 rounded-xl border border-[rgb(var(--border))] mb-8 max-w-md mx-auto">
              <button
                onClick={() => setActiveTab('freshers')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-bold text-sm transition-all ${
                  activeTab === 'freshers'
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md'
                    : 'text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--bg-elevated))]'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                Freshers (0-2 Yrs)
              </button>
              <button
                onClick={() => setActiveTab('experienced')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-bold text-sm transition-all ${
                  activeTab === 'experienced'
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md'
                    : 'text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--bg-elevated))]'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                Experienced (3+ Yrs)
              </button>
            </div>

            {/* Jobs display */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-[rgb(var(--text-muted))]">
                <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
                <p className="text-lg font-medium text-[rgb(var(--text-primary))] animate-pulse">
                  Scanning latest {careerTitle} job postings...
                </p>
                <p className="text-sm mt-2">Curating top opportunities from official career portals</p>
              </div>
            ) : jobsData ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="wait">
                  {jobsData[activeTab]?.length > 0 ? (
                    jobsData[activeTab].map((job, idx) => (
                      <JobCard key={`${activeTab}-${idx}`} job={job} index={idx} />
                    ))
                  ) : (
                    <div className="col-span-full text-center py-12">
                      <div className="w-16 h-16 rounded-full bg-[rgb(var(--bg-body))] border border-[rgb(var(--border))] flex items-center justify-center mx-auto mb-4">
                        <Briefcase className="w-8 h-8 text-[rgb(var(--text-muted))]" />
                      </div>
                      <h3 className="text-lg font-bold text-[rgb(var(--text-primary))] mb-2">No jobs found</h3>
                      <p className="text-[rgb(var(--text-muted))]">We couldn't find any recent postings for this category.</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            ) : null}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default JobSearchModal;

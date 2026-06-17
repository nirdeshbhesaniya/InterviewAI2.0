import React, { useEffect } from 'react';
import { Shield, Lock, Eye, Database, Globe, Bell } from 'lucide-react';
import { motion } from 'framer-motion';

const sections = [
  {
    icon: <Database className="w-6 h-6 text-[rgb(var(--accent))]" />,
    title: "Data Collection",
    content: "We collect information you provide directly to us when you register, including your name, email address, profile picture, and any resume or details you upload to our Interview AI platform for mock interviews."
  },
  {
    icon: <Eye className="w-6 h-6 text-[rgb(var(--accent))]" />,
    title: "How We Use Your Data",
    content: "Your data is used strictly to provide, maintain, and improve our services. Specifically, we use your inputs (including audio and text during mock interviews) to generate AI feedback, analyze your performance, and personalize your learning roadmap."
  },
  {
    icon: <Lock className="w-6 h-6 text-[rgb(var(--accent))]" />,
    title: "Data Security",
    content: "We implement industry-standard security measures to protect your personal information. Your data is encrypted in transit and at rest. We do not sell your personal data to third parties."
  },
  {
    icon: <Globe className="w-6 h-6 text-[rgb(var(--accent))]" />,
    title: "Third-Party Services",
    content: "We may use third-party AI models (e.g., OpenAI, Gemini) to process interview responses. These providers are bound by strict data processing agreements and do not use your personal data to train their models without explicit consent."
  },
  {
    icon: <Bell className="w-6 h-6 text-[rgb(var(--accent))]" />,
    title: "Your Rights",
    content: "You have the right to access, correct, or delete your personal data at any time. You can manage your preferences or delete your account directly from your account settings."
  }
];

const PrivacyPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[rgb(var(--bg-body))] text-[rgb(var(--text-primary))] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center p-3 bg-[rgb(var(--accent))]/10 rounded-full mb-4">
            <Shield className="w-8 h-8 text-[rgb(var(--accent))]" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold mb-4 tracking-tight">Privacy Policy</h1>
          <p className="text-[rgb(var(--text-muted))] text-lg">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </motion.div>

        <div className="bg-[rgb(var(--bg-card))] border border-[rgb(var(--border))] rounded-2xl shadow-sm p-6 sm:p-10 space-y-12">
          
          <motion.section 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="prose prose-invert max-w-none text-[rgb(var(--text-secondary))]"
          >
            <p className="text-lg leading-relaxed">
              At <strong>Interview AI</strong>, we are committed to protecting your privacy and ensuring you have a positive experience on our platform. This policy outlines our handling practices and how we collect and use the personal data you provide during your online and offline interactions with us.
            </p>
          </motion.section>

          <div className="grid gap-8 md:grid-cols-2">
            {sections.map((section, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index + 0.3 }}
                className="bg-[rgb(var(--bg-body-alt))] p-6 rounded-xl border border-[rgb(var(--border))]/50 hover:border-[rgb(var(--accent))]/50 transition-colors"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-2 bg-[rgb(var(--bg-card))] rounded-lg shadow-sm">
                    {section.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-[rgb(var(--text-primary))]">{section.title}</h3>
                </div>
                <p className="text-[rgb(var(--text-secondary))] leading-relaxed">
                  {section.content}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-12 pt-8 border-t border-[rgb(var(--border))] text-center"
          >
            <h3 className="text-xl font-semibold mb-4">Contact Us</h3>
            <p className="text-[rgb(var(--text-secondary))] mb-4">
              If you have any questions or suggestions about our Privacy Policy, do not hesitate to contact us.
            </p>
            <a 
              href="mailto:support@interviewai.com" 
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent-hover))] transition-colors shadow-md hover:shadow-lg"
            >
              Contact Support
            </a>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;

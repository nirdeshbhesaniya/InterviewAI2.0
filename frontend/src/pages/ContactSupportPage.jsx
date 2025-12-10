import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ContactSupportForm from '../components/ContactSupport/ContactSupportForm';
import FAQSection from '../components/FAQ/FAQSection';

const ContactSupportPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-bg-body">
            {/* Header */}
            <div className="bg-bg-card border-b border-border-subtle">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span className="hidden sm:inline">Back</span>
                        </button>
                        <h1 className="text-xl font-semibold text-text-primary">
                            Support Center
                        </h1>
                        <div className="w-16"></div> {/* Spacer for centering */}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
                        Still have questions?
                    </h2>
                    <p className="text-lg text-text-secondary max-w-2xl mx-auto">
                        Our support team is here to help you get the most out of Interview AI.
                        We're committed to providing you with the best experience possible.
                    </p>
                </motion.div>

                {/* Two Column Layout */}
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
                    {/* Contact Form Section */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <ContactSupportForm />
                    </motion.div>

                    {/* FAQ Section */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <FAQSection />
                    </motion.div>
                </div>

                {/* Additional Support Options */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="mt-16 bg-bg-card rounded-2xl shadow-card border border-border-subtle p-8"
                >
                    <h3 className="text-2xl font-bold text-text-primary mb-6 text-center">
                        Other Ways to Get Help
                    </h3>

                    <div className="grid md:grid-cols-3 gap-6">
                        {/* Community */}
                        <div className="text-center p-6 bg-secondary/10 rounded-xl border border-secondary/20">
                            <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM9 9a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h4 className="font-semibold text-text-primary mb-2">Community Forum</h4>
                            <p className="text-text-secondary text-sm">
                                Join our community to share tips and get help from other users
                            </p>
                        </div>

                        {/* Documentation */}
                        <div className="text-center p-6 bg-primary/10 rounded-xl border border-primary/20">
                            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <h4 className="font-semibold text-text-primary mb-2">Documentation</h4>
                            <p className="text-text-secondary text-sm">
                                Browse our comprehensive guides and tutorials
                            </p>
                        </div>

                        {/* Video Tutorials */}
                        <div className="text-center p-6 bg-accent/10 rounded-xl border border-accent/20">
                            <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1a3 3 0 000-6h-1m1 6V4a2 2 0 112 2v6a2 2 0 01-2 2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a4 4 0 01-4 4h-4a4 4 0 01-4-4v-3m8-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h4 className="font-semibold text-text-primary mb-2">Video Tutorials</h4>
                            <p className="text-text-secondary text-sm">
                                Watch step-by-step video guides to master Interview AI
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ContactSupportPage;

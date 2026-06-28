import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import Header from '../../pages/InterviewPrep/components/Header';
import Footer from '../../pages/InterviewPrep/components/Footer';
import FeedbackModal from '../../components/Modals/FeedbackModal';

import HeroSection from './components/HeroSection';
import Features from './components/Features';
import OldVsNewWay from './components/OldVsNewWay';
import HowItWorks from './components/HowItWorks';
import Testimonials from './components/Testimonials';
import CTA from './components/CTA';

const LandingPage = () => {
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const navigate = useNavigate();

    const handleRateExperience = () => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            setShowFeedbackModal(true);
        } else {
            navigate('/login');
        }
    };

    return (
        <div className="min-h-screen bg-[rgb(var(--bg-body))] text-[rgb(var(--text-primary))] font-sans selection:bg-[rgb(var(--accent))]/30 overflow-x-hidden">
            {/* Header */}
            <Header onLoginClick={() => navigate('/login')} />

            {/* Hero Section */}
            <HeroSection onStart={() => navigate('/signup')} onLogin={() => navigate('/login')} />

            {/* Features */}
            <Features onLogin={() => navigate('/login')} />

            {/* Old Way vs New Way Comparison */}
            <OldVsNewWay onJoin={() => navigate('/signup')} />

            {/* How It Works */}
            <HowItWorks />

            {/* Testimonials */}
            <Testimonials onRate={handleRateExperience} />

            {/* Call to Action */}
            <CTA onJoin={() => navigate('/signup')} />

            {/* Contact Support Section */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[rgb(var(--bg-body-alt))]">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="text-center p-8 bg-gradient-to-r from-[rgb(var(--accent))] to-[#e8a55a] rounded-3xl text-white shadow-lg"
                    >
                        <MessageSquare className="w-12 h-12 mx-auto mb-4" />
                        <h3 className="text-2xl md:text-3xl font-bold mb-4">Need Help or Have Questions?</h3>
                        <p className="text-white/90 mb-6 text-lg">
                            Our support team is here to help you get the most out of Interview AI
                        </p>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/support')}
                            className="px-8 py-3 bg-white text-[rgb(var(--accent))] rounded-xl font-semibold hover:bg-gray-50 transition-colors shadow-lg inline-flex items-center gap-2"
                        >
                            <MessageSquare className="w-5 h-5" />
                            Contact Support
                        </motion.button>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <Footer />

            {/* Feedback Modal */}
            <FeedbackModal
                isOpen={showFeedbackModal}
                onClose={() => setShowFeedbackModal(false)}
            />
        </div>
    );
};

export default LandingPage;

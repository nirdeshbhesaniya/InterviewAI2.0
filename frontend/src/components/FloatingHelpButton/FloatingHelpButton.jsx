import React from 'react';
import { HelpCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const FloatingHelpButton = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Hide on MCQ test page
    if (location.pathname === '/mcq-test') {
        return null;
    }

    return (
        <motion.button
            onClick={() => navigate('/support')}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 lg:bottom-8 lg:right-8 z-40 bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent-hover))] text-white p-3 sm:p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
            title="Get Help & Support"
        >
            <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6" />
        </motion.button>
    );
};

export default FloatingHelpButton;

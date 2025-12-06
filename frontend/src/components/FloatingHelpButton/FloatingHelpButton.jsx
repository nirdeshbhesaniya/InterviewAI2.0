import React from 'react';
import { HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const FloatingHelpButton = () => {
    const navigate = useNavigate();

    return (
        <motion.button
            onClick={() => navigate('/support')}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 lg:bottom-8 lg:right-8"
            title="Get Help & Support"
        >
            <HelpCircle className="w-6 h-6" />
        </motion.button>
    );
};

export default FloatingHelpButton;

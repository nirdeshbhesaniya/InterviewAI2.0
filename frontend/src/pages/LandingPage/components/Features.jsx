import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, ClipboardCheck, Code, BookOpen, Library, FolderOpen, Bot, User, Network } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../../context/UserContext';
import { APP_FEATURES } from '../../../utils/data';

// Map icon strings from data.js to Lucide components
const iconMap = {
    'MessageSquare': MessageSquare,
    'ClipboardCheck': ClipboardCheck,
    'Code': Code,
    'BookOpen': BookOpen,
    'Library': Library,
    'FolderOpen': FolderOpen,
    'Bot': Bot,
    'User': User,
    'Network': Network
};

const Features = ({ onLogin }) => {
    const { user } = useContext(UserContext);
    const navigate = useNavigate();

    const handleFeatureClick = (link) => {
        // Don't navigate if link is '#' (chatbot)
        if (link === '#') return;

        if (user) {
            navigate(link);
        } else {
            onLogin?.();
        }
    };
    return (
        <section id="features" className="py-24 bg-[rgb(var(--bg-body))] relative">
            {/* Background Gradients */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[rgb(var(--accent))]/5 rounded-full blur-[100px] -z-10"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px] -z-10"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-5xl font-bold text-[rgb(var(--text-primary))] mb-4"
                    >
                        Powerful Features for <span className="text-transparent bg-clip-text bg-gradient-to-r from-[rgb(var(--accent))] to-purple-500">Serious Preparation</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-[rgb(var(--text-secondary))] max-w-2xl mx-auto"
                    >
                        Everything you need to crack your next technical interview, all in one platform.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {APP_FEATURES.map((feature, idx) => {
                        const Icon = iconMap[feature.icon] || MessageSquare;

                        // Parse color string from data.js (e.g., "from-emerald-500 to-green-600") 
                        // We'll use a standard style for now to keep it consistent with our theme

                        return (
                            <motion.div
                                key={feature.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                onClick={() => handleFeatureClick(feature.link)}
                                className="group relative bg-[rgb(var(--bg-card))] border border-[rgb(var(--border))] rounded-2xl p-8 hover:border-[rgb(var(--accent))]/50 transition-all duration-300 hover:shadow-xl hover:shadow-[rgb(var(--accent))]/5 cursor-pointer hover:-translate-y-1"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-[rgb(var(--accent))]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>

                                <div className="relative z-10">
                                    <div className="w-14 h-14 rounded-xl bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border))] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 group-hover:border-[rgb(var(--accent))]/30">
                                        <Icon className="w-7 h-7 text-[rgb(var(--accent))]" />
                                    </div>

                                    <h3 className="text-xl font-bold text-[rgb(var(--text-primary))] mb-3 group-hover:text-[rgb(var(--accent))] transition-colors">
                                        {feature.title}
                                    </h3>

                                    <p className="text-[rgb(var(--text-secondary))] leading-relaxed text-sm">
                                        {feature.description}
                                    </p>

                                    {/* Click indicator */}
                                    <div className="mt-4 text-xs text-[rgb(var(--accent))] opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                                        {user ? 'Click to access →' : 'Click to get started →'}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default Features;

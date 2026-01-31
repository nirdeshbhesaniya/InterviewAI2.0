import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../../context/UserContext';

const CTA = ({ onJoin }) => {
    const { user } = useContext(UserContext);
    const navigate = useNavigate();
    return (
        <section className="py-24 relative overflow-hidden">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-[rgb(var(--bg-body))] to-[rgb(var(--accent))]/10"></div>

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[rgb(var(--accent))]/10 rounded-full blur-[150px] pointer-events-none"></div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-4xl md:text-6xl font-bold text-[rgb(var(--text-primary))] mb-8 tracking-tight">
                        Ready to Ace Your Next <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[rgb(var(--accent))] to-purple-600">
                            Interview?
                        </span>
                    </h2>
                    <p className="text-xl text-[rgb(var(--text-secondary))] mb-12 max-w-2xl mx-auto">
                        Join thousands of developers who are using Interview AI to fast-track their career growth.
                        Start practicing today for free.
                    </p>

                    <button
                        onClick={() => {
                            if (user) {
                                navigate('/dashboard');
                            } else {
                                onJoin?.();
                            }
                        }}
                        className="group relative inline-flex items-center gap-3 px-8 py-4 bg-[rgb(var(--bg-elevated))] text-[rgb(var(--text-primary))] border border-[rgb(var(--border))] rounded-full font-bold text-lg hover:shadow-[0_0_40px_-10px_rgba(var(--accent),0.3)] transition-all duration-300 transform hover:-translate-y-1"
                    >
                        <span>{user ? 'Go to Dashboard' : 'Get Started for Free'}</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        <div className="absolute inset-0 rounded-full ring-2 ring-[rgb(var(--accent))]/20 group-hover:ring-[rgb(var(--accent))]/40 transition-all"></div>
                    </button>

                    <p className="mt-6 text-sm text-[rgb(var(--text-muted))]">
                        No credit card required • Unlimited basic practice
                    </p>
                </motion.div>
            </div>
        </section>
    );
};

export default CTA;

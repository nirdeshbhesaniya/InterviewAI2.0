import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Star, Quote, User } from 'lucide-react';
import { API } from '../../../utils/apiPaths';

const fallbackTestimonials = [
    {
        _id: 1,
        name: 'Aman Gupta',
        role: 'Frontend Engineer',
        feedback: 'This AI helped me crack my dream job. The custom Q&A and intuitive UI made practice seamless!',
        rating: 5
    },
    {
        _id: 2,
        name: 'Sneha Roy',
        role: 'Backend Developer',
        feedback: 'Highly impressed with the interview-specific questions. The AI-generated answers were detailed and helpful.',
        rating: 5
    },
    {
        _id: 3,
        name: 'Rahul Kumar',
        role: 'DevOps Engineer',
        feedback: 'Loved the session saving and export feature. Feels like a smart AI journal for interviews.',
        rating: 4
    }
];

const Testimonials = ({ onRate }) => {
    const [testimonials, setTestimonials] = useState(fallbackTestimonials);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeedback = async () => {
            try {
                const response = await axios.get(API.FEEDBACK.PUBLIC);
                if (response.data && response.data.length > 0) {
                    setTestimonials(response.data);
                }
            } catch (error) {
                console.error("Failed to fetch public feedback", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFeedback();
    }, []);

    return (
        <section className="py-24 bg-[rgb(var(--bg-body))] relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.02]"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-[rgb(var(--text-primary))] mb-6">
                        Loved by <span className="text-[rgb(var(--accent))]">Developers</span>
                    </h2>
                    <div className="mt-8">
                        <motion.button
                            onClick={onRate}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[rgb(var(--accent))] to-purple-600 text-white rounded-xl font-medium shadow-lg shadow-purple-500/20"
                        >
                            <Star className="w-4 h-4 fill-current" />
                            Rate Your Experience
                        </motion.button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.slice(0, 3).map((item, idx) => (
                        <motion.div
                            key={item._id || idx}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                            viewport={{ once: true }}
                            className="bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border))] p-8 rounded-3xl relative hover:border-[rgb(var(--accent))]/30 transition-colors"
                        >
                            <Quote className="absolute top-8 right-8 w-8 h-8 text-[rgb(var(--text-muted))]/20" />

                            <div className="flex gap-1 mb-6">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-4 h-4 ${i < (item.rating || 5) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-600'}`}
                                    />
                                ))}
                            </div>

                            <p className="text-[rgb(var(--text-secondary))] text-lg mb-8 leading-relaxed">
                                "{item.feedback || item.comment}"
                            </p>

                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[rgb(var(--accent))] to-purple-600 flex items-center justify-center text-white font-bold text-xl overflow-hidden">
                                    {item.user?.photo ? (
                                        <img src={item.user.photo} alt={item.user.fullName} className="w-full h-full object-cover" />
                                    ) : (
                                        (item.user?.fullName?.[0] || item.name?.[0] || 'U')
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-bold text-[rgb(var(--text-primary))]">{item.user?.fullName || item.name}</h4>
                                    <p className="text-sm text-[rgb(var(--text-muted))]">{item.user?.jobTitle || item.role || 'Software Engineer'}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;

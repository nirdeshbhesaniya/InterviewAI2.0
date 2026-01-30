import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Settings, MessageSquare, Award, ArrowRight, Code2 } from 'lucide-react';

const steps = [
    {
        id: 1,
        title: "Create Profile",
        description: "Sign up and tell us your target role (e.g., Frontend Dev) and experience level.",
        icon: UserPlus,
        color: "text-blue-400",
        bg: "bg-blue-400/10",
        border: "border-blue-400/20"
    },
    {
        id: 2,
        title: "Customize Session",
        description: "Select detailed topics (React, System Design) and company style.",
        icon: Settings,
        color: "text-purple-400",
        bg: "bg-purple-400/10",
        border: "border-purple-400/20"
    },
    {
        id: 3,
        title: "Practice & Code",
        description: "Solve AI-generated questions and write code with instant feedback.",
        icon: Code2,
        color: "text-orange-400",
        bg: "bg-orange-400/10",
        border: "border-orange-400/20"
    },
    {
        id: 4,
        title: "Get Hired",
        description: "Review your detailed analytics, improve, and ace the real interview.",
        icon: Award,
        color: "text-green-400",
        bg: "bg-green-400/10",
        border: "border-green-400/20"
    }
];

const HowItWorks = () => {
    return (
        <section id="how-it-works" className="py-24 bg-[rgb(var(--bg-body-alt))] relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-24">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[rgb(var(--text-primary))] mb-6">
                            How It Works
                        </h2>
                        <p className="text-base sm:text-lg md:text-xl text-[rgb(var(--text-secondary))] max-w-2xl mx-auto">
                            Master your technical interview concepts in 4 simple steps.
                        </p>
                    </motion.div>
                </div>

                <div className="relative">
                    {/* Connecting Line - Dashed SVG for Desktop */}
                    <div className="hidden lg:block absolute top-[100px] left-[10%] right-[10%] h-[2px] z-0">
                        <svg className="w-full h-20" overflow="visible">
                            <path
                                d="M0,0 Q200,50 400,0 T800,0"
                                fill="none"
                                stroke="rgb(var(--accent))"
                                strokeWidth="2"
                                strokeDasharray="8 8"
                                className="opacity-30"
                            />
                        </svg>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {steps.map((step, idx) => (
                            <motion.div
                                key={step.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: idx * 0.2 }}
                                viewport={{ once: true }}
                                className="relative flex flex-col items-center text-center z-10"
                            >
                                {/* Step Number Badge */}
                                <div className="absolute -top-6 bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border))] text-[rgb(var(--text-muted))] w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-sm z-20">
                                    {step.id}
                                </div>

                                <div className={`w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 ${step.bg} ${step.border} border-4 rounded-full flex items-center justify-center mb-8 relative group transition-all duration-300 hover:scale-110 shadow-lg`}>
                                    <step.icon className={`w-10 h-10 sm:w-12 sm:h-12 ${step.color}`} />

                                    {/* Ripple Effect for first item */}
                                    {idx === 0 && (
                                        <span className={`absolute inset-0 rounded-full ${step.bg} animate-ping opacity-20`}></span>
                                    )}
                                </div>

                                {/* Arrow for Desktop (except last one) */}
                                {idx < steps.length - 1 && (
                                    <div className="hidden lg:block absolute top-[60px] -right-[50px] text-[rgb(var(--border-subtle))] transform -translate-y-1/2">
                                        <ArrowRight className="w-8 h-8 opacity-50" />
                                    </div>
                                )}

                                <h3 className="text-lg sm:text-xl font-bold text-[rgb(var(--text-primary))] mb-3">{step.title}</h3>
                                <p className="text-[rgb(var(--text-secondary))] leading-relaxed text-sm px-2">
                                    {step.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;

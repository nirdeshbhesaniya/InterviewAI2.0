import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FAQSection = () => {
    const [openItems, setOpenItems] = useState(new Set([0])); // First item open by default

    const faqs = [
        {
            question: "How do I get started with Interview AI?",
            answer: "Getting started is easy! Simply sign up for an account, choose your interview category, and start generating AI-powered practice questions. Our platform will create personalized interview questions based on your experience level and field."
        },
        {
            question: "What programming languages are supported in the code editor?",
            answer: "Our code execution platform supports multiple programming languages including JavaScript, Python, Java, C++, C#, Go, Rust, and more. You can write, execute, and test your code directly in the browser."
        },
        {
            question: "How accurate are the AI-generated interview questions?",
            answer: "Our AI uses Google Gemini technology to generate highly relevant and up-to-date interview questions. The questions are tailored to your specific role, experience level, and industry standards."
        },
        {
            question: "Can I export my interview sessions?",
            answer: "Yes! You can export your complete interview sessions as markdown files. This allows you to review your practice sessions offline and share them with mentors or colleagues."
        },
        {
            question: "Is there a limit to how many questions I can generate?",
            answer: "The free tier includes a generous limit of practice questions. For unlimited access and premium features, consider upgrading to our pro plan."
        },
        {
            question: "How does the chatbot work?",
            answer: "Our AI chatbot is available on every page to help answer questions about interview preparation, provide tips, and guide you through the platform features. It's powered by advanced AI to give you contextual help."
        },
        {
            question: "Can I practice with a friend or mentor?",
            answer: "Yes! You can share your interview session links with others. They can view your questions and answers, making it perfect for collaborative practice sessions."
        },
        {
            question: "What if I encounter technical issues?",
            answer: "If you experience any technical problems, please contact our support team using the form on this page. We typically respond within 24 hours and aim for faster response times for urgent issues."
        }
    ];

    const toggleItem = (index) => {
        setOpenItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(index)) {
                newSet.delete(index);
            } else {
                newSet.add(index);
            }
            return newSet;
        });
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 lg:p-8">
            <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <HelpCircle className="w-6 h-6 text-orange-500" />
                    Frequently Asked Questions
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                    Find quick answers to common questions about Interview AI.
                </p>
            </div>

            <div className="space-y-3">
                {faqs.map((faq, index) => (
                    <div
                        key={index}
                        className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden"
                    >
                        <button
                            onClick={() => toggleItem(index)}
                            className="w-full px-4 py-4 text-left bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center justify-between gap-3"
                        >
                            <span className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                                {faq.question}
                            </span>
                            {openItems.has(index) ? (
                                <ChevronUp className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                            ) : (
                                <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                            )}
                        </button>

                        <AnimatePresence>
                            {openItems.has(index) && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                                    className="overflow-hidden"
                                >
                                    <div className="px-4 py-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-600">
                                        <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base leading-relaxed">
                                            {faq.answer}
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>

            {/* Contact Prompt */}
            <div className="mt-8 p-4 bg-gradient-to-r from-orange-50 to-pink-50 dark:from-orange-900/20 dark:to-pink-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                <p className="text-sm text-gray-700 dark:text-gray-300 text-center">
                    Can't find what you're looking for?
                    <span className="font-medium text-orange-600 dark:text-orange-400 ml-1">
                        Use the contact form to get personalized help!
                    </span>
                </p>
            </div>
        </div>
    );
};

export default FAQSection;

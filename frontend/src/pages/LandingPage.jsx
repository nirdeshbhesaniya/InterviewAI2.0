import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BrainCircuit,
  Bot,
  FileCode,
  Star,
  Users,
  Zap,
  Shield,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Globe,
  Trophy
} from 'lucide-react';

import Header from '../pages/InterviewPrep/components/Header';
import Footer from '../pages/InterviewPrep/components/Footer';
import AuthModal from '../pages/Auth/AuthModel';
import SignUp from '../pages/Auth/SignUp';
import Login from '../pages/Auth/Login';
import ForgotPassword from '../pages/Auth/ForgotPassword';
import { APP_FEATURES } from '../utils/data';
import { UserContext } from '../context/UserContext.jsx';
import HeroSection from './InterviewPrep/components/HeroSection';

const testimonials = [
  {
    id: 1,
    name: 'Aman Gupta',
    role: 'Frontend Engineer',
    feedback: 'This AI helped me crack my dream job. The custom Q&A and intuitive UI made practice seamless!',
    avatar: 'https://i.pravatar.cc/40?img=5'
  },
  {
    id: 2,
    name: 'Sneha Roy',
    role: 'Backend Developer',
    feedback: 'Highly impressed with the interview-specific questions. The AI-generated answers were detailed and helpful.',
    avatar: 'https://i.pravatar.cc/40?img=7'
  },
  {
    id: 3,
    name: 'Rahul Kumar',
    role: 'DevOps Engineer',
    feedback: 'Loved the session saving and export feature. Feels like a smart AI journal for interviews.',
    avatar: 'https://i.pravatar.cc/40?img=9'
  }
];

const faqs = [
  {
    question: 'What is Interview AI?',
    answer: 'Interview AI is an intelligent platform that helps you prepare for interviews using AI-generated questions and answers tailored to your role.'
  },
  {
    question: 'Can I customize my interview topics?',
    answer: 'Yes, you can select your domain, and the system will generate questions specific to your selection.'
  },
  {
    question: 'Is it free to use?',
    answer: 'We offer a free tier with basic features. Premium features will be added soon.'
  }
];

const LandingPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const testimonialsRef = useRef(null);

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);
  const toggleAuth = () => {
    setIsLogin((prev) => !prev);
    setIsForgotPassword(false);
  };

  const showForgotPassword = () => {
    setIsForgotPassword(true);
  };

  const navigateToAuth = (type) => {
    if (type === 'login') {
      setIsLogin(true);
      setIsForgotPassword(false);
    } else if (type === 'register') {
      setIsLogin(false);
      setIsForgotPassword(false);
    }
  };

  const handleGetStarted = () => {
    if (user || localStorage.getItem('user')) {
      navigate('/dashboard');
    } else {
      openModal();
    }
  };

  const handleGoCodebase = () => {
    if (user || localStorage.getItem('user')) {
      navigate('/codebase');
    } else {
      openModal();
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (testimonialsRef.current) {
        testimonialsRef.current.scrollBy({ left: 320, behavior: 'smooth' });
        if (
          testimonialsRef.current.scrollLeft + testimonialsRef.current.clientWidth >=
          testimonialsRef.current.scrollWidth
        ) {
          testimonialsRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        }
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="flex flex-col items-center gap-6">
          <div className="flex space-x-3">
            <div className="w-5 h-5 rounded-full bg-orange-500 animate-ping [animation-delay:-0.30s]"></div>
            <div className="w-5 h-5 rounded-full bg-orange-500 animate-ping [animation-delay:-0.35s]"></div>
            <div className="w-5 h-5 rounded-full bg-orange-500 animate-ping"></div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 animate-pulse">
              <Bot className="w-7 h-7 text-orange-600 drop-shadow-md" />
              <h1 className="text-xl md:text-2xl font-bold text-orange-600 tracking-wide">
                Interview AI
              </h1>
            </div>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 mt-2 animate-fade-in-slow">
              Setting up your landing page, hold tight...
            </p>
          </div>
          <div className="w-48 h-2 bg-orange-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-orange-500 animate-loading-bar rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="font-[Urbanist] bg-gradient-to-br from-orange-50 via-white to-blue-50 min-h-screen">
      <Header onLoginClick={openModal} />

      {/* Hero Section with Enhanced Mobile Design */}

      <HeroSection />

      {/* MCQ Test Highlight Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center text-white"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-8">
              <BrainCircuit className="w-10 h-10 text-white" />
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              Test Your Knowledge with
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">
                AI-Powered MCQ Tests
              </span>
            </h2>

            <p className="text-xl sm:text-2xl text-blue-100 max-w-4xl mx-auto mb-12 leading-relaxed">
              Challenge yourself with 30 AI-generated multiple choice questions tailored to your expertise.
              Get instant evaluation, detailed feedback, and comprehensive results delivered to your email.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
              >
                <div className="w-12 h-12 bg-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">30 AI Questions</h3>
                <p className="text-blue-100">Personalized questions based on your topic and experience level</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
              >
                <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Instant Results</h3>
                <p className="text-blue-100">AI evaluation with detailed explanations and improvement tips</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
              >
                <div className="w-12 h-12 bg-purple-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Email Report</h3>
                <p className="text-blue-100">Comprehensive analysis sent directly to your inbox</p>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => user ? navigate('/mcq-test') : openModal()}
                className="inline-flex items-center gap-3 px-8 py-4 bg-white text-blue-600 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-all duration-300 shadow-2xl hover:shadow-3xl"
              >
                <BrainCircuit className="w-6 h-6" />
                <span>Start MCQ Test</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>

              <div className="flex items-center gap-2 text-blue-100">
                <Shield className="w-5 h-5" />
                <span className="text-sm">Free • No Credit Card Required</span>
              </div>
            </motion.div>

            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
            </div>
          </motion.div>
        </div>
      </section>


      {/* Enhanced Features Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 bg-gradient-to-br from-white via-orange-50/30 to-blue-50/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              App <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">Features</span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Discover powerful tools designed to accelerate your interview preparation journey
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {APP_FEATURES.map((feature, index) => (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{
                  y: -10,
                  transition: { duration: 0.3 }
                }}
                className="group relative bg-white p-8 rounded-2xl border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden"
              >
                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Feature Number Badge */}
                <div className="relative z-10 mb-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold text-lg shadow-lg">
                    {feature.id}
                  </div>
                </div>

                {/* Content */}
                <div className="relative z-10">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 group-hover:text-orange-600 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    {feature.description}
                  </p>

                  {/* Learn More Link */}
                  <div className="flex items-center text-orange-500 font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-[-10px] group-hover:translate-x-0">
                    <span className="text-sm">Learn more</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* Decorative Element */}
                <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-orange-200/20 to-blue-200/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </motion.div>
            ))}
          </div>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-center mt-16"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGetStarted}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-xl hover:shadow-2xl"
            >
              <span>Start Your Journey</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-orange-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              What <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">Users Say</span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of developers who have transformed their interview skills
            </p>

            {/* Rating Display */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                ))}
              </div>
              <div className="text-gray-600">
                <span className="font-bold text-2xl text-gray-900">4.9</span> out of 5
              </div>
              <div className="hidden sm:block text-gray-500">
                Based on 1,000+ reviews
              </div>
            </div>
          </motion.div>

          {/* Enhanced Testimonials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {testimonials.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
                className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 p-8 border border-gray-100 overflow-hidden"
              >
                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Quote Icon */}
                <div className="relative z-10 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-red-400 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                    "
                  </div>
                </div>

                {/* Testimonial Content */}
                <div className="relative z-10">
                  <p className="text-gray-700 text-lg leading-relaxed mb-6 italic">
                    "{item.feedback}"
                  </p>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>

                  {/* User Info */}
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img
                        src={item.avatar}
                        className="w-14 h-14 rounded-full object-cover border-2 border-orange-200"
                        alt={item.name}
                      />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                        <CheckCircle className="w-3 h-3 text-white" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">{item.name}</h4>
                      <p className="text-orange-600 font-medium">{item.role}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Scrolling Testimonials for Mobile */}
          <div className="block lg:hidden">
            <div
              ref={testimonialsRef}
              className="flex overflow-x-auto snap-x snap-mandatory space-x-6 pb-4 scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {testimonials.map((item, index) => (
                <motion.div
                  key={`mobile-${item.id}`}
                  className="snap-start flex-shrink-0 w-[85vw] sm:w-[70vw] max-w-sm bg-white rounded-xl shadow-lg p-6"
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src={item.avatar}
                      className="w-12 h-12 rounded-full object-cover"
                      alt={item.name}
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900">{item.name}</h4>
                      <p className="text-sm text-orange-600">{item.role}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">"{item.feedback}"</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 pt-16 border-t border-gray-200"
          >
            {[
              { icon: Users, label: "Active Users", value: "10,000+" },
              { icon: Globe, label: "Countries", value: "50+" },
              { icon: Trophy, label: "Success Rate", value: "95%" },
              { icon: Shield, label: "Uptime", value: "99.9%" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl mb-4 shadow-lg">
                  <stat.icon className="w-8 h-8" />
                </div>
                <div className="font-bold text-2xl text-gray-900">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>


      {/* Enhanced Why Choose Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">Interview AI?</span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the future of interview preparation with our cutting-edge AI technology
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {[
              {
                title: 'Tailored Q&A',
                text: 'Generate interview questions specific to your role and experience level, powered by advanced AI that understands industry trends and requirements.',
                icon: BrainCircuit,
                color: 'from-orange-500 to-red-500'
              },
              {
                title: 'Interactive Practice',
                text: 'Expand, edit, and regenerate answers. Practice like it\'s a real interview, with flexibility and depth that adapts to your learning style.',
                icon: Zap,
                color: 'from-blue-500 to-purple-500'
              },
              {
                title: 'Session History',
                text: 'Save and revisit your past Q&A sessions. Export them as PDFs or markdown files for future reference and continuous improvement.',
                icon: Shield,
                color: 'from-green-500 to-teal-500'
              }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.2 }}
                whileHover={{
                  y: -10,
                  transition: { duration: 0.3 }
                }}
                className="group relative bg-gradient-to-br from-white to-gray-50 border border-gray-100 p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden"
              >
                {/* Background Effects */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-200/20 to-blue-200/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-x-16 -translate-y-16" />

                {/* Icon */}
                <div className="relative z-10 mb-6">
                  <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${item.color} text-white rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <item.icon className="w-8 h-8" />
                  </div>
                </div>

                {/* Content */}
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-orange-600 transition-colors duration-300">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-lg">
                    {item.text}
                  </p>
                </div>

                {/* Decorative Elements */}
                <div className="absolute bottom-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                  <item.icon className="w-24 h-24 text-gray-400" />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Additional Benefits */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {[
              { label: "AI-Powered", icon: Bot },
              { label: "Real-time Feedback", icon: Zap },
              { label: "Secure & Private", icon: Shield },
              { label: "24/7 Available", icon: Globe }
            ].map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                className="text-center p-6 bg-gradient-to-br from-orange-50 to-blue-50 rounded-2xl"
              >
                <benefit.icon className="w-12 h-12 mx-auto mb-3 text-orange-600" />
                <div className="font-semibold text-gray-900">{benefit.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Enhanced FAQ Section */}
      <section className="bg-gradient-to-br from-gray-50 to-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">Questions</span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-600">
              Everything you need to know about Interview AI
            </p>
          </motion.div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <details className="group bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                  <summary className="flex items-center justify-between font-bold text-lg text-gray-900 cursor-pointer list-none">
                    <span className="pr-4">{faq.question}</span>
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white transform group-open:rotate-45 transition-transform duration-300">
                        <span className="text-xl leading-none">+</span>
                      </div>
                    </div>
                  </summary>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                  </div>
                </details>
              </motion.div>
            ))}
          </div>

          {/* Contact Support */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-center mt-16 p-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl text-white"
          >
            <h3 className="text-2xl font-bold mb-4">Still have questions?</h3>
            <p className="text-orange-100 mb-6">
              Our support team is here to help you get the most out of Interview AI
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/support')}
              className="px-8 py-3 bg-white text-orange-600 rounded-xl font-semibold hover:bg-gray-50 transition-colors shadow-lg"
            >
              Contact Support
            </motion.button>
          </motion.div>
        </div>
      </section>

      <AuthModal show={showModal} onClose={closeModal}>
        {isForgotPassword ? (
          <ForgotPassword onSwitch={toggleAuth} onNavigate={navigateToAuth} />
        ) : isLogin ? (
          <Login onSwitch={toggleAuth} onForgotPassword={showForgotPassword} />
        ) : (
          <SignUp onSwitch={toggleAuth} />
        )}
      </AuthModal>

      <Footer />
    </div>
  );
};

export default LandingPage;
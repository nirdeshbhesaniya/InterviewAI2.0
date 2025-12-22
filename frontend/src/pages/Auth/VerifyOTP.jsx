import React, { useState, useEffect, useRef } from 'react';
import { Mail, ArrowLeft, RefreshCw, Bot, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import axios from '../../utils/axiosInstance';
import { API } from '../../utils/apiPaths';

const VerifyOTP = ({ email, onBack, onVerified }) => {
    const [otp, setOtp] = useState(['', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [timer, setTimer] = useState(600); // 10 minutes in seconds
    const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

    // Countdown timer
    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [timer]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleChange = (index, value) => {
        // Only allow numbers
        if (value && !/^\d$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 3) {
            inputRefs[index + 1].current?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        // Handle backspace
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs[index - 1].current?.focus();
        }
        // Handle paste
        if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            navigator.clipboard.readText().then((text) => {
                const digits = text.replace(/\D/g, '').slice(0, 4).split('');
                const newOtp = [...otp];
                digits.forEach((digit, i) => {
                    if (i < 4) newOtp[i] = digit;
                });
                setOtp(newOtp);
                // Focus last filled input or last input
                const lastIndex = Math.min(digits.length, 3);
                inputRefs[lastIndex].current?.focus();
            });
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text');
        const digits = pastedData.replace(/\D/g, '').slice(0, 4).split('');
        const newOtp = [...otp];
        digits.forEach((digit, i) => {
            if (i < 4) newOtp[i] = digit;
        });
        setOtp(newOtp);
        // Focus last filled input or last input
        const lastIndex = Math.min(digits.length, 3);
        inputRefs[lastIndex].current?.focus();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const otpString = otp.join('');

        if (otpString.length !== 4) {
            toast.error('Please enter all 4 digits');
            return;
        }

        setLoading(true);

        try {
            const res = await axios.post(API.VERIFY_REGISTRATION_OTP, {
                email,
                otp: otpString
            });

            toast.success('✅ ' + res.data.message);
            if (onVerified) {
                onVerified();
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Verification failed';
            toast.error('❌ ' + errorMessage);

            // Clear OTP on error
            setOtp(['', '', '', '']);
            inputRefs[0].current?.focus();
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResending(true);

        try {
            const res = await axios.post(API.RESEND_REGISTRATION_OTP, { email });
            toast.success('✅ ' + res.data.message);
            setTimer(600); // Reset timer
            setOtp(['', '', '', '']);
            inputRefs[0].current?.focus();
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to resend code';
            toast.error('❌ ' + errorMessage);
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="w-full max-w-[380px] sm:max-w-[420px] mx-auto px-3 sm:px-0">
            {/* Header with Bot Icon */}
            {/* <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
            >
                <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="relative">
                        <Bot className="w-12 h-12 text-[rgb(var(--accent))] drop-shadow-lg" />
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-[rgb(var(--accent))] rounded-full animate-pulse"></div>
                    </div>
                    <h1 className="text-3xl font-bold text-[rgb(var(--text-primary))]">
                        Interview<span className="bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 bg-clip-text text-transparent">AI</span>
                    </h1>
                </div>
            </motion.div> */}

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[rgb(var(--bg-elevated))] shadow-lg rounded-xl p-5 sm:p-6 border border-[rgb(var(--border))]"
            >

                {/* Back Button */}
                <button
                    onClick={onBack}
                    className="flex items-center gap-1.5 text-[rgb(var(--text-muted))] hover:text-[rgb(var(--accent))] transition mb-4"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-xs">Back to Sign Up</span>
                </button>

                {/* Header */}
                <div className="text-center mb-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[rgb(var(--accent))] mb-3 shadow-lg">
                        <Mail className="text-white w-6 h-6 sm:w-7 sm:h-7" />
                    </div>
                    <h2 className="text-base sm:text-lg font-bold text-[rgb(var(--text-primary))] mb-1.5 flex items-center justify-center gap-1.5">
                        Verify Your Email <Sparkles className="w-4 h-4 text-yellow-500" />
                    </h2>
                    <p className="text-xs text-[rgb(var(--text-muted))]">
                        We've sent a 4-digit code to
                    </p>
                    <p className="text-xs font-semibold text-[rgb(var(--accent))] mt-1 px-2 break-words">
                        {email}
                    </p>
                </div>

                {/* OTP Form */}
                <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
                    {/* OTP Input */}
                    <div className="flex justify-center gap-2">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={inputRefs[index]}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                onPaste={handlePaste}
                                className="w-11 h-11 sm:w-12 sm:h-12 text-center text-lg sm:text-xl font-bold bg-[rgb(var(--bg-body-alt))] border-2 border-[rgb(var(--border))] rounded-lg text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))] focus:border-transparent transition"
                                disabled={loading}
                            />
                        ))}
                    </div>

                    {/* Timer */}
                    <div className="text-center">
                        {timer > 0 ? (
                            <p className="text-xs text-[rgb(var(--text-muted))]">
                                Code expires in{' '}
                                <span className="font-semibold text-[rgb(var(--accent))]">
                                    {formatTime(timer)}
                                </span>
                            </p>
                        ) : (
                            <p className="text-xs text-red-500 font-semibold">
                                ⚠️ Code expired. Please request a new one.
                            </p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <motion.button
                        type="submit"
                        whileTap={{ scale: 0.97 }}
                        disabled={loading || otp.join('').length !== 4}
                        className={`w-full py-2.5 rounded-lg text-sm transition font-semibold tracking-wide shadow-md ${loading || otp.join('').length !== 4
                            ? 'bg-[rgb(var(--text-muted))]/50 text-[rgb(var(--text-secondary))] cursor-not-allowed'
                            : 'bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent-hover))] hover:shadow-lg text-white'
                            }`}
                    >
                        {loading ? 'Verifying...' : 'Verify Email'}
                    </motion.button>
                </form>

                {/* Resend Code */}
                <div className="mt-4 text-center">
                    <p className="text-xs text-[rgb(var(--text-muted))] mb-1.5">
                        Didn't receive the code?
                    </p>
                    <button
                        onClick={handleResend}
                        disabled={resending || timer > 540} // Allow resend after 1 minute
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold transition ${resending || timer > 540
                            ? 'text-[rgb(var(--text-muted))] cursor-not-allowed'
                            : 'text-[rgb(var(--accent))] hover:text-[rgb(var(--accent-hover))]'
                            }`}
                    >
                        <RefreshCw className={`w-3 h-3 ${resending ? 'animate-spin' : ''}`} />
                        {resending ? 'Sending...' : 'Resend Code'}
                    </button>
                    {timer > 540 && (
                        <p className="text-xs text-[rgb(var(--text-muted))] mt-1">
                            Available in {formatTime(timer - 540)}
                        </p>
                    )}
                </div>

                {/* Help Text */}
                <div className="mt-4 p-2.5 sm:p-3 bg-[rgb(var(--bg-body-alt))] border border-[rgb(var(--border))] rounded-lg">
                    <p className="text-xs text-[rgb(var(--text-muted))] text-center leading-relaxed">
                        💡 <strong>Tip:</strong> Check your spam folder if you don't see the email.
                        The code is valid for 10 minutes.
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default VerifyOTP;

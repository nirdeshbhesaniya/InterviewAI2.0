import React, { useState, useEffect, useRef } from 'react';
import { Mail, ArrowLeft, RefreshCw, Sparkles, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import axios from '../../utils/axiosInstance';
import { API } from '../../utils/apiPaths';
import { Link } from 'react-router-dom';

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
        <div className="min-h-screen bg-[rgb(var(--bg-body))] relative flex items-center justify-center p-4 overflow-hidden">
            {/* Background Orbs */}
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[rgb(var(--accent))]/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-500/15 rounded-full blur-[150px] pointer-events-none hidden md:block" />

            <Link to="/" className="absolute top-6 left-6 md:top-10 md:left-10 text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--accent))] flex items-center gap-2 transition-colors z-20 font-medium">
                <ArrowLeft className="w-5 h-5" />
                Back to Home
            </Link>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md bg-[rgb(var(--bg-card))]/80 backdrop-blur-xl border border-[rgb(var(--border-subtle))] rounded-3xl p-8 sm:p-10 shadow-2xl relative z-10"
            >
                {/* Back Button */}
                <button
                    onClick={onBack}
                    className="flex items-center gap-1.5 text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--accent))] transition mb-6 font-medium"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                </button>

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-[rgb(var(--accent))]/10 mb-4 shadow-inner border border-[rgb(var(--accent))]/20">
                        <CheckCircle2 className="w-8 h-8 text-[rgb(var(--accent))]" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-[rgb(var(--text-primary))] mb-2 flex items-center justify-center gap-2">
                        Verify Email <Sparkles className="w-5 h-5 text-yellow-500" />
                    </h2>
                    <p className="text-sm text-[rgb(var(--text-secondary))] mb-2">
                        We've sent a 4-digit code to
                    </p>
                    <p className="text-sm font-bold text-[rgb(var(--accent))] break-words">
                        {email}
                    </p>
                </div>

                {/* OTP Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* OTP Input */}
                    <div className="flex justify-center gap-3">
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
                                className="w-14 h-16 text-center text-2xl font-bold bg-[rgb(var(--bg-elevated))]/50 border-2 border-[rgb(var(--border-subtle))] rounded-xl text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]/50 focus:border-[rgb(var(--accent))] transition-all shadow-sm"
                                disabled={loading}
                            />
                        ))}
                    </div>

                    {/* Timer */}
                    <div className="text-center">
                        {timer > 0 ? (
                            <p className="text-sm text-[rgb(var(--text-muted))]">
                                Code expires in{' '}
                                <span className="font-semibold text-[rgb(var(--accent))]">
                                    {formatTime(timer)}
                                </span>
                            </p>
                        ) : (
                            <p className="text-sm text-red-500 font-semibold">
                                ⚠️ Code expired. Please request a new one.
                            </p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <motion.button
                        type="submit"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={loading || otp.join('').length !== 4}
                        className={`w-full py-3.5 rounded-xl transition-all font-bold tracking-wide shadow-lg text-base flex justify-center items-center ${loading || otp.join('').length !== 4
                            ? 'bg-[rgb(var(--text-muted))]/30 text-[rgb(var(--text-secondary))] cursor-not-allowed'
                            : 'bg-gradient-to-r from-[rgb(var(--accent))] to-purple-500 hover:shadow-[0_0_20px_rgba(var(--accent),0.4)] text-white'
                            }`}
                    >
                        {loading ? (
                           <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : 'Verify Email'}
                    </motion.button>
                </form>

                {/* Resend Code */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-[rgb(var(--text-secondary))] mb-2">
                        Didn't receive the code?
                    </p>
                    <button
                        onClick={handleResend}
                        disabled={resending || timer > 540} // Allow resend after 1 minute
                        className={`inline-flex items-center gap-1.5 text-sm font-bold transition ${resending || timer > 540
                            ? 'text-[rgb(var(--text-muted))] cursor-not-allowed'
                            : 'text-[rgb(var(--accent))] hover:text-[rgb(var(--accent-hover))]'
                            }`}
                    >
                        <RefreshCw className={`w-4 h-4 ${resending ? 'animate-spin' : ''}`} />
                        {resending ? 'Sending...' : 'Resend Code'}
                    </button>
                    {timer > 540 && (
                        <p className="text-xs text-[rgb(var(--text-muted))] mt-2">
                            Available in {formatTime(timer - 540)}
                        </p>
                    )}
                </div>

                {/* Help Text */}
                <div className="mt-8 p-4 bg-[rgb(var(--bg-elevated))]/30 border border-[rgb(var(--border-subtle))] rounded-xl">
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

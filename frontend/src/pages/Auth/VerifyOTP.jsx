import React, { useState, useEffect, useRef } from 'react';
import { Mail, ArrowLeft, RefreshCw } from 'lucide-react';
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
        <div className="w-full max-w-md mx-auto bg-[rgb(var(--bg-card))] shadow-lg rounded-2xl p-6 border border-[rgb(var(--border))]">
            {/* Back Button */}
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-[rgb(var(--text-muted))] hover:text-[rgb(var(--accent))] transition mb-4"
            >
                <ArrowLeft size={18} />
                <span className="text-sm">Back to Sign Up</span>
            </button>

            {/* Header */}
            <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-[rgb(var(--accent))] to-cyan-500 mb-4">
                    <Mail className="text-white" size={32} />
                </div>
                <h2 className="text-2xl font-bold text-[rgb(var(--text-primary))] mb-2">
                    Verify Your Email ✨
                </h2>
                <p className="text-sm text-[rgb(var(--text-muted))]">
                    We've sent a 4-digit code to
                </p>
                <p className="text-sm font-semibold text-[rgb(var(--accent))] mt-1">
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
                            className="w-14 h-14 text-center text-2xl font-bold bg-[rgb(var(--bg-body-alt))] border-2 border-[rgb(var(--border))] rounded-lg text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))] focus:border-transparent transition"
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
                    whileTap={{ scale: 0.97 }}
                    disabled={loading || otp.join('').length !== 4}
                    className={`w-full py-3 rounded-lg transition font-semibold tracking-wide shadow-md ${loading || otp.join('').length !== 4
                            ? 'bg-[rgb(var(--text-muted))]/50 text-[rgb(var(--text-secondary))] cursor-not-allowed'
                            : 'bg-gradient-to-r from-[rgb(var(--accent))] to-cyan-500 hover:shadow-lg text-white'
                        }`}
                >
                    {loading ? 'Verifying...' : 'Verify Email'}
                </motion.button>
            </form>

            {/* Resend Code */}
            <div className="mt-6 text-center">
                <p className="text-sm text-[rgb(var(--text-muted))] mb-2">
                    Didn't receive the code?
                </p>
                <button
                    onClick={handleResend}
                    disabled={resending || timer > 540} // Allow resend after 1 minute
                    className={`inline-flex items-center gap-2 text-sm font-semibold transition ${resending || timer > 540
                            ? 'text-[rgb(var(--text-muted))] cursor-not-allowed'
                            : 'text-[rgb(var(--accent))] hover:text-[rgb(var(--accent-hover))]'
                        }`}
                >
                    <RefreshCw size={14} className={resending ? 'animate-spin' : ''} />
                    {resending ? 'Sending...' : 'Resend Code'}
                </button>
                {timer > 540 && (
                    <p className="text-xs text-[rgb(var(--text-muted))] mt-1">
                        Available in {formatTime(timer - 540)}
                    </p>
                )}
            </div>

            {/* Help Text */}
            <div className="mt-6 p-4 bg-[rgb(var(--bg-body-alt))] border border-[rgb(var(--border))] rounded-lg">
                <p className="text-xs text-[rgb(var(--text-muted))] text-center">
                    💡 <strong>Tip:</strong> Check your spam folder if you don't see the email.
                    The code is valid for 10 minutes.
                </p>
            </div>
        </div>
    );
};

export default VerifyOTP;

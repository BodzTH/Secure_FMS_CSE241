"use client";

import { useState, useRef, useEffect } from 'react';
import { Mail, RefreshCw } from 'lucide-react';

export default function OTPInput({ email, onVerify, onResend, error, loading }) {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [resendCooldown, setResendCooldown] = useState(0);
    const inputRefs = useRef([]);

    // Handle cooldown timer
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    // Focus first input on mount
    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    const handleChange = (index, value) => {
        // Only allow digits
        if (value && !/^\d$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit when all 6 digits are entered
        if (newOtp.every(digit => digit !== '') && index === 5) {
            onVerify(newOtp.join(''));
        }
    };

    const handleKeyDown = (index, e) => {
        // Handle backspace
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        
        if (!/^\d+$/.test(pastedData)) return;

        const newOtp = pastedData.split('');
        while (newOtp.length < 6) newOtp.push('');
        
        setOtp(newOtp);

        // Focus last filled input or submit if complete
        const lastIndex = Math.min(pastedData.length - 1, 5);
        inputRefs.current[lastIndex]?.focus();

        if (pastedData.length === 6) {
            onVerify(pastedData);
        }
    };

    const handleResend = async () => {
        setResendCooldown(60); // 60 second cooldown
        await onResend();
    };

    return (
        <div className="w-full max-w-md">
            <div className="text-center mb-8">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <Mail className="text-blue-600" size={32} />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Check your email</h2>
                <p className="text-slate-300">
                    We sent a 6-digit code to<br />
                    <span className="font-medium text-white">{email}</span>
                </p>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-lg mb-6 backdrop-blur-sm text-sm text-center">
                    {error}
                </div>
            )}

            <div className="flex justify-center gap-3 mb-6" onPaste={handlePaste}>
                {otp.map((digit, index) => (
                    <input
                        key={index}
                        ref={(el) => (inputRefs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className="w-12 h-14 text-center text-2xl font-bold border-2 border-slate-600 bg-slate-800/50 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        disabled={loading}
                    />
                ))}
            </div>

            <button
                onClick={handleResend}
                disabled={resendCooldown > 0 || loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-slate-600 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <RefreshCw size={16} className={resendCooldown > 0 ? 'animate-spin' : ''} />
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
            </button>

            <p className="text-center text-slate-400 text-sm mt-6">
                Didn't receive the code? Check your spam folder.
            </p>
        </div>
    );
}

"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Mail } from 'lucide-react';
import Link from 'next/link';
import OTPInput from '@/components/OTPInput';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [otpStep, setOtpStep] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [otpError, setOtpError] = useState('');
  
  const { requestOTP, verifyOTP, resendOTP, isLoading, error, clearError } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await requestOTP(email);
      if (result.otpRequired) {
        setUserEmail(result.email);
        setOtpStep(true);
        setOtpError('');
      }
    } catch (err) {
      // Error handled by context
    }
  };

  const handleVerifyOTP = async (otp) => {
    setOtpError('');
    try {
      await verifyOTP(userEmail, otp);
    } catch (err) {
      setOtpError(err);
    }
  };

  const handleResendOTP = async () => {
    setOtpError('');
    try {
      await resendOTP(userEmail);
    } catch (err) {
      setOtpError(err);
    }
  };

  const handleBackToEmail = () => {
    setOtpStep(false);
    setUserEmail('');
    setOtpError('');
    clearError();
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-900 overflow-hidden">
      {/* Background */}
      <div 
        className="absolute inset-0 z-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `url('/dashboard_bg_abstract.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>

      <div className="relative z-10 w-full max-w-md p-8 m-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl">
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20 backdrop-blur-sm border border-white/30 p-3">
            <img src="/secure_fms_logo.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            {otpStep ? 'Enter Code' : 'Welcome Back'}
          </h1>
          <p className="text-slate-300 mt-2">
            {otpStep ? 'Check your email for the verification code' : 'Sign in with your email'}
          </p>
        </div>

        {/* OTP Step */}
        {otpStep ? (
          <>
            <OTPInput 
              email={userEmail}
              onVerify={handleVerifyOTP}
              onResend={handleResendOTP}
              error={otpError}
              loading={isLoading}
            />
            <button
              onClick={handleBackToEmail}
              className="w-full mt-4 py-3 px-4 text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              ← Use different email
            </button>
          </>
        ) : (
          /* Email Form */
          <>
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-lg mb-6 backdrop-blur-sm text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-400 transition-colors">
                    <Mail size={20} />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-slate-600 rounded-xl bg-slate-800/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 disabled:bg-blue-800 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                {isLoading ? 'Sending Code...' : 'Continue with Email'}
              </button>
            </form>


          </>
        )}
      </div>
    </div>
  );
}

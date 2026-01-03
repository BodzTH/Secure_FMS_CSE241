"use client";

import { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const user = await authService.getMe();
          setUser(user);
        } catch (error) {
          console.error("Auth check failed", error);
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  // Step 1: Request OTP (email only)
  const requestOTP = async (email) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await authService.login(email);
      setIsLoading(false);
      return { otpRequired: true, email: data.email };
    } catch (err) {
      setIsLoading(false);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to send code';
      setError(errorMessage);
      throw errorMessage;
    }
  };

  // Step 2: Verify OTP and complete login
  const verifyOTP = async (email, otp) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await authService.verifyOTP(email, otp);
      setIsLoading(false);
      localStorage.setItem('token', data.token);
      setUser(data.user);
      router.push('/dashboard');
      return { success: true };
    } catch (err) {
      setIsLoading(false);
      const errorMessage = err.response?.data?.message || err.message || 'Verification failed';
      setError(errorMessage);
      throw errorMessage;
    }
  };

  // Resend OTP
  const resendOTP = async (email) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await authService.resendOTP(email);
      setIsLoading(false);
      return { success: true, message: data.message };
    } catch (err) {
      setIsLoading(false);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to resend';
      setError(errorMessage);
      throw errorMessage;
    }
  };

  const clearError = () => setError(null);

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      requestOTP,
      verifyOTP,
      resendOTP,
      logout, 
      loading,
      isLoading,
      error,
      clearError
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

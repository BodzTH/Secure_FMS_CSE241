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

  // Login with credentials (direct auth)
  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await authService.login(email, password);
      setIsLoading(false);
      
      localStorage.setItem('token', data.token);
      if (data.user) {
        setUser(data.user);
      }
      router.push('/dashboard');
      return { success: true };
    } catch (err) {
      setIsLoading(false);
      const errorMessage = err.response?.data?.message || err.message || 'Login failed';
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
      login, 
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

"use client";

import { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
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
          // Clear invalid token (including 401 errors)
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkUser();
  }, []);

  const login = async (email, password) => {
    try {
      const data = await authService.login(email, password);
      localStorage.setItem('token', data.token);
      
      // If backend sends user object on login, use it. Otherwise fetch me.
      if (data.user) {
          setUser(data.user);
      } else {
             const user = await authService.getCurrentUser();
             setUser(user);
      }
      
      router.push('/dashboard');
      return { success: true };
    } catch (error) {
        // authService might return full error or just data. 
        // Our service returns response.data directly. 
        // If promise rejects in service (which api interceptor might do), we catch it here.
        // The error handling in API interceptor returns Promise.reject(error).
        throw error.response?.data?.message || 'Login failed';
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

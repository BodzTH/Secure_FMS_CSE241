"use client";

import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
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
            // Depending on backend, we might verify token or just set state if we stored user info
            // For now, let's assume valid token means logged in, or fetch /auth/me if exists
             const { data } = await api.get('/auth/me');
             setUser(data);
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

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      // Assuming login returns user object + token
      // If it only returns token, we might need to fetch user separately
      // Based on backend code: res.json({ token, user: { id, name, role } }) (Need to verify backend response)
      // If backend only returns token, we need to decode or fetch me.
      // Let's check backend auth controller to be sure.
      // For now assume standard structure.
      if (data.user) {
          setUser(data.user);
      } else {
             // Fetch me
             const meRes = await api.get('/auth/me'); // We need to wait for interceptor to pick up token?
             // Actually interceptor reads from localStorage, so we set it above.
             await new Promise(resolve => setTimeout(resolve, 50)); // Small delay might be needed or not
             // But simpler is to rely on next request
             setUser(meRes.data);
      }
      
      router.push('/dashboard');
      return { success: true };
    } catch (error) {
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

"use client";

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (adminOnly && user.role?.role_name !== 'superadmin' && user.role !== 'superadmin' && user.role?.role_name !== 'admin' && user.role !== 'admin') {
         router.push('/dashboard');
      }
    }
  }, [user, loading, router, adminOnly, pathname]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!user) {
    return null;
  }
  
  if (adminOnly && user.role?.role_name !== 'superadmin' && user.role !== 'superadmin' && user.role?.role_name !== 'admin' && user.role !== 'admin') {
      return null;
  }

  return children;
}

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
      } else if (adminOnly && user.role !== 'Superadmin' && user.role !== 'Admin') {
         // Adjust role check based on backend response
         // Backend Role.js might have 'role_name' or similar, user obect from 'getMe' usually has 'role' field
         // Assuming user.role is the role name (e.g. 'Superadmin')
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
  
  if (adminOnly && user.role !== 'Superadmin' && user.role !== 'Admin') {
      return null;
  }

  return children;
}

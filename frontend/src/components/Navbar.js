"use client";

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { LogOut, Home, Users, FileText } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
                <img className="h-10 w-auto filter drop-shadow-md" src="/secure_fms_logo.png" alt="Secure FMS Logo" />
                <span className="ml-3 font-bold text-xl tracking-tight text-slate-800">Secure FMS</span>
            </div>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
              <Link
                href="/dashboard"
                className={`${
                  pathname === '/dashboard'
                    ? 'border-blue-500 text-slate-900'
                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                <FileText className="mr-2" size={18} />
                Files
              </Link>
              {(user.role?.role_name === 'superadmin' || user.role === 'superadmin' || user.role?.role_name === 'admin' || user.role === 'admin') && (
                <Link
                  href="/admin"
                  className={`${
                    pathname === '/admin'
                      ? 'border-blue-500 text-slate-900'
                      : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  <Users className="mr-2" size={18} />
                  Users
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center">
            <span className="text-sm text-slate-500 mr-4">
              Welcome, {user.username || user.email || 'User'}
            </span>
            <button
              onClick={logout}
              className="p-2 rounded-full text-slate-400 hover:text-red-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

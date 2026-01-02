"use client";

import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import FileTable from '@/components/FileTable';
import UploadButton from '@/components/UploadButton';

export default function DashboardPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadSuccess = () => {
      setRefreshTrigger(prev => prev + 1);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
             <div className="flex justify-between items-center mb-6">
                 <h1 className="text-2xl font-semibold text-slate-900">File Management</h1>
                 <UploadButton onUploadSuccess={handleUploadSuccess} />
             </div>
             <FileTable refreshTrigger={refreshTrigger} />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

"use client";

import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import FileTable from '@/components/FileTable';
import UploadButton from '@/components/UploadButton';
import Toast from '@/components/Toast';

export default function DashboardPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [toast, setToast] = useState({ message: '', type: 'info', visible: false });

  const showToast = (message, type = 'info') => {
    setToast({ message, type, visible: true });
  };

  const handleCloseToast = () => {
    setToast(prev => ({ ...prev, visible: false }));
  };

  const handleUploadSuccess = () => {
      setRefreshTrigger(prev => prev + 1);
      showToast('File uploaded successfully', 'success');
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50 relative">
        {/* Background Overlay */}
        <div 
            className="absolute inset-0 z-0 opacity-5 pointer-events-none"
            style={{
                backgroundImage: `url('/dashboard_bg_abstract.png')`, // Assuming saved to public folder, need to move artifact there
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            }}
        />

        <div className="relative z-10">
            <Navbar />
            
            <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">File Management</h1>
                        <p className="mt-1 text-sm text-slate-500">Securely manage and share your documents.</p>
                    </div>
                    <UploadButton onUploadSuccess={handleUploadSuccess} onError={(msg) => showToast(msg, 'error')} />
                </div>
                
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <FileTable refreshTrigger={refreshTrigger} showToast={showToast} />
                </div>
            </div>
            </main>
        </div>

        {toast.visible && (
            <Toast 
                message={toast.message} 
                type={toast.type} 
                onClose={handleCloseToast} 
            />
        )}
      </div>
    </ProtectedRoute>
  );
}

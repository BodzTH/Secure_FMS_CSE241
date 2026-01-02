"use client";

import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import UserTable from '@/components/UserTable';
import UserForm from '@/components/UserForm';
import { Plus } from 'lucide-react';

export default function AdminPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCreate = () => {
      setEditingUser(null);
      setIsFormOpen(true);
  };

  const handleEdit = (user) => {
      setEditingUser(user);
      setIsFormOpen(true);
  };

  const handleSuccess = () => {
      setRefreshTrigger(prev => prev + 1);
  };

  return (
    <ProtectedRoute adminOnly={true}>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
             <div className="flex justify-between items-center mb-6">
                 <h1 className="text-2xl font-semibold text-slate-900">User Management</h1>
                 <button
                    onClick={handleCreate}
                    className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors shadow-sm"
                 >
                    <Plus size={18} />
                    <span>Create User</span>
                 </button>
             </div>
             
             <UserTable refreshTrigger={refreshTrigger} onEdit={handleEdit} />

             <UserForm 
                isOpen={isFormOpen} 
                onClose={() => setIsFormOpen(false)} 
                userToEdit={editingUser}
                onSuccess={handleSuccess}
             />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

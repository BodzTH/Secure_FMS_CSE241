"use client";

import { useState, useEffect } from 'react';
import adminService from '@/services/adminService';
import { useAuth } from '@/context/AuthContext';
import { X, Eye, EyeOff } from 'lucide-react';

export default function UserForm({ isOpen, onClose, userToEdit, onSuccess }) {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role_name: 'user'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showPassword, setShowPassword] = useState(false); // New state for password visibility

    useEffect(() => {
        if (userToEdit) {
            setFormData({
                username: userToEdit.username || '',
                email: userToEdit.email || '',
                password: '', // Don't populate password
                role_name: userToEdit.role?.role_name || userToEdit.role || 'user'
            });
        } else {
            setFormData({
                username: '',
                email: '',
                password: '',
                role_name: 'user'
            });
        }
        setError(null);
        setShowPassword(false); // Reset password visibility on form open/edit
    }, [userToEdit, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError("Invalid email format");
            setLoading(false);
            return;
        }

        if (!userToEdit || formData.password) {
            // Password validation (Create: required, Edit: only if provided)
            const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
            if (!passwordRegex.test(formData.password)) {
                setError("Password must be at least 8 chars, with 1 number & 1 special char (!@#$%^&*)");
                setLoading(false);
                return;
            }
        }

        try {
            if (userToEdit) {
                // Update
                const updateData = { ...formData };
                if (!updateData.password) delete updateData.password; // Don't send empty password if not changing
                
                await adminService.updateUser(userToEdit._id, updateData);
            } else {
                // Create
                await adminService.createUser(formData);
            }
            onSuccess();
            onClose();
        } catch (err) {
            console.error("User save failed", err);
            setError(err.response?.data?.message || "Failed to save user");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
                 <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                >
                    <X size={24} />
                </button>
                <h2 className="text-xl font-bold mb-4 text-slate-800">
                    {userToEdit ? 'Edit User' : 'Create New User'}
                </h2>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Username</label>
                        <input
                            type="text"
                            required
                            value={formData.username}
                            onChange={(e) => setFormData({...formData, username: e.target.value})}
                            className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-slate-900"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Email</label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-slate-900"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">
                            Password {userToEdit && <span className="text-slate-400 font-normal">(Leave blank to keep current)</span>}
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                required={!userToEdit}
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 pr-10 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-slate-900"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Role</label>
                        <select
                            value={formData.role_name}
                            onChange={(e) => setFormData({...formData, role_name: e.target.value})}
                            className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-slate-900"
                        >
                            <option value="user">User</option>
                            
                            {/* Only show Admin/Superadmin options if current user is Superadmin */}
                            {user?.role?.role_name === 'superadmin' && (
                                <>
                                    <option value="admin">Admin</option>
                                    <option value="superadmin">Superadmin</option>
                                </>
                            )}
                        </select>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 mr-2"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                        >
                            {loading ? 'Saving...' : 'Save User'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

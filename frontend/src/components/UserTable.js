"use client";

import { useEffect, useState } from 'react';
import api from '@/services/api';
import { Pencil, Trash2, User } from 'lucide-react';

export default function UserTable({ refreshTrigger, onEdit }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/admin/users');
            setUsers(data);
            setError(null);
        } catch (err) {
            console.error("Fetch users failed", err);
            setError("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [refreshTrigger]);

    const handleDelete = async (userId) => {
        if (!confirm('Are you sure you want to delete this user?')) return;
        try {
            await api.delete(`/admin/delete-user/${userId}`);
            setUsers(users.filter(u => u._id !== userId));
        } catch (err) {
            console.error("Delete user failed", err);
            alert("Failed to delete user");
        }
    };

    if (loading && users.length === 0) return <div>Loading users...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
            <table className="min-w-full leading-normal">
                <thead>
                    <tr>
                        <th className="px-5 py-3 border-b-2 border-slate-200 bg-slate-100 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                            User
                        </th>
                        <th className="px-5 py-3 border-b-2 border-slate-200 bg-slate-100 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                            Email
                        </th>
                        <th className="px-5 py-3 border-b-2 border-slate-200 bg-slate-100 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                            Role
                        </th>
                         <th className="px-5 py-3 border-b-2 border-slate-200 bg-slate-100 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user._id}>
                            <td className="px-5 py-5 border-b border-slate-200 bg-white text-sm">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                                        <User size={20} className="text-slate-500" />
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-slate-900 whitespace-no-wrap font-medium">
                                            {user.username}
                                        </p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-5 py-5 border-b border-slate-200 bg-white text-sm">
                                <p className="text-slate-900 whitespace-no-wrap">{user.email}</p>
                            </td>
                            <td className="px-5 py-5 border-b border-slate-200 bg-white text-sm">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'Superadmin' || user.role === 'Admin' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}`}>
                                    {user.role}
                                </span>
                            </td>
                            <td className="px-5 py-5 border-b border-slate-200 bg-white text-sm">
                                <div className="flex space-x-2">
                                    <button 
                                        onClick={() => onEdit(user)}
                                        className="text-blue-600 hover:text-blue-900"
                                        title="Edit">
                                        <Pencil size={18} />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(user._id)}
                                        className="text-red-600 hover:text-red-900"
                                        title="Delete">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

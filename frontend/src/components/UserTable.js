import { useEffect, useState } from 'react';
import adminService from '@/services/adminService';
import { Pencil, Trash2, User } from 'lucide-react';
import ConfirmationModal from './ConfirmationModal';

export default function UserTable({ refreshTrigger, onEdit, showToast }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userToDelete, setUserToDelete] = useState(null);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await adminService.getUsers();
            setUsers(data);
        } catch (err) {
            console.error("Fetch users failed", err);
            // setError("Failed to load users");
             if(showToast) showToast('Failed to load users', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [refreshTrigger]);

    const confirmDelete = async () => {
        if (!userToDelete) return;
        try {
            await adminService.deleteUser(userToDelete);
            setUsers(users.filter(u => u._id !== userToDelete));
            if(showToast) showToast('User deleted successfully', 'success');
        } catch (err) {
            console.error("Delete user failed", err);
            if(showToast) showToast("Failed to delete user", 'error');
        } finally {
            setUserToDelete(null);
        }
    };

    if (loading && users.length === 0) return <div>Loading users...</div>;

    return (
        <div className="overflow-x-auto bg-white shadow-sm rounded-xl border border-slate-200">
            <table className="min-w-full leading-normal">
                <thead>
                    <tr>
                        <th className="px-5 py-4 border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            User
                        </th>
                        <th className="px-5 py-4 border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Email
                        </th>
                        <th className="px-5 py-4 border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Role
                        </th>
                         <th className="px-5 py-4 border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white">
                    {users.map((user) => (
                        <tr key={user._id} className="hover:bg-slate-50/80 transition-colors duration-150">
                            <td className="px-5 py-4 border-b border-slate-100 text-sm">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-500">
                                        <User size={20} />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-slate-900 font-semibold">
                                            {user.username}
                                        </p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-5 py-4 border-b border-slate-100 text-sm">
                                <p className="text-slate-600">{user.email}</p>
                            </td>
                            <td className="px-5 py-4 border-b border-slate-100 text-sm">
                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${
                                    user.role?.role_name === 'superadmin' || user.role === 'superadmin' 
                                        ? 'bg-purple-50 text-purple-700 border-purple-200' 
                                        : user.role?.role_name === 'admin' || user.role === 'admin' 
                                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                                            : 'bg-slate-100 text-slate-700 border-slate-200'
                                }`}>
                                    {(user.role?.role_name || user.role || 'user').toUpperCase()}
                                </span>
                            </td>
                            <td className="px-5 py-4 border-b border-slate-100 text-sm">
                                <div className="flex space-x-3">
                                    <button 
                                        onClick={() => onEdit(user)}
                                        className="text-slate-400 hover:text-blue-600 transition-colors bg-slate-50 p-2 rounded-md hover:bg-blue-50"
                                        title="Edit">
                                        <Pencil size={18} />
                                    </button>
                                    <button 
                                        onClick={() => setUserToDelete(user._id)}
                                        className="text-slate-400 hover:text-red-600 transition-colors bg-slate-50 p-2 rounded-md hover:bg-red-50"
                                        title="Delete">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <ConfirmationModal
                isOpen={!!userToDelete}
                onClose={() => setUserToDelete(null)}
                onConfirm={confirmDelete}
                title="Delete User"
                message="Are you sure you want to delete this user? This action cannot be undone."
                isDangerous={true}
            />
        </div>
    );
}

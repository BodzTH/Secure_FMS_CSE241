"use client";

import { useState, useEffect } from 'react';
import api from '@/services/api';
import { Download, Trash2, FileText } from 'lucide-react';

export default function FileTable({ refreshTrigger }) {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchFiles = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/files');
            setFiles(data);
            setError(null);
        } catch (err) {
            setError('Failed to load files');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFiles();
    }, [refreshTrigger]);

    const handleDownload = async (fileId, fileName) => {
        try {
            const response = await api.get(`/files/download/${fileId}`, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error("Download failed", err);
            alert("Download failed");
        }
    };

    const handleDelete = async (fileId) => {
        if (!confirm('Are you sure you want to delete this file?')) return;
        try {
            await api.delete(`/files/${fileId}`);
            setFiles(files.filter(f => f._id !== fileId));
        } catch (err) {
            console.error("Delete failed", err);
            alert("Delete failed");
        }
    };

    if (loading && files.length === 0) return <div className="text-center p-4">Loading files...</div>;
    if (error) return <div className="text-center text-red-500 p-4">{error}</div>;

    return (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
            <table className="min-w-full leading-normal">
                <thead>
                    <tr>
                        <th className="px-5 py-3 border-b-2 border-slate-200 bg-slate-100 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                            File Name
                        </th>
                        <th className="px-5 py-3 border-b-2 border-slate-200 bg-slate-100 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                            Uploaded By
                        </th>
                        <th className="px-5 py-3 border-b-2 border-slate-200 bg-slate-100 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                            Date
                        </th>
                        <th className="px-5 py-3 border-b-2 border-slate-200 bg-slate-100 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {files.map((file) => (
                        <tr key={file._id}>
                            <td className="px-5 py-5 border-b border-slate-200 bg-white text-sm">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                                         <FileText size={20} className="text-slate-500" />
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-slate-900 whitespace-no-wrap font-medium">
                                            {file.filename}
                                        </p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-5 py-5 border-b border-slate-200 bg-white text-sm">
                                <p className="text-slate-900 whitespace-no-wrap">
                                    {file.uploadedBy?.item_id || 'Unknown'} {/* Adjust based on populate */}
                                    {/* Backend controller populates 'uploadedBy', usually 'name' or 'email' */}
                                    {/* Need to check backend controller populates what fields exactly */}
                                    {/* Assuming file.uploadedBy is object if populated, or ID string */}
                                     {file.uploadedBy?.username || file.uploadedBy?.email || file.uploadedBy || 'User'} 
                                </p>
                            </td>
                            <td className="px-5 py-5 border-b border-slate-200 bg-white text-sm">
                                <p className="text-slate-900 whitespace-no-wrap">
                                    {new Date(file.uploadDate).toLocaleDateString()}
                                </p>
                            </td>
                            <td className="px-5 py-5 border-b border-slate-200 bg-white text-sm">
                                <div className="flex space-x-2">
                                    <button 
                                        onClick={() => handleDownload(file._id, file.filename)}
                                        className="text-blue-600 hover:text-blue-900" 
                                        title="Download">
                                        <Download size={18} />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(file._id)}
                                        className="text-red-600 hover:text-red-900" 
                                        title="Delete">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {files.length === 0 && (
                        <tr>
                            <td colSpan="4" className="px-5 py-5 border-b border-slate-200 bg-white text-sm text-center text-slate-500">
                                No files found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

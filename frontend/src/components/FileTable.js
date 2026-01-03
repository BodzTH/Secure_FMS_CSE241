import { useState, useEffect } from 'react';
import fileService from '@/services/fileService';
import { Download, Trash2, FileText } from 'lucide-react';
import ConfirmationModal from './ConfirmationModal';
import { useAuth } from '@/context/AuthContext';

export default function FileTable({ refreshTrigger, showToast }) {
    const { user } = useAuth();
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fileToDelete, setFileToDelete] = useState(null);

    const fetchFiles = async () => {
        setLoading(true);
        try {
            const data = await fileService.getFiles();
            setFiles(data);
        } catch (err) {
            console.error("Fetch files failed", err);
            if(showToast) showToast('Failed to load files', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Only fetch files if user is authenticated
        if (user) {
            fetchFiles();
        } else {
            setLoading(false);
        }
    }, [refreshTrigger, user]);

    const handleDownload = async (fileId, fileName) => {
        try {
            const response = await fileService.downloadFile(fileId);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            if(showToast) showToast('File downloaded successfully', 'success');
        } catch (err) {
            console.error("Download failed", err);
            if(showToast) showToast("Download failed", 'error');
        }
    };

    const confirmDelete = async () => {
        if (!fileToDelete) return;
        try {
            await fileService.deleteFile(fileToDelete);
            setFiles(files.filter(f => f._id !== fileToDelete));
            if(showToast) showToast('File deleted successfully', 'success');
        } catch (err) {
            console.error("Delete failed", err);
            if(showToast) showToast("Delete failed", 'error');
        } finally {
            setFileToDelete(null);
        }
    };

    if (loading && files.length === 0) return <div className="text-center p-4">Loading files...</div>;

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full leading-normal">
                <thead>
                    <tr>
                        <th className="px-5 py-4 border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            File Name
                        </th>
                        <th className="px-5 py-4 border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Uploaded By
                        </th>
                        <th className="px-5 py-4 border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Date
                        </th>
                        <th className="px-5 py-4 border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white">
                    {files.map((file) => (
                        <tr key={file._id} className="hover:bg-slate-50/80 transition-colors duration-150">
                            <td className="px-5 py-4 border-b border-slate-100 text-sm">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-500">
                                         <FileText size={20} />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-slate-900 font-medium cursor-pointer hover:text-blue-600 transition-colors" title={file.filename}>
                                            {file.filename}
                                        </p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-5 py-4 border-b border-slate-100 text-sm">
                                <div className="flex items-center">
                                    <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 mr-2">
                                        {file.uploadedBy?.username?.[0]?.toUpperCase() || '?'}
                                    </div>
                                    <p className="text-slate-600 font-medium">
                                        {file.uploadedBy?.username}
                                    </p>
                                </div>
                            </td>
                            <td className="px-5 py-4 border-b border-slate-100 text-sm">
                                <p className="text-slate-500">
                                    {new Date(file.uploadDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                </p>
                            </td>
                            <td className="px-5 py-4 border-b border-slate-100 text-sm">
                                <div className="flex space-x-3">
                                    <button 
                                        onClick={() => handleDownload(file._id, file.filename)}
                                        className="text-slate-400 hover:text-blue-600 transition-colors bg-slate-50 p-2 rounded-md hover:bg-blue-50" 
                                        title="Download">
                                        <Download size={18} />
                                    </button>
                                    <button 
                                        onClick={() => setFileToDelete(file._id)}
                                        className="text-slate-400 hover:text-red-600 transition-colors bg-slate-50 p-2 rounded-md hover:bg-red-50" 
                                        title="Delete">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {files.length === 0 && (
                        <tr>
                            <td colSpan="4" className="px-5 py-12 border-b border-slate-200 bg-white text-sm text-center">
                                <div className="flex flex-col items-center justify-center text-slate-400">
                                    <FileText size={48} className="mb-4 opacity-20" />
                                    <p>No files uploaded yet.</p>
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            <ConfirmationModal
                isOpen={!!fileToDelete}
                onClose={() => setFileToDelete(null)}
                onConfirm={confirmDelete}
                title="Delete File"
                message="Are you sure you want to delete this file? This action cannot be undone."
                isDangerous={true}
            />
        </div>
    );
}

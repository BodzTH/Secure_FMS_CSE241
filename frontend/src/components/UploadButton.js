"use client";

import { useState } from 'react';
import fileService from '@/services/fileService';
import { Upload, X } from 'lucide-react';

export default function UploadButton({ onUploadSuccess, onError }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null); // Keep local error for modal display too if desired, or remove.

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setError(null);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) {
            setError("Please select a file");
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        setError(null);

        try {
            await fileService.uploadFile(formData);
            setIsModalOpen(false);
            setFile(null);
            if (onUploadSuccess) onUploadSuccess();
        } catch (err) {
            console.error("Upload failed", err);
            const msg = err.response?.data?.message || "Upload failed";
            setError(msg);
            if (onError) onError(msg);
        } finally {
            setUploading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors shadow-sm"
            >
                <Upload size={18} />
                <span>Upload File</span>
            </button>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                        >
                            <X size={24} />
                        </button>
                        
                        <h2 className="text-xl font-bold mb-4 text-slate-800">Upload New File</h2>
                        
                        <form onSubmit={handleUpload}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Select File
                                </label>
                                <div className="flex items-center justify-center w-full">
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <Upload className="w-8 h-8 mb-4 text-slate-500" />
                                            <p className="mb-2 text-sm text-slate-500">
                                                <span className="font-semibold">Click to upload</span> or drag and drop
                                            </p>
                                        </div>
                                        <input 
                                            type="file" 
                                            className="hidden" 
                                            onChange={handleFileChange} 
                                        />
                                    </label>
                                </div>
                                {file && (
                                    <p className="mt-2 text-sm text-green-600 truncate">
                                        Selected: {file.name}
                                    </p>
                                )}
                            </div>

                            {error && (
                                <div className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded">
                                    {error}
                                </div>
                            )}

                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                                >
                                    {uploading ? 'Uploading...' : 'Upload'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

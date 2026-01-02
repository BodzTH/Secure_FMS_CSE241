"use client";

import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmationModal({ isOpen, onClose, onConfirm, title, message, isDangerous = false }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm transition-all duration-300">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 transform scale-100 transition-all duration-300 border border-slate-100">
                <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-full ${isDangerous ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                        <AlertTriangle size={24} />
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-slate-500 mb-6 leading-relaxed">
                    {message}
                </p>

                <div className="flex space-x-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 bg-slate-50 text-slate-700 font-medium rounded-xl hover:bg-slate-100 transition-colors border border-slate-200"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => { onConfirm(); onClose(); }}
                        className={`flex-1 px-4 py-2.5 font-bold text-white rounded-xl shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] ${
                            isDangerous 
                            ? 'bg-red-600 hover:bg-red-500 shadow-red-500/30' 
                            : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/30'
                        }`}
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
}

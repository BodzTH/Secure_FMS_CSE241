"use client";

import { useEffect } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

export default function Toast({ message, type = 'info', onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!message) return null;

  const bgColors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200'
  };

  const textColors = {
    success: 'text-green-800',
    error: 'text-red-800',
    info: 'text-blue-800'
  };

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    info: <AlertCircle className="w-5 h-5 text-blue-500" />
  };

  return (
    <div className={`fixed bottom-4 right-4 max-w-sm w-full shadow-lg rounded-lg border px-4 py-3 flex items-start space-x-3 z-50 transform transition-all duration-300 ease-in-out hover:scale-105 ${bgColors[type]}`}>
      <div className="flex-shrink-0 mt-0.5">
        {icons[type]}
      </div>
      <div className={`flex-1 ${textColors[type]}`}>
        <p className="text-sm font-medium">{message}</p>
      </div>
      <button 
        onClick={onClose} 
        className={`flex-shrink-0 ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${textColors[type]}`}
      >
        <span className="sr-only">Dismiss</span>
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

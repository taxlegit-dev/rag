'use client';
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type: ToastType, duration?: number) => void;
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

const ToastIcon = ({ type }: { type: ToastType }) => {
  const icons = {
    success: (
      <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      </div>
    ),
    error: (
      <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
    ),
    info: (
      <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
        </svg>
      </div>
    ),
    warning: (
      <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
          <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
        </svg>
      </div>
    ),
  };
  return icons[type];
};

const ToastItem = ({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);

  const duration = toast.duration || 4000;

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
    }, 16);

    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onRemove(toast.id), 300);
    }, duration);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [toast.id, duration, onRemove]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  const colorClasses = {
    success: 'bg-gradient-to-r from-emerald-500 to-green-500',
    error: 'bg-gradient-to-r from-red-500 to-rose-500',
    info: 'bg-gradient-to-r from-blue-500 to-indigo-500',
    warning: 'bg-gradient-to-r from-amber-500 to-orange-500',
  };

  return (
    <div
      className={`
        relative overflow-hidden
        min-w-[280px] max-w-[400px] 
        rounded-xl shadow-2xl
        backdrop-blur-sm
        ${colorClasses[toast.type]}
        ${isExiting ? 'animate-slide-out' : 'animate-slide-in'}
      `}
    >
      <div className="relative z-10 p-4 pr-12">
        <div className="flex items-start gap-3">
          <ToastIcon type={toast.type} />
          <p className="text-white text-sm font-medium leading-relaxed flex-1">
            {toast.message}
          </p>
        </div>
      </div>
      
      <button
        onClick={handleClose}
        className="absolute top-3 right-3 z-20 text-white/70 hover:text-white transition-colors duration-200 p-1 hover:bg-white/10 rounded-lg"
        aria-label="Close notification"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
        <div
          className="h-full bg-white/30 transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType, duration?: number) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  const showSuccess = useCallback((message: string, duration?: number) => showToast(message, 'success', duration), [showToast]);
  const showError = useCallback((message: string, duration?: number) => showToast(message, 'error', duration), [showToast]);
  const showInfo = useCallback((message: string, duration?: number) => showToast(message, 'info', duration), [showToast]);
  const showWarning = useCallback((message: string, duration?: number) => showToast(message, 'warning', duration), [showToast]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError, showInfo, showWarning }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none">
        <div className="pointer-events-auto flex flex-col gap-3">
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
          ))}
        </div>
      </div>
      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(400px) scale(0.95);
            opacity: 0;
          }
          to {
            transform: translateX(0) scale(1);
            opacity: 1;
          }
        }
        @keyframes slide-out {
          from {
            transform: translateX(0) scale(1);
            opacity: 1;
          }
          to {
            transform: translateX(400px) scale(0.95);
            opacity: 0;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .animate-slide-out {
          animation: slide-out 0.3s cubic-bezier(0.4, 0, 1, 1);
        }
      `}</style>
    </ToastContext.Provider>
  );
};
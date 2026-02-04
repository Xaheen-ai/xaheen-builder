/**
 * Toast Provider
 * Global toast/notification system for the backoffice app
 */

import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { Alert } from '@digdir/designsystemet-react';

type ToastType = 'success' | 'info' | 'warning' | 'danger';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextType {
  addToast: (type: ToastType, title: string, message?: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps): React.ReactElement {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const toast: Toast = message 
      ? { id, type, title, message }
      : { id, type, title };
    
    setToasts((prev) => [...prev, toast]);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  }, [removeToast]);

  const success = useCallback((title: string, message?: string) => {
    addToast('success', title, message);
  }, [addToast]);

  const error = useCallback((title: string, message?: string) => {
    addToast('danger', title, message);
  }, [addToast]);

  const warning = useCallback((title: string, message?: string) => {
    addToast('warning', title, message);
  }, [addToast]);

  const info = useCallback((title: string, message?: string) => {
    addToast('info', title, message);
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ addToast, success, error, warning, info }}>
      {children}
      
      {/* Toast container - fixed at top right */}
      {toasts.length > 0 && (
        <div
          style={{
            position: 'fixed',
            top: 'var(--ds-spacing-4)',
            right: 'var(--ds-spacing-4)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--ds-spacing-2)',
            maxWidth: '400px',
            width: '100%',
          }}
        >
          {toasts.map((toast) => (
            <Alert
              key={toast.id}
              data-color={toast.type}
              style={{
                boxShadow: 'var(--ds-shadow-md)',
                animation: 'slideIn 0.2s ease-out',
              }}
            >
              <strong>{toast.title}</strong>
              {toast.message && <p style={{ margin: 0 }}>{toast.message}</p>}
            </Alert>
          ))}
        </div>
      )}

      {/* Animation keyframes */}
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

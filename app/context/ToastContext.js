'use client';
import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const agregar = useCallback((mensaje, tipo = 'success', duracion = 3000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, mensaje, tipo }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duracion);
  }, []);

  const success = useCallback((msg) => agregar(msg, 'success'), [agregar]);
  const error = useCallback((msg) => agregar(msg, 'error'), [agregar]);
  const warning = useCallback((msg) => agregar(msg, 'warning'), [agregar]);
  const info = useCallback((msg) => agregar(msg, 'info'), [agregar]);

  return (
    <ToastContext.Provider value={{ success, error, warning, info }}>
      {children}
      <ToastContainer toasts={toasts} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts }) {
  if (toasts.length === 0) return null;
  return (
    <div style={{
      position: 'fixed',
      bottom: '2rem',
      right: '2rem',
      zIndex: 999,
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
    }}>
      {toasts.map(t => <Toast key={t.id} toast={t} />)}
    </div>
  );
}

function Toast({ toast }) {
  const colores = {
    success: { bg: '#1a1a1a', border: '#5C3317', icon: '✓' },
    error:   { bg: '#1a1a1a', border: '#c0392b', icon: '✕' },
    warning: { bg: '#1a1a1a', border: '#f39c12', icon: '⚠' },
    info:    { bg: '#1a1a1a', border: '#3498db', icon: 'i' },
  };
  const c = colores[toast.tipo] || colores.success;

  return (
    <div style={{
      background: c.bg,
      borderLeft: `3px solid ${c.border}`,
      color: '#fafaf8',
      padding: '1rem 1.25rem',
      minWidth: '280px',
      maxWidth: '360px',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      animation: 'slideIn 0.3s ease',
      fontFamily: 'var(--font-body)',
      fontSize: '0.9rem',
      lineHeight: 1.4,
    }}>
      <span style={{
        width: '20px', height: '20px',
        borderRadius: '50%',
        border: `1px solid ${c.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.7rem', flexShrink: 0, color: c.border,
      }}>
        {c.icon}
      </span>
      {toast.mensaje}
    </div>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
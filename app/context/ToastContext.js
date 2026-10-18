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
    <div className="toasts" role="status" aria-live="polite">
      {toasts.map(t => <Toast key={t.id} toast={t} />)}
    </div>
  );
}

const ICONOS = { success: '✓', error: '✕', warning: '!', info: 'i' };

function Toast({ toast }) {
  // El texto de éxito ya trae "✓" al inicio: se quita para no repetirlo
  const mensaje = String(toast.mensaje).replace(/^✓\s*/, '');
  return (
    <div className={`toast ${toast.tipo}`}>
      <i aria-hidden="true">{ICONOS[toast.tipo] || ICONOS.success}</i>
      <span>{mensaje}</span>
    </div>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
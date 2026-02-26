'use client';
import { useCarrito } from '../context/CarritoContext';

export default function PerfilBtn() {
  const { setAbierto } = useCarrito();

  return (
    <button className="icon-btn" aria-label="Mi cuenta" onClick={() => setAbierto(true)}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    </button>
  );
}
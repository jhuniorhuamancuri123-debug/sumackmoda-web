export default function CarritoBtn() 
{
  const carrito = useCarrito();
  if (!carrito) return null;
  const { totalItems, setAbierto } = carrito;
  // ... resto igual
}
'use client';
import { useCarrito } from '../context/CarritoContext';

export default function CarritoBtn() {
  const { totalItems, setAbierto } = useCarrito();
  return (
    <button className="icon-btn carrito-btn" aria-label="Carrito" onClick={() => setAbierto(true)}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 0 1-8 0"/>
      </svg>
      {totalItems > 0 && <span className="carrito-count">{totalItems}</span>}
    </button>
  );
}
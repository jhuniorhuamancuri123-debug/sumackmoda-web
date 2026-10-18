'use client';
import { motion } from 'motion/react';
import { useCarrito } from '../context/CarritoContext';

export default function CarritoBtn() {
  const { totalItems, setAbierto } = useCarrito();
  return (
    <button className="icon-btn carrito-btn" aria-label={`Carrito, ${totalItems} ${totalItems === 1 ? 'prenda' : 'prendas'}`} onClick={() => setAbierto(true)}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M5 8h14l-1 12H6L5 8z"/>
        <path d="M9 8V6.5a3 3 0 0 1 6 0V8"/>
      </svg>
      {totalItems > 0 && (
        <motion.span
          key={totalItems}
          className="carrito-count"
          initial={{ scale: 0.4 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 18 }}
        >
          {totalItems}
        </motion.span>
      )}
    </button>
  );
}

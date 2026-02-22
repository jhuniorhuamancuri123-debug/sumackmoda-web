'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const CarritoContext = createContext();

export function CarritoProvider({ children }) {
  const [items, setItems] = useState([]);
  const [abierto, setAbierto] = useState(false);
  const [cargado, setCargado] = useState(false);

  useEffect(() => {
    try {
      const guardado = localStorage.getItem('sumack_carrito');
      if (guardado) setItems(JSON.parse(guardado));
    } catch {}
    setCargado(true);
  }, []);

  useEffect(() => {
    if (!cargado) return;
    try {
      localStorage.setItem('sumack_carrito', JSON.stringify(items));
    } catch {}
  }, [items, cargado]);

  function agregar(producto) {
    const itemId = `${producto.id}-${producto.color}-${producto.talla}`;
    setItems(prev => {
      const existe = prev.find(i => i.itemId === itemId);
      if (existe) {
        if (existe.cantidad >= existe.stockMax) return prev;
        return prev.map(i => i.itemId === itemId ? { ...i, cantidad: i.cantidad + 1 } : i);
      }
      return [...prev, { ...producto, itemId, cantidad: 1 }];
    });
    setAbierto(true);
  }

  function quitar(itemId) {
    setItems(prev => prev.filter(i => i.itemId !== itemId));
  }

  function cambiarCantidad(itemId, cantidad) {
    if (cantidad < 1) { quitar(itemId); return; }
    setItems(prev => prev.map(i => {
      if (i.itemId !== itemId) return i;
      return { ...i, cantidad: Math.min(cantidad, i.stockMax) };
    }));
  }

  function vaciar() {
    setItems([]);
    try { localStorage.removeItem('sumack_carrito'); } catch {}
  }

  const total = items.reduce((sum, i) => sum + i.precio * i.cantidad, 0);
  const totalItems = items.reduce((sum, i) => sum + i.cantidad, 0);
  const totalCentavos = Math.round(total * 100);

  function getResumenCulqi() {
    return {
      amount: totalCentavos,
      currency: 'PEN',
      description: items.map(i => `${i.nombre} T:${i.talla} x${i.cantidad}`).join(', '),
      items: items.map(i => ({
        itemId: i.itemId,
        nombre: i.nombre,
        color: i.color,
        talla: i.talla,
        precio: i.precio,
        cantidad: i.cantidad,
        subtotal: i.precio * i.cantidad,
      }))
    };
  }

  return (
    <CarritoContext.Provider value={{
      items, agregar, quitar, cambiarCantidad, vaciar,
      total, totalItems, totalCentavos, getResumenCulqi,
      abierto, setAbierto, cargado,
    }}>
      {children}
    </CarritoContext.Provider>
  );
}

export function useCarrito() {
  return useContext(CarritoContext);
}
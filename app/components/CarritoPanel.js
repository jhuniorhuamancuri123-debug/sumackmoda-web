'use client';
import { useCarrito } from '../context/CarritoContext';
import { useToast } from '../context/ToastContext';
import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';

export default function CarritoPanel() {
  const { items, quitar, cambiarCantidad, total, totalItems, abierto, setAbierto, cargado, nombreCliente, setNombreCliente } = useCarrito();
  const toast = useToast();
  const inputRef = useRef(null);

  useEffect(() => {
    if (abierto && !nombreCliente) setTimeout(() => inputRef.current?.focus(), 300);
  }, [abierto]);

  if (!cargado) return null;

  function handleQuitar(itemId, nombre) {
    quitar(itemId);
    toast.info(`${nombre} eliminado del carrito`);
  }

  const nombreValido = nombreCliente.trim().length >= 2;

  return (
    <AnimatePresence>
      {abierto && (
        <>
          <motion.div
            key="velo"
            className="carrito-velo"
            onClick={() => setAbierto(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
          <motion.aside
            key="panel"
            className="carrito-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Tu carrito"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* CABECERA */}
            <div className="carrito-cab">
              <h2>Tu carrito {totalItems > 0 && `(${totalItems})`}</h2>
              <button className="icon-btn" aria-label="Cerrar carrito" onClick={() => setAbierto(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M5 5l14 14M19 5L5 19" /></svg>
              </button>
            </div>

            {/* CAMPO NOMBRE */}
            <div className="carrito-nombre">
              <label htmlFor="carrito-nombre" className={nombreValido ? 'ok' : ''}>
                {nombreValido ? '✓ Listo para pedir' : 'Tu nombre, para identificar tu pedido'}
              </label>
              <input
                id="carrito-nombre"
                ref={inputRef}
                value={nombreCliente}
                onChange={e => setNombreCliente(e.target.value)}
                placeholder="Ej.: Carlos M."
                maxLength={40}
                autoComplete="given-name"
              />
            </div>

            {/* PRODUCTOS */}
            <div className="carrito-items">
              {items.length === 0 ? (
                <div className="carrito-vacio">
                  <p>Tu carrito está vacío</p>
                  <p>Elige un modelo, tu color y tu talla.</p>
                  <button className="btn btn-solid" onClick={() => { setAbierto(false); window.location.href = '/catalogo'; }}>
                    Ver catálogo
                  </button>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {items.map(item => (
                    <motion.div
                      key={item.itemId}
                      className="carrito-item"
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, height: 0, paddingTop: 0, paddingBottom: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="carrito-item-foto">
                        {item.imagen && <img src={item.imagen} alt={item.nombre} onError={e => e.target.style.display = 'none'} />}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p className="carrito-item-nombre">{item.nombre.toLowerCase()}</p>
                        <p className="carrito-item-meta">{String(item.color).toLowerCase()}, talla {item.talla}</p>
                        <p style={{ fontWeight: 600 }}>S/ {Number(item.precio).toFixed(2)}</p>
                        <div className="carrito-item-fila">
                          <div className="cantidad">
                            <button aria-label="Quitar uno" onClick={() => cambiarCantidad(item.itemId, item.cantidad - 1)}>−</button>
                            <span aria-live="polite">{item.cantidad}</span>
                            <button aria-label="Agregar uno" onClick={() => cambiarCantidad(item.itemId, item.cantidad + 1)} disabled={item.cantidad >= item.stockMax}>+</button>
                          </div>
                          <button className="quitar-btn" onClick={() => handleQuitar(item.itemId, item.nombre)}>Quitar</button>
                        </div>
                        {item.cantidad >= item.stockMax && <p className="carrito-max">Es todo el stock disponible</p>}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* PIE */}
            {items.length > 0 && (
              <div className="carrito-pie">
                <div className="carrito-total">
                  <span>Total</span>
                  <span>S/ {Number(total).toFixed(2)}</span>
                </div>
                {!nombreValido && (
                  <p className="carrito-aviso">Escribe tu nombre arriba para confirmar el pedido</p>
                )}
                <a href="/checkout"
                  aria-disabled={!nombreValido}
                  className="btn btn-solid btn-full"
                  onClick={e => {
                    if (!nombreValido) { e.preventDefault(); inputRef.current?.focus(); return; }
                    if (typeof window !== 'undefined' && window.fbq) {
                      window.fbq('track', 'InitiateCheckout', {
                        content_ids: items.map(item => `${item.imagen?.split('/').slice(-2,-1)[0]}${item.color}${item.talla}`),
                        content_type: 'product',
                        value: Number(total),
                        currency: 'PEN',
                        num_items: items.reduce((acc, i) => acc + i.cantidad, 0),
                      });
                    }
                  }}>
                  Confirmar pedido
                </a>
                <p className="carrito-nota">Revisas tu pedido y lo envías por WhatsApp</p>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

'use client';
import { useCarrito } from '../context/CarritoContext';
import { useToast } from '../context/ToastContext';
import { useEffect, useRef } from 'react';

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
    <>
      {abierto && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.45)',zIndex:200,backdropFilter:'blur(2px)'}}
          onClick={() => setAbierto(false)} />
      )}
      <div style={{
        position:'fixed',top:0,
        right: abierto ? 0 : '-440px',
        width:'420px',maxWidth:'100vw',
        height:'100%',
        height:'-webkit-fill-available',
        maxHeight:'100dvh',
        background:'var(--blanco)',zIndex:201,
        transition:'right 0.35s cubic-bezier(.4,0,.2,1)',
        display:'flex',flexDirection:'column',
        boxShadow:'-4px 0 30px rgba(0,0,0,0.15)',
      }}>
        {/* HEADER */}
        <div style={{padding:'1.5rem 2rem',borderBottom:'1px solid var(--gris-claro)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <h2 style={{fontFamily:'var(--font-display)',fontSize:'1.2rem',fontWeight:700,letterSpacing:'0.02em'}}>
            Tu carrito {totalItems > 0 && `(${totalItems})`}
          </h2>
          <button onClick={() => setAbierto(false)} style={{background:'none',border:'none',cursor:'pointer',fontSize:'1.5rem',color:'var(--negro)',padding:'0.25rem',lineHeight:1}}>×</button>
        </div>

        {/* CAMPO NOMBRE */}
        <div style={{padding:'1rem 2rem',borderBottom:'1px solid var(--gris-claro)',background:nombreValido ? '#f0fdf4' : '#fffbeb'}}>
          <p style={{fontFamily:'var(--font-body)',fontSize:'0.72rem',letterSpacing:'0.15em',textTransform:'uppercase',marginBottom:'0.5rem',color:nombreValido ? '#166534' : 'var(--marron)',fontWeight:600}}>
            {nombreValido ? '✓ Listo para pedir' : '* Ingresa tu nombre para continuar'}
          </p>
          <input
            ref={inputRef}
            value={nombreCliente}
            onChange={e => setNombreCliente(e.target.value)}
            placeholder="Tu nombre (ej: Carlos M.)"
            maxLength={40}
            style={{
              width:'100%',padding:'0.65rem 0.75rem',
              border: nombreValido ? '1px solid #86efac' : '1px solid var(--marron)',
              outline:'none',fontFamily:'var(--font-body)',fontSize:'0.9rem',
              background:'var(--blanco)',color:'var(--negro)',boxSizing:'border-box',
              transition:'border 0.2s',
            }}
          />
        </div>

        {/* ITEMS */}
        <div style={{flex:1,overflowY:'auto',padding:'1rem 2rem'}}>
          {items.length === 0 ? (
            <div style={{textAlign:'center',paddingTop:'3rem'}}>
              <p style={{fontFamily:'var(--font-body)',fontSize:'1rem',color:'var(--gris)',marginBottom:'0.5rem'}}>Tu carrito está vacío</p>
              <p style={{fontFamily:'var(--font-body)',fontSize:'0.82rem',color:'var(--gris)',marginBottom:'1.5rem'}}>Ingresa tu nombre y empieza a elegir</p>
              <button onClick={() => { setAbierto(false); window.location.href='/catalogo'; }}
                style={{fontFamily:'var(--font-body)',fontSize:'0.8rem',letterSpacing:'0.15em',textTransform:'uppercase',color:'var(--marron)',background:'none',border:'none',borderBottom:'1px solid var(--marron)',cursor:'pointer',paddingBottom:'2px'}}>
                Ver catálogo
              </button>
            </div>
          ) : (
            items.map(item => (
              <div key={item.itemId} style={{display:'flex',gap:'1rem',marginBottom:'1.5rem',paddingBottom:'1.5rem',borderBottom:'1px solid var(--gris-claro)'}}>
                <div style={{width:'75px',height:'95px',flexShrink:0,overflow:'hidden',background:item.hexColor||'var(--crema)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  {item.imagen ? (
                    <img src={item.imagen} alt={item.nombre} style={{width:'100%',height:'100%',objectFit:'cover'}} onError={e => e.target.style.display='none'} />
                  ) : (
                    <span style={{fontFamily:'var(--font-display)',fontSize:'0.5rem',fontWeight:700,color:'rgba(255,255,255,0.4)',letterSpacing:'0.2em'}}>SUMACK</span>
                  )}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <p style={{fontFamily:'var(--font-display)',fontSize:'1rem',fontWeight:700,marginBottom:'0.2rem',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{item.nombre}</p>
                  <p style={{fontFamily:'var(--font-body)',fontSize:'0.85rem',color:'var(--gris)',marginBottom:'0.4rem'}}>{item.color} / Talla {item.talla}</p>
                  <p style={{fontFamily:'var(--font-body)',fontSize:'0.95rem',color:'var(--marron)',fontWeight:600}}>S/. {Number(item.precio).toFixed(2)}</p>
                  <div style={{display:'flex',alignItems:'center',gap:'0.5rem',marginTop:'0.6rem'}}>
                    <button onClick={() => cambiarCantidad(item.itemId, item.cantidad - 1)}
                      style={{width:'26px',height:'26px',border:'1px solid var(--gris-claro)',background:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1rem'}}>−</button>
                    <span style={{fontFamily:'var(--font-body)',minWidth:'20px',textAlign:'center',fontSize:'0.9rem'}}>{item.cantidad}</span>
                    <button onClick={() => cambiarCantidad(item.itemId, item.cantidad + 1)}
                      disabled={item.cantidad >= item.stockMax}
                      style={{width:'26px',height:'26px',border:'1px solid var(--gris-claro)',background:'none',cursor:item.cantidad >= item.stockMax ? 'not-allowed':'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1rem',opacity:item.cantidad >= item.stockMax ? 0.3:1}}>+</button>
                    <button onClick={() => handleQuitar(item.itemId, item.nombre)}
                      style={{marginLeft:'auto',background:'none',border:'none',cursor:'pointer',fontFamily:'var(--font-body)',fontSize:'0.7rem',color:'var(--gris)',letterSpacing:'0.1em',textTransform:'uppercase'}}>
                      Quitar
                    </button>
                  </div>
                  {item.cantidad >= item.stockMax && (
                    <p style={{fontFamily:'var(--font-body)',fontSize:'0.7rem',color:'var(--marron)',marginTop:'0.3rem'}}>Máximo disponible</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* FOOTER */}
        {items.length > 0 && (
          <div style={{padding:'1.5rem 2rem 2.5rem',borderTop:'1px solid var(--gris-claro)',flexShrink:0}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.5rem'}}>
              <span style={{fontFamily:'var(--font-body)',fontSize:'1rem',fontWeight:500}}>Total</span>
              <span style={{fontFamily:'var(--font-body)',fontSize:'1.2rem',fontWeight:700,color:'var(--marron)'}}>S/. {Number(total).toFixed(2)}</span>
            </div>
            {!nombreValido && (
              <p style={{fontFamily:'var(--font-body)',fontSize:'0.78rem',color:'var(--marron)',textAlign:'center',marginBottom:'0.75rem',letterSpacing:'0.05em'}}>
                ⚠ Ingresa tu nombre para confirmar tu pedido
              </p>
            )}
            <a href="/checkout"
              onClick={e => {
                if (!nombreValido) { e.preventDefault(); return; }
                if (typeof window !== 'undefined' && window.fbq) {
                  window.fbq('track', 'InitiateCheckout', {
                    content_ids: items.map(item => `${item.imagen?.split('/').slice(-2,-1)[0]}${item.color}${item.talla}`),
                    content_type: 'product',
                    value: Number(total),
                    currency: 'PEN',
                    num_items: items.reduce((acc, i) => acc + i.cantidad, 0),
                  });
                }
              }}
              style={{
                display:'block',width:'100%',padding:'1.1rem',
                background: nombreValido ? 'var(--negro)' : 'var(--gris-claro)',
                color: nombreValido ? 'var(--blanco)' : 'var(--gris)',
                fontFamily:'var(--font-body)',fontSize:'1rem',
                fontWeight:700,letterSpacing:'0.15em',textTransform:'uppercase',
                textDecoration:'none',textAlign:'center',transition:'background 0.3s',
                cursor: nombreValido ? 'pointer' : 'not-allowed',
                pointerEvents: nombreValido ? 'auto' : 'none',
              }}>
              Confirmar pedido →
            </a>
            <p style={{fontFamily:'var(--font-body)',fontSize:'0.82rem',color:'var(--gris)',textAlign:'center',marginTop:'0.75rem',lineHeight:1.5}}>
              Revisa tu pedido y cierra la venta por WhatsApp
            </p>
          </div>
        )}
      </div>
    </>
  );
}
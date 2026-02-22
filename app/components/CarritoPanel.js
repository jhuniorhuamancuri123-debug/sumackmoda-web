'use client';
import { useCarrito } from '../context/CarritoContext';
import { useToast } from '../context/ToastContext';

export default function CarritoPanel() {
  const { items, quitar, cambiarCantidad, total, totalItems, abierto, setAbierto, cargado } = useCarrito();
  const toast = useToast();

  if (!cargado) return null;

  function handleQuitar(itemId, nombre) {
    quitar(itemId);
    toast.info(`${nombre} eliminado del carrito`);
  }

  return (
    <>
      {abierto && (
        <div
          style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.45)',zIndex:200,backdropFilter:'blur(2px)'}}
          onClick={() => setAbierto(false)}
        />
      )}
      <div style={{
        position:'fixed', top:0,
        right: abierto ? 0 : '-440px',
        width:'420px', maxWidth:'100vw',
        height:'100vh',
        background:'var(--blanco)',
        zIndex:201,
        transition:'right 0.35s cubic-bezier(.4,0,.2,1)',
        display:'flex', flexDirection:'column',
        boxShadow:'-4px 0 30px rgba(0,0,0,0.15)',
      }}>
        <div style={{padding:'1.5rem 2rem',borderBottom:'1px solid var(--gris-claro)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <h2 style={{fontFamily:'var(--font-display)',fontSize:'1.2rem',fontWeight:700,letterSpacing:'0.02em'}}>
            Tu carrito {totalItems > 0 && `(${totalItems})`}
          </h2>
          <button onClick={() => setAbierto(false)} style={{background:'none',border:'none',cursor:'pointer',fontSize:'1.5rem',color:'var(--negro)',padding:'0.25rem',lineHeight:1}}>×</button>
        </div>
        <div style={{flex:1,overflowY:'auto',padding:'1rem 2rem'}}>
          {items.length === 0 ? (
            <div style={{textAlign:'center',paddingTop:'4rem'}}>
              <p style={{fontFamily:'var(--font-body)',fontSize:'1.1rem',color:'var(--gris)',marginBottom:'1.5rem'}}>Tu carrito está vacío</p>
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
                  <p style={{fontFamily:'var(--font-display)',fontSize:'0.9rem',fontWeight:700,marginBottom:'0.2rem',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{item.nombre}</p>
                  <p style={{fontFamily:'var(--font-body)',fontSize:'0.8rem',color:'var(--gris)',marginBottom:'0.4rem'}}>{item.color} / Talla {item.talla}</p>
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
        {items.length > 0 && (
          <div style={{padding:'1.5rem 2rem',borderTop:'1px solid var(--gris-claro)'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.5rem'}}>
              <span style={{fontFamily:'var(--font-body)',fontSize:'1rem',fontWeight:500}}>Total</span>
              <span style={{fontFamily:'var(--font-body)',fontSize:'1.2rem',fontWeight:700,color:'var(--marron)'}}>S/. {Number(total).toFixed(2)}</span>
            </div>
            <a href="/checkout"
              style={{display:'block',width:'100%',padding:'1rem',background:'var(--negro)',color:'var(--blanco)',fontFamily:'var(--font-body)',fontSize:'0.85rem',fontWeight:600,letterSpacing:'0.2em',textTransform:'uppercase',textDecoration:'none',textAlign:'center',transition:'background 0.3s'}}
              onMouseEnter={e => e.currentTarget.style.background='var(--marron)'}
              onMouseLeave={e => e.currentTarget.style.background='var(--negro)'}>
              Ir a pagar
            </a>
            <p style={{fontFamily:'var(--font-body)',fontSize:'0.75rem',color:'var(--gris)',textAlign:'center',marginTop:'0.75rem'}}>
              El envío se coordina al confirmar el pedido
            </p>
          </div>
        )}
      </div>
    </>
  );
}
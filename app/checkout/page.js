'use client';
import { useCarrito } from '../context/CarritoContext';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const TIENDAS = [
  { id: 'piso6', label: '🏬 Tienda 6to Piso', numero: '987774229' },
  { id: 'piso9', label: '🏬 Tienda 9no Piso', numero: '968267313' },
];

const ENVIOS = [
  { id: 'shalom', label: 'Shalom', detalle: 'Sin recargo adicional', recargo: 0 },
  { id: 'olva', label: 'Olva Courier', detalle: 'Recargo variable según destino', recargo: null },
  { id: 'cargo', label: 'Otras agencias', detalle: 'Recargo variable según destino', recargo: null },
  { id: 'delivery', label: 'Delivery Lima', detalle: 'Recargo variable según zona', recargo: null },
];

export default function CheckoutPage() {
  const { items, total, nombreCliente, vaciar } = useCarrito();
  const [envio, setEnvio] = useState('shalom');
  const router = useRouter();

  if (items.length === 0) return (
    <div style={{paddingTop:'120px',minHeight:'60vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'1rem',fontFamily:'var(--font-body)',textAlign:'center'}}>
      <p style={{fontSize:'1.2rem',fontFamily:'var(--font-display)',fontWeight:700}}>Tu carrito está vacío</p>
      <a href="/catalogo" style={{fontFamily:'var(--font-body)',fontSize:'0.8rem',letterSpacing:'0.15em',textTransform:'uppercase',color:'var(--marron)',textDecoration:'none',borderBottom:'1px solid var(--marron)',paddingBottom:'2px'}}>
        Ver catálogo
      </a>
    </div>
  );

  if (!nombreCliente || nombreCliente.trim().length < 2) {
    return (
      <div style={{paddingTop:'120px',minHeight:'60vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'1rem',fontFamily:'var(--font-body)',textAlign:'center',padding:'2rem'}}>
        <p style={{fontSize:'1.2rem',fontFamily:'var(--font-display)',fontWeight:700}}>Falta tu nombre</p>
        <p style={{color:'var(--gris)',fontSize:'0.9rem'}}>Necesitamos tu nombre para identificarte durante la compra.</p>
        <button onClick={() => router.back()} style={{marginTop:'1rem',fontFamily:'var(--font-body)',fontSize:'0.8rem',letterSpacing:'0.15em',textTransform:'uppercase',color:'var(--marron)',background:'none',border:'none',borderBottom:'1px solid var(--marron)',cursor:'pointer',paddingBottom:'2px'}}>
          ← Volver e ingresar mi nombre
        </button>
      </div>
    );
  }

  function construirMensaje(tienda) {
    const envioSeleccionado = ENVIOS.find(e => e.id === envio);
    const fecha = new Date().toLocaleDateString('es-PE', { day:'2-digit', month:'long', year:'numeric' });

    let msg = `👋 Hola, soy *${nombreCliente.trim()}* y me gustaría realizar el siguiente pedido:\n\n`;
    msg += `📋 *DETALLE DEL PEDIDO*\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━\n`;
    items.forEach((item, i) => {
      msg += `${i + 1}. *${item.nombre}*\n`;
      msg += `   • Color: ${item.color}\n`;
      msg += `   • Talla: ${item.talla}\n`;
      msg += `   • Cantidad: ${item.cantidad}\n`;
      msg += `   • Precio unitario: S/. ${Number(item.precio).toFixed(2)}\n`;
      msg += `   • Subtotal: S/. ${(item.precio * item.cantidad).toFixed(2)}\n\n`;
    });
    msg += `━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `💰 *TOTAL: S/. ${Number(total).toFixed(2)}*\n\n`;
    msg += `🚚 *Envío preferido:* ${envioSeleccionado.label}`;
    msg += envioSeleccionado.recargo === 0 ? ' _(sin recargo)_' : ' _(coordinar costo)_';
    msg += `\n\n🏬 *Tienda:* ${tienda.label.replace('🏬 ', '')}\n`;
    msg += `📅 *Fecha:* ${fecha}\n\n`;
    msg += `¿Cómo procedo con el pago? 🙏`;

    return encodeURIComponent(msg);
  }

  function handleWhatsApp(tienda) {
    const mensaje = construirMensaje(tienda);
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'Contact', {
        content_ids: items.map(item => {
          const partes = item.imagen?.split('/') || [];
          const codModelo = partes[partes.length - 2] || '';
          const codColor = item.codColor || item.color?.replace(/\s/g, '').replace(/\//g, '').toUpperCase() || '';
          return `${codModelo}${codColor}${item.talla}`;
        }),
        content_type: 'product',
        value: Number(total),
        currency: 'PEN',
        num_items: items.reduce((acc, i) => acc + i.cantidad, 0),
      });
    }
    window.open(`https://wa.me/${tienda.numero}?text=${mensaje}`, '_blank');
    vaciar();
  }

  return (
    <div style={{paddingTop:'80px',minHeight:'100vh'}}>
      <div style={{maxWidth:'680px',margin:'0 auto',padding:'3rem 1.5rem'}}>
        <h1 style={{fontFamily:'var(--font-display)',fontSize:'2rem',fontWeight:700,marginBottom:'0.5rem'}}>Tu pedido</h1>
        <p style={{fontFamily:'var(--font-body)',fontSize:'0.9rem',color:'var(--gris)',marginBottom:'2.5rem'}}>
          Hola <strong>{nombreCliente}</strong>, revisa tu pedido antes de confirmar.
        </p>

        {/* PRODUCTOS */}
        <div style={{marginBottom:'2rem'}}>
          {items.map(item => (
            <div key={item.itemId} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'1rem 0',borderBottom:'1px solid var(--gris-claro)',fontFamily:'var(--font-body)'}}>
              <div style={{display:'flex',gap:'1rem',alignItems:'center'}}>
                <div style={{width:'50px',height:'60px',flexShrink:0,background:item.hexColor||'var(--crema)',overflow:'hidden'}}>
                  {item.imagen && <img src={item.imagen} alt={item.nombre} style={{width:'100%',height:'100%',objectFit:'cover'}} />}
                </div>
                <div>
                  <p style={{fontWeight:600,fontSize:'0.9rem',marginBottom:'0.2rem'}}>{item.nombre}</p>
                  <p style={{color:'var(--gris)',fontSize:'0.8rem'}}>{item.color} / Talla {item.talla} / x{item.cantidad}</p>
                </div>
              </div>
              <p style={{fontWeight:600,color:'var(--marron)',fontSize:'0.95rem'}}>S/. {(item.precio * item.cantidad).toFixed(2)}</p>
            </div>
          ))}
        </div>

        {/* TOTAL */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'1rem 0',marginBottom:'2rem'}}>
          <span style={{fontFamily:'var(--font-body)',fontWeight:600,fontSize:'1rem'}}>Total</span>
          <span style={{fontFamily:'var(--font-body)',fontWeight:700,fontSize:'1.3rem',color:'var(--marron)'}}>S/. {Number(total).toFixed(2)}</span>
        </div>

        {/* ENVÍO */}
        <div style={{marginBottom:'2rem'}}>
          <p style={{fontFamily:'var(--font-body)',fontSize:'0.75rem',letterSpacing:'0.15em',textTransform:'uppercase',marginBottom:'1rem',fontWeight:600}}>
            🚚 Elige tu tipo de envío
          </p>
          <div style={{display:'flex',flexDirection:'column',gap:'0.5rem'}}>
            {ENVIOS.map(e => (
              <button key={e.id} onClick={() => setEnvio(e.id)}
                style={{padding:'0.9rem 1rem',border:envio===e.id?'2px solid var(--negro)':'1px solid var(--gris-claro)',background:envio===e.id?'var(--negro)':'transparent',color:envio===e.id?'var(--blanco)':'var(--negro)',fontFamily:'var(--font-body)',cursor:'pointer',display:'flex',justifyContent:'space-between',alignItems:'center',transition:'all 0.2s',textAlign:'left'}}>
                <span style={{fontWeight:600,fontSize:'0.9rem'}}>{e.label}</span>
                <span style={{fontSize:'0.78rem',color:envio===e.id?'rgba(255,255,255,0.7)':'var(--gris)'}}>{e.detalle}</span>
              </button>
            ))}
          </div>
        </div>

        {/* NOTA ENVÍO */}
        <div style={{padding:'1rem',background:'var(--crema)',borderLeft:'3px solid var(--marron)',fontFamily:'var(--font-body)',fontSize:'0.82rem',lineHeight:1.7,marginBottom:'2rem'}}>
          <p>El costo de envío se coordina directamente con la vendedora por WhatsApp según tu ubicación.</p>
        </div>

        {/* AVISO */}
        <div style={{background:'#f0fdf4',border:'1px solid #bbf7d0',borderLeft:'4px solid #25D366',padding:'1rem 1.25rem',marginBottom:'1.5rem',fontFamily:'var(--font-body)'}}>
          <p style={{fontSize:'0.88rem',lineHeight:1.6,color:'#166534'}}>
            <strong>¿Cómo funciona?</strong> Elige la tienda con la que estás hablando. Se abrirá WhatsApp con tu pedido completo ya redactado. Solo envía el mensaje y te atendemos al instante.
          </p>
        </div>

        {/* DOS BOTONES WHATSAPP */}
        <p style={{fontFamily:'var(--font-body)',fontSize:'0.75rem',letterSpacing:'0.15em',textTransform:'uppercase',marginBottom:'0.75rem',fontWeight:600,textAlign:'center'}}>
          Selecciona la tienda
        </p>
        <div style={{display:'flex',flexDirection:'column',gap:'0.75rem',marginBottom:'1rem'}}>
          {TIENDAS.map(tienda => (
            <button key={tienda.id} onClick={() => handleWhatsApp(tienda)}
              style={{width:'100%',padding:'1.1rem',background:'#25D366',color:'#fff',fontFamily:'var(--font-body)',fontSize:'0.95rem',fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',border:'none',cursor:'pointer',transition:'background 0.3s',display:'flex',alignItems:'center',justifyContent:'center',gap:'0.75rem'}}
              onMouseEnter={e => e.currentTarget.style.background='#1ebe5d'}
              onMouseLeave={e => e.currentTarget.style.background='#25D366'}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
              </svg>
              {tienda.label}
            </button>
          ))}
        </div>

        <p style={{fontFamily:'var(--font-body)',fontSize:'0.75rem',color:'var(--gris)',textAlign:'center',marginTop:'0.5rem'}}>
          Serás redirigido a WhatsApp con tu pedido listo para enviar
        </p>
      </div>
    </div>
  );
}
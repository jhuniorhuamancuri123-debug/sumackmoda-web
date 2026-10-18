'use client';
import Link from 'next/link';
import { useCarrito } from '../context/CarritoContext';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IconoWA } from '../components/SiteFooter';

const TIENDAS = [
  { id: 'piso9', label: 'Confirmar pedido por WhatsApp', numero: '968267313' },
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
    <div className="estado-centro">
      <h1>Tu carrito está vacío</h1>
      <p>Elige un modelo, tu color y tu talla para armar tu pedido.</p>
      <Link href="/catalogo" className="btn btn-solid" style={{ marginTop: '0.5rem' }}>Ver catálogo</Link>
    </div>
  );

  if (!nombreCliente || nombreCliente.trim().length < 2) {
    return (
      <div className="estado-centro">
        <h1>Falta tu nombre</h1>
        <p>Lo necesitamos para identificar tu pedido en WhatsApp.</p>
        <button onClick={() => router.back()} className="btn btn-linea" style={{ marginTop: '0.5rem' }}>
          Volver y escribir mi nombre
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
    const contentIds = items.map(item => {
      const partes = item.imagen?.split('/') || [];
      const codModelo = partes[partes.length - 2] || '';
      const codColor = item.codColor || '';
      return `${codModelo}${codColor}${item.talla}`;
    });
    const numItems = items.reduce((acc, i) => acc + i.cantidad, 0);
    const eventId = `Contact-${Date.now()}`;
    // Pixel navegador
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'Contact', {
        content_ids: contentIds,
        content_type: 'product',
        value: Number(total),
        currency: 'PEN',
        num_items: numItems,
      }, { eventID: eventId });
    }
    // CAPI servidor
    fetch('/api/meta-events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventName: 'Contact',
        eventId,
        eventData: {
          url: items[0]?.urlProducto || window.location.href,
          content_ids: contentIds,
          content_type: 'product',
          value: Number(total),
          num_items: numItems,
          fbc: document.cookie.match(/_fbc=([^;]+)/)?.[1] || new URLSearchParams(window.location.search).get('fbclid') || '',
          fbp: document.cookie.match(/_fbp=([^;]+)/)?.[1] || '',
        }
      }),
    });
    window.open(`https://wa.me/${tienda.numero}?text=${mensaje}`, '_blank');
    vaciar();
  }

  return (
    <div className="checkout">
      <div className="checkout-inner">
        <div className="checkout-pasos" aria-label="Pasos de compra">
          <span>Carrito</span><i aria-hidden="true" /><b>Revisión</b><i aria-hidden="true" /><span>WhatsApp</span>
        </div>
        <h1 className="t-display">Tu pedido</h1>
        <p className="checkout-saludo">Hola {nombreCliente}, revisa tu pedido antes de enviarlo.</p>

        {/* PRODUCTOS */}
        <div className="checkout-items">
          {items.map(item => (
            <div key={item.itemId} className="checkout-item">
              <div className="checkout-item-izq">
                <div className="checkout-item-foto" style={{ background: item.hexColor || undefined }}>
                  {item.imagen && <img src={item.imagen} alt={item.nombre} />}
                </div>
                <div style={{ minWidth: 0 }}>
                  <p>{item.nombre.toLowerCase()}</p>
                  <p className="t-meta">{String(item.color).toLowerCase()}, talla {item.talla}, cantidad {item.cantidad}</p>
                </div>
              </div>
              <p style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>S/ {(item.precio * item.cantidad).toFixed(2)}</p>
            </div>
          ))}
        </div>

        {/* TOTAL */}
        <div className="checkout-total">
          <span>Total de prendas</span>
          <span>S/ {Number(total).toFixed(2)}</span>
        </div>

        {/* ENVÍO */}
        <h2>Elige cómo quieres recibirlo</h2>
        <div className="envios" role="radiogroup" aria-label="Tipo de envío">
          {ENVIOS.map(e => (
            <button key={e.id} role="radio" aria-checked={envio === e.id} onClick={() => setEnvio(e.id)}
              className={`envio-opcion ${envio === e.id ? 'sel' : ''}`}>
              <span className="radio" aria-hidden="true" />
              <b>{e.label}</b>
              <span>{e.detalle}</span>
            </button>
          ))}
        </div>
        <p className="checkout-nota">El costo de envío se coordina con la vendedora por WhatsApp según tu ubicación.</p>

        {/* CÓMO FUNCIONA */}
        <div className="checkout-como">
          <IconoWA size={20} />
          <p>Se abrirá WhatsApp con tu pedido ya redactado. Solo envía el mensaje y te confirmamos stock, pago y envío.</p>
        </div>

        {TIENDAS.map(tienda => (
          <button key={tienda.id} onClick={() => handleWhatsApp(tienda)} className="btn btn-wa btn-full">
            <IconoWA size={20} />
            {tienda.label}
          </button>
        ))}

        <p className="checkout-final">Serás redirigido a WhatsApp con tu pedido listo para enviar</p>
      </div>
    </div>
  );
}

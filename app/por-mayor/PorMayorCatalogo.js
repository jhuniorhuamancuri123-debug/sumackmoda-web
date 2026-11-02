'use client';
import { useState } from 'react';
import ProductoImg from '../components/ProductoImg';
import { IconoWA } from '../components/SiteFooter';
import { CATEGORIAS } from '../data/categorias';
import { WHATSAPP } from '../data/marca';

const R2 = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL;
const BASE = 'https://sumackmoda.com';
const MAX_COLORES = 5;

// Evento "contacto mayorista" para Meta y TikTok (separado de las compras normales).
// Sólo píxel del navegador; no pasa por /api/meta-events ni /api/tiktok-events.
function registrarContacto({ cod, nombre }) {
  try {
    window.fbq?.('track', 'Lead', {
      content_name: nombre,
      content_ids: [cod],
      content_type: 'product',
      content_category: 'mayorista',
    });
  } catch {}
  try {
    window.ttq?.track('Contact', {
      contents: [{ content_id: cod, content_name: nombre }],
      content_type: 'product',
      description: 'mayorista',
    });
  } catch {}
}

export function BotonMayorista({ href, className, evento, children }) {
  return (
    <a href={href} target="_blank" rel="noopener" className={className} onClick={() => registrarContacto(evento)}>
      <IconoWA /> {children}
    </a>
  );
}

function mensajeModelo(m, minimo) {
  const precio = m.precioMin
    ? (m.precioMax > m.precioMin ? `desde S/ ${m.precioMin.toFixed(2)}` : `S/ ${m.precioMin.toFixed(2)}`)
    : null;
  return [
    `Hola SUMACK 👋 Quiero hacer un *pedido mayorista* (desde ${minimo} unidades).`,
    `Me interesa el modelo *${m.nombre}* (${m.cod}).${precio ? ` Vi que su precio regular es ${precio}.` : ''}`,
    '¿Me podrían enviar los precios por mayor y los colores y tallas disponibles?',
    `${BASE}/catalogo/${m.cod}`,
  ].join('\n');
}

export default function PorMayorCatalogo({ modelos, minimo }) {
  const [categoria, setCategoria] = useState(null);

  const conteo = {};
  for (const m of modelos) for (const c of m.categorias) conteo[c] = (conteo[c] || 0) + 1;
  const pestanas = CATEGORIAS.filter((c) => conteo[c.slug] > 0);
  const visibles = categoria ? modelos.filter((m) => m.categorias.includes(categoria)) : modelos;

  return (
    <>
      <div className="catalogo-barra">
        <nav className="wrap categorias-tabs" aria-label="Categorías">
          <button
            type="button"
            className={`categoria-tab ${!categoria ? 'activa' : ''}`}
            aria-pressed={!categoria}
            onClick={() => setCategoria(null)}
          >
            Todos<span className="categoria-tab-n">{modelos.length}</span>
          </button>
          {pestanas.map((c) => (
            <button
              key={c.slug}
              type="button"
              className={`categoria-tab ${categoria === c.slug ? 'activa' : ''}`}
              aria-pressed={categoria === c.slug}
              onClick={() => setCategoria(c.slug)}
            >
              {c.nombre}<span className="categoria-tab-n">{conteo[c.slug]}</span>
            </button>
          ))}
        </nav>
        <div className="wrap catalogo-barra-inner">
          <p className="catalogo-aviso">
            Pedido mínimo: <strong>{minimo} unidades</strong>. Precios por mayor por WhatsApp.
          </p>
          <p className="catalogo-conteo">{visibles.length} {visibles.length === 1 ? 'modelo' : 'modelos'}</p>
        </div>
      </div>

      <div className="wrap catalogo-grid-wrap">
        {visibles.length === 0 ? (
          <div className="vacio">
            <p>No pudimos cargar los modelos en este momento. Escríbenos y te enviamos el catálogo.</p>
          </div>
        ) : (
          <div className="productos-grid">
            {visibles.map((m, i) => (
              <article key={m.cod} className="producto-card mayor-card">
                <div className="producto-img-wrap">
                  <ProductoImg src={`${R2}/${m.cod}/${m.foto}.webp`} alt={m.nombre} priority={i < 2} />
                  <span className={`producto-badge${m.enStock ? '' : ' mayor-badge-pedido'}`}>
                    {m.enStock ? 'En stock' : 'Bajo pedido'}
                  </span>
                </div>
                <h3 className="producto-nombre mayor-nombre">{m.nombre}</h3>
                <p className="mayor-detalle">
                  {m.tallas && <>Tallas {m.tallas}</>}
                  {m.tallas && m.colores.length > 0 && ' · '}
                  {m.colores.length > 0 && <>{m.colores.length} {m.colores.length === 1 ? 'color' : 'colores'}</>}
                </p>
                {m.colores.length > 0 && (
                  <p className="mayor-colores">
                    {m.colores.slice(0, MAX_COLORES).join(', ').toLowerCase()}
                    {m.colores.length > MAX_COLORES && ` y ${m.colores.length - MAX_COLORES} más`}
                  </p>
                )}
                <BotonMayorista
                  href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(mensajeModelo(m, minimo))}`}
                  className="btn btn-wa btn-full mayor-btn"
                  evento={{ cod: m.cod, nombre: m.nombre }}
                >
                  Hacer pedido mayorista
                </BotonMayorista>
              </article>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

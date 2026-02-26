'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import Link from 'next/link';

const TALLAS = ['S', 'M', 'L', 'XL', 'XXL'];

export default function CatalogoPage() {
  const [productos, setProductos] = useState([]);
  const [tallaFiltro, setTallaFiltro] = useState('S');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarProductos();
  }, [tallaFiltro]);

  async function cargarProductos() {
    setLoading(true);
    let query = supabase
      .from('productos')
      .select('id, cod_modelo, cod_color, cod_talla, nombre, precio, stock')
      .gt('stock', 0);
    if (tallaFiltro) {
      query = query.eq('cod_talla', tallaFiltro);
    }
    const { data } = await query.order('cod_modelo');
    if (!data) { setLoading(false); return; }
    const modelosMap = new Map();
    for (const p of data) {
      if (!modelosMap.has(p.cod_modelo)) {
        modelosMap.set(p.cod_modelo, p);
      }
    }
    setProductos(Array.from(modelosMap.values()));
    setLoading(false);
  }

  return (
    <div className="catalogo-page">
      <div className="catalogo-header">
        <h1 className="catalogo-titulo">Catálogo</h1>
        <p className="catalogo-subtitulo">
          {loading ? 'Cargando...' : `${productos.length} modelos disponibles`}
        </p>
      </div>

      {/* Aviso precios variables */}
      <div style={{
        maxWidth: '1200px', margin: '0 auto',
        padding: '0 1.5rem 1rem',
      }}>
        <div style={{
          background: 'var(--crema)',
          borderLeft: '4px solid var(--marron)',
          padding: '1rem 1.25rem',
          fontFamily: 'var(--font-body)',
          fontSize: '1rem',
          fontWeight: 600,
          color: 'var(--negro)',
          lineHeight: 1.6,
        }}>
          💡 Los precios varían según la talla — selecciona tu talla para ver disponibilidad y precio exacto.
        </div>
      </div>

      {/* Filtros por talla — sin "Todas" */}
      <div className="catalogo-filtros">
        {TALLAS.map(t => (
          <button
            key={t}
            className={`filtro-btn ${tallaFiltro === t ? 'active' : ''}`}
            onClick={() => setTallaFiltro(tallaFiltro === t ? null : t)}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Grilla */}
      <div className="catalogo-grid-wrap">
        {loading ? (
          <div className="productos-grid">
            {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : productos.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '4rem',
            fontFamily: 'var(--font-body)', color: 'var(--gris)',
          }}>
            <p style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>
              No hay modelos disponibles en talla {tallaFiltro}
            </p>
            <button onClick={() => setTallaFiltro(null)} style={{
              fontFamily: 'var(--font-body)', fontSize: '0.8rem',
              letterSpacing: '0.15em', textTransform: 'uppercase',
              color: 'var(--marron)', background: 'none',
              border: 'none', borderBottom: '1px solid var(--marron)',
              cursor: 'pointer', paddingBottom: '2px',
            }}>
              Ver todos los modelos
            </button>
          </div>
        ) : (
          <div className="productos-grid">
            {productos.map(p => <ProductoCard key={p.id} producto={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}

function ProductoCard({ producto }) {
  const { cod_modelo, cod_color, nombre, precio, stock } = producto;
  const nombreModelo = nombre.split(' / ')[0]?.trim() || nombre;
  const imgUrl = `${process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL}/${cod_modelo}/${cod_color}.JPG`;
  const agotado = stock === 0;

  return (
    <Link href={`/catalogo/${cod_modelo}`} className="producto-card">
      <div className="producto-img-wrap">
        <img
          src={imgUrl}
          alt={nombreModelo}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s ease' }}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentNode.innerHTML = `<div class="producto-placeholder">SUMACK</div>`;
          }}
        />
        {agotado && <span className="producto-badge agotado">Agotado</span>}
      </div>
      <p className="producto-nombre">{nombreModelo}</p>
      <p className="producto-precio">Desde S/. {Number(precio).toFixed(2)}</p>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="producto-card">
      <div className="producto-img-wrap" style={{ background: '#e8e4dc', animation: 'pulse 1.5s infinite' }} />
      <div style={{ height: '1rem', background: '#e8e4dc', marginBottom: '0.4rem', borderRadius: '2px' }} />
      <div style={{ height: '0.8rem', background: '#e8e4dc', width: '60%', borderRadius: '2px' }} />
    </div>
  );
}
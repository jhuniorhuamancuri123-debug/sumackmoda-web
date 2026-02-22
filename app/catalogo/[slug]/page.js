'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { notFound } from 'next/navigation';

const TALLAS_ORDEN = ['S', 'M', 'L', 'XL', 'XXL'];

export default function ProductoPage({ params }) {
  const { slug } = params;
  const [variantes, setVariantes] = useState([]);
  const [colores, setColores] = useState([]);
  const [colorSeleccionado, setColorSeleccionado] = useState(null);
  const [tallaSeleccionada, setTallaSeleccionada] = useState(null);
  const [tallasDisponibles, setTallasDisponibles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    cargarProducto();
  }, [slug]);

  useEffect(() => {
    if (colorSeleccionado) {
      const tallas = variantes
        .filter(v => v.cod_color === colorSeleccionado && v.stock > 0)
        .map(v => v.cod_talla)
        .sort((a, b) => TALLAS_ORDEN.indexOf(a) - TALLAS_ORDEN.indexOf(b));
      setTallasDisponibles(tallas);
      setTallaSeleccionada(null);
      setImgError(false);
    }
  }, [colorSeleccionado]);

  async function cargarProducto() {
    const { data } = await supabase
      .from('productos')
      .select(`
        id, cod_modelo, cod_color, cod_talla,
        nombre, precio, stock,
        colores (cod_color, nombre_color, hex_color)
      `)
      .eq('cod_modelo', slug.toUpperCase());

    if (!data || data.length === 0) { setLoading(false); return; }

    setVariantes(data);

    // Colores únicos con stock
    const coloresConStock = new Map();
    for (const v of data) {
      if (v.stock > 0 && !coloresConStock.has(v.cod_color)) {
        coloresConStock.set(v.cod_color, v.colores);
      }
    }
    setColores(Array.from(coloresConStock.entries()).map(([cod, info]) => ({
      cod_color: cod,
      nombre_color: info?.nombre_color || cod,
      hex_color: info?.hex_color || '#CCCCCC',
    })));

    // Seleccionar primer color disponible
    const primerColor = coloresConStock.keys().next().value;
    setColorSeleccionado(primerColor);
    setLoading(false);
  }

  if (loading) return <div style={{ paddingTop: '120px', textAlign: 'center', fontFamily: 'var(--font-body)' }}>Cargando...</div>;
  if (variantes.length === 0) return notFound();

  const primerVariante = variantes[0];
  const nombreModelo = primerVariante.nombre.split(' / ')[0]?.trim();
  const precio = primerVariante.precio;
  const codModelo = primerVariante.cod_modelo;

  const imgUrl = colorSeleccionado
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/productos/${codModelo}/${colorSeleccionado}.jpg`
    : null;

  const productoSeleccionado = tallaSeleccionada && colorSeleccionado
    ? variantes.find(v => v.cod_color === colorSeleccionado && v.cod_talla === tallaSeleccionada)
    : null;

  return (
    <div className="producto-page">
      <div className="producto-inner">

        {/* GALERÍA */}
        <div className="producto-galeria">
          <div className="producto-foto-principal">
            {!imgError && imgUrl ? (
              <img
                src={imgUrl}
                alt={nombreModelo}
                onError={() => setImgError(true)}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  background: colores.find(c => c.cod_color === colorSeleccionado)?.hex_color || '#e8e4dc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-display)',
                  fontSize: '2rem',
                  fontWeight: 900,
                  color: 'rgba(255,255,255,0.4)',
                  letterSpacing: '0.2em',
                }}
              >
                SUMACK
              </div>
            )}
          </div>
        </div>

        {/* INFO */}
        <div className="producto-info">
          <h1 className="producto-info-nombre">{nombreModelo}</h1>
          <p className="producto-info-precio">S/. {Number(precio).toFixed(2)}</p>

          {/* SELECTOR COLOR */}
          <span className="selector-label">
            Color: {colores.find(c => c.cod_color === colorSeleccionado)?.nombre_color || ''}
          </span>
          <div className="colores-grid">
            {colores.map(c => (
              <button
                key={c.cod_color}
                className={`color-circulo ${colorSeleccionado === c.cod_color ? 'selected' : ''}`}
                style={{ background: c.hex_color }}
                title={c.nombre_color}
                onClick={() => setColorSeleccionado(c.cod_color)}
                aria-label={c.nombre_color}
              />
            ))}
          </div>

          {/* SELECTOR TALLA */}
          <span className="selector-label">Talla</span>
          <div className="tallas-grid">
            {TALLAS_ORDEN.map(t => {
              const disponible = tallasDisponibles.includes(t);
              return (
                <button
                  key={t}
                  className={`talla-btn ${!disponible ? 'disabled' : ''} ${tallaSeleccionada === t ? 'selected' : ''}`}
                  onClick={() => disponible && setTallaSeleccionada(t)}
                  disabled={!disponible}
                >
                  {t}
                </button>
              );
            })}
          </div>

          <button
            className="btn-agregar"
            disabled={!productoSeleccionado}
            style={{ opacity: productoSeleccionado ? 1 : 0.5, cursor: productoSeleccionado ? 'pointer' : 'not-allowed' }}
            onClick={() => {
              if (productoSeleccionado) {
                alert(`${nombreModelo} — ${colores.find(c => c.cod_color === colorSeleccionado)?.nombre_color} / ${tallaSeleccionada} agregado al carrito`);
              }
            }}
          >
            {!colorSeleccionado || !tallaSeleccionada ? 'Selecciona color y talla' : 'Agregar al carrito'}
          </button>

          <a
            href={`https://wa.me/51968267313?text=Hola, me interesa el producto ${nombreModelo}`}
            target="_blank"
            rel="noopener"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontFamily: 'var(--font-body)',
              fontSize: '0.85rem',
              letterSpacing: '0.1em',
              color: 'var(--gris)',
              textDecoration: 'none',
              justifyContent: 'center',
              padding: '0.75rem',
              border: '1px solid var(--gris-claro)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.target.style.borderColor = '#25D366'; e.target.style.color = '#25D366'; }}
            onMouseLeave={e => { e.target.style.borderColor = 'var(--gris-claro)'; e.target.style.color = 'var(--gris)'; }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
            </svg>
            Consultar por WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import ProductoCard from '../components/ProductoCard';

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

    // Un producto por modelo
    const modelosMap = new Map();
    for (const p of data) {
      if (!modelosMap.has(p.cod_modelo)) {
        modelosMap.set(p.cod_modelo, p);
      }
    }
    const productosUnicos = Array.from(modelosMap.values());

    // Fotos principales de tabla modelos
    const codModelos = productosUnicos.map(p => p.cod_modelo);
    const { data: fotosData } = await supabase
  .from('modelos')
  .select('cod_modelo, foto_principal, orden')
  .in('cod_modelo', codModelos);

    const fotosMap = {};
    if (fotosData) fotosData.forEach(f => {
  fotosMap[f.cod_modelo] = f.foto_principal;
  fotosMap[f.cod_modelo + '_orden'] = f.orden ?? 999;
});

    const coloresPorModelo = {};
  for (const p of data) {
    if (!coloresPorModelo[p.cod_modelo]) coloresPorModelo[p.cod_modelo] = new Set();
    coloresPorModelo[p.cod_modelo].add(p.cod_color);
  }

  const productosConFoto = productosUnicos
  .filter(p => fotosMap[p.cod_modelo] != null)
  .map(p => ({
    ...p,
    foto_principal: fotosMap[p.cod_modelo],
    totalColores: coloresPorModelo[p.cod_modelo]?.size || 1,
    colorAlt: [...(coloresPorModelo[p.cod_modelo] || [])].find(c => c !== fotosMap[p.cod_modelo]) || null,
    orden: fotosMap[p.cod_modelo + '_orden'] ?? 999,
  }))
  .sort((a, b) => a.orden - b.orden);

    setProductos(productosConFoto);
    setLoading(false);
  }

  return (
    <div className="catalogo-page">
      <header className="wrap catalogo-cabecera">
        <div>
          <h1 className="t-display catalogo-titulo">Catálogo</h1>
          <p className="catalogo-intro">Polos de caballero confeccionados en nuestro taller de Gamarra.</p>
        </div>
        <p className="catalogo-conteo" aria-live="polite">
          {loading ? 'Cargando modelos…' : `${productos.length} ${productos.length === 1 ? 'modelo disponible' : 'modelos disponibles'}${tallaFiltro ? ` en talla ${tallaFiltro}` : ''}`}
        </p>
      </header>

      <div className="catalogo-barra">
        <div className="wrap catalogo-barra-inner">
          <div className="tallas-filtro" role="group" aria-label="Filtrar por talla">
            <span className="tallas-filtro-label">Tu talla</span>
            {TALLAS.map(t => (
              <button
                key={t}
                className={`filtro-btn ${tallaFiltro === t ? 'active' : ''}`}
                aria-pressed={tallaFiltro === t}
                onClick={() => setTallaFiltro(tallaFiltro === t ? null : t)}
              >
                {t}
              </button>
            ))}
          </div>
          <p className="catalogo-aviso">
            {tallaFiltro
              ? <>Precios de la talla <strong>{tallaFiltro}</strong>. <Link href="/guia-de-tallas" className="link-subrayado">Ver medidas</Link></>
              : 'El precio varía según la talla. Elige la tuya para ver el precio exacto.'}
          </p>
        </div>
      </div>

      <div className="wrap catalogo-grid-wrap">
        {loading ? (
          <div className="productos-grid">
            {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : productos.length === 0 ? (
          <div className="vacio">
            <p>No hay modelos disponibles en talla {tallaFiltro} por ahora.</p>
            <button className="btn btn-linea" onClick={() => setTallaFiltro(null)}>Ver todas las tallas</button>
          </div>
        ) : (
          <div className="productos-grid">
            {productos.map((p, i) => (
              <ProductoCard
                key={p.id}
                producto={p}
                priority={i < 2}
                indice={i}
                etiquetaPrecio={tallaFiltro ? `Talla ${tallaFiltro}` : 'Desde'}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div>
      <div className="producto-img-wrap skeleton" />
      <div className="skeleton" style={{ height: '0.95rem', marginBottom: '0.45rem', width: '80%' }} />
      <div className="skeleton" style={{ height: '0.8rem', width: '45%' }} />
    </div>
  );
}

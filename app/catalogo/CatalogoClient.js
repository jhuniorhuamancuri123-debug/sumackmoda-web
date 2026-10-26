'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';
import ProductoCard from '../components/ProductoCard';
import { CATEGORIAS, categoriasDe, nombreCategoria } from '../data/categorias';

const TALLAS = ['S', 'M', 'L', 'XL', 'XXL'];

export default function CatalogoPage() {
  const [productos, setProductos] = useState([]);
  const [tallaFiltro, setTallaFiltro] = useState('S');
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pedida = searchParams.get('categoria');
  const categoria = nombreCategoria(pedida) ? pedida : null;

  // Cuántos modelos hay en cada categoría (un modelo puede estar en dos)
  const conteo = {};
  for (const p of productos) for (const c of categoriasDe(p.cod_modelo)) conteo[c] = (conteo[c] || 0) + 1;
  const pestanas = CATEGORIAS.filter(c => conteo[c.slug] > 0 || c.slug === categoria);
  const visibles = categoria ? productos.filter(p => categoriasDe(p.cod_modelo).includes(categoria)) : productos;

  // En celular, la pestaña elegida se desliza a la vista
  useEffect(() => {
    if (loading) return;
    const tab = document.querySelector('.categoria-tab.activa');
    const fila = tab?.parentElement;
    if (tab && fila && fila.scrollWidth > fila.clientWidth) {
      fila.scrollTo({ left: tab.offsetLeft - (fila.clientWidth - tab.offsetWidth) / 2, behavior: 'smooth' });
    }
  }, [categoria, loading]);

  function elegirCategoria(slug) {
    router.replace(slug ? `/catalogo?categoria=${slug}` : '/catalogo', { scroll: false });
  }

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
          <h1 className="t-display catalogo-titulo">{categoria ? nombreCategoria(categoria) : 'Catálogo'}</h1>
          <p className="catalogo-intro">Polos de caballero confeccionados en nuestro propio taller.</p>
        </div>
        <p className="catalogo-conteo" aria-live="polite">
          {loading ? 'Cargando modelos…' : `${visibles.length} ${visibles.length === 1 ? 'modelo disponible' : 'modelos disponibles'}${tallaFiltro ? ` en talla ${tallaFiltro}` : ''}`}
        </p>
      </header>

      <div className="catalogo-barra">
        <nav className="wrap categorias-tabs" aria-label="Categorías">
          <button
            type="button"
            className={`categoria-tab ${!categoria ? 'activa' : ''}`}
            aria-current={!categoria ? 'page' : undefined}
            onClick={() => elegirCategoria(null)}
          >
            Todos{!loading && <span className="categoria-tab-n">{productos.length}</span>}
          </button>
          {pestanas.map(c => (
            <button
              key={c.slug}
              type="button"
              className={`categoria-tab ${categoria === c.slug ? 'activa' : ''}`}
              aria-current={categoria === c.slug ? 'page' : undefined}
              onClick={() => elegirCategoria(c.slug)}
            >
              {c.nombre}{!loading && <span className="categoria-tab-n">{conteo[c.slug] || 0}</span>}
            </button>
          ))}
        </nav>
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
        ) : visibles.length === 0 ? (
          <div className="vacio">
            <p>
              No hay modelos{categoria ? ` de ${nombreCategoria(categoria).toLowerCase()}` : ''} disponibles
              {tallaFiltro ? ` en talla ${tallaFiltro}` : ''} por ahora.
            </p>
            {tallaFiltro
              ? <button className="btn btn-linea" onClick={() => setTallaFiltro(null)}>Ver todas las tallas</button>
              : <button className="btn btn-linea" onClick={() => elegirCategoria(null)}>Ver todos los modelos</button>}
          </div>
        ) : (
          <div className="productos-grid">
            {visibles.map((p, i) => (
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

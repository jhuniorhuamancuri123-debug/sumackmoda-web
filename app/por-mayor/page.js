import { supabase } from '../lib/supabase';
import { nombreComercial } from '../lib/nombreModelo';
import { categoriasDe } from '../data/categorias';
import { WHATSAPP, TIENDAS, GALERIA, MAPA, DIRECCION_CORTA, STANDS } from '../data/marca';
import PorMayorCatalogo, { BotonMayorista } from './PorMayorCatalogo';

const MINIMO_MAYORISTA = 12;
const BASE = 'https://sumackmoda.com';
const ORDEN_TALLAS = ['S', 'M', 'L', 'XL', 'XXL'];

// Se actualiza cada hora (modelos y colores vienen del sync con Alegra)
export const revalidate = 3600;

export const metadata = {
  title: 'Polos por mayor en Gamarra, directo de fábrica | SUMACK',
  description: `Compra polos para hombre por mayor desde ${MINIMO_MAYORISTA} unidades, directo de nuestro taller en Gamarra: camiseros, cuello chino, cuello V, manga larga, poleras y casacas. Envíos a todo el Perú.`,
  alternates: { canonical: `${BASE}/por-mayor` },
  openGraph: {
    title: 'Polos por mayor en Gamarra | SUMACK',
    description: `Directo de fábrica, desde ${MINIMO_MAYORISTA} unidades. Envíos a todo el Perú.`,
    url: `${BASE}/por-mayor`,
    images: [{ url: `${BASE}/og-image.jpg` }],
  },
};

// Lee todas las filas (Supabase entrega máximo 1000 por consulta)
async function todasLasFilas(tabla, columnas) {
  const filas = [];
  for (let desde = 0; desde < 20000; desde += 1000) {
    const { data, error } = await supabase.from(tabla).select(columnas).range(desde, desde + 999);
    if (error) throw error;
    filas.push(...(data || []));
    if (!data || data.length < 1000) break;
  }
  return filas;
}

async function cargarModelos() {
  try {
    const [productos, modelos] = await Promise.all([
      todasLasFilas('productos', 'cod_modelo, cod_color, cod_talla, nombre, precio, stock'),
      todasLasFilas('modelos', 'cod_modelo, foto_principal, orden, descripcion'),
    ]);
    const infoModelo = new Map(modelos.map((m) => [m.cod_modelo, m]));
    const porModelo = new Map();

    for (const p of productos) {
      const m = infoModelo.get(p.cod_modelo);
      if (!m || !m.foto_principal) continue; // sin foto no se muestra (igual que el catálogo)
      if (!porModelo.has(p.cod_modelo)) {
        porModelo.set(p.cod_modelo, {
          nombreAlegra: p.nombre?.split(' / ')[0]?.trim() || p.cod_modelo,
          colores: new Map(),
          tallas: new Set(),
          precios: [],
          stock: 0,
        });
      }
      const g = porModelo.get(p.cod_modelo);
      const color = p.nombre?.split(' / ')[1]?.trim();
      if (color && !g.colores.has(p.cod_color)) g.colores.set(p.cod_color, color);
      if (ORDEN_TALLAS.includes(p.cod_talla)) g.tallas.add(p.cod_talla); // tallas "-" = deshabilitadas
      if (Number(p.precio) > 0) g.precios.push(Number(p.precio));
      g.stock += Math.max(0, Number(p.stock) || 0);
    }

    return [...porModelo].map(([cod, g]) => {
      const m = infoModelo.get(cod);
      const { nombreSEO } = nombreComercial(g.nombreAlegra, m.descripcion);
      const tallas = ORDEN_TALLAS.filter((t) => g.tallas.has(t));
      return {
        cod,
        nombre: nombreSEO,
        foto: m.foto_principal,
        orden: m.orden ?? 999,
        colores: [...g.colores.values()],
        tallas: tallas.length ? `${tallas[0]}${tallas.length > 1 ? ` a ${tallas[tallas.length - 1]}` : ''}` : '',
        precioMin: g.precios.length ? Math.min(...g.precios) : null,
        precioMax: g.precios.length ? Math.max(...g.precios) : null,
        enStock: g.stock > 0,
        categorias: categoriasDe(cod),
      };
    }).sort((a, b) => a.orden - b.orden || a.cod.localeCompare(b.cod));
  } catch (e) {
    console.error('por mayor:', e?.message);
    return [];
  }
}

const PASOS = [
  { n: '01', t: 'Elige tus modelos', d: 'Pulsa "Hacer pedido mayorista" en cada modelo que te interese.' },
  { n: '02', t: 'Te cotizamos por WhatsApp', d: 'Te enviamos precios por mayor, colores y tallas disponibles.' },
  { n: '03', t: 'Confirmas y enviamos', d: 'Despachamos a todo el Perú o recoges tu pedido en nuestras tiendas de Gamarra.' },
];

const PREGUNTAS = [
  {
    p: '¿Cuál es el pedido mínimo por mayor?',
    r: `El precio mayorista aplica desde ${MINIMO_MAYORISTA} unidades. Escríbenos por WhatsApp y te cotizamos según cantidades, modelos y colores.`,
  },
  {
    p: '¿Pueden fabricar un modelo que no tienen en stock?',
    r: 'Sí. Somos fabricantes: para pedidos importantes evaluamos producir el modelo, color y tallas que necesitas, y te confirmamos el plazo antes de aceptar el pedido.',
  },
  {
    p: '¿Hacen envíos a provincias?',
    r: 'Sí, enviamos a todo el Perú por agencia (Shalom u otras según tu destino). En Lima también puedes recoger en tienda.',
  },
  {
    p: '¿Puedo ver las prendas antes de comprar?',
    r: `Claro. Visítanos en ${DIRECCION_CORTA}: ${STANDS}.`,
  },
];

export default async function PorMayorPage() {
  const modelos = await cargarModelos();
  const mensajeGeneral = `Hola SUMACK 👋 Quiero información para hacer un *pedido por mayor* (desde ${MINIMO_MAYORISTA} unidades). ¿Me podrían enviar su catálogo mayorista con precios?`;

  return (
    <div className="catalogo-page mayor-page">
      <header className="wrap catalogo-cabecera mayor-cabecera">
        <div>
          <p className="mayor-eyebrow">Venta mayorista · Directo de fábrica</p>
          <h1 className="t-display catalogo-titulo">Polos por mayor en Gamarra</h1>
          <p className="catalogo-intro">
            Compra directo de nuestro taller, sin intermediarios. Precios por mayor desde{' '}
            <strong>{MINIMO_MAYORISTA} unidades</strong> y envíos a todo el Perú.
          </p>
        </div>
        <BotonMayorista
          href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(mensajeGeneral)}`}
          className="btn btn-wa mayor-cta-general"
          evento={{ cod: 'GENERAL', nombre: 'Consulta mayorista general' }}
        >
          Cotizar por WhatsApp
        </BotonMayorista>
      </header>

      <section className="wrap mayor-pasos" aria-label="Cómo comprar por mayor">
        {PASOS.map((p) => (
          <div key={p.n} className="mayor-paso">
            <span className="mayor-paso-n">{p.n}</span>
            <h2>{p.t}</h2>
            <p>{p.d}</p>
          </div>
        ))}
      </section>

      <PorMayorCatalogo modelos={modelos} minimo={MINIMO_MAYORISTA} />

      <section className="seccion seccion-piedra">
        <div className="wrap mayor-info">
          <div>
            <h2 className="t-titulo">Preguntas frecuentes</h2>
            <dl className="mayor-faq">
              {PREGUNTAS.map((q) => (
                <div key={q.p}>
                  <dt>{q.p}</dt>
                  <dd>{q.r}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="mayor-tiendas">
            <h2 className="t-titulo">Visítanos en Gamarra</h2>
            <p>{GALERIA.nombre}<br />{GALERIA.calle}, {GALERIA.distrito}, {GALERIA.ciudad}</p>
            <ul>
              {TIENDAS.map((t) => <li key={t.stand}>{t.piso} · {t.stand}</li>)}
            </ul>
            <a href={MAPA} target="_blank" rel="noopener" className="btn btn-linea">Ver en Google Maps</a>
          </div>
        </div>
      </section>
    </div>
  );
}

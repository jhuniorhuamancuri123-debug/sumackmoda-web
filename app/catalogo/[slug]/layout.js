// Parte de servidor de la ficha de producto (SEO).
// page.js sigue siendo 'use client'; aquí sólo se generan título, descripción,
// URL canónica, Open Graph y el schema Product que Google lee en el HTML inicial.
import { cache } from 'react';
import { supabase } from '../../lib/supabase';
import { nombreComercial } from '../../lib/nombreModelo';

const BASE = 'https://sumackmoda.com';
const R2 = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL;

// Se actualiza cada hora (precios y stock vienen del sync con Alegra)
export const revalidate = 3600;

const cargarModelo = cache(async (slug) => {
  const cod = decodeURIComponent(slug).toUpperCase();
  try {
    const [{ data: items }, { data: modelo }, { data: imgs }] = await Promise.all([
      supabase.from('productos').select('cod_color, nombre, precio').eq('cod_modelo', cod).gt('stock', 0),
      supabase.from('modelos').select('descripcion').eq('cod_modelo', cod).maybeSingle(),
      supabase.from('imagenes').select('cod_color').eq('cod_modelo', cod).eq('tiene_foto', true),
    ]);
    if (!items || items.length === 0) return { cod, existe: false };

    const nombre = items[0].nombre?.split(' / ')[0]?.trim() || cod;
    const conFoto = new Set((imgs || []).map((i) => i.cod_color));
    const colores = [];
    const vistos = new Set();
    for (const it of items) {
      if (vistos.has(it.cod_color) || !conFoto.has(it.cod_color)) continue;
      vistos.add(it.cod_color);
      colores.push({ cod: it.cod_color, nombre: it.nombre?.split(' / ')[1]?.trim() || it.cod_color });
    }
    const precios = items.map((i) => Number(i.precio)).filter((p) => p > 0);
    const imagenes = R2 ? colores.map((c) => `${R2}/${cod}/${c.cod}.webp`) : [];

    const { tipo, nombreSEO, descripcion: descCompleta } = nombreComercial(nombre, modelo?.descripcion);

    return {
      cod,
      existe: colores.length > 0,
      nombre,
      nombreSEO,
      tipo,
      descripcion: descCompleta,
      colores,
      imagenes,
      precioMin: precios.length ? Math.min(...precios) : null,
      precioMax: precios.length ? Math.max(...precios) : null,
    };
  } catch (e) {
    console.error('ficha SEO:', e?.message);
    return { cod, existe: false, error: true };
  }
});

function textoDescripcion(m) {
  const colores = m.colores.map((c) => c.nombre).join(', ');
  const base = m.descripcion
    || `${m.nombre} de SUMACK, marca peruana de polos para hombre fabricados en Gamarra.`;
  const extra = [
    m.precioMin ? `Desde S/ ${m.precioMin.toFixed(2)}.` : '',
    colores ? `Colores: ${colores}.` : '',
    'Envíos a todo el Perú.',
  ].filter(Boolean).join(' ');
  const t = `${base} ${extra}`.replace(/\s+/g, ' ').trim();
  return t.length > 160 ? `${t.slice(0, 157).trimEnd()}…` : t;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const m = await cargarModelo(slug);
  const canonical = `${BASE}/catalogo/${encodeURIComponent(m.cod)}`;

  if (!m.existe) {
    return {
      title: 'Producto no disponible | SUMACK',
      alternates: { canonical },
      // Sin stock: que Google no la muestre (pero si hubo error de conexión, no la bloqueamos)
      robots: m.error ? undefined : { index: false, follow: true },
    };
  }

  const publico = /\b(dama|mujer)\b/i.test(m.nombreSEO) ? 'para mujer' : 'para hombre';
  const titulo = `${m.nombreSEO} ${publico} | SUMACK`;
  const descripcion = textoDescripcion(m);

  return {
    title: titulo,
    description: descripcion,
    alternates: { canonical },
    openGraph: {
      type: 'website',
      url: canonical,
      title: titulo,
      description: descripcion,
      siteName: 'SUMACK',
      locale: 'es_PE',
      images: m.imagenes.slice(0, 4).map((url) => ({ url, alt: m.nombreSEO })),
    },
    twitter: {
      card: 'summary_large_image',
      title: titulo,
      description: descripcion,
      images: m.imagenes.slice(0, 1),
    },
  };
}

export default async function FichaLayout({ children, params }) {
  const { slug } = await params;
  const m = await cargarModelo(slug);

  let schema = null;
  if (m.existe && m.precioMin) {
    const url = `${BASE}/catalogo/${encodeURIComponent(m.cod)}`;
    schema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: m.nombreSEO,
      sku: m.cod,
      url,
      image: m.imagenes,
      description: textoDescripcion(m),
      brand: { '@type': 'Brand', name: 'SUMACK' },
      color: m.colores.map((c) => c.nombre).join(', ') || undefined,
      offers: {
        '@type': 'AggregateOffer',
        priceCurrency: 'PEN',
        lowPrice: m.precioMin.toFixed(2),
        highPrice: m.precioMax.toFixed(2),
        offerCount: m.colores.length,
        availability: 'https://schema.org/InStock',
        itemCondition: 'https://schema.org/NewCondition',
        url,
        seller: { '@type': 'Organization', name: 'SUMACK' },
      },
    };
  }

  return (
    <>
      {schema && (
        <script
          type="application/ld+json"
          // < escapado para que un texto de la descripción no pueda cerrar la etiqueta
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }}
        />
      )}
      {children}
    </>
  );
}

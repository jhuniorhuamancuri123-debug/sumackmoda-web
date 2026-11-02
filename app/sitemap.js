import { supabase } from './lib/supabase';

const BASE = 'https://sumackmoda.com';

// Se regenera cada 6 horas (mismo ritmo que el sync con Alegra)
export const revalidate = 21600;

export default async function sitemap() {
  const ahora = new Date();

  const fijas = [
    { url: BASE, lastModified: ahora, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE}/catalogo`, lastModified: ahora, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/por-mayor`, lastModified: ahora, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/guia-de-tallas`, lastModified: ahora, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/contacto`, lastModified: ahora, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/politica-devoluciones`, lastModified: ahora, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/terminos`, lastModified: ahora, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/privacidad`, lastModified: ahora, changeFrequency: 'yearly', priority: 0.3 },
  ];

  // Fichas de producto: sólo modelos con stock (las mismas que se ven en el catálogo)
  let fichas = [];
  try {
    const { data, error } = await supabase
      .from('productos')
      .select('cod_modelo, ultima_sync')
      .gt('stock', 0)
      .limit(10000);
    if (error) throw error;

    const modelos = new Map();
    for (const p of data || []) {
      if (!p.cod_modelo) continue;
      const fecha = p.ultima_sync ? new Date(p.ultima_sync) : ahora;
      const previa = modelos.get(p.cod_modelo);
      if (!previa || fecha > previa) modelos.set(p.cod_modelo, fecha);
    }

    fichas = [...modelos].map(([cod, fecha]) => ({
      url: `${BASE}/catalogo/${encodeURIComponent(cod)}`,
      lastModified: fecha,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));
  } catch (e) {
    console.error('sitemap: no se pudieron leer productos', e?.message);
  }

  return [...fijas, ...fichas];
}

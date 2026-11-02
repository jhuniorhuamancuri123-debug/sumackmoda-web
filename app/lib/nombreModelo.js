// Nombre comercial de un modelo, usado en Google (ficha) y en la página por mayor.
// La descripción de Supabase empieza con el tipo de prenda: "Polo Cuello Chino — 100% Algodón ...".
// Si el nombre de Alegra ya comparte una palabra con el tipo (NERU FIRMA → "Polo Cuello Chino Firma")
// o viene abreviado (ESTAMP.), se usa sólo el tipo. Si no (NERU), se agrega: "Polo Cuello Chino Neru".
export function nombreComercial(nombreAlegra, descripcion) {
  const nombre = (nombreAlegra || '').trim();
  const descCompleta = (descripcion || '').trim();
  const partes = descCompleta.split(/\s+[—–-]\s+/);
  const tipo = partes.length > 1 && partes[0].length <= 40 ? partes[0].trim() : '';

  const norm = (t) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
  const palabrasTipo = norm(tipo).split(/[^A-Z0-9]+/).filter(Boolean);
  const palabrasNombre = norm(nombre).split(/[^A-Z0-9]+/).filter((w) => w.length >= 2);
  const comparte = palabrasNombre.some((w) => palabrasTipo.some((t) => t.startsWith(w)));
  const abreviado = /[.\/(]/.test(nombre);
  const nombreBonito = nombre.toLowerCase().replace(/(^|\s)\S/g, (c) => c.toUpperCase());

  const nombreSEO = tipo ? (comparte || abreviado ? tipo : `${tipo} ${nombreBonito}`) : nombreBonito;
  return { tipo, nombreSEO, descripcion: descCompleta };
}

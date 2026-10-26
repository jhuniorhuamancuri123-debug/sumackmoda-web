// Categorías del catálogo.
// Origen: Excel CREAR_ITEMS_v2.xlsx, hojas MODELOS_ENTERO y MODELOS_BICOLOR, columnas CAT 1 y CAT 2.
// Un modelo con CAT 2 aparece en las dos pestañas. Al crear un modelo nuevo, agrégalo aquí.
// Las pestañas sin modelos en stock no se muestran.

export const CATEGORIAS = [
  { slug: 'polo', nombre: 'Polos' },
  { slug: 'camisero', nombre: 'Camiseros' },
  { slug: 'cuello-chino', nombre: 'Cuello chino' },
  { slug: 'manga-larga', nombre: 'Manga larga' },
  { slug: 'polera', nombre: 'Poleras' },
  { slug: 'casaca', nombre: 'Casacas' },
  { slug: 'buzo', nombre: 'Buzos' },
  { slug: 'biviri', nombre: 'Biviris' },
  { slug: 'short', nombre: 'Shorts' },
  { slug: 'dama', nombre: 'Dama' },
];

export const CATEGORIAS_MODELO = {
  M002: ['polo'],
  M003: ['polo'],
  M004: ['cuello-chino', 'polo'],
  M005: ['manga-larga', 'cuello-chino'],
  M006: ['camisero'],
  M007: ['manga-larga'],
  M008: ['manga-larga'],
  M009: ['manga-larga'],
  M010: ['polo'],
  M011: ['camisero'],
  M012: ['polo'],
  M013: ['camisero'],
  M014: ['camisero'],
  M015: ['polo'],
  M016: ['polo'],
  M017: ['camisero'],
  M018: ['polo'],
  M019: ['polo'],
  M020: ['camisero'],
  M021: ['camisero'],
  M022: ['camisero'],
  M023: ['polo'],
  M024: ['polo'],
  M025: ['camisero', 'dama'],
  M026: ['manga-larga', 'camisero'],
  M027: ['biviri'],
  M028: ['manga-larga', 'cuello-chino'],
  M029: ['biviri'],
  M030: ['polo'],
  M031: ['polo'],
  M032: ['polo'],
  M033: ['polo'],
  M034: ['polo'],
  M035: ['polo'],
  M036: ['cuello-chino'],
  M037: ['cuello-chino'],
  M038: ['polera'],
  M039: ['casaca'],
  M040: ['polera'],
  M041: ['polo'],
  M043: ['camisero'],
  M044: ['camisero'],
  M045: ['polo'],
  M046: ['polo'],
  M047: ['buzo'],
  M048: ['cuello-chino'],
  M049: ['camisero'],
  M050: ['casaca'],
  M051: ['short'],
  M052: ['cuello-chino'],
  M053: ['camisero'],
  M054: ['buzo'],
  M055: ['polo'],
  M056: ['polo'],
  M057: ['camisero'],
};

export function categoriasDe(codModelo) {
  return CATEGORIAS_MODELO[codModelo] || [];
}

export function nombreCategoria(slug) {
  return CATEGORIAS.find(c => c.slug === slug)?.nombre || null;
}

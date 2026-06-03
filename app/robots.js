export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/inicio',
          '/catalogo',
          '/guia-de-tallas',
          '/contacto',
        ],
        disallow: [
          '/api',
          '/checkout',
          '/envios-registro',
          '/context',
          '/lib',
        ],
      },
    ],
    sitemap: 'https://sumackmoda.com/sitemap.xml',
  };
}

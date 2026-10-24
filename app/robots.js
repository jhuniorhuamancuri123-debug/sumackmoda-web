export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/catalogo',
          '/guia-de-tallas',
          '/contacto',
        ],
        disallow: [
          '/api',
          '/checkout',
          '/envios-registro',
          '/envios-ventas',
          '/context',
          '/lib',
        ],
      },
    ],
    sitemap: 'https://sumackmoda.com/sitemap.xml',
  };
}

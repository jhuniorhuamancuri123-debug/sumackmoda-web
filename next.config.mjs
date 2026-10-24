/** @type {import('next').NextConfig} */

// Encabezados de seguridad para todas las páginas
const encabezadosSeguridad = [
  // Obliga a usar siempre HTTPS (2 años)
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
  // Impide que otros sitios metan tu web dentro de la suya (clickjacking)
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Content-Security-Policy', value: "frame-ancestors 'self'" },
  // Evita que el navegador "adivine" el tipo de archivo
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // No envía la URL completa a otros sitios
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Bloquea cámara, micrófono y ubicación: la tienda no los usa
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
];

const nextConfig = {
  // Solo en modo prueba (npm run dev): permite abrir la web desde el celular en el mismo WiFi
  allowedDevOrigins: ['192.168.1.119'],
  poweredByHeader: false,
  async headers() {
    return [{ source: '/:path*', headers: encabezadosSeguridad }];
  },
};

export default nextConfig;

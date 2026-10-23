/** @type {import('next').NextConfig} */
const nextConfig = {
  // Solo en modo prueba (npm run dev): permite abrir la web desde el celular en el mismo WiFi
  allowedDevOrigins: ['192.168.1.119'],
};

export default nextConfig;

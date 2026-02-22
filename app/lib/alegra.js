import axios from 'axios';

function getAlegraClient() {
  const email = process.env.ALEGRA_EMAIL;
  const token_raw = process.env.ALEGRA_TOKEN;
  const token = Buffer.from(`${email}:${token_raw}`).toString('base64');
  
  return axios.create({
    baseURL: 'https://app.alegra.com/api/v1',
    headers: {
      'Authorization': `Basic ${token}`,
      'Content-Type': 'application/json',
    },
  });
}

// Exportar el cliente para compatibilidad con debug/route.js y sync/route.js
export const alegraClient = getAlegraClient();

export async function getItems() {
  const client = getAlegraClient();
  const response = await client.get('/items?limit=30');
  return response.data;
}

export function parseCodigo(codigo) {
  if (!codigo || codigo.length < 8) return null;
  return {
    cod_modelo: codigo.substring(0, 4),
    cod_color: codigo.substring(4, 7),
    cod_talla: codigo.substring(7),
  };
}
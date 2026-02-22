import axios from 'axios';

const ALEGRA_EMAIL = process.env.ALEGRA_EMAIL;
const ALEGRA_TOKEN = process.env.ALEGRA_TOKEN;

const token = Buffer.from(`${ALEGRA_EMAIL}:${ALEGRA_TOKEN}`).toString('base64');

export const alegraClient = axios.create({
  baseURL: 'https://app.alegra.com/api/v1',
  headers: {
    'Authorization': `Basic ${token}`,
    'Content-Type': 'application/json',
  },
});

// Trae todos los items de Alegra
export async function getItems() {
  const response = await alegraClient.get('/items?limit=30');
  return response.data;
}

// Parser del código: M015I21L → { cod_modelo, cod_color, cod_talla }
export function parseCodigo(codigo) {
  if (!codigo || codigo.length < 8) return null;
  return {
    cod_modelo: codigo.substring(0, 4),
    cod_color: codigo.substring(4, 7),
    cod_talla: codigo.substring(7),
  };
}
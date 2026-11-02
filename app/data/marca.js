// Datos de la marca usados en varias páginas
export const WHATSAPP = '51968267313';
export const WHATSAPP_VISIBLE = '+51 968 267 313';
export const INSTAGRAM = 'https://www.instagram.com/sumackmoda/';
export const TIKTOK = 'https://www.tiktok.com/@sumackmoda?lang=es-419';
export const HORARIO = 'Lunes a sábado, 9:00 a 19:00';

// Tiendas físicas. Para abrir una nueva, agrega un elemento aquí: se actualizan
// el inicio, el pie de página, contacto, por mayor y los datos para Google.
export const GALERIA = {
  nombre: 'Galería Guizado',
  calle: 'Agustín Gamarra 655',
  distrito: 'La Victoria',
  ciudad: 'Lima',
  codigoPostal: '15018',
  lat: -12.064964,
  lng: -77.013508,
};
export const MAPA = `https://www.google.com/maps/search/?api=1&query=${GALERIA.lat},${GALERIA.lng}`;
export const TIENDAS = [
  { nombre: 'Tienda 6.º piso', piso: '6.º piso', stand: 'Stand I-611' },
  { nombre: 'Tienda 9.º piso', piso: '9.º piso', stand: 'Stand E-902' },
];
export const DIRECCION_CORTA = `${GALERIA.nombre}, ${GALERIA.calle}, ${GALERIA.distrito}`;
export const STANDS = TIENDAS.map(t => `${t.piso} ${t.stand}`).join(' y ');

// Lo que aparece en la cinta móvil del inicio: sólo afirmaciones verificables
export const GARANTIAS = [
  'Producción propia',
  'Envíos a todo el Perú',
  'Tallas S a XXL con medidas publicadas',
  'Pedido directo por WhatsApp',
  'Cambios dentro de 4 días',
  'Tiendas en Gamarra, Galería Guizado',
];

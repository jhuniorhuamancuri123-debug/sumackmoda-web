// Utilidades de seguridad para las rutas /api (sólo se usan en el servidor)
import { timingSafeEqual } from 'crypto';

// Compara dos textos sin filtrar información por el tiempo de respuesta
export function igualSeguro(a, b) {
  const A = Buffer.from(String(a ?? ''));
  const B = Buffer.from(String(b ?? ''));
  if (A.length === 0 || A.length !== B.length) return false;
  return timingSafeEqual(A, B);
}

// Rutas internas (sincronización con Alegra): exigen el encabezado
// Authorization: Bearer <SYNC_SECRET>. Sin SYNC_SECRET configurado, nadie entra.
export function autorizadoInterno(request) {
  const secreto = (process.env.SYNC_SECRET || '').trim();
  if (!secreto) return false;
  const h = request.headers.get('authorization') || '';
  const token = h.startsWith('Bearer ') ? h.slice(7).trim() : '';
  return igualSeguro(token, secreto);
}

export function noAutorizado() {
  return Response.json({ success: false, error: 'No autorizado' }, { status: 401 });
}

export function ipDe(request) {
  return (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'desconocida';
}

// Límite de peticiones en memoria (por instancia del servidor).
// No es infalible en Vercel, pero frena abusos simples y repetitivos.
const contadores = new Map();
export function dentroDelLimite(clave, max, ventanaMs) {
  const ahora = Date.now();
  let r = contadores.get(clave);
  if (!r || ahora > r.reset) {
    r = { n: 0, reset: ahora + ventanaMs };
    contadores.set(clave, r);
  }
  r.n++;
  if (contadores.size > 5000) {
    for (const [k, v] of contadores) if (ahora > v.reset) contadores.delete(k);
  }
  return r.n <= max;
}

// Rechaza peticiones hechas desde otros sitios web (el navegador envía "Origin")
export function origenPermitido(request) {
  const origin = request.headers.get('origin');
  if (!origin) return true; // peticiones sin navegador: se controlan con el límite y la validación
  try {
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || '';
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

// Validación de los datos de eventos de Meta / TikTok
const EVENTOS_PERMITIDOS = new Set([
  'PageView', 'ViewContent', 'AddToCart', 'InitiateCheckout', 'Contact',
  'Lead', 'Purchase', 'Search', 'AddPaymentInfo', 'CompleteRegistration',
  'ClickButton', 'PlaceAnOrder', 'CompletePayment', 'SubmitForm',
]);

export function eventoValido(body) {
  if (!body || typeof body !== 'object') return false;
  const { eventName, eventId, eventData } = body;
  if (!EVENTOS_PERMITIDOS.has(eventName)) return false;
  if (eventId != null && (typeof eventId !== 'string' || eventId.length > 120)) return false;
  if (!eventData || typeof eventData !== 'object') return false;
  const d = eventData;
  if (d.url != null && (typeof d.url !== 'string' || d.url.length > 600)) return false;
  if (d.content_ids != null) {
    if (!Array.isArray(d.content_ids) || d.content_ids.length > 50) return false;
    if (!d.content_ids.every(x => typeof x === 'string' && x.length <= 80)) return false;
  }
  if (d.value != null) {
    const v = Number(d.value);
    if (!Number.isFinite(v) || v < 0 || v > 100000) return false;
  }
  if (d.content_name != null && (typeof d.content_name !== 'string' || d.content_name.length > 200)) return false;
  if (d.num_items != null) {
    const n = Number(d.num_items);
    if (!Number.isFinite(n) || n < 0 || n > 1000) return false;
  }
  for (const k of ['fbc', 'fbp', 'phone', 'content_type']) {
    if (d[k] != null && (typeof d[k] !== 'string' || d[k].length > 300)) return false;
  }
  return true;
}

// Filtro común para /api/meta-events y /api/tiktok-events.
// Devuelve una respuesta de error, o null si la petición es aceptable.
export function filtrarEvento(request, body) {
  if (!origenPermitido(request)) {
    return Response.json({ success: false, error: 'Origen no permitido' }, { status: 403 });
  }
  if (!dentroDelLimite('ev:' + ipDe(request), 120, 60_000)) {
    return Response.json({ success: false, error: 'Demasiadas solicitudes' }, { status: 429 });
  }
  if (!eventoValido(body)) {
    return Response.json({ success: false, error: 'Evento no válido' }, { status: 400 });
  }
  return null;
}

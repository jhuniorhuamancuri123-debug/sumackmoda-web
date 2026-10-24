// Verificación de la clave de vendedoras (VENTAS_PIN en Vercel).
// Comparación en tiempo constante y bloqueo temporal tras varios intentos fallidos por IP.
import { igualSeguro, ipDe } from "../../lib/seguridad";

const MAX_FALLOS = 8;
const VENTANA_MS = 15 * 60 * 1000; // 15 minutos
const fallos = new Map();

export function pinValido(req) {
  const esperado = (process.env.VENTAS_PIN || "").trim();
  if (!esperado) return false; // sin PIN configurado nadie entra

  const ip = ipDe(req);
  const ahora = Date.now();
  let r = fallos.get(ip);
  if (r && ahora > r.reset) { fallos.delete(ip); r = null; }
  if (r && r.n >= MAX_FALLOS) return false; // bloqueado temporalmente

  const enviado = (req.headers.get("x-ventas-pin") || "").trim();
  const ok = igualSeguro(enviado, esperado);
  if (!ok) {
    const reg = r || { n: 0, reset: ahora + VENTANA_MS };
    reg.n++;
    fallos.set(ip, reg);
  }
  return ok;
}

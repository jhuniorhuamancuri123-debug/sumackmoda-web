// Verificación de la clave de vendedoras (VENTAS_PIN en Vercel).
export function pinValido(req) {
  const esperado = (process.env.VENTAS_PIN || "").trim();
  if (!esperado) return false; // sin PIN configurado nadie entra
  const enviado = (req.headers.get("x-ventas-pin") || "").trim();
  return enviado === esperado;
}

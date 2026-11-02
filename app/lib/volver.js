'use client';
// Recordar dónde estaba el cliente al abrir un modelo, para que "Volver" (o el botón
// atrás del navegador/celular) lo deje en el mismo punto del catálogo.
const CLAVE = 'sumack-volver';
let ultimoAtras = 0;
if (typeof window !== 'undefined') {
  window.addEventListener('popstate', () => { ultimoAtras = Date.now(); });
}

// Se llama al tocar una tarjeta de producto
export function guardarPosicion() {
  try {
    sessionStorage.setItem(CLAVE, JSON.stringify({
      ruta: location.pathname + location.search,
      y: window.scrollY,
    }));
  } catch {}
}

export function hayPaginaAnterior() {
  try { return !!sessionStorage.getItem(CLAVE) && window.history.length > 1; } catch { return false; }
}

// Si el cliente acaba de volver (atrás) a esta misma página, devuelve la posición guardada
export function posicionAlVolver() {
  try {
    const s = JSON.parse(sessionStorage.getItem(CLAVE) || 'null');
    if (!s || Date.now() - ultimoAtras > 2000) return null;
    if (s.ruta !== location.pathname + location.search) return null;
    return s.y;
  } catch { return null; }
}

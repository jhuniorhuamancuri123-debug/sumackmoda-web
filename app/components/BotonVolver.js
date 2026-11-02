'use client';
import { useRouter } from 'next/navigation';
import { hayPaginaAnterior } from '../lib/volver';

// Vuelve a la página anterior (catálogo, inicio…) en el mismo punto.
// Si el cliente llegó directo (Google, WhatsApp), lo lleva al catálogo.
export default function BotonVolver() {
  const router = useRouter();
  return (
    <button
      type="button"
      className="boton-volver"
      onClick={() => (hayPaginaAnterior() ? router.back() : router.push('/catalogo'))}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
      Volver
    </button>
  );
}

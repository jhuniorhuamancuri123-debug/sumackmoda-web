'use client';
import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';

export default function BuscadorBtn() {
  const [abierto, setAbierto] = useState(false);
  const [query, setQuery] = useState('');
  const [resultados, setResultados] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const inputRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    if (abierto) setTimeout(() => inputRef.current?.focus(), 100);
    else { setQuery(''); setResultados([]); }
  }, [abierto]);

  useEffect(() => {
    if (!query.trim()) { setResultados([]); return; }
    const timer = setTimeout(() => buscar(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  async function buscar(q) {
    setBuscando(true);
    const texto = q.trim().toUpperCase();
    const { data } = await supabase
      .from('productos')
      .select('cod_modelo, nombre')
      .or(`cod_modelo.ilike.%${texto}%,nombre.ilike.%${q.trim()}%`)
      .gt('stock', 0)
      .limit(8);

    if (!data) { setResultados([]); setBuscando(false); return; }
    const vistos = new Set();
    const unicos = [];
    for (const p of data) {
      if (!vistos.has(p.cod_modelo)) {
        vistos.add(p.cod_modelo);
        unicos.push({ cod_modelo: p.cod_modelo, nombre: p.nombre.split(' / ')[0]?.trim() });
      }
    }
    setResultados(unicos);
    setBuscando(false);
  }

  function irAProducto(cod_modelo) {
    setAbierto(false);
    router.push(`/catalogo/${cod_modelo}`);
  }

  return (
    <>
      <button className="icon-btn" aria-label="Buscar" onClick={() => setAbierto(true)}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <circle cx="11" cy="11" r="7.5"/>
          <path d="m20.5 20.5-4-4"/>
        </svg>
      </button>

      <AnimatePresence>
        {abierto && (
          <motion.div className="buscador-velo" onClick={() => setAbierto(false)}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            <motion.div className="buscador" role="dialog" aria-modal="true" aria-label="Buscar modelos"
              onClick={e => e.stopPropagation()}
              initial={{ y: -16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -16, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
              <div className="buscador-campo">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gris-texto)" strokeWidth="1.6">
                  <circle cx="11" cy="11" r="7.5"/><path d="m20.5 20.5-4-4"/>
                </svg>
                <input
                  ref={inputRef}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Busca por modelo o código"
                  aria-label="Buscar por modelo o código"
                  onKeyDown={e => { if (e.key === 'Escape') setAbierto(false); if (e.key === 'Enter' && resultados.length > 0) irAProducto(resultados[0].cod_modelo); }}
                />
                <button className="icon-btn" aria-label="Cerrar buscador" onClick={() => setAbierto(false)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M5 5l14 14M19 5L5 19" /></svg>
                </button>
              </div>

              <div className="buscador-lista">
                {buscando && <p className="buscador-msg">Buscando…</p>}
                {!buscando && query && resultados.length === 0 && (
                  <p className="buscador-msg">No encontramos modelos para “{query}”. Prueba con otra palabra, por ejemplo “neru” o “piqué”.</p>
                )}
                {!buscando && resultados.map(r => (
                  <button key={r.cod_modelo} className="buscador-res" onClick={() => irAProducto(r.cod_modelo)}>
                    <div>
                      <p>{r.nombre.toLowerCase()}</p>
                      <p className="t-meta">Modelo {r.cod_modelo}</p>
                    </div>
                    <svg style={{ marginLeft: 'auto' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                  </button>
                ))}
                {!query && <p className="buscador-msg">Escribe el nombre o el código del modelo</p>}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

'use client';
import { useState, useEffect, useRef } from 'react';
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
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
      </button>

      {abierto && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',zIndex:300,backdropFilter:'blur(3px)',display:'flex',alignItems:'flex-start',justifyContent:'center',paddingTop:'10vh'}}
          onClick={() => setAbierto(false)}>
          <div style={{background:'var(--blanco)',width:'100%',maxWidth:'560px',margin:'0 1rem',boxShadow:'0 20px 60px rgba(0,0,0,0.3)'}}
            onClick={e => e.stopPropagation()}>
            <div style={{display:'flex',alignItems:'center',padding:'1.25rem 1.5rem',borderBottom:'1px solid var(--gris-claro)',gap:'1rem'}}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gris)" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Buscar por modelo o código..."
                style={{flex:1,border:'none',outline:'none',fontFamily:'var(--font-body)',fontSize:'1rem',background:'transparent',color:'var(--negro)'}}
                onKeyDown={e => { if (e.key === 'Escape') setAbierto(false); if (e.key === 'Enter' && resultados.length > 0) irAProducto(resultados[0].cod_modelo); }}
              />
              <button onClick={() => setAbierto(false)} style={{background:'none',border:'none',cursor:'pointer',fontSize:'1.4rem',color:'var(--gris)',lineHeight:1}}>×</button>
            </div>

            <div style={{maxHeight:'360px',overflowY:'auto'}}>
              {buscando && (
                <p style={{padding:'1.5rem',textAlign:'center',fontFamily:'var(--font-body)',fontSize:'0.85rem',color:'var(--gris)'}}>Buscando...</p>
              )}
              {!buscando && query && resultados.length === 0 && (
                <p style={{padding:'1.5rem',textAlign:'center',fontFamily:'var(--font-body)',fontSize:'0.85rem',color:'var(--gris)'}}>No se encontraron resultados para "{query}"</p>
              )}
              {!buscando && resultados.map(r => (
                <button key={r.cod_modelo} onClick={() => irAProducto(r.cod_modelo)}
                  style={{width:'100%',padding:'1rem 1.5rem',display:'flex',alignItems:'center',gap:'1rem',background:'none',border:'none',borderBottom:'1px solid var(--gris-claro)',cursor:'pointer',textAlign:'left',transition:'background 0.15s'}}
                  onMouseEnter={e => e.currentTarget.style.background='var(--crema)'}
                  onMouseLeave={e => e.currentTarget.style.background='none'}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gris)" strokeWidth="1.5">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                  <div>
                    <p style={{fontFamily:'var(--font-body)',fontSize:'0.9rem',fontWeight:600,color:'var(--negro)',marginBottom:'0.15rem'}}>{r.nombre}</p>
                    <p style={{fontFamily:'var(--font-body)',fontSize:'0.75rem',color:'var(--gris)',letterSpacing:'0.1em'}}>{r.cod_modelo}</p>
                  </div>
                  <svg style={{marginLeft:'auto'}} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gris)" strokeWidth="1.5">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>
              ))}
              {!query && (
                <p style={{padding:'1.5rem',textAlign:'center',fontFamily:'var(--font-body)',fontSize:'0.85rem',color:'var(--gris)'}}>Escribe el nombre o código del modelo</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import ProductoCard from './ProductoCard';

const CLAVE = 'sumack_vistos';
const R2 = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL;

// Guarda un modelo visto en este navegador (máximo 8, sin repetir)
export function registrarVisto(m) {
  try {
    const lista = JSON.parse(localStorage.getItem(CLAVE) || '[]').filter(x => x.cod_modelo !== m.cod_modelo);
    lista.unshift({ ...m, t: Date.now() });
    localStorage.setItem(CLAVE, JSON.stringify(lista.slice(0, 8)));
  } catch {}
}

function leerVistos(excluir) {
  try {
    return JSON.parse(localStorage.getItem(CLAVE) || '[]').filter(x => x.cod_modelo !== excluir).slice(0, 4);
  } catch { return []; }
}

// "También te puede gustar" + "Vistos recientemente" al final de la ficha de producto
export default function Recomendados({ excluir }) {
  const [sugeridos, setSugeridos] = useState([]);
  const [vistos, setVistos] = useState([]);

  useEffect(() => { setVistos(leerVistos(excluir)); }, [excluir]);

  useEffect(() => {
    let vivo = true;
    (async () => {
      try {
        const { data } = await supabase
          .from('productos')
          .select('id, cod_modelo, cod_color, nombre, precio, stock')
          .gt('stock', 0)
          .neq('cod_modelo', excluir)
          .order('stock', { ascending: false })
          .limit(60);
        if (!data || !vivo) return;
        const porModelo = new Map();
        const colores = {};
        for (const p of data) {
          if (!porModelo.has(p.cod_modelo)) porModelo.set(p.cod_modelo, p);
          (colores[p.cod_modelo] ||= new Set()).add(p.cod_color);
        }
        const unicos = [...porModelo.values()].slice(0, 8);
        const { data: fotos } = await supabase
          .from('modelos')
          .select('cod_modelo, foto_principal')
          .in('cod_modelo', unicos.map(p => p.cod_modelo));
        const fotosMap = Object.fromEntries((fotos || []).map(f => [f.cod_modelo, f.foto_principal]));
        const lista = unicos
          .filter(p => fotosMap[p.cod_modelo] != null)
          .slice(0, 4)
          .map(p => ({
            ...p,
            foto_principal: fotosMap[p.cod_modelo],
            totalColores: 0,
            colorAlt: [...colores[p.cod_modelo]].find(c => c !== fotosMap[p.cod_modelo]) || null,
          }));
        if (vivo) setSugeridos(lista);
      } catch {}
    })();
    return () => { vivo = false; };
  }, [excluir]);

  if (!sugeridos.length && !vistos.length) return null;

  return (
    <>
      {sugeridos.length > 0 && (
        <section className="recomendados">
          <div className="wrap">
            <div className="seccion-header">
              <div><h2 className="t-titulo">También te puede gustar</h2></div>
              <Link href="/catalogo" className="link-subrayado">Ver catálogo completo</Link>
            </div>
            <div className="productos-grid">
              {sugeridos.map((p, i) => <ProductoCard key={p.id} producto={p} indice={i} />)}
            </div>
          </div>
        </section>
      )}
      {vistos.length > 0 && (
        <section className="recomendados">
          <div className="wrap">
            <div className="seccion-header"><div><h2 className="t-titulo">Vistos recientemente</h2></div></div>
            <div className="vistos">
              {vistos.map(v => (
                <a key={v.cod_modelo} href={`/catalogo/${v.cod_modelo}`} className="visto">
                  <span className="visto-foto">
                    <img src={`${R2}/${v.cod_modelo}/${v.color}.webp`} alt="" loading="lazy" onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }} />
                  </span>
                  <span className="visto-nombre">{v.nombre.toLowerCase()}</span>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

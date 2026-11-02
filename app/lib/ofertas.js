'use client';
// Ofertas semanales: precio tachado S/ 5–6 por encima del precio de venta.
// - Sólo modelos de estas categorías (no dama).
// - Cada 2 días a las 00:00 (hora de Lima) se elige al azar el 33 % del total de modelos
//   publicados (con stock y foto), tomándolos sólo de esas categorías.
//   El "azar" usa el número de periodo como semilla: todos los visitantes ven las
//   mismas ofertas y cambian solas cada lunes, sin tocar la base de datos.
// - El precio que se cobra NO cambia: carrito, WhatsApp, Alegra y píxeles siguen igual.
import { useEffect, useState } from 'react';
import { CATEGORIAS_MODELO } from '../data/categorias';
import { supabase } from './supabase';

const CATEGORIAS_OFERTA = ['camisero', 'polo', 'manga-larga', 'cuello-chino'];
const PORCENTAJE = 0.33;
const DIA = 86400000;
const LIMA = -5 * 3600000; // Perú no usa horario de verano

// Periodos de 2 días seguidos (48 h) que empiezan a las 00:00 de Lima, contados desde
// el lunes 2-nov-2026: lun-mar, mié-jue, vie-sáb, dom-lun… cada 48 h cambian al azar.
const DIAS_PERIODO = 2;
const LUNES_BASE = Date.UTC(2026, 10, 2) / DIA; // lunes 2-nov-2026 (día de inicio)
function semanaLima(ahora = Date.now()) {
  const dias = Math.floor((ahora + LIMA) / DIA);
  return Math.floor((dias - LUNES_BASE) / DIAS_PERIODO);
}
function finDeSemana(periodo) {
  return (LUNES_BASE + (periodo + 1) * DIAS_PERIODO) * DIA - LIMA; // fin del periodo, en UTC
}

// Generador pseudoaleatorio con semilla (mulberry32)
function azar(semilla) {
  let a = semilla >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Modelos publicados = los que se ven en el catálogo: con stock y con foto principal.
// Se consulta una sola vez por visita y se comparte entre todas las tarjetas.
let publicadosPromesa = null;
function cargarPublicados() {
  if (!publicadosPromesa) {
    publicadosPromesa = (async () => {
      const conStock = new Set();
      for (let desde = 0; desde < 20000; desde += 1000) {
        const { data, error } = await supabase
          .from('productos').select('cod_modelo').gt('stock', 0).range(desde, desde + 999);
        if (error) throw error;
        (data || []).forEach((r) => conStock.add(r.cod_modelo));
        if (!data || data.length < 1000) break;
      }
      const { data: fotos, error } = await supabase
        .from('modelos').select('cod_modelo, foto_principal').in('cod_modelo', [...conStock]);
      if (error) throw error;
      return new Set((fotos || []).filter((m) => m.foto_principal != null).map((m) => m.cod_modelo));
    })().catch((e) => { publicadosPromesa = null; throw e; });
  }
  return publicadosPromesa;
}

function esElegible(cod) {
  const cats = CATEGORIAS_MODELO[cod] || [];
  return !cats.includes('dama') && cats.some((c) => CATEGORIAS_OFERTA.includes(c));
}

// 33 % del total de modelos publicados, elegidos al azar (semilla = semana) entre los
// publicados de las categorías permitidas. El orden al azar se hace sobre la lista fija de
// categorías: si un modelo se agota a media semana, los demás en oferta se mantienen.
export function modelosEnOferta(publicados, semana = semanaLima()) {
  const orden = Object.keys(CATEGORIAS_MODELO).filter(esElegible).sort();
  const rnd = azar(semana * 2654435761);
  for (let i = orden.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [orden[i], orden[j]] = [orden[j], orden[i]];
  }
  const cupo = Math.round(publicados.size * PORCENTAJE);
  return new Set(orden.filter((cod) => publicados.has(cod)).slice(0, cupo));
}

// Diferencia del precio tachado: S/ 5 o S/ 6, fija para cada modelo (depende sólo del
// código), así es la misma en todas las tallas, en el catálogo y en la ficha.
export function montoOferta(codModelo) {
  let h = 0;
  for (const ch of String(codModelo)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h % 2 === 0 ? 5 : 6;
}

function textoRestante(fin, ahora) {
  const dias = Math.ceil((fin - ahora) / DIA);
  if (dias <= 1) return 'Termina hoy';
  return `Termina en ${dias} días`;
}

// Se calcula después de cargar la página (en el navegador), con la fecha de la visita.
export function useOferta(codModelo) {
  const [oferta, setOferta] = useState(null);
  useEffect(() => {
    let vigente = true;
    setOferta(null);
    if (!codModelo || !esElegible(codModelo)) return;
    cargarPublicados()
      .then((publicados) => {
        const ahora = Date.now();
        const semana = semanaLima(ahora);
        if (vigente && modelosEnOferta(publicados, semana).has(codModelo)) {
          setOferta({ restante: textoRestante(finDeSemana(semana), ahora) });
        }
      })
      .catch(() => {}); // si falla la consulta, simplemente no se muestran ofertas
    return () => { vigente = false; };
  }, [codModelo]);
  return oferta;
}

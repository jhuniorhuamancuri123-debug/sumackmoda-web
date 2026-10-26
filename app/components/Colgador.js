'use client';
// Colgador de categorías: las prendas cuelgan de perfil y giran de frente
// al pasar el mouse (computadora) o una por una, solas, en celular.
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

// Fotos en /public/colgador: misma toma y mismo encuadre, una de perfil y otra de frente.
const PRENDAS = [
  { slug: 'camisero', nombre: 'Camiseros' },
  { slug: 'cuello-chino', nombre: 'Cuello chino' },
  { slug: 'manga-larga', nombre: 'Manga larga' },
];

const PAUSA_AUTO = 2800; // ms que cada prenda queda de frente en celular

export default function Colgador() {
  const [activo, setActivo] = useState(-1);
  const [tactil, setTactil] = useState(false);
  const [visible, setVisible] = useState(false);
  const [pausado, setPausado] = useState(false);
  const riel = useRef(null);
  const items = useRef([]);

  // ¿Pantalla táctil (sin mouse)?
  useEffect(() => {
    const mq = window.matchMedia('(hover: none)');
    const fijar = () => setTactil(mq.matches);
    fijar();
    mq.addEventListener('change', fijar);
    return () => mq.removeEventListener('change', fijar);
  }, []);

  // Sólo anima cuando el colgador está en pantalla
  useEffect(() => {
    const el = riel.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Celular: las prendas giran solas, una por una
  useEffect(() => {
    if (!tactil || !visible || pausado) return;
    setActivo(a => (a < 0 ? 0 : a));
    const t = setInterval(() => setActivo(a => (a + 1) % PRENDAS.length), PAUSA_AUTO);
    return () => clearInterval(t);
  }, [tactil, visible, pausado]);

  // Retoma el giro automático unos segundos después de que el cliente toca
  useEffect(() => {
    if (!pausado) return;
    const t = setTimeout(() => setPausado(false), 7000);
    return () => clearTimeout(t);
  }, [pausado, activo]);

  // Si hay más prendas que pantalla, centra la que está de frente
  useEffect(() => {
    if (!tactil || activo < 0) return;
    const r = riel.current, it = items.current[activo];
    if (!r || !it) return;
    const t = setTimeout(() => {
      if (r.scrollWidth <= r.clientWidth + 4) return; // todo cabe: no se desplaza
      r.scrollTo({ left: it.offsetLeft - (r.clientWidth - it.offsetWidth) / 2, behavior: 'smooth' });
    }, 800);
    return () => clearTimeout(t);
  }, [activo, tactil]);

  return (
    <section className="seccion colgador" aria-labelledby="colgador-titulo">
      <div className="wrap">
        <div className="seccion-header colgador-cabecera">
          <div>
            <h2 id="colgador-titulo" className="t-titulo">Elige por estilo</h2>
            <p>{tactil ? 'Toca una prenda para ver todos sus modelos.' : 'Pasa el cursor por cada prenda y entra a ver todos sus modelos.'}</p>
          </div>
          <Link href="/catalogo" className="link-subrayado">Ver todo el catálogo</Link>
        </div>
      </div>

      <div className="colgador-riel" ref={riel} onMouseLeave={() => !tactil && setActivo(-1)}>
        <div className={`colgador-tubo ${activo >= 0 ? 'hay-activo' : ''}`} style={{ '--n': PRENDAS.length }}>
          {PRENDAS.map((p, i) => (
            <Link
              key={p.slug}
              href={`/catalogo?categoria=${p.slug}`}
              ref={el => (items.current[i] = el)}
              className={`percha ${activo === i ? 'activa' : ''}`}
              style={{ '--i': i }}
              onMouseEnter={() => !tactil && setActivo(i)}
              onFocus={() => !tactil && setActivo(i)}
              onClick={e => {
                // En celular: el primer toque gira la prenda, el segundo entra
                if (tactil && activo !== i) { e.preventDefault(); setActivo(i); setPausado(true); }
              }}
              aria-label={`Ver ${p.nombre}`}
            >
              <span className="percha-fig" aria-hidden="true">
                <img className="percha-perfil" src={`/colgador/${p.slug}-perfil.webp`} alt="" loading="lazy" draggable="false" />
                <img className="percha-frente" src={`/colgador/${p.slug}-frente.webp`} alt="" loading="lazy" draggable="false" />
              </span>
              <span className="percha-nombre">{p.nombre}</span>
              <span className="percha-ver">Ver modelos <span aria-hidden="true">→</span></span>
            </Link>
          ))}
        </div>
      </div>
      <div className="colgador-puntos" role="group" aria-label="Elegir categoría">
        {PRENDAS.map((p, i) => (
          <button key={p.slug} type="button" aria-label={p.nombre} aria-current={activo === i}
            onClick={() => { setActivo(i); setPausado(true); }}>
            <span />
          </button>
        ))}
      </div>
    </section>
  );
}

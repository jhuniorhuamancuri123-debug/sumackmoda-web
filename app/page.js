import { supabase } from './lib/supabase';
import Link from 'next/link';

export const revalidate = 1800;

async function getProductosDestacados() {
  const { data } = await supabase
    .from('productos')
    .select('id, cod_modelo, cod_color, nombre, precio, stock')
    .gt('stock', 0)
    .order('stock', { ascending: false })
    .limit(20);

  if (!data) return [];

  const modelosVistos = new Set();
  const destacados = [];
  for (const p of data) {
    if (!modelosVistos.has(p.cod_modelo)) {
      modelosVistos.add(p.cod_modelo);
      destacados.push(p);
    }
    if (destacados.length >= 4) break;
  }
  return destacados;
}

export default async function Home() {
  const destacados = await getProductosDestacados();
  return (
    <>
      <section className="hero">
        <img src="/hero.jpg" alt="SUMACK" className="hero-img" />
        <div className="hero-overlay" />
        <div className="hero-content">
          <p className="hero-eyebrow">Nueva coleccion</p>
          <h1 className="hero-title">El arte de vestir bien</h1>
          <p className="hero-subtitle">Prendas premium para el caballero que define su propio estilo.</p>
          <Link href="/catalogo" className="btn-primary">Ver coleccion</Link>
        </div>
      </section>

      <section className="seccion-frase">
        <p className="frase-principal">SUMACK nacio de la conviccion de que vestir bien es una forma de respeto propio.</p>
        <span className="frase-sub">Lima, Peru — Moda Masculina Premium</span>
      </section>

      <section className="seccion">
        <div className="seccion-header">
          <h2 className="seccion-titulo">Lo mas vendido</h2>
          <Link href="/catalogo" className="seccion-link">Ver todo</Link>
        </div>
        <div className="productos-grid">
          {destacados.map((p) => (
            <Link key={p.id} href={"/catalogo/" + p.cod_modelo} className="producto-card">
              <div className="producto-img-wrap">
                <img
                  src={process.env.NEXT_PUBLIC_SUPABASE_URL + "/storage/v1/object/public/productos/" + p.cod_modelo + "/" + p.cod_color + ".jpg"}
                  alt={p.nombre}
                  style={{width:"100%",height:"100%",objectFit:"cover"}}
                  onError={(e) => { e.target.style.display="none"; e.target.parentNode.innerHTML="<div class='producto-placeholder'>SUMACK</div>"; }}
                />
                {p.stock === 0 && <span className="producto-badge agotado">Agotado</span>}
              </div>
              <p className="producto-nombre">{p.nombre.split(" / ")[0]}</p>
              <p className="producto-precio">S/. {Number(p.precio).toFixed(2)}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="banner-medio">
        <img src="/hero.jpg" alt="Elegancia atemporal" className="banner-img" />
        <div className="banner-overlay" />
        <div className="banner-content">
          <h2 className="banner-titulo">Elegancia atemporal</h2>
          <Link href="/catalogo" className="btn-primary">Comprar ahora</Link>
        </div>
      </section>

      <section className="seccion-quote">
        <p className="quote-texto">Vestir bien no es vanidad. Es presencia, criterio y respeto propio.</p>
        <Link href="/catalogo" className="btn-outline">Explorar coleccion</Link>
      </section>
    </>
  );
}

import Link from 'next/link';
import { supabase } from './lib/supabase';
import ProductoImg from './components/ProductoImg';

export const revalidate = 1800;

async function getProductosDestacados() {
  const { data } = await supabase
    .from('productos')
    .select('id, cod_modelo, cod_color, nombre, precio, stock')
    .gt('stock', 0)
    .order('stock', { ascending: false })
    .limit(20);

  if (!data) return [];

  // Obtener modelos únicos primero
  const modelosVistos = new Set();
  const productosUnicos = [];
  for (const p of data) {
    if (!modelosVistos.has(p.cod_modelo)) {
      modelosVistos.add(p.cod_modelo);
      productosUnicos.push(p);
    }
    if (productosUnicos.length >= 4) break;
  }

  // Obtener fotos principales de la tabla modelos
  const codModelos = productosUnicos.map(p => p.cod_modelo);
  const { data: fotosData } = await supabase
    .from('modelos')
    .select('cod_modelo, foto_principal')
    .in('cod_modelo', codModelos);

  const fotosMap = {};
  if (fotosData) fotosData.forEach(f => { fotosMap[f.cod_modelo] = f.foto_principal; });

  // Solo productos con foto_principal definida
  return productosUnicos
    .filter(p => fotosMap[p.cod_modelo] != null)
    .map(p => ({
      ...p,
      foto_principal: fotosMap[p.cod_modelo],
    }));
}

export default async function Home() {
  const destacados = await getProductosDestacados();
  const r2Url = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL;

  return (
    <>
      {/* 1. HERO */}
      <section className="hero">
        <img src="/hero.jpg" alt="SUMACK" className="hero-img" />
        <div className="hero-content">
          <p className="hero-eyebrow">Nueva coleccion</p>
          <h1 className="hero-title">El arte de vestir bien</h1>
          <p className="hero-subtitle">Prendas premium para el caballero que define su propio estilo.</p>
          <Link href="/catalogo" className="btn-primary">Ver coleccion</Link>
        </div>
      </section>

      {/* 2. PRODUCTOS */}
      <section className="seccion">
        <div className="seccion-header">
          <h2 className="seccion-titulo">Lo mas vendido</h2>
          <Link href="/catalogo" className="seccion-link">Ver todo</Link>
        </div>
        <div className="productos-grid">
          {destacados.map((p) => (
            <Link key={p.id} href={"/catalogo/" + p.cod_modelo} className="producto-card">
              <div className="producto-img-wrap">
                <ProductoImg
                  src={`${r2Url}/${p.cod_modelo}/${p.foto_principal}.webp`}
                  alt={p.nombre}
                  hexColor="#e8e4dc"
                />
                {p.stock === 0 && <span className="producto-badge agotado">Agotado</span>}
              </div>
              <p className="producto-nombre">{p.nombre.split(" / ")[0]}</p>
              <p className="producto-precio">S/. {Number(p.precio).toFixed(2)}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. FRASE NEGRA */}
      <section className="seccion-frase">
        <p className="frase-principal">SUMACK nacio de la conviccion de que vestir bien es una forma de respeto propio.</p>
        <span className="frase-sub">Lima, Peru - Moda Masculina Premium</span>
      </section>

      {/* 4. BANNER */}
      <section className="banner-medio">
        <img src="/hero.jpg" alt="Elegancia atemporal" className="banner-img" />
        <div className="banner-overlay" />
        <div className="banner-content">
          <h2 className="banner-titulo">Elegancia atemporal</h2>
          <Link href="/catalogo" className="btn-primary">Comprar ahora</Link>
        </div>
      </section>

      {/* 5. QUOTE FINAL */}
      <section className="seccion-quote">
        <p className="quote-texto">Vestir bien no es vanidad. Es presencia, criterio y respeto propio.</p>
        <Link href="/catalogo" className="btn-outline">Explorar coleccion</Link>
      </section>
    </>
  );
}
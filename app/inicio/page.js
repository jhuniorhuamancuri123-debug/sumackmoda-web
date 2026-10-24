import Link from 'next/link';
import { supabase } from '../lib/supabase';
import ProductoCard from '../components/ProductoCard';
import Logo from '../components/Logo';
import Proceso from '../components/Proceso';
import { IconoWA } from '../components/SiteFooter';
import { RESENAS } from '../data/resenas';
import { RESENAS_EJEMPLO } from '../data/resenas-ejemplo';
import { GARANTIAS, WHATSAPP } from '../data/marca';

export const metadata = {
  title: 'Inicio | SUMACK - Moda Masculina Premium',
  description: 'Descubre los mejores polos masculinos premium hechos en Perú. Calidad, estilo y diseño exclusivo.',
  openGraph: {
    title: 'Inicio | SUMACK - Moda Masculina Premium',
    description: 'Polos masculinos premium hechos en Perú.',
    url: 'https://sumackmoda.com/inicio',
    images: [{ url: 'https://sumackmoda.com/og-image.jpg' }],
  },
};

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
  const productosUnicos = [];
  for (const p of data) {
    if (!modelosVistos.has(p.cod_modelo)) {
      modelosVistos.add(p.cod_modelo);
      productosUnicos.push(p);
    }
    if (productosUnicos.length >= 4) break;
  }

  const coloresPorModelo = {};
  for (const p of data) {
    if (!coloresPorModelo[p.cod_modelo]) coloresPorModelo[p.cod_modelo] = new Set();
    coloresPorModelo[p.cod_modelo].add(p.cod_color);
  }

  const codModelos = productosUnicos.map(p => p.cod_modelo);
  const { data: fotosData } = await supabase
    .from('modelos')
    .select('cod_modelo, foto_principal')
    .in('cod_modelo', codModelos);

  const fotosMap = {};
  if (fotosData) fotosData.forEach(f => { fotosMap[f.cod_modelo] = f.foto_principal; });

  return productosUnicos
    .filter(p => fotosMap[p.cod_modelo] != null)
    .map(p => ({
      ...p,
      foto_principal: fotosMap[p.cod_modelo],
      totalColores: 0,
      colorAlt: [...(coloresPorModelo[p.cod_modelo] || [])].find(c => c !== fotosMap[p.cod_modelo]) || null,
    }));
}

// Portada: fotos tipo polaroid apoyadas sobre la mesa (en public/portada/)
const POLAROIDS = [
  { src: '/portada/foto-cama.webp', giro: '-5deg' },
  { src: '/portada/foto-ascensor.webp', giro: '4deg' },
  { src: '/portada/foto-bicolor.webp', giro: '3deg' },
  { src: '/portada/foto-doblados.webp', giro: '-3deg' },
];

const RAZONES = [
  { t: 'Fabricantes, no revendedores', d: 'Vendemos lo que producimos. Entre nuestro taller y tú no hay intermediarios.' },
  { t: 'Medidas publicadas', d: 'Largo, pecho y manga de cada talla en la guía. Eliges con datos, no a ojo.' },
  { t: 'Envíos a todo el Perú', d: 'Por Shalom sin recargo adicional. Olva, otras agencias o delivery en Lima según tu destino.' },
  { t: 'Te atiende una persona', d: 'Por WhatsApp, de lunes a sábado de 9:00 a 19:00. Resolvemos tallas, colores y envíos.' },
  { t: 'Cambios dentro de 4 días', d: 'Si la talla no fue la correcta, la cambiamos según nuestra política de cambios.' },
  { t: 'Dos tiendas en Gamarra', d: 'Si estás en Lima, puedes ver las prendas en persona antes de decidir.' },
];

// Reseñas reales; si aún no hay, en la PC (modo prueba) se ven las de ejemplo.
// En la web publicada (producción) las de ejemplo NUNCA se muestran.
const ES_PRUEBA = process.env.NODE_ENV === 'development' && RESENAS.length === 0;
const RESENAS_VISIBLES = RESENAS.length > 0 ? RESENAS : (ES_PRUEBA ? RESENAS_EJEMPLO : []);

export default async function Home() {
  const destacados = await getProductosDestacados();
  const cinta = [...GARANTIAS, ...GARANTIAS];

  return (
    <>
      {/* HERO: el logo se arma pieza por pieza y una costura lo subraya */}
      <section className="hero hero-mesa sobre-oscuro">
        <div className="hero-texto">
          <h1 className="hero-logo">
            <Logo animado titulo="SUMACK" />
          </h1>
          <div className="hero-costura" aria-hidden="true" />
          <p className="hero-frase">Polos de caballero, del corte a la última costura en Gamarra.</p>
          <p className="hero-sub">
            Diseñamos y confeccionamos nuestros propios modelos. Eliges color y talla,
            confirmas tu pedido por WhatsApp y lo enviamos a todo el Perú.
          </p>
          <div className="hero-ctas">
            <Link href="/catalogo" className="btn btn-claro">Ver catálogo</Link>
            <Link href="/guia-de-tallas" className="btn btn-linea">Encontrar mi talla</Link>
          </div>
        </div>
        {/* La mesa es un "lienzo" con la proporción exacta de la foto de fondo:
            las polaroids se ubican en % de ese lienzo, así nunca tapan la lámpara,
            la libreta, la taza ni el reloj, en ninguna pantalla. */}
        <div className="mesa-escena" role="img" aria-label="Fotos de polos SUMACK sobre una mesa de madera">
          <div className="mesa-lienzo">
            {POLAROIDS.map((f, i) => (
              <figure
                key={f.src}
                className={`polaroid polaroid-${i + 1}`}
                style={{ '--r': f.giro, '--delay': `${0.5 + i * 0.18}s` }}
              >
                <div className="polaroid-papel">
                  <img src={f.src} alt="" width="700" height="875" fetchPriority={i < 2 ? 'high' : 'auto'} />
                </div>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* CINTA DE GARANTÍAS */}
      <div className="cinta" aria-label="Garantías SUMACK">
        <ul className="sr-only">{GARANTIAS.map(g => <li key={g}>{g}</li>)}</ul>
        <div className="cinta-track" aria-hidden="true">
          {cinta.map((g, i) => <span key={i} className="cinta-item">{g}</span>)}
        </div>
      </div>

      {/* SELECCIÓN */}
      {destacados.length > 0 && (
        <section className="seccion">
          <div className="wrap">
            <div className="seccion-header">
              <div>
                <h2 className="t-titulo">Una selección del catálogo</h2>
                <p>Tallas S a XXL. El precio final depende de la talla que elijas.</p>
              </div>
              <Link href="/catalogo" className="link-subrayado">Ver todos los modelos</Link>
            </div>
            <div className="productos-grid">
              {destacados.map((p, i) => <ProductoCard key={p.id} producto={p} indice={i} />)}
            </div>
          </div>
        </section>
      )}

      {/* PROCESO: secuencia real del taller */}
      <section className="seccion seccion-oscura">
        <div className="wrap">
          <div className="seccion-header">
            <div>
              <h2 className="t-titulo">Del molde a tu armario</h2>
              <p>Cada polo SUMACK pasa por las mismas manos y el mismo control, en el mismo taller.</p>
            </div>
          </div>
          <Proceso />
        </div>
      </section>

      {/* RAZONES */}
      <section className="seccion">
        <div className="wrap">
          <div className="seccion-header">
            <div>
              <h2 className="t-titulo">Por qué comprar en SUMACK</h2>
            </div>
          </div>
          <div className="razones">
            {RAZONES.map(r => (
              <div key={r.t} className="razon">
                <h3>{r.t}</h3>
                <p>{r.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RESEÑAS: reales de app/data/resenas.js (las de ejemplo sólo en modo prueba) */}
      {RESENAS_VISIBLES.length > 0 && (
        <section className="seccion seccion-piedra">
          <div className="wrap">
            <div className="seccion-header">
              <div>
                <h2 className="t-titulo">Lo que nos escriben después de recibir su pedido</h2>
                {ES_PRUEBA && <p className="resenas-aviso">Vista de prueba: reseñas de ejemplo, no se publican.</p>}
              </div>
            </div>
            <div className="resenas-fila">
              {RESENAS_VISIBLES.map((r, i) => (
                <figure key={i} className="resena-wa">
                  <blockquote>{r.texto}</blockquote>
                  <figcaption><strong>{r.autor}</strong>{r.origen ? ` · ${r.origen}` : ''}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CIERRE */}
      <section className="seccion seccion-piedra">
        <div className="wrap cierre">
          <h2 className="t-display">¿No sabes tu talla? Te ayudamos a elegirla.</h2>
          <div className="cierre-acciones">
            <p className="t-serif" style={{ fontSize: '1.15rem', maxWidth: '38ch' }}>
              Escríbenos tu altura y la talla que usas normalmente. Te respondemos por WhatsApp.
            </p>
            <a href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent('Hola, quiero ayuda para elegir mi talla')}`} target="_blank" rel="noopener" className="btn btn-wa">
              <IconoWA /> Consultar mi talla
            </a>
            <Link href="/guia-de-tallas" className="link-subrayado">Ver la guía de tallas</Link>
          </div>
        </div>
      </section>
    </>
  );
}

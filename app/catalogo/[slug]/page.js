'use client';
import { use, useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useCarrito } from '../../context/CarritoContext';
import { useToast } from '../../context/ToastContext';

const TALLAS_ORDEN = ['S', 'M', 'L', 'XL', 'XXL'];

export default function ProductoPage({ params }) {
  const { slug } = use(params);
  const [colores, setColores] = useState([]);
  const [colorSeleccionado, setColorSeleccionado] = useState(null);
  const [tallaSeleccionada, setTallaSeleccionada] = useState(null);
  const [tallasInfo, setTallasInfo] = useState([]);
  const [itemSeleccionado, setItemSeleccionado] = useState(null);
  const [nombreModelo, setNombreModelo] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMsg, setLoadingMsg] = useState('Buscando producto...');
  const [noEncontrado, setNoEncontrado] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [agregando, setAgregando] = useState(false);
  const { agregar } = useCarrito();
  const toast = useToast();

  useEffect(() => { cargarProducto(); }, [slug]);

  useEffect(() => {
    if (!colorSeleccionado) return;
    cargarTallas(colorSeleccionado);
    setTallaSeleccionada(null);
    setItemSeleccionado(null);
    setImgError(false);
  }, [colorSeleccionado]);

  useEffect(() => {
    if (!tallaSeleccionada || !colorSeleccionado) return;
    cargarItem(colorSeleccionado, tallaSeleccionada);
  }, [tallaSeleccionada]);

  async function cargarProducto() {
    try {
      setLoadingMsg('Buscando producto...');
      setLoading(true);
      const codModelo = slug.toUpperCase();

      // Cargar todos los items de este modelo con stock > 0
      setLoadingMsg('Cargando colores disponibles...');
      const { data } = await supabase
        .from('productos')
        .select('cod_modelo, cod_color, cod_talla, nombre, precio, stock')
        .eq('cod_modelo', codModelo)
        .gt('stock', 0);

      if (!data || data.length === 0) {
        setNoEncontrado(true);
        setLoading(false);
        return;
      }

      // Nombre del modelo
      const nombre = data[0].nombre.split(' / ')[0]?.trim() || codModelo;
      setNombreModelo(nombre);

      // Colores únicos con stock
      const coloresMap = new Map();
      for (const item of data) {
        if (!coloresMap.has(item.cod_color)) {
          const nombreColor = item.nombre.split(' / ')[1]?.trim() || item.cod_color;
          coloresMap.set(item.cod_color, {
            cod_color: item.cod_color,
            nombre_color: nombreColor,
            hex_color: '#CCCCCC',
          });
        }
      }
      const coloresArray = Array.from(coloresMap.values());
      setColores(coloresArray);

      // Seleccionar primer color
      const primerColor = coloresArray[0]?.cod_color;
      setColorSeleccionado(primerColor);

    } catch (err) {
      console.error(err);
      setNoEncontrado(true);
    } finally {
      setLoading(false);
    }
  }

  async function cargarTallas(codColor) {
    const codModelo = slug.toUpperCase();
    const { data } = await supabase
      .from('productos')
      .select('cod_talla, stock, precio')
      .eq('cod_modelo', codModelo)
      .eq('cod_color', codColor);

    if (!data) return;

    // Todas las tallas del modelo+color con su estado
    const tallasData = TALLAS_ORDEN.map(t => {
      const item = data.find(d => d.cod_talla === t);
      return {
        talla: t,
        stock: item?.stock || 0,
        precio: item?.precio || 0,
        disponible: item ? item.stock > 0 : false,
        existe: !!item,
      };
    }).filter(t => t.existe); // Solo mostrar tallas que existen para este modelo

    setTallasInfo(tallasData);
  }

  async function cargarItem(codColor, codTalla) {
    const codModelo = slug.toUpperCase();
    const { data } = await supabase
      .from('productos')
      .select('*')
      .eq('cod_modelo', codModelo)
      .eq('cod_color', codColor)
      .eq('cod_talla', codTalla)
      .single();

    setItemSeleccionado(data || null);
  }

  function handleAgregar() {
    if (!itemSeleccionado || itemSeleccionado.stock <= 0) return;
    setAgregando(true);
    const colorActual = colores.find(c => c.cod_color === colorSeleccionado);
    agregar({
      id: itemSeleccionado.id,
      nombre: nombreModelo,
      precio: Number(itemSeleccionado.precio),
      color: colorActual?.nombre_color || colorSeleccionado,
      talla: tallaSeleccionada,
      stockMax: itemSeleccionado.stock,
      imagen: imgError ? null : imgUrl,
      hexColor: colorActual?.hex_color || '#e8e4dc',
    });
    toast.success(`¡${nombreModelo} agregado al carrito!`);
    setTimeout(() => setAgregando(false), 1500);
  }

  if (loading) return (
    <div style={{
      paddingTop: '120px', textAlign: 'center',
      fontFamily: 'var(--font-body)', minHeight: '60vh',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: '1.5rem',
    }}>
      <div style={{
        width: '40px', height: '40px',
        border: '2px solid var(--gris-claro)',
        borderTop: '2px solid var(--marron)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <p style={{ color: 'var(--gris)', fontSize: '0.95rem', letterSpacing: '0.05em' }}>
        {loadingMsg}
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (noEncontrado) return (
    <div style={{
      paddingTop: '120px', textAlign: 'center',
      fontFamily: 'var(--font-body)', minHeight: '60vh',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: '1rem',
    }}>
      <p style={{ fontSize: '1.2rem', fontFamily: 'var(--font-display)', fontWeight: 700 }}>
        Producto no disponible
      </p>
      <p style={{ color: 'var(--gris)', fontSize: '0.9rem' }}>
        Este producto no tiene stock en este momento
      </p>
      <a href="/catalogo" style={{
        marginTop: '1rem', fontFamily: 'var(--font-body)',
        fontSize: '0.8rem', letterSpacing: '0.15em',
        textTransform: 'uppercase', color: 'var(--marron)',
        textDecoration: 'none', borderBottom: '1px solid var(--marron)',
        paddingBottom: '2px',
      }}>
        Ver catálogo
      </a>
    </div>
  );

  const codModelo = slug.toUpperCase();
  const imgUrl = colorSeleccionado
    ? `${process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL}/${codModelo}/${colorSeleccionado}.jpeg`
  : null;

  const colorActual = colores.find(c => c.cod_color === colorSeleccionado);
  const precioActual = itemSeleccionado?.precio
    || tallasInfo.find(t => t.disponible)?.precio
    || 0;
  const hayMultiplesPrecios = [...new Set(tallasInfo.map(t => t.precio))].length > 1;

  return (
    <div style={{ paddingTop: '80px', minHeight: '100vh' }}>
      <div style={{
        maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem',
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem',
      }}>

        {/* IMAGEN */}
        <div style={{
          aspectRatio: '3/4',
          background: colorActual?.hex_color || '#e8e4dc',
          overflow: 'hidden', position: 'relative',
        }}>
          {!imgError && imgUrl ? (
            <img src={imgUrl} alt={nombreModelo}
              onError={() => setImgError(true)}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          ) : (
            <div style={{
              width: '100%', height: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)', fontSize: '2rem',
              fontWeight: 900, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.3em',
            }}>
              SUMACK
            </div>
          )}
          {itemSeleccionado && itemSeleccionado.stock <= 3 && itemSeleccionado.stock > 0 && (
            <div style={{
              position: 'absolute', top: '1rem', left: '1rem',
              background: '#c0392b', color: '#fff',
              fontFamily: 'var(--font-body)', fontSize: '0.7rem',
              letterSpacing: '0.1em', textTransform: 'uppercase',
              padding: '0.4rem 0.75rem',
            }}>
              ¡Últimas {itemSeleccionado.stock} unidades!
            </div>
          )}
        </div>

        {/* INFO */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingTop: '1rem' }}>

          <div>
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: '0.75rem',
              letterSpacing: '0.2em', textTransform: 'uppercase',
              color: 'var(--gris)', marginBottom: '0.5rem',
            }}>
              {codModelo}
            </p>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontSize: '1.8rem',
              fontWeight: 700, lineHeight: 1.2, marginBottom: '0.75rem',
            }}>
              {nombreModelo}
            </h1>
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: '1.4rem',
              fontWeight: 600, color: 'var(--marron)',
            }}>
              {hayMultiplesPrecios && !tallaSeleccionada ? 'Desde ' : ''}
              S/. {Number(precioActual).toFixed(2)}
            </p>
            {hayMultiplesPrecios && !tallaSeleccionada && (
              <p style={{
                fontFamily: 'var(--font-body)', fontSize: '0.78rem',
                color: 'var(--gris)', marginTop: '0.25rem',
              }}>
                El precio varía según la talla
              </p>
            )}
          </div>

          {/* Color */}
          <div>
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: '0.75rem',
              letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.75rem',
            }}>
              Color: <strong>{colorActual?.nombre_color || ''}</strong>
            </p>
            <div style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '0.4rem',
}}>
  {colores.map(c => (
    <button key={c.cod_color} title={c.nombre_color}
      onClick={() => setColorSeleccionado(c.cod_color)}
      style={{
        padding: '0.4rem 0.3rem',
        border: colorSeleccionado === c.cod_color
          ? '2px solid var(--negro)'
          : '1px solid var(--gris-claro)',
        background: colorSeleccionado === c.cod_color ? 'var(--negro)' : 'transparent',
        color: colorSeleccionado === c.cod_color ? 'var(--blanco)' : 'var(--negro)',
        fontFamily: 'var(--font-body)', fontSize: '0.72rem',
        cursor: 'pointer', transition: 'all 0.2s',
        letterSpacing: '0.03em',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        width: '100%',
      }}>
      {c.nombre_color}
    </button>
  ))}
</div>
          </div>

          {/* Talla */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <p style={{
                fontFamily: 'var(--font-body)', fontSize: '0.75rem',
                letterSpacing: '0.15em', textTransform: 'uppercase',
              }}>
                Talla
              </p>
              <a href="/guia-de-tallas" style={{
                fontFamily: 'var(--font-body)', fontSize: '0.7rem',
                color: 'var(--gris)', textDecoration: 'none',
                borderBottom: '1px solid var(--gris-claro)',
              }}>
                Guía de tallas
              </a>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {tallasInfo.map(({ talla, disponible, precio }) => {
                const seleccionada = tallaSeleccionada === talla;
                return (
                  <button key={talla}
                    onClick={() => disponible && setTallaSeleccionada(talla)}
                    disabled={!disponible}
                    title={disponible ? `S/. ${Number(precio).toFixed(2)}` : 'Agotado'}
                    style={{
                      minWidth: '48px', height: '48px',
                      padding: '0 0.5rem',
                      border: seleccionada ? '2px solid var(--negro)' : '1px solid var(--gris-claro)',
                      background: seleccionada ? 'var(--negro)' : !disponible ? '#f5f5f5' : 'transparent',
                      color: seleccionada ? 'var(--blanco)' : !disponible ? 'var(--gris-claro)' : 'var(--negro)',
                      fontFamily: 'var(--font-body)', fontSize: '0.85rem',
                      cursor: disponible ? 'pointer' : 'not-allowed',
                      transition: 'all 0.2s', position: 'relative',
                      textDecoration: !disponible ? 'line-through' : 'none',
                    }}>
                    {talla}
                    {!disponible && (
                      <span style={{
                        position: 'absolute', bottom: '2px', right: '2px',
                        fontSize: '0.45rem', color: '#c0392b', letterSpacing: 0,
                      }}>✕</span>
                    )}
                  </button>
                );
              })}
            </div>
            {tallasInfo.length > 0 && tallasInfo.every(t => !t.disponible) && (
              <p style={{
                fontFamily: 'var(--font-body)', fontSize: '0.82rem',
                color: '#c0392b', marginTop: '0.5rem',
              }}>
                Agotado en este color — elige otro color
              </p>
            )}
          </div>

          {/* Botón agregar */}
          <button onClick={handleAgregar}
            disabled={!itemSeleccionado || itemSeleccionado?.stock <= 0 || agregando}
            style={{
              width: '100%', padding: '1rem',
              background: agregando
                ? 'var(--marron)'
                : itemSeleccionado && itemSeleccionado.stock > 0
                ? 'var(--negro)'
                : 'var(--gris-claro)',
              color: itemSeleccionado && itemSeleccionado.stock > 0 || agregando
                ? 'var(--blanco)'
                : 'var(--gris)',
              fontFamily: 'var(--font-body)', fontSize: '0.85rem',
              fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase',
              border: 'none',
              cursor: itemSeleccionado && itemSeleccionado.stock > 0 && !agregando
                ? 'pointer'
                : 'not-allowed',
              transition: 'all 0.3s',
            }}>
            {agregando
              ? '✓ Agregado al carrito'
              : !colorSeleccionado
              ? 'Selecciona un color'
              : !tallaSeleccionada
              ? 'Selecciona una talla'
              : itemSeleccionado?.stock <= 0
              ? 'Agotado'
              : `Agregar al carrito — S/. ${Number(precioActual).toFixed(2)}`}
          </button>

          {/* Info envíos */}
          <div style={{
            padding: '1rem', background: 'var(--crema)',
            borderLeft: '3px solid var(--marron)',
            fontFamily: 'var(--font-body)', fontSize: '0.82rem',
            lineHeight: 1.7, color: 'var(--negro)',
          }}>
            <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>🚚 Información de envíos</p>
            <p>• <strong>Shalom:</strong> Sin recargo adicional</p>
            <p>• <strong>Otras agencias / Delivery:</strong> Recargo variable</p>
            <p style={{ marginTop: '0.5rem', color: 'var(--gris)', fontSize: '0.78rem' }}>
              El envío se coordina al confirmar tu pedido por WhatsApp
            </p>
          </div>

          {/* WhatsApp */}
          <a href={`https://wa.me/51968267313?text=Hola%2C%20me%20interesa%20*${encodeURIComponent(nombreModelo)}*`}
            target="_blank" rel="noopener"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '0.5rem', padding: '0.85rem',
              border: '1px solid var(--gris-claro)',
              fontFamily: 'var(--font-body)', fontSize: '0.82rem',
              letterSpacing: '0.1em', color: 'var(--gris)',
              textDecoration: 'none', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#25D366'; e.currentTarget.style.color = '#25D366'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--gris-claro)'; e.currentTarget.style.color = 'var(--gris)'; }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
            </svg>
            Consultar por WhatsApp
          </a>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .producto-grid-responsive {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
        }
      `}</style>
    </div>
  );
}
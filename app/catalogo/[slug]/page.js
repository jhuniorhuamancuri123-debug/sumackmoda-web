  'use client';
import Link from 'next/link';
  import { use, useState, useEffect, useRef, useCallback } from 'react';
  import { supabase } from '../../lib/supabase';
  import { useCarrito } from '../../context/CarritoContext';
  import { useToast } from '../../context/ToastContext';
  import ProductoImg from '../../components/ProductoImg';
import Logo from '../../components/Logo';
import Recomendados, { registrarVisto } from '../../components/Recomendados';
import { IconoWA } from '../../components/SiteFooter';
import { AnimatePresence, motion } from 'motion/react';

  const TALLAS_ORDEN = ['S', 'M', 'L', 'XL', 'XXL'];
  function ImagenConFallback({ src, alt }) {
    const [error, setError] = useState(false);

    if (error) {
      return <div className="ficha-foto-fallback"><Logo titulo="" /></div>;
    }

    return (
      <img
        src={src}
        alt={alt}
        onError={() => setError(true)}
        className="ficha-foto-principal"
      />
    );
  }

  export default function ProductoPage({ params }) {
    const { slug } = use(params);
    const [colores, setColores] = useState([]);
    const [colorIndex, setColorIndex] = useState(0);
    const [tallaSeleccionada, setTallaSeleccionada] = useState(null);
    const [tallasInfo, setTallasInfo] = useState([]);
    const [itemSeleccionado, setItemSeleccionado] = useState(null);
    const [nombreModelo, setNombreModelo] = useState('');
    const [loading, setLoading] = useState(true);
    const [descripcion, setDescripcion] = useState('');
    const [loadingMsg, setLoadingMsg] = useState('Buscando producto...');
    const [noEncontrado, setNoEncontrado] = useState(false);
    const [agregando, setAgregando] = useState(false);
    const [lightboxAbierto, setLightboxAbierto] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const touchStartX = useRef(null);
    const lightboxTouchStartX = useRef(null);
    const viewContentDisparado = useRef(false);
    const { agregar } = useCarrito();
    const toast = useToast();

    const colorSeleccionado = colores[colorIndex]?.cod_color || null;
    const colorActual = colores[colorIndex] || null;
    const codModelo = slug.toUpperCase();

    const imgUrl = colorSeleccionado
      ? `${process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL}/${codModelo}/${colorSeleccionado}.webp`
      : null;

    useEffect(() => {
      const checkMobile = () => setIsMobile(window.innerWidth <= 768);
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => { cargarProducto(); }, [slug]);

    // Guarda el modelo en "Vistos recientemente" (sólo en este navegador)
    useEffect(() => {
      if (!nombreModelo || !colores.length) return;
      registrarVisto({ cod_modelo: codModelo, nombre: nombreModelo, color: colores[0].cod_color });
    }, [nombreModelo, colores, codModelo]);

  useEffect(() => {
      if (!nombreModelo || !colorSeleccionado || tallasInfo.length === 0) return;
      if (viewContentDisparado.current) return;
      viewContentDisparado.current = true;
      const contentId = `${codModelo}${colorSeleccionado}`;
      const eventId = `VC-${codModelo}-${colorSeleccionado}-${Date.now()}`;
      if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('track', 'ViewContent', {
          content_ids: [contentId],
          content_type: 'product_group',
          value: Number(tallasInfo.find(t => t.disponible)?.precio) || 0,
          currency: 'PEN',
          content_name: nombreModelo,
        }, { eventID: eventId });
      }
      if (typeof window !== 'undefined' && window.ttq) {
        window.ttq.track('ViewContent', {
          content_id: contentId,
          content_type: 'product',
          content_name: nombreModelo,
          value: Number(tallasInfo.find(t => t.disponible)?.precio) || 0,
          currency: 'PEN',
        });
      }
      const precioParaEvento = tallasInfo.find(t => t.disponible)?.precio || 0;
      fetch('/api/tiktok-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventName: 'ViewContent',
          eventId,
          eventData: {
            url: window.location.href,
            content_ids: [contentId],
            content_type: 'product',
            value: Number(precioParaEvento) || 0,
            content_name: nombreModelo,
            num_items: 1,
          }
        }),
      });
      fetch('/api/meta-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventName: 'ViewContent',
          eventId,
          eventData: {
            url: window.location.href,
            content_ids: [contentId],
            content_type: 'product_group',
            value: Number(tallasInfo.find(t => t.disponible)?.precio) || 0,
            content_name: nombreModelo,
            fbc: document.cookie.match(/_fbc=([^;]+)/)?.[1] || new URLSearchParams(window.location.search).get('fbclid') || '',
            fbp: document.cookie.match(/_fbp=([^;]+)/)?.[1] || '',
          }
        }),
      });
    }, [nombreModelo, colorSeleccionado, tallasInfo]);

    useEffect(() => {
      if (!colorSeleccionado) return;
      cargarTallas(colorSeleccionado);
      setTallaSeleccionada(null);
      setItemSeleccionado(null);
    }, [colorSeleccionado]);

    useEffect(() => {
      if (!tallaSeleccionada || !colorSeleccionado) return;
      cargarItem(colorSeleccionado, tallaSeleccionada);
    }, [tallaSeleccionada, colorIndex]);

    useEffect(() => {
      if (lightboxAbierto) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
      return () => { document.body.style.overflow = ''; };
    }, [lightboxAbierto]);

    async function cargarProducto() {
      try {
        setLoadingMsg('Buscando producto...');
        setLoading(true);
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

        const nombre = data[0].nombre.split(' / ')[0]?.trim() || codModelo;
        setNombreModelo(nombre);

        const { data: modeloData } = await supabase
          .from('modelos')
          .select('descripcion')
          .eq('cod_modelo', codModelo)
          .maybeSingle();
        setDescripcion(modeloData?.descripcion || '');

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
        // Consultar qué colores tienen foto
        const { data: imagenesData } = await supabase
          .from('imagenes')
          .select('cod_color')
          .eq('cod_modelo', codModelo)
          .eq('tiene_foto', true);

        const coloresConFoto = new Set(imagenesData?.map(i => i.cod_color) || []);

        const coloresArray = Array.from(coloresMap.values())
          .filter(c => coloresConFoto.has(c.cod_color));

        setColores(coloresArray);
        setColorIndex(0);
      } catch (err) {
        console.error(err);
        setNoEncontrado(true);
      } finally {
        setLoading(false);
      }
    }

    async function cargarTallas(codColor) {
      const { data } = await supabase
        .from('productos')
        .select('cod_talla, stock, precio')
        .eq('cod_modelo', codModelo)
        .eq('cod_color', codColor);
      if (!data) return;
      const tallasData = TALLAS_ORDEN.map(t => {
        const item = data.find(d => d.cod_talla === t);
        return {
          talla: t,
          stock: item?.stock || 0,
          precio: item?.precio || 0,
          disponible: item ? item.stock > 0 : false,
          existe: !!item,
        };
      }).filter(t => t.existe);
      setTallasInfo(tallasData);
      const primeraDisponible = tallasData.find(t => t.disponible);
      if (primeraDisponible) setTallaSeleccionada(primeraDisponible.talla);
    }

    async function cargarItem(codColor, codTalla) {
      const { data } = await supabase
        .from('productos')
        .select('*')
        .eq('cod_modelo', codModelo)
        .eq('cod_color', codColor)
        .eq('cod_talla', codTalla)
        .single();
      setItemSeleccionado(data || null);
    }

    const handleAgregar = useCallback(() => {
      if (!itemSeleccionado || itemSeleccionado.stock <= 0) return;
      setAgregando(true);
      const imagenActual = colorSeleccionado
        ? `${process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL}/${codModelo}/${colorSeleccionado}.webp`
        : null;
        
      agregar({
        id: itemSeleccionado.id,
        nombre: nombreModelo,
        precio: Number(itemSeleccionado.precio),
        codColor: colorSeleccionado,
        color: colorActual?.nombre_color || colorSeleccionado,
        talla: tallaSeleccionada,
        stockMax: itemSeleccionado.stock,
        imagen: imagenActual,
        hexColor: colorActual?.hex_color || '#e8e4dc',
        urlProducto: `${window.location.origin}/catalogo/${codModelo.toLowerCase()}`,
      });

      toast.success(`${nombreModelo.toLowerCase().replace(/(^|\s)\S/g, c => c.toUpperCase())} agregado. Abre tu carrito para confirmar el pedido.`);
      const eventId = `ATC-${codModelo}-${colorSeleccionado}-${tallaSeleccionada}-${Date.now()}`;
      if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('track', 'AddToCart', {
          content_ids: [`${codModelo}${colorSeleccionado}${tallaSeleccionada}`],
          content_type: 'product',
          value: Number(itemSeleccionado.precio),
          currency: 'PEN',
          content_name: nombreModelo,
        }, { eventID: eventId });
      }
      if (typeof window !== 'undefined' && window.ttq) {
        window.ttq.track('AddToCart', {
          content_id: `${codModelo}${colorSeleccionado}${tallaSeleccionada}`,
          content_type: 'product',
          content_name: nombreModelo,
          value: Number(itemSeleccionado.precio),
          currency: 'PEN',
        });
      }
      fetch('/api/tiktok-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventName: 'AddToCart',
          eventId,
          eventData: {
            url: window.location.href,
            content_ids: [`${codModelo}${colorSeleccionado}${tallaSeleccionada}`],
            content_type: 'product',
            value: Number(itemSeleccionado.precio),
            content_name: nombreModelo,
            num_items: 1,
          }
        }),
      });
      fetch('/api/meta-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventName: 'AddToCart',
          eventId,
          eventData: {
            url: window.location.href,
            content_ids: [`${codModelo}${colorSeleccionado}${tallaSeleccionada}`],
            content_type: 'product',
            value: Number(itemSeleccionado.precio),
            content_name: nombreModelo,
            num_items: 1,
            fbc: document.cookie.match(/_fbc=([^;]+)/)?.[1] || new URLSearchParams(window.location.search).get('fbclid') || '',
            fbp: document.cookie.match(/_fbp=([^;]+)/)?.[1] || '',
          }
        }),
      });
      
      setTimeout(() => setAgregando(false), 1500);
    }, [itemSeleccionado, colorSeleccionado, colorActual, tallaSeleccionada, nombreModelo, codModelo, agregar, toast]);

    const irColorAnterior = useCallback(() => {
      setColorIndex(prev => (prev > 0 ? prev - 1 : colores.length - 1));
    }, [colores.length]);

    const irColorSiguiente = useCallback(() => {
      setColorIndex(prev => (prev < colores.length - 1 ? prev + 1 : 0));
    }, [colores.length]);

    const handleTouchStart = useCallback((e) => {
      touchStartX.current = e.touches[0].clientX;
    }, []);

    const handleTouchEnd = useCallback((e) => {
      if (touchStartX.current === null) return;
      const diff = touchStartX.current - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        diff > 0 ? irColorSiguiente() : irColorAnterior();
      }
      touchStartX.current = null;
    }, [irColorSiguiente, irColorAnterior]);

    const handleLightboxTouchStart = useCallback((e) => {
      lightboxTouchStartX.current = e.touches[0].clientX;
    }, []);

    const handleLightboxTouchEnd = useCallback((e) => {
      if (lightboxTouchStartX.current === null) return;
      const diff = lightboxTouchStartX.current - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        diff > 0 ? irColorSiguiente() : irColorAnterior();
      }
      lightboxTouchStartX.current = null;
    }, [irColorSiguiente, irColorAnterior]);

    if (loading) return (
      <div className="estado-centro" role="status">
        <div className="cargando-logo"><Logo titulo="" /></div>
        <p>{loadingMsg}</p>
      </div>
    );

    if (noEncontrado) return (
      <div className="estado-centro">
        <h1>Este modelo no está disponible</h1>
        <p>Se agotó o ya no está en el catálogo. Mira los modelos que sí tenemos en stock.</p>
        <Link href="/catalogo" className="btn btn-solid" style={{ marginTop: '0.5rem' }}>Ver catálogo</Link>
      </div>
    );

    const precioActual = itemSeleccionado?.precio
      || tallasInfo.find(t => t.disponible)?.precio || 0;
    const hayMultiplesPrecios = [...new Set(tallasInfo.map(t => t.precio))].length > 1;
    const r2 = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL;
    const puedeAgregar = !!itemSeleccionado && itemSeleccionado.stock > 0 && !agregando;
    const textoBoton = agregando ? 'Agregado al carrito'
      : !colorSeleccionado ? 'Selecciona un color'
      : !tallaSeleccionada ? 'Selecciona una talla'
      : itemSeleccionado?.stock <= 0 ? 'Agotado'
      : `Agregar al carrito  S/ ${Number(precioActual).toFixed(2)}`;
    const linkWA = `https://wa.me/51968267313?text=Hola%2C%20me%20interesa%20*${encodeURIComponent(nombreModelo)}*`;

    const botonAgregar = (className = '') => (
      <button
        onClick={handleAgregar}
        disabled={!itemSeleccionado || itemSeleccionado?.stock <= 0 || agregando}
        className={`btn btn-solid btn-full ${agregando ? 'btn-agregado' : ''} ${className}`}
        aria-live="polite"
      >
        {agregando && (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
        )}
        {textoBoton}
      </button>
    );

    return (
      <div className="ficha">

        {/* LIGHTBOX */}
        <AnimatePresence>
          {lightboxAbierto && (
            <motion.div
              className="lightbox"
              role="dialog"
              aria-modal="true"
              aria-label={`Foto ampliada de ${nombreModelo}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onTouchStart={handleLightboxTouchStart}
              onTouchEnd={handleLightboxTouchEnd}
              onClick={(e) => { if (e.target === e.currentTarget) setLightboxAbierto(false); }}
            >
              <button className="lightbox-btn" style={{ top: '1.25rem', right: '1.25rem' }} aria-label="Cerrar" onClick={() => setLightboxAbierto(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 5l14 14M19 5L5 19" /></svg>
              </button>
              {colores.length > 1 && (
                <button className="lightbox-btn" style={{ left: '1rem' }} aria-label="Color anterior" onClick={irColorAnterior}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M15 5l-7 7 7 7" /></svg>
                </button>
              )}
              <div className="lightbox-img">
                {imgUrl && <ProductoImg key={colorSeleccionado} src={imgUrl} alt={nombreModelo} className="" />}
              </div>
              {colores.length > 1 && (
                <button className="lightbox-btn" style={{ right: '1rem' }} aria-label="Color siguiente" onClick={irColorSiguiente}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 5l7 7-7 7" /></svg>
                </button>
              )}
              <div className="lightbox-pie">
                <p>{colorActual?.nombre_color?.toLowerCase()}</p>
                {colores.length > 1 && (
                  <div className="lightbox-puntos">
                    {colores.map((c, i) => (
                      <button key={c.cod_color} aria-label={c.nombre_color} onClick={() => setColorIndex(i)}
                        style={{ width: i === colorIndex ? '22px' : '6px', background: i === colorIndex ? '#fff' : 'rgba(255,255,255,0.4)' }} />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="wrap">
          <nav className="ficha-migas" aria-label="Ruta">
            <Link href="/catalogo">Catálogo</Link> / <span style={{ textTransform: 'capitalize' }}>{nombreModelo.toLowerCase()}</span>
          </nav>

          <div className="ficha-grid">
            {/* GALERÍA */}
            <div className="ficha-galeria">
              <div
                className="ficha-foto"
                onClick={() => setLightboxAbierto(true)}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                {imgUrl && <img src={imgUrl} alt="" aria-hidden="true" className="ficha-foto-fondo" />}
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={colorSeleccionado || 'sin-color'}
                    style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    {imgUrl && <ImagenConFallback src={imgUrl} alt={`${nombreModelo} color ${colorActual?.nombre_color || ''}`} />}
                  </motion.div>
                </AnimatePresence>

                {itemSeleccionado && itemSeleccionado.stock <= 3 && itemSeleccionado.stock > 0 && (
                  <div className="ficha-badge">
                    {itemSeleccionado.stock === 1 ? 'Última unidad en esta talla' : `Últimas ${itemSeleccionado.stock} en esta talla`}
                  </div>
                )}

                {colores.length > 1 && (
                  <>
                    <button className="ficha-flecha izq" aria-label="Color anterior" onClick={(e) => { e.stopPropagation(); irColorAnterior(); }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M15 5l-7 7 7 7" /></svg>
                    </button>
                    <button className="ficha-flecha der" aria-label="Color siguiente" onClick={(e) => { e.stopPropagation(); irColorSiguiente(); }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 5l7 7-7 7" /></svg>
                    </button>
                  </>
                )}
                <span className="ficha-zoom">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4M11 8v6M8 11h6" /></svg>
                  Ampliar
                </span>
              </div>

              {colores.length > 1 && (
                <div className="ficha-miniaturas" aria-label="Colores">
                  {colores.map((c, i) => (
                    <button key={c.cod_color} className={`ficha-mini ${i === colorIndex ? 'activa' : ''}`} aria-label={c.nombre_color} onClick={() => setColorIndex(i)}>
                      <img src={`${r2}/${codModelo}/${c.cod_color}.webp`} alt="" loading="lazy" onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* COLUMNA IZQUIERDA: nombre, descripción, envíos y cambios */}
            <div className="ficha-col-izq">
            {/* IZQUIERDA (arriba): nombre del modelo */}
            <header className="ficha-cab">
              <p className="ficha-codigo">Modelo {codModelo}</p>
              <h1 className="t-display ficha-nombre">{nombreModelo.toLowerCase()}</h1>
            </header>

            {/* IZQUIERDA: descripción, envíos y cambios */}
            <div className="ficha-col-info">
                {descripcion && <p className="ficha-desc">{descripcion}</p>}

                <div className="ficha-detalles">
                  <details open>
                    <summary>Envíos</summary>
                    <div className="det-cuerpo">
                      <p><strong>Shalom:</strong> sin recargo adicional.</p>
                      <p><strong>Olva, otras agencias o delivery en Lima:</strong> recargo variable según destino.</p>
                      <p className="t-meta">El envío se coordina al confirmar tu pedido por WhatsApp.</p>
                    </div>
                  </details>
                  <details>
                    <summary>Cambios</summary>
                    <div className="det-cuerpo">
                      <p>Aceptamos cambios dentro de los 4 días calendario desde que recibes tu pedido, con la prenda sin uso y con etiquetas.</p>
                      <p><Link href="/politica-devoluciones" className="link-subrayado" style={{ fontWeight: 500 }}>Leer la política completa</Link></p>
                    </div>
                  </details>
                  <details>
                    <summary>Cómo comprar</summary>
                    <div className="det-cuerpo">
                      <p>1. Elige color y talla y agrega al carrito.</p>
                      <p>2. Escribe tu nombre y confirma el pedido.</p>
                      <p>3. Se abre WhatsApp con tu pedido listo; coordinamos pago y envío contigo.</p>
                    </div>
                  </details>
                </div>
              <a href={linkWA} target="_blank" rel="noopener" className="ficha-wa">
                <IconoWA /> ¿Dudas con tu talla? Consúltanos por WhatsApp
              </a>
            </div>
            </div>

            {/* DERECHA: precio, color, talla y compra */}
            <div className="ficha-col-compra">
                <p className="ficha-precio">
                  {hayMultiplesPrecios && !tallaSeleccionada && <small>Desde</small>}
                  S/ {Number(precioActual).toFixed(2)}
                </p>
                {hayMultiplesPrecios && (
                  <p className="ficha-precio-nota">
                    {tallaSeleccionada ? `Precio de la talla ${tallaSeleccionada}. Varía según la talla.` : 'El precio varía según la talla.'}
                  </p>
                )}
                <div className="ficha-bloque">
                  <div className="ficha-bloque-cab">
                    <span>Color: <strong style={{ textTransform: 'capitalize' }}>{colorActual?.nombre_color?.toLowerCase() || ''}</strong></span>
                    {colores.length > 1 && <span className="t-meta">{colores.length} colores</span>}
                  </div>
                  <div className="colores-opciones">
                    {colores.map((c, i) => (
                      <button key={c.cod_color} className={`color-opcion ${colorIndex === i ? 'sel' : ''}`} aria-pressed={colorIndex === i} onClick={() => setColorIndex(i)}>
                        {c.nombre_color.toLowerCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="ficha-bloque">
                  <div className="ficha-bloque-cab">
                    <span>Talla{tallaSeleccionada && <>: <strong>{tallaSeleccionada}</strong></>}</span>
                    <Link href="/guia-de-tallas" className="link-subrayado" style={{ fontWeight: 500 }}>Guía de tallas</Link>
                  </div>
                  <div className="tallas-opciones">
                    {tallasInfo.map(({ talla, disponible, precio }) => (
                      <button key={talla}
                        className={`talla-opcion ${tallaSeleccionada === talla ? 'sel' : ''}`}
                        onClick={() => disponible && setTallaSeleccionada(talla)}
                        disabled={!disponible}
                        aria-pressed={tallaSeleccionada === talla}
                        aria-label={disponible ? `Talla ${talla}, S/ ${Number(precio).toFixed(2)}` : `Talla ${talla}, agotada`}
                      >
                        {talla}
                        {hayMultiplesPrecios && disponible && <small>S/ {Number(precio).toFixed(0)}</small>}
                      </button>
                    ))}
                  </div>
                  {tallasInfo.length > 0 && tallasInfo.every(t => !t.disponible) && (
                    <p className="ficha-agotado">Agotado en este color. Elige otro color.</p>
                  )}
                </div>

                <div className="ficha-acciones">
                  {botonAgregar('btn-agregar-desk')}
                </div>

            </div>
          </div>
        </div>

        <Recomendados excluir={codModelo} />

        {/* BARRA FIJA DE COMPRA (móvil) */}
        <div className="barra-compra">
          {botonAgregar()}
        </div>
      </div>
    );
  }

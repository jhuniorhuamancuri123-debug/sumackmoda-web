'use client';
import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'motion/react';
import ProductoImg from './ProductoImg';

const R2 = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL;

// Tarjeta de producto. Al pasar el mouse muestra otro color del mismo modelo (si existe su foto).
export default function ProductoCard({ producto, priority = false, indice = 0, etiquetaPrecio = 'Desde' }) {
  const { cod_modelo, foto_principal, nombre, precio, stock, totalColores, colorAlt } = producto;
  const [altLista, setAltLista] = useState(false);
  const nombreModelo = (nombre.split(' / ')[0]?.trim() || nombre).toLowerCase();
  const imgUrl = `${R2}/${cod_modelo}/${foto_principal}.webp`;
  const altUrl = colorAlt && colorAlt !== foto_principal ? `${R2}/${cod_modelo}/${colorAlt}.webp` : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.05 }}
      transition={{ duration: 0.8, delay: (indice % 4) * 0.08, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link href={`/catalogo/${cod_modelo}`} className="producto-card">
        <div className="producto-img-wrap">
          <ProductoImg src={imgUrl} alt={nombreModelo} priority={priority} />
          {altUrl && (
            <img
              src={altUrl}
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              className={`pimg pimg-alt${altLista ? ' lista' : ''}`}
              onLoad={() => setAltLista(true)}
              onError={(e) => { e.currentTarget.remove(); }}
            />
          )}
          {stock === 0 && <span className="producto-badge">Agotado</span>}
          <span className="producto-ver" aria-hidden="true">Ver modelo</span>
        </div>
        <p className="producto-nombre">{nombreModelo}</p>
        {totalColores > 0 && (
          <p className="producto-colores">{totalColores} {totalColores === 1 ? 'color' : 'colores'}</p>
        )}
        <p className="producto-precio">{etiquetaPrecio && <small>{etiquetaPrecio}</small>}S/ {Number(precio).toFixed(2)}</p>
      </Link>
    </motion.div>
  );
}

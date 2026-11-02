'use client';
import Link from 'next/link';
import { motion } from 'motion/react';
import ProductoImg from './ProductoImg';
import { useOferta, montoOferta } from '../lib/ofertas';
import { guardarPosicion } from '../lib/volver';

const R2 = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL;

// Tarjeta de producto. Al pasar el mouse la foto se acerca suavemente (zoom).
export default function ProductoCard({ producto, priority = false, indice = 0, etiquetaPrecio = 'Desde' }) {
  const { cod_modelo, foto_principal, nombre, precio, stock, totalColores } = producto;
  const nombreModelo = (nombre.split(' / ')[0]?.trim() || nombre).toLowerCase();
  const imgUrl = `${R2}/${cod_modelo}/${foto_principal}.webp`;
  const oferta = useOferta(stock === 0 ? null : cod_modelo);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.05 }}
      transition={{ duration: 0.8, delay: (indice % 4) * 0.08, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link href={`/catalogo/${cod_modelo}`} className="producto-card" onClick={guardarPosicion}>
        <div className="producto-img-wrap">
          <ProductoImg src={imgUrl} alt={nombreModelo} priority={priority} />
          {stock === 0 && <span className="producto-badge">Agotado</span>}
          {oferta && <span className="producto-badge oferta-badge">Oferta</span>}
          <span className="producto-ver" aria-hidden="true">Ver modelo</span>
        </div>
        <p className="producto-nombre">{nombreModelo}</p>
        {totalColores > 0 && (
          <p className="producto-colores">{totalColores} {totalColores === 1 ? 'color' : 'colores'}</p>
        )}
        <p className="producto-precio">
          {etiquetaPrecio && <small>{etiquetaPrecio}</small>}
          {oferta && <s className="precio-antes">S/ {(Number(precio) + montoOferta(cod_modelo)).toFixed(2)}</s>}
          <span className={oferta ? 'precio-oferta' : undefined}>S/ {Number(precio).toFixed(2)}</span>
        </p>
        {oferta && <p className="oferta-restante">{oferta.restante}</p>}
      </Link>
    </motion.div>
  );
}

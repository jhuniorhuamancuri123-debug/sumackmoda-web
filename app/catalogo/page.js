import { Suspense } from "react";
import CatalogoClient from "./CatalogoClient";

export const metadata = {
  title: 'Catálogo | SUMACK - Polos Masculinos Premium',
  description: 'Explora nuestra colección completa de polos masculinos. Tallas S a XXL, múltiples colores. Envíos a todo el Perú.',
  openGraph: {
    title: 'Catálogo | SUMACK - Polos Masculinos Premium',
    description: 'Colección completa de polos masculinos premium peruanos.',
    url: 'https://sumackmoda.com/catalogo',
    images: [{ url: 'https://sumackmoda.com/og-image.jpg' }],
  },
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <CatalogoClient />
    </Suspense>
  );
}
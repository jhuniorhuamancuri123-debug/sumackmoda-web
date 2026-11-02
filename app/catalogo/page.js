import { Suspense } from "react";
import CatalogoClient from "./CatalogoClient";

export const metadata = {
  title: 'Catálogo de polos para hombre: camiseros, cuello chino y cuello V | SUMACK',
  description: 'Todos nuestros polos para hombre en un solo lugar: camiseros, cuello chino, cuello V, manga larga, poleras y casacas. Tallas S a XXL, varios colores y envíos a todo el Perú.',
  alternates: { canonical: 'https://sumackmoda.com/catalogo' },
  openGraph: {
    title: 'Catálogo de polos para hombre | SUMACK',
    description: 'Camiseros, cuello chino, cuello V, manga larga, poleras y casacas. Envíos a todo el Perú.',
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
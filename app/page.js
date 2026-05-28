import { Suspense } from "react";
import CatalogoClient from "./catalogo/CatalogoClient";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <CatalogoClient />
    </Suspense>
  );
}
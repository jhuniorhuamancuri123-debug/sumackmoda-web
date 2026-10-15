import { Suspense } from "react";
import EnviosVentasClient from "./EnviosVentasClient";

export const metadata = {
  title: "Registro de envíos — Vendedoras | SUMACK",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <EnviosVentasClient />
    </Suspense>
  );
}

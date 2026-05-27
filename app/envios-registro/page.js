import { Suspense } from "react";
import EnviosRegistroClient from "./EnviosRegistroClient";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <EnviosRegistroClient />
    </Suspense>
  );
}
// POST /api/envios-ventas/verificar  → comprueba la clave de vendedora.
import { NextResponse } from "next/server";
import { pinValido } from "../pin";

export async function POST(req) {
  if (!(process.env.VENTAS_PIN || "").trim()) {
    return NextResponse.json({ ok: false, msg: "Falta configurar VENTAS_PIN en Vercel." }, { status: 500 });
  }
  if (!pinValido(req)) {
    return NextResponse.json({ ok: false, msg: "Clave incorrecta." }, { status: 401 });
  }
  return NextResponse.json({ ok: true, ia: Boolean((process.env.ANTHROPIC_API_KEY || "").trim()) });
}

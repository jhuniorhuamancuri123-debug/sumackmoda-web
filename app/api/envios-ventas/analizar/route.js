// POST /api/envios-ventas/analizar
// Recibe el mensaje que pegó la vendedora y devuelve los datos de envío
// extraídos por Claude + la agencia Shalom más parecida de la base de datos.
//
// Variables de entorno (Vercel → Settings → Environment Variables, y .env.local):
//   ANTHROPIC_API_KEY  = clave de la API de Claude (console.anthropic.com)   ← OBLIGATORIA
//   VENTAS_PIN         = clave que usan las vendedoras para entrar            ← OBLIGATORIA
//   ANTHROPIC_MODEL    = (opcional) para usar otro modelo. Por defecto: claude-haiku-5-5
//                        (ej. ANTHROPIC_MODEL=claude-sonnet-5-5 si Haiku se equivoca mucho)

import { NextResponse } from "next/server";
import { AGENCIAS_SHALOM } from "../../../lib/agenciasShalom";
import { agenciaPorId, buscarAgencias } from "../../../lib/agenciasBuscar";
import { INSTRUCCIONES_IA, HERRAMIENTA_IA } from "../../../lib/enviosVentasPrompt";
import { pinValido } from "../pin";

export const maxDuration = 60;

const MODELO_DEFECTO = "claude-haiku-5-5";

// Listado compacto que se le da a la IA (se guarda en caché del lado de Anthropic).
const LISTADO_AGENCIAS =
  "LISTADO DE AGENCIAS SHALOM\n" +
  "id | nombre (plantilla) | nombre web | departamento | provincia | distrito | dirección\n" +
  AGENCIAS_SHALOM.map((a) =>
    [a.id, a.n.replace(/\s+/g, " "), a.w || "", a.dep, a.prov, a.dist, (a.d || "").slice(0, 90)].join(" | ")
  ).join("\n");

function soloDigitos(s) {
  return String(s || "").replace(/\D/g, "");
}

function limpiarTelefono(t) {
  let d = soloDigitos(t);
  if (d.length === 11 && d.startsWith("51")) d = d.slice(2);
  return d;
}

export async function POST(req) {
  if (!pinValido(req)) {
    return NextResponse.json({ ok: false, msg: "Clave de vendedora incorrecta." }, { status: 401 });
  }
  const apiKey = (process.env.ANTHROPIC_API_KEY || "").trim();
  if (!apiKey) {
    return NextResponse.json({ ok: false, msg: "Falta configurar ANTHROPIC_API_KEY en Vercel." }, { status: 500 });
  }

  let texto = "";
  try {
    ({ texto } = await req.json());
  } catch {}
  texto = String(texto || "").trim();
  if (texto.length < 5) {
    return NextResponse.json({ ok: false, msg: "Pega el mensaje del cliente primero." }, { status: 400 });
  }
  if (texto.length > 6000) texto = texto.slice(0, 6000);

  let r;
  try {
    r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || MODELO_DEFECTO,
        max_tokens: 1024,
        temperature: 0,
        system: [
          { type: "text", text: INSTRUCCIONES_IA },
          { type: "text", text: LISTADO_AGENCIAS, cache_control: { type: "ephemeral" } },
        ],
        tools: [HERRAMIENTA_IA],
        tool_choice: { type: "tool", name: HERRAMIENTA_IA.name },
        messages: [
          { role: "user", content: "MENSAJE DEL CLIENTE:\n\"\"\"\n" + texto + "\n\"\"\"" },
        ],
      }),
    });
  } catch (e) {
    return NextResponse.json({ ok: false, msg: "No se pudo conectar con la IA. Intenta de nuevo." }, { status: 502 });
  }

  if (!r.ok) {
    let det = "";
    try { det = (await r.json())?.error?.message || ""; } catch {}
    let msg = `Error de la IA (${r.status}).`;
    if (r.status === 401) msg = "La clave ANTHROPIC_API_KEY no es válida.";
    if (r.status === 429) msg = "La IA está ocupada, espera unos segundos y vuelve a intentar.";
    if (/credit|billing/i.test(det)) msg = "Sin créditos en la cuenta de la API de Claude (console.anthropic.com).";
    return NextResponse.json({ ok: false, msg, detalle: det }, { status: 502 });
  }

  const data = await r.json();
  const uso = data?.content?.find((c) => c.type === "tool_use");
  const x = uso?.input;
  if (!x) {
    return NextResponse.json({ ok: false, msg: "La IA no devolvió datos. Intenta de nuevo." }, { status: 502 });
  }

  // ── Validación y limpieza del lado del servidor ─────────────────────────────
  const advertencias = [];
  const documento = String(x.documento || "").replace(/[\s.\-]/g, "").toUpperCase();
  const telefono = limpiarTelefono(x.telefono);
  const empresa = String(x.empresa || "SHALOM").trim().toUpperCase() || "SHALOM";
  const esShalom = empresa.includes("SHALOM");

  if (!documento) advertencias.push("No se encontró DNI/CE.");
  else if (x.tipo_documento === "DNI" && documento.length !== 8) advertencias.push("El DNI no tiene 8 dígitos.");
  if (!telefono) advertencias.push("No se encontró celular.");
  else if (!/^9\d{8}$/.test(telefono)) advertencias.push("El celular no tiene 9 dígitos o no empieza con 9.");

  let agencia = null;
  let alternativas = [];
  let confianza = x.confianza_agencia || "baja";

  if (esShalom) {
    agencia = agenciaPorId(x.agencia_id);
    alternativas = (x.agencias_alternativas || [])
      .map(agenciaPorId)
      .filter((a) => a && (!agencia || a.id !== agencia.id));
    // Respaldo: si la IA no eligió, buscamos por texto en la base de datos
    if (!agencia && x.texto_destino) {
      const cand = buscarAgencias(x.texto_destino, 5);
      if (cand.length) {
        agencia = cand[0];
        confianza = "baja";
        alternativas = cand.slice(1);
      }
    }
    if (!agencia) advertencias.push("No se pudo identificar la agencia: elígela manualmente.");
    else if (confianza !== "alta") advertencias.push("Verifica la agencia elegida.");
  }

  const monto = typeof x.monto === "number" && x.monto > 0 ? x.monto : null;

  return NextResponse.json({
    ok: true,
    datos: {
      nombre: String(x.nombre_completo || "").trim().toUpperCase(),
      tipoDoc: x.tipo_documento || "",
      dni: documento,
      telefono,
      empresa: esShalom ? "SHALOM" : empresa,
      textoDestino: x.texto_destino || "",
      agenciaOtra: esShalom ? "" : String(x.agencia_otra_empresa || x.texto_destino || "").trim(),
      monto,
      observaciones: x.observaciones || "",
    },
    agencia,
    alternativas: alternativas.slice(0, 4),
    confianza,
    advertencias,
  });
}

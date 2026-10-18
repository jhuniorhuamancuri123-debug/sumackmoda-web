// POST /api/envios-ventas/duplicados   body: { dnis: ["70503353", ...] }
// Busca en el Google Sheet de envíos si esos DNI ya se registraron en los últimos días.
// El Sheet es PRIVADO: se lee con el Apps Script (función doGet) usando una clave.
//
// Variables de entorno (Vercel):
//   SHEET_TOKEN         = la misma clave que pusiste en el Apps Script (TOKEN_LECTURA)  ← para activar
//   SHEET_LECTURA_URL   = (opcional) URL /exec del Apps Script. Por defecto, la del registro.
//   DUP_DIAS            = (opcional) cuántos días hacia atrás revisar. Por defecto 3.
// Si SHEET_TOKEN no está configurado, responde { disponible: false } y no bloquea nada.

import { NextResponse } from "next/server";
import { pinValido } from "../pin";

export const maxDuration = 30;

const SCRIPT_URL_DEFECTO =
  "https://script.google.com/macros/s/AKfycbzAQDMZFD-j64wula9ETdiBTIXEXOzDWZ1fN4xyRL4CAmtzW0FMllKetR5LozBpMeKLtw/exec";

let _cache = { t: 0, filas: null };

function parseCSV(txt) {
  const filas = [];
  let fila = [], campo = "", comillas = false;
  for (let i = 0; i < txt.length; i++) {
    const ch = txt[i];
    if (comillas) {
      if (ch === '"' && txt[i + 1] === '"') { campo += '"'; i++; }
      else if (ch === '"') comillas = false;
      else campo += ch;
    } else if (ch === '"') comillas = true;
    else if (ch === ",") { fila.push(campo); campo = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && txt[i + 1] === "\n") i++;
      fila.push(campo); filas.push(fila); fila = []; campo = "";
    } else campo += ch;
  }
  if (campo || fila.length) { fila.push(campo); filas.push(fila); }
  return filas;
}

const norm = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

function columna(cab, ...claves) {
  for (const k of claves) {
    const i = cab.findIndex((c) => norm(c).includes(k));
    if (i >= 0) return i;
  }
  return -1;
}

function parseFecha(f) {
  const m = String(f || "").match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  return m ? new Date(+m[3], +m[2] - 1, +m[1]) : null;
}

async function leerSheet() {
  if (_cache.filas && Date.now() - _cache.t < 30000) return _cache.filas;
  const url = (process.env.SHEET_LECTURA_URL || SCRIPT_URL_DEFECTO).trim();
  const r = await fetch(`${url}?token=${encodeURIComponent(process.env.SHEET_TOKEN.trim())}`, { redirect: "follow", cache: "no-store" });
  const txt = await r.text();
  if (!r.ok || txt.startsWith("ERROR") || txt.trim().startsWith("<")) throw new Error("No se pudo leer el Sheet");
  const filas = parseCSV(txt);
  _cache = { t: Date.now(), filas };
  return filas;
}

export async function POST(req) {
  if (!pinValido(req)) return NextResponse.json({ ok: false, msg: "Clave incorrecta." }, { status: 401 });
  if (!(process.env.SHEET_TOKEN || "").trim()) return NextResponse.json({ ok: true, disponible: false });

  let dnis = [];
  try { ({ dnis } = await req.json()); } catch {}
  const buscados = new Set((dnis || []).map((d) => String(d).trim().toUpperCase()).filter(Boolean));
  if (!buscados.size) return NextResponse.json({ ok: true, disponible: true, encontrados: {} });

  let filas;
  try { filas = await leerSheet(); }
  catch { return NextResponse.json({ ok: true, disponible: false, msg: "No se pudo leer el Sheet" }); }
  if (!filas.length) return NextResponse.json({ ok: true, disponible: true, encontrados: {} });

  const cab = filas[0];
  const cDni = columna(cab, "dni", "documento");
  const cFecha = columna(cab, "fecha");
  const cHora = columna(cab, "hora");
  const cNombre = columna(cab, "nombre");
  const cAgencia = columna(cab, "agencia");
  const cTienda = columna(cab, "tienda", "almacen");
  if (cDni < 0) return NextResponse.json({ ok: true, disponible: false, msg: "El Sheet no tiene columna DNI" });

  const dias = parseInt(process.env.DUP_DIAS || "3", 10) || 3;
  const desde = new Date();
  desde.setHours(0, 0, 0, 0);
  desde.setDate(desde.getDate() - (dias - 1));

  const encontrados = {};
  for (const f of filas.slice(1)) {
    const dni = String(f[cDni] || "").replace(/[\s.\-]/g, "").toUpperCase();
    if (!buscados.has(dni)) continue;
    const fecha = cFecha >= 0 ? f[cFecha] : "";
    const fd = parseFecha(fecha);
    if (fd && fd < desde) continue;
    (encontrados[dni] ||= []).push({
      fecha, hora: cHora >= 0 ? f[cHora] : "",
      nombre: cNombre >= 0 ? f[cNombre] : "",
      agencia: cAgencia >= 0 ? f[cAgencia] : "",
      tienda: cTienda >= 0 ? f[cTienda] : "",
    });
  }
  return NextResponse.json({ ok: true, disponible: true, encontrados });
}

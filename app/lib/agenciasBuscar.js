import { AGENCIAS_SHALOM } from "./agenciasShalom";

export function normTxt(s) {
  return String(s || "")
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const ABREV = {
  sjl: "san juan de lurigancho", smp: "san martin de porres", sjm: "san juan de miraflores",
  vmt: "villa maria del triunfo", ves: "villa el salvador", av: "", jr: "", urb: "",
  calle: "", agencia: "", shalom: "", de: "", del: "", la: "", el: "", los: "", las: "",
  en: "", a: "", al: "", por: "", favor: "", envio: "", enviar: "", mi: "", para: "",
};

const INDICE = AGENCIAS_SHALOM.map((a) => ({
  a,
  nombre: normTxt(a.n + " " + (a.w || "")),
  lugar: normTxt(a.dep + " " + a.prov + " " + a.dist),
  dir: normTxt(a.d || ""),
}));

const POR_ID = new Map(AGENCIAS_SHALOM.map((a) => [a.id, a]));

export function agenciaPorId(id) {
  return POR_ID.get(Number(id)) || null;
}

function tokens(q) {
  const out = [];
  for (const t of normTxt(q).split(" ")) {
    if (!t) continue;
    if (t in ABREV) {
      if (ABREV[t]) out.push(...ABREV[t].split(" "));
    } else {
      out.push(t);
    }
  }
  return [...new Set(out)];
}

// Búsqueda por puntaje: nombre pesa más que lugar, y lugar más que dirección.
export function buscarAgencias(q, limite = 30) {
  const ts = tokens(q);
  if (!ts.length) return [];
  const res = [];
  for (const it of INDICE) {
    let p = 0;
    let hits = 0;
    for (const t of ts) {
      const re = new RegExp("(^| )" + t);
      let h = 0;
      if (re.test(it.nombre)) h = 3;
      else if (re.test(it.lugar)) h = 2;
      else if (t.length > 2 && re.test(it.dir)) h = 1;
      if (h) { p += h; hits++; }
    }
    if (hits) res.push({ a: it.a, p: p + (hits === ts.length ? 5 : 0) });
  }
  res.sort((x, y) => y.p - x.p || x.a.n.localeCompare(y.a.n));
  return res.slice(0, limite).map((r) => r.a);
}

// Filtro estricto (todas las palabras deben aparecer): para el buscador manual.
export function filtrarAgencias(q, limite = 50) {
  const ts = normTxt(q).split(" ").filter(Boolean);
  if (!ts.length) return [];
  return INDICE
    .filter((it) => {
      const hay = it.nombre + " " + it.lugar + " " + it.dir;
      return ts.every((t) => hay.includes(t));
    })
    .slice(0, limite)
    .map((it) => it.a);
}

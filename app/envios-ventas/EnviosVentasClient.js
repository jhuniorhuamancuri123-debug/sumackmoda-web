"use client";
// ════════════════════════════════════════════════════════════════════════════
//  /envios-ventas — Registro de envíos para VENDEDORAS
//
//  Paso 1  La vendedora pega el mensaje de cada cliente (Cliente 1, 2, 3…).
//  Paso 2  Un solo botón "Analizar con IA" lee TODOS los mensajes a la vez:
//          nombre, DNI/CE, celular, empresa, agencia Shalom (con opciones) y monto.
//  Paso 3  La vendedora revisa/corrige. Mientras falte un dato obligatorio
//          (nombre, DNI/CE, celular, agencia) NO se puede registrar.
//  Paso 4  "Registrar envíos": guarda en el MISMO Google Sheet que
//          /envios-registro. La etiqueta de 80 mm la imprime SOLA la PC de la
//          tienda (programa "TIENDAS - ENVIOS" con impresión automática).
//          Opcional: "Imprimir aquí (A4)" con el formato de GestorAlegra.
//          El monto es opcional: si se pone sale como "Código".
// ════════════════════════════════════════════════════════════════════════════
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { agenciaPorId, filtrarAgencias } from "../lib/agenciasBuscar";

// Mismo Apps Script que usa /envios-registro (misma hoja de envíos)
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzAQDMZFD-j64wula9ETdiBTIXEXOzDWZ1fN4xyRL4CAmtzW0FMllKetR5LozBpMeKLtw/exec";

const TIENDAS = { "6to": "6TO PISO GUIZADO", "9no": "9NO PISO GUIZADO" };
const ANALISIS_EN_PARALELO = 4;

let _k = 0;
function nuevoCliente() {
  _k += 1;
  return {
    key: _k, texto: "", estado: "vacio", msg: "",
    nombre: "", dni: "", telefono: "", empresa: "SHALOM", agencia: null, agenciaOtra: "", monto: "",
    textoDestino: "", observaciones: "", alternativas: [], confianza: "", advertencias: [],
    buscando: false, q: "", registro: null,
  };
}

function lsGet(k) { try { return localStorage.getItem(k) || ""; } catch { return ""; } }
function lsSet(k, v) { try { localStorage.setItem(k, v); } catch {} }

function fechaHora() {
  const now = new Date();
  const z = (n) => String(n).padStart(2, "0");
  return {
    fecha: z(now.getDate()) + "/" + z(now.getMonth() + 1) + "/" + now.getFullYear(),
    hora: z(now.getHours()) + ":" + z(now.getMinutes()),
  };
}

// Datos obligatorios. Devuelve la lista de lo que falta (vacía = completo).
function faltantes(c) {
  const f = [];
  const shalom = c.empresa === "SHALOM";
  if (c.nombre.trim().length < 3) f.push("nombre");
  if (c.dni.trim().length < 8) f.push("DNI/CE");
  if (!/^9\d{8}$/.test(c.telefono.trim())) f.push("celular");
  if (!shalom && c.empresa.trim().length < 2) f.push("empresa");
  if (shalom ? !c.agencia : c.agenciaOtra.trim().length < 3) f.push("agencia");
  if (c.monto.trim() !== "" && (isNaN(parseFloat(c.monto)) || parseFloat(c.monto) <= 0)) f.push("monto válido");
  return f;
}

export default function EnviosVentasClient() {
  const sp = useSearchParams();
  const [pin, setPin] = useState("");
  const [autenticado, setAutenticado] = useState(false);
  const [pinMsg, setPinMsg] = useState("");
  const [verificando, setVerificando] = useState(false);
  const [tienda, setTienda] = useState("6to");
  const [clientes, setClientes] = useState(() => [nuevoCliente()]);
  const [analizando, setAnalizando] = useState(false);
  const [registrando, setRegistrando] = useState(false);
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    const t = sp.get("tienda") || lsGet("ev_tienda");
    if (t === "9no" || t === "6to") setTienda(t);
    const p = lsGet("ev_pin");
    if (p) { setPin(p); verificar(p, true); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function verificar(p = pin, silencioso = false) {
    setVerificando(true);
    setPinMsg("");
    try {
      const r = await fetch("/api/envios-ventas/verificar", { method: "POST", headers: { "x-ventas-pin": p } });
      const j = await r.json();
      if (j.ok) {
        setAutenticado(true);
        lsSet("ev_pin", p);
        if (!j.ia) setAviso("Falta configurar la clave de la IA (ANTHROPIC_API_KEY).");
      } else if (!silencioso) {
        setPinMsg(j.msg || "Clave incorrecta.");
      }
    } catch {
      if (!silencioso) setPinMsg("Sin conexión. Intenta de nuevo.");
    }
    setVerificando(false);
  }

  function cambiarTienda(t) { setTienda(t); lsSet("ev_tienda", t); }

  function upd(key, cambios) {
    setClientes((cs) => cs.map((c) => (c.key === key ? { ...c, ...(typeof cambios === "function" ? cambios(c) : cambios) } : c)));
  }

  // ── Analizar TODOS los mensajes pegados con un solo botón ──────────────────
  async function analizarUno(c) {
    upd(c.key, { estado: "analizando", msg: "" });
    try {
      const r = await fetch("/api/envios-ventas/analizar", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-ventas-pin": pin },
        body: JSON.stringify({ texto: c.texto }),
      });
      const j = await r.json();
      if (r.status === 401) { upd(c.key, { estado: "vacio" }); setAutenticado(false); setPinMsg("Tu clave cambió. Ingrésala de nuevo."); return; }
      if (!j.ok) { upd(c.key, { estado: "error", msg: j.msg || "No se pudo analizar." }); return; }
      const d = j.datos;
      upd(c.key, {
        estado: "listo", msg: "",
        nombre: d.nombre, dni: d.dni, telefono: d.telefono,
        empresa: d.empresa || "SHALOM",
        agencia: j.agencia ? agenciaPorId(j.agencia.id) || j.agencia : null,
        agenciaOtra: d.agenciaOtra || "",
        monto: d.monto ? String(d.monto) : "",
        textoDestino: d.textoDestino, observaciones: d.observaciones,
        alternativas: j.alternativas || [], confianza: j.confianza || "",
        advertencias: j.advertencias || [],
      });
    } catch {
      upd(c.key, { estado: "error", msg: "Sin conexión. Vuelve a presionar Analizar." });
    }
  }

  async function analizarTodos() {
    const cola = clientes.filter((c) => c.texto.trim() && (c.estado === "vacio" || c.estado === "error"));
    if (!cola.length) return;
    setAnalizando(true);
    setAviso("");
    const trabajadores = Array.from({ length: Math.min(ANALISIS_EN_PARALELO, cola.length) }, async () => {
      while (cola.length) await analizarUno(cola.shift());
    });
    await Promise.all(trabajadores);
    setAnalizando(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ── Registrar en el Sheet + imprimir ─────────────────────────────────────
  async function registrarTodos() {
    const porRegistrar = clientes.filter((c) => c.estado === "listo");
    if (!porRegistrar.length || bloqueos.length) return;
    setRegistrando(true);
    const { fecha, hora } = fechaHora();
    const hechos = [];
    for (const c of porRegistrar) {
      upd(c.key, { estado: "registrando", msg: "" });
      const shalom = c.empresa === "SHALOM";
      const payload = {
        fecha, hora,
        nombre: c.nombre.trim().toUpperCase(),
        dni: c.dni.trim(),
        telefono: c.telefono.trim(),
        monto: c.monto.trim() ? "S/ " + parseFloat(c.monto).toFixed(2) : "",
        empresa: shalom ? "SHALOM" : c.empresa.trim().toUpperCase(),
        agencia: shalom ? c.agencia.n : c.agenciaOtra.trim().toUpperCase(),
        tienda: TIENDAS[tienda],
      };
      try {
        await fetch(SCRIPT_URL, { method: "POST", mode: "no-cors", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        const registro = {
          ...payload,
          departamento: shalom ? c.agencia.dep : "",
          provincia: shalom ? c.agencia.prov : "",
          distrito: shalom ? c.agencia.dist : "",
        };
        hechos.push(registro);
        upd(c.key, { estado: "registrado", msg: "Registrado " + hora, registro });
      } catch {
        upd(c.key, { estado: "listo", msg: "No se pudo registrar (sin internet). Vuelve a intentar." });
      }
    }
    setRegistrando(false);
    // La impresión de las etiquetas la hace sola la PC de la tienda (programa "TIENDAS - ENVIOS").
    // Aquí solo queda el botón opcional "Imprimir aquí (A4)".
    if (hechos.length) window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  }

  function reimprimir() {
    const regs = clientes.filter((c) => c.registro).map((c) => c.registro);
    if (regs.length) imprimirGuias(regs, window.open("", "_blank", "width=850,height=700"));
  }

  function agregar() { setClientes((cs) => [...cs, nuevoCliente()]); }
  function quitar(key) { setClientes((cs) => (cs.length === 1 ? [nuevoCliente()] : cs.filter((c) => c.key !== key))); }
  function nuevoLote() {
    if (clientes.some((c) => c.estado === "listo") && !confirm("Hay clientes sin registrar. ¿Borrar todo igual?")) return;
    setClientes([nuevoCliente()]);
    window.scrollTo(0, 0);
  }

  const porAnalizar = clientes.filter((c) => c.texto.trim() && (c.estado === "vacio" || c.estado === "error")).length;
  const listos = clientes.filter((c) => c.estado === "listo");
  const registrados = clientes.filter((c) => c.estado === "registrado").length;
  const bloqueos = clientes
    .map((c, i) => ({ n: i + 1, c }))
    .filter(({ c }) => c.estado === "listo" && faltantes(c).length)
    .map(({ n, c }) => `Cliente ${n}: falta ${faltantes(c).join(", ")}`);
  const sinAnalizar = clientes
    .map((c, i) => ({ n: i + 1, c }))
    .filter(({ c }) => c.texto.trim() && c.estado !== "listo" && c.estado !== "registrado" && c.estado !== "registrando")
    .map(({ n }) => n);

  // ── Pantalla de clave ─────────────────────────────────────────────────────
  if (!autenticado) {
    return (
      <div className="ev-root">
        <style>{CSS}</style>
        <div className="ev-header"><div className="ev-brand">SUMACK</div><div className="ev-sub">Registro de envíos — Vendedoras</div></div>
        <div className="ev-card ev-login">
          <label className="ev-label">Clave de vendedora</label>
          <input className="ev-input" type="password" inputMode="numeric" value={pin} autoFocus
            onChange={(e) => setPin(e.target.value)} onKeyDown={(e) => e.key === "Enter" && verificar()} />
          {pinMsg && <div className="ev-emsg">{pinMsg}</div>}
          <button className="ev-btn" onClick={() => verificar()} disabled={verificando || !pin}>{verificando ? "Verificando…" : "Entrar"}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="ev-root">
      <style>{CSS}</style>
      <div className="ev-header">
        <div className="ev-brand">SUMACK</div>
        <div className="ev-sub">Registro de envíos — Vendedoras ✨ con IA</div>
      </div>

      <div className="ev-wrap">
        {aviso && <div className="ev-aviso">{aviso}</div>}

        <div className="ev-bar">
          <span className="ev-bar-l">Tienda:</span>
          {Object.keys(TIENDAS).map((t) => (
            <button key={t} className={"ev-chip" + (tienda === t ? " on" : "")} onClick={() => cambiarTienda(t)}>{t === "6to" ? "6to piso" : "9no piso"}</button>
          ))}
        </div>

        <ol className="ev-pasos">
          <li className={porAnalizar || (!listos.length && !registrados) ? "on" : ""}>Pega el mensaje de cada cliente</li>
          <li className={analizando ? "on" : ""}>Presiona <b>Analizar con IA</b></li>
          <li className={listos.length ? "on" : ""}>Revisa y corrige los datos</li>
          <li className={registrados ? "on" : ""}><b>Registrar</b> — la tienda imprime sola</li>
        </ol>

        {clientes.map((c, i) => (
          <ClienteCard key={c.key} c={c} n={i + 1}
            onChange={(cambios) => upd(c.key, cambios)}
            onQuitar={() => quitar(c.key)} />
        ))}

        <button className="ev-btn-ghost" onClick={agregar} disabled={analizando || registrando}>＋ Agregar cliente {clientes.length + 1}</button>

        <div className="ev-foot">
          <div className="ev-count">{clientes.length} cliente(s) · {registrados} registrados · {listos.length} por registrar · {porAnalizar} por analizar</div>

          {porAnalizar > 0 && (
            <button className="ev-btn ev-btn-ia" onClick={analizarTodos} disabled={analizando || registrando}>
              {analizando ? <><span className="ev-spin" /> Analizando {porAnalizar} mensaje(s)…</> : `✨ Analizar con IA (${porAnalizar})`}
            </button>
          )}

          {listos.length > 0 && (
            <>
              {(bloqueos.length > 0 || (sinAnalizar.length > 0 && !analizando)) && (
                <div className="ev-bloqueo">
                  <b>No se puede registrar todavía:</b>
                  {bloqueos.map((b, k) => <div key={k}>• {b}</div>)}
                  {sinAnalizar.length > 0 && !analizando && <div>• Cliente {sinAnalizar.join(", ")}: falta analizar (o quítalo con ✕)</div>}
                </div>
              )}
              <button className="ev-btn ev-btn-ok" onClick={registrarTodos}
                disabled={registrando || analizando || bloqueos.length > 0 || sinAnalizar.length > 0}>
                {registrando ? "Registrando…" : `✔ Registrar envíos (${listos.length})`}
              </button>
            </>
          )}

          {registrados > 0 && !listos.length && (
            <div className="ev-ok-box">
              ✅ {registrados} envío(s) registrados. La etiqueta se imprimirá sola en la tienda (programa de envíos abierto).
              <div className="ev-ok-btns">
                <button className="ev-btn ev-btn-sec" onClick={reimprimir}>🖨 Imprimir aquí (A4)</button>
                <button className="ev-btn" onClick={nuevoLote}>Nuevo lote</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ClienteCard({ c, n, onChange, onQuitar }) {
  const bloqueado = c.estado === "registrado" || c.estado === "registrando";
  const analizado = ["listo", "registrando", "registrado"].includes(c.estado);
  const shalom = c.empresa === "SHALOM";
  const falta = c.estado === "listo" ? faltantes(c) : [];
  const resultados = c.buscando && c.q.trim().length >= 2 ? filtrarAgencias(c.q, 40) : [];
  const err = (k) => falta.includes(k);

  function elegirAgencia(a) {
    onChange({ agencia: a, buscando: false, q: "", confianza: "manual" });
  }

  const badge = {
    vacio: ["Por analizar", "gris"], analizando: ["Analizando…", "azul"],
    listo: falta.length ? ["Faltan datos", "rojo"] : ["Completo", "verde"],
    registrando: ["Registrando…", "azul"], registrado: ["✓ " + c.msg, "verde"], error: ["Error", "rojo"],
  }[c.estado];

  return (
    <div className={"ev-card" + (c.estado === "registrado" ? " ev-done" : "") + (falta.length ? " ev-falta" : "")}>
      <div className="ev-card-hdr">
        <span className="ev-card-title">Cliente {n}</span>
        <span className={"ev-badge " + badge[1]}>{badge[0]}</span>
        {!bloqueado && c.estado !== "analizando" && <button className="ev-x" onClick={onQuitar} title="Quitar cliente">✕</button>}
      </div>

      <div className="ev-body">
        {!analizado && (
          <>
            <textarea className="ev-text" rows={5} disabled={c.estado === "analizando"}
              placeholder="Pega aquí el mensaje del cliente (nombre, DNI, celular, agencia…)"
              value={c.texto} onChange={(e) => onChange({ texto: e.target.value, estado: "vacio", msg: "" })} />
            {c.msg && <div className="ev-emsg">{c.msg}</div>}
          </>
        )}

        {analizado && (
          <>
            <details className="ev-orig"><summary>Ver mensaje original</summary><pre>{c.texto}</pre></details>

            {(c.advertencias.length > 0 || c.observaciones) && c.estado !== "registrado" && (
              <div className="ev-warn">
                {c.advertencias.map((a, k) => <div key={k}>⚠️ {a}</div>)}
                {c.observaciones && <div>📝 {c.observaciones}</div>}
              </div>
            )}

            <Campo label="Nombre y apellidos *" err={err("nombre") && "Falta el nombre"}>
              <input className={"ev-input" + (err("nombre") ? " bad" : "")} value={c.nombre} disabled={bloqueado} onChange={(e) => onChange({ nombre: e.target.value.toUpperCase() })} />
            </Campo>
            <div className="ev-row">
              <Campo label="DNI / CE *" err={err("DNI/CE") && "Mínimo 8 dígitos"}>
                <input className={"ev-input mono" + (err("DNI/CE") ? " bad" : "")} value={c.dni} inputMode="numeric" disabled={bloqueado} onChange={(e) => onChange({ dni: e.target.value.replace(/\s/g, "").toUpperCase() })} />
              </Campo>
              <Campo label="Celular *" err={err("celular") && "9 dígitos, empieza en 9"}>
                <input className={"ev-input mono" + (err("celular") ? " bad" : "")} value={c.telefono} inputMode="numeric" maxLength={9} disabled={bloqueado} onChange={(e) => onChange({ telefono: e.target.value.replace(/\D/g, "") })} />
              </Campo>
            </div>

            <Campo label="Empresa de transporte *" err={err("empresa") && "Escribe la empresa"}>
              <div className="ev-seg">
                <button className={shalom ? "on" : ""} disabled={bloqueado} onClick={() => onChange({ empresa: "SHALOM" })}>🚚 Shalom</button>
                <button className={!shalom ? "on" : ""} disabled={bloqueado} onClick={() => shalom && onChange({ empresa: "" })}>📦 Otra</button>
              </div>
              {!shalom && <input className={"ev-input" + (err("empresa") ? " bad" : "")} placeholder="Ej: OLVA, MARVISUR…" value={c.empresa} disabled={bloqueado} onChange={(e) => onChange({ empresa: e.target.value.toUpperCase() })} />}
            </Campo>

            {shalom ? (
              <Campo label="Agencia Shalom (destino) *" err={err("agencia") && "Elige una agencia"}>
                {c.textoDestino && <div className="ev-dest">El cliente escribió: <i>“{c.textoDestino}”</i></div>}
                {c.agencia ? (
                  <div className={"ev-ag conf-" + (c.confianza || "baja")}>
                    <div className="ev-ag-n">{c.agencia.n}</div>
                    <div className="ev-ag-l">{c.agencia.dist} · {c.agencia.prov} · {c.agencia.dep}</div>
                    {c.agencia.d && <div className="ev-ag-d">{c.agencia.d}</div>}
                    <div className="ev-ag-c">
                      {c.confianza === "alta" && "IA: coincidencia alta"}
                      {c.confianza === "media" && "IA: coincidencia media — verifica"}
                      {c.confianza === "baja" && "IA: coincidencia baja — verifica"}
                      {c.confianza === "manual" && "Elegida manualmente"}
                    </div>
                  </div>
                ) : <div className="ev-ag vacia">Sin agencia elegida</div>}

                {!bloqueado && c.alternativas.length > 0 && (
                  <div className="ev-alts">
                    <span>Otras opciones posibles:</span>
                    {c.alternativas.filter((a) => !c.agencia || a.id !== c.agencia.id).map((a) => (
                      <button key={a.id} className="ev-alt" onClick={() => elegirAgencia(agenciaPorId(a.id) || a)}>{a.n} <small>({a.dist})</small></button>
                    ))}
                  </div>
                )}

                {!bloqueado && (c.buscando ? (
                  <div className="ev-search">
                    <input className="ev-input" autoFocus placeholder="Busca por agencia, calle, distrito o ciudad…" value={c.q} onChange={(e) => onChange({ q: e.target.value })} />
                    <div className="ev-res">
                      {resultados.map((a) => (
                        <button key={a.id} className="ev-res-it" onClick={() => elegirAgencia(a)}>
                          <b>{a.n}</b><span>{a.dist} · {a.prov} · {a.dep}</span>
                        </button>
                      ))}
                      {c.q.trim().length >= 2 && !resultados.length && <div className="ev-res-none">Sin resultados</div>}
                    </div>
                    <button className="ev-link" onClick={() => onChange({ buscando: false, q: "" })}>Cancelar</button>
                  </div>
                ) : (
                  <button className="ev-btn-ghost sm" onClick={() => onChange({ buscando: true })}>🔍 Buscar otra agencia</button>
                ))}
              </Campo>
            ) : (
              <Campo label="Agencia / lugar de envío *" err={err("agencia") && "Escribe el lugar de envío"}>
                <input className={"ev-input" + (err("agencia") ? " bad" : "")} value={c.agenciaOtra} disabled={bloqueado} onChange={(e) => onChange({ agenciaOtra: e.target.value })} />
              </Campo>
            )}

            <Campo label="Monto / código (opcional)" err={err("monto válido") && "Monto inválido"}>
              <div className="ev-monto"><span>S/</span>
                <input className="ev-input mono" value={c.monto} inputMode="decimal" placeholder="Dejar vacío si no se sabe" disabled={bloqueado}
                  onChange={(e) => onChange({ monto: e.target.value.replace(/[^0-9.,]/g, "").replace(",", ".") })} />
              </div>
            </Campo>

            {c.msg && c.estado !== "registrado" && <div className="ev-emsg">{c.msg}</div>}

            {c.estado === "listo" && (
              <button className="ev-link" onClick={() => onChange({ estado: "vacio", msg: "" })}>✎ Corregir el mensaje y volver a analizar</button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Campo({ label, err, children }) {
  return (
    <div className="ev-fg">
      <label className="ev-label">{label}</label>
      {children}
      {err && <div className="ev-emsg">{err}</div>}
    </div>
  );
}

// ── Impresión: mismo diseño que GestorAlegra → Envíos (A4, 4 guías por hoja) ──
function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
}

function imprimirGuias(regs, w) {
  if (!w) { alert("El navegador bloqueó la ventana de impresión. Permite ventanas emergentes y usa 'Volver a imprimir'."); return; }
  const css = "@page{size:A4 portrait;margin:6mm 6mm 6mm 6mm}"
    + "*{margin:0;padding:0;box-sizing:border-box}"
    + "html,body{width:210mm;background:white;font-family:Arial,sans-serif}"
    + ".pagina{display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:4mm;width:198mm;height:282mm;page-break-after:always;break-after:page;page-break-inside:avoid}"
    + ".pagina:last-child{page-break-after:avoid;break-after:avoid}"
    + ".tarjeta{border:2px solid #222;border-radius:3mm;padding:5mm 7mm;display:flex;flex-direction:column;justify-content:space-evenly;overflow:hidden}"
    + ".t-logo{text-align:center;font-size:22pt;font-weight:900;letter-spacing:6px;padding-bottom:3mm;margin-bottom:2mm;border-bottom:2.5px solid #000}"
    + ".t-row{display:flex;align-items:baseline;gap:3mm;line-height:1.35}"
    + ".t-lbl{font-size:9pt;font-weight:700;text-transform:uppercase;min-width:22mm;flex-shrink:0;color:#444;letter-spacing:0.3px}"
    + ".t-val{font-size:15pt;font-weight:900;flex:1;color:#000;word-break:break-word}"
    + ".t-val.sm{font-size:12pt;font-weight:800}"
    + ".t-sep{border:none;border-top:1.5px dashed #888;margin:2mm 0}";

  const paginas = [];
  for (let i = 0; i < regs.length; i += 4) paginas.push(regs.slice(i, i + 4));

  const html = paginas.map((grupo) => '<div class="pagina">' + grupo.map((r) => {
    let montoFmt = "—";
    if (r.monto) {
      const mNum = parseFloat(String(r.monto).replace(/[^0-9.,]/g, "").replace(",", "."));
      if (!isNaN(mNum)) montoFmt = String(parseFloat(mNum.toFixed(2)));
    }
    const nombre = (r.nombre || "—").toUpperCase();
    const agencia = (r.agencia || "—").toUpperCase();
    const ubic = [r.distrito, r.provincia, r.departamento].filter(Boolean).join(" / ");
    const fila = (lbl, val, cls = "") => `<div class="t-row"><span class="t-lbl">${lbl}</span><span class="t-val ${cls}">${esc(val)}</span></div>`;
    return '<div class="tarjeta"><div class="t-logo">SUMACK</div>'
      + fila("Nombre", nombre, nombre.length > 28 ? "sm" : "")
      + fila("DNI / CE", r.dni || "—")
      + fila("Teléfono", r.telefono || "—")
      + '<hr class="t-sep">'
      + fila("Empresa", (r.empresa || "—").toUpperCase())
      + fila("Agencia", agencia, agencia.length > 30 ? "sm" : "")
      + (ubic ? fila("Destino", ubic, "sm") : "")
      + '<hr class="t-sep">'
      + fila("Codigo", montoFmt)
      + fila("Tienda", r.tienda || "—", "sm")
      + fila("Fecha reg.", (r.fecha || "") + (r.hora ? " " + r.hora : ""), "sm")
      + "</div>";
  }).join("") + "</div>").join("");

  w.document.open();
  w.document.write('<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Guías de envío SUMACK</title><style>' + css + "</style></head><body>" + html + "</body></html>");
  w.document.close();
  w.focus();
  setTimeout(() => {
    w.print();
    w.addEventListener("afterprint", () => w.close());
  }, 400);
}

const CSS = `
  .ev-root, .ev-root * { box-sizing: border-box; font-family: 'DM Sans','Segoe UI',system-ui,sans-serif; }
  .ev-root { min-height: 100vh; background: #f5f4f0; color: #0a0a0a; padding: 64px 0 60px; }
  .ev-header { background: #0a0a0a; padding: 18px 16px 16px; text-align: center; }
  .ev-brand { font-size: 22px; font-weight: 700; letter-spacing: 5px; color: #fff; }
  .ev-sub { font-size: 13px; color: rgba(255,255,255,.6); margin-top: 4px; }
  .ev-wrap { max-width: 560px; margin: 0 auto; padding: 14px 14px 0; display: flex; flex-direction: column; gap: 12px; }
  .ev-aviso { background: #fef3c7; border: 1px solid #fcd34d; color: #78350f; padding: 10px 14px; border-radius: 10px; font-size: 13px; }
  .ev-pasos { margin: 0; padding: 0 0 0 20px; font-size: 13px; color: #888; line-height: 1.7; }
  .ev-pasos li.on { color: #0a0a0a; font-weight: 600; }
  .ev-bar { display: flex; align-items: center; gap: 8px; }
  .ev-bar-l { font-size: 12px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #666; }
  .ev-chip { border: 1.5px solid #ddddd8; background: #fff; border-radius: 20px; padding: 7px 14px; font-size: 13px; font-weight: 600; cursor: pointer; }
  .ev-chip.on { background: #0a0a0a; color: #fff; border-color: #0a0a0a; }
  .ev-card { background: #fff; border: 1.5px solid #ddddd8; border-radius: 16px; overflow: hidden; }
  .ev-card.ev-done { border-color: #6ee7b7; opacity: .85; }
  .ev-card.ev-falta { border-color: #fca5a5; }
  .ev-login { max-width: 360px; margin: 32px auto; padding: 22px 18px; display: flex; flex-direction: column; gap: 12px; }
  .ev-card-hdr { background: #0a0a0a; color: #fff; padding: 11px 16px; display: flex; align-items: center; gap: 10px; }
  .ev-card-title { font-size: 13px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; }
  .ev-badge { font-size: 11px; font-weight: 600; padding: 3px 9px; border-radius: 20px; }
  .ev-badge.gris { background: rgba(255,255,255,.15); color: #fff; }
  .ev-badge.azul { background: #dbeafe; color: #1e40af; }
  .ev-badge.verde { background: #d1fae5; color: #065f46; }
  .ev-badge.rojo { background: #fee2e2; color: #991b1b; }
  .ev-x { margin-left: auto; background: none; border: none; color: rgba(255,255,255,.6); font-size: 16px; cursor: pointer; }
  .ev-body { padding: 16px; display: flex; flex-direction: column; gap: 14px; }
  .ev-text { width: 100%; border: 1.5px solid #ddddd8; border-radius: 10px; padding: 12px; font-size: 15px; resize: vertical; min-height: 110px; }
  .ev-text:focus, .ev-input:focus { outline: none; border-color: #0a0a0a; }
  .ev-fg { display: flex; flex-direction: column; gap: 6px; flex: 1; min-width: 0; }
  .ev-row { display: flex; gap: 10px; }
  .ev-label { font-size: 11px; font-weight: 700; letter-spacing: 1.1px; text-transform: uppercase; color: #666; }
  .ev-input { width: 100%; border: 1.5px solid #ddddd8; border-radius: 10px; padding: 11px 12px; font-size: 16px; background: #fff; color: #0a0a0a; }
  .ev-input.bad { border-color: #ef4444; background: #fef2f2; }
  .ev-input:disabled { background: #f5f4f0; color: #444; }
  .ev-input.mono { font-family: 'DM Mono',ui-monospace,monospace; letter-spacing: .5px; }
  .ev-emsg { font-size: 12px; color: #dc2626; font-weight: 500; }
  .ev-btn { background: #0a0a0a; color: #fff; border: none; border-radius: 12px; padding: 14px 16px; font-size: 15px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 8px; }
  .ev-btn:disabled { opacity: .45; cursor: default; }
  .ev-btn-ia { background: #4f46e5; font-size: 16px; padding: 16px; }
  .ev-btn-ok { background: #059669; font-size: 16px; padding: 16px; }
  .ev-btn-sec { background: #fff; color: #0a0a0a; border: 1.5px solid #0a0a0a; }
  .ev-btn-ghost { background: #fff; border: 1.5px dashed #bbb; color: #333; border-radius: 12px; padding: 13px; font-size: 14px; font-weight: 600; cursor: pointer; }
  .ev-btn-ghost.sm { padding: 9px 12px; font-size: 13px; border-style: solid; }
  .ev-link { background: none; border: none; color: #666; text-decoration: underline; font-size: 13px; cursor: pointer; padding: 4px; align-self: flex-start; }
  .ev-spin { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,.35); border-top-color: #fff; border-radius: 50%; animation: evspin .7s linear infinite; }
  @keyframes evspin { to { transform: rotate(360deg); } }
  .ev-orig summary { font-size: 12px; color: #666; cursor: pointer; }
  .ev-orig pre { white-space: pre-wrap; font-size: 12px; background: #f5f4f0; padding: 10px; border-radius: 8px; margin: 6px 0 0; font-family: inherit; }
  .ev-warn { background: #fffbeb; border: 1px solid #fcd34d; color: #78350f; border-radius: 10px; padding: 10px 12px; font-size: 13px; line-height: 1.5; }
  .ev-bloqueo { background: #fef2f2; border: 1px solid #fca5a5; color: #991b1b; border-radius: 10px; padding: 10px 12px; font-size: 13px; line-height: 1.6; }
  .ev-ok-box { background: #ecfdf5; border: 1px solid #6ee7b7; color: #065f46; border-radius: 12px; padding: 14px; font-size: 14px; font-weight: 600; display: flex; flex-direction: column; gap: 10px; }
  .ev-ok-btns { display: flex; gap: 10px; }
  .ev-ok-btns .ev-btn { flex: 1; }
  .ev-seg { display: flex; gap: 8px; }
  .ev-seg button { flex: 1; padding: 10px; border-radius: 10px; border: 1.5px solid #ddddd8; background: #fff; font-weight: 600; font-size: 14px; cursor: pointer; }
  .ev-seg button.on { background: #0a0a0a; color: #fff; border-color: #0a0a0a; }
  .ev-dest { font-size: 13px; color: #555; }
  .ev-ag { border: 1.5px solid #ddddd8; border-left-width: 5px; border-radius: 10px; padding: 10px 12px; }
  .ev-ag.conf-alta, .ev-ag.conf-manual { border-left-color: #10b981; }
  .ev-ag.conf-media { border-left-color: #f59e0b; }
  .ev-ag.conf-baja { border-left-color: #ef4444; }
  .ev-ag.vacia { color: #b91c1c; font-size: 14px; border-left-color: #ef4444; background: #fef2f2; }
  .ev-ag-n { font-weight: 700; font-size: 15px; }
  .ev-ag-l { font-size: 12px; color: #666; margin-top: 2px; }
  .ev-ag-d { font-size: 12px; color: #888; margin-top: 4px; line-height: 1.4; }
  .ev-ag-c { font-size: 11px; font-weight: 600; color: #555; margin-top: 6px; text-transform: uppercase; letter-spacing: .5px; }
  .ev-alts { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; font-size: 12px; color: #666; }
  .ev-alt { border: 1px solid #ddddd8; background: #f5f4f0; border-radius: 16px; padding: 5px 10px; font-size: 12px; font-weight: 600; cursor: pointer; }
  .ev-alt small { font-weight: 400; color: #777; }
  .ev-search { display: flex; flex-direction: column; gap: 6px; }
  .ev-res { max-height: 260px; overflow-y: auto; border: 1px solid #eee; border-radius: 10px; }
  .ev-res-it { display: flex; flex-direction: column; align-items: flex-start; gap: 2px; width: 100%; text-align: left; padding: 9px 12px; border: none; border-bottom: 1px solid #f0f0f0; background: #fff; cursor: pointer; font-size: 14px; }
  .ev-res-it span { font-size: 12px; color: #777; }
  .ev-res-it:hover { background: #f5f4f0; }
  .ev-res-none { padding: 10px 12px; font-size: 13px; color: #999; }
  .ev-monto { display: flex; align-items: center; gap: 8px; font-weight: 700; color: #666; }
  .ev-foot { display: flex; flex-direction: column; gap: 10px; align-items: stretch; margin-top: 6px; }
  .ev-count { font-size: 13px; color: #555; text-align: center; }
`;

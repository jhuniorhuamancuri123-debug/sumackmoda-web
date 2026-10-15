"use client";
// ════════════════════════════════════════════════════════════════════════════
//  /envios-ventas — Registro de envíos para VENDEDORAS
//  La vendedora pega el mensaje del cliente (WhatsApp, IG, etc.), la IA extrae
//  nombre, DNI/CE, celular y la agencia Shalom más parecida, y se registra en el
//  MISMO Google Sheet que el formulario de clientes (/envios-registro).
//  El monto es OPCIONAL: si se pone, sale en la impresión; si no, va vacío.
// ════════════════════════════════════════════════════════════════════════════
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { agenciaPorId, filtrarAgencias } from "../lib/agenciasBuscar";

// Mismo Apps Script que usa /envios-registro (misma hoja de envíos)
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzAQDMZFD-j64wula9ETdiBTIXEXOzDWZ1fN4xyRL4CAmtzW0FMllKetR5LozBpMeKLtw/exec";

const TIENDAS = { "6to": "6TO PISO GUIZADO", "9no": "9NO PISO GUIZADO" };

let _k = 0;
function nuevoCliente() {
  _k += 1;
  return {
    key: _k, texto: "", estado: "vacio", msg: "",
    nombre: "", dni: "", telefono: "", empresa: "SHALOM", agencia: null, agenciaOtra: "", monto: "",
    textoDestino: "", observaciones: "", alternativas: [], confianza: "", advertencias: [],
    errs: {}, buscando: false, q: "",
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

export default function EnviosVentasClient() {
  const sp = useSearchParams();
  const [pin, setPin] = useState("");
  const [autenticado, setAutenticado] = useState(false);
  const [pinMsg, setPinMsg] = useState("");
  const [verificando, setVerificando] = useState(false);
  const [tienda, setTienda] = useState("6to");
  const [clientes, setClientes] = useState(() => [nuevoCliente()]);

  // Tienda: ?tienda=9no tiene prioridad; si no, la última usada en este equipo
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
        if (!j.ia) setPinMsg("Aviso: falta configurar la clave de la IA (ANTHROPIC_API_KEY).");
      } else if (!silencioso) {
        setPinMsg(j.msg || "Clave incorrecta.");
      }
    } catch {
      if (!silencioso) setPinMsg("Sin conexión. Intenta de nuevo.");
    }
    setVerificando(false);
  }

  function cambiarTienda(t) { setTienda(t); lsSet("ev_tienda", t); }

  function upd(i, cambios) {
    setClientes((cs) => cs.map((c, j) => (j === i ? { ...c, ...(typeof cambios === "function" ? cambios(c) : cambios) } : c)));
  }

  async function analizar(i) {
    const c = clientes[i];
    if (!c.texto.trim()) { upd(i, { estado: "error", msg: "Pega el mensaje del cliente." }); return; }
    upd(i, { estado: "analizando", msg: "" });
    try {
      const r = await fetch("/api/envios-ventas/analizar", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-ventas-pin": pin },
        body: JSON.stringify({ texto: c.texto }),
      });
      const j = await r.json();
      if (r.status === 401) { upd(i, { estado: "vacio" }); setAutenticado(false); setPinMsg("Tu clave cambió. Ingrésala de nuevo."); return; }
      if (!j.ok) { upd(i, { estado: "error", msg: j.msg || "No se pudo analizar." }); return; }
      const d = j.datos;
      upd(i, {
        estado: "listo", msg: "",
        nombre: d.nombre, dni: d.dni, telefono: d.telefono,
        empresa: d.empresa || "SHALOM",
        agencia: j.agencia ? agenciaPorId(j.agencia.id) || j.agencia : null,
        agenciaOtra: d.agenciaOtra || "",
        monto: d.monto ? String(d.monto) : "",
        textoDestino: d.textoDestino, observaciones: d.observaciones,
        alternativas: j.alternativas || [], confianza: j.confianza || "",
        advertencias: j.advertencias || [], errs: {},
      });
    } catch {
      upd(i, { estado: "error", msg: "Sin conexión. Intenta de nuevo." });
    }
  }

  async function analizarTodos() {
    for (let i = 0; i < clientes.length; i++) {
      const c = clientes[i];
      if (c.texto.trim() && (c.estado === "vacio" || c.estado === "error")) await analizar(i);
    }
  }

  function validar(c) {
    const shalom = c.empresa === "SHALOM";
    const errs = {
      nombre: c.nombre.trim().length < 3,
      dni: c.dni.trim().length < 7,
      telefono: !/^\d{9}$/.test(c.telefono.trim()),
      agencia: shalom ? !c.agencia : c.agenciaOtra.trim().length < 3,
      empresa: !shalom && c.empresa.trim().length < 2,
      monto: c.monto.trim() !== "" && (isNaN(parseFloat(c.monto)) || parseFloat(c.monto) <= 0),
    };
    return errs;
  }

  async function registrar(i) {
    const c = clientes[i];
    const errs = validar(c);
    if (Object.values(errs).some(Boolean)) { upd(i, { errs, msg: "Revisa los campos en rojo." }); return false; }
    upd(i, { estado: "registrando", errs: {}, msg: "" });
    const { fecha, hora } = fechaHora();
    const shalom = c.empresa === "SHALOM";
    const payload = {
      fecha, hora,
      nombre: c.nombre.trim().toUpperCase(),
      dni: c.dni.trim(),
      telefono: c.telefono.trim(),
      monto: c.monto.trim() ? "S/ " + parseFloat(c.monto).toFixed(2) : "",
      empresa: shalom ? "SHALOM" : c.empresa.trim().toUpperCase(),
      agencia: shalom ? c.agencia.n : c.agenciaOtra.trim(),
      tienda: TIENDAS[tienda],
    };
    try {
      await fetch(SCRIPT_URL, { method: "POST", mode: "no-cors", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      upd(i, { estado: "registrado", msg: "Registrado " + hora });
      return true;
    } catch {
      upd(i, { estado: "listo", msg: "No se pudo registrar. Revisa tu internet e intenta otra vez." });
      return false;
    }
  }

  async function registrarTodos() {
    for (let i = 0; i < clientes.length; i++) {
      if (clientes[i].estado === "listo") await registrar(i);
    }
  }

  function agregar() { setClientes((cs) => [...cs, nuevoCliente()]); }
  function quitar(i) { setClientes((cs) => (cs.length === 1 ? [nuevoCliente()] : cs.filter((_, j) => j !== i))); }
  function nuevoLote() {
    if (clientes.some((c) => c.estado === "listo") && !confirm("Hay clientes analizados sin registrar. ¿Borrar todo igual?")) return;
    setClientes([nuevoCliente()]);
    window.scrollTo(0, 0);
  }

  const pendientes = clientes.filter((c) => c.texto.trim() && (c.estado === "vacio" || c.estado === "error")).length;
  const listos = clientes.filter((c) => c.estado === "listo").length;
  const registrados = clientes.filter((c) => c.estado === "registrado").length;

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
        {pinMsg && <div className="ev-aviso">{pinMsg}</div>}

        <div className="ev-bar">
          <span className="ev-bar-l">Tienda:</span>
          {Object.keys(TIENDAS).map((t) => (
            <button key={t} className={"ev-chip" + (tienda === t ? " on" : "")} onClick={() => cambiarTienda(t)}>{t === "6to" ? "6to piso" : "9no piso"}</button>
          ))}
        </div>

        <div className="ev-help">
          Pega el mensaje de cada cliente en su casilla y presiona <b>Analizar</b>. Revisa los datos (sobre todo la
          agencia) y luego <b>Registrar</b>. El monto es opcional.
        </div>

        {clientes.map((c, i) => (
          <ClienteCard key={c.key} c={c} n={i + 1}
            onChange={(cambios) => upd(i, cambios)}
            onAnalizar={() => analizar(i)}
            onRegistrar={() => registrar(i)}
            onQuitar={() => quitar(i)} />
        ))}

        <button className="ev-btn-ghost" onClick={agregar}>＋ Agregar cliente {clientes.length + 1}</button>

        <div className="ev-foot">
          <div className="ev-count">{registrados} registrados · {listos} por registrar · {pendientes} por analizar</div>
          <div className="ev-foot-btns">
            <button className="ev-btn ev-btn-sec" onClick={analizarTodos} disabled={!pendientes}>✨ Analizar todos ({pendientes})</button>
            <button className="ev-btn" onClick={registrarTodos} disabled={!listos}>✔ Registrar todos ({listos})</button>
          </div>
          {registrados > 0 && <button className="ev-link" onClick={nuevoLote}>Empezar un lote nuevo</button>}
        </div>
      </div>
    </div>
  );
}

function ClienteCard({ c, n, onChange, onAnalizar, onRegistrar, onQuitar }) {
  const bloqueado = c.estado === "registrado" || c.estado === "registrando";
  const analizado = ["listo", "registrando", "registrado"].includes(c.estado);
  const shalom = c.empresa === "SHALOM";
  const resultados = c.buscando && c.q.trim().length >= 2 ? filtrarAgencias(c.q, 40) : [];

  function campo(nombre, valor) {
    onChange((prev) => ({ [nombre]: valor, errs: { ...prev.errs, [nombre]: false } }));
  }
  function elegirAgencia(a) {
    onChange((prev) => ({ agencia: a, buscando: false, q: "", errs: { ...prev.errs, agencia: false }, confianza: "manual" }));
  }

  const badge = {
    vacio: ["Sin analizar", "gris"], analizando: ["Analizando…", "azul"], listo: ["Listo para registrar", "amar"],
    registrando: ["Registrando…", "azul"], registrado: ["✓ " + c.msg, "verde"], error: ["Error", "rojo"],
  }[c.estado];

  return (
    <div className={"ev-card" + (c.estado === "registrado" ? " ev-done" : "")}>
      <div className="ev-card-hdr">
        <span className="ev-card-title">Cliente {n}</span>
        <span className={"ev-badge " + badge[1]}>{badge[0]}</span>
        {!bloqueado && <button className="ev-x" onClick={onQuitar} title="Quitar">✕</button>}
      </div>

      <div className="ev-body">
        {!analizado && (
          <>
            <textarea className="ev-text" rows={5} placeholder="Pega aquí el mensaje del cliente (nombre, DNI, celular, agencia…)"
              value={c.texto} onChange={(e) => onChange({ texto: e.target.value, estado: c.estado === "error" ? "vacio" : c.estado })} />
            {c.msg && <div className="ev-emsg">{c.msg}</div>}
            <button className="ev-btn" onClick={onAnalizar} disabled={c.estado === "analizando" || !c.texto.trim()}>
              {c.estado === "analizando" ? <><span className="ev-spin" /> Analizando con IA…</> : "✨ Analizar con IA"}
            </button>
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

            <Campo label="Nombre y apellidos" err={c.errs.nombre && "Mínimo 3 letras"}>
              <input className="ev-input" value={c.nombre} disabled={bloqueado} onChange={(e) => campo("nombre", e.target.value)} />
            </Campo>
            <div className="ev-row">
              <Campo label="DNI / CE" err={c.errs.dni && "Mínimo 7 dígitos"}>
                <input className="ev-input mono" value={c.dni} inputMode="numeric" disabled={bloqueado} onChange={(e) => campo("dni", e.target.value.replace(/\s/g, ""))} />
              </Campo>
              <Campo label="Celular" err={c.errs.telefono && "9 dígitos"}>
                <input className="ev-input mono" value={c.telefono} inputMode="numeric" maxLength={9} disabled={bloqueado} onChange={(e) => campo("telefono", e.target.value.replace(/\D/g, ""))} />
              </Campo>
            </div>

            <Campo label="Empresa de transporte" err={c.errs.empresa && "Escribe la empresa"}>
              <div className="ev-seg">
                <button className={shalom ? "on" : ""} disabled={bloqueado} onClick={() => campo("empresa", "SHALOM")}>🚚 Shalom</button>
                <button className={!shalom ? "on" : ""} disabled={bloqueado} onClick={() => campo("empresa", shalom ? "" : c.empresa)}>📦 Otra</button>
              </div>
              {!shalom && <input className="ev-input" placeholder="Ej: OLVA, MARVISUR…" value={c.empresa} disabled={bloqueado} onChange={(e) => campo("empresa", e.target.value.toUpperCase())} />}
            </Campo>

            {shalom ? (
              <Campo label="Agencia Shalom (destino)" err={c.errs.agencia && "Elige una agencia"}>
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
                    <span>Otras opciones:</span>
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
              <Campo label="Agencia / lugar de envío" err={c.errs.agencia && "Escribe el lugar de envío"}>
                <input className="ev-input" value={c.agenciaOtra} disabled={bloqueado} onChange={(e) => campo("agenciaOtra", e.target.value)} />
              </Campo>
            )}

            <Campo label="Monto del pedido (opcional)" err={c.errs.monto && "Monto inválido"}>
              <div className="ev-monto"><span>S/</span>
                <input className="ev-input mono" value={c.monto} inputMode="decimal" placeholder="Dejar vacío si no se sabe" disabled={bloqueado}
                  onChange={(e) => campo("monto", e.target.value.replace(/[^0-9.,]/g, "").replace(",", "."))} />
              </div>
            </Campo>

            {c.msg && c.estado !== "registrado" && <div className="ev-emsg">{c.msg}</div>}

            {c.estado !== "registrado" && (
              <div className="ev-actions">
                <button className="ev-btn-ghost sm" disabled={bloqueado} onClick={() => onChange({ estado: "vacio", msg: "" })}>✎ Editar mensaje</button>
                <button className="ev-btn" onClick={onRegistrar} disabled={bloqueado}>{c.estado === "registrando" ? "Registrando…" : "✔ Registrar envío"}</button>
              </div>
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

const CSS = `
  .ev-root, .ev-root * { box-sizing: border-box; font-family: 'DM Sans','Segoe UI',system-ui,sans-serif; }
  .ev-root { min-height: 100vh; background: #f5f4f0; color: #0a0a0a; padding-bottom: 60px; }
  .ev-header { background: #0a0a0a; padding: 18px 16px 16px; text-align: center; }
  .ev-brand { font-size: 22px; font-weight: 700; letter-spacing: 5px; color: #fff; }
  .ev-sub { font-size: 13px; color: rgba(255,255,255,.6); margin-top: 4px; }
  .ev-wrap { max-width: 560px; margin: 0 auto; padding: 14px 14px 0; display: flex; flex-direction: column; gap: 12px; }
  .ev-aviso { background: #fef3c7; border: 1px solid #fcd34d; color: #78350f; padding: 10px 14px; border-radius: 10px; font-size: 13px; }
  .ev-help { font-size: 13px; color: #555; line-height: 1.5; }
  .ev-bar { display: flex; align-items: center; gap: 8px; }
  .ev-bar-l { font-size: 12px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #666; }
  .ev-chip { border: 1.5px solid #ddddd8; background: #fff; border-radius: 20px; padding: 7px 14px; font-size: 13px; font-weight: 600; cursor: pointer; }
  .ev-chip.on { background: #0a0a0a; color: #fff; border-color: #0a0a0a; }
  .ev-card { background: #fff; border: 1.5px solid #ddddd8; border-radius: 16px; overflow: hidden; }
  .ev-card.ev-done { border-color: #6ee7b7; opacity: .85; }
  .ev-login { max-width: 360px; margin: 32px auto; padding: 22px 18px; display: flex; flex-direction: column; gap: 12px; }
  .ev-card-hdr { background: #0a0a0a; color: #fff; padding: 11px 16px; display: flex; align-items: center; gap: 10px; }
  .ev-card-title { font-size: 13px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; }
  .ev-badge { font-size: 11px; font-weight: 600; padding: 3px 9px; border-radius: 20px; }
  .ev-badge.gris { background: rgba(255,255,255,.15); color: #fff; }
  .ev-badge.azul { background: #dbeafe; color: #1e40af; }
  .ev-badge.amar { background: #fef3c7; color: #92400e; }
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
  .ev-input:disabled { background: #f5f4f0; color: #444; }
  .ev-input.mono { font-family: 'DM Mono',ui-monospace,monospace; letter-spacing: .5px; }
  .ev-emsg { font-size: 12px; color: #dc2626; font-weight: 500; }
  .ev-btn { background: #0a0a0a; color: #fff; border: none; border-radius: 12px; padding: 14px 16px; font-size: 15px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 8px; }
  .ev-btn:disabled { opacity: .45; cursor: default; }
  .ev-btn-sec { background: #fff; color: #0a0a0a; border: 1.5px solid #0a0a0a; }
  .ev-btn-ghost { background: #fff; border: 1.5px dashed #bbb; color: #333; border-radius: 12px; padding: 13px; font-size: 14px; font-weight: 600; cursor: pointer; }
  .ev-btn-ghost.sm { padding: 9px 12px; font-size: 13px; border-style: solid; }
  .ev-link { background: none; border: none; color: #666; text-decoration: underline; font-size: 13px; cursor: pointer; padding: 4px; }
  .ev-spin { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,.35); border-top-color: #fff; border-radius: 50%; animation: evspin .7s linear infinite; }
  @keyframes evspin { to { transform: rotate(360deg); } }
  .ev-orig summary { font-size: 12px; color: #666; cursor: pointer; }
  .ev-orig pre { white-space: pre-wrap; font-size: 12px; background: #f5f4f0; padding: 10px; border-radius: 8px; margin: 6px 0 0; font-family: inherit; }
  .ev-warn { background: #fffbeb; border: 1px solid #fcd34d; color: #78350f; border-radius: 10px; padding: 10px 12px; font-size: 13px; line-height: 1.5; }
  .ev-seg { display: flex; gap: 8px; }
  .ev-seg button { flex: 1; padding: 10px; border-radius: 10px; border: 1.5px solid #ddddd8; background: #fff; font-weight: 600; font-size: 14px; cursor: pointer; }
  .ev-seg button.on { background: #0a0a0a; color: #fff; border-color: #0a0a0a; }
  .ev-dest { font-size: 13px; color: #555; }
  .ev-ag { border: 1.5px solid #ddddd8; border-left-width: 5px; border-radius: 10px; padding: 10px 12px; }
  .ev-ag.conf-alta, .ev-ag.conf-manual { border-left-color: #10b981; }
  .ev-ag.conf-media { border-left-color: #f59e0b; }
  .ev-ag.conf-baja { border-left-color: #ef4444; }
  .ev-ag.vacia { color: #999; font-size: 14px; border-left-color: #ef4444; }
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
  .ev-actions { display: flex; gap: 10px; justify-content: space-between; }
  .ev-actions .ev-btn { flex: 1; }
  .ev-foot { display: flex; flex-direction: column; gap: 10px; align-items: stretch; margin-top: 6px; }
  .ev-count { font-size: 13px; color: #555; text-align: center; }
  .ev-foot-btns { display: flex; gap: 10px; }
  .ev-foot-btns .ev-btn { flex: 1; font-size: 14px; }
`;

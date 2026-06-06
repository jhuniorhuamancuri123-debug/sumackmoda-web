"use client";
import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";

const AG = [{"n":"BAGUA CAPITAL","d":"JR. AMAZONAS C-9 MZ. 126 LT. 25, BAGUA - BAGUA - AMAZONAS, REF. FRENTE AL PARQUE JERUSALEN Y/O COSTADO DE AVICOLA YACEG","dep":"AMAZONAS","prov":"BAGUA","dist":"BAGUA"},{"n":"PEDRO RUIZ","d":"AV. SACSAHUAMAN N° 513 - PEDRO RUIZ, REF. A MEDIA CUADRA DE LA UGEL","dep":"AMAZONAS","prov":"BONGARA","dist":"JAZAN"},{"n":"CHACHAPOYAS CO DOS DE MAYO","d":"JR. DOS DE MAYO CDRA. 15 S/N CHACHAPOYAS, REFERENCIA: JUNTO A TERMINAL DE COMBIS ETSA","dep":"AMAZONAS","prov":"CHACHAPOYAS","dist":"CHACHAPOYAS"},{"n":"CHACHAPOYAS JR GRAU","d":"JR. GRAU 270, REF. JUNTO A LA AGENCIA DE VIAJES MONTEVERDE","dep":"AMAZONAS","prov":"CHACHAPOYAS","dist":"CHACHAPOYAS"},{"n":"LUYA","d":"JR. RAMÓN CASTILLA S/N, LUYA - AMAZONAS","dep":"AMAZONAS","prov":"LUYA","dist":"LUYA"},{"n":"BAGUA GRANDE","d":"AV. CHACHAPOYAS 1094 SECTOR GONCHILLO","dep":"AMAZONAS","prov":"UTCUBAMBA","dist":"BAGUA GRANDE"},{"n":"HUARAZ","d":"AV. 27 DE NOVIEMBRE CDRA. 20 S/N - VILLON BAJO","dep":"ANCASH","prov":"HUARAZ","dist":"HUARAZ"},{"n":"CHIMBOTE AV JOSE GALVEZ","d":"AV. JOSÉ GÁLVEZ 791, CHIMBOTE","dep":"ANCASH","prov":"SANTA","dist":"CHIMBOTE"},{"n":"ALTO TRUJILLO","d":"AV. PROLONGACIÓN 12 DE NOVIEMBRE, MZ. Q, LT. 25","dep":"LA LIBERTAD","prov":"TRUJILLO","dist":"EL PORVENIR"},{"n":"CANTO GRANDE","d":"CALLE SAN MARTIN CON AV. COMERCIAL NORTE 189 - SAN JUAN DE LURIGANCHO","dep":"LIMA","prov":"LIMA","dist":"SAN JUAN DE LURIGANCHO"},{"n":"AV PROCERES SJL","d":"AV. PRÓCERES DE LA INDEPENDENCIA NRO. 1295 - 1299","dep":"LIMA","prov":"LIMA","dist":"SAN JUAN DE LURIGANCHO"},{"n":"TARAPOTO JR LEONCIO PRADO","d":"JR. LEONCIO PRADO N° 1175","dep":"SAN MARTIN","prov":"SAN MARTIN","dist":"TARAPOTO"},{"n":"CUSCO PARQUE INDUSTRIAL","d":"AV. LAS AMERICAS MZ. E LT. 20, 2DA ETAPA, URB. PARQUE INDUSTRIAL, WANCHAQ","dep":"CUSCO","prov":"CUSCO","dist":"WANCHAQ"},{"n":"JULIACA AV LAMPA","d":"AV. LAMPA MZ. B2 LT. 3 URB. SANTA ADRIANA","dep":"PUNO","prov":"SAN ROMAN","dist":"JULIACA"},{"n":"AREQUIPA AV PARRA","d":"AV. PARRA 379 - AREQUIPA","dep":"AREQUIPA","prov":"AREQUIPA","dist":"AREQUIPA"}];

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzAQDMZFD-j64wula9ETdiBTIXEXOzDWZ1fN4xyRL4CAmtzW0FMllKetR5LozBpMeKLtw/exec";

function norm(s) {
  return (s || "").toLowerCase()
    .replace(/[áàâä]/g,"a").replace(/[éèêë]/g,"e")
    .replace(/[íìîï]/g,"i").replace(/[óòôö]/g,"o")
    .replace(/[úùûü]/g,"u").replace(/ñ/g,"n")
    .replace(/[^a-z0-9]/g," ").replace(/\s+/g," ").trim();
}

export default function EnviosRegistroClient() {
  const searchParams = useSearchParams();
  const tiendaParam = searchParams.get("tienda") === "9no" ? "9NO PISO GUIZADO" : "6TO PISO GUIZADO";
  const [tipo, setTipo] = useState("shalom");
  const [enviado, setEnviado] = useState(false);
  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(false);

  const [shNombre, setShNombre] = useState("");
  const [shDni, setShDni] = useState("");
  const [shTel, setShTel] = useState("");
  const [shMonto, setShMonto] = useState("");
  const [selAg, setSelAg] = useState(null);
  const [shErrs, setShErrs] = useState({});

  const [otNombre, setOtNombre] = useState("");
  const [otDni, setOtDni] = useState("");
  const [otTel, setOtTel] = useState("");
  const [otEmpresa, setOtEmpresa] = useState("");
  const [otAgencia, setOtAgencia] = useState("");
  const [otMonto, setOtMonto] = useState("");
  const [otErrs, setOtErrs] = useState({});

  const [sheetOpen, setSheetOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [tempAg, setTempAg] = useState(null);
  const [results, setResults] = useState([]);
  const searchRef = useRef(null);

  useEffect(() => {
    if (query.length < 2) { setResults([]); return; }
    const tokens = norm(query).split(" ").filter(Boolean);
    const found = AG.filter(a => {
      const hay = norm(a.n + " " + a.dep + " " + a.prov + " " + a.dist + " " + a.d);
      return tokens.every(t => hay.includes(t));
    }).slice(0, 50);
    setResults(found);
  }, [query]);

  function openSheet() {
    setTempAg(selAg);
    setQuery("");
    setResults([]);
    setSheetOpen(true);
    setTimeout(() => searchRef.current?.focus(), 320);
  }

  function confirmarAgencia() {
    if (!tempAg) return;
    setSelAg(tempAg);
    setShErrs(e => ({ ...e, agencia: false }));
    setSheetOpen(false);
  }

  function validateShalom() {
    const errs = {
      nombre:  shNombre.trim().length < 3,
      dni:     shDni.trim().length < 7,
      tel:     !/^\d{9}$/.test(shTel.trim()),
      agencia: !selAg,
      monto:   !shMonto || isNaN(parseFloat(shMonto)) || parseFloat(shMonto) <= 0,
    };
    setShErrs(errs);
    return !Object.values(errs).some(Boolean);
  }

  function validateOtras() {
    const errs = {
      nombre:  otNombre.trim().length < 3,
      dni:     otDni.trim().length < 7,
      tel:     !/^\d{9}$/.test(otTel.trim()),
      empresa: otEmpresa.trim().length < 2,
      agencia: otAgencia.trim().length < 3,
      monto:   !otMonto || isNaN(parseFloat(otMonto)) || parseFloat(otMonto) <= 0,
    };
    setOtErrs(errs);
    return !Object.values(errs).some(Boolean);
  }

  function buildFechaHora() {
    const now = new Date();
    const z = n => String(n).padStart(2,"0");
    return {
      fecha: z(now.getDate())+"/"+z(now.getMonth()+1)+"/"+now.getFullYear(),
      hora:  z(now.getHours())+":"+z(now.getMinutes()),
    };
  }

  async function submitShalom() {
    if (!validateShalom()) return;
    setLoading(true);
    const { fecha, hora } = buildFechaHora();
    const monto = "S/ "+parseFloat(shMonto).toFixed(2);
    const payload = { fecha, hora, nombre: shNombre.trim(), dni: shDni.trim(), telefono: shTel.trim(), monto, empresa: "SHALOM", agencia: selAg.n, tienda: tiendaParam };
    try { await fetch(SCRIPT_URL, { method:"POST", mode:"no-cors", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload) }); } catch(e) {}
    setResumen([
      { label:"Nombre",                val: shNombre.trim() },
      { label:"DNI / CE",              val: shDni.trim() },
      { label:"Teléfono",              val: shTel.trim() },
      { label:"Monto",                 val: monto },
      { label:"Empresa de transporte", val: "SHALOM" },
      { label:"Agencia Shalom",        val: selAg.n },
    ]);
    setLoading(false);
    setEnviado(true);
  }

  async function submitOtras() {
    if (!validateOtras()) return;
    setLoading(true);
    const { fecha, hora } = buildFechaHora();
    const monto = "S/ "+parseFloat(otMonto).toFixed(2);
    const payload = { fecha, hora, nombre: otNombre.trim(), dni: otDni.trim(), telefono: otTel.trim(), monto, empresa: otEmpresa.trim(), agencia: otAgencia.trim(), tienda: tiendaParam };
    try { await fetch(SCRIPT_URL, { method:"POST", mode:"no-cors", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload) }); } catch(e) {}
    setResumen([
      { label:"Nombre",                val: otNombre.trim() },
      { label:"DNI / CE",              val: otDni.trim() },
      { label:"Teléfono",              val: otTel.trim() },
      { label:"Monto",                 val: monto },
      { label:"Empresa de transporte", val: otEmpresa.trim() },
      { label:"Agencia / Lugar",       val: otAgencia.trim() },
    ]);
    setLoading(false);
    setEnviado(true);
  }

  useEffect(() => {
    if (enviado) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.scrollTo(0, 0);
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
        });
      });
    }
  }, [enviado]);

  // ─── tipografía: Google Fonts cargada via <link> inyectado una vez ───
  useEffect(() => {
    if (document.getElementById("er-gfonts")) return;
    const link = document.createElement("link");
    link.id   = "er-gfonts";
    link.rel  = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@500&display=swap";
    document.head.appendChild(link);
  }, []);

  const S = `
    /* ── reset tipografía ── */
    .er-root, .er-root * {
      font-family: 'DM Sans', 'Segoe UI', system-ui, sans-serif !important;
      box-sizing: border-box;
      -webkit-font-smoothing: antialiased;
    }

    /* ── contenedor ── */
    .er-root {
      padding-top: 0;
      min-height: 100vh;
      background: #f5f4f0;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    /* ── cabecera ── */
    .er-header {
      width: 100%;
      background: #0a0a0a;
      padding: 20px 20px 18px;
      text-align: center;
    }
    .er-header-brand {
      font-size: 22px;
      font-weight: 700;
      letter-spacing: 5px;
      color: #fff;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .er-header-sub {
      font-size: 13px;
      color: rgba(255,255,255,.55);
      font-weight: 400;
      letter-spacing: 0.3px;
    }

    /* ── selector tipo ── */
    .er-selector {
      width: 100%;
      max-width: 480px;
      padding: 16px 16px 0;
      display: flex;
      gap: 10px;
    }
    .er-tbtn {
      flex: 1;
      padding: 16px 10px 14px;
      border-radius: 14px;
      border: 2px solid #ddddd8;
      background: #fff;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 5px;
      transition: all .18s;
    }
    .er-tbtn-icon  { font-size: 26px; line-height: 1; }
    .er-tbtn-label { font-size: 13px; font-weight: 700; letter-spacing: .5px; text-transform: uppercase; color: #0a0a0a; }
    .er-tbtn-badge { font-size: 10px; padding: 3px 8px; border-radius: 20px; font-weight: 600; }
    .er-tbtn.sh-badge  .er-tbtn-badge { background: #d1fae5; color: #065f46; }
    .er-tbtn.ot-badge  .er-tbtn-badge { background: #fef3c7; color: #92400e; }
    .er-tbtn.active-sh { border-color: #0a0a0a; background: #0a0a0a; }
    .er-tbtn.active-sh .er-tbtn-label { color: #fff; }
    .er-tbtn.active-sh .er-tbtn-badge { background: rgba(255,255,255,.15); color: #fff; }
    .er-tbtn.active-ot { border-color: #f59e0b; background: #fffbeb; }

    /* ── aviso ── */
    .er-aviso {
      width: 100%;
      max-width: 480px;
      margin: 10px 0 0;
      padding: 11px 16px;
      border-radius: 10px;
      font-size: 13px;
      line-height: 1.55;
      font-weight: 400;
    }
    .er-aviso-sh { background: #d1fae5; border: 1px solid #6ee7b7; color: #065f46; }
    .er-aviso-ot { background: #fef3c7; border: 1px solid #fcd34d; color: #78350f; }

    /* ── tarjeta formulario ── */
    .er-card {
      width: 100%;
      max-width: 480px;
      margin: 12px 0 48px;
      background: #fff;
      border: 1.5px solid #ddddd8;
      border-radius: 16px;
      overflow: hidden;
    }
    .er-card-hdr {
      background: #0a0a0a;
      padding: 14px 20px;
    }
    .er-card-title {
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 1.5px;
      color: #fff;
      text-transform: uppercase;
    }
    .er-body {
      padding: 20px 18px;
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    /* ── campo ── */
    .er-fg { display: flex; flex-direction: column; gap: 7px; }

    .er-label {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 1.2px;
      text-transform: uppercase;
      color: #666;
      line-height: 1;
      display: block;
    }

    .er-input {
      width: 100%;
      padding: 16px 15px;
      border: 2px solid #ddddd8;
      border-radius: 12px;
      font-size: 17px;
      font-weight: 500;
      color: #0a0a0a;
      background: #fafafa;
      -webkit-appearance: none;
      outline: none;
      transition: border-color .15s, background .15s;
      line-height: 1.2;
      /* evita que el navegador cambie la fuente en inputs */
      font-family: 'DM Sans', 'Segoe UI', system-ui, sans-serif !important;
    }
    .er-input:focus {
      border-color: #0a0a0a;
      background: #fff;
    }
    .er-input.err   { border-color: #e03e3e !important; background: #fff5f5; }
    .er-input::placeholder { color: #bbb; font-weight: 400; }

    .er-emsg {
      font-size: 12px;
      font-weight: 600;
      color: #e03e3e;
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .er-emsg::before { content: "⚠"; font-size: 11px; }

    .er-hint {
      font-size: 12px;
      font-weight: 400;
      color: #1d4ed8;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 8px;
      padding: 8px 11px;
      line-height: 1.5;
    }

    /* ── botón agencia ── */
    .er-ag-btn {
      width: 100%;
      padding: 16px 15px;
      border: 2px solid #ddddd8;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 500;
      color: #aaa;
      background: #fafafa;
      text-align: left;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 9px;
      transition: border-color .15s;
      font-family: 'DM Sans', 'Segoe UI', system-ui, sans-serif !important;
    }
    .er-ag-btn.has-val { color: #0a0a0a; border-color: #0a0a0a; font-weight: 600; background: #fff; }
    .er-ag-btn.err     { border-color: #e03e3e !important; background: #fff5f5; }

    .er-ag-detail {
      background: #f5f4f0;
      border-radius: 10px;
      border: 2px solid #0a0a0a;
      padding: 13px 15px;
      position: relative;
    }
    .er-ag-name   { font-size: 15px; font-weight: 700; color: #0a0a0a; padding-right: 68px; line-height: 1.3; }
    .er-ag-loc    { font-size: 12px; color: #888; margin-top: 4px; font-weight: 400; }
    .er-ag-change {
      position: absolute; top: 13px; right: 13px;
      background: #0a0a0a; border: none;
      font-size: 11px; font-weight: 700;
      color: #fff; cursor: pointer;
      padding: 4px 10px; border-radius: 6px;
      font-family: 'DM Sans', 'Segoe UI', system-ui, sans-serif !important;
    }

    /* ── monto ── */
    .er-monto-row { position: relative; }
    .er-monto-prefix {
      position: absolute; left: 15px; top: 50%;
      transform: translateY(-50%);
      font-size: 17px; font-weight: 700; color: #555;
      pointer-events: none; line-height: 1;
      font-family: 'DM Sans', 'Segoe UI', system-ui, sans-serif !important;
    }
    .er-monto-row .er-input { padding-left: 38px; }

    /* ── botón submit ── */
    .er-btn {
      width: 100%;
      padding: 17px;
      background: #0a0a0a;
      color: #fff;
      border: none;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      letter-spacing: .05em;
      margin-top: 2px;
      font-family: 'DM Sans', 'Segoe UI', system-ui, sans-serif !important;
      transition: opacity .15s;
    }
    .er-btn:disabled { opacity: .4; cursor: default; }
    .er-btn:not(:disabled):active { opacity: .85; }

    .er-spinner {
      width: 20px; height: 20px;
      border: 2.5px solid rgba(255,255,255,.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: er-spin .7s linear infinite;
    }
    @keyframes er-spin { to { transform: rotate(360deg); } }

    /* ── pantalla de éxito ── */
    .er-success {
      width: 100%;
      max-width: 480px;
      margin: 24px 0 48px;
      text-align: center;
      animation: er-fadeup .4s ease;
      padding: 0 16px;
    }
    @keyframes er-fadeup {
      from { opacity: 0; transform: translateY(14px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .er-suc-circle {
      width: 72px; height: 72px;
      background: #0a0a0a;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 18px;
      font-size: 32px;
    }
    .er-suc-h2 {
      font-size: 26px;
      font-weight: 700;
      letter-spacing: 1px;
      color: #0a0a0a;
      margin-bottom: 6px;
      text-transform: uppercase;
    }
    .er-suc-p {
      font-size: 14px;
      font-weight: 400;
      color: #666;
      line-height: 1.6;
      max-width: 300px;
      margin: 0 auto 20px;
    }

    /* ── resumen de confirmación ── */
    .er-resumen {
      background: #fff;
      border: 1.5px solid #ddddd8;
      border-radius: 14px;
      overflow: hidden;
      text-align: left;
      margin-bottom: 14px;
    }
    .er-resumen-item {
      padding: 14px 18px;
      border-bottom: 1px solid #f0f0ec;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .er-resumen-item:last-child { border-bottom: none; }
    .er-resumen-label {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 1.3px;
      text-transform: uppercase;
      color: #999;
      line-height: 1;
      display: block;
    }
    .er-resumen-val {
      font-size: 17px;
      font-weight: 600;
      color: #0a0a0a;
      line-height: 1.3;
      display: block;
    }

    /* ── aviso whatsapp ── */
    .er-wa {
      background: #d1fae5;
      border: 1.5px solid #6ee7b7;
      border-radius: 12px;
      padding: 15px 18px;
      font-size: 14px;
      font-weight: 500;
      color: #065f46;
      display: flex;
      align-items: flex-start;
      gap: 12px;
      text-align: left;
      line-height: 1.5;
      margin-bottom: 12px;
    }
    .er-wa-icon { font-size: 24px; flex-shrink: 0; margin-top: -1px; }
    .er-cerrar  { font-size: 13px; color: #999; font-weight: 400; }

    /* ── sheet búsqueda ── */
    .er-overlay {
      position: fixed; inset: 0;
      background: rgba(0,0,0,.55);
      z-index: 900;
    }
    .er-sheet {
      position: fixed; left: 0; right: 0; bottom: 0;
      height: 88vh;
      background: #fff;
      border-radius: 20px 20px 0 0;
      z-index: 901;
      display: flex; flex-direction: column;
      overflow: hidden;
    }
    .er-sheet-handle {
      flex-shrink: 0;
      display: flex; justify-content: center;
      padding: 12px 0 8px;
    }
    .er-sheet-bar { width: 38px; height: 4px; background: #ddd; border-radius: 2px; }
    .er-sheet-top {
      flex-shrink: 0;
      padding: 0 16px 14px;
      border-bottom: 1px solid #f0f0ec;
    }
    .er-sheet-searchbox {
      display: flex; align-items: center; gap: 8px;
      border: 2px solid #ddddd8;
      border-radius: 12px;
      padding: 0 12px;
      background: #fafafa;
      transition: border-color .15s;
    }
    .er-sheet-searchbox:focus-within { border-color: #0a0a0a; background: #fff; }
    .er-ss-input {
      flex: 1;
      padding: 15px 0;
      border: none; outline: none;
      font-size: 17px;
      font-weight: 500;
      color: #0a0a0a;
      background: transparent;
      -webkit-appearance: none;
      font-family: 'DM Sans', 'Segoe UI', system-ui, sans-serif !important;
    }
    .er-ss-input::placeholder { color: #bbb; font-weight: 400; }
    .er-sheet-info {
      flex-shrink: 0;
      padding: 8px 18px 4px;
      font-size: 12px;
      font-weight: 500;
      color: #999;
      min-height: 28px;
    }
    .er-sheet-list { flex: 1; overflow-y: auto; -webkit-overflow-scrolling: touch; }
    .er-sitem {
      padding: 15px 18px;
      border-bottom: 1px solid #f5f4f0;
      cursor: pointer;
      transition: background .1s;
    }
    .er-sitem:active { background: #f5f4f0; }
    .er-sitem.sel {
      background: #f0f7ff;
      border-left: 3px solid #0a0a0a;
      padding-left: 15px;
    }
    .er-sitem-name { font-size: 15px; font-weight: 700; color: #0a0a0a; line-height: 1.3; }
    .er-sitem-loc  { font-size: 12px; color: #888; margin-top: 3px; font-weight: 400; }
    .er-sheet-footer {
      flex-shrink: 0;
      padding: 14px 16px;
      border-top: 1px solid #f0f0ec;
      background: #fff;
    }
    .er-btn-confirmar {
      width: 100%;
      padding: 16px;
      background: #0a0a0a;
      color: #fff;
      border: none;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 700;
      cursor: pointer;
      opacity: .35;
      transition: opacity .15s;
      font-family: 'DM Sans', 'Segoe UI', system-ui, sans-serif !important;
    }
    .er-btn-confirmar.active { opacity: 1; }
    .er-sheet-empty {
      padding: 48px 24px;
      text-align: center;
      font-size: 14px;
      color: #888;
      line-height: 1.7;
      font-weight: 400;
    }

    /* ── responsive ── */
    @media (max-width: 480px) {
      .er-selector, .er-aviso, .er-card, .er-success {
        width: calc(100% - 28px);
        margin-left: 14px;
        margin-right: 14px;
      }
      .er-aviso { margin-left: 14px; margin-right: 14px; }
    }
  `;

  return (
    <>
      <style>{S}</style>
      <div className="er-root">

        {/* cabecera */}
        <div className="er-header">
          <div className="er-header-brand">SUMACK</div>
          <div className="er-header-sub">Completa tus datos para coordinar la entrega ⚡</div>
        </div>

        {/* ── PANTALLA CONFIRMACIÓN ── */}
        {enviado && resumen && (
          <div className="er-success">
            <div className="er-suc-circle">✓</div>
            <h2 className="er-suc-h2">¡Datos recibidos!</h2>
            <p className="er-suc-p">Tu información de envío fue registrada correctamente.</p>

            <div className="er-resumen">
              {resumen.map((r, i) => (
                <div className="er-resumen-item" key={i}>
                  <span className="er-resumen-label">{r.label}</span>
                  <span className="er-resumen-val">{r.val}</span>
                </div>
              ))}
            </div>

            <div className="er-wa">
              <span className="er-wa-icon">📲</span>
              <span>Envíanos una <strong>captura de pantalla</strong> de esta página por <strong>WhatsApp</strong> para confirmar tu pedido.</span>
            </div>
            <p className="er-cerrar">✅ Ya puedes cerrar esta página.</p>
          </div>
        )}

        {/* ── FORMULARIO ── */}
        {!enviado && (
          <>
            {/* selector tipo */}
            <div className="er-selector">
              <button
                className={`er-tbtn sh-badge${tipo==="shalom" ? " active-sh" : ""}`}
                onClick={() => setTipo("shalom")}
              >
                <span className="er-tbtn-icon">🚚</span>
                <span className="er-tbtn-label">SHALOM</span>
                <span className="er-tbtn-badge">Sin recargo</span>
              </button>
              <button
                className={`er-tbtn ot-badge${tipo==="otras" ? " active-ot" : ""}`}
                onClick={() => setTipo("otras")}
              >
                <span className="er-tbtn-icon">📦</span>
                <span className="er-tbtn-label">OTRAS AGENCIAS</span>
                <span className="er-tbtn-badge">Puede haber recargo</span>
              </button>
            </div>

            {tipo==="shalom" && (
              <div className="er-aviso er-aviso-sh" style={{width:"calc(100% - 28px)",maxWidth:480,margin:"10px 14px 0"}}>
                ✅ <strong>Envío sin recargo:</strong> Al usar Shalom no se cobra envío adicional.
              </div>
            )}
            {tipo==="otras" && (
              <div className="er-aviso er-aviso-ot" style={{width:"calc(100% - 28px)",maxWidth:480,margin:"10px 14px 0"}}>
                ⚠️ <strong>Atención:</strong> Con otra empresa puede generarse un recargo adicional.
              </div>
            )}

            {/* ── SHALOM ── */}
            {tipo==="shalom" && (
              <div className="er-card">
                <div className="er-card-hdr">
                  <div className="er-card-title">📦 Información de envío — Shalom</div>
                </div>
                <div className="er-body">

                  <div className="er-fg">
                    <label className="er-label">Nombre y apellido</label>
                    <input
                      className={`er-input${shErrs.nombre ? " err" : ""}`}
                      placeholder="Ej: MARÍA GARCÍA LÓPEZ"
                      value={shNombre}
                      onChange={e => setShNombre(e.target.value.toUpperCase())}
                    />
                    {shErrs.nombre && <span className="er-emsg">Ingresa tu nombre completo</span>}
                  </div>

                  <div className="er-fg">
                    <label className="er-label">N° de DNI o Carné de Extranjería</label>
                    <input
                      className={`er-input${shErrs.dni ? " err" : ""}`}
                      placeholder="Ej: 12345678"
                      inputMode="numeric"
                      maxLength={12}
                      value={shDni}
                      onChange={e => setShDni(e.target.value.replace(/[^0-9]/g,""))}
                    />
                    {shErrs.dni && <span className="er-emsg">Ingresa un documento válido (mín. 7 dígitos)</span>}
                  </div>

                  <div className="er-fg">
                    <label className="er-label">Número de teléfono</label>
                    <input
                      className={`er-input${shErrs.tel ? " err" : ""}`}
                      placeholder="Ej: 987654321"
                      inputMode="numeric"
                      maxLength={9}
                      value={shTel}
                      onChange={e => setShTel(e.target.value.replace(/[^0-9]/g,""))}
                    />
                    <div className="er-hint">📱 Ingresa el mismo número con el que nos contactaste por WhatsApp</div>
                    {shErrs.tel && <span className="er-emsg">Ingresa un número de 9 dígitos</span>}
                  </div>

                  <div className="er-fg">
                    <label className="er-label">Agencia de envío Shalom</label>
                    {!selAg ? (
                      <button
                        className={`er-ag-btn${shErrs.agencia ? " err" : ""}`}
                        onClick={openSheet}
                        type="button"
                      >
                        🔍 <span style={{flex:1}}>Toca para buscar agencia...</span>
                        <span style={{color:"#bbb",fontSize:13}}>▼</span>
                      </button>
                    ) : (
                      <div className="er-ag-detail">
                        <button className="er-ag-change" onClick={openSheet} type="button">Cambiar</button>
                        <div className="er-ag-name">{selAg.n}</div>
                        <div className="er-ag-loc">{[selAg.dep, selAg.prov, selAg.dist].filter(Boolean).join(" / ")}</div>
                      </div>
                    )}
                    {shErrs.agencia && <span className="er-emsg">Debes seleccionar una agencia Shalom</span>}
                  </div>

                  <div className="er-fg">
                    <label className="er-label">Monto del pedido</label>
                    <div className="er-monto-row">
                      <span className="er-monto-prefix">S/</span>
                      <input
                        className={`er-input${shErrs.monto ? " err" : ""}`}
                        placeholder="0.00"
                        inputMode="decimal"
                        maxLength={10}
                        value={shMonto}
                        onChange={e => setShMonto(e.target.value.replace(/[^0-9.]/g,""))}
                      />
                    </div>
                    <div className="er-hint">💰 Coloca aquí el monto total de tu pedido</div>
                    {shErrs.monto && <span className="er-emsg">Ingresa el monto total del pedido</span>}
                  </div>

                  <button className="er-btn" onClick={submitShalom} disabled={loading} type="button">
                    {loading ? <span className="er-spinner"/> : "Registrar datos de envío ✓"}
                  </button>
                </div>
              </div>
            )}

            {/* ── OTRAS AGENCIAS ── */}
            {tipo==="otras" && (
              <div className="er-card">
                <div className="er-card-hdr">
                  <div className="er-card-title">📦 Información de envío — Otras agencias</div>
                </div>
                <div className="er-body">

                  <div className="er-fg">
                    <label className="er-label">Nombre y apellido</label>
                    <input
                      className={`er-input${otErrs.nombre ? " err" : ""}`}
                      placeholder="Ej: MARÍA GARCÍA LÓPEZ"
                      value={otNombre}
                      onChange={e => setOtNombre(e.target.value.toUpperCase())}
                    />
                    {otErrs.nombre && <span className="er-emsg">Ingresa tu nombre completo</span>}
                  </div>

                  <div className="er-fg">
                    <label className="er-label">N° de DNI o Carné de Extranjería</label>
                    <input
                      className={`er-input${otErrs.dni ? " err" : ""}`}
                      placeholder="Ej: 12345678"
                      inputMode="numeric"
                      maxLength={12}
                      value={otDni}
                      onChange={e => setOtDni(e.target.value.replace(/[^0-9]/g,""))}
                    />
                    {otErrs.dni && <span className="er-emsg">Ingresa un documento válido (mín. 7 dígitos)</span>}
                  </div>

                  <div className="er-fg">
                    <label className="er-label">Número de teléfono</label>
                    <input
                      className={`er-input${otErrs.tel ? " err" : ""}`}
                      placeholder="Ej: 987654321"
                      inputMode="numeric"
                      maxLength={9}
                      value={otTel}
                      onChange={e => setOtTel(e.target.value.replace(/[^0-9]/g,""))}
                    />
                    <div className="er-hint">📱 Ingresa el mismo número con el que nos contactaste por WhatsApp</div>
                    {otErrs.tel && <span className="er-emsg">Ingresa un número de 9 dígitos</span>}
                  </div>

                  <div className="er-fg">
                    <label className="er-label">Empresa de transporte</label>
                    <input
                      className={`er-input${otErrs.empresa ? " err" : ""}`}
                      placeholder="Ej: OLVA COURIER, MARVISUR..."
                      value={otEmpresa}
                      onChange={e => setOtEmpresa(e.target.value.toUpperCase())}
                    />
                    {otErrs.empresa && <span className="er-emsg">Ingresa el nombre de la empresa</span>}
                  </div>

                  <div className="er-fg">
                    <label className="er-label">Agencia / Lugar de envío</label>
                    <input
                      className={`er-input${otErrs.agencia ? " err" : ""}`}
                      placeholder="Ej: AV. LARCO 123, TRUJILLO"
                      value={otAgencia}
                      onChange={e => setOtAgencia(e.target.value.toUpperCase())}
                    />
                    {otErrs.agencia && <span className="er-emsg">Ingresa la agencia o dirección</span>}
                  </div>

                  <div className="er-fg">
                    <label className="er-label">Monto del pedido</label>
                    <div className="er-monto-row">
                      <span className="er-monto-prefix">S/</span>
                      <input
                        className={`er-input${otErrs.monto ? " err" : ""}`}
                        placeholder="0.00"
                        inputMode="decimal"
                        maxLength={10}
                        value={otMonto}
                        onChange={e => setOtMonto(e.target.value.replace(/[^0-9.]/g,""))}
                      />
                    </div>
                    <div className="er-hint">💰 Coloca aquí el monto total de tu pedido</div>
                    {otErrs.monto && <span className="er-emsg">Ingresa el monto total del pedido</span>}
                  </div>

                  <button className="er-btn" onClick={submitOtras} disabled={loading} type="button">
                    {loading ? <span className="er-spinner"/> : "Registrar datos de envío ✓"}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── SHEET BÚSQUEDA AGENCIAS ── */}
      {sheetOpen && (
        <>
          <div className="er-overlay" onClick={() => setSheetOpen(false)} />
          <div className="er-sheet">
            <div className="er-sheet-handle"><div className="er-sheet-bar"/></div>
            <div className="er-sheet-top">
              <div className="er-sheet-searchbox">
                <span style={{fontSize:18}}>🔍</span>
                <input
                  ref={searchRef}
                  className="er-ss-input"
                  placeholder="Ciudad, distrito, nombre de agencia..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                />
                {query && (
                  <button
                    style={{background:"none",border:"none",cursor:"pointer",fontSize:20,color:"#bbb",padding:"0 2px",lineHeight:1}}
                    onClick={() => setQuery("")}
                  >✕</button>
                )}
              </div>
            </div>
            <div className="er-sheet-info">
              {query.length < 2
                ? "Escribe para buscar entre las 484 agencias Shalom"
                : results.length
                  ? `${results.length} agencia${results.length !== 1 ? "s" : ""} encontrada${results.length !== 1 ? "s" : ""}`
                  : "Sin resultados"}
            </div>
            <div className="er-sheet-list">
              {query.length < 2 ? (
                <div className="er-sheet-empty">🏪<br/>Escribe el nombre de tu ciudad,<br/>distrito o agencia</div>
              ) : results.length === 0 ? (
                <div className="er-sheet-empty">🔎<br/>Sin resultados para "<strong>{query}</strong>".<br/>Prueba con otra ciudad.</div>
              ) : results.map((a, i) => (
                <div
                  key={i}
                  className={`er-sitem${tempAg?.n === a.n ? " sel" : ""}`}
                  onClick={() => setTempAg(a)}
                >
                  <div className="er-sitem-name">{a.n}</div>
                  <div className="er-sitem-loc">{[a.dep, a.prov, a.dist].filter(Boolean).join(" / ")}</div>
                </div>
              ))}
            </div>
            <div className="er-sheet-footer">
              <button
                className={`er-btn-confirmar${tempAg ? " active" : ""}`}
                onClick={confirmarAgencia}
                disabled={!tempAg}
              >
                {tempAg ? `Confirmar: ${tempAg.n}` : "Selecciona una agencia para continuar"}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
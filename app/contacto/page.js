import { WHATSAPP, WHATSAPP_VISIBLE, INSTAGRAM, TIKTOK, HORARIO, TIENDAS, GALERIA, MAPA } from '../data/marca';

export const metadata = {
  title: 'Contacto y tiendas en Gamarra | SUMACK',
  description: `Visítanos en ${GALERIA.nombre}, ${GALERIA.calle}, ${GALERIA.distrito} (${TIENDAS.map(t => `${t.piso} ${t.stand}`).join(' y ')}) o escríbenos por WhatsApp.`,
  alternates: { canonical: 'https://sumackmoda.com/contacto' },
};

const Flecha = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8" /></svg>
);

export default function ContactoPage() {
  return (
    <div className="pagina">
      <div className="pagina-inner">
        <h1 className="t-display">Contacto</h1>
        <p className="pagina-intro">
          Escríbenos por WhatsApp para consultas sobre modelos, tallas, pedidos o envíos.
          Te respondemos en menos de 24 horas.
        </p>
        <div className="contacto-opciones">
          <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener" className="contacto-card">
            <h3>WhatsApp <Flecha /></h3>
            <p>{WHATSAPP_VISIBLE}. Pedidos, tallas y envíos.</p>
          </a>
          <a href={INSTAGRAM} target="_blank" rel="noopener" className="contacto-card">
            <h3>Instagram <Flecha /></h3>
            <p>@sumackmoda. Novedades y nuevos colores.</p>
          </a>
          <a href={TIKTOK} target="_blank" rel="noopener" className="contacto-card">
            <h3>TikTok <Flecha /></h3>
            <p>@sumackmoda. Nuestras prendas en video.</p>
          </a>
        </div>
        <h2 className="t-titulo contacto-tiendas-titulo">Nuestras tiendas en Gamarra</h2>
        <div className="contacto-opciones">
          {TIENDAS.map(t => (
            <a key={t.stand} href={MAPA} target="_blank" rel="noopener" className="contacto-card">
              <h3>{t.nombre} <Flecha /></h3>
              <p>{GALERIA.nombre}, {t.piso}, {t.stand}.<br />{GALERIA.calle}, {GALERIA.distrito}, {GALERIA.ciudad}.</p>
            </a>
          ))}
        </div>
        <div className="nota">
          <strong>Horario de atención</strong>
          <span>{HORARIO} (hora de Lima)</span>
        </div>
      </div>
    </div>
  );
}

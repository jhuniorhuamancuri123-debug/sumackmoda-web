import { WHATSAPP, WHATSAPP_VISIBLE, INSTAGRAM, TIKTOK, HORARIO } from '../data/marca';

export const metadata = { title: "Contacto - SUMACK" };

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
        <div className="nota">
          <strong>Horario de atención</strong>
          <span>{HORARIO} (hora de Lima)</span>
        </div>
      </div>
    </div>
  );
}

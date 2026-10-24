import Link from 'next/link';
import Logo from './Logo';
import { WHATSAPP, WHATSAPP_VISIBLE, INSTAGRAM, TIKTOK, HORARIO } from '../data/marca';

const IconoIG = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="20" height="20" rx="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
);
const IconoTT = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z" /></svg>
);
export const IconoWA = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" /></svg>
);

export default function SiteFooter() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="footer-logo"><Logo /></div>
            <p>Polos de caballero diseñados, cortados y confeccionados en nuestro propio taller.</p>
            <div className="footer-social">
              <a href={INSTAGRAM} aria-label="Instagram" target="_blank" rel="noopener"><IconoIG /></a>
              <a href={TIKTOK} aria-label="TikTok" target="_blank" rel="noopener"><IconoTT /></a>
              <a href={`https://wa.me/${WHATSAPP}`} aria-label="WhatsApp" target="_blank" rel="noopener"><IconoWA /></a>
            </div>
          </div>
          <div className="footer-col">
            <h4>Tienda</h4>
            <Link href="/catalogo">Catálogo</Link>
            <Link href="/guia-de-tallas">Guía de tallas</Link>
            <Link href="/contacto">Contacto</Link>
            <Link href="/politica-devoluciones">Cambios y devoluciones</Link>
          </div>
          <div className="footer-col">
            <h4>Atención</h4>
            <p>{HORARIO}</p>
            <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener">WhatsApp {WHATSAPP_VISIBLE}</a>
            <Link href="/terminos">Términos y condiciones</Link>
            <Link href="/privacidad">Política de privacidad</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 SUMACK. Todos los derechos reservados.</p>
          <p>Lima, Perú</p>
        </div>
      </div>
    </footer>
  );
}

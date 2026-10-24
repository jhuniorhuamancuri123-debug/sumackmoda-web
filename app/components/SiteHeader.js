'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import Logo from './Logo';
import BuscadorBtn from './BuscadorBtn';
import CarritoBtn from './CarritoBtn';
import { WHATSAPP, WHATSAPP_VISIBLE, HORARIO } from '../data/marca';

const LINKS = [
  { href: '/', label: 'Inicio', nota: 'La marca' },
  { href: '/catalogo', label: 'Catálogo', nota: 'Todos los modelos' },
  { href: '/guia-de-tallas', label: 'Guía de tallas', nota: 'Medidas' },
  { href: '/contacto', label: 'Contacto', nota: 'WhatsApp' },
];

export default function SiteHeader() {
  const [menu, setMenu] = useState(false);
  const [borde, setBorde] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setBorde(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menu ? 'hidden' : '';
    const onKey = (e) => { if (e.key === 'Escape') setMenu(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menu]);

  const activo = (href) => pathname === href || (href === '/catalogo' && pathname.startsWith('/catalogo'));

  return (
    <>
      <header className={`navbar${borde ? ' con-borde' : ''}`}>
        <div className="navbar-inner">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button className="icon-btn menu-btn" aria-label="Abrir menú" aria-expanded={menu} onClick={() => setMenu(true)}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 8h18M3 16h12" /></svg>
            </button>
            <nav className="navbar-links" aria-label="Principal">
              {LINKS.map(l => (
                <a key={l.href} href={l.href} aria-current={activo(l.href) ? 'page' : undefined}>{l.label}</a>
              ))}
            </nav>
          </div>
          <Link href="/" className="navbar-logo" aria-label="SUMACK, ir al inicio">
            <Logo />
          </Link>
          <div className="navbar-icons">
            <BuscadorBtn />
            <CarritoBtn />
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menu && (
          <motion.div
            className="menu-movil"
            role="dialog"
            aria-modal="true"
            aria-label="Menú"
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            <button className="icon-btn menu-movil-cerrar" aria-label="Cerrar menú" onClick={() => setMenu(false)}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M5 5l14 14M19 5L5 19" /></svg>
            </button>
            <nav aria-label="Menú móvil">
              {LINKS.map((l, i) => (
                <motion.a
                  key={l.href}
                  href={l.href}
                  onClick={() => setMenu(false)}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.06, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                  {l.label}<span>{l.nota}</span>
                </motion.a>
              ))}
            </nav>
            <motion.div className="menu-movil-pie" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}>
              <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener">WhatsApp {WHATSAPP_VISIBLE}</a>
              <span>{HORARIO}</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

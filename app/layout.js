import { Playfair_Display, Cormorant_Garamond } from 'next/font/google';
import './globals.css';
import { CarritoProvider } from './context/CarritoContext';
import { ToastProvider } from './context/ToastContext';
import CarritoPanel from './components/CarritoPanel';
import CarritoBtn from './components/CarritoBtn';
import BuscadorBtn from './components/BuscadorBtn';
import PerfilBtn from './components/PerfilBtn';
import Script from 'next/script';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  weight: ['400', '700', '900'],
  display: 'swap', // ← agrega esto
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-cormorant',
  weight: ['300', '400', '500', '600'],
  display: 'swap', // ← agrega esto
});

export const metadata = {
  title: 'SUMACK - Moda Masculina Premium',
  description: 'Marca peruana de polos y prendas masculinas premium. Diseñados y fabricados en Perú. Envíos a todo el país.',
  keywords: 'polos peruanos, moda masculina Lima, polos premium Perú, ropa hombre Lima, marca peruana de polos',
  icons: {
    icon: '/favicon.ico',
    apple: '/favicon.ico',
  },
  openGraph: {
    title: 'SUMACK - Moda Masculina Premium',
    description: 'Marca peruana de polos y prendas masculinas premium. Diseñados y fabricados en Perú.',
    url: 'https://sumackmoda.com',
    siteName: 'SUMACK',
    images: [
      {
        url: 'https://sumackmoda.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'SUMACK Moda Masculina Premium',
      },
    ],
    locale: 'es_PE',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-FQ6GY0YT7S"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
        <Script id="facebook-pixel" strategy="afterInteractive">
  {`
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '3915121135274598');
    fbq('track', 'PageView');
  `}
</Script>
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-FQ6GY0YT7S');
          `}
        </Script>
      </head>
      <body className={`${playfair.variable} ${cormorant.variable}`}>
        <ToastProvider>
          <CarritoProvider>
            <header className="navbar">
              <div className="navbar-inner">
                <nav className="navbar-links">
                  <a href="/inicio">Inicio</a>
                  <a href="/catalogo">Catalogo</a>
                  <a href="/contacto">Contacto</a>
                  <a href="/guia-de-tallas">Guia de tallas</a>
                </nav>
                <a href="/inicio" className="navbar-logo">SUMACK</a>
                <div className="navbar-icons">
                  <BuscadorBtn />
                  <PerfilBtn />
                  <CarritoBtn />
                </div>
              </div>
            </header>
            <CarritoPanel />
            <main>{children}</main>
            <footer className="footer">
              <div className="footer-inner">
                <div className="footer-brand">
                  <span className="footer-logo">SUMACK</span>
                  <p>Prendas premium para el caballero<br />que define su propio estilo.</p>
                  <div className="footer-social">
                    <a href="https://www.instagram.com/sumackmoda/" aria-label="Instagram" target="_blank" rel="noopener">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                      </svg>
                    </a>
                    <a href="https://www.tiktok.com/@sumackmoda?lang=es-419" aria-label="TikTok" target="_blank" rel="noopener">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/>
                      </svg>
                    </a>
                    <a href="https://wa.me/51968267313" aria-label="WhatsApp" target="_blank" rel="noopener">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
                      </svg>
                    </a>
                  </div>
                </div>
                <div className="footer-links">
                  <div className="footer-col">
                    <h4>Navegacion</h4>
                    <a href="/inicio">Inicio</a>
                    <a href="/catalogo">Catalogo</a>
                    <a href="/guia-de-tallas">Guia de tallas</a>
                    <a href="/contacto">Contacto</a>
                  </div>
                  <div className="footer-col">
                    <h4>Legal</h4>
                    <a href="/politica-devoluciones">Politica de devoluciones</a>
                    <a href="/terminos">Terminos y condiciones</a>
                    <a href="/privacidad">Politica de privacidad</a>
                  </div>
                </div>
              </div>
              <div className="footer-bottom">
                <p>2026 SUMACK. Todos los derechos reservados.</p>
                <p>Lima, Peru</p>
              </div>
            </footer>
          </CarritoProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
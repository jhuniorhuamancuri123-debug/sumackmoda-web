import { Archivo, Newsreader } from 'next/font/google';
import './globals.css';
import { CarritoProvider } from './context/CarritoContext';
import { ToastProvider } from './context/ToastContext';
import CarritoPanel from './components/CarritoPanel';
import SiteHeader from './components/SiteHeader';
import SiteFooter from './components/SiteFooter';
import MotionProvider from './components/MotionProvider';
import Script from 'next/script';

const archivo = Archivo({
  subsets: ['latin'],
  variable: '--font-archivo',
  axes: ['wdth'],
  display: 'swap',
});

const newsreader = Newsreader({
  subsets: ['latin'],
  variable: '--font-newsreader',
  style: ['normal', 'italic'],
  display: 'swap',
});

export const metadata = {
  title: 'SUMACK - Moda Masculina Premium',
  description: 'Marca peruana de polos y prendas masculinas premium. Diseñados y fabricados en Perú. Envíos a todo el país.',
  keywords: 'polos peruanos, moda masculina Lima, polos premium Perú, ropa hombre Lima, marca peruana de polos',
  verification: {
    facebook: 'kux7dcvdcu12kbpr4ud8tsq6h99em5',
  },
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
    <html lang="es" className={`${archivo.variable} ${newsreader.variable}`}>
      <head>
  <meta name="facebook-domain-verification" content="kux7dcvdcu12kbpr4ud8tsq6h99em5" />
  <Script
    src="https://www.googletagmanager.com/gtag/js?id=G-FQ6GY0YT7S"
    strategy="afterInteractive"
  />
  <Script id="google-analytics" strategy="afterInteractive">
    {`
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-FQ6GY0YT7S');
    `}
  </Script>
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
      fbq('track', 'PageView', {}, { eventID: 'PV-' + Date.now() });
    `}
  </Script>
  <Script id="tiktok-pixel" strategy="afterInteractive">
    {`
      !function (w, d, t) {
        w.TiktokAnalyticsObject=t;
        var ttq=w[t]=w[t]||[];
        ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"];
        ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
        for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
        ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};
        ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;
        ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};
        n=document.createElement("script");n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;
        e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
        ttq.load('D90QCQ3C77U4M7JJ3UP0');
        ttq.page();
      }(window, document, 'ttq');
    `}
  </Script>
</head>
      <body>
        <MotionProvider>
          <ToastProvider>
            <CarritoProvider>
              <SiteHeader />
              <CarritoPanel />
              <main>{children}</main>
              <SiteFooter />
            </CarritoProvider>
          </ToastProvider>
        </MotionProvider>
      </body>
    </html>
  );
}

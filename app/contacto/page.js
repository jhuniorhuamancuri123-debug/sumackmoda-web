export const metadata = { title: "Contacto - SUMACK" };

export default function ContactoPage() {
  return (
    <div className="contacto-page">
      <div className="contacto-inner">
        <h1 className="contacto-titulo">Contacto</h1>
        <p className="contacto-sub">
          Estamos para ayudarte. Escribenos por WhatsApp para consultas sobre
          productos, tallas, pedidos o envios. Te respondemos en menos de 24 horas.
        </p>
        <div className="contacto-opciones">
          <a href="https://wa.me/51968267313" target="_blank" rel="noopener" className="contacto-card">
            <h3>WhatsApp</h3>
            <p>+51 968 267 313 - Respuesta en menos de 24 horas</p>
          </a>
          <a href="https://www.instagram.com/sumackmoda/" target="_blank" rel="noopener" className="contacto-card">
            <h3>Instagram</h3>
            <p>@sumackmoda - Siguenos para ver las ultimas novedades</p>
          </a>
          <a href="https://www.tiktok.com/@sumackmoda?lang=es-419" target="_blank" rel="noopener" className="contacto-card">
            <h3>TikTok</h3>
            <p>@sumackmoda - Siguenos para ver las ultimas novedades</p>
          </a>
        </div>
        <div style={{marginTop:"3rem",padding:"2rem",background:"var(--crema)",borderLeft:"3px solid var(--marron)"}}>
          <p style={{fontFamily:"var(--font-body)",fontSize:"0.95rem",lineHeight:1.7}}>
            Horario de atencion: Lunes a sabado, 9am a 7pm (Lima, Peru)
          </p>
        </div>
      </div>
    </div>
  );
}
function Section({ titulo, children }) {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem' }}>
        {titulo}
      </h2>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.95rem', lineHeight: 1.8, color: 'var(--negro)' }}>
        {children}
      </p>
    </div>
  );
}

export const metadata = { title: "Política de Privacidad - SUMACK" };

export default function PrivacidadPage() {
  return (
    <div style={{ paddingTop: '80px', minHeight: '100vh' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '3rem 1.5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          Política de Privacidad
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--gris)', fontSize: '0.85rem', marginBottom: '2.5rem' }}>
          Última actualización: Febrero 2026
        </p>
        <Section titulo="Información que recopilamos">
          Al confirmar un pedido por WhatsApp recopilamos tu nombre, número de teléfono y dirección de entrega. No almacenamos datos bancarios ni de tarjetas de crédito.
        </Section>
        <Section titulo="Uso de la información">
          Tu información se usa exclusivamente para procesar tu pedido y coordinar el envío. No vendemos, alquilamos ni compartimos tus datos con terceros.
        </Section>
        <Section titulo="WhatsApp">
          La comunicación se realiza vía WhatsApp, sujeta a los términos de WhatsApp / Meta. No almacenamos el historial de conversaciones fuera de la propia aplicación.
        </Section>
        <Section titulo="Cookies">
          Este sitio utiliza cookies técnicas para el funcionamiento del carrito. No usamos cookies de publicidad ni rastreo de comportamiento.
        </Section>
        <Section titulo="Seguridad">
          Adoptamos medidas razonables para proteger tu información. Sin embargo ningún sistema es 100% seguro. Al usar este sitio aceptas este riesgo inherente.
        </Section>
        <Section titulo="Tus derechos">
          Puedes solicitar la eliminación de tus datos escribiéndonos al <strong>+51 968 267 313</strong>. Procesaremos tu solicitud en un plazo máximo de 5 días hábiles.
        </Section>
      </div>
    </div>
  );
}
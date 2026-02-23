export const metadata = { title: "Términos y Condiciones - SUMACK" };

export default function TerminosPage() {
  return (
    <div style={{ paddingTop: '80px', minHeight: '100vh' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '3rem 1.5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          Términos y Condiciones
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--gris)', fontSize: '0.85rem', marginBottom: '2.5rem' }}>
          Última actualización: Febrero 2026
        </p>

        <Section titulo="Confirmación del pedido">
          El pedido se confirma únicamente cuando el cliente y SUMACK acuerdan explícitamente el pago y envío por WhatsApp. La selección de productos en el sitio no constituye una reserva de stock.
        </Section>

        <Section titulo="Precios">
          Todos los precios están en Soles (S/.) e incluyen IGV. Los precios varían según talla y están sujetos a cambio sin previo aviso. El precio válido es el confirmado al momento del pedido por WhatsApp.
        </Section>

        <Section titulo="Cambios — plazo máximo 4 días">
          Solo se aceptan cambios dentro de los <strong>4 días calendario</strong> desde la recepción del pedido. Pasado este plazo no se aceptan cambios bajo ninguna circunstancia. El cliente debe coordinar el cambio por WhatsApp antes de enviar la prenda.
        </Section>

        <Section titulo="Condiciones para cambio">
          La prenda debe estar sin uso, sin lavar, sin manchas, sin olores y con todas sus etiquetas originales. Prendas que presenten señales de uso, daño, alteración o lavado no serán aceptadas para cambio. SUMACK se reserva el derecho de rechazar cualquier cambio que no cumpla estas condiciones.
        </Section>

        <Section titulo="Costo de envío en cambios">
          El costo de envío por cambio de talla corre íntegramente por cuenta del cliente, tanto el envío de devolución como el reenvío del nuevo producto.
        </Section>

        <Section titulo="Stock y disponibilidad">
          El stock mostrado es referencial y se actualiza periódicamente. SUMACK no garantiza la disponibilidad del producto hasta la confirmación del pedido. En caso de quiebre de stock se notificará al cliente sin obligación de entrega.
        </Section>

        <Section titulo="Envíos">
          Los tiempos de entrega son referenciales y dependen de la agencia de transporte. SUMACK no se responsabiliza por retrasos, extravíos o daños ocurridos durante el transporte una vez entregado el paquete a la agencia. El cliente asume la responsabilidad de proporcionar una dirección correcta y completa.
        </Section>

        <Section titulo="Limitación de responsabilidad">
          SUMACK no se responsabiliza por daños indirectos derivados del uso o imposibilidad de uso de los productos. La responsabilidad máxima de SUMACK se limita al valor del producto adquirido.
        </Section>
      </div>
    </div>
  );
}

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
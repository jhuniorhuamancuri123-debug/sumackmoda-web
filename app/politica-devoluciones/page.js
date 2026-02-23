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

export const metadata = { title: "Política de Devoluciones - SUMACK" };

export default function PoliticaDevolucionesPage() {
  return (
    <div style={{ paddingTop: '80px', minHeight: '100vh' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '3rem 1.5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          Política de Devoluciones
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--gris)', fontSize: '0.85rem', marginBottom: '2.5rem' }}>
          Última actualización: Febrero 2026
        </p>
        <Section titulo="Plazo de cambios">
          Solo se aceptan cambios dentro de los <strong>4 días calendario</strong> desde la recepción del pedido. Pasado este plazo no se procesará ningún cambio bajo ninguna circunstancia.
        </Section>
        <Section titulo="Condiciones">
          La prenda debe estar sin uso, sin lavar, sin manchas y con etiquetas originales. No se aceptan cambios en prendas que presenten señales de uso, daño, lavado o alteración. SUMACK se reserva el derecho de rechazar el cambio si la prenda no cumple estas condiciones.
        </Section>
        <Section titulo="No aplica cambio en">
          Prendas usadas o lavadas. Prendas sin etiquetas. Prendas con manchas u olores. Compras con descuento especial o liquidación. Cambios solicitados fuera del plazo de 4 días.
        </Section>
        <Section titulo="Costo del cambio">
          El envío de devolución y el reenvío del nuevo producto corren íntegramente por cuenta del cliente.
        </Section>
        <Section titulo="Defectos de fábrica">
          En caso de defecto de fábrica debes reportarlo dentro de las <strong>48 horas</strong> de recibido el pedido con foto por WhatsApp al +51 968 267 313. SUMACK evaluará el caso y determinará si aplica cambio.
        </Section>
        <Section titulo="Reembolsos">
          No realizamos reembolsos en efectivo ni reversiones de pago. En casos excepcionales se emite un crédito para futura compra a criterio de SUMACK.
        </Section>
        <Section titulo="Cómo solicitar un cambio">
          Escríbenos por WhatsApp al <strong>+51 968 267 313</strong> dentro del plazo indicado, adjuntando foto del producto y explicando el motivo. Sin comunicación previa no se acepta ninguna devolución.
        </Section>
      </div>
    </div>
  );
}
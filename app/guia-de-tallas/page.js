export const metadata = { title: "Guia de tallas - SUMACK" };

export default function GuiaTallasPage() {
  return (
    <div className="guia-page">
      <div className="guia-inner">
        <h1 className="guia-titulo">Guia de tallas</h1>
        <p className="guia-sub">Medidas tomadas sobre la prenda plana.</p>
        <img src="/guia-tallas.jpg" alt="Guia de tallas" className="guia-img" />
        <table className="tabla-tallas">
          <thead>
            <tr>
              <th>Medida</th><th>S</th><th>M</th><th>L</th><th>XL</th><th>XXL</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Largo total</td><td>60 cm</td><td>63 cm</td><td>66 cm</td><td>69 cm</td><td>72 cm</td></tr>
            <tr><td>Pecho</td><td>46 cm</td><td>48 cm</td><td>51 cm</td><td>54 cm</td><td>56 cm</td></tr>
            <tr><td>Manga</td><td>21 cm</td><td>22 cm</td><td>23 cm</td><td>24 cm</td><td>26 cm</td></tr>
          </tbody>
        </table>
        <div style={{marginTop:"3rem",padding:"2rem",background:"var(--crema)",borderLeft:"3px solid var(--marron)"}}>
          <p style={{fontFamily:"var(--font-body)",fontSize:"0.95rem"}}>
            <strong>¿No sabes tu talla?</strong> Escribenos al{" "}
            <a href="https://wa.me/51968267313" target="_blank" rel="noopener" style={{color:"var(--marron)"}}>
              WhatsApp
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

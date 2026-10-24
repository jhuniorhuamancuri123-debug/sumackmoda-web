import { WHATSAPP } from '../data/marca';

export const metadata = { title: "Guía de tallas - SUMACK" };

const MEDIDAS = [
  { medida: 'Largo total', valores: [60, 63, 66, 69, 72] },
  { medida: 'Pecho', valores: [46, 48, 51, 54, 56] },
  { medida: 'Manga', valores: [21, 22, 23, 24, 26] },
];
const TALLAS = ['S', 'M', 'L', 'XL', 'XXL'];

export default function GuiaTallasPage() {
  return (
    <div className="pagina">
      <div className="pagina-inner">
        <h1 className="t-display">Guía de tallas</h1>
        <p className="pagina-intro">
          Medidas en centímetros, tomadas sobre la prenda extendida. Mide el pecho de un polo
          que te quede bien y compáralo con la tabla.
        </p>
        <img src="/guia-tallas.jpg" alt="Cómo medir largo, pecho y manga de un polo SUMACK" className="guia-img" />
        <div className="tabla-wrap">
          <table className="tabla-tallas">
            <thead>
              <tr>
                <th scope="col">Medida (cm)</th>
                {TALLAS.map(t => <th key={t} scope="col">{t}</th>)}
              </tr>
            </thead>
            <tbody>
              {MEDIDAS.map(m => (
                <tr key={m.medida}>
                  <td>{m.medida}</td>
                  {m.valores.map((v, i) => <td key={i}>{v}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="nota">
          <strong>¿Dudas entre dos tallas?</strong>
          <span>Escríbenos tu altura y la talla que usas normalmente y te recomendamos una.</span>
          <a href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent('Hola, quiero ayuda para elegir mi talla')}`} target="_blank" rel="noopener" className="link-subrayado" style={{ justifySelf: 'start', marginTop: '0.5rem' }}>
            Consultar por WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

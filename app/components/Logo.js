import { LOGO_PIEZAS, LOGO_VIEWBOX } from './logoPiezas';

// Logo SUMACK en SVG. Con `animado`, cada pieza del estarcido entra por separado
// y el logo se "arma" (sólo CSS: si el JS falla, el logo igual se ve).
export default function Logo({ animado = false, className = '', titulo = 'SUMACK' }) {
  return (
    <svg
      viewBox={LOGO_VIEWBOX}
      role="img"
      aria-label={titulo}
      className={`${animado ? 'logo-anim ' : ''}${className}`}
      fill="currentColor"
    >
      {LOGO_PIEZAS.map((d, i) => (
        <path
          key={i}
          d={d}
          style={animado ? {
            animationDelay: `${0.15 + i * 0.045}s`,
            '--dy': `${i % 2 ? -26 : 26}px`,
            '--rot': `${i % 3 === 0 ? -6 : i % 3 === 1 ? 4 : 0}deg`,
          } : undefined}
        />
      ))}
    </svg>
  );
}

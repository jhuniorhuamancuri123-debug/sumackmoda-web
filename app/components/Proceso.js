'use client';
import { motion } from 'motion/react';

const PASOS = [
  { t: 'Molde', d: 'Desarrollamos el molde de cada modelo en nuestro taller.' },
  { t: 'Tizado y corte', d: 'Trazamos y cortamos la tela por capas, para que cada talla salga con las mismas medidas.' },
  { t: 'Confección', d: 'Costura, cuello, puños y botones. Los detalles que se notan con el uso.' },
  { t: 'Revisión y envío', d: 'Revisamos cada prenda antes de doblarla y despacharla a tu ciudad.' },
];

// La costura se dibuja una sola vez cuando la sección entra en pantalla.
export default function Proceso() {
  return (
    <div className="proceso">
      <motion.div
        className="proceso-linea"
        aria-hidden="true"
        initial={{ scaleX: 0, scaleY: 0 }}
        whileInView={{ scaleX: 1, scaleY: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
      />
      {PASOS.map((p, i) => (
        <motion.div
          key={p.t}
          className="proceso-paso"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, delay: 0.25 + i * 0.25 }}
        >
          <div className="proceso-punto" aria-hidden="true" />
          <p className="proceso-num">Paso {i + 1}</p>
          <h3>{p.t}</h3>
          <p>{p.d}</p>
        </motion.div>
      ))}
    </div>
  );
}

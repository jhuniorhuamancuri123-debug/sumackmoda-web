'use client';
import { MotionConfig } from 'motion/react';

// Respeta "reducir movimiento" del sistema: quita desplazamientos y conserva fundidos.
export default function MotionProvider({ children }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

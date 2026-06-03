'use client';
import { useState } from 'react';

export default function ProductoImg({ src, alt, hexColor, priority = false }) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div style={{
        width: '100%', height: '100%',
        background: hexColor || '#e8e4dc',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-display)', fontSize: '1.2rem',
        fontWeight: 900, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.2em',
      }}>
        SUMACK
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      fetchpriority={priority ? 'high' : 'low'}
      decoding="async"
      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      onError={() => setError(true)}
    />
  );
}
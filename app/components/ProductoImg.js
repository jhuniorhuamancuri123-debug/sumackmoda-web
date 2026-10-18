'use client';
import { useState } from 'react';
import Logo from './Logo';

export default function ProductoImg({ src, alt, hexColor, priority = false, className = 'pimg pimg-main' }) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div className="producto-placeholder" style={hexColor ? { background: hexColor } : undefined}>
        <Logo titulo="" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'low'}
      decoding="async"
      onError={() => setError(true)}
    />
  );
}

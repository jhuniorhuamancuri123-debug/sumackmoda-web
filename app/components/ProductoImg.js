'use client';
export default function ProductoImg({ src, alt }) {
  return (
    <img
      src={src}
      alt={alt}
      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      onError={(e) => {
        e.target.style.display = 'none';
        e.target.parentNode.innerHTML = "<div class='producto-placeholder'>SUMACK</div>";
      }}
    />
  );
}
import Link from 'next/link';
export default function NotFound() {
  return (
    <div className="estado-centro">
      <h1>No encontramos esta página</h1>
      <p>Puede que el enlace haya cambiado o el modelo ya no esté disponible.</p>
      <Link href="/catalogo" className="btn btn-solid" style={{ marginTop: '0.5rem' }}>Ver catálogo</Link>
    </div>
  );
}

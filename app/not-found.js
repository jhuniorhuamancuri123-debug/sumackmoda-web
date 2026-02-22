export default function NotFound() {
  return (
    <div style={{paddingTop:'120px',textAlign:'center',fontFamily:'var(--font-body)'}}>
      <h1 style={{fontFamily:'var(--font-display)',fontSize:'3rem',marginBottom:'1rem'}}>404</h1>
      <p style={{marginBottom:'2rem',color:'var(--gris)'}}>Pagina no encontrada</p>
      <a href="/" style={{color:'var(--marron)',textDecoration:'none',borderBottom:'1px solid var(--marron)'}}>
        Volver al inicio
      </a>
    </div>
  );
}
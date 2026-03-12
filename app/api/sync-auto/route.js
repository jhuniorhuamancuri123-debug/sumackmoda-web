import { supabase } from '../../lib/supabase';

export async function GET(request) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sumackmoda-web.vercel.app';

    // Session única para toda esta ejecución
    // Todos los productos de este sync compartirán este valor
    const syncSession = new Date().toISOString();

    let pagina     = 0;
    let hayMas     = true;
    let totalItems = 0;

    console.log(`Iniciando sync completo | session=${syncSession}`);

    while (hayMas && pagina < 35) {
      const res  = await fetch(`${baseUrl}/api/sync?page=${pagina}&session=${syncSession}`);
      const data = await res.json();

      if (!data.success) {
        console.error(`Error en página ${pagina}:`, data.error);
        break;
      }

      totalItems += data.items_procesados || 0;
      hayMas      = data.hay_mas;
      pagina++;

      console.log(`Página ${pagina} OK | items acumulados: ${totalItems}`);
    }

    // ── LIMPIEZA AUTOMÁTICA ──────────────────────────────────────
    // Marcar como inactivos los productos que NO se actualizaron
    // en esta sesión = fueron eliminados en Alegra
    const { error: cleanupError, count } = await supabase
      .from('productos')
      .update({ activo: false })
      .neq('sync_session', syncSession)
      .eq('activo', true)  // solo los que estaban activos (evita updates innecesarios)
      .select('id', { count: 'exact', head: true });

    if (cleanupError) {
      console.error('Error en limpieza:', cleanupError.message);
    } else {
      console.log(`Limpieza: ${count ?? 0} productos marcados como inactivos`);
    }

    return Response.json({
      success:            true,
      paginas_procesadas: pagina,
      total_items:        totalItems,
      inactivos_marcados: count ?? 0,
      session:            syncSession,
      fecha:              new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error en sync-auto:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
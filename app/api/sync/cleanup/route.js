import { supabase } from '../../../lib/supabase';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const session = searchParams.get('session');

    if (!session) {
      return Response.json({
        success: false,
        error: 'Falta el parámetro session'
      }, { status: 400 });
    }

    console.log(`Limpiando productos con session != ${session}`);

    // Marcar como inactivos los productos que NO se actualizaron en esta sesión
    // = fueron eliminados en Alegra
    const { error, count } = await supabase
      .from('productos')
      .update({ activo: false })
      .neq('sync_session', session)
      .eq('activo', true)
      .select('id', { count: 'exact', head: true });

    if (error) {
      console.error('Error en limpieza:', error.message);
      return Response.json({ success: false, error: error.message }, { status: 500 });
    }

    console.log(`Limpieza completada: ${count ?? 0} productos marcados como inactivos`);

    return Response.json({
      success:            true,
      session:            session,
      inactivos_marcados: count ?? 0,
      fecha:              new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error en cleanup:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
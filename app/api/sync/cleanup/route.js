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

    // Marcar inactivos los que tienen session diferente (no NULL)
    const { error: error1, count: count1 } = await supabase
      .from('productos')
      .update({ activo: false })
      .neq('sync_session', session)
      .not('sync_session', 'is', null)
      .eq('activo', true)
      .select('id', { count: 'exact', head: true });

    if (error1) {
      console.error('Error limpiando session diferente:', error1.message);
      return Response.json({ success: false, error: error1.message }, { status: 500 });
    }

    // Marcar inactivos los que tienen sync_session NULL (registros viejos)
    const { error: error2, count: count2 } = await supabase
      .from('productos')
      .update({ activo: false })
      .is('sync_session', null)
      .eq('activo', true)
      .select('id', { count: 'exact', head: true });

    if (error2) {
      console.error('Error limpiando session NULL:', error2.message);
      return Response.json({ success: false, error: error2.message }, { status: 500 });
    }

    const total = (count1 ?? 0) + (count2 ?? 0);
    console.log(`Limpieza completada: ${total} productos marcados como inactivos`);

    return Response.json({
      success:            true,
      session:            session,
      inactivos_marcados: total,
      detalle: {
        session_diferente: count1 ?? 0,
        sin_session:       count2 ?? 0,
      },
      fecha: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error en cleanup:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
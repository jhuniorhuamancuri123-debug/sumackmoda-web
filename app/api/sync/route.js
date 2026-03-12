import { alegraClient, parseCodigo } from '../../lib/alegra';
import { supabase } from '../../lib/supabase';

const ALMACEN_9NO = "1";
const ALMACEN_6TO = "2";
const LIMIT = 30;
const PAGINAS_POR_LLAMADA = 10;

function getStockPorAlmacen(item, almacenId) {
  if (!item.inventory?.warehouses) return 0;
  const almacen = item.inventory.warehouses.find(
    w => String(w.id) === String(almacenId)
  );
  return almacen?.availableQuantity || 0;
}

function getPrecioTotal(item) {
  const precioTotal = item.price?.find(p => p.name === 'TOTAL');
  if (precioTotal) return precioTotal.price;
  return item.price?.[0]?.price || 0;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const startPage  = parseInt(searchParams.get('page') || '0');
    const syncSession = searchParams.get('session') || new Date().toISOString();
    const start      = startPage * LIMIT * PAGINAS_POR_LLAMADA;

    console.log(`Sincronizando desde item ${start} | session=${syncSession}...`);

    const modelosMap   = {};
    const coloresMap   = {};
    const productosData = [];
    let totalFetched   = 0;
    let hayMas         = true;

    for (let i = 0; i < PAGINAS_POR_LLAMADA; i++) {
      const offset   = start + (i * LIMIT);
      const response = await alegraClient.get(`/items?limit=${LIMIT}&start=${offset}`);
      const items    = response.data;

      if (!items || items.length === 0) {
        hayMas = false;
        break;
      }

      for (const item of items) {
        const partes = parseCodigo(item.reference);
        if (!partes) continue;

        const { cod_modelo, cod_color, cod_talla } = partes;
        const nombreParts  = item.name.split(' / ');
        const nombre_modelo = nombreParts[0]?.trim() || cod_modelo;
        const nombre_color  = nombreParts[1]?.trim() || cod_color;

        const stock_9no = getStockPorAlmacen(item, ALMACEN_9NO);
        const stock_6to = getStockPorAlmacen(item, ALMACEN_6TO);
        const precio    = getPrecioTotal(item);

        modelosMap[cod_modelo] = { cod_modelo, nombre_modelo };
        coloresMap[cod_color]  = { cod_color, nombre_color };

        productosData.push({
          id:           String(item.id),
          cod_modelo,
          cod_color,
          cod_talla,
          nombre:       item.name,
          codigo:       item.reference,
          precio,
          stock:        stock_9no + stock_6to,
          stock_9no,
          stock_6to,
          activo:       true,
          ultima_sync:  new Date().toISOString(),
          sync_session: syncSession,  // ← mismo valor para toda la ejecución
        });
      }

      totalFetched += items.length;
      if (items.length < LIMIT) {
        hayMas = false;
        break;
      }
    }

    // Guardar modelos y colores
    if (Object.keys(modelosMap).length > 0) {
      await supabase.from('modelos').upsert(
        Object.values(modelosMap),
        { onConflict: 'cod_modelo' }
      );
    }

    if (Object.keys(coloresMap).length > 0) {
      await supabase.from('colores').upsert(
        Object.values(coloresMap),
        { onConflict: 'cod_color' }
      );
    }

    // Guardar productos
    if (productosData.length > 0) {
      await supabase.from('productos').upsert(
        productosData,
        { onConflict: 'id' }
      );
    }

    console.log(`Página ${startPage} completada. Items procesados: ${totalFetched}`);

    return Response.json({
      success:          true,
      pagina_actual:    startPage,
      items_procesados: totalFetched,
      hay_mas:          hayMas,
      session:          syncSession,
      siguiente_url:    hayMas ? `/api/sync?page=${startPage + 1}&session=${syncSession}` : null,
      mensaje:          hayMas
        ? `Corre /api/sync?page=${startPage + 1}&session=${syncSession} para continuar`
        : 'Sincronización completa',
    });

  } catch (error) {
    console.error('Error en sync:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
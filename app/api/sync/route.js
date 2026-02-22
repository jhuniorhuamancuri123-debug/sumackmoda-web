import { alegraClient, parseCodigo } from '../../lib/sync';
import { supabase } from '../../lib/supabase';

const ALMACEN_9NO = "1";
const ALMACEN_6TO = "2";
const LIMIT = 30;
const PAGINAS_POR_LLAMADA = 10; // 10 x 30 = 300 productos por llamada

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
    const startPage = parseInt(searchParams.get('page') || '0');
    const start = startPage * LIMIT * PAGINAS_POR_LLAMADA;

    console.log(`Sincronizando desde item ${start}...`);

    const modelosMap = {};
    const coloresMap = {};
    const productosData = [];
    let totalFetched = 0;
    let hayMas = true;

    for (let i = 0; i < PAGINAS_POR_LLAMADA; i++) {
      const offset = start + (i * LIMIT);
      const response = await alegraClient.get(`/items?limit=${LIMIT}&start=${offset}`);
      const items = response.data;

      if (!items || items.length === 0) {
        hayMas = false;
        break;
      }

      for (const item of items) {
        const partes = parseCodigo(item.reference);
        if (!partes) continue;

        const { cod_modelo, cod_color, cod_talla } = partes;
        const nombreParts = item.name.split(' / ');
        const nombre_modelo = nombreParts[0]?.trim() || cod_modelo;
        const nombre_color = nombreParts[1]?.trim() || cod_color;

        const stock_9no = getStockPorAlmacen(item, ALMACEN_9NO);
        const stock_6to = getStockPorAlmacen(item, ALMACEN_6TO);
        const precio = getPrecioTotal(item);

        modelosMap[cod_modelo] = { cod_modelo, nombre_modelo };
        coloresMap[cod_color] = { cod_color, nombre_color };

        productosData.push({
          id: String(item.id),
          cod_modelo,
          cod_color,
          cod_talla,
          nombre: item.name,
          codigo: item.reference,
          precio,
          stock: stock_9no + stock_6to,
          stock_9no,
          stock_6to,
          activo: true,
          ultima_sync: new Date().toISOString(),
        });
      }

      totalFetched += items.length;
      if (items.length < LIMIT) {
        hayMas = false;
        break;
      }
    }

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

    if (productosData.length > 0) {
      await supabase.from('productos').upsert(
        productosData,
        { onConflict: 'id' }
      );
    }

    console.log(`Página ${startPage} completada. Items procesados: ${totalFetched}`);

    return Response.json({
      success: true,
      pagina_actual: startPage,
      items_procesados: totalFetched,
      hay_mas: hayMas,
      siguiente_url: hayMas
        ? `/api/sync?page=${startPage + 1}`
        : null,
      mensaje: hayMas
        ? `Corre /api/sync?page=${startPage + 1} para continuar`
        : 'Sincronización completa'
    });

  } catch (error) {
    console.error('Error en sync:', error);
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
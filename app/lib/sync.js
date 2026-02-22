import { alegraClient, parseCodigo } from './alegra';
import { supabase } from './supabase';

const ALMACEN_9NO = "1";
const ALMACEN_6TO = "2";

async function getAllAlegraItems() {
  let allItems = [];
  let start = 0;
  const limit = 30;

  while (true) {
    const response = await alegraClient.get(`/items?limit=${limit}&start=${start}`);
    const items = response.data;
    if (!items || items.length === 0) break;
    allItems = [...allItems, ...items];
    if (items.length < limit) break;
    start += limit;
  }

  return allItems;
}

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

export async function syncProductos() {
  console.log('Iniciando sincronización con Alegra...');
  const items = await getAllAlegraItems();
  console.log(`Total items encontrados en Alegra: ${items.length}`);

  const modelosMap = {};
  const coloresMap = {};
  const productosData = [];

  // Preparar todos los datos primero sin tocar Supabase
  for (const item of items) {
    const partes = parseCodigo(item.reference);
    if (!partes) continue;

    const { cod_modelo, cod_color, cod_talla } = partes;
    const nombreParts = item.name.split(' / ');
    const nombre_modelo = nombreParts[0]?.trim() || cod_modelo;
    const nombre_color = nombreParts[1]?.trim() || cod_color;

    const stock_9no = getStockPorAlmacen(item, ALMACEN_9NO);
    const stock_6to = getStockPorAlmacen(item, ALMACEN_6TO);
    const stock_total = stock_9no + stock_6to;
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
      stock: stock_total,
      stock_9no,
      stock_6to,
      activo: true,
      ultima_sync: new Date().toISOString(),
    });
  }

  // Insertar modelos en un solo batch
  const modelosArray = Object.values(modelosMap);
  await supabase.from('modelos').upsert(modelosArray, { onConflict: 'cod_modelo' });
  console.log(`Modelos sincronizados: ${modelosArray.length}`);

  // Insertar colores en un solo batch
  const coloresArray = Object.values(coloresMap);
  await supabase.from('colores').upsert(coloresArray, { onConflict: 'cod_color' });
  console.log(`Colores sincronizados: ${coloresArray.length}`);

  // Insertar productos en lotes de 500
  const BATCH_SIZE = 500;
  for (let i = 0; i < productosData.length; i += BATCH_SIZE) {
    const lote = productosData.slice(i, i + BATCH_SIZE);
    await supabase.from('productos').upsert(lote, { onConflict: 'id' });
    console.log(`Productos sincronizados: ${i + lote.length} / ${productosData.length}`);
  }

  console.log('Sincronización completada.');
  return { total: items.length };
}
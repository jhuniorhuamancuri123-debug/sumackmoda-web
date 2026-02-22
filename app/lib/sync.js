import { alegraClient, parseCodigo } from './alegra';
import { supabase } from './supabase';

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

export async function syncProductos() {
  console.log('Iniciando sincronización con Alegra...');

  const items = await getAllAlegraItems();
  console.log(`Total items encontrados en Alegra: ${items.length}`);

  for (const item of items) {
    const partes = parseCodigo(item.reference);
    if (!partes) continue;

    const { cod_modelo, cod_color, cod_talla } = partes;

    const nombreParts = item.name.split(' / ');
    const nombre_modelo = nombreParts[0]?.trim() || cod_modelo;
    const nombre_color = nombreParts[1]?.trim() || cod_color;

    await supabase.from('modelos').upsert(
      { cod_modelo, nombre_modelo },
      { onConflict: 'cod_modelo' }
    );

    await supabase.from('colores').upsert(
      { cod_color, nombre_color },
      { onConflict: 'cod_color' }
    );

    await supabase.from('productos').upsert({
      id: String(item.id),
      cod_modelo,
      cod_color,
      cod_talla,
      nombre: item.name,
      codigo: item.reference,
      precio: item.price?.[0]?.price || 0,
      stock: item.inventory?.availableQuantity || 0,
      activo: true,
      ultima_sync: new Date().toISOString(),
    }, { onConflict: 'id' });
  }

  console.log('Sincronización completada.');
  return { total: items.length };
}
```

Guarda con **Ctrl+S** y luego en la terminal escribe:
```
git add .
git commit -m "Fix sync.js error"
git push
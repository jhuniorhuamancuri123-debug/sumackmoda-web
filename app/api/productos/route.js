import { getItems, parseCodigo } from '../../lib/alegra';
import { autorizadoInterno, noAutorizado } from '../../lib/seguridad';

export async function GET(request) {
  if (!autorizadoInterno(request)) return noAutorizado();
  try {
    const items = await getItems();
    
    const productos = items.map(item => ({
      id: item.id,
      nombre: item.name,
      codigo: item.reference,
      precio: item.price?.[0]?.price || 0,
      stock: item.inventory?.availableQuantity || 0,
      partes: parseCodigo(item.reference),
    }));

    return Response.json({ success: true, total: productos.length, productos });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

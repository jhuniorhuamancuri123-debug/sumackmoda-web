import { syncProductos } from '../../lib/sync';

export async function GET() {
  try {
    const resultado = await syncProductos();
    return Response.json({ success: true, ...resultado });
  } catch (error) {
    console.error('Error completo:', error);
    return Response.json({ 
      success: false, 
      error: error.message,
      detalle: error.response?.data || error.stack
    }, { status: 500 });
  }
}
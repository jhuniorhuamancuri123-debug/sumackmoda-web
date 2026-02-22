import { alegraClient } from '../../lib/alegra';

export async function GET() {
  try {
    const response = await alegraClient.get('/items?limit=1&start=0');
    const item = response.data[0];
    return Response.json({
      success: true,
      item_completo: item
    });
  } catch (error) {
    return Response.json({
      success: false,
      error: error.message,
      detalle: error.response?.data
    }, { status: 500 });
  }
}
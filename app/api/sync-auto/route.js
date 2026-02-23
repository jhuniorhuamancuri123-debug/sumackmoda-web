export async function GET(request) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sumackmoda-web.vercel.app';
    let pagina = 0;
    let hayMas = true;
    let totalItems = 0;

    while (hayMas && pagina < 35) {
      const res = await fetch(`${baseUrl}/api/sync?page=${pagina}`);
      const data = await res.json();

      if (!data.success) break;

      totalItems += data.items_procesados || 0;
      hayMas = data.hay_mas;
      pagina++;
    }

    return Response.json({
      success: true,
      paginas_procesadas: pagina,
      total_items: totalItems,
      fecha: new Date().toISOString(),
    });

  } catch (error) {
    return Response.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
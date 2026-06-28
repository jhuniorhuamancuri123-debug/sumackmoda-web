export async function POST(req) {
  const body = await req.json();
  const { eventName, eventId, eventData } = body;

  const payload = {
    pixel_code: process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID,
    event: eventName,
    event_id: eventId,
    timestamp: new Date().toISOString(),
    context: {
      page: { url: eventData.url || '' },
      user: {}
    },
    properties: {
      content_type: eventData.content_type || 'product',
      contents: (eventData.content_ids || []).map(id => ({
        content_id: id,
        content_type: eventData.content_type || 'product',
        content_name: eventData.content_name || '',
        price: eventData.value || 0,
        quantity: 1,
      })),
      value: eventData.value || 0,
      currency: 'PEN',
      num_items: eventData.num_items || 1,
    }
  };

  try {
    const res = await fetch(
      'https://business-api.tiktok.com/open_api/v1.3/pixel/track/',
      {
        method: 'POST',
        headers: {
          'Access-Token': process.env.TIKTOK_ACCESS_TOKEN,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: [payload] })
      }
    );
    const data = await res.json();
    return Response.json(data);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
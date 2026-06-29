export async function POST(req) {
  const body = await req.json();
  const { eventName, eventId, eventData } = body;

  const payload = {
    event_source: 'web',
    event_source_id: process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID,
    test_event_code: 'TEST51470',
    data: [
      {
        event: eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        user: {
          ip: req.headers.get('x-forwarded-for')?.split(',')[0] || '',
          user_agent: req.headers.get('user-agent') || '',
        },
        page: {
          url: eventData.url || '',
        },
        properties: {
          currency: 'PEN',
          value: Number(eventData.value) || 0,
          contents: (eventData.content_ids || []).map(id => ({
            content_id: id,
            content_type: eventData.content_type || 'product',
            content_name: eventData.content_name || '',
            quantity: 1,
            price: Number(eventData.value) || 0,
          })),
        }
      }
    ]
  };

  try {
    const res = await fetch(
      'https://business-api.tiktok.com/open_api/v1.3/event/track/',
      {
        method: 'POST',
        headers: {
          'Access-Token': process.env.TIKTOK_ACCESS_TOKEN,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      }
    );
    const data = await res.json();
    console.log('TikTok eAPI response:', JSON.stringify(data));
    return Response.json(data);
  } catch (err) {
    console.error('TikTok eAPI error:', err.message);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
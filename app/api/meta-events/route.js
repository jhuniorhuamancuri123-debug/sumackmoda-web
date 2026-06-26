export async function POST(request) {
  try {
    const body = await request.json();
    const { eventName, eventData } = body;

    const payload = {
      ...(process.env.META_TEST_EVENT_CODE && {
        test_event_code: process.env.META_TEST_EVENT_CODE
      }),
      data: [{
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: `${eventName}-${Date.now()}`,
        action_source: 'website',
        event_source_url: eventData.url,

        user_data: {
          client_ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] || '',
          client_user_agent: request.headers.get('user-agent') || '',
          fbc: eventData.fbc || '',
          fbp: eventData.fbp || '',
          ph: eventData.phone || '',
        },

        custom_data: {
          content_ids: eventData.content_ids,
          content_type: eventData.content_type,
          value: eventData.value,
          currency: 'PEN',
          content_name: eventData.content_name || '',
          num_items: eventData.num_items || 1,
        },
      }],
    };

    const response = await fetch(
      `https://graph.facebook.com/v19.0/${process.env.META_PIXEL_ID}/events?access_token=${process.env.META_CAPI_TOKEN}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );

    const result = await response.json();
    return Response.json({ success: true, result });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
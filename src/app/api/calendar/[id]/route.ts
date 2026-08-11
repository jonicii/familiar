import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const googleToken = request.headers.get('x-google-token');
    const authHeader = request.headers.get('Authorization');

    if (!googleToken || !authHeader) {
      return NextResponse.json({ error: 'Missing tokens' }, { status: 401 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { summary, start, end, calendarId } = body;

    const calId = calendarId || 'primary';

    const isAllDay = start && !start.includes('T');
    const updatePayload: any = {};
    if (summary !== undefined) updatePayload.summary = summary;
    if (start !== undefined) {
      if (isAllDay) {
        updatePayload.start = { date: start };
      } else {
        const startDt = new Date(start);
        updatePayload.start = { dateTime: startDt.toISOString(), timeZone: 'Europe/Oslo' };
      }
    }
    if (end !== undefined) {
      if (!end.includes('T')) {
        updatePayload.end = { date: end };
      } else {
        const endDt = new Date(end);
        updatePayload.end = { dateTime: endDt.toISOString(), timeZone: 'Europe/Oslo' };
      }
    }

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calId)}/events/${id}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${googleToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatePayload),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      let message = errorText;
      try {
        const errorJson = JSON.parse(errorText);
        message = errorJson?.error?.message || errorText;
      } catch (_) {}
      return NextResponse.json({ error: 'Failed to update event', message }, { status: response.status });
    }

    const event = await response.json();
    return NextResponse.json({ success: true, event });
  } catch (error) {
    console.error('Calendar update error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const googleToken = request.headers.get('x-google-token');
    const authHeader = request.headers.get('Authorization');

    if (!googleToken || !authHeader) {
      return NextResponse.json({ error: 'Missing tokens' }, { status: 401 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const url = new URL(request.url);
    const calendarId = url.searchParams.get('calendarId') || 'primary';

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${id}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${googleToken}`,
        },
      }
    );

    if (!response.ok && response.status !== 204) {
      const errorText = await response.text();
      return NextResponse.json({ error: 'Failed to delete event', message: errorText }, { status: response.status });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Calendar delete error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

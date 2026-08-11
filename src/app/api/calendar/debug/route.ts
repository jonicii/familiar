import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(request: Request) {
  try {
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
    const { start, end, calendarId } = body;

    const calId = calendarId || 'primary';
    
    // Omit end for single-day to avoid Google showing date range
    const eventPayload: Record<string, any> = {
      summary: '🧪 DEBUG EVENT — can delete',
      start: { dateTime: start, timeZone: 'Europe/Oslo' },
    };
    if (end) {
      eventPayload.end = { dateTime: end, timeZone: 'Europe/Oslo' };
    }

    // Create the event
    const createRes = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calId)}/events`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${googleToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventPayload),
      }
    );

    if (!createRes.ok) {
      const errText = await createRes.text();
      return NextResponse.json({ 
        error: 'Create failed',
        status: createRes.status,
        rawError: errText,
        payloadSent: eventPayload,
        input: { start, end, calendarId },
      }, { status: createRes.status });
    }

    const created = await createRes.json();

    // Fetch it back to see what Google stored
    const getRes = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calId)}/events/${created.id}`,
      {
        headers: { 'Authorization': `Bearer ${googleToken}` },
      }
    );

    const fetched = await getRes.ok ? await getRes.json() : null;

    return NextResponse.json({
      success: true,
      input: { start, end },
      payloadSent: eventPayload,
      created: {
        id: created.id,
        start: created.start,
        end: created.end,
        htmlLink: created.htmlLink,
      },
      fetchedFromGoogle: fetched ? {
        id: fetched.id,
        start: fetched.start,
        end: fetched.end,
      } : null,
    });
  } catch (error) {
    console.error('[Calendar Debug]', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
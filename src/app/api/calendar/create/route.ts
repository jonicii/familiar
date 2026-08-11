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

    // Validate Supabase session
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { summary, start, end, calendarId } = body;

    if (!summary || !start) {
      return NextResponse.json({ error: 'Missing summary or start time' }, { status: 400 });
    }

    const calId = calendarId || 'primary';
    
    const isAllDay = !start.includes('T');
    
    const eventPayload: Record<string, any> = {
      summary,
    };
    
    if (isAllDay) {
      // All-day: use date-only strings (YYYY-MM-DD)
      const startDate = start.includes('T') ? start.slice(0, 10) : start;
      eventPayload.start = { date: startDate };
      
      if (end) {
        const endDate = end.includes('T') ? end.slice(0, 10) : end;
        eventPayload.end = { date: endDate };
      }
    } else {
      // Timed: Date() parses local datetime as Oslo time; toISOString() → UTC
      // e.g. "2026-08-14T16:00:00" → "2026-08-14T14:00:00.000Z" (UTC)
      // Google sees 14:00 UTC → converts to 16:00 Oslo (correct)
      const startDt = new Date(start);
      eventPayload.start = { dateTime: startDt.toISOString(), timeZone: 'Europe/Oslo' };
      
      if (end) {
        const endDt = new Date(end);
        eventPayload.end = { dateTime: endDt.toISOString(), timeZone: 'Europe/Oslo' };
      } else {
        const endDt = new Date(start);
        endDt.setHours(endDt.getHours() + 1);
        eventPayload.end = { dateTime: endDt.toISOString(), timeZone: 'Europe/Oslo' };
      }
    }

    const response = await fetch(
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

    if (!response.ok) {
      const errorText = await response.text();
      let message = errorText;
      try {
        const errorJson = JSON.parse(errorText);
        message = errorJson?.error?.message || errorText;
      } catch (_) {}
      return NextResponse.json({ error: 'Failed to create event', message }, { status: response.status });
    }

    const event = await response.json();
    return NextResponse.json({ success: true, event });
  } catch (error) {
    console.error('Calendar create error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

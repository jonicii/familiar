import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(request: Request) {
  try {
    // Two-token auth: Supabase JWT for session validation + Google token for Calendar API
    const authHeader = request.headers.get('Authorization');
    const googleToken = request.headers.get('x-google-token');
    
    if (!authHeader) {
      return NextResponse.json({ error: 'No auth header' }, { status: 401 });
    }
    if (!googleToken) {
      return NextResponse.json({ error: 'No Google token — sign out and back in to refresh permissions' }, { status: 400 });
    }

    // Validate the Supabase session
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const providerToken = googleToken;

    // Get weeks param (default 4) or explicit start/end
    const url = new URL(request.url);
    const weeksParam = url.searchParams.get('weeks');
    const startParam = url.searchParams.get('start');
    const endParam = url.searchParams.get('end');

    let startOfRange: string;
    let endOfRange: string;
    let weeks = 4;

    if (startParam && endParam) {
      startOfRange = startParam;
      endOfRange = endParam;
    } else {
      weeks = parseInt(weeksParam || '4', 10);
      const today = new Date();
      const dayOfWeek = today.getDay();
      const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const monday = new Date(today);
      monday.setDate(today.getDate() - daysFromMonday);
      monday.setHours(0, 0, 0, 0);
      const endDate = new Date(monday);
      endDate.setDate(monday.getDate() + weeks * 7);
      startOfRange = monday.toISOString();
      endOfRange = endDate.toISOString();
    }

    // Fetch calendar events from Google Calendar API
    const calendarId = url.searchParams.get('calendarId') || 'primary';
    const calendarResponse = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?timeMin=${encodeURIComponent(startOfRange)}&timeMax=${encodeURIComponent(endOfRange)}&singleEvents=true&orderBy=startTime`,
      {
        headers: {
          'Authorization': `Bearer ${providerToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!calendarResponse.ok) {
      const errorText = await calendarResponse.text();
      return NextResponse.json({ error: 'Failed to fetch calendar', details: errorText }, { status: calendarResponse.status });
    }

    const calendarData = await calendarResponse.json();

    // Transform the events to a simpler format
    const events = (calendarData.items || []).map((event: any) => ({
      id: event.id,
      title: event.summary,
      start: event.start.dateTime || event.start.date,
      end: event.end.dateTime || event.end.date,
      allDay: !event.start.dateTime,
    }));

    return NextResponse.json({
      events,
      rangeStart: startOfRange,
      weeks,
    });
  } catch (error) {
    console.error('Calendar API error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

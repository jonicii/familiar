import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET() {
  try {
    // Get the user's session from the Authorization header
    const authHeader = new Headers().get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No auth header' }, { status: 401 });
    }

    // Create a Supabase client with the user's JWT
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Get the session to access the provider token
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get the provider token (Google access token)
    const providerToken = session.provider_token;
    if (!providerToken) {
      return NextResponse.json({ error: 'No Google access token' }, { status: 400 });
    }

    // Get today's date range
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59).toISOString();

    // Fetch calendar events from Google Calendar API
    const calendarResponse = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(startOfDay)}&timeMax=${encodeURIComponent(endOfDay)}&singleEvents=true&orderBy=startTime`,
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
    }));

    return NextResponse.json({ events });
  } catch (error) {
    console.error('Calendar API error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

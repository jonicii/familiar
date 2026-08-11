'use client';

import React, { useState, useEffect } from 'react';
import { Card, Icon, Button } from '@/components/core';
import { supabase, signInWithGoogle, TEST_HOUSEHOLD_INVITE_CODE } from '@/lib/supabase';

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay?: boolean;
}

const WEEK_DAYS = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'];
const MONTHS = ['Januar', 'Februar', 'Mars', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Desember'];

export default function CalendarScreen({ isMobile = false }: { isMobile?: boolean }) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [calendarError, setCalendarError] = useState<string | null>(null);
  const [monthOffset, setMonthOffset] = useState(0); // 0 = current month

  // Current viewing month
  const today = new Date();
  const viewDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  useEffect(() => {
    async function loadEvents() {
      setLoading(true);
      setCalendarError(null);
      try {
        // Get household calendar ID
        const { data: household } = await supabase
          .from('households')
          .select('google_calendar_id')
          .eq('invite_code', TEST_HOUSEHOLD_INVITE_CODE)
          .single();
        const calendarId = household?.google_calendar_id || '';

        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.provider_token) {
          setCalendarError('Ingen Google-tilgang — sign out and sign in again');
          setLoading(false);
          return;
        }

        // Fetch 12 weeks covering the viewing month
        const startOfMonth = new Date(year, month, 1);
        const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59);

        // Expand range slightly to show events spanning the edges
        const startRange = new Date(year, month, -7);
        const endRange = new Date(year, month + 2, 7);

        const res = await fetch(
          `/api/calendar?weeks=10&start=${startRange.toISOString()}&end=${endRange.toISOString()}${calendarId ? `&calendarId=${encodeURIComponent(calendarId)}` : ''}`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
              'x-google-token': session.provider_token || '',
            }
          }
        );

        if (!res.ok) {
          const data = await res.json();
          setCalendarError(data.message || data.error || `Kalenderfeil (${data.status})`);
          setLoading(false);
          return;
        }

        const data = await res.json();
        setEvents(data.events || []);
      } catch (e) {
        console.error('Calendar load error:', e);
        setCalendarError('Klarte ikke å koble til kalender');
      }
      setLoading(false);
    }
    loadEvents();
  }, [year, month]);

  const toOsloYMD = (d: Date) => {
    const ms = d.getTime() + 2 * 60 * 60 * 1000;
    const u = new Date(ms);
    return `${u.getUTCFullYear()}-${String(u.getUTCMonth() + 1).padStart(2, '0')}-${String(u.getUTCDate()).padStart(2, '0')}`;
  };

  const getEventsForDay = (date: Date) => {
    const dateStr = toOsloYMD(date);
    return events.filter(e => {
      if (e.allDay || !e.start?.includes('T')) {
        return e.start?.slice(0, 10) === dateStr;
      }
      const osloMs = new Date(e.start).getTime() + 2 * 60 * 60 * 1000;
      const osloU = new Date(osloMs);
      const eventDateStr = `${osloU.getUTCFullYear()}-${String(osloU.getUTCMonth() + 1).padStart(2, '0')}-${String(osloU.getUTCDate()).padStart(2, '0')}`;
      return eventDateStr === dateStr;
    });
  };

  // Build calendar grid
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();

  // Monday-first: Mon=0, Sun=6
  let startWeekday = firstDayOfMonth.getDay() - 1;
  if (startWeekday < 0) startWeekday = 6;

  const todayStr = toOsloYMD(today);

  // Build weeks array
  const weeks: Date[][] = [];
  let currentDate = new Date(year, month, 1 - startWeekday);
  for (let w = 0; w < 6; w++) {
    const week: Date[] = [];
    for (let d = 0; d < 7; d++) {
      week.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    weeks.push(week);
    if (currentDate.getMonth() > month && currentDate.getFullYear() >= year) break;
  }

  const isCurrentMonth = (date: Date) => date.getMonth() === month;
  const isToday = (date: Date) => toOsloYMD(date) === todayStr;

  const prevMonth = () => setMonthOffset(o => o - 1);
  const nextMonth = () => setMonthOffset(o => o + 1);
  const goToday = () => setMonthOffset(0);

  if (calendarError) {
    return (
      <div>
        <h1 style={{ font: 'var(--type-title)', color: 'var(--text-strong)', marginBottom: 'var(--space-6)' }}>
          Kalender
        </h1>
        <Card>
          <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-3)', font: 'var(--type-body)' }}>
            {calendarError}
          </p>
          <Button onClick={() => signInWithGoogle()}>
            <Icon name="calendar-month" size={16} />
            {' '}Koble til Google Kalender
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 'var(--space-4)',
      }}>
        <h1 style={{ font: 'var(--type-title)', color: 'var(--text-strong)' }}>
          {MONTHS[month]} {year}
        </h1>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <Button tone="soft" size="sm" onClick={prevMonth}>
            <Icon name="chevron-right" size={16} style={{ transform: 'rotate(180deg)' }} />
          </Button>
          {monthOffset !== 0 && (
            <Button tone="soft" size="sm" onClick={goToday}>
              I dag
            </Button>
          )}
          <Button tone="soft" size="sm" onClick={nextMonth}>
            <Icon name="chevron-right" size={16} />
          </Button>
        </div>
      </div>

      {/* Day labels */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '2px',
        marginBottom: '2px',
      }}>
        {WEEK_DAYS.map(d => (
          <div key={d} style={{
            textAlign: 'center',
            font: 'var(--type-caption)',
            color: 'var(--text-faint)',
            padding: 'var(--space-1)',
            fontSize: '11px',
          }}>
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      {loading ? (
        <p style={{ color: 'var(--text-muted)', padding: 'var(--space-6)', textAlign: 'center' }}>Laster...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px)' }}>
          {weeks.map((week, wi) => (
            <div key={wi} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
              {week.map((day) => {
                const dayEvents = getEventsForDay(day);
                const currentMonth = isCurrentMonth(day);
                const todayCell = isToday(day);
                return (
                  <div
                    key={day.toISOString()}
                    style={{
                      minHeight: isMobile ? '70px' : '90px',
                      padding: 'var(--space-1)',
                      borderRadius: 'var(--radius-sm)',
                      background: todayCell ? 'var(--accent-soft)' : 'var(--surface-card)',
                      border: todayCell ? '1.5px solid var(--accent)' : '1px solid var(--line-soft)',
                      opacity: currentMonth ? 1 : 0.35,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1px',
                      overflow: 'hidden',
                    }}
                  >
                    <span style={{
                      font: 'var(--type-numeral)',
                      fontSize: '12px',
                      color: todayCell ? 'var(--accent)' : currentMonth ? 'var(--text-body)' : 'var(--text-faint)',
                      fontWeight: todayCell ? 700 : 400,
                    }}>
                      {day.getDate()}
                    </span>
                    {dayEvents.slice(0, isMobile ? 2 : 3).map((event) => (
                      <div
                        key={event.id}
                        style={{
                          font: 'var(--type-caption)',
                          fontSize: '10px',
                          padding: '1px 3px',
                          background: 'var(--surface-sunk)',
                          borderRadius: '2px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          color: 'var(--text-body)',
                        }}
                        title={event.title}
                      >
                        {event.allDay ? event.title : `${event.start.slice(11, 16)} ${event.title}`}
                      </div>
                    ))}
                    {dayEvents.length > (isMobile ? 2 : 3) && (
                      <span style={{ fontSize: '9px', color: 'var(--text-muted)', paddingLeft: '3px' }}>
                        +{dayEvents.length - (isMobile ? 2 : 3)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

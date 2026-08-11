'use client';

import React, { useState, useEffect } from 'react';
import { Card, Icon } from '@/components/core';
import { supabase } from '@/lib/supabase';

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay?: boolean;
}

const weekDays = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'];

export default function WeekScreen({ isMobile = false }: { isMobile?: boolean }) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEvents() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.provider_token) {
          const res = await fetch('/api/calendar?weeks=1', {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
              'x-google-token': session.provider_token || '',
            }
          });
          if (res.ok) {
            const data = await res.json();
            setEvents(data.events || []);
          }
        }
      } catch (e) {
        console.error('Failed to load calendar:', e);
      }
      setLoading(false);
    }
    loadEvents();
  }, []);

  // Build current week (Monday to Sunday)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayOfWeek = today.getDay();
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const monday = new Date(today);
  monday.setDate(today.getDate() - daysFromMonday);

  const weekData = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    const dateStr = day.toISOString().slice(0, 10);
    return {
      date: day,
      dateStr,
      dayLabel: weekDays[i],
      events: events.filter(e => e.start?.slice(0, 10) === dateStr),
    };
  });

  const todayStr = today.toISOString().slice(0, 10);

  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Des'];

  return (
    <div>
      <h1 style={{ 
        font: 'var(--type-title)', 
        color: 'var(--text-strong)',
        marginBottom: 'var(--space-4)',
      }}>
        Denne uken · {monthLabels[monday.getMonth()]} {monday.getDate()}. — {monthLabels[monday.getMonth()]} {monday.getDate() + 6}.
      </h1>
      
      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Laster...</p>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(7, 1fr)', 
          gap: isMobile ? 'var(--space-3)' : 'var(--space-3)',
        }}>
          {weekData.map((day, index) => {
            const isToday = day.dateStr === todayStr;
            return (
              <Card 
                key={day.dateStr}
                tone={isToday ? 'tint' : 'paper'}
                accent={isToday ? 'var(--accent-soft)' : undefined}
                pad="var(--space-4)"
                style={{ 
                  minHeight: '180px',
                  background: isToday ? 'var(--accent-soft)' : undefined,
                }}
              >
                <div style={{ 
                  textAlign: 'center',
                  marginBottom: 'var(--space-3)',
                }}>
                  <div style={{ 
                    font: 'var(--type-label)', 
                    color: 'var(--text-muted)',
                    marginBottom: 'var(--space-1)',
                  }}>
                    {day.dayLabel.toUpperCase()}
                  </div>
                  <div style={{ 
                    font: 'var(--type-title)',
                    color: isToday ? 'var(--accent)' : 'var(--text-strong)',
                  }}>
                    {day.date.getDate()}
                  </div>
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: 'var(--space-2)' 
                }}>
                  {day.events.length > 0 ? (
                    day.events.map((event) => (
                      <div 
                        key={event.id}
                        style={{
                          font: 'var(--type-caption)',
                          padding: 'var(--space-1) var(--space-2)',
                          background: 'var(--surface-card)',
                          borderRadius: 'var(--radius-xs)',
                          textAlign: 'center',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                        title={event.allDay ? event.title : `${event.start.slice(11, 16)} ${event.title}`}
                      >
                        {event.allDay ? event.title : `${event.start.slice(11, 16)} ${event.title}`}
                      </div>
                    ))
                  ) : (
                    <div style={{ 
                      font: 'var(--type-caption)', 
                      color: 'var(--text-faint)',
                      textAlign: 'center',
                    }}>
                      —
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
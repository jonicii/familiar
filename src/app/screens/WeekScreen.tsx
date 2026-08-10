'use client';

import React from 'react';
import { Card, Icon } from '@/components/core';

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const todayIndex = 0; // Monday

const mockWeekData = [
  { day: 'Mon', date: '10', events: ['Swim 16:00', 'Piano 17:30'] },
  { day: 'Tue', date: '11', events: ['Soccer 15:00'] },
  { day: 'Wed', date: '12', events: [] },
  { day: 'Thu', date: '13', events: ['Dentist 10:00'] },
  { day: 'Fri', date: '14', events: ['Movie night'] },
  { day: 'Sat', date: '15', events: ['Beach trip', 'BBQ at grandparents'] },
  { day: 'Sun', date: '16', events: [] },
];

export default function WeekScreen() {
  return (
    <div>
      <h1 style={{ 
        font: 'var(--type-title)', 
        color: 'var(--text-strong)',
        marginBottom: 'var(--space-6)',
      }}>
        This Week
      </h1>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(7, 1fr)', 
        gap: 'var(--space-3)',
      }}>
        {mockWeekData.map((day, index) => (
          <Card 
            key={day.day}
            tone={index === todayIndex ? 'tint' : 'paper'}
            accent={index === todayIndex ? 'var(--accent-soft)' : undefined}
            pad="var(--space-4)"
            style={{ 
              minHeight: '200px',
              background: index === todayIndex ? 'var(--accent-soft)' : undefined,
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
                {day.day.toUpperCase()}
              </div>
              <div style={{ 
                font: 'var(--type-title)',
                color: index === todayIndex ? 'var(--accent)' : 'var(--text-strong)',
              }}>
                {day.date}
              </div>
            </div>
            
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 'var(--space-2)' 
            }}>
              {day.events.length > 0 ? (
                day.events.map((event, i) => (
                  <div 
                    key={i}
                    style={{
                      font: 'var(--type-caption)',
                      padding: 'var(--space-1) var(--space-2)',
                      background: 'var(--surface-card)',
                      borderRadius: 'var(--radius-xs)',
                      textAlign: 'center',
                    }}
                  >
                    {event}
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
        ))}
      </div>
    </div>
  );
}
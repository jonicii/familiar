'use client';

import React from 'react';
import { Card, Icon } from '@/components/core';

const weekDays = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'];
const todayIndex = 0; // Mandag

const mockWeekData = [
  { day: 'Man', date: '10', events: ['Svømming 16:00', 'Piano 17:30'] },
  { day: 'Tir', date: '11', events: ['Fotball 15:00'] },
  { day: 'Ons', date: '12', events: [] },
  { day: 'Tor', date: '13', events: ['Tannlege 10:00'] },
  { day: 'Fre', date: '14', events: ['Filmkveld'] },
  { day: 'Lør', date: '15', events: ['Strandtur', 'Grill hos besteforeldre'] },
  { day: 'Søn', date: '16', events: [] },
];

export default function WeekScreen({ isMobile = false }: { isMobile?: boolean }) {
  return (
    <div>
      <h1 style={{ 
        font: 'var(--type-title)', 
        color: 'var(--text-strong)',
        marginBottom: 'var(--space-4)',
      }}>
        Denne uken
      </h1>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(7, 1fr)', 
        gap: isMobile ? 'var(--space-3)' : 'var(--space-3)',
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
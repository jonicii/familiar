'use client';

import React from 'react';
import { Card, Button, Icon } from '@/components/core';

const mockChores = [
  { 
    person: 'Nora', 
    color: 'var(--person-3)',
    tasks: [
      { title: 'Red sengen', done: true },
      { title: 'Mate katten', done: true },
      { title: 'Lekser', done: false },
    ]
  },
  { 
    person: 'Mo', 
    color: 'var(--person-4)',
    tasks: [
      { title: 'Pusse tenner', done: true },
      { title: 'Vanne planter', done: false },
    ]
  },
  { 
    person: 'Dad', 
    color: 'var(--person-1)',
    tasks: [
      { title: 'Ta ut resirkulering', done: true },
      { title: 'Handle inn', done: false },
    ]
  },
];

export default function ChoresScreen({ isMobile = false }: { isMobile?: boolean }) {
  return (
    <div>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: isMobile ? 'var(--space-4)' : 'var(--space-6)',
      }}>
        <h1 style={{ font: 'var(--type-title)', color: 'var(--text-strong)' }}>
          Gjøremål
        </h1>
        <Button tone="soft" iconLeft={<Icon name="plus" size={18} />}>
          Legg til
        </Button>
      </div>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: 'var(--space-5)' 
      }}>
        {mockChores.map(person => {
          const doneCount = person.tasks.filter(t => t.done).length;
          const progress = doneCount / person.tasks.length;
          
          return (
            <Card key={person.person} accent={person.color}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 'var(--space-3)',
                marginBottom: 'var(--space-4)',
              }}>
                {/* Avatar placeholder */}
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: `${person.color}22`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  font: 'var(--type-title)',
                  color: person.color,
                }}>
                  {person.person[0]}
                </div>
                <div>
                  <div style={{ font: 'var(--type-subtitle)' }}>{person.person}</div>
                  <div style={{ font: 'var(--type-caption)', color: 'var(--text-muted)' }}>
                    {doneCount}/{person.tasks.length} ferdig
                  </div>
                </div>
              </div>
              
              {/* Progress ring placeholder */}
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: `conic-gradient(${person.color} ${progress * 360}deg, var(--surface-sunk) 0deg)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto var(--space-4)',
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'var(--surface-card)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  font: 'var(--type-numeral)',
                }}>
                  {Math.round(progress * 100)}%
                </div>
              </div>
              
              {/* Task list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {person.tasks.map((task, i) => (
                  <button
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-3)',
                      padding: 'var(--space-2)',
                      background: task.done ? 'var(--surface-sunk)' : 'transparent',
                      border: 'none',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      width: '100%',
                      textAlign: 'left',
                    }}
                  >
                    <span style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: 'var(--radius-xs)',
                      border: task.done ? 'none' : '2px solid var(--line-soft)',
                      background: task.done ? person.color : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      {task.done && <Icon name="check" size={12} style={{ color: 'white' }} />}
                    </span>
                    <span style={{ 
                      font: 'var(--type-body)',
                      textDecoration: task.done ? 'line-through' : 'none',
                      color: task.done ? 'var(--text-faint)' : 'var(--text-body)',
                    }}>
                      {task.title}
                    </span>
                  </button>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
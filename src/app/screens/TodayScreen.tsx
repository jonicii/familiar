'use client';

import React, { useState } from 'react';
import { Card, Button, Icon } from '@/components/core';

// Mock data for now - will connect to Supabase later
const mockData = {
  greeting: 'Good morning',
  householdName: 'The Jakobsens',
  todayDate: 'Monday, Aug 10',
  events: [
    { id: '1', title: 'Swim practice', time: '16:00', person: 'Nora' },
    { id: '2', title: 'Piano lesson', time: '17:30', person: 'Mo' },
  ],
  tasks: [
    { id: '1', title: 'Pack swim bag', done: false, person: 'Nora' },
    { id: '2', title: 'Take out recycling', done: true, person: 'Dad' },
    { id: '3', title: 'Water the plants', done: false, person: 'Mo' },
  ],
  groceryList: [
    { id: '1', item: 'Milk', checked: false },
    { id: '2', item: 'Bread', checked: true },
    { id: '3', item: 'Eggs', checked: false },
    { id: '4', item: 'Apples', checked: false },
  ],
};

export default function TodayScreen() {
  const [tasks, setTasks] = useState(mockData.tasks);
  const [groceryList, setGroceryList] = useState(mockData.groceryList);
  
  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => 
      t.id === id ? { ...t, done: !t.done } : t
    ));
  };
  
  const toggleGrocery = (id: string) => {
    setGroceryList(groceryList.map(g => 
      g.id === id ? { ...g, checked: !g.checked } : g
    ));
  };
  
  const incompleteTasks = tasks.filter(t => !t.done);
  
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 'var(--space-7)', height: '100%' }}>
      {/* Left column - Main content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        {/* Header */}
        <div>
          <h1 style={{ 
            font: 'var(--type-display)', 
            color: 'var(--text-strong)',
            marginBottom: 'var(--space-1)',
          }}>
            {mockData.greeting}
          </h1>
          <p style={{ 
            font: 'var(--type-body)', 
            color: 'var(--text-muted)' 
          }}>
            {mockData.todayDate} · {mockData.householdName}
          </p>
        </div>
        
        {/* Today's Schedule */}
        <Card>
          <h2 style={{ 
            font: 'var(--type-subtitle)', 
            marginBottom: 'var(--space-4)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
          }}>
            <Icon name="calendar-days" size={20} />
            Today
          </h2>
          
          {mockData.events.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {mockData.events.map(event => (
                <div 
                  key={event.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-4)',
                    padding: 'var(--space-3)',
                    background: 'var(--surface-sunk)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <span style={{ 
                    font: 'var(--type-numeral)', 
                    color: 'var(--accent)',
                    minWidth: '50px',
                  }}>
                    {event.time}
                  </span>
                  <span style={{ flex: 1, font: 'var(--type-body)' }}>
                    {event.title}
                  </span>
                  <span style={{
                    font: 'var(--type-caption)',
                    padding: 'var(--pad-chip)',
                    background: 'var(--person-3-soft)',
                    color: 'var(--person-3)',
                    borderRadius: 'var(--radius-pill)',
                  }}>
                    {event.person}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>Nothing on the calendar today.</p>
          )}
        </Card>
        
        {/* Tasks */}
        <Card>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: 'var(--space-4)',
          }}>
            <h2 style={{ 
              font: 'var(--type-subtitle)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
            }}>
              <Icon name="check" size={20} />
              Tasks
            </h2>
            <Button tone="soft" size="sm" iconLeft={<Icon name="plus" size={16} />}>
              Add
            </Button>
          </div>
          
          {incompleteTasks.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {incompleteTasks.map(task => (
                <button
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                    padding: 'var(--space-3)',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%',
                    transition: 'background var(--dur-fast) var(--ease-standard)',
                  }}
                >
                  <span style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: 'var(--radius-xs)',
                    border: '2px solid var(--line-soft)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  </span>
                  <span style={{ flex: 1, font: 'var(--type-body)' }}>
                    {task.title}
                  </span>
                  <span style={{
                    font: 'var(--type-caption)',
                    padding: 'var(--pad-chip)',
                    background: 'var(--person-3-soft)',
                    color: 'var(--person-3)',
                    borderRadius: 'var(--radius-pill)',
                  }}>
                    {task.person}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>All done. That is the whole list.</p>
          )}
        </Card>
      </div>
      
      {/* Right column - Sidebar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        {/* Grocery List */}
        <Card>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: 'var(--space-4)',
          }}>
            <h2 style={{ 
              font: 'var(--type-subtitle)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
            }}>
              <Icon name="shopping-basket" size={20} />
              Groceries
            </h2>
            <Button tone="ghost" size="sm" iconLeft={<Icon name="plus" size={16} />}>
            </Button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {groceryList.map(item => (
              <button
                key={item.id}
                onClick={() => toggleGrocery(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                  padding: 'var(--space-2) var(--space-3)',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                  transition: 'all var(--dur-fast) var(--ease-standard)',
                }}
              >
                <span style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: 'var(--radius-xs)',
                  border: item.checked ? 'none' : '2px solid var(--line-soft)',
                  background: item.checked ? 'var(--ok)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {item.checked && <Icon name="check" size={14} style={{ color: 'white' }} />}
                </span>
                <span style={{ 
                  font: 'var(--type-body)',
                  textDecoration: item.checked ? 'line-through' : 'none',
                  color: item.checked ? 'var(--text-faint)' : 'var(--text-body)',
                }}>
                  {item.item}
                </span>
              </button>
            ))}
          </div>
          
          <div style={{ 
            marginTop: 'var(--space-4)', 
            paddingTop: 'var(--space-3)',
            borderTop: 'var(--border-hair)',
            font: 'var(--type-caption)',
            color: 'var(--text-muted)',
          }}>
            {groceryList.filter(i => !i.checked).length} left
          </div>
        </Card>
        
        {/* Pinned Notes */}
        <Card>
          <h2 style={{ 
            font: 'var(--type-subtitle)',
            marginBottom: 'var(--space-4)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
          }}>
            <Icon name="pin" size={20} />
            Pinned
          </h2>
          
          <div style={{ 
            padding: 'var(--space-3)',
            background: 'var(--surface-sunk)',
            borderRadius: 'var(--radius-md)',
            font: 'var(--type-body)',
          }}>
            Pack sunscreen for beach trip tomorrow!
          </div>
          
          <Button 
            tone="ghost" 
            size="sm" 
            iconLeft={<Icon name="plus" size={16} />}
            style={{ marginTop: 'var(--space-3)' }}
          >
            Add note
          </Button>
        </Card>
      </div>
    </div>
  );
}
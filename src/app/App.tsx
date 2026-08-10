'use client';

import React, { useState } from 'react';
import { NavRail } from '@/components/navigation';
import { Icon } from '@/components/core';
import TodayScreen from '@/app/screens/TodayScreen';
import WeekScreen from '@/app/screens/WeekScreen';
import ChoresScreen from '@/app/screens/ChoresScreen';
import MealsScreen from '@/app/screens/MealsScreen';

type Screen = 'today' | 'week' | 'chores' | 'meals';

export default function App() {
  const [screen, setScreen] = useState<Screen>('today');
  
  const navItems = [
    { value: 'today', label: 'Today', icon: <Icon name="sun" size={26} /> },
    { value: 'week', label: 'Week', icon: <Icon name="calendar-days" size={26} /> },
    { value: 'chores', label: 'Chores', icon: <Icon name="sprout" size={26} /> },
    { value: 'meals', label: 'Meals', icon: <Icon name="utensils" size={26} /> },
  ];
  
  const renderScreen = () => {
    switch (screen) {
      case 'today':
        return <TodayScreen />;
      case 'week':
        return <WeekScreen />;
      case 'chores':
        return <ChoresScreen />;
      case 'meals':
        return <MealsScreen />;
      default:
        return <TodayScreen />;
    }
  };
  
  return (
    <div style={{ 
      display: 'flex', 
      height: '100vh', 
      background: 'var(--surface-page)',
      fontFamily: 'var(--font-ui)',
    }}>
      <NavRail 
        value={screen} 
        onChange={(v) => setScreen(v as Screen)} 
        items={navItems}
        header={
          <div style={{ 
            fontFamily: 'var(--font-display)', 
            fontWeight: 'var(--weight-semibold)',
            fontSize: '20px',
            color: 'var(--text-strong)',
            letterSpacing: '-0.03em',
          }}>
            Familiar
          </div>
        }
        footer={
          <button style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            padding: 'var(--space-3)',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            background: 'transparent',
            color: 'var(--text-muted)',
            cursor: 'pointer',
          }}>
            <Icon name="settings" size={22} />
          </button>
        }
      />
      
      <main style={{ 
        flex: 1, 
        overflow: 'hidden',
        padding: 'var(--pad-screen)',
      }}>
        {renderScreen()}
      </main>
    </div>
  );
}
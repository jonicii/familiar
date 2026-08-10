'use client';

import React, { useState, useEffect } from 'react';
import { NavRail } from '@/components/navigation';
import { Icon, Button, Card } from '@/components/core';
import { supabase, signInWithGoogle } from '@/lib/supabase';
import TodayScreen from '@/app/screens/TodayScreen';
import WeekScreen from '@/app/screens/WeekScreen';
import ChoresScreen from '@/app/screens/ChoresScreen';
import MealsScreen from '@/app/screens/MealsScreen';

type Screen = 'today' | 'week' | 'chores' | 'meals';

export default function App() {
  const [screen, setScreen] = useState<Screen>('today');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignIn = async () => {
    const { data, error } = await signInWithGoogle();
    if (error) {
      console.error('Sign in error:', error);
    }
  };

  const navItems = [
    { value: 'today', label: 'I dag', icon: <Icon name="sun" size={26} /> },
    { value: 'week', label: 'Uke', icon: <Icon name="calendar-days" size={26} /> },
    { value: 'chores', label: 'Gjøremål', icon: <Icon name="sprout" size={26} /> },
    { value: 'meals', label: 'Måltider', icon: <Icon name="utensils" size={26} /> },
  ];

  const renderScreen = () => {
    switch (screen) {
      case 'today':
        return <TodayScreen isMobile={isMobile} />;
      case 'week':
        return <WeekScreen isMobile={isMobile} />;
      case 'chores':
        return <ChoresScreen isMobile={isMobile} />;
      case 'meals':
        return <MealsScreen isMobile={isMobile} />;
      default:
        return <TodayScreen isMobile={isMobile} />;
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'var(--surface-page)',
        fontFamily: 'var(--font-ui)',
      }}>
        <p style={{ color: 'var(--text-muted)' }}>Laster...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'var(--surface-page)',
        fontFamily: 'var(--font-ui)',
        padding: 'var(--pad-screen)',
      }}>
        <Card style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
          <h1 style={{ font: 'var(--type-display)', color: 'var(--text-strong)', marginBottom: 'var(--space-4)' }}>
            Familiær
          </h1>
          <p style={{ font: 'var(--type-body)', color: 'var(--text-muted)', marginBottom: 'var(--space-6)' }}>
            Logg inn for å koble til din familie
          </p>
          <Button onClick={handleSignIn} style={{ width: '100%' }}>
            Logg inn med Google
          </Button>
        </Card>
      </div>
    );
  }

  // Mobile: bottom nav
  if (isMobile) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        height: '100vh', 
        background: 'var(--surface-page)',
        fontFamily: 'var(--font-ui)',
      }}>
        <main style={{ flex: 1, overflow: 'hidden', padding: 'var(--space-4)' }}>
          {renderScreen()}
        </main>
        
        {/* Mobile bottom nav */}
        <nav style={{
          display: 'flex',
          justifyContent: 'space-around',
          padding: 'var(--space-3) var(--space-2)',
          background: 'var(--surface-card)',
          borderTop: 'var(--border-hair)',
        }}>
          {navItems.map((item) => {
            const isActive = screen === item.value;
            return (
              <button
                key={item.value}
                onClick={() => setScreen(item.value as Screen)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 'var(--space-1)',
                  padding: 'var(--space-2)',
                  border: 'none',
                  background: isActive ? 'var(--accent-soft)' : 'transparent',
                  color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  fontSize: '11px',
                }}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    );
  }

  // Desktop: side nav
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
            fontSize: '16px',
            color: 'var(--text-strong)',
            letterSpacing: '-0.03em',
            textAlign: 'center',
          }}>
            Familiær
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
      
      <main style={{ flex: 1, overflow: 'hidden', padding: 'var(--pad-screen)' }}>
        {renderScreen()}
      </main>
    </div>
  );
}

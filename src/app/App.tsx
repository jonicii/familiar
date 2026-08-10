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

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
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

  // Show loading
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

  // Show sign in if not logged in
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
          <h1 style={{ 
            font: 'var(--type-display)', 
            color: 'var(--text-strong)',
            marginBottom: 'var(--space-4)',
          }}>
            Familiær
          </h1>
          <p style={{ 
            font: 'var(--type-body)', 
            color: 'var(--text-muted)',
            marginBottom: 'var(--space-6)',
          }}>
            Logg inn for å koble til din familie
          </p>
          <Button 
            onClick={handleSignIn}
            style={{ width: '100%' }}
          >
            Logg inn med Google
          </Button>
        </Card>
      </div>
    );
  }

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

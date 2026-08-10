'use client';

import React from 'react';
import { Card, Button, Icon } from '@/components/core';

const mockMeals = [
  { day: 'Mandag', meals: { breakfast: 'Kornblanding', lunch: 'Smørbrød', dinner: 'Pasta' } },
  { day: 'Tirsdag', meals: { breakfast: 'Toast', lunch: 'Suppe', dinner: 'Tacos' } },
  { day: 'Onsdag', meals: { breakfast: 'Kreps', lunch: 'Salat', dinner: 'Pizza' } },
  { day: 'Torsdag', meals: { breakfast: 'Yoghurt', lunch: 'Wrap', dinner: 'Curry' } },
  { day: 'Fredag', meals: { breakfast: 'Egg', lunch: 'Restemat', dinner: 'Fisk & chips' } },
  { day: 'Lørdag', meals: { breakfast: 'Vafler', lunch: '', dinner: 'Grill' } },
  { day: 'Søndag', meals: { breakfast: 'Brunch', lunch: '', dinner: 'Stek' } },
];

const mockShoppingList = [
  { item: 'Melk', category: 'Meieriprodukter' },
  { item: 'Brød', category: 'Bakst' },
  { item: 'Pasta', category: 'Skafferi' },
  { item: 'Tomatsaus', category: 'Skafferi' },
  { item: 'Ost', category: 'Meieriprodukter' },
  { item: 'Kylling', category: 'Kjøtt' },
  { item: 'Salat', category: 'Grønnsaker' },
];

export default function MealsScreen({ isMobile = false }: { isMobile?: boolean }) {
  return (
    <div style={{ display: isMobile ? 'flex' : 'grid', flexDirection: isMobile ? 'column' : undefined, gridTemplateColumns: isMobile ? '1fr' : '1fr 320px', gap: isMobile ? 'var(--space-4)' : 'var(--space-7)' }}>
      {/* Left - Meal plan */}
      <div>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: 'var(--space-6)',
        }}>
          <h1 style={{ font: 'var(--type-title)', color: 'var(--text-strong)' }}>
            Måltidsplan
          </h1>
          <Button tone="soft" iconLeft={<Icon name="plus" size={18} />}>
            Legg til
          </Button>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {mockMeals.map((day, index) => (
            <Card key={day.day} pad="var(--space-4)">
              <div style={{ 
                display: 'flex', 
                alignItems: 'center',
                marginBottom: 'var(--space-3)',
              }}>
                <span style={{ 
                  font: 'var(--type-label)', 
                  color: index === 0 ? 'var(--accent)' : 'var(--text-muted)',
                  minWidth: '80px',
                }}>
                  {index === 0 ? 'TODAY' : day.day.toUpperCase()}
                </span>
              </div>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(3, 1fr)', 
                gap: 'var(--space-3)' 
              }}>
                {(['breakfast', 'lunch', 'dinner'] as const).map(meal => (
                  <div key={meal}>
                    <div style={{ 
                      font: 'var(--type-caption)', 
                      color: 'var(--text-faint)',
                      marginBottom: 'var(--space-1)',
                      textTransform: 'capitalize',
                    }}>
                      {meal}
                    </div>
                    <div style={{ font: 'var(--type-body)' }}>
                      {day.meals[meal] || '—'}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
      
      {/* Right - Shopping list */}
      <div>
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
              Handleliste
            </h2>
            <Button tone="ghost" size="sm" iconLeft={<Icon name="plus" size={16} />}>
            </Button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {mockShoppingList.map((item, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                  padding: 'var(--space-2)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <span style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: 'var(--radius-xs)',
                  border: '2px solid var(--line-soft)',
                }} />
                <span style={{ flex: 1, font: 'var(--type-body)' }}>
                  {item.item}
                </span>
                <span style={{ 
                  font: 'var(--type-caption)', 
                  color: 'var(--text-faint)',
                }}>
                  {item.category}
                </span>
              </div>
            ))}
          </div>
        </Card>
        
        <Card style={{ marginTop: 'var(--space-4)' }}>
          <h3 style={{ 
            font: 'var(--type-ui)', 
            marginBottom: 'var(--space-3)',
            color: 'var(--text-muted)',
          }}>
            Kategorier
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            {['Meieriprodukter', 'Bakst', 'Skafferi', 'Kjøtt', 'Grønnsaker'].map(cat => (
              <button
                key={cat}
                style={{
                  padding: 'var(--pad-chip)',
                  borderRadius: 'var(--radius-pill)',
                  border: 'none',
                  background: 'var(--surface-sunk)',
                  font: 'var(--type-caption)',
                  color: 'var(--text-body)',
                  cursor: 'pointer',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
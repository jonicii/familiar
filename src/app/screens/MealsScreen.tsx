'use client';

import React from 'react';
import { Card, Button, Icon } from '@/components/core';

const mockMeals = [
  { day: 'Monday', meals: { breakfast: 'Cereal', lunch: 'Sandwich', dinner: 'Pasta' } },
  { day: 'Tuesday', meals: { breakfast: 'Toast', lunch: 'Soup', dinner: 'Tacos' } },
  { day: 'Wednesday', meals: { breakfast: 'Pancakes', lunch: 'Salad', dinner: 'Pizza' } },
  { day: 'Thursday', meals: { breakfast: 'Yogurt', lunch: 'Wrap', dinner: 'Curry' } },
  { day: 'Friday', meals: { breakfast: 'Eggs', lunch: 'Leftovers', dinner: 'Fish & chips' } },
  { day: 'Saturday', meals: { breakfast: 'Waffles', lunch: '', dinner: 'BBQ' } },
  { day: 'Sunday', meals: { breakfast: 'Brunch', lunch: '', dinner: 'Roast' } },
];

const mockShoppingList = [
  { item: 'Milk', category: 'Dairy' },
  { item: 'Bread', category: 'Bakery' },
  { item: 'Pasta', category: 'Pantry' },
  { item: 'Tomato sauce', category: 'Pantry' },
  { item: 'Cheese', category: 'Dairy' },
  { item: 'Chicken', category: 'Meat' },
  { item: 'Salad', category: 'Produce' },
];

export default function MealsScreen() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 'var(--space-7)' }}>
      {/* Left - Meal plan */}
      <div>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: 'var(--space-6)',
        }}>
          <h1 style={{ font: 'var(--type-title)', color: 'var(--text-strong)' }}>
            Meal Plan
          </h1>
          <Button tone="soft" iconLeft={<Icon name="plus" size={18} />}>
            Add meal
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
              Shopping
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
            Categories
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            {['Dairy', 'Bakery', 'Pantry', 'Meat', 'Produce'].map(cat => (
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
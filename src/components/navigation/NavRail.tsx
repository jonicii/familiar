'use client';

import React from 'react';
import { Icon } from '../core/Icon';

export interface NavRailItem {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

export interface NavRailProps {
  items?: NavRailItem[];
  value?: string;
  onChange?: (value: string) => void;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  style?: React.CSSProperties;
}

export function NavRail({ items = [], value, onChange, header, footer, style }: NavRailProps) {
  return (
    <nav style={{
      width: 'var(--rail-width)',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--surface-card)',
      borderRight: 'var(--border-hair)',
      padding: 'var(--space-4) var(--space-2)',
      flexShrink: 0,
      ...style,
    }}>
      {header && (
        <div style={{ marginBottom: 'var(--space-6)', padding: 'var(--space-2)' }}>
          {header}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', flex: 1 }}>
        {items.map((item) => {
          const isActive = value === item.value;
          return (
            <button
              key={item.value}
              onClick={() => onChange?.(item.value)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 'var(--space-1)',
                padding: 'var(--space-3) var(--space-2)',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: isActive ? 'var(--accent-soft)' : 'transparent',
                color: isActive ? 'var(--text-accent)' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all var(--dur-fast) var(--ease-standard)',
                fontFamily: 'var(--font-ui)',
                fontSize: '12px',
                fontWeight: isActive ? 600 : 400,
                minHeight: 'var(--touch-min)',
              }}
            >
              <span style={{ color: isActive ? 'var(--accent)' : 'inherit' }}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {footer && (
        <div style={{ marginTop: 'auto', padding: 'var(--space-2)' }}>
          {footer}
        </div>
      )}
    </nav>
  );
}

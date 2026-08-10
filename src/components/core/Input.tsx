import React from 'react';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  hint?: string;
  error?: string;
  iconLeft?: React.ReactNode;
  inputSize?: 'md' | 'lg';
}

export function Input({ 
  label, 
  hint, 
  error, 
  iconLeft, 
  inputSize = 'md',
  style,
  ...props 
}: InputProps) {
  const height = inputSize === 'md' ? '52px' : '60px';
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
      {label && (
        <label style={{ font: 'var(--type-caption)', color: 'var(--text-muted)' }}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {iconLeft && (
          <span style={{ 
            position: 'absolute', 
            left: 'var(--space-3)', 
            color: 'var(--text-muted)',
            display: 'flex',
          }}>
            {iconLeft}
          </span>
        )}
        <input
          {...props}
          style={{
            width: '100%',
            height,
            padding: iconLeft ? '0 var(--space-3) 0 44px' : '0 var(--space-4)',
            borderRadius: 'var(--radius-md)',
            border: error ? '1.5px solid var(--danger)' : 'var(--border-soft)',
            background: 'var(--surface-card)',
            font: 'var(--type-body)',
            color: 'var(--text-body)',
            outline: 'none',
            transition: 'all var(--dur-fast) var(--ease-standard)',
            ...style,
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'var(--focus-ring)';
            e.target.style.boxShadow = 'var(--shadow-ring)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = error ? 'var(--danger)' : 'var(--line-soft)';
            e.target.style.boxShadow = 'none';
          }}
        />
      </div>
      {hint && !error && (
        <span style={{ font: 'var(--type-caption)', color: 'var(--text-muted)' }}>
          {hint}
        </span>
      )}
      {error && (
        <span style={{ font: 'var(--type-caption)', color: 'var(--danger)' }}>
          {error}
        </span>
      )}
    </div>
  );
}

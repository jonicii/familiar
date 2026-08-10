import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: 'paper' | 'sunk' | 'tint';
  accent?: string;
  interactive?: boolean;
  pad?: string;
}

const toneStyles = {
  paper: {
    background: 'var(--surface-card)',
    boxShadow: 'var(--shadow-sm)',
  },
  sunk: {
    background: 'var(--surface-sunk)',
    boxShadow: 'none',
  },
  tint: {
    background: 'var(--surface-card)',
    boxShadow: 'var(--shadow-sm)',
  },
};

export function Card({ 
  tone = 'paper', 
  accent, 
  interactive = false, 
  pad = 'var(--pad-card)',
  children, 
  style,
  ...props 
}: CardProps) {
  const [hovered, setHovered] = React.useState(false);
  
  return (
    <div
      {...props}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        borderRadius: 'var(--radius-card)',
        border: 'var(--border-hair)',
        padding: pad,
        transition: 'all var(--dur-fast) var(--ease-standard)',
        transform: hovered && interactive ? 'translateY(var(--hover-lift))' : 'translateY(0)',
        boxShadow: hovered && interactive 
          ? 'var(--shadow-md)' 
          : (toneStyles[tone] as React.CSSProperties).boxShadow,
        background: accent 
          ? `linear-gradient(to right, ${accent} 6px, var(--surface-card) 6px)`
          : toneStyles[tone].background,
        cursor: interactive ? 'pointer' : 'default',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
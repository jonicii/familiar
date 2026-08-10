import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: 'primary' | 'secondary' | 'ghost' | 'soft' | 'ink';
  size?: 'sm' | 'md' | 'lg';
  block?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

const toneStyles = {
  primary: {
    background: 'var(--accent)',
    color: 'var(--accent-contrast)',
    border: 'none',
    boxShadow: 'var(--shadow-sm)',
  },
  secondary: {
    background: 'var(--surface-card)',
    color: 'var(--text-body)',
    border: 'var(--border-hair)',
    boxShadow: 'var(--shadow-sm)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text-body)',
    border: 'none',
    boxShadow: 'none',
  },
  soft: {
    background: 'var(--accent-soft)',
    color: 'var(--text-accent)',
    border: 'none',
    boxShadow: 'none',
  },
  ink: {
    background: 'var(--ink-900)',
    color: 'var(--cream-50)',
    border: 'none',
    boxShadow: 'var(--shadow-sm)',
  },
};

const sizeStyles = {
  sm: { height: '44px', fontSize: '14px', padding: '0 16px' },
  md: { height: '52px', fontSize: '15px', padding: '0 20px' },
  lg: { height: '60px', fontSize: '17px', padding: '0 28px' },
};

export function Button({ 
  tone = 'primary', 
  size = 'md', 
  block = false,
  iconLeft, 
  iconRight, 
  children, 
  style,
  ...props 
}: ButtonProps) {
  const [pressed, setPressed] = React.useState(false);
  
  return (
    <button
      {...props}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        borderRadius: 'var(--radius-pill)',
        fontFamily: 'var(--font-ui)',
        fontWeight: 'var(--weight-medium)',
        cursor: 'pointer',
        transition: 'all var(--dur-fast) var(--ease-standard)',
        transform: pressed ? 'scale(0.965)' : 'scale(1)',
        width: block ? '100%' : 'auto',
        ...toneStyles[tone],
        ...sizeStyles[size],
        ...style,
      }}
    >
      {iconLeft}
      {children}
      {iconRight}
    </button>
  );
}
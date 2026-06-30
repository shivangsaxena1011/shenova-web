import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'blush';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  className = '',
  ...props
}) => {
  const styles = {
    primary: 'bg-primary-lavender text-primary-violet font-semibold',
    secondary: 'bg-bg-surface text-text-secondary border border-bg-border',
    success: 'bg-accent-green text-state-success font-semibold',
    error: 'bg-red-50 text-state-error border border-state-error/10 font-semibold',
    warning: 'bg-accent-peach text-amber-700 font-semibold',
    info: 'bg-accent-blue text-blue-700 font-semibold',
    blush: 'bg-primary-blush text-pink-700 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-inter leading-none tracking-wide ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

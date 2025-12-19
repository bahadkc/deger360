import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    default: 'bg-primary-blue/10 text-primary-blue',
    success: 'bg-green-500/10 text-green-700',
    warning: 'bg-yellow-500/10 text-yellow-700',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}


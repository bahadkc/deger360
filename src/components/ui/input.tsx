'use client';

import { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export function Input({ className, error, ...props }: InputProps) {
  return (
    <div suppressHydrationWarning>
      <input
        className={cn(
          'w-full px-4 py-3 rounded-lg border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-orange',
          error
            ? 'border-red-500'
            : 'border-neutral-200 focus:border-primary-orange',
          className
        )}
        {...props}
        suppressHydrationWarning
      />
      {error && (
        <p className="mt-1 text-sm text-red-500" suppressHydrationWarning>{error}</p>
      )}
    </div>
  );
}


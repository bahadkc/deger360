'use client';

import { useState, useEffect } from 'react';

interface DateDisplayProps {
  date: string | Date;
  format?: 'date' | 'datetime' | 'time';
  locale?: string;
  options?: Intl.DateTimeFormatOptions;
  fallback?: string;
}

/**
 * Client-side only date display component
 * Prevents hydration mismatches by only rendering dates on client
 */
export function DateDisplay({ 
  date, 
  format = 'date',
  locale = 'tr-TR',
  options,
  fallback = '--'
}: DateDisplayProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <span>{fallback}</span>;
  }

  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return <span>{fallback}</span>;
  }

  const defaultOptions: Intl.DateTimeFormatOptions = 
    format === 'datetime' 
      ? { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }
      : format === 'time'
      ? { hour: '2-digit', minute: '2-digit' }
      : { year: 'numeric', month: '2-digit', day: '2-digit' };

  return <span suppressHydrationWarning>{dateObj.toLocaleDateString(locale, options || defaultOptions)}</span>;
}

interface NumberDisplayProps {
  value: number;
  locale?: string;
  options?: Intl.NumberFormatOptions;
  suffix?: string;
  fallback?: string;
}

/**
 * Client-side only number display component
 * Prevents hydration mismatches by only rendering numbers on client
 */
export function NumberDisplay({ 
  value, 
  locale = 'tr-TR',
  options,
  suffix = '',
  fallback = '--'
}: NumberDisplayProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <span>{fallback}</span>;
  }

  if (isNaN(value)) {
    return <span>{fallback}</span>;
  }

  return <span suppressHydrationWarning>{value.toLocaleString(locale, options)}{suffix}</span>;
}


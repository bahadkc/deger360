// Sentry error tracking setup
// Install: npm install @sentry/nextjs

let sentryInitialized = false;

export function initSentry() {
  if (sentryInitialized) return;
  
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  
  if (!dsn) {
    console.warn('Sentry DSN not configured. Error tracking disabled.');
    return;
  }

  // Sentry initialization would go here
  // For now, we'll create a placeholder
  // To enable: npm install @sentry/nextjs
  // Then uncomment and configure:
  
  /*
  import * as Sentry from '@sentry/nextjs';
  
  Sentry.init({
    dsn: dsn,
    tracesSampleRate: 0.1, // 10% of transactions
    environment: process.env.NODE_ENV || 'development',
    enabled: process.env.NODE_ENV === 'production',
  });
  */
  
  sentryInitialized = true;
}

export function captureException(error: Error, context?: Record<string, any>) {
  if (!sentryInitialized) {
    console.error('Error:', error, context);
    return;
  }
  
  // Sentry.captureException(error, { extra: context });
  console.error('Error (would be sent to Sentry):', error, context);
}

export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  if (!sentryInitialized) {
    console.log(`[${level.toUpperCase()}]`, message);
    return;
  }
  
  // Sentry.captureMessage(message, level);
  console.log(`[${level.toUpperCase()}] (would be sent to Sentry):`, message);
}


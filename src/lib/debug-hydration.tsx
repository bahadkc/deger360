'use client';

import { useEffect } from 'react';

/**
 * Debug helper to identify hydration mismatches
 * Add this component temporarily to identify which component is causing issues
 */
export function HydrationDebugger() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Log any hydration warnings
      const originalError = console.error;
      console.error = (...args: any[]) => {
        if (args[0]?.includes?.('hydration') || args[0]?.includes?.('418')) {
          console.group('🔴 Hydration Error Detected');
          console.error(...args);
          console.trace('Stack trace:');
          console.groupEnd();
        }
        originalError.apply(console, args);
      };

      return () => {
        console.error = originalError;
      };
    }
  }, []);

  return null;
}


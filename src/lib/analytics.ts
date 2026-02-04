// Google Analytics event tracking
export const trackEvent = (
  category: string,
  action: string,
  label?: string,
  value?: number
) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Form submission tracking
export const trackFormSubmission = () => {
  trackEvent('Lead', 'form_submission', 'Contact Form');
};

// Page view tracking - optimized to prevent forced reflows
export const trackPageView = (url: string) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    // Use requestIdleCallback to defer DOM queries and prevent forced reflows
    if (window.requestIdleCallback) {
      window.requestIdleCallback(() => {
        if ((window as any).gtag) {
          (window as any).gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
            page_path: url,
          });
        }
      }, { timeout: 2000 });
    } else {
      // Fallback: defer with setTimeout
      setTimeout(() => {
        if ((window as any).gtag) {
          (window as any).gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
            page_path: url,
          });
        }
      }, 100);
    }
  }
};

// Core Web Vitals tracking
export const trackWebVitals = (metric: any) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', metric.name, {
      event_category: 'Web Vitals',
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      event_label: metric.id,
      non_interaction: true,
    });
  }
};


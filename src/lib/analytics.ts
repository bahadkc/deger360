// Google Analytics event tracking
export const trackEvent = (
  category: string,
  action: string,
  label?: string
) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', action, {
      event_category: category,
      event_label: label,
    });
  }
};

// Form submission tracking
export const trackFormSubmission = () => {
  trackEvent('Lead', 'form_submission', 'Contact Form');
};


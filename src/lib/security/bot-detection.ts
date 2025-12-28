/**
 * Bot detection and protection utilities
 */

// Known bot user agents (legitimate bots)
const LEGITIMATE_BOTS = [
  'googlebot',
  'bingbot',
  'slurp', // Yahoo
  'duckduckbot',
  'baiduspider',
  'yandexbot',
  'facebookexternalhit',
  'twitterbot',
  'rogerbot',
  'linkedinbot',
  'embedly',
  'quora link preview',
  'showyoubot',
  'outbrain',
  'pinterest',
  'developers.google.com/+/web/snippet',
  'slackbot',
  'vkShare',
  'W3C_Validator',
  'whatsapp',
  'flipboard',
  'tumblr',
  'bitlybot',
  'skypeuripreview',
  'nuzzel',
  'discordbot',
  'google page speed',
  'qwantify',
  'pinterestbot',
  'bitrix link preview',
  'xing-contenttabreceiver',
  'chrome-lighthouse',
  'applebot',
  'petalbot',
];

// Suspicious patterns
const SUSPICIOUS_PATTERNS = [
  /^$/, // Empty user agent
  /^curl/i,
  /^wget/i,
  /^python/i,
  /^java/i,
  /^go-http/i,
  /^scrapy/i,
  /^http/i,
  /^libwww/i,
  /^lwp-trivial/i,
  /^php/i,
  /^perl/i,
  /^ruby/i,
  /^node/i,
  /^axios/i,
  /^okhttp/i,
  /^postman/i,
  /^insomnia/i,
  /^httpie/i,
  /^resty/i,
  /^apache/i,
  /^nginx/i,
];

// Suspicious IP patterns (common bot networks)
const SUSPICIOUS_IP_RANGES = [
  // Add known bot IP ranges if needed
];

export interface BotDetectionResult {
  isBot: boolean;
  isLegitimateBot: boolean;
  isSuspicious: boolean;
  reason?: string;
  userAgent?: string;
}

/**
 * Detect if request is from a bot
 */
export function detectBot(userAgent: string | null, ip?: string): BotDetectionResult {
  const ua = userAgent || '';
  const lowerUA = ua.toLowerCase();

  // Empty user agent is suspicious
  if (!ua || ua.trim() === '') {
    return {
      isBot: true,
      isLegitimateBot: false,
      isSuspicious: true,
      reason: 'Empty user agent',
      userAgent: ua,
    };
  }

  // Check if it's a legitimate bot
  const isLegitimateBot = LEGITIMATE_BOTS.some((bot) => lowerUA.includes(bot.toLowerCase()));

  if (isLegitimateBot) {
    return {
      isBot: true,
      isLegitimateBot: true,
      isSuspicious: false,
      userAgent: ua,
    };
  }

  // Check for suspicious patterns
  const isSuspicious = SUSPICIOUS_PATTERNS.some((pattern) => pattern.test(ua));

  if (isSuspicious) {
    return {
      isBot: true,
      isLegitimateBot: false,
      isSuspicious: true,
      reason: 'Suspicious user agent pattern',
      userAgent: ua,
    };
  }

  // Check for common browser indicators
  const hasBrowserIndicators =
    lowerUA.includes('mozilla') ||
    lowerUA.includes('chrome') ||
    lowerUA.includes('safari') ||
    lowerUA.includes('firefox') ||
    lowerUA.includes('edge') ||
    lowerUA.includes('opera');

  if (!hasBrowserIndicators && ua.length < 20) {
    return {
      isBot: true,
      isLegitimateBot: false,
      isSuspicious: true,
      reason: 'Missing browser indicators',
      userAgent: ua,
    };
  }

  return {
    isBot: false,
    isLegitimateBot: false,
    isSuspicious: false,
    userAgent: ua,
  };
}

/**
 * Check if IP is suspicious
 */
export function isSuspiciousIP(ip: string): boolean {
  // Check against known suspicious IP ranges
  // This can be extended with actual IP ranges
  return false;
}

/**
 * Rate limit key generator
 */
export function getRateLimitKey(identifier: string, endpoint: string): string {
  return `rate_limit:${endpoint}:${identifier}`;
}


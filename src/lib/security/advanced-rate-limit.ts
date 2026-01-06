/**
 * Advanced rate limiting with IP tracking and DDoS protection
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
    blocked: boolean;
    blockUntil?: number;
    violations: number;
  };
}

const store: RateLimitStore = {};

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  blockDuration?: number; // How long to block after violations
  maxViolations?: number; // Max violations before blocking
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  blocked: boolean;
  retryAfter?: number;
}

/**
 * Advanced rate limiting with violation tracking
 */
export function advancedRateLimit(
  identifier: string,
  endpoint: string,
  options: RateLimitOptions = {
    windowMs: 60000,
    maxRequests: 10,
    blockDuration: 300000, // 5 minutes
    maxViolations: 3,
  }
): RateLimitResult {
  const now = Date.now();
  const key = `${endpoint}:${identifier}`;
  const { windowMs, maxRequests, blockDuration = 300000, maxViolations = 3 } = options;

  // Cleanup old entries periodically
  if (Math.random() < 0.01) {
    Object.keys(store).forEach((k) => {
      const entry = store[k];
      if (entry.resetTime < now && (!entry.blockUntil || entry.blockUntil < now)) {
        delete store[k];
      }
    });
  }

  const record = store[key];

  // Check if currently blocked
  if (record?.blocked && record.blockUntil && record.blockUntil > now) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetTime,
      blocked: true,
      retryAfter: Math.ceil((record.blockUntil - now) / 1000),
    };
  }

  // Reset block if expired
  if (record?.blocked && record.blockUntil && record.blockUntil <= now) {
    delete store[key];
  }

  // Create new record or reset expired one
  if (!record || record.resetTime < now) {
    store[key] = {
      count: 1,
      resetTime: now + windowMs,
      blocked: false,
      violations: 0,
    };
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime: now + windowMs,
      blocked: false,
    };
  }

  // Check if limit exceeded
  if (record.count >= maxRequests) {
    // Increment violations
    const violations = (record.violations || 0) + 1;

    // Block if too many violations
    if (violations >= maxViolations) {
      store[key] = {
        ...record,
        blocked: true,
        blockUntil: now + blockDuration,
        violations,
      };
      return {
        allowed: false,
        remaining: 0,
        resetTime: record.resetTime,
        blocked: true,
        retryAfter: Math.ceil(blockDuration / 1000),
      };
    }

    // Track violation but don't block yet
    store[key] = {
      ...record,
      violations,
    };

    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetTime,
      blocked: false,
    };
  }

  // Increment count
  record.count += 1;
  return {
    allowed: true,
    remaining: maxRequests - record.count,
    resetTime: record.resetTime,
    blocked: false,
  };
}

/**
 * Get client identifier from request
 */
export function getClientIdentifier(request: Request | { headers: Headers }): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  // Use IP as primary identifier
  return ip;
}

/**
 * Check if request should be blocked based on multiple factors
 */
export function shouldBlockRequest(
  identifier: string,
  userAgent: string | null,
  endpoint: string
): { blocked: boolean; reason?: string } {
  // Check rate limit
  const rateLimit = advancedRateLimit(identifier, endpoint, {
    windowMs: 60000, // 1 minute
    maxRequests: 20, // More lenient for legitimate users
    blockDuration: 600000, // 10 minutes block
    maxViolations: 5,
  });

  if (rateLimit.blocked) {
    return {
      blocked: true,
      reason: 'Rate limit exceeded. Too many requests.',
    };
  }

  if (!rateLimit.allowed) {
    return {
      blocked: false, // Not blocked yet, just rate limited
    };
  }

  return {
    blocked: false,
  };
}


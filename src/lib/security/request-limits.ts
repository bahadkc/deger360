/**
 * Request size and payload limits
 */

// Maximum request body size (in bytes)
export const MAX_REQUEST_SIZE = 20 * 1024 * 1024; // 20MB

// Maximum file upload size (in bytes)
export const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

// Maximum number of files per request
export const MAX_FILES_PER_REQUEST = 5;

// Maximum query string length
export const MAX_QUERY_LENGTH = 2048;

// Maximum headers size
export const MAX_HEADERS_SIZE = 8192; // 8KB

/**
 * Validate request size
 */
export function validateRequestSize(request: Request | { url: string; headers: Headers }): {
  valid: boolean;
  error?: string;
} {
  const contentLength = request.headers.get('content-length');
  
  if (contentLength) {
    const size = parseInt(contentLength, 10);
    if (size > MAX_REQUEST_SIZE) {
      return {
        valid: false,
        error: `Request too large. Maximum size is ${MAX_REQUEST_SIZE / 1024 / 1024}MB`,
      };
    }
  }

  // Check URL length
  const url = new URL(request.url);
  if (url.search.length > MAX_QUERY_LENGTH) {
    return {
      valid: false,
      error: `Query string too long. Maximum length is ${MAX_QUERY_LENGTH} characters`,
    };
  }

  return { valid: true };
}

/**
 * Validate file upload
 */
export function validateFileUpload(file: File): {
  valid: boolean;
  error?: string;
} {
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    };
  }

  // Check file type (basic validation)
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`,
    };
  }

  return { valid: true };
}

/**
 * Sanitize input to prevent injection attacks
 */
export function sanitizeInput(input: string): string {
  // Remove null bytes
  let sanitized = input.replace(/\0/g, '');
  
  // Remove control characters except newlines and tabs
  sanitized = sanitized.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');
  
  // Trim whitespace
  sanitized = sanitized.trim();
  
  return sanitized;
}

/**
 * Validate and sanitize JSON payload
 */
export function validateJSONPayload(body: any, maxDepth: number = 10): {
  valid: boolean;
  error?: string;
  sanitized?: any;
} {
  try {
    const jsonString = JSON.stringify(body);
    
    // Check size
    if (jsonString.length > MAX_REQUEST_SIZE) {
      return {
        valid: false,
        error: 'JSON payload too large',
      };
    }

    // Check depth (prevent deeply nested objects)
    const depth = getObjectDepth(body);
    if (depth > maxDepth) {
      return {
        valid: false,
        error: `Object too deeply nested. Maximum depth is ${maxDepth}`,
      };
    }

    // Sanitize string values
    const sanitized = sanitizeObject(body);

    return {
      valid: true,
      sanitized,
    };
  } catch (error) {
    return {
      valid: false,
      error: 'Invalid JSON payload',
    };
  }
}

function getObjectDepth(obj: any, currentDepth: number = 0): number {
  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
    return currentDepth;
  }

  let maxDepth = currentDepth;
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const depth = getObjectDepth(obj[key], currentDepth + 1);
      maxDepth = Math.max(maxDepth, depth);
    }
  }

  return maxDepth;
}

function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    return sanitizeInput(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  if (typeof obj === 'object' && obj !== null) {
    const sanitized: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        sanitized[sanitizeInput(key)] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }

  return obj;
}


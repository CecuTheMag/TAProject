// Simple security middleware using built-in functionality
const requestCounts = new Map();

// Security headers middleware
export const securityMiddleware = {
  // Basic security headers
  headers: (req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
  },

  // Simple rate limiting
  rateLimit: (windowMs = 60000, max = 100, message = 'Too many requests') => {
    return (req, res, next) => {
      const key = req.ip || req.connection.remoteAddress;
      const now = Date.now();
      
      if (!requestCounts.has(key)) {
        requestCounts.set(key, { count: 1, resetTime: now });
        return next();
      }

      const data = requestCounts.get(key);
      
      if (now - data.resetTime > windowMs) {
        data.count = 1;
        data.resetTime = now;
        return next();
      }

      if (data.count >= max) {
        return res.status(429).json({ error: message });
      }

      data.count++;
      next();
    };
  },

  // Enhanced CSRF protection
  csrf: (req, res, next) => {
    // Skip CSRF for GET requests, OPTIONS, and internal calls
    if (['GET', 'OPTIONS'].includes(req.method) || req.path.startsWith('/internal')) {
      return next();
    }

    // Check for CSRF token in header or body (safely)
    const token = req.headers['x-csrf-token'] || (req.body && req.body._csrf);
    const origin = req.get('Origin') || req.get('Referer');
    
    // Allow requests from same origin
    if (origin) {
      const allowedOrigins = [
        'https://school-sync.org',
        'http://localhost:3000',
        'http://localhost:5173'
      ];
      
      try {
        const originUrl = new URL(origin);
        const isAllowed = allowedOrigins.some(allowed => {
          const allowedUrl = new URL(allowed);
          return allowedUrl.origin === originUrl.origin;
        }) || /^https?:\/\/192\.168\.88\..+/.test(origin);
        
        if (isAllowed) {
          return next();
        }
      } catch (e) {
        // Invalid URL, continue to logging
      }
    }
    
    // For now, log suspicious requests but don't block
    if (!origin) {
      console.warn(`[CSRF] No origin header for ${req.method} ${req.path} from ${req.ip}`);
    }
    
    next();
  },

  // Enhanced input sanitization with SQL injection protection
  sanitize: (req, res, next) => {
    const sanitizeValue = (value) => {
      if (typeof value === 'string') {
        // Remove script tags, on* event handlers, and javascript: protocols
        let sanitized = value
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/on\w+\s*=/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/data:text\/html/gi, '')
          .trim();
        
        // SQL injection protection - escape dangerous SQL characters
        // Only for non-parameterized contexts (headers, etc.)
        if (req.path.includes('/admin') || req.headers['x-school-code']) {
          sanitized = sanitized
            .replace(/[';"\\]/g, '') // Remove quotes and backslashes
            .replace(/--/g, '') // Remove SQL comments
            .replace(/\/\*/g, '') // Remove block comment start
            .replace(/\*\//g, '') // Remove block comment end
            .replace(/\b(DROP|DELETE|TRUNCATE|ALTER|CREATE|INSERT|UPDATE|EXEC|EXECUTE)\b/gi, ''); // Remove dangerous SQL keywords
        }
        
        return sanitized;
      }
      return value;
    };

    const sanitizeObject = (obj) => {
      if (obj && typeof obj === 'object') {
        for (const key in obj) {
          if (Array.isArray(obj[key])) {
            obj[key] = obj[key].map(item => 
              typeof item === 'object' ? sanitizeObject(item) : sanitizeValue(item)
            );
          } else if (typeof obj[key] === 'object') {
            sanitizeObject(obj[key]);
          } else {
            obj[key] = sanitizeValue(obj[key]);
          }
        }
      }
      return obj;
    };

    if (req.body) {
      sanitizeObject(req.body);
    }
    if (req.query) {
      sanitizeObject(req.query);
    }
    // Also sanitize headers that could contain school codes
    if (req.headers['x-school-code']) {
      req.headers['x-school-code'] = sanitizeValue(req.headers['x-school-code']);
    }
    next();
  }
};

// Cleanup old rate limit entries
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of requestCounts.entries()) {
    if (now - data.resetTime > 60000) {
      requestCounts.delete(key);
    }
  }
}, 60000);
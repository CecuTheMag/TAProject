export const securityMiddleware = {
  headers: (req, res, next) => {
    // Basic security headers without helmet dependency
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  },
  
  csrf: (req, res, next) => {
    // Simple CSRF protection for admin - allow 192.168.88.* and school-sync.org
    const origin = req.get('Origin') || req.get('Referer');
    if (origin && !/^https?:\/\/(192\.168\.88\.|.*\.?school-sync\.org)/.test(origin)) {
      const userAgent = req.get('User-Agent') || '';
      // Allow API clients
      if (!userAgent.includes('Mozilla')) {
        return next();
      }
      return res.status(403).json({ error: 'CSRF protection: Invalid origin' });
    }
    next();
  },
  
  sanitize: (req, res, next) => {
    // Basic input sanitization
    if (req.body) {
      for (const key in req.body) {
        if (typeof req.body[key] === 'string') {
          req.body[key] = req.body[key].replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        }
      }
    }
    next();
  },
  
  rateLimit: (windowMs, maxRequests, message) => {
    const requests = new Map();
    
    return (req, res, next) => {
      const key = req.ip;
      const now = Date.now();
      
      if (!requests.has(key)) {
        requests.set(key, { count: 1, resetTime: now });
        return next();
      }
      
      const data = requests.get(key);
      if (now - data.resetTime > windowMs) {
        data.count = 1;
        data.resetTime = now;
        return next();
      }
      
      if (data.count >= maxRequests) {
        return res.status(429).json({ error: message });
      }
      
      data.count++;
      next();
    };
  }
};
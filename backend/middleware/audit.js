// Enhanced audit logging middleware for security monitoring
export const auditLogger = {
  middleware: (req, res, next) => {
    const sensitiveRoutes = ['/users', '/auth', '/equipment', '/request'];
    const sensitiveActions = ['POST', 'PUT', 'DELETE'];
    
    // Log all sensitive operations
    if (sensitiveActions.includes(req.method) && 
        sensitiveRoutes.some(route => req.path.startsWith(route))) {
      
      const logData = {
        timestamp: new Date().toISOString(),
        method: req.method,
        path: req.path,
        userId: req.user?.id || 'anonymous',
        userRole: req.user?.role || 'unknown',
        schoolId: req.user?.school_id || 'unknown',
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        origin: req.get('Origin')
      };
      
      // Log specific actions
      if (req.path.includes('/users') && req.method === 'POST') {
        console.log(`[AUDIT] USER_CREATE - ${JSON.stringify(logData)}`);
      } else if (req.path.includes('/users') && req.method === 'DELETE') {
        console.log(`[AUDIT] USER_DELETE - ${JSON.stringify(logData)}`);
      } else if (req.path.includes('/role') && req.method === 'PUT') {
        console.log(`[AUDIT] ROLE_CHANGE - ${JSON.stringify(logData)}`);
      } else if (req.path.includes('/auth/login')) {
        console.log(`[AUDIT] LOGIN_ATTEMPT - ${JSON.stringify(logData)}`);
      } else {
        console.log(`[AUDIT] SENSITIVE_ACTION - ${JSON.stringify(logData)}`);
      }
    }
    
    // Log failed authentication attempts
    const originalSend = res.send;
    res.send = function(data) {
      if (req.path.includes('/auth') && res.statusCode >= 400) {
        console.log(`[AUDIT] AUTH_FAILURE - Status: ${res.statusCode}, IP: ${req.ip}, Path: ${req.path}`);
      }
      originalSend.call(this, data);
    };
    
    next();
  }
};
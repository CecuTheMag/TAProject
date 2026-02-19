export const auditLogger = {
  middleware: (req, res, next) => {
    // Simple audit logging for admin actions
    if (req.method !== 'GET') {
      console.log(`ADMIN AUDIT: ${req.method} ${req.path} - User: ${req.user?.id || 'anonymous'} - IP: ${req.ip}`);
    }
    next();
  }
};
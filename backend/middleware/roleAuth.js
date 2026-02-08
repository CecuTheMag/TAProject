export const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'system_admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

export const requireManager = (req, res, next) => {
  if (!['manager', 'admin', 'system_admin'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Manager access required' });
  }
  next();
};

export const requireTeacher = (req, res, next) => {
  if (!['teacher', 'admin', 'system_admin'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Teacher access required' });
  }
  next();
};

export const requireTeacherOrAdmin = (req, res, next) => {
  if (!['teacher', 'admin', 'system_admin'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Teacher or admin access required' });
  }
  next();
};

export const requireManagerOrAdmin = (req, res, next) => {
  if (!['manager', 'admin', 'system_admin'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Manager or admin access required' });
  }
  next();
};
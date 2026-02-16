// JWT removed. Simple header-based authentication.
function authenticateToken(req, res, next) {
  const email = req.headers['x-user-email'];
  const role = req.headers['x-user-role'];

  if (!email) {
    return res.status(401).json({ error: 'Access denied: user email header missing (x-user-email)' });
  }

  req.user = { email, role: role || 'student' };
  next();
}

module.exports = authenticateToken;

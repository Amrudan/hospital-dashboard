const jwt = require('jsonwebtoken');

// Use a consistent secret key
const JWT_SECRET = 'hms_2024_secure_jwt_secret_key_987654321';

module.exports = function(req, res, next) {
  // Get token from header
  let token = req.header('x-auth-token');

  // If no x-auth-token, try Authorization header
  if (!token) {
    const authHeader = req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7); // Remove 'Bearer ' prefix
    }
  }

  // Check if no token
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    console.error('Token verification error:', err);
    res.status(401).json({ message: 'Token is not valid' });
  }
}; 
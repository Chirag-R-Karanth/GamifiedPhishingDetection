const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  const authHeader = req.header('Authorization');
  
  if (!authHeader) {
    return next();
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return next();
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretcyberkey123');
    req.user = decoded;
    next();
  } catch (err) {
    // If token is invalid, we still allow guest access but ignore user ID
    next();
  }
};

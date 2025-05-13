const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
    return res.status(403).json({ error: 'Access denied. No token provided.' });
  }

  jwt.verify(token, process.env.JSON_WEB_TOKEN_SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token.' });
    }
    req.user = user; // Gán thông tin người dùng vào req.user
    next(); // Tiếp tục xử lý request
  });
};

module.exports = authenticateToken;
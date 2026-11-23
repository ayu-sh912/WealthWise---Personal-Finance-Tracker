const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const result = await pool.query(
      'SELECT id, name, email, currency FROM users WHERE id = $1',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    const user = result.rows[0];
    req.user = {
      _id: user.id,
      id: user.id,
      name: user.name,
      email: user.email,
      currency: user.currency,
    };
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized, token invalid' });
  }
};

module.exports = { protect };

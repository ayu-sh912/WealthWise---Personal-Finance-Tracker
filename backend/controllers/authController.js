const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
};

const DEFAULT_CATEGORIES = [
  { name: 'Salary',        color: '#10b981', icon: 'briefcase',     type: 'income',  is_default: true },
  { name: 'Business',      color: '#6366f1', icon: 'building',      type: 'income',  is_default: true },
  { name: 'Freelance',     color: '#8b5cf6', icon: 'laptop',        type: 'income',  is_default: true },
  { name: 'Investment',    color: '#f59e0b', icon: 'trending-up',   type: 'income',  is_default: true },
  { name: 'Other Income',  color: '#06b6d4', icon: 'plus-circle',   type: 'income',  is_default: true },
  { name: 'Food',          color: '#f97316', icon: 'utensils',      type: 'expense', is_default: true },
  { name: 'Transport',     color: '#3b82f6', icon: 'car',           type: 'expense', is_default: true },
  { name: 'Shopping',      color: '#ec4899', icon: 'shopping-bag',  type: 'expense', is_default: true },
  { name: 'Bills',         color: '#ef4444', icon: 'file-text',     type: 'expense', is_default: true },
  { name: 'Health',        color: '#10b981', icon: 'heart',         type: 'expense', is_default: true },
  { name: 'Entertainment', color: '#8b5cf6', icon: 'film',          type: 'expense', is_default: true },
  { name: 'Education',     color: '#f59e0b', icon: 'book',          type: 'expense', is_default: true },
  { name: 'Housing',       color: '#6366f1', icon: 'home',          type: 'expense', is_default: true },
  { name: 'Other',         color: '#6b7280', icon: 'more-horizontal', type: 'expense', is_default: true },
];

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please provide name, email and password');
  }

  if (password.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters');
  }

  // Check if user exists
  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
  if (existing.rows.length > 0) {
    res.status(400);
    throw new Error('User with this email already exists');
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Insert user
  const userResult = await pool.query(
    `INSERT INTO users (name, email, password) VALUES ($1, $2, $3)
     RETURNING id, name, email, currency, created_at`,
    [name, email.toLowerCase(), hashedPassword]
  );
  const user = userResult.rows[0];

  // Seed default categories
  for (const cat of DEFAULT_CATEGORIES) {
    await pool.query(
      `INSERT INTO categories (user_id, name, type, color, icon, is_default) VALUES ($1, $2, $3, $4, $5, $6)`,
      [user.id, cat.name, cat.type, cat.color, cat.icon, cat.is_default]
    );
  }

  const token = generateToken(user.id);

  res.status(201).json({
    success: true,
    message: 'Registration successful! Welcome to WealthWise.',
    data: {
      _id: user.id,
      name: user.name,
      email: user.email,
      currency: user.currency,
      createdAt: user.created_at,
      token,
    },
  });
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  const result = await pool.query(
    'SELECT id, name, email, password, currency, created_at FROM users WHERE email = $1',
    [email.toLowerCase()]
  );

  if (result.rows.length === 0) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  const user = result.rows[0];
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  const token = generateToken(user.id);

  res.json({
    success: true,
    message: 'Login successful! Welcome back.',
    data: {
      _id: user.id,
      name: user.name,
      email: user.email,
      currency: user.currency,
      createdAt: user.created_at,
      token,
    },
  });
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  const result = await pool.query(
    'SELECT id, name, email, currency, created_at FROM users WHERE id = $1',
    [req.user._id]
  );
  if (result.rows.length === 0) {
    res.status(404);
    throw new Error('User not found');
  }
  const user = result.rows[0];
  res.json({
    success: true,
    data: {
      _id: user.id,
      name: user.name,
      email: user.email,
      currency: user.currency,
      createdAt: user.created_at,
    },
  });
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  const result = await pool.query(
    'SELECT id, name, email, currency, password FROM users WHERE id = $1',
    [req.user._id]
  );
  if (result.rows.length === 0) {
    res.status(404);
    throw new Error('User not found');
  }

  const user = result.rows[0];
  const newName = req.body.name || user.name;
  let newPassword = user.password;

  if (req.body.password) {
    if (req.body.password.length < 6) {
      res.status(400);
      throw new Error('Password must be at least 6 characters');
    }
    const salt = await bcrypt.genSalt(10);
    newPassword = await bcrypt.hash(req.body.password, salt);
  }

  const updated = await pool.query(
    `UPDATE users SET name = $1, password = $2, updated_at = NOW()
     WHERE id = $3
     RETURNING id, name, email, currency`,
    [newName, newPassword, user.id]
  );

  const u = updated.rows[0];
  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      _id: u.id,
      name: u.name,
      email: u.email,
      currency: u.currency,
    },
  });
};

module.exports = { register, login, getMe, updateProfile };

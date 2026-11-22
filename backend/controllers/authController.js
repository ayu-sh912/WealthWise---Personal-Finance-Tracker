const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Category = require('../models/Category');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
};

const DEFAULT_INCOME_CATEGORIES = [
  { name: 'Salary', color: '#10b981', icon: 'briefcase', type: 'income', isDefault: true },
  { name: 'Business', color: '#6366f1', icon: 'building', type: 'income', isDefault: true },
  { name: 'Freelance', color: '#8b5cf6', icon: 'laptop', type: 'income', isDefault: true },
  { name: 'Investment', color: '#f59e0b', icon: 'trending-up', type: 'income', isDefault: true },
  { name: 'Other Income', color: '#06b6d4', icon: 'plus-circle', type: 'income', isDefault: true },
];

const DEFAULT_EXPENSE_CATEGORIES = [
  { name: 'Food', color: '#f97316', icon: 'utensils', type: 'expense', isDefault: true },
  { name: 'Transport', color: '#3b82f6', icon: 'car', type: 'expense', isDefault: true },
  { name: 'Shopping', color: '#ec4899', icon: 'shopping-bag', type: 'expense', isDefault: true },
  { name: 'Bills', color: '#ef4444', icon: 'file-text', type: 'expense', isDefault: true },
  { name: 'Health', color: '#10b981', icon: 'heart', type: 'expense', isDefault: true },
  { name: 'Entertainment', color: '#8b5cf6', icon: 'film', type: 'expense', isDefault: true },
  { name: 'Education', color: '#f59e0b', icon: 'book', type: 'expense', isDefault: true },
  { name: 'Housing', color: '#6366f1', icon: 'home', type: 'expense', isDefault: true },
  { name: 'Other', color: '#6b7280', icon: 'more-horizontal', type: 'expense', isDefault: true },
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

  const userExists = await User.findOne({ email: email.toLowerCase() });
  if (userExists) {
    res.status(400);
    throw new Error('User with this email already exists');
  }

  if (password.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters');
  }

  const user = await User.create({ name, email, password });

  // Seed default categories for new user
  const defaultCategories = [
    ...DEFAULT_INCOME_CATEGORIES.map((c) => ({ ...c, user: user._id })),
    ...DEFAULT_EXPENSE_CATEGORIES.map((c) => ({ ...c, user: user._id })),
  ];
  await Category.insertMany(defaultCategories);

  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    message: 'Registration successful! Welcome to WealthWise.',
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      currency: user.currency,
      createdAt: user.createdAt,
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

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  const token = generateToken(user._id);

  res.json({
    success: true,
    message: 'Login successful! Welcome back.',
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      currency: user.currency,
      createdAt: user.createdAt,
      token,
    },
  });
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      currency: user.currency,
      createdAt: user.createdAt,
    },
  });
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.name = req.body.name || user.name;
  if (req.body.password) {
    if (req.body.password.length < 6) {
      res.status(400);
      throw new Error('Password must be at least 6 characters');
    }
    user.password = req.body.password;
  }

  const updatedUser = await user.save();
  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      currency: updatedUser.currency,
    },
  });
};

module.exports = { register, login, getMe, updateProfile };

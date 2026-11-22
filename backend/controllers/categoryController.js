const Category = require('../models/Category');

// @desc    Get all categories for user
// @route   GET /api/categories
// @access  Private
const getCategories = async (req, res) => {
  const { type } = req.query;
  const filter = { user: req.user._id };
  if (type && ['income', 'expense', 'both'].includes(type)) filter.type = type;

  const categories = await Category.find(filter).sort({ isDefault: -1, name: 1 });
  res.json({ success: true, data: categories });
};

// @desc    Create custom category
// @route   POST /api/categories
// @access  Private
const createCategory = async (req, res) => {
  const { name, type, color, icon } = req.body;

  if (!name || !type) {
    res.status(400);
    throw new Error('Please provide category name and type');
  }

  if (!['income', 'expense', 'both'].includes(type)) {
    res.status(400);
    throw new Error('Type must be income, expense or both');
  }

  const exists = await Category.findOne({ name: { $regex: `^${name}$`, $options: 'i' }, user: req.user._id });
  if (exists) {
    res.status(400);
    throw new Error('Category with this name already exists');
  }

  const category = await Category.create({
    name,
    type,
    color: color || '#6366f1',
    icon: icon || 'tag',
    isDefault: false,
    user: req.user._id,
  });

  res.status(201).json({ success: true, message: 'Category created successfully', data: category });
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private
const updateCategory = async (req, res) => {
  const category = await Category.findOne({ _id: req.params.id, user: req.user._id });
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  if (category.isDefault) {
    res.status(400);
    throw new Error('Default categories cannot be modified');
  }

  category.name = req.body.name || category.name;
  category.color = req.body.color || category.color;
  category.icon = req.body.icon || category.icon;

  const updated = await category.save();
  res.json({ success: true, message: 'Category updated successfully', data: updated });
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private
const deleteCategory = async (req, res) => {
  const category = await Category.findOne({ _id: req.params.id, user: req.user._id });
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  if (category.isDefault) {
    res.status(400);
    throw new Error('Default categories cannot be deleted');
  }
  await category.deleteOne();
  res.json({ success: true, message: 'Category deleted successfully' });
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };

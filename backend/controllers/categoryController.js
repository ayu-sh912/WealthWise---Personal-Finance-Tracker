const pool = require('../config/db');

// @desc    Get all categories for user
// @route   GET /api/categories
// @access  Private
const getCategories = async (req, res) => {
  const { type } = req.query;

  const params = [req.user._id];
  let query = 'SELECT * FROM categories WHERE user_id = $1';

  if (type && ['income', 'expense', 'both'].includes(type)) {
    params.push(type);
    query += ` AND type = $${params.length}`;
  }

  query += ' ORDER BY is_default DESC, name ASC';

  const result = await pool.query(query, params);
  res.json({ success: true, data: result.rows.map(mapCategory) });
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

  // Check for duplicate (case-insensitive)
  const existing = await pool.query(
    'SELECT id FROM categories WHERE user_id = $1 AND name ILIKE $2',
    [req.user._id, name]
  );
  if (existing.rows.length > 0) {
    res.status(400);
    throw new Error('Category with this name already exists');
  }

  const result = await pool.query(
    `INSERT INTO categories (user_id, name, type, color, icon, is_default)
     VALUES ($1, $2, $3, $4, $5, FALSE)
     RETURNING *`,
    [req.user._id, name, type, color || '#6366f1', icon || 'tag']
  );

  res.status(201).json({ success: true, message: 'Category created successfully', data: mapCategory(result.rows[0]) });
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private
const updateCategory = async (req, res) => {
  const result = await pool.query(
    'SELECT * FROM categories WHERE id = $1 AND user_id = $2',
    [req.params.id, req.user._id]
  );
  if (result.rows.length === 0) {
    res.status(404);
    throw new Error('Category not found');
  }

  const category = result.rows[0];
  if (category.is_default) {
    res.status(400);
    throw new Error('Default categories cannot be modified');
  }

  const updated = await pool.query(
    `UPDATE categories
     SET name = $1, color = $2, icon = $3, updated_at = NOW()
     WHERE id = $4 AND user_id = $5
     RETURNING *`,
    [
      req.body.name || category.name,
      req.body.color || category.color,
      req.body.icon || category.icon,
      req.params.id,
      req.user._id,
    ]
  );

  res.json({ success: true, message: 'Category updated successfully', data: mapCategory(updated.rows[0]) });
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private
const deleteCategory = async (req, res) => {
  const result = await pool.query(
    'SELECT * FROM categories WHERE id = $1 AND user_id = $2',
    [req.params.id, req.user._id]
  );
  if (result.rows.length === 0) {
    res.status(404);
    throw new Error('Category not found');
  }

  if (result.rows[0].is_default) {
    res.status(400);
    throw new Error('Default categories cannot be deleted');
  }

  await pool.query('DELETE FROM categories WHERE id = $1 AND user_id = $2', [req.params.id, req.user._id]);
  res.json({ success: true, message: 'Category deleted successfully' });
};

function mapCategory(row) {
  return {
    _id: row.id,
    user: row.user_id,
    name: row.name,
    type: row.type,
    color: row.color,
    icon: row.icon,
    isDefault: row.is_default,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };

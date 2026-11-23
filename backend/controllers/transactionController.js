const pool = require('../config/db');

// @desc    Create transaction
// @route   POST /api/transactions
// @access  Private
const createTransaction = async (req, res) => {
  const { type, amount, category, categoryColor, date, description, notes } = req.body;

  if (!type || !amount || !category) {
    res.status(400);
    throw new Error('Please provide type, amount and category');
  }

  if (!['income', 'expense'].includes(type)) {
    res.status(400);
    throw new Error('Type must be income or expense');
  }

  if (parseFloat(amount) <= 0) {
    res.status(400);
    throw new Error('Amount must be greater than 0');
  }

  const result = await pool.query(
    `INSERT INTO transactions (user_id, type, amount, category, category_color, date, description, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      req.user._id,
      type,
      parseFloat(amount),
      category,
      categoryColor || '#6366f1',
      date ? new Date(date) : new Date(),
      description || null,
      notes || null,
    ]
  );

  const row = result.rows[0];
  res.status(201).json({
    success: true,
    message: 'Transaction added successfully',
    data: mapTransaction(row),
  });
};

// @desc    Get all transactions (with filters)
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res) => {
  const { type, category, dateFrom, dateTo, page = 1, limit = 10 } = req.query;

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const offset = (pageNum - 1) * limitNum;

  const params = [req.user._id];
  const conditions = ['user_id = $1'];

  if (type && ['income', 'expense'].includes(type)) {
    params.push(type);
    conditions.push(`type = $${params.length}`);
  }

  if (category) {
    params.push(`%${category}%`);
    conditions.push(`category ILIKE $${params.length}`);
  }

  if (dateFrom) {
    params.push(new Date(dateFrom));
    conditions.push(`date >= $${params.length}`);
  }

  if (dateTo) {
    params.push(new Date(new Date(dateTo).setHours(23, 59, 59, 999)));
    conditions.push(`date <= $${params.length}`);
  }

  const where = conditions.join(' AND ');

  const [rowsResult, countResult] = await Promise.all([
    pool.query(
      `SELECT * FROM transactions WHERE ${where} ORDER BY date DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limitNum, offset]
    ),
    pool.query(`SELECT COUNT(*) FROM transactions WHERE ${where}`, params),
  ]);

  const total = parseInt(countResult.rows[0].count);

  res.json({
    success: true,
    data: {
      transactions: rowsResult.rows.map(mapTransaction),
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        limit: limitNum,
      },
    },
  });
};

// @desc    Get single transaction
// @route   GET /api/transactions/:id
// @access  Private
const getTransaction = async (req, res) => {
  const result = await pool.query(
    'SELECT * FROM transactions WHERE id = $1 AND user_id = $2',
    [req.params.id, req.user._id]
  );
  if (result.rows.length === 0) {
    res.status(404);
    throw new Error('Transaction not found');
  }
  res.json({ success: true, data: mapTransaction(result.rows[0]) });
};

// @desc    Update transaction
// @route   PUT /api/transactions/:id
// @access  Private
const updateTransaction = async (req, res) => {
  const existing = await pool.query(
    'SELECT * FROM transactions WHERE id = $1 AND user_id = $2',
    [req.params.id, req.user._id]
  );
  if (existing.rows.length === 0) {
    res.status(404);
    throw new Error('Transaction not found');
  }

  const t = existing.rows[0];
  const { type, amount, category, categoryColor, date, description, notes } = req.body;

  if (type && !['income', 'expense'].includes(type)) {
    res.status(400);
    throw new Error('Type must be income or expense');
  }

  if (amount !== undefined && parseFloat(amount) <= 0) {
    res.status(400);
    throw new Error('Amount must be greater than 0');
  }

  const result = await pool.query(
    `UPDATE transactions
     SET type = $1, amount = $2, category = $3, category_color = $4,
         date = $5, description = $6, notes = $7, updated_at = NOW()
     WHERE id = $8 AND user_id = $9
     RETURNING *`,
    [
      type || t.type,
      amount ? parseFloat(amount) : t.amount,
      category || t.category,
      categoryColor || t.category_color,
      date ? new Date(date) : t.date,
      description !== undefined ? description : t.description,
      notes !== undefined ? notes : t.notes,
      req.params.id,
      req.user._id,
    ]
  );

  res.json({ success: true, message: 'Transaction updated successfully', data: mapTransaction(result.rows[0]) });
};

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private
const deleteTransaction = async (req, res) => {
  const result = await pool.query(
    'DELETE FROM transactions WHERE id = $1 AND user_id = $2 RETURNING id',
    [req.params.id, req.user._id]
  );
  if (result.rows.length === 0) {
    res.status(404);
    throw new Error('Transaction not found');
  }
  res.json({ success: true, message: 'Transaction deleted successfully' });
};

function mapTransaction(row) {
  return {
    _id: row.id,
    user: row.user_id,
    type: row.type,
    amount: parseFloat(row.amount),
    category: row.category,
    categoryColor: row.category_color,
    date: row.date,
    description: row.description,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

module.exports = { createTransaction, getTransactions, getTransaction, updateTransaction, deleteTransaction };

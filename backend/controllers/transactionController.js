const Transaction = require('../models/Transaction');

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

  if (amount <= 0) {
    res.status(400);
    throw new Error('Amount must be greater than 0');
  }

  const transaction = await Transaction.create({
    user: req.user._id,
    type,
    amount: parseFloat(amount),
    category,
    categoryColor: categoryColor || '#6366f1',
    date: date ? new Date(date) : new Date(),
    description,
    notes,
  });

  res.status(201).json({
    success: true,
    message: 'Transaction added successfully',
    data: transaction,
  });
};

// @desc    Get all transactions (with filters)
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res) => {
  const { type, category, dateFrom, dateTo, page = 1, limit = 10 } = req.query;

  const filter = { user: req.user._id };

  if (type && ['income', 'expense'].includes(type)) filter.type = type;
  if (category) filter.category = { $regex: category, $options: 'i' };
  if (dateFrom || dateTo) {
    filter.date = {};
    if (dateFrom) filter.date.$gte = new Date(dateFrom);
    if (dateTo) filter.date.$lte = new Date(new Date(dateTo).setHours(23, 59, 59, 999));
  }

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const [transactions, total] = await Promise.all([
    Transaction.find(filter).sort({ date: -1 }).skip(skip).limit(limitNum),
    Transaction.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: {
      transactions,
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
  const transaction = await Transaction.findOne({ _id: req.params.id, user: req.user._id });
  if (!transaction) {
    res.status(404);
    throw new Error('Transaction not found');
  }
  res.json({ success: true, data: transaction });
};

// @desc    Update transaction
// @route   PUT /api/transactions/:id
// @access  Private
const updateTransaction = async (req, res) => {
  const transaction = await Transaction.findOne({ _id: req.params.id, user: req.user._id });
  if (!transaction) {
    res.status(404);
    throw new Error('Transaction not found');
  }

  const { type, amount, category, categoryColor, date, description, notes } = req.body;

  if (type && !['income', 'expense'].includes(type)) {
    res.status(400);
    throw new Error('Type must be income or expense');
  }

  if (amount !== undefined && parseFloat(amount) <= 0) {
    res.status(400);
    throw new Error('Amount must be greater than 0');
  }

  transaction.type = type || transaction.type;
  transaction.amount = amount ? parseFloat(amount) : transaction.amount;
  transaction.category = category || transaction.category;
  transaction.categoryColor = categoryColor || transaction.categoryColor;
  transaction.date = date ? new Date(date) : transaction.date;
  transaction.description = description !== undefined ? description : transaction.description;
  transaction.notes = notes !== undefined ? notes : transaction.notes;

  const updated = await transaction.save();
  res.json({ success: true, message: 'Transaction updated successfully', data: updated });
};

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private
const deleteTransaction = async (req, res) => {
  const transaction = await Transaction.findOne({ _id: req.params.id, user: req.user._id });
  if (!transaction) {
    res.status(404);
    throw new Error('Transaction not found');
  }
  await transaction.deleteOne();
  res.json({ success: true, message: 'Transaction deleted successfully' });
};

module.exports = { createTransaction, getTransactions, getTransaction, updateTransaction, deleteTransaction };

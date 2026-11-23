const pool = require('../config/db');

// Helper to map a goal row + contributions array into the frontend shape
function mapGoal(row, contributions = []) {
  return {
    _id: row.id,
    user: row.user_id,
    name: row.name,
    targetAmount: parseFloat(row.target_amount),
    currentAmount: parseFloat(row.current_amount),
    deadline: row.deadline,
    description: row.description,
    color: row.color,
    status: row.status,
    contributions: contributions.map((c) => ({
      _id: c.id,
      amount: parseFloat(c.amount),
      note: c.note,
      date: c.date,
    })),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// @desc    Get all goals
// @route   GET /api/goals
// @access  Private
const getGoals = async (req, res) => {
  const goalsResult = await pool.query(
    'SELECT * FROM goals WHERE user_id = $1 ORDER BY created_at DESC',
    [req.user._id]
  );

  const goals = await Promise.all(
    goalsResult.rows.map(async (goal) => {
      const contribs = await pool.query(
        'SELECT * FROM goal_contributions WHERE goal_id = $1 ORDER BY date DESC',
        [goal.id]
      );
      return mapGoal(goal, contribs.rows);
    })
  );

  res.json({ success: true, data: goals });
};

// @desc    Get single goal
// @route   GET /api/goals/:id
// @access  Private
const getGoal = async (req, res) => {
  const result = await pool.query(
    'SELECT * FROM goals WHERE id = $1 AND user_id = $2',
    [req.params.id, req.user._id]
  );
  if (result.rows.length === 0) {
    res.status(404);
    throw new Error('Goal not found');
  }

  const contribs = await pool.query(
    'SELECT * FROM goal_contributions WHERE goal_id = $1 ORDER BY date DESC',
    [req.params.id]
  );

  res.json({ success: true, data: mapGoal(result.rows[0], contribs.rows) });
};

// @desc    Create goal
// @route   POST /api/goals
// @access  Private
const createGoal = async (req, res) => {
  const { name, targetAmount, currentAmount, deadline, description, color } = req.body;

  if (!name || !targetAmount) {
    res.status(400);
    throw new Error('Please provide goal name and target amount');
  }

  if (parseFloat(targetAmount) <= 0) {
    res.status(400);
    throw new Error('Target amount must be greater than 0');
  }

  const result = await pool.query(
    `INSERT INTO goals (user_id, name, target_amount, current_amount, deadline, description, color, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'active')
     RETURNING *`,
    [
      req.user._id,
      name,
      parseFloat(targetAmount),
      currentAmount ? parseFloat(currentAmount) : 0,
      deadline ? new Date(deadline) : null,
      description || null,
      color || '#f59e0b',
    ]
  );

  res.status(201).json({ success: true, message: 'Goal created successfully', data: mapGoal(result.rows[0]) });
};

// @desc    Update goal
// @route   PUT /api/goals/:id
// @access  Private
const updateGoal = async (req, res) => {
  const existing = await pool.query(
    'SELECT * FROM goals WHERE id = $1 AND user_id = $2',
    [req.params.id, req.user._id]
  );
  if (existing.rows.length === 0) {
    res.status(404);
    throw new Error('Goal not found');
  }

  const g = existing.rows[0];
  const { name, targetAmount, deadline, description, color, status } = req.body;

  const newTarget = targetAmount ? parseFloat(targetAmount) : parseFloat(g.target_amount);
  const currentAmt = parseFloat(g.current_amount);

  let newStatus = status && ['active', 'completed', 'paused'].includes(status) ? status : g.status;
  // Auto-complete if target reached
  if (currentAmt >= newTarget) newStatus = 'completed';

  const result = await pool.query(
    `UPDATE goals
     SET name = $1, target_amount = $2, deadline = $3, description = $4,
         color = $5, status = $6, updated_at = NOW()
     WHERE id = $7 AND user_id = $8
     RETURNING *`,
    [
      name || g.name,
      newTarget,
      deadline ? new Date(deadline) : g.deadline,
      description !== undefined ? description : g.description,
      color || g.color,
      newStatus,
      req.params.id,
      req.user._id,
    ]
  );

  const contribs = await pool.query(
    'SELECT * FROM goal_contributions WHERE goal_id = $1 ORDER BY date DESC',
    [req.params.id]
  );

  res.json({ success: true, message: 'Goal updated successfully', data: mapGoal(result.rows[0], contribs.rows) });
};

// @desc    Add contribution to goal
// @route   POST /api/goals/:id/contribute
// @access  Private
const contributeToGoal = async (req, res) => {
  const goalResult = await pool.query(
    'SELECT * FROM goals WHERE id = $1 AND user_id = $2',
    [req.params.id, req.user._id]
  );
  if (goalResult.rows.length === 0) {
    res.status(404);
    throw new Error('Goal not found');
  }

  const goal = goalResult.rows[0];
  const { amount, note } = req.body;

  if (!amount || parseFloat(amount) <= 0) {
    res.status(400);
    throw new Error('Please provide a valid contribution amount');
  }

  const contrib = parseFloat(amount);
  let newCurrentAmount = parseFloat(goal.current_amount) + contrib;
  const targetAmount = parseFloat(goal.target_amount);

  let newStatus = goal.status;
  if (newCurrentAmount >= targetAmount) {
    newStatus = 'completed';
    newCurrentAmount = Math.min(newCurrentAmount, targetAmount);
  }

  // Insert contribution
  await pool.query(
    'INSERT INTO goal_contributions (goal_id, amount, note, date) VALUES ($1, $2, $3, NOW())',
    [goal.id, contrib, note || null]
  );

  // Update goal
  const updated = await pool.query(
    `UPDATE goals SET current_amount = $1, status = $2, updated_at = NOW()
     WHERE id = $3 RETURNING *`,
    [newCurrentAmount, newStatus, goal.id]
  );

  const contribs = await pool.query(
    'SELECT * FROM goal_contributions WHERE goal_id = $1 ORDER BY date DESC',
    [goal.id]
  );

  res.json({ success: true, message: 'Contribution added successfully', data: mapGoal(updated.rows[0], contribs.rows) });
};

// @desc    Delete goal
// @route   DELETE /api/goals/:id
// @access  Private
const deleteGoal = async (req, res) => {
  const result = await pool.query(
    'DELETE FROM goals WHERE id = $1 AND user_id = $2 RETURNING id',
    [req.params.id, req.user._id]
  );
  if (result.rows.length === 0) {
    res.status(404);
    throw new Error('Goal not found');
  }
  res.json({ success: true, message: 'Goal deleted successfully' });
};

module.exports = { getGoals, getGoal, createGoal, updateGoal, contributeToGoal, deleteGoal };

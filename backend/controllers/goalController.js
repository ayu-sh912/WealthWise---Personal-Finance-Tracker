const Goal = require('../models/Goal');

// @desc    Get all goals
// @route   GET /api/goals
// @access  Private
const getGoals = async (req, res) => {
  const goals = await Goal.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, data: goals });
};

// @desc    Get single goal
// @route   GET /api/goals/:id
// @access  Private
const getGoal = async (req, res) => {
  const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });
  if (!goal) {
    res.status(404);
    throw new Error('Goal not found');
  }
  res.json({ success: true, data: goal });
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

  const goal = await Goal.create({
    user: req.user._id,
    name,
    targetAmount: parseFloat(targetAmount),
    currentAmount: currentAmount ? parseFloat(currentAmount) : 0,
    deadline: deadline ? new Date(deadline) : undefined,
    description,
    color: color || '#f59e0b',
    status: 'active',
  });

  res.status(201).json({ success: true, message: 'Goal created successfully', data: goal });
};

// @desc    Update goal
// @route   PUT /api/goals/:id
// @access  Private
const updateGoal = async (req, res) => {
  const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });
  if (!goal) {
    res.status(404);
    throw new Error('Goal not found');
  }

  const { name, targetAmount, deadline, description, color, status } = req.body;

  goal.name = name || goal.name;
  goal.targetAmount = targetAmount ? parseFloat(targetAmount) : goal.targetAmount;
  goal.deadline = deadline ? new Date(deadline) : goal.deadline;
  goal.description = description !== undefined ? description : goal.description;
  goal.color = color || goal.color;
  if (status && ['active', 'completed', 'paused'].includes(status)) goal.status = status;

  // Auto-complete if target reached
  if (goal.currentAmount >= goal.targetAmount) goal.status = 'completed';

  const updated = await goal.save();
  res.json({ success: true, message: 'Goal updated successfully', data: updated });
};

// @desc    Add contribution to goal
// @route   POST /api/goals/:id/contribute
// @access  Private
const contributeToGoal = async (req, res) => {
  const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });
  if (!goal) {
    res.status(404);
    throw new Error('Goal not found');
  }

  const { amount, note } = req.body;
  if (!amount || parseFloat(amount) <= 0) {
    res.status(400);
    throw new Error('Please provide a valid contribution amount');
  }

  const contribution = { amount: parseFloat(amount), note, date: new Date() };
  goal.contributions.push(contribution);
  goal.currentAmount += parseFloat(amount);

  if (goal.currentAmount >= goal.targetAmount) {
    goal.status = 'completed';
    goal.currentAmount = Math.min(goal.currentAmount, goal.targetAmount);
  }

  const updated = await goal.save();
  res.json({ success: true, message: 'Contribution added successfully', data: updated });
};

// @desc    Delete goal
// @route   DELETE /api/goals/:id
// @access  Private
const deleteGoal = async (req, res) => {
  const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });
  if (!goal) {
    res.status(404);
    throw new Error('Goal not found');
  }
  await goal.deleteOne();
  res.json({ success: true, message: 'Goal deleted successfully' });
};

module.exports = { getGoals, getGoal, createGoal, updateGoal, contributeToGoal, deleteGoal };

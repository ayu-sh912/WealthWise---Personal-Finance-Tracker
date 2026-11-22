const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: [true, 'Goal name is required'], trim: true, maxlength: [100, 'Name too long'] },
    targetAmount: { type: Number, required: [true, 'Target amount is required'], min: [1, 'Target must be positive'] },
    currentAmount: { type: Number, default: 0, min: 0 },
    deadline: { type: Date },
    description: { type: String, trim: true, maxlength: [300, 'Description too long'] },
    color: { type: String, default: '#f59e0b' },
    status: { type: String, enum: ['active', 'completed', 'paused'], default: 'active' },
    contributions: [
      {
        amount: { type: Number, required: true },
        note: { type: String, trim: true },
        date: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Goal', goalSchema);

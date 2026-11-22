const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['income', 'expense'], required: true },
    amount: { type: Number, required: [true, 'Amount is required'], min: [0.01, 'Amount must be positive'] },
    category: { type: String, required: [true, 'Category is required'], trim: true },
    categoryColor: { type: String, default: '#6366f1' },
    date: { type: Date, required: [true, 'Date is required'], default: Date.now },
    description: { type: String, trim: true, maxlength: [200, 'Description too long'] },
    notes: { type: String, trim: true, maxlength: [500, 'Notes too long'] },
  },
  { timestamps: true }
);

transactionSchema.index({ user: 1, date: -1 });
transactionSchema.index({ user: 1, type: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);

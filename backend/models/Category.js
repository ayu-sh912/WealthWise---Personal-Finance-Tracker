const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Category name is required'], trim: true },
    type: { type: String, enum: ['income', 'expense', 'both'], required: true },
    color: { type: String, default: '#6366f1' },
    icon: { type: String, default: 'tag' },
    isDefault: { type: Boolean, default: false },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);

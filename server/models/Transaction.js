// STEP 3 (Database): Transactions collection (income + expense in one collection, split by `type`).
// `user` links every record to its owner so each person only ever sees their own data.
import mongoose from "mongoose";
export const CATEGORIES = ["Salary","Freelance","Food","Rent","Transport","Shopping","Bills","Health","Entertainment","Other"];
const transactionSchema = new mongoose.Schema({
  user:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  type:     { type: String, enum: ["income", "expense"], required: true },
  amount:   { type: Number, required: true, min: 0.01 },
  category: { type: String, enum: CATEGORIES, default: "Other" },   // Category module: groups data for reports
  date:     { type: Date, required: true, default: Date.now },
  note:     { type: String, trim: true, maxlength: 200 },           // source (income) / description (expense)
}, { timestamps: true });
transactionSchema.index({ user: 1, date: -1 });                    // fast month filters + latest-first lists
export default mongoose.model("Transaction", transactionSchema);

// STEP 4 (Database): Savings goals. progress = saved / target.
import mongoose from "mongoose";
const goalSchema = new mongoose.Schema({
  user:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  title:    { type: String, required: true, trim: true },
  target:   { type: Number, required: true, min: 1 },
  saved:    { type: Number, default: 0, min: 0 },
  deadline: { type: Date },
}, { timestamps: true });
export default mongoose.model("Goal", goalSchema);

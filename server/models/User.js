// STEP 2 (Database): Users collection. Password is stored only as a bcrypt hash.
import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
}, { timestamps: true });
export default mongoose.model("User", userSchema);

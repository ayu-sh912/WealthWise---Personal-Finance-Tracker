// STEP 1 (Database): open one shared MongoDB connection through Mongoose.
import mongoose from "mongoose";
export default async function connectDB() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected");
}

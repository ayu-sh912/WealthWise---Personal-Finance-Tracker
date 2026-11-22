// DEMO DATABASE SEEDER. Run with:  npm run seed
// STEP 1: connect to MongoDB using the same MONGO_URI as the server.
// STEP 2: delete old demo users AND their transactions/goals (so re-running never creates duplicates).
// STEP 3: create demo users with bcrypt-hashed passwords.
// STEP 4: generate 6 months of realistic transactions + savings goals for each user.
import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/User.js";
import Transaction from "./models/Transaction.js";
import Goal from "./models/Goal.js";

await mongoose.connect(process.env.MONGO_URI);

const DEMO_USERS = [
  { name: "Demo User",     email: "demo@wealthwise.com",    password: "demo123",    salary: 40000, rent: 12000 },
  { name: "Student Saver", email: "student@wealthwise.com", password: "student123", salary: 15000, rent: 5000 },
];

// Small repeatable "random" generator: same data every run (seeded), so screenshots/reports stay consistent.
let seedNum = 42;
const rand = (min, max) => { seedNum = (seedNum * 9301 + 49297) % 233280; return Math.round(min + (seedNum / 233280) * (max - min)); };

// STEP 2: cleanup
const old = await User.find({ email: { $in: DEMO_USERS.map((u) => u.email) } });
const oldIds = old.map((u) => u._id);
await Transaction.deleteMany({ user: { $in: oldIds } });
await Goal.deleteMany({ user: { $in: oldIds } });
await User.deleteMany({ _id: { $in: oldIds } });

const now = new Date();
for (const d of DEMO_USERS) {
  // STEP 3: user
  const user = await User.create({ name: d.name, email: d.email, password: await bcrypt.hash(d.password, 10) });

  // STEP 4a: transactions. i = how many months ago (5 = oldest, 0 = current month)
  const tx = [];
  const add = (i, day, type, amount, category, note) =>
    tx.push({ user: user._id, type, amount, category, note, date: new Date(now.getFullYear(), now.getMonth() - i, day, 12) });

  const scale = d.salary / 40000;                         // student gets smaller amounts
  for (let i = 5; i >= 0; i--) {
    const last = i === 0 ? Math.min(now.getDate(), 20) : 28; // never create future-dated rows this month
    add(i, 1, "income", d.salary, "Salary", "Monthly salary");
    if (i % 2 === 0) add(i, 12, "income", Math.round(rand(5000, 12000) * scale), "Freelance", "Side project payment");
    add(i, 3, "expense", d.rent, "Rent", "Room rent");
    add(i, 5, "expense", Math.round(rand(1200, 2200) * scale), "Bills", "Electricity + internet");
    for (const day of [4, 11, 18]) if (day <= last) add(i, day, "expense", Math.round(rand(900, 1800) * scale), "Food", "Groceries / eating out");
    for (const day of [7, 20]) if (day <= last) add(i, day, "expense", Math.round(rand(400, 900) * scale), "Transport", "Fuel / metro / cab");
    if (8 <= last)  add(i, 8,  "expense", Math.round(rand(1500, 5000) * scale), "Shopping", "Clothes / online order");
    if (14 <= last) add(i, 14, "expense", Math.round(rand(500, 1500) * scale), "Entertainment", "Movie / OTT / outing");
    if (i % 3 === 0 && 16 <= last) add(i, 16, "expense", Math.round(rand(600, 2500) * scale), "Health", "Medicine / checkup");
  }
  await Transaction.insertMany(tx);

  // STEP 4b: savings goals (progress varies from 15% to complete)
  const k = scale;
  await Goal.insertMany([
    { user: user._id, title: "New laptop",     target: 60000 * k, saved: 22000 * k, deadline: new Date(now.getFullYear() + 1, 2, 31) },
    { user: user._id, title: "Goa trip",       target: 25000 * k, saved: 18000 * k, deadline: new Date(now.getFullYear() + 1, 0, 15) },
    { user: user._id, title: "Emergency fund", target: 100000 * k, saved: 15000 * k },
    { user: user._id, title: "Phone upgrade",  target: 30000 * k, saved: 30000 * k },
    { user: user._id, title: "Course fees",    target: 12000 * k, saved: 3000 * k, deadline: new Date(now.getFullYear() + 1, 4, 1) },
  ]);
  console.log(`Seeded ${d.email}: ${tx.length} transactions, 5 goals`);
}

console.log("\nDemo logins:\n  demo@wealthwise.com / demo123\n  student@wealthwise.com / student123");
await mongoose.disconnect();
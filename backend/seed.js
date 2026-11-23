require('dotenv').config();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const pool = require('./config/db');

const daysAgo = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return d; };

const INCOME_CATEGORIES = [
  { name: 'Salary',        color: '#10b981', icon: 'briefcase', type: 'income', isDefault: true },
  { name: 'Business',      color: '#6366f1', icon: 'building',  type: 'income', isDefault: true },
  { name: 'Freelance',     color: '#8b5cf6', icon: 'laptop',    type: 'income', isDefault: true },
  { name: 'Investment',    color: '#f59e0b', icon: 'trending-up',type:'income', isDefault: true },
  { name: 'Other Income',  color: '#06b6d4', icon: 'plus-circle',type:'income', isDefault: true },
];

const EXPENSE_CATEGORIES = [
  { name: 'Food',           color: '#f97316', icon: 'utensils',      type: 'expense', isDefault: true },
  { name: 'Transport',      color: '#3b82f6', icon: 'car',           type: 'expense', isDefault: true },
  { name: 'Shopping',       color: '#ec4899', icon: 'shopping-bag',  type: 'expense', isDefault: true },
  { name: 'Bills',          color: '#ef4444', icon: 'file-text',     type: 'expense', isDefault: true },
  { name: 'Health',         color: '#10b981', icon: 'heart',         type: 'expense', isDefault: true },
  { name: 'Entertainment',  color: '#8b5cf6', icon: 'film',          type: 'expense', isDefault: true },
  { name: 'Education',      color: '#f59e0b', icon: 'book',          type: 'expense', isDefault: true },
  { name: 'Housing',        color: '#6366f1', icon: 'home',          type: 'expense', isDefault: true },
  { name: 'Other',          color: '#6b7280', icon: 'more-horizontal',type:'expense', isDefault: true },
];

const INCOME_DATA = [
  { category: 'Salary',       color: '#10b981', desc: 'Monthly Salary - November 2026',  daysAgo: 2,   amount: 55000 },
  { category: 'Salary',       color: '#10b981', desc: 'Monthly Salary - October 2026',   daysAgo: 32,  amount: 55000 },
  { category: 'Salary',       color: '#10b981', desc: 'Monthly Salary - September 2026', daysAgo: 62,  amount: 52000 },
  { category: 'Salary',       color: '#10b981', desc: 'Monthly Salary - August 2026',    daysAgo: 93,  amount: 52000 },
  { category: 'Salary',       color: '#10b981', desc: 'Monthly Salary - July 2026',      daysAgo: 123, amount: 50000 },
  { category: 'Salary',       color: '#10b981', desc: 'Monthly Salary - June 2026',      daysAgo: 153, amount: 50000 },
  { category: 'Salary',       color: '#10b981', desc: 'Monthly Salary - May 2026',       daysAgo: 183, amount: 48000 },
  { category: 'Freelance',    color: '#8b5cf6', desc: 'Website Design Project — Client A',  daysAgo: 10,  amount: 18000 },
  { category: 'Freelance',    color: '#8b5cf6', desc: 'React App Development — Startup',    daysAgo: 45,  amount: 25000 },
  { category: 'Freelance',    color: '#8b5cf6', desc: 'Logo Design + Branding',             daysAgo: 78,  amount: 8500  },
  { category: 'Freelance',    color: '#8b5cf6', desc: 'API Integration Project',            daysAgo: 110, amount: 12000 },
  { category: 'Freelance',    color: '#8b5cf6', desc: 'Mobile UI Design — EdTech App',     daysAgo: 160, amount: 15000 },
  { category: 'Investment',   color: '#f59e0b', desc: 'Mutual Fund SIP Returns - Nov',     daysAgo: 5,   amount: 3200  },
  { category: 'Investment',   color: '#f59e0b', desc: 'Stock Dividends — Infosys',         daysAgo: 28,  amount: 1800  },
  { category: 'Investment',   color: '#f59e0b', desc: 'Mutual Fund SIP Returns - Oct',     daysAgo: 35,  amount: 2900  },
  { category: 'Investment',   color: '#f59e0b', desc: 'Fixed Deposit Interest',            daysAgo: 90,  amount: 4500  },
  { category: 'Investment',   color: '#f59e0b', desc: 'Stock Sale Profit — TCS',           daysAgo: 140, amount: 7200  },
  { category: 'Business',     color: '#6366f1', desc: 'Tutoring Sessions — 10 students',   daysAgo: 15,  amount: 9000  },
  { category: 'Business',     color: '#6366f1', desc: 'Online Course Sales - Udemy',       daysAgo: 55,  amount: 5600  },
  { category: 'Business',     color: '#6366f1', desc: 'YouTube Ad Revenue - October',      daysAgo: 32,  amount: 2300  },
  { category: 'Business',     color: '#6366f1', desc: 'Reselling — Electronics Margin',    daysAgo: 100, amount: 4000  },
  { category: 'Other Income', color: '#06b6d4', desc: 'Birthday Gift from Family',         daysAgo: 20,  amount: 5000  },
  { category: 'Other Income', color: '#06b6d4', desc: 'Cashback — HDFC Credit Card',       daysAgo: 40,  amount: 850   },
  { category: 'Other Income', color: '#06b6d4', desc: 'Tax Refund from IT Department',     daysAgo: 70,  amount: 6200  },
  { category: 'Other Income', color: '#06b6d4', desc: 'Referral Bonus — Zerodha',          daysAgo: 95,  amount: 1500  },
];

const EXPENSE_DATA = [
  { category: 'Food',         color: '#f97316', desc: 'Swiggy — Dinner order',             daysAgo: 1,  amount: 380  },
  { category: 'Food',         color: '#f97316', desc: 'Big Bazaar — Monthly groceries',    daysAgo: 3,  amount: 3200 },
  { category: 'Food',         color: '#f97316', desc: 'Zomato — Pizza with friends',       daysAgo: 6,  amount: 650  },
  { category: 'Food',         color: '#f97316', desc: 'Chai & snacks — office',            daysAgo: 8,  amount: 180  },
  { category: 'Food',         color: '#f97316', desc: 'D-Mart — Weekly vegetables',        daysAgo: 10, amount: 950  },
  { category: 'Food',         color: '#f97316', desc: 'Restaurant — Family dinner',        daysAgo: 14, amount: 1850 },
  { category: 'Food',         color: '#f97316', desc: 'Swiggy Instamart — Essentials',     daysAgo: 18, amount: 420  },
  { category: 'Food',         color: '#f97316', desc: 'Monthly grocery — October',         daysAgo: 35, amount: 3100 },
  { category: 'Food',         color: '#f97316', desc: 'Zomato — Biryani',                  daysAgo: 42, amount: 320  },
  { category: 'Food',         color: '#f97316', desc: 'Grocery — September',               daysAgo: 65, amount: 2900 },
  { category: 'Food',         color: '#f97316', desc: 'Starbucks — Coffee',                daysAgo: 70, amount: 490  },
  { category: 'Transport',    color: '#3b82f6', desc: 'Rapido cab — office commute',       daysAgo: 2,  amount: 180  },
  { category: 'Transport',    color: '#3b82f6', desc: 'Petrol — Honda Activa',             daysAgo: 5,  amount: 500  },
  { category: 'Transport',    color: '#3b82f6', desc: 'Ola cab — Airport drop',            daysAgo: 12, amount: 850  },
  { category: 'Transport',    color: '#3b82f6', desc: 'Monthly Metro pass',                daysAgo: 1,  amount: 650  },
  { category: 'Transport',    color: '#3b82f6', desc: 'Petrol — October',                  daysAgo: 33, amount: 480  },
  { category: 'Shopping',     color: '#ec4899', desc: 'Zara — Casual shirts',              daysAgo: 7,  amount: 2490 },
  { category: 'Shopping',     color: '#ec4899', desc: 'Amazon — Mechanical Keyboard',       daysAgo: 19, amount: 3200 },
  { category: 'Shopping',     color: '#ec4899', desc: 'Myntra — Sneakers sale',            daysAgo: 44, amount: 1899 },
  { category: 'Bills',        color: '#ef4444', desc: 'Airtel Broadband Fiber',            daysAgo: 4,  amount: 999  },
  { category: 'Bills',        color: '#ef4444', desc: 'Electricity Bill — BESCOM',         daysAgo: 9,  amount: 1450 },
  { category: 'Bills',        color: '#ef4444', desc: 'Mobile Postpaid Bill',              daysAgo: 13, amount: 599  },
  { category: 'Health',       color: '#10b981', desc: 'Cult.fit Gym Monthly membership',   daysAgo: 1,  amount: 1800 },
  { category: 'Health',       color: '#10b981', desc: 'Apollo Pharmacy — Multivitamins',    daysAgo: 17, amount: 620  },
  { category: 'Entertainment',color: '#8b5cf6', desc: 'Netflix + Spotify subscription',    daysAgo: 15, amount: 898  },
  { category: 'Entertainment',color: '#8b5cf6', desc: 'PVR Inox — Movie tickets for 2',     daysAgo: 21, amount: 700  },
  { category: 'Education',    color: '#f59e0b', desc: 'Udemy — System Design Course',       daysAgo: 22, amount: 499  },
  { category: 'Housing',      color: '#6366f1', desc: 'Monthly House Rent',                daysAgo: 2,  amount: 14000},
  { category: 'Housing',      color: '#6366f1', desc: 'Society Maintenance fee',           daysAgo: 5,  amount: 2000 },
  { category: 'Other',        color: '#6b7280', desc: 'Gift — Friend\'s birthday',        daysAgo: 11, amount: 1200 },
];

const GOALS_DATA = [
  {
    name: 'Emergency Fund',
    targetAmount: 200000,
    currentAmount: 85000,
    color: '#10b981',
    status: 'active',
    description: '6 months of living expenses as safety net',
    deadline: new Date('2027-06-30'),
    contributions: [
      { amount: 20000, note: 'Initial deposit', date: daysAgo(180) },
      { amount: 15000, note: 'Monthly saving — July',    date: daysAgo(150) },
      { amount: 15000, note: 'Monthly saving — August',  date: daysAgo(120) },
      { amount: 15000, note: 'Monthly saving — September', date: daysAgo(90) },
      { amount: 10000, note: 'Monthly saving — October', date: daysAgo(60) },
      { amount: 10000, note: 'Monthly saving — November',date: daysAgo(5)  },
    ],
  },
  {
    name: 'MacBook Pro 2027',
    targetAmount: 180000,
    currentAmount: 72000,
    color: '#6366f1',
    status: 'active',
    description: 'Saving up for MacBook Pro M4 for development',
    deadline: new Date('2027-01-31'),
    contributions: [
      { amount: 15000, note: 'First saving',              date: daysAgo(160) },
      { amount: 12000, note: 'Freelance bonus added',     date: daysAgo(120) },
      { amount: 15000, note: 'August saving',             date: daysAgo(90)  },
      { amount: 15000, note: 'September saving',          date: daysAgo(60)  },
      { amount: 15000, note: 'October saving',            date: daysAgo(30)  },
    ],
  },
  {
    name: 'Goa Trip — New Year 2027',
    targetAmount: 35000,
    currentAmount: 35000,
    color: '#06b6d4',
    status: 'completed',
    description: 'New Year trip to Goa with college friends!',
    deadline: new Date('2026-12-25'),
    contributions: [
      { amount: 10000, note: 'Started saving',  date: daysAgo(90) },
      { amount: 10000, note: 'Added more',      date: daysAgo(60) },
      { amount: 10000, note: 'Almost there!',   date: daysAgo(30) },
      { amount: 5000,  note: 'Goal completed!', date: daysAgo(10) },
    ],
  },
];

async function seed() {
  try {
    console.log('\n🚀 Starting PostgreSQL database seeding...\n');

    // Run schema.sql first to ensure all tables exist
    const schemaSql = fs.readFileSync(path.join(__dirname, 'models', 'schema.sql'), 'utf-8');
    await pool.query(schemaSql);
    console.log('✅ Schema tables verified/created\n');

    // Clean existing data
    await pool.query('DELETE FROM users');
    console.log('🗑️  Cleared existing data\n');

    // Create Demo User
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const userRes = await pool.query(
      `INSERT INTO users (name, email, password, currency)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email`,
      ['Ayush Agrawal', 'ayush@wealthwise.com', hashedPassword, 'INR']
    );
    const user = userRes.rows[0];
    console.log(`👤 Created user: ${user.name} (${user.email})`);
    console.log(`   Password: password123\n`);

    // Create Categories
    const allCatDefs = [
      ...INCOME_CATEGORIES.map((c) => ({ ...c, is_default: true })),
      ...EXPENSE_CATEGORIES.map((c) => ({ ...c, is_default: true })),
    ];
    for (const cat of allCatDefs) {
      await pool.query(
        `INSERT INTO categories (user_id, name, type, color, icon, is_default)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [user.id, cat.name, cat.type, cat.color, cat.icon, cat.is_default]
      );
    }
    console.log(`🏷️  Created ${allCatDefs.length} categories\n`);

    // Create Transactions
    const allTransactions = [
      ...INCOME_DATA.map(t => ({ ...t, type: 'income' })),
      ...EXPENSE_DATA.map(t => ({ ...t, type: 'expense' })),
    ];

    for (const t of allTransactions) {
      await pool.query(
        `INSERT INTO transactions (user_id, type, amount, category, category_color, date, description, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [user.id, t.type, t.amount, t.category, t.color, daysAgo(t.daysAgo), t.desc, '']
      );
    }

    const totalIncome = INCOME_DATA.reduce((s, t) => s + t.amount, 0);
    const totalExpense = EXPENSE_DATA.reduce((s, t) => s + t.amount, 0);
    console.log(`💰 Created ${INCOME_DATA.length} income transactions (₹${totalIncome.toLocaleString('en-IN')})`);
    console.log(`💸 Created ${EXPENSE_DATA.length} expense transactions (₹${totalExpense.toLocaleString('en-IN')})`);
    console.log(`   Net Balance: ₹${(totalIncome - totalExpense).toLocaleString('en-IN')}\n`);

    // Create Goals & Contributions
    for (const g of GOALS_DATA) {
      const gRes = await pool.query(
        `INSERT INTO goals (user_id, name, target_amount, current_amount, deadline, description, color, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id`,
        [user.id, g.name, g.targetAmount, g.currentAmount, g.deadline, g.description, g.color, g.status]
      );
      const goalId = gRes.rows[0].id;

      for (const c of g.contributions) {
        await pool.query(
          `INSERT INTO goal_contributions (goal_id, amount, note, date)
           VALUES ($1, $2, $3, $4)`,
          [goalId, c.amount, c.note, c.date]
        );
      }
    }
    console.log(`🎯 Created ${GOALS_DATA.length} savings goals with contributions\n`);

    console.log(`
╔════════════════════════════════════════════════════════╗
║          🌟 WealthWise PostgreSQL Seed Complete!       ║
╠════════════════════════════════════════════════════════╣
║  Login Credentials:                                    ║
║  📧 Email    : ayush@wealthwise.com                    ║
║  🔑 Password : password123                             ║
╚════════════════════════════════════════════════════════╝
`);

    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed Error:', err.message);
    await pool.end();
    process.exit(1);
  }
}

seed();

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ─── Models ───────────────────────────────────────────────────────────────────
const User = require('./models/User');
const Category = require('./models/Category');
const Transaction = require('./models/Transaction');
const Goal = require('./models/Goal');

// ─── Helpers ──────────────────────────────────────────────────────────────────
const rnd = (min, max) => Math.round((Math.random() * (max - min) + min) * 100) / 100;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const daysAgo = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return d; };
const dateInRange = (startDaysAgo, endDaysAgo) => {
  const ms = daysAgo(startDaysAgo).getTime();
  const me = daysAgo(endDaysAgo).getTime();
  return new Date(ms + Math.random() * (me - ms));
};

// ─── Seed Data Definitions ────────────────────────────────────────────────────

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

// Income transactions data
const INCOME_DATA = [
  // Last 6 months — salary every month
  { category: 'Salary',       color: '#10b981', desc: 'Monthly Salary - November 2026',  daysAgo: 2,   amount: 55000 },
  { category: 'Salary',       color: '#10b981', desc: 'Monthly Salary - October 2026',   daysAgo: 32,  amount: 55000 },
  { category: 'Salary',       color: '#10b981', desc: 'Monthly Salary - September 2026', daysAgo: 62,  amount: 52000 },
  { category: 'Salary',       color: '#10b981', desc: 'Monthly Salary - August 2026',    daysAgo: 93,  amount: 52000 },
  { category: 'Salary',       color: '#10b981', desc: 'Monthly Salary - July 2026',      daysAgo: 123, amount: 50000 },
  { category: 'Salary',       color: '#10b981', desc: 'Monthly Salary - June 2026',      daysAgo: 153, amount: 50000 },
  { category: 'Salary',       color: '#10b981', desc: 'Monthly Salary - May 2026',       daysAgo: 183, amount: 48000 },

  // Freelance projects
  { category: 'Freelance',    color: '#8b5cf6', desc: 'Website Design Project — Client A',  daysAgo: 10,  amount: 18000 },
  { category: 'Freelance',    color: '#8b5cf6', desc: 'React App Development — Startup',    daysAgo: 45,  amount: 25000 },
  { category: 'Freelance',    color: '#8b5cf6', desc: 'Logo Design + Branding',             daysAgo: 78,  amount: 8500  },
  { category: 'Freelance',    color: '#8b5cf6', desc: 'API Integration Project',            daysAgo: 110, amount: 12000 },
  { category: 'Freelance',    color: '#8b5cf6', desc: 'Mobile UI Design — EdTech App',     daysAgo: 160, amount: 15000 },

  // Investment returns
  { category: 'Investment',   color: '#f59e0b', desc: 'Mutual Fund SIP Returns - Nov',     daysAgo: 5,   amount: 3200  },
  { category: 'Investment',   color: '#f59e0b', desc: 'Stock Dividends — Infosys',         daysAgo: 28,  amount: 1800  },
  { category: 'Investment',   color: '#f59e0b', desc: 'Mutual Fund SIP Returns - Oct',     daysAgo: 35,  amount: 2900  },
  { category: 'Investment',   color: '#f59e0b', desc: 'Fixed Deposit Interest',            daysAgo: 90,  amount: 4500  },
  { category: 'Investment',   color: '#f59e0b', desc: 'Stock Sale Profit — TCS',           daysAgo: 140, amount: 7200  },

  // Business
  { category: 'Business',     color: '#6366f1', desc: 'Tutoring Sessions — 10 students',   daysAgo: 15,  amount: 9000  },
  { category: 'Business',     color: '#6366f1', desc: 'Online Course Sales - Udemy',       daysAgo: 55,  amount: 5600  },
  { category: 'Business',     color: '#6366f1', desc: 'YouTube Ad Revenue - October',      daysAgo: 32,  amount: 2300  },
  { category: 'Business',     color: '#6366f1', desc: 'Reselling — Electronics Margin',    daysAgo: 100, amount: 4000  },

  // Other
  { category: 'Other Income', color: '#06b6d4', desc: 'Birthday Gift from Family',         daysAgo: 20,  amount: 5000  },
  { category: 'Other Income', color: '#06b6d4', desc: 'Cashback — HDFC Credit Card',       daysAgo: 40,  amount: 850   },
  { category: 'Other Income', color: '#06b6d4', desc: 'Tax Refund from IT Department',     daysAgo: 70,  amount: 6200  },
  { category: 'Other Income', color: '#06b6d4', desc: 'Referral Bonus — Zerodha',          daysAgo: 95,  amount: 1500  },
];

// Expense transactions data
const EXPENSE_DATA = [
  // Food
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
  { category: 'Food',         color: '#f97316', desc: 'Grocery — August',                  daysAgo: 95, amount: 3300 },
  { category: 'Food',         color: '#f97316', desc: 'McDonald\'s — With team',           daysAgo: 102,amount: 760  },
  { category: 'Food',         color: '#f97316', desc: 'Grocery — July',                    daysAgo: 125,amount: 3150 },
  { category: 'Food',         color: '#f97316', desc: 'Grocery — June',                    daysAgo: 155,amount: 2950 },

  // Transport
  { category: 'Transport',    color: '#3b82f6', desc: 'Rapido cab — office commute',       daysAgo: 2,  amount: 180  },
  { category: 'Transport',    color: '#3b82f6', desc: 'Petrol — Honda Activa',             daysAgo: 5,  amount: 500  },
  { category: 'Transport',    color: '#3b82f6', desc: 'Ola cab — Airport drop',            daysAgo: 12, amount: 850  },
  { category: 'Transport',    color: '#3b82f6', desc: 'Monthly Metro pass',                daysAgo: 1,  amount: 650  },
  { category: 'Transport',    color: '#3b82f6', desc: 'Petrol — October',                  daysAgo: 33, amount: 480  },
  { category: 'Transport',    color: '#3b82f6', desc: 'Train ticket — Mathura to Delhi',   daysAgo: 48, amount: 240  },
  { category: 'Transport',    color: '#3b82f6', desc: 'Rapido — Weekly commute',           daysAgo: 60, amount: 350  },
  { category: 'Transport',    color: '#3b82f6', desc: 'Petrol — September',                daysAgo: 68, amount: 520  },
  { category: 'Transport',    color: '#3b82f6', desc: 'Uber — Late night cab',             daysAgo: 85, amount: 420  },
  { category: 'Transport',    color: '#3b82f6', desc: 'Vehicle servicing — Activa',        daysAgo: 110,amount: 1800 },
  { category: 'Transport',    color: '#3b82f6', desc: 'Bus pass — August',                 daysAgo: 92, amount: 600  },
  { category: 'Transport',    color: '#3b82f6', desc: 'Flight ticket — Agra to Mumbai',    daysAgo: 150,amount: 4200 },

  // Shopping
  { category: 'Shopping',     color: '#ec4899', desc: 'Myntra — 2 T-shirts + jeans',       daysAgo: 7,  amount: 2100 },
  { category: 'Shopping',     color: '#ec4899', desc: 'Amazon — Wireless earbuds',         daysAgo: 15, amount: 1899 },
  { category: 'Shopping',     color: '#ec4899', desc: 'Flipkart Big Sale — Shoes',         daysAgo: 22, amount: 1500 },
  { category: 'Shopping',     color: '#ec4899', desc: 'Nykaa — Skincare products',         daysAgo: 38, amount: 980  },
  { category: 'Shopping',     color: '#ec4899', desc: 'Amazon — USB Hub + Accessories',    daysAgo: 55, amount: 650  },
  { category: 'Shopping',     color: '#ec4899', desc: 'Diwali shopping — Clothes + gifts', daysAgo: 44, amount: 5500 },
  { category: 'Shopping',     color: '#ec4899', desc: 'Meesho — Kurta set',                daysAgo: 80, amount: 450  },
  { category: 'Shopping',     color: '#ec4899', desc: 'IKEA — Study table accessories',    daysAgo: 100,amount: 1200 },
  { category: 'Shopping',     color: '#ec4899', desc: 'Flipkart — Smart watch',            daysAgo: 130,amount: 3499 },

  // Bills
  { category: 'Bills',        color: '#ef4444', desc: 'Jio recharge — 3 months plan',      daysAgo: 3,  amount: 999  },
  { category: 'Bills',        color: '#ef4444', desc: 'Electricity bill — November',       daysAgo: 5,  amount: 1850 },
  { category: 'Bills',        color: '#ef4444', desc: 'Netflix subscription',               daysAgo: 10, amount: 649  },
  { category: 'Bills',        color: '#ef4444', desc: 'Rent — November 2026',              daysAgo: 1,  amount: 12000},
  { category: 'Bills',        color: '#ef4444', desc: 'Rent — October 2026',               daysAgo: 31, amount: 12000},
  { category: 'Bills',        color: '#ef4444', desc: 'Rent — September 2026',             daysAgo: 61, amount: 12000},
  { category: 'Bills',        color: '#ef4444', desc: 'Electricity bill — October',        daysAgo: 35, amount: 1650 },
  { category: 'Bills',        color: '#ef4444', desc: 'Airtel broadband — October',        daysAgo: 33, amount: 799  },
  { category: 'Bills',        color: '#ef4444', desc: 'Amazon Prime renewal',              daysAgo: 50, amount: 1499 },
  { category: 'Bills',        color: '#ef4444', desc: 'Electricity bill — September',      daysAgo: 65, amount: 1900 },
  { category: 'Bills',        color: '#ef4444', desc: 'Hotstar subscription',              daysAgo: 72, amount: 299  },
  { category: 'Bills',        color: '#ef4444', desc: 'Rent — August 2026',               daysAgo: 92, amount: 12000},
  { category: 'Bills',        color: '#ef4444', desc: 'Water bill — Quarter',              daysAgo: 115,amount: 450  },

  // Health
  { category: 'Health',       color: '#10b981', desc: 'Apollo Pharmacy — Medicines',       daysAgo: 4,  amount: 320  },
  { category: 'Health',       color: '#10b981', desc: 'Cult.fit gym membership — Nov',     daysAgo: 1,  amount: 1500 },
  { category: 'Health',       color: '#10b981', desc: 'Doctor consultation fee',           daysAgo: 20, amount: 500  },
  { category: 'Health',       color: '#10b981', desc: 'Blood test — full body checkup',    daysAgo: 25, amount: 1800 },
  { category: 'Health',       color: '#10b981', desc: 'Gym membership — October',         daysAgo: 32, amount: 1500 },
  { category: 'Health',       color: '#10b981', desc: 'Dental treatment',                  daysAgo: 55, amount: 2200 },
  { category: 'Health',       color: '#10b981', desc: 'Pharmacy — Vitamins & supplements', daysAgo: 75, amount: 680  },
  { category: 'Health',       color: '#10b981', desc: 'Gym + yoga — September',            daysAgo: 62, amount: 1500 },
  { category: 'Health',       color: '#10b981', desc: 'Eye checkup + glasses',             daysAgo: 90, amount: 3200 },

  // Entertainment
  { category: 'Entertainment',color: '#8b5cf6', desc: 'PVR — Stree 2 movie tickets (4)',  daysAgo: 9,  amount: 1200 },
  { category: 'Entertainment',color: '#8b5cf6', desc: 'Spotify Premium — 3 months',       daysAgo: 15, amount: 597  },
  { category: 'Entertainment',color: '#8b5cf6', desc: 'Bowling night with friends',        daysAgo: 28, amount: 800  },
  { category: 'Entertainment',color: '#8b5cf6', desc: 'BookMyShow — Concert tickets',      daysAgo: 40, amount: 2500 },
  { category: 'Entertainment',color: '#8b5cf6', desc: 'Gaming — Steam purchase',           daysAgo: 60, amount: 1299 },
  { category: 'Entertainment',color: '#8b5cf6', desc: 'Zoo + picnic — family outing',     daysAgo: 85, amount: 650  },
  { category: 'Entertainment',color: '#8b5cf6', desc: 'Cricket match tickets',             daysAgo: 120,amount: 1500 },

  // Education
  { category: 'Education',    color: '#f59e0b', desc: 'Udemy — Full Stack Development',   daysAgo: 12, amount: 499  },
  { category: 'Education',    color: '#f59e0b', desc: 'Coursera — ML specialization',     daysAgo: 45, amount: 3200 },
  { category: 'Education',    color: '#f59e0b', desc: 'Books — DSA + System Design',      daysAgo: 30, amount: 850  },
  { category: 'Education',    color: '#f59e0b', desc: 'GLA University semester fee',      daysAgo: 60, amount: 25000},
  { category: 'Education',    color: '#f59e0b', desc: 'AWS certification course',          daysAgo: 90, amount: 4500 },
  { category: 'Education',    color: '#f59e0b', desc: 'Programming books — Flipkart',     daysAgo: 110,amount: 1200 },
  { category: 'Education',    color: '#f59e0b', desc: 'Scaler Academy — 1 month',         daysAgo: 150,amount: 5000 },

  // Housing
  { category: 'Housing',      color: '#6366f1', desc: 'Room interior — Fairy lights etc', daysAgo: 20, amount: 1500 },
  { category: 'Housing',      color: '#6366f1', desc: 'Plumber repair — kitchen sink',    daysAgo: 40, amount: 400  },
  { category: 'Housing',      color: '#6366f1', desc: 'Cleaning supplies — HouseKeeping', daysAgo: 8,  amount: 350  },
  { category: 'Housing',      color: '#6366f1', desc: 'Cushion covers + bedsheet',        daysAgo: 55, amount: 780  },
  { category: 'Housing',      color: '#6366f1', desc: 'Electrical repair — ceiling fan',  daysAgo: 80, amount: 600  },
  { category: 'Housing',      color: '#6366f1', desc: 'WiFi router — new purchase',       daysAgo: 100,amount: 2500 },

  // Other
  { category: 'Other',        color: '#6b7280', desc: 'Gift — Friend\'s birthday',        daysAgo: 11, amount: 1200 },
  { category: 'Other',        color: '#6b7280', desc: 'Charity donation',                 daysAgo: 30, amount: 500  },
  { category: 'Other',        color: '#6b7280', desc: 'Pet food + grooming',              daysAgo: 18, amount: 650  },
  { category: 'Other',        color: '#6b7280', desc: 'Miscellaneous — October',          daysAgo: 45, amount: 800  },
  { category: 'Other',        color: '#6b7280', desc: 'Stationary + printing',            daysAgo: 25, amount: 350  },
];

// Savings Goals
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
  {
    name: 'Investment Portfolio',
    targetAmount: 500000,
    currentAmount: 95000,
    color: '#f59e0b',
    status: 'active',
    description: 'Build a diversified portfolio of mutual funds and stocks',
    deadline: new Date('2028-12-31'),
    contributions: [
      { amount: 20000, note: 'First SIP investment',   date: daysAgo(180) },
      { amount: 15000, note: 'August SIP',              date: daysAgo(120) },
      { amount: 15000, note: 'September SIP',           date: daysAgo(90)  },
      { amount: 20000, note: 'Lump sum — Diwali bonus', date: daysAgo(45)  },
      { amount: 15000, note: 'October SIP',             date: daysAgo(30)  },
      { amount: 10000, note: 'November SIP',            date: daysAgo(5)   },
    ],
  },
  {
    name: 'Two-Wheeler Upgrade',
    targetAmount: 90000,
    currentAmount: 18000,
    color: '#ec4899',
    status: 'paused',
    description: 'Upgrade from Activa to Honda CB300R',
    deadline: new Date('2027-09-30'),
    contributions: [
      { amount: 10000, note: 'Started saving',    date: daysAgo(100) },
      { amount: 8000,  note: 'Added — September', date: daysAgo(60)  },
    ],
  },
  {
    name: 'Higher Education / MS Abroad',
    targetAmount: 1500000,
    currentAmount: 125000,
    color: '#8b5cf6',
    status: 'active',
    description: 'Masters in Computer Science — USA / Canada / Germany',
    deadline: new Date('2028-08-31'),
    contributions: [
      { amount: 50000, note: 'FD maturity added',      date: daysAgo(150) },
      { amount: 25000, note: 'Saving — Q3 2026',       date: daysAgo(90)  },
      { amount: 25000, note: 'Saving — October 2026',  date: daysAgo(45)  },
      { amount: 25000, note: 'Saving — November 2026', date: daysAgo(5)   },
    ],
  },
];

// ─── Main Seed Function ───────────────────────────────────────────────────────
async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('\n✅ Connected to MongoDB\n');

    // ── Clean existing data ──────────────────────────────────────────────────
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Transaction.deleteMany({}),
      Goal.deleteMany({}),
    ]);
    console.log('🗑️  Cleared existing data\n');

    // ── Create Demo User ─────────────────────────────────────────────────────
    const user = await User.create({
      name: 'Ayush Agrawal',
      email: 'ayush@wealthwise.com',
      password: 'password123',
    });
    console.log(`👤 Created user: ${user.name} (${user.email})`);
    console.log(`   Password: password123\n`);

    // ── Create Categories ─────────────────────────────────────────────────────
    const allCatDefs = [
      ...INCOME_CATEGORIES.map((c) => ({ ...c, user: user._id })),
      ...EXPENSE_CATEGORIES.map((c) => ({ ...c, user: user._id })),
    ];
    await Category.insertMany(allCatDefs);
    console.log(`🏷️  Created ${allCatDefs.length} categories (${INCOME_CATEGORIES.length} income + ${EXPENSE_CATEGORIES.length} expense)\n`);

    // ── Create Transactions ───────────────────────────────────────────────────
    const incomeTransactions = INCOME_DATA.map((t) => ({
      user: user._id,
      type: 'income',
      amount: t.amount,
      category: t.category,
      categoryColor: t.color,
      date: daysAgo(t.daysAgo),
      description: t.desc,
      notes: '',
    }));

    const expenseTransactions = EXPENSE_DATA.map((t) => ({
      user: user._id,
      type: 'expense',
      amount: t.amount,
      category: t.category,
      categoryColor: t.color,
      date: daysAgo(t.daysAgo),
      description: t.desc,
      notes: '',
    }));

    await Transaction.insertMany([...incomeTransactions, ...expenseTransactions]);

    const totalIncome = INCOME_DATA.reduce((s, t) => s + t.amount, 0);
    const totalExpense = EXPENSE_DATA.reduce((s, t) => s + t.amount, 0);
    console.log(`💰 Created ${INCOME_DATA.length} income transactions  → Total: ₹${totalIncome.toLocaleString('en-IN')}`);
    console.log(`💸 Created ${EXPENSE_DATA.length} expense transactions → Total: ₹${totalExpense.toLocaleString('en-IN')}`);
    console.log(`   Net Balance: ₹${(totalIncome - totalExpense).toLocaleString('en-IN')}\n`);

    // ── Create Goals ───────────────────────────────────────────────────────────
    const goalsToInsert = GOALS_DATA.map((g) => ({
      user: user._id,
      name: g.name,
      targetAmount: g.targetAmount,
      currentAmount: g.currentAmount,
      color: g.color,
      status: g.status,
      description: g.description,
      deadline: g.deadline,
      contributions: g.contributions,
    }));
    await Goal.insertMany(goalsToInsert);
    console.log(`🎯 Created ${GOALS_DATA.length} savings goals:`);
    GOALS_DATA.forEach((g) => {
      const pct = Math.round((g.currentAmount / g.targetAmount) * 100);
      const bar = '█'.repeat(Math.round(pct / 10)) + '░'.repeat(10 - Math.round(pct / 10));
      console.log(`   ${bar} ${pct.toString().padStart(3)}% — ${g.name} (${g.status})`);
    });

    // ── Summary ───────────────────────────────────────────────────────────────
    console.log(`
╔══════════════════════════════════════════════════════╗
║          🌟 WealthWise Seed Data Complete!           ║
╠══════════════════════════════════════════════════════╣
║                                                      ║
║  Login Credentials:                                  ║
║  📧 Email    : ayush@wealthwise.com                  ║
║  🔑 Password : password123                           ║
║                                                      ║
║  Data Created:                                       ║
║  👤 Users        : 1                                 ║
║  🏷️  Categories   : ${allCatDefs.length} (default seeded)              ║
║  💰 Transactions : ${(INCOME_DATA.length + EXPENSE_DATA.length).toString().padEnd(3)} (${INCOME_DATA.length} income + ${EXPENSE_DATA.length} expense)   ║
║  🎯 Goals        : ${GOALS_DATA.length} (3 active, 1 done, 1 paused) ║
║                                                      ║
║  Open: http://localhost:5173                         ║
╚══════════════════════════════════════════════════════╝
`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed Error:', err.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seed();

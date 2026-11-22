# WealthWise — Personal Finance Tracker
### MERN Stack Mini Project | GLA University, Mathura

---

## 👥 Team Members
| Name | Roll No |
|------|---------|
| Ayush Agrawal | 2415000394 |
| Arush Dishal | 2415000338 |
| Aditya Rai | 2415000104 |
| Medhavi Chaubey | 2415000966 |
| Shubham Dwivedi | 2415001555 |

**Faculty:** Mr. Akash Kumar Choudhary (Master Trainer)

---

## 🛠️ Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React.js + Vite + Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| Charts | Recharts |
| Icons | Lucide React |

---

## 📁 Project Structure
```
NEW_WEALTH/
├── backend/              ← Express REST API (Port 5000)
│   ├── config/db.js
│   ├── controllers/      ← Auth, Transaction, Category, Goal, Report
│   ├── middleware/       ← JWT Auth + Error Handler
│   ├── models/           ← User, Transaction, Category, Goal
│   ├── routes/           ← 5 route files
│   ├── .env              ← Environment variables
│   └── server.js
└── frontend/             ← React + Vite (Port 5173)
    ├── src/
    │   ├── components/   ← Layout, UI, Charts
    │   ├── context/      ← AuthContext + ThemeContext
    │   ├── pages/        ← 9 pages
    │   ├── services/     ← Axios API calls
    │   └── utils/        ← Formatters + Constants
    └── index.html
```

---

## ⚙️ Setup & Run

### Prerequisites
- Node.js v18+
- MongoDB (local or MongoDB Atlas)
- npm

### Step 1 — Configure Backend
```bash
cd backend
cp .env.example .env
# Edit .env and set your MONGO_URI and JWT_SECRET
```

### Step 2 — Start Backend
```bash
cd backend
npm run dev
# Server starts at http://localhost:5000
```

### Step 3 — Start Frontend
```bash
cd frontend
npm run dev
# App opens at http://localhost:5173
```

---

## 🌐 API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/auth/register | Register new user | Public |
| POST | /api/auth/login | Login user | Public |
| GET | /api/auth/me | Get current user | Private |
| PUT | /api/auth/profile | Update profile | Private |
| GET | /api/transactions | Get all transactions | Private |
| POST | /api/transactions | Create transaction | Private |
| PUT | /api/transactions/:id | Update transaction | Private |
| DELETE | /api/transactions/:id | Delete transaction | Private |
| GET | /api/categories | Get categories | Private |
| POST | /api/categories | Create category | Private |
| PUT | /api/categories/:id | Update category | Private |
| DELETE | /api/categories/:id | Delete category | Private |
| GET | /api/goals | Get all goals | Private |
| POST | /api/goals | Create goal | Private |
| POST | /api/goals/:id/contribute | Add contribution | Private |
| PUT | /api/goals/:id | Update goal | Private |
| DELETE | /api/goals/:id | Delete goal | Private |
| GET | /api/reports/summary | Financial summary | Private |
| GET | /api/reports/monthly | Monthly breakdown | Private |
| GET | /api/reports/category | Category breakdown | Private |
| GET | /api/reports/trends | Weekly trends | Private |

---

## ✨ Features
- 🔐 **JWT Authentication** — Secure register/login
- 🌙 **Dark / Light Mode** — Toggle anytime, persists to localStorage
- 📊 **Dashboard** — Stat cards + Recharts bar/pie charts
- 💰 **Income & Expense** — Full CRUD with categories
- 🏷️ **Categories** — Default + custom categories with colors
- 🎯 **Savings Goals** — Track progress, add contributions
- 📈 **Reports** — Monthly trends, category breakdowns
- 📱 **Responsive** — Mobile-first with slide-out sidebar
- 🔒 **Protected Routes** — Only authenticated users access data

---

## 🗄️ Database Models

### User
```json
{ name, email, password(hashed), currency, timestamps }
```

### Transaction
```json
{ user, type(income|expense), amount, category, categoryColor, date, description, notes, timestamps }
```

### Category
```json
{ user, name, type(income|expense|both), color, icon, isDefault, timestamps }
```

### Goal
```json
{ user, name, targetAmount, currentAmount, deadline, description, color, status(active|completed|paused), contributions[], timestamps }
```

---

*WealthWise — Personal Finance Tracker | MERN Stack | GLA University 2026*

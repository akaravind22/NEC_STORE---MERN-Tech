# NEC STORE – FULL-STACK COLLEGE STORE & INVENTORY MANAGEMENT SYSTEM

A full-stack web application designed for campus stores featuring a modern **Liquidmorphism UI**, React frontend, Express.js backend, MySQL database with Sequelize ORM, email OTP authentication, role-based authorization, Razorpay payment verification, weighted average cost inventory calculation, and Excel report generation.

---

## 🚀 TECHNOLOGY STACK

- **Frontend**: React.js, Vite, React Router DOM v6, Zustand state management, Vanilla CSS Liquidmorphism Design System, Lucide React icons, Recharts graphs.
- **Backend**: Node.js, Express.js, JWT, Nodemailer, Sequelize ORM, bcryptjs, Helmet, CORS, Express Rate Limit, ExcelJS.
- **Database**: MySQL (via Sequelize ORM).
- **Payment Gateway**: Razorpay (with backend HMAC SHA256 signature verification).

---

## 🌟 KEY FEATURES

1. **Liquidmorphism UI Design**: Semi-transparent frosted glass cards (`backdrop-filter: blur`), floating gradient background blobs, glowing interactive borders, rounded buttons, and dark/light mode toggle.
2. **Passwordless OTP Authentication**: Email-based 6-digit verification code with auto-focus inputs, paste support, and resend timer.
3. **Role-Based Authorization**: Distinct permissions for `CUSTOMER`, `RETAILER`, and `ADMIN` with protected routing guards.
4. **Security & Price Validation**: Backend recalculation of order prices from MySQL database records (never trusting frontend prices).
5. **Transactional Order Processing**: Stock check, deduction, order item creation, and transaction recording inside database transactions.
6. **Weighted Average Inventory Costing**: Automatic weighted average buying price formula when adding stock batches:
   $$\text{New Average Price} = \frac{(\text{Old Qty} \times \text{Old Buying Price}) + (\text{New Qty} \times \text{New Buying Price})}{\text{Total Qty}}$$
7. **Low Stock Alerts & Notifications**: Automatic notification generation when stock drops below threshold (`quantity <= lowStockThreshold`).
8. **Order Cancellation & Stock Restoration**: Eligible orders (`CREATED`/`PROCESSING`) can be cancelled, instantly restoring product quantities.
9. **Excel Report Downloads**: Downloadable `.xlsx` workbooks generated on backend using ExcelJS for Sales, Inventory Stock, Stock History Audit, and Transactions.

---

## 🛠️ INSTALLATION & SETUP GUIDE

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MySQL Server](https://dev.mysql.com/downloads/installer/) (v8.0 or higher)

### 1. Database Creation
Open MySQL Command Line Client or Workbench and create the database:
```sql
CREATE DATABASE nec_store;
```

---

### 2. Backend Setup

Navigate to the `backend/` directory:
```bash
cd backend
npm install
```

Configure `.env` file inside `backend/`:
```env
PORT=5000

DB_HOST=localhost
DB_PORT=3306
DB_NAME=nec_store
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_DIALECT=mysql

JWT_SECRET=nec_store_super_secret_jwt_key_2026_college_app

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=demo@necstore.com
EMAIL_PASSWORD=demopassword

RAZORPAY_KEY_ID=rzp_test_necstore12345
RAZORPAY_KEY_SECRET=necstore_razorpay_secret_key_98765

FRONTEND_URL=http://localhost:5173
DEMO_MODE=true
```

Run Database Seeder (Populates demo users, categories, products, orders, and notifications):
```bash
npm run seed
```

Start Backend API Server:
```bash
npm run dev
# or npm start
```
The server will run on `http://localhost:5000`.

---

### 3. Frontend Setup

In a new terminal window, navigate to the `frontend/` directory:
```bash
cd frontend
npm install
```

Configure `.env` file inside `frontend/`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=rzp_test_necstore12345
```

Start Frontend Development Server:
```bash
npm run dev
```
The web app will open at `http://localhost:5173`.

---

## 🔑 DEMO ACCOUNTS FOR TESTING

Use any of the accounts below to test different roles. During OTP verification, an on-screen **Demo Mode Notice Box** will display the 6-digit code for instant auto-fill!

| Role | Email Address | Description |
| :--- | :--- | :--- |
| **CUSTOMER** | `student1@necstore.com` | Aarav Patel (Browse, Cart, Razorpay Checkout, Orders) |
| **RETAILER** | `retailer@necstore.com` | Campus Co-op Retailer (Products CRUD, Stock Addition, Sales Analytics, Excel Reports) |
| **ADMIN** | `admin@necstore.com` | Dr. S. K. Sharma (User Management, Suspend/Activate, System Stats) |

---

## 📁 PROJECT STRUCTURE

```text
mwt/
├── backend/
│   ├── src/
│   │   ├── config/          # Sequelize MySQL connection
│   │   ├── controllers/     # Auth, Product, Order, Payment, Stock, User, Report Controllers
│   │   ├── middleware/      # JWT Auth, Role Authorization, Error Handler
│   │   ├── models/          # User, Product, Category, Order, OrderItem, Transaction, StockHistory, Notification
│   │   ├── routes/          # Express API Endpoints
│   │   ├── seeders/         # Database Seed Script (npm run seed)
│   │   └── utils/           # Nodemailer, Razorpay HMAC, ExcelJS Generator
│   ├── server.js            # Express server entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios API helpers
│   │   ├── components/      # Common Liquidmorphism elements, Layouts (Navbar, Sidebar, Footer)
│   │   ├── pages/           # Public, Customer, Retailer, Admin views
│   │   ├── store/           # Zustand Stores (useAuthStore, useCartStore, useToastStore)
│   │   ├── App.jsx          # React Router & Role Protection Guards
│   │   ├── main.jsx         # Vite entry
│   │   └── index.css        # Liquidmorphism Design System CSS
│   └── package.json
└── README.md
```

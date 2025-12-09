# CSE 340 - Web Backend Development

A full-stack web application for vehicle inventory management, built with Node.js, Express, and EJS. This project demonstrates Server-Side Rendering (SSR), authentication with JWT, and PostgreSQL database integration.

## 🚀 Live Demo

- **Production URL:** https://cse340-2-4hjn.onrender.com
- **GitHub Repository:** https://github.com/andredosreis/cse340-2

---

## 📋 Features

- ✅ User authentication (Login/Register/Logout)
- ✅ JWT token-based session management
- ✅ Role-based access control (Admin, Employee, Client)
- ✅ Vehicle inventory display (by classification and detail view)
- ✅ Add new vehicles and classifications (Admin/Employee)
- ✅ Account management (update profile, change password)
- ✅ Server-side and client-side form validation
- ✅ Responsive design with Tailwind CSS

---

## 🛠️ Getting Started

### Prerequisites
- Node.js v18+ (LTS recommended)
- npm (bundled with Node.js)
- PostgreSQL database (local or cloud like Render)

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/andredosreis/cse340-2.git
cd cse340-2
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment variables:**
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```env
DATABASE_URL=postgresql://user:password@host:5432/database
SESSION_SECRET=your-session-secret-here
ACCESS_TOKEN_SECRET=your-jwt-secret-here
NODE_ENV=development
PORT=5500
```

4. **Setup database:**
   - Run the SQL scripts in `/database/schema.sql` to create tables
   - Run `/database/account-schema-render.sql` to create test accounts

5. **Start the server:**
```bash
npm start
```

6. **Open in browser:**
```
http://localhost:5500
```

---

## 🔐 Testing the Application

### How to Test
1. Go to the **Register** page (`/account/register`)
2. Create a new account with a valid password
3. Login with your new account
4. Access the Account Management dashboard

### Password Requirements
When creating an account, your password must have:
- ✅ Minimum 12 characters
- ✅ At least 1 uppercase letter (A-Z)
- ✅ At least 1 lowercase letter (a-z)
- ✅ At least 1 number (0-9)
- ✅ At least 1 special character (!@#$%^&*)



---

## 🗺️ Routes

### Public Routes (No authentication required)
| Method | URL | Description |
|--------|-----|-------------|
| GET | `/` | Home page |
| GET | `/about` | About page |
| GET | `/inv/type/:id` | View vehicles by classification |
| GET | `/inv/detail/:id` | View vehicle details |

### Account Routes
| Method | URL | Description |
|--------|-----|-------------|
| GET | `/account/login` | Login page |
| POST | `/account/login` | Process login |
| GET | `/account/register` | Registration page |
| POST | `/account/register` | Process registration |
| GET | `/account/` | Account dashboard (requires login) |
| GET | `/account/update` | Update account info (requires login) |
| POST | `/account/update` | Process account update |
| GET | `/account/update-password` | Change password page (requires login) |
| POST | `/account/update-password` | Process password change |
| GET | `/account/logout` | Logout (clears JWT cookie) |

### Inventory Routes (Admin/Employee only)
| Method | URL | Description |
|--------|-----|-------------|
| GET | `/inv/` | Inventory management dashboard |
| GET | `/inv/add-classification` | Add classification form |
| POST | `/inv/add-classification` | Process new classification |
| GET | `/inv/add-inventory` | Add vehicle form |
| POST | `/inv/add-inventory` | Process new vehicle |

---

## 🏗️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Node.js** | JavaScript runtime |
| **Express.js** | Web framework |
| **EJS** | Template engine (Server-Side Rendering) |
| **PostgreSQL** | Database |
| **Tailwind CSS** | Styling (via CDN) |
| **JWT** | Token-based authentication |
| **bcryptjs** | Password hashing |
| **express-validator** | Input validation |
| **express-session** | Session management |
| **cookie-parser** | Cookie handling |

---

## 📁 Project Structure

```
cse340-2/
├── controllers/          # Business logic
│   ├── accountController.js
│   └── vehicleController.js
├── database/             # SQL scripts and connection
│   ├── schema.sql
│   ├── account-schema.sql
│   └── connection.js
├── middleware/           # Custom middleware
│   └── authMiddleware.js
├── models/               # Database queries
│   ├── account-model.js
│   └── vehicle-model.js
├── public/               # Static files
│   └── images/
├── routes/               # Route definitions
│   ├── accountRoute.js
│   └── inventoryRoute.js
├── utilities/            # Helper functions & validation
│   ├── index.js
│   ├── account-validation.js
│   └── inventory-validation.js
├── views/                # EJS templates
│   ├── account/
│   ├── inventory/
│   ├── partials/
│   └── errors/
├── server.js             # Main entry point
├── package.json
└── .env.example
```

---

## 📝 Assignment 5 Requirements

| Requirement | Status |
|-------------|--------|
| JWT token creation on login | ✅ |
| JWT stored in httpOnly cookie | ✅ |
| Logout clears JWT cookie | ✅ |
| Account update (name, email) | ✅ |
| Password change functionality | ✅ |
| Client-side validation | ✅ |
| Server-side validation | ✅ |
| Role-based access control | ✅ |

---

## 📄 License

This project is for educational purposes as part of the CSE 340 course at BYU-Idaho.

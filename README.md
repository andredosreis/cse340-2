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
- ✅ **Inventory Review System (Final Project)**
  - ✅ Customers can add reviews to vehicles
  - ✅ Star rating system (1-5 stars)
  - ✅ View all reviews in vehicle detail page
  - ✅ Edit and delete own reviews
  - ✅ Admin can delete inappropriate reviews
  - ✅ Screen name privacy (Initial + Last Name)
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

### Review Routes
| Method | URL | Description |
|--------|-----|-------------|
| POST | `/inv/review/add` | Add review to vehicle (requires login) |
| GET | `/inv/review/:inv_id` | Get all reviews for vehicle |
| GET | `/account/review/edit/:review_id` | Edit review form (author only) |
| POST | `/account/review/update` | Process review update (author only) |
| POST | `/account/review/delete/:review_id` | Delete review (author or admin) |

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
│   ├── reviewController.js
│   └── vehicleController.js
├── database/             # SQL scripts and connection
│   ├── schema.sql
│   ├── account-schema.sql
│   ├── review-schema.sql
│   └── connection.js
├── middleware/           # Custom middleware
│   └── authMiddleware.js
├── models/               # Database queries
│   ├── account-model.js
│   ├── review-model.js
│   └── vehicle-model.js
├── public/               # Static files
│   └── images/
├── routes/               # Route definitions
│   ├── accountRoute.js
│   └── inventoryRoute.js
├── utilities/            # Helper functions & validation
│   ├── index.js
│   ├── account-validation.js
│   ├── review-validation.js
│   └── inventory-validation.js
├── views/                # EJS templates
│   ├── account/
│   │   ├── account.ejs
│   │   ├── edit-review.ejs
│   │   └── ...
│   ├── inventory/
│   │   ├── detail.ejs (with reviews)
│   │   └── ...
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

## 📝 Final Project - Inventory Review System

### Features Implemented
1. **Database:** Review table with foreign keys, indexes, and triggers
2. **Model:** 8 functions for CRUD operations on reviews
3. **Controller:** 7 functions handling review logic with authentication/authorization
4. **Views:** 3 views (detail.ejs with reviews, account.ejs with "My Reviews", edit-review.ejs)
5. **Validation:** Client-side (HTML5 + JS) and server-side (express-validator)
6. **Security:** 
   - Only review authors can edit their own reviews
   - Admins can delete (but not edit) inappropriate reviews
   - Screen names use "Initial + Last Name" format (privacy)

### Test Accounts
```
Client:   basic@340.edu    / I@mABas1cCl!3nt
Employee: happy@340.edu    / I@mAnEmpl0y33
Admin:    manager@340.edu  / I@mAnAdm!n1strat0r
```

---

## 📄 License

This project is for educational purposes as part of the CSE 340 course at BYU-Idaho.

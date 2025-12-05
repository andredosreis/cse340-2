# Node
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment
.env
.env.*
!.env.example

# OS
.DS_Store
Thumbs.db

# Editors
.vscode/
.idea/
*.swp
*.swo

# Build/Cache
dist/
build/
.cache/


# CSE 340 - Web Backend Development

This project demonstrates Server-Side Rendering (SSR) using Node.js, Express, and EJS with Tailwind via CDN.

## Getting Started

### Prerequisites
- Node.js (LTS recommended)
- npm (bundled with Node.js)

### Installation
```bash
npm install
```

### Environment Configuration
Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

Required environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Secret key for sessions
- `ACCESS_TOKEN_SECRET` - Secret key for JWT tokens

### Run
```bash
npm start
```
Then open `http://localhost:5500`.

## Test Accounts

To test the application, you can use these pre-configured accounts:

| Email | Password | Account Type |
|-------|----------|--------------|
| `admin@cse340.edu` | `Admin123!@#$` | Admin |
| `employee@cse340.edu` | `Employee123!@#$` | Employee |
| `client@cse340.edu` | `Client123!@#$` | Client |

### Password Requirements
When creating a new account or changing password:
- Minimum 12 characters
- At least 1 uppercase letter (A-Z)
- At least 1 lowercase letter (a-z)
- At least 1 number (0-9)
- At least 1 special character (!@#$%^&*)

**Example valid password:** `MyP@ssw0rd123!`

## Routes

### Public Routes
- `GET /` — Home page
- `GET /about` — About page
- `GET /inv/type/:classificationId` — View vehicles by classification
- `GET /inv/detail/:vehicleId` — View vehicle details

### Account Routes
- `GET /account/login` — Login page
- `GET /account/register` — Registration page
- `GET /account/` — Account dashboard (requires login)
- `GET /account/update` — Update account info (requires login)
- `GET /account/update-password` — Change password (requires login)
- `GET /account/logout` — Logout

### Inventory Management (Admin/Employee only)
- `GET /inv/` — Inventory management
- `GET /inv/add-classification` — Add new classification
- `GET /inv/add-inventory` — Add new vehicle

## Tech Stack
- Node.js
- Express.js
- EJS (templates)
- Tailwind CSS (CDN)
- PostgreSQL
- JWT (JSON Web Tokens)
- bcryptjs (password hashing)

## Project Structure (suggested)c

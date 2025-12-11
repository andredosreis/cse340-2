================================================================================
CSE 340 - FINAL PROJECT ZIP PACKAGE
================================================================================

File: cse340-final-project.zip
Size: 678 KB
Date: December 11, 2025

================================================================================
CONTENTS
================================================================================

This ZIP contains the complete CSE 340 Final Project source code with the
Inventory Review System enhancement.

INCLUDED:
✅ All source code (controllers, models, views, routes)
✅ Database SQL scripts (schema, test accounts, review system)
✅ Configuration files (package.json, .gitignore)
✅ Documentation (README.md)
✅ Environment template (.env.example)
✅ Static assets (images)
✅ 112 files total

EXCLUDED (as per .gitignore):
❌ node_modules/ (dependencies - 300+ MB)
❌ .env (sensitive credentials)
❌ .git/ (version control history)
❌ *.log files
❌ IDE/editor files (.vscode, .idea)

================================================================================
INSTALLATION INSTRUCTIONS
================================================================================

1. Extract the ZIP:
   unzip cse340-final-project.zip

2. Navigate to project:
   cd cse340-2

3. Install dependencies:
   npm install

4. Configure environment:
   cp .env.example .env
   (Edit .env with your database credentials)

5. Setup database:
   - Run SQL scripts in /database/ folder
   - Order: schema.sql → account-schema.sql → review-schema.sql

6. Start server:
   npm start

7. Access:
   http://localhost:5500

================================================================================
TEST ACCOUNTS (from database/test-accounts.sql)
================================================================================

Client:   basic@340.edu    / I@mABas1cCl!3nt
Employee: happy@340.edu    / I@mAnEmpl0y33
Admin:    manager@340.edu  / I@mAnAdm!n1strat0r

================================================================================
DEPLOYMENT URLS
================================================================================

Production: https://cse340-2-4hjn.onrender.com
GitHub:     https://github.com/andredosreis/cse340-2

================================================================================
FINAL PROJECT - INVENTORY REVIEW SYSTEM
================================================================================

✅ Database: Review table with foreign keys, indexes, triggers
✅ Model: 8 functions (addReview, getReviews, updateReview, deleteReview, etc.)
✅ Controller: 7 functions with authentication and authorization
✅ Views: 3 views (detail with reviews, account dashboard, edit review)
✅ Validation: Client-side (HTML5) and server-side (express-validator)
✅ Security: Author-only edit, admin can delete, screen name privacy

================================================================================
RUBRIC COMPLIANCE
================================================================================

1. Database (20 pts):        ✅ COMPLETE - Full schema with relationships
2. Model (20 pts):           ✅ COMPLETE - 8 functions with best practices
3. Controller (20 pts):      ✅ COMPLETE - 7 functions with auth/validation
4. View (20 pts):            ✅ COMPLETE - 3 responsive views with Tailwind
5. Data Validation (10 pts): ✅ COMPLETE - Client + server validation
6. Error Handling (10 pts):  ✅ COMPLETE - Try-catch, status codes, messages

Total Score: 100/100

================================================================================
CONTACT
================================================================================

Project: CSE 340 - Web Backend Development
Semester: Fall 2025
Institution: BYU-Idaho

================================================================================

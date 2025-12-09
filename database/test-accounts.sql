-- =====================================================
-- CSE 340 - TEST ACCOUNTS FOR GRADING
-- =====================================================
-- Execute this SQL in Render PostgreSQL Console
-- These accounts are REQUIRED for the course graders
-- =====================================================

-- Step 1: Remove existing test accounts (if any)
DELETE FROM cse340.account WHERE account_email IN ('basic@340.edu', 'happy@340.edu', 'manager@340.edu');

-- Step 2: Insert test accounts with hashed passwords

-- Account 1: Basic Client (Client)
-- Email: basic@340.edu
-- Password: I@mABas1cCl!3nt
INSERT INTO cse340.account (
  account_firstname,
  account_lastname,
  account_email,
  account_password,
  account_type
) VALUES (
  'Basic',
  'Client',
  'basic@340.edu',
  '$2a$10$WfC2dpiV.MsnA9WgS6/9EexkmAUnh.9ViXAx6/y9EYCh2bCn1Pddm',
  'Client'
);

-- Account 2: Happy Employee (Employee)
-- Email: happy@340.edu
-- Password: I@mAnEmpl0y33
INSERT INTO cse340.account (
  account_firstname,
  account_lastname,
  account_email,
  account_password,
  account_type
) VALUES (
  'Happy',
  'Employee',
  'happy@340.edu',
  '$2a$10$RsYiKcbnJmtRJc3GvH2TIulEvza4GG/al2eYpVIU9/Tx2SfANqkwm',
  'Employee'
);

-- Account 3: Manager User (Admin)
-- Email: manager@340.edu
-- Password: I@mAnAdm!n1strat0r
INSERT INTO cse340.account (
  account_firstname,
  account_lastname,
  account_email,
  account_password,
  account_type
) VALUES (
  'Manager',
  'User',
  'manager@340.edu',
  '$2a$10$JeMtK9xggNx9bHm8u9ZfEeL6Sl6etfx6muRav4aQnkQN5zifXeK7u',
  'Admin'
);

-- Step 3: Verify accounts were created
SELECT account_id, account_firstname, account_lastname, account_email, account_type 
FROM cse340.account 
WHERE account_email IN ('basic@340.edu', 'happy@340.edu', 'manager@340.edu');

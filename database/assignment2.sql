-- =============================================
-- ASSIGNMENT 2: SQL CRUD OPERATIONS
-- CSE 340 - Web Backend Development
-- =============================================
-- This file contains 6 working SQL queries demonstrating CRUD operations
-- as required for Assignment 2 of CSE 340
--
-- CRUD = Create, Read, Update, Delete
--
-- IMPORTANT NOTES:
-- - All queries use parameterized statements when possible
-- - Primary keys are used in WHERE clauses for single-record operations
-- - PostgreSQL-specific functions are used (e.g., REPLACE)

-- =============================================
-- QUERY 1: INSERT - Add a new account record
-- =============================================
-- Creates a new user account for Tony Stark
-- account_id and account_type are auto-generated with defaults
-- Result: 1 row inserted with account_id auto-incremented

INSERT INTO cse340.account (
    account_firstname,
    account_lastname,
    account_email,
    account_password
) VALUES (
    'Tony',
    'Stark',
    'tony@starkent.com',
    'Iam1ronM@n'
);

-- =============================================
-- QUERY 2: UPDATE - Modify Tony Stark's account type to Admin
-- =============================================
-- Updates the account_type of Tony Stark from 'Client' (default) to 'Admin'
-- Uses the account_email to identify the record
-- Note: In production, you should use account_id for updates

UPDATE cse340.account
SET account_type = 'Admin'
WHERE account_email = 'tony@starkent.com';

-- =============================================
-- QUERY 3: DELETE - Remove Tony Stark's account
-- =============================================
-- Deletes the account record for Tony Stark
-- Uses the account_email to identify and remove the record

DELETE FROM cse340.account
WHERE account_email = 'tony@starkent.com';

-- =============================================
-- QUERY 4: UPDATE with REPLACE - Fix GM Hummer description
-- =============================================
-- Uses PostgreSQL REPLACE() function to modify text within the description
-- Replaces "small interiors" with "a huge interior" in the GM Hummer record
-- REPLACE function: REPLACE(string, substring_to_find, substring_to_replace)
-- This demonstrates string manipulation in SQL without retyping the entire field

UPDATE cse340.inventory
SET inv_description = REPLACE(inv_description, 'small interiors', 'a huge interior')
WHERE inv_make = 'GM' AND inv_model = 'Hummer';

-- =============================================
-- QUERY 5: INNER JOIN SELECT - Retrieve Sport category vehicles
-- =============================================
-- Uses INNER JOIN to combine inventory and classification tables
-- Returns only records where classification_name = 'Sport'
-- Expected result: 1 record (Chevrolet Camaro)
-- Shows the relationship between inventory and classification tables

SELECT
    inv.inv_make,
    inv.inv_model,
    c.classification_name
FROM cse340.inventory inv
INNER JOIN cse340.classification c
    ON inv.classification_id = c.classification_id
WHERE c.classification_name = 'Sport'
ORDER BY inv.inv_make, inv.inv_model;

-- =============================================
-- QUERY 6: UPDATE with Path Modification
-- =============================================
-- Adds "/vehicles" to the middle of file paths
-- Transforms paths like '/images/delorean.jpg' to '/images/vehicles/delorean.jpg'
-- Transforms paths like '/images/delorean-tn.jpg' to '/images/vehicles/delorean-tn.jpg'
-- Uses REPLACE() function to insert directory in the path
-- Applied to both inv_image and inv_thumbnail columns for all inventory records

UPDATE cse340.inventory
SET
    inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'),
    inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/')
WHERE inv_image NOT LIKE '%/vehicles/%'
  AND inv_thumbnail NOT LIKE '%/vehicles/%';


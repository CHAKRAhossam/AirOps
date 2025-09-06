-- Fix null employee_id constraint violation
-- This script should be run on the staff database

-- First, let's see what records have null employee_id
SELECT id, employee_id, first_name, last_name, email 
FROM staff 
WHERE employee_id IS NULL OR employee_id = '';

-- Update records with null employee_id to have a generated EMPxxx ID
UPDATE staff 
SET employee_id = CONCAT('EMP', LPAD(id::text, 3, '0'))
WHERE employee_id IS NULL OR employee_id = '';

-- Verify the fix
SELECT id, employee_id, first_name, last_name, email 
FROM staff 
ORDER BY id;

-- Check for any remaining null values
SELECT COUNT(*) as null_count 
FROM staff 
WHERE employee_id IS NULL OR employee_id = '';

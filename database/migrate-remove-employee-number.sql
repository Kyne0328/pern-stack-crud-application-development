BEGIN;

ALTER TABLE employees
DROP COLUMN IF EXISTS employee_number;

COMMIT;

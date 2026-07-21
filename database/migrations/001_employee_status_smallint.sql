BEGIN;

ALTER TABLE employees
    DROP CONSTRAINT IF EXISTS employees_status_check;

ALTER TABLE employees
    ALTER COLUMN emp_status DROP DEFAULT;

ALTER TABLE employees
    ALTER COLUMN emp_status TYPE SMALLINT
    USING CASE
        WHEN UPPER(BTRIM(emp_status::TEXT)) IN ('ACTIVE', '1', 'TRUE') THEN 1
        ELSE 0
    END;

ALTER TABLE employees
    ALTER COLUMN emp_status SET DEFAULT 1,
    ALTER COLUMN emp_status SET NOT NULL;

ALTER TABLE employees
    ADD CONSTRAINT employees_status_check CHECK (emp_status IN (0, 1));

ALTER TABLE employees
    DROP CONSTRAINT IF EXISTS employees_employee_number_key;

UPDATE employees
SET employee_number = UPPER(BTRIM(employee_number)),
    first_name = BTRIM(first_name),
    last_name = BTRIM(last_name),
    emp_dep = BTRIM(emp_dep),
    emp_pos = BTRIM(emp_pos);

CREATE UNIQUE INDEX IF NOT EXISTS employees_employee_number_ci_idx
    ON employees (UPPER(employee_number));

ALTER TABLE employees
    DROP CONSTRAINT IF EXISTS employees_employee_number_uppercase,
    DROP CONSTRAINT IF EXISTS employees_department_not_blank,
    DROP CONSTRAINT IF EXISTS employees_position_not_blank;

ALTER TABLE employees
    ADD CONSTRAINT employees_employee_number_uppercase CHECK (employee_number = UPPER(employee_number)),
    ADD CONSTRAINT employees_department_not_blank CHECK (BTRIM(emp_dep) <> ''),
    ADD CONSTRAINT employees_position_not_blank CHECK (BTRIM(emp_pos) <> '');

COMMIT;

BEGIN;

CREATE TABLE IF NOT EXISTS employees (
    employee_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    employee_number VARCHAR(30) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    emp_dep VARCHAR(100) NOT NULL,
    emp_pos VARCHAR(100) NOT NULL,
    emp_status SMALLINT NOT NULL DEFAULT 1,
    emp_join_date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT employees_status_check CHECK (emp_status IN (0, 1)),
    CONSTRAINT employees_employee_number_not_blank CHECK (BTRIM(employee_number) <> ''),
    CONSTRAINT employees_employee_number_uppercase CHECK (employee_number = UPPER(employee_number)),
    CONSTRAINT employees_first_name_not_blank CHECK (BTRIM(first_name) <> ''),
    CONSTRAINT employees_last_name_not_blank CHECK (BTRIM(last_name) <> ''),
    CONSTRAINT employees_department_not_blank CHECK (BTRIM(emp_dep) <> ''),
    CONSTRAINT employees_position_not_blank CHECK (BTRIM(emp_pos) <> '')
);

CREATE UNIQUE INDEX IF NOT EXISTS employees_employee_number_ci_idx
    ON employees (UPPER(employee_number));

CREATE INDEX IF NOT EXISTS employees_name_idx ON employees (last_name, first_name);
CREATE INDEX IF NOT EXISTS employees_department_idx ON employees (emp_dep);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS employees_set_updated_at ON employees;
CREATE TRIGGER employees_set_updated_at
BEFORE UPDATE ON employees
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

COMMIT;

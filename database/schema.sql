BEGIN;

CREATE TABLE IF NOT EXISTS departments (
    department_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    department_name VARCHAR(100) NOT NULL,
    CONSTRAINT departments_name_not_blank CHECK (BTRIM(department_name) <> ''),
    CONSTRAINT departments_name_trimmed CHECK (department_name = BTRIM(department_name))
);

CREATE UNIQUE INDEX IF NOT EXISTS departments_name_ci_idx
    ON departments (UPPER(department_name));

CREATE TABLE IF NOT EXISTS positions (
    position_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    department_id BIGINT NOT NULL REFERENCES departments(department_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    position_name VARCHAR(100) NOT NULL,
    CONSTRAINT positions_name_not_blank CHECK (BTRIM(position_name) <> ''),
    CONSTRAINT positions_name_trimmed CHECK (position_name = BTRIM(position_name))
);

CREATE UNIQUE INDEX IF NOT EXISTS positions_department_name_ci_idx
    ON positions (department_id, UPPER(position_name));

CREATE INDEX IF NOT EXISTS positions_department_idx ON positions (department_id);

CREATE TABLE IF NOT EXISTS employees (
    employee_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    employee_number VARCHAR(30) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    position_id BIGINT NOT NULL REFERENCES positions(position_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    emp_status SMALLINT NOT NULL DEFAULT 1,
    emp_join_date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT employees_status_check CHECK (emp_status IN (0, 1)),
    CONSTRAINT employees_employee_number_not_blank CHECK (BTRIM(employee_number) <> ''),
    CONSTRAINT employees_employee_number_uppercase CHECK (employee_number = UPPER(employee_number)),
    CONSTRAINT employees_first_name_not_blank CHECK (BTRIM(first_name) <> ''),
    CONSTRAINT employees_last_name_not_blank CHECK (BTRIM(last_name) <> '')
);

CREATE UNIQUE INDEX IF NOT EXISTS employees_employee_number_ci_idx
    ON employees (UPPER(employee_number));

CREATE INDEX IF NOT EXISTS employees_name_idx ON employees (last_name, first_name);
CREATE INDEX IF NOT EXISTS employees_position_idx ON employees (position_id);

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

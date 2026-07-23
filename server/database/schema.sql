BEGIN;

CREATE TABLE IF NOT EXISTS departments (
    department_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    department_name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS positions (
    position_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    department_id BIGINT NOT NULL REFERENCES departments(department_id),
    position_name VARCHAR(100) NOT NULL,
    UNIQUE (department_id, position_name)
);

CREATE TABLE IF NOT EXISTS employees (
    employee_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    position_id BIGINT NOT NULL REFERENCES positions(position_id),
    emp_status SMALLINT NOT NULL DEFAULT 1 CHECK (emp_status IN (0, 1)),
    emp_join_date DATE NOT NULL
);

CREATE INDEX IF NOT EXISTS employees_name_idx ON employees (last_name, first_name);
CREATE INDEX IF NOT EXISTS employees_position_idx ON employees (position_id);

CREATE TABLE IF NOT EXISTS users (
    user_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL
);

COMMIT;

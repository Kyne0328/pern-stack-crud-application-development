BEGIN;

INSERT INTO departments (department_name)
VALUES
    ('Information Technology'),
    ('Human Resources'),
    ('Finance'),
    ('Operations'),
    ('Administration')
ON CONFLICT DO NOTHING;

INSERT INTO positions (department_id, position_name)
SELECT d.department_id, source.position_name
FROM (
    VALUES
        ('Information Technology', 'Software Developer'),
        ('Information Technology', 'Technical Support'),
        ('Human Resources', 'HR Assistant'),
        ('Human Resources', 'Recruitment Assistant'),
        ('Finance', 'Accounting Assistant'),
        ('Finance', 'Payroll Assistant'),
        ('Operations', 'Operations Staff'),
        ('Operations', 'Warehouse Staff'),
        ('Administration', 'Administrative Assistant'),
        ('Administration', 'Records Clerk')
) AS source(department_name, position_name)
JOIN departments d ON d.department_name = source.department_name
ON CONFLICT DO NOTHING;

INSERT INTO employees (
    employee_number, first_name, last_name, position_id, emp_status, emp_join_date
)
SELECT
    source.employee_number,
    source.first_name,
    source.last_name,
    p.position_id,
    source.emp_status,
    source.emp_join_date::DATE
FROM (
    VALUES
        ('EMP-001', 'Juan', 'Dela Cruz', 'Information Technology', 'Software Developer', 1, '2026-07-21'),
        ('EMP-002', 'Maria', 'Santos', 'Human Resources', 'HR Assistant', 1, '2026-07-21'),
        ('EMP-003', 'Ana', 'Reyes', 'Finance', 'Accounting Assistant', 1, '2026-07-14'),
        ('EMP-004', 'Carlo', 'Mendoza', 'Operations', 'Operations Staff', 1, '2026-07-07'),
        ('EMP-005', 'Lea', 'Garcia', 'Administration', 'Administrative Assistant', 1, '2026-06-30'),
        ('EMP-006', 'Paolo', 'Ramos', 'Information Technology', 'Technical Support', 1, '2026-06-23'),
        ('EMP-007', 'Nina', 'Flores', 'Human Resources', 'Recruitment Assistant', 1, '2026-06-16'),
        ('EMP-008', 'Miguel', 'Torres', 'Operations', 'Warehouse Staff', 1, '2026-06-09'),
        ('EMP-009', 'Ella', 'Navarro', 'Finance', 'Payroll Assistant', 0, '2026-06-02'),
        ('EMP-010', 'Marco', 'Villanueva', 'Administration', 'Records Clerk', 1, '2026-05-26')
) AS source(employee_number, first_name, last_name, department_name, position_name, emp_status, emp_join_date)
JOIN departments d ON d.department_name = source.department_name
JOIN positions p ON p.department_id = d.department_id AND p.position_name = source.position_name
ON CONFLICT DO NOTHING;

COMMIT;

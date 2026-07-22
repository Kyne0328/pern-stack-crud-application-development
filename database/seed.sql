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
    first_name, last_name, position_id, emp_status, emp_join_date
)
SELECT
    source.first_name,
    source.last_name,
    p.position_id,
    source.emp_status,
    source.emp_join_date::DATE
FROM (
    VALUES
        ('Juan', 'Dela Cruz', 'Information Technology', 'Software Developer', 1, '2026-07-21'),
        ('Maria', 'Santos', 'Human Resources', 'HR Assistant', 1, '2026-07-21'),
        ('Ana', 'Reyes', 'Finance', 'Accounting Assistant', 1, '2026-07-14'),
        ('Carlo', 'Mendoza', 'Operations', 'Operations Staff', 1, '2026-07-07'),
        ('Lea', 'Garcia', 'Administration', 'Administrative Assistant', 1, '2026-06-30'),
        ('Paolo', 'Ramos', 'Information Technology', 'Technical Support', 1, '2026-06-23'),
        ('Nina', 'Flores', 'Human Resources', 'Recruitment Assistant', 1, '2026-06-16'),
        ('Miguel', 'Torres', 'Operations', 'Warehouse Staff', 1, '2026-06-09'),
        ('Ella', 'Navarro', 'Finance', 'Payroll Assistant', 0, '2026-06-02'),
        ('Marco', 'Villanueva', 'Administration', 'Records Clerk', 1, '2026-05-26')
) AS source(first_name, last_name, department_name, position_name, emp_status, emp_join_date)
JOIN departments d ON d.department_name = source.department_name
JOIN positions p ON p.department_id = d.department_id AND p.position_name = source.position_name
WHERE NOT EXISTS (
    SELECT 1
    FROM employees e
    WHERE e.first_name = source.first_name
      AND e.last_name = source.last_name
      AND e.position_id = p.position_id
      AND e.emp_join_date = source.emp_join_date::DATE
);

COMMIT;

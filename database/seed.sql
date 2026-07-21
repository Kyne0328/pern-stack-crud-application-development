INSERT INTO employees (
    employee_number, first_name, last_name, emp_dep, emp_pos, emp_status, emp_join_date
)
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
ON CONFLICT DO NOTHING;

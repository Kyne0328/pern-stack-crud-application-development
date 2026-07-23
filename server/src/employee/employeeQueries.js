const {pool} = require('../config/database');

function selectEmployees() {
  return pool.query(
    `SELECT
       e.employee_id::TEXT AS "employeeId",
       e.first_name AS "firstName",
       e.last_name AS "lastName",
       d.department_id::TEXT AS "departmentId",
       d.department_name AS department,
       p.position_id::TEXT AS "positionId",
       p.position_name AS position,
       e.emp_status AS status,
       e.emp_join_date AS "joinDate"
     FROM employees e
     JOIN positions p ON p.position_id = e.position_id
     JOIN departments d ON d.department_id = p.department_id
     ORDER BY e.employee_id`,
  );
}

function insertEmployee(employee) {
  const {firstName, lastName, positionId, status, joinDate} = employee;
  return pool.query(
    `INSERT INTO employees (
       first_name,
       last_name,
       position_id,
       emp_status,
       emp_join_date
     )
     VALUES ($1, $2, $3, $4, $5)
     RETURNING employee_id::TEXT AS "employeeId"`,
    [firstName, lastName, positionId, status, joinDate],
  );
}

function updateEmployeeById(employeeId, employee) {
  const {firstName, lastName, positionId, status, joinDate} = employee;
  return pool.query(
    `UPDATE employees
     SET first_name = $1,
         last_name = $2,
         position_id = $3,
         emp_status = $4,
         emp_join_date = $5
     WHERE employee_id = $6
     RETURNING employee_id`,
    [firstName, lastName, positionId, status, joinDate, employeeId],
  );
}

function deleteEmployeeById(employeeId) {
  return pool.query(
    'DELETE FROM employees WHERE employee_id = $1 RETURNING employee_id',
    [employeeId],
  );
}

module.exports = {
  selectEmployees,
  insertEmployee,
  updateEmployeeById,
  deleteEmployeeById,
};

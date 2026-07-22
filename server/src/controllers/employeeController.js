const {pool} = require('../config/database');

function isValidEmployeeId(employeeId) {
  return typeof employeeId === 'string' && /^[1-9]\d*$/.test(employeeId);
}

async function listEmployees(req, res) {
  const result = await pool.query(
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

  return res.status(200).json({success: true, data: result.rows});
}

async function createEmployee(req, res) {
  const {firstName, lastName, positionId, status, joinDate} = req.employeeInput;

  const result = await pool.query(
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

  return res.status(201).json({
    success: true,
    message: 'Employee created successfully.',
    employeeId: result.rows[0].employeeId,
  });
}

async function updateEmployee(req, res) {
  const {employeeId} = req.params;
  if (!isValidEmployeeId(employeeId)) {
    return res.status(400).json({success: false, message: 'Invalid employee ID.'});
  }

  const {firstName, lastName, positionId, status, joinDate} = req.employeeInput;
  const result = await pool.query(
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

  if (result.rowCount === 0) {
    return res.status(404).json({success: false, message: 'Employee not found.'});
  }

  return res.status(200).json({success: true, message: 'Employee updated successfully.'});
}

async function deleteEmployee(req, res) {
  const {employeeId} = req.params;
  if (!isValidEmployeeId(employeeId)) {
    return res.status(400).json({success: false, message: 'Invalid employee ID.'});
  }

  const result = await pool.query(
    'DELETE FROM employees WHERE employee_id = $1 RETURNING employee_id',
    [employeeId],
  );

  if (result.rowCount === 0) {
    return res.status(404).json({success: false, message: 'Employee not found.'});
  }

  return res.status(200).json({success: true, message: 'Employee deleted successfully.'});
}

module.exports = {
  listEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};

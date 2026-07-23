const {
  deleteEmployeeById,
  insertEmployee,
  selectEmployees,
  updateEmployeeById,
} = require('./employeeQueries');

async function listEmployees(req, res) {
  const result = await selectEmployees();
  return res.status(200).json({success: true, data: result.rows});
}

async function createEmployee(req, res) {
  const result = await insertEmployee(req.employeeInput);
  return res.status(201).json({
    success: true,
    message: 'Employee created successfully.',
    employeeId: result.rows[0].employeeId,
  });
}

async function updateEmployee(req, res) {
  const {employeeId} = req.employeeParams;
  const result = await updateEmployeeById(employeeId, req.employeeInput);

  if (result.rowCount === 0) {
    return res.status(404).json({success: false, message: 'Employee not found.'});
  }

  return res.status(200).json({success: true, message: 'Employee updated successfully.'});
}

async function deleteEmployee(req, res) {
  const {employeeId} = req.employeeParams;
  const result = await deleteEmployeeById(employeeId);

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

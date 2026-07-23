const {Router} = require('express');
const {
  createEmployee,
  deleteEmployee,
  listEmployees,
  updateEmployee,
} = require('./employeeController');
const {validateEmployee, validateEmployeeId} = require('./employeeValidation');

const router = Router();

router.get('/', listEmployees);
router.post('/', validateEmployee, createEmployee);
router.put('/:employeeId', validateEmployeeId, validateEmployee, updateEmployee);
router.delete('/:employeeId', validateEmployeeId, deleteEmployee);

module.exports = router;

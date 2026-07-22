const {Router} = require('express');
const {
  createEmployee,
  deleteEmployee,
  listEmployees,
  updateEmployee,
} = require('../controllers/employeeController');
const {validateEmployee} = require('../middleware/validateEmployee');

const router = Router();

router.get('/', listEmployees);
router.post('/', validateEmployee, createEmployee);
router.put('/:employeeId', validateEmployee, updateEmployee);
router.delete('/:employeeId', deleteEmployee);

module.exports = router;

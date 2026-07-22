import {Router} from 'express';
import {
  createEmployee,
  deleteEmployee,
  listEmployees,
  updateEmployee,
} from '../controllers/employeeController.js';
import {validateEmployee} from '../middleware/validateEmployee.js';

const router = Router();

router.get('/', listEmployees);
router.post('/', validateEmployee, createEmployee);
router.put('/:employeeId', validateEmployee, updateEmployee);
router.delete('/:employeeId', deleteEmployee);

export default router;

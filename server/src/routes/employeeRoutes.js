import { Router } from 'express';
import {
  createEmployee,
  deactivateEmployee,
  getEmployee,
  listEmployees,
  updateEmployee,
  updateEmployeeStatus,
} from '../controllers/employeeController.js';
import { validateEmployee, validateEmployeeStatus } from '../middleware/validateEmployee.js';

const router = Router();

router.get('/', listEmployees);
router.get('/:employeeId', getEmployee);
router.post('/', validateEmployee, createEmployee);
router.put('/:employeeId', validateEmployee, updateEmployee);
router.patch('/:employeeId/status', validateEmployeeStatus, updateEmployeeStatus);
router.delete('/:employeeId', deactivateEmployee);

export default router;

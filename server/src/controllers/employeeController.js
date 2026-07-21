import { pool } from '../config/database.js';
import { createEmployeeController } from './createEmployeeController.js';

export { createEmployeeController, parseEmployeeListQuery } from './createEmployeeController.js';

export const {
  listEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  updateEmployeeStatus,
  deactivateEmployee,
} = createEmployeeController(pool);

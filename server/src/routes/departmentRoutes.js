import { Router } from 'express';
import { pool } from '../config/database.js';
import { createDepartmentController } from '../controllers/departmentController.js';

const router = Router();
const {listDepartments} = createDepartmentController(pool);

router.get('/', listDepartments);

export default router;

import {Router} from 'express';
import {listDepartments} from '../controllers/departmentController.js';

const router = Router();

router.get('/', listDepartments);

export default router;

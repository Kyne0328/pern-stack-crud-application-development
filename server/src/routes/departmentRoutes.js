const {Router} = require('express');
const {listDepartments} = require('../controllers/departmentController');

const router = Router();

router.get('/', listDepartments);

module.exports = router;

const {Router} = require('express');
const {listDepartments} = require('./departmentController');

const router = Router();

router.get('/', listDepartments);

module.exports = router;

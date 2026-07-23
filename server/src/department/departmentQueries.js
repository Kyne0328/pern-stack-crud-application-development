const {pool} = require('../config/database');

function selectDepartmentsWithPositions() {
  return pool.query(
    `SELECT
       d.department_id::TEXT AS "departmentId",
       d.department_name AS "departmentName",
       p.position_id::TEXT AS "positionId",
       p.position_name AS "positionName"
     FROM departments d
     LEFT JOIN positions p ON p.department_id = d.department_id
     ORDER BY d.department_name, p.position_name`,
  );
}

module.exports = {selectDepartmentsWithPositions};

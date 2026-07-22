import {pool} from '../config/database.js';

export function groupDepartments(rows) {
  const departments = [];
  const departmentMap = new Map();

  for (const row of rows) {
    let department = departmentMap.get(row.departmentId);

    if (!department) {
      department = {
        departmentId: row.departmentId,
        departmentName: row.departmentName,
        positions: [],
      };
      departmentMap.set(row.departmentId, department);
      departments.push(department);
    }

    if (row.positionId) {
      department.positions.push({
        positionId: row.positionId,
        positionName: row.positionName,
      });
    }
  }

  return departments;
}

export async function listDepartments(req, res) {
  const result = await pool.query(
    `SELECT
       d.department_id::TEXT AS "departmentId",
       d.department_name AS "departmentName",
       p.position_id::TEXT AS "positionId",
       p.position_name AS "positionName"
     FROM departments d
     LEFT JOIN positions p ON p.department_id = d.department_id
     ORDER BY d.department_name, p.position_name`,
  );

  return res.status(200).json({success: true, data: groupDepartments(result.rows)});
}

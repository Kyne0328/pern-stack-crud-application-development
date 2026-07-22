export function createDepartmentController(database) {
  if (!database || typeof database.query !== 'function') {
    throw new TypeError('A database client with a query function is required.');
  }

  async function listDepartments(req, res) {
    const result = await database.query(
      `SELECT
         d.department_id::TEXT AS "departmentId",
         d.department_name AS "departmentName",
         p.position_id::TEXT AS "positionId",
         p.position_name AS "positionName"
       FROM departments d
       LEFT JOIN positions p ON p.department_id = d.department_id
       ORDER BY d.department_name ASC, p.position_name ASC`,
    );

    const departments = [];
    const byId = new Map();

    for (const row of result.rows) {
      let department = byId.get(row.departmentId);
      if (!department) {
        department = {
          departmentId: row.departmentId,
          departmentName: row.departmentName,
          positions: [],
        };
        byId.set(row.departmentId, department);
        departments.push(department);
      }

      if (row.positionId) {
        department.positions.push({
          positionId: row.positionId,
          positionName: row.positionName,
        });
      }
    }

    return res.status(200).json({success: true, data: departments});
  }

  return {listDepartments};
}

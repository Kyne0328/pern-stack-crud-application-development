const {selectDepartmentsWithPositions} = require('./departmentQueries');

function groupDepartments(rows) {
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

async function listDepartments(req, res) {
  const result = await selectDepartmentsWithPositions();
  return res.status(200).json({success: true, data: groupDepartments(result.rows)});
}

module.exports = {groupDepartments, listDepartments};

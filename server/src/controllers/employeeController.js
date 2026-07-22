import {pool} from '../config/database.js';
import {EMPLOYEE_STATUS} from '../constants/employeeStatus.js';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 50;
const MAX_SEARCH_LENGTH = 100;

export function parseEmployeeListQuery(query = {}) {
  const search = typeof query.search === 'string' ? query.search.trim() : '';
  const page = query.page === undefined || query.page === '' ? DEFAULT_PAGE : Number(query.page);
  const pageSize = query.pageSize === undefined || query.pageSize === ''
    ? DEFAULT_PAGE_SIZE
    : Number(query.pageSize);

  let status = null;
  if (query.status !== undefined && query.status !== '') {
    status = Number(query.status);
  }

  if (search.length > MAX_SEARCH_LENGTH) {
    return {error: `Search must not exceed ${MAX_SEARCH_LENGTH} characters.`};
  }
  if (status !== null && status !== 0 && status !== 1) {
    return {error: 'Status filter must be 1 for active or 0 for inactive.'};
  }
  if (!Number.isInteger(page) || page < 1) {
    return {error: 'Page must be a positive integer.'};
  }
  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > MAX_PAGE_SIZE) {
    return {error: `Page size must be between 1 and ${MAX_PAGE_SIZE}.`};
  }

  return {search, status, page, pageSize};
}

function isValidEmployeeId(employeeId) {
  return typeof employeeId === 'string' && /^[1-9]\d*$/.test(employeeId);
}

export async function listEmployees(req, res) {
  const filters = parseEmployeeListQuery(req.query);
  if (filters.error) {
    return res.status(400).json({success: false, message: filters.error});
  }

  const {search, status, page, pageSize} = filters;
  const searchPattern = `%${search}%`;
  const filterValues = [search, searchPattern, status];
  const offset = (page - 1) * pageSize;

  const filterSql = `
    WHERE (
      $1::TEXT = ''
      OR e.employee_number ILIKE $2
      OR e.first_name ILIKE $2
      OR e.last_name ILIKE $2
      OR d.department_name ILIKE $2
      OR p.position_name ILIKE $2
    )
    AND ($3::SMALLINT IS NULL OR e.emp_status = $3)
  `;

  const countResult = await pool.query(
    `SELECT COUNT(*)::INTEGER AS total
     FROM employees e
     JOIN positions p ON p.position_id = e.position_id
     JOIN departments d ON d.department_id = p.department_id
     ${filterSql}`,
    filterValues,
  );

  const employeeResult = await pool.query(
    `SELECT
       e.employee_id::TEXT AS "employeeId",
       e.employee_number AS "employeeNumber",
       e.first_name AS "firstName",
       e.last_name AS "lastName",
       d.department_id::TEXT AS "departmentId",
       d.department_name AS department,
       p.position_id::TEXT AS "positionId",
       p.position_name AS position,
       e.emp_status AS status,
       e.emp_join_date AS "joinDate"
     FROM employees e
     JOIN positions p ON p.position_id = e.position_id
     JOIN departments d ON d.department_id = p.department_id
     ${filterSql}
     ORDER BY e.last_name, e.first_name, e.employee_id
     LIMIT $4 OFFSET $5`,
    [...filterValues, pageSize, offset],
  );

  const summaryResult = await pool.query(
    `SELECT
       COUNT(*)::INTEGER AS "totalEmployees",
       (COUNT(*) FILTER (WHERE emp_status = $1))::INTEGER AS "activeEmployees",
       (SELECT COUNT(*)::INTEGER FROM departments) AS departments
     FROM employees`,
    [EMPLOYEE_STATUS.ACTIVE],
  );

  const total = countResult.rows[0]?.total ?? 0;
  const summary = summaryResult.rows[0] ?? {totalEmployees: 0, activeEmployees: 0, departments: 0};

  return res.status(200).json({
    success: true,
    data: employeeResult.rows,
    meta: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
    summary: {
      totalEmployees: summary.totalEmployees ?? 0,
      activeEmployees: summary.activeEmployees ?? 0,
      inactiveEmployees: (summary.totalEmployees ?? 0) - (summary.activeEmployees ?? 0),
      departments: summary.departments ?? 0,
    },
  });
}

export async function createEmployee(req, res) {
  const {employeeNumber, firstName, lastName, positionId, status, joinDate} = req.employeeInput;

  await pool.query(
    `INSERT INTO employees (
       employee_number,
       first_name,
       last_name,
       position_id,
       emp_status,
       emp_join_date
     )
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [employeeNumber, firstName, lastName, positionId, status, joinDate],
  );

  return res.status(201).json({success: true, message: 'Employee created successfully.'});
}

export async function updateEmployee(req, res) {
  const {employeeId} = req.params;
  if (!isValidEmployeeId(employeeId)) {
    return res.status(400).json({success: false, message: 'Invalid employee ID.'});
  }

  const {employeeNumber, firstName, lastName, positionId, status, joinDate} = req.employeeInput;
  const result = await pool.query(
    `UPDATE employees
     SET employee_number = $1,
         first_name = $2,
         last_name = $3,
         position_id = $4,
         emp_status = $5,
         emp_join_date = $6
     WHERE employee_id = $7
     RETURNING employee_id`,
    [employeeNumber, firstName, lastName, positionId, status, joinDate, employeeId],
  );

  if (result.rowCount === 0) {
    return res.status(404).json({success: false, message: 'Employee not found.'});
  }

  return res.status(200).json({success: true, message: 'Employee updated successfully.'});
}

export async function deleteEmployee(req, res) {
  const {employeeId} = req.params;
  if (!isValidEmployeeId(employeeId)) {
    return res.status(400).json({success: false, message: 'Invalid employee ID.'});
  }

  const result = await pool.query(
    'DELETE FROM employees WHERE employee_id = $1 RETURNING employee_id',
    [employeeId],
  );

  if (result.rowCount === 0) {
    return res.status(404).json({success: false, message: 'Employee not found.'});
  }

  return res.status(200).json({success: true, message: 'Employee deleted successfully.'});
}

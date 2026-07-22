import { EMPLOYEE_STATUS, EMPLOYEE_STATUS_VALUES } from '../constants/employeeStatus.js';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 8;
const MAX_PAGE_SIZE = 50;
const MAX_SEARCH_LENGTH = 100;

const employeeColumns = `
  e.employee_id::TEXT AS "employeeId",
  e.employee_number AS "employeeNumber",
  e.first_name AS "firstName",
  e.last_name AS "lastName",
  d.department_id::TEXT AS "departmentId",
  d.department_name AS "department",
  p.position_id::TEXT AS "positionId",
  p.position_name AS "position",
  e.emp_status AS "status",
  e.emp_join_date AS "joinDate",
  e.created_at AS "createdAt",
  e.updated_at AS "updatedAt"
`;

const employeeJoins = `
  FROM employees e
  JOIN positions p ON p.position_id = e.position_id
  JOIN departments d ON d.department_id = p.department_id
`;

function parseEmployeeId(value) {
  return typeof value === 'string' && /^[1-9]\d*$/.test(value) ? value : null;
}

function parsePositiveInteger(value, fallback, maximum) {
  if (value === undefined || value === '') return fallback;
  if (typeof value !== 'string' || !/^\d+$/.test(value)) return Number.NaN;

  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1 || parsed > maximum) return Number.NaN;
  return parsed;
}

function parseStatusFilter(value) {
  if (value === undefined || value === '') return null;
  if (typeof value !== 'string' || !/^[01]$/.test(value)) return Number.NaN;

  const status = Number(value);
  return EMPLOYEE_STATUS_VALUES.has(status) ? status : Number.NaN;
}

export function parseEmployeeListQuery(query = {}) {
  const search = typeof query.search === 'string' ? query.search.trim() : '';
  const status = parseStatusFilter(query.status);
  const page = parsePositiveInteger(query.page, DEFAULT_PAGE, Number.MAX_SAFE_INTEGER);
  const pageSize = parsePositiveInteger(query.pageSize, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);

  if (search.length > MAX_SEARCH_LENGTH) return {error: `Search must not exceed ${MAX_SEARCH_LENGTH} characters.`};
  if (Number.isNaN(status)) return {error: 'Status filter must be 1 for active or 0 for inactive.'};
  if (Number.isNaN(page)) return {error: 'Page must be a positive integer.'};
  if (Number.isNaN(pageSize)) return {error: `Page size must be between 1 and ${MAX_PAGE_SIZE}.`};

  return {search, status, page, pageSize};
}

export function createEmployeeController(database) {
  if (!database || typeof database.query !== 'function') {
    throw new TypeError('A database client with a query function is required.');
  }

  async function positionBelongsToDepartment(positionId, departmentId) {
    const result = await database.query(
      'SELECT 1 FROM positions WHERE position_id = $1 AND department_id = $2',
      [positionId, departmentId],
    );
    return result.rowCount > 0;
  }

  function invalidReferenceResponse(res) {
    return res.status(400).json({
      success: false,
      message: 'Select a position that belongs to the selected department.',
      errors: {
        departmentId: 'Select a valid department.',
        positionId: 'Select a position from the selected department.',
      },
    });
  }

  async function listEmployees(req, res) {
    const filters = parseEmployeeListQuery(req.query);
    if (filters.error) return res.status(400).json({success: false, message: filters.error});

    const {search, status, page, pageSize} = filters;
    const values = [];
    const conditions = [];

    if (search) {
      values.push(`%${search}%`);
      conditions.push(`(
        e.employee_number ILIKE $${values.length}
        OR e.first_name ILIKE $${values.length}
        OR e.last_name ILIKE $${values.length}
        OR d.department_name ILIKE $${values.length}
        OR p.position_name ILIKE $${values.length}
      )`);
    }
    if (status !== null) {
      values.push(status);
      conditions.push(`e.emp_status = $${values.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = (page - 1) * pageSize;
    const dataValues = [...values, pageSize, offset];
    const limitParameter = values.length + 1;
    const offsetParameter = values.length + 2;

    const [countResult, employeeResult, summaryResult] = await Promise.all([
      database.query(`SELECT COUNT(*)::INTEGER AS total ${employeeJoins} ${whereClause}`, values),
      database.query(
        `SELECT ${employeeColumns}
         ${employeeJoins}
         ${whereClause}
         ORDER BY e.last_name ASC, e.first_name ASC, e.employee_id ASC
         LIMIT $${limitParameter} OFFSET $${offsetParameter}`,
        dataValues,
      ),
      database.query(
        `SELECT
           COUNT(*)::INTEGER AS "totalEmployees",
           (COUNT(*) FILTER (WHERE emp_status = $1))::INTEGER AS "activeEmployees",
           (SELECT COUNT(*)::INTEGER FROM departments) AS departments
         FROM employees`,
        [EMPLOYEE_STATUS.ACTIVE],
      ),
    ]);

    const total = countResult.rows[0]?.total ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const summary = summaryResult.rows[0] ?? {totalEmployees: 0, activeEmployees: 0, departments: 0};

    return res.status(200).json({
      success: true,
      data: employeeResult.rows,
      meta: {page, pageSize, total, totalPages},
      summary: {
        totalEmployees: summary.totalEmployees ?? 0,
        activeEmployees: summary.activeEmployees ?? 0,
        inactiveEmployees: (summary.totalEmployees ?? 0) - (summary.activeEmployees ?? 0),
        departments: summary.departments ?? 0,
      },
    });
  }

  async function getEmployee(req, res) {
    const employeeId = parseEmployeeId(req.params.employeeId);
    if (!employeeId) return res.status(400).json({success: false, message: 'Invalid employee ID.'});

    const result = await database.query(
      `SELECT ${employeeColumns} ${employeeJoins} WHERE e.employee_id = $1`,
      [employeeId],
    );
    if (result.rowCount === 0) return res.status(404).json({success: false, message: 'Employee not found.'});

    return res.status(200).json({success: true, data: result.rows[0]});
  }

  async function createEmployee(req, res) {
    const {employeeNumber, firstName, lastName, departmentId, positionId, status, joinDate} = req.employeeInput;
    if (!await positionBelongsToDepartment(positionId, departmentId)) return invalidReferenceResponse(res);

    const result = await database.query(
      `WITH inserted AS (
         INSERT INTO employees (employee_number, first_name, last_name, position_id, emp_status, emp_join_date)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *
       )
       SELECT ${employeeColumns}
       FROM inserted e
       JOIN positions p ON p.position_id = e.position_id
       JOIN departments d ON d.department_id = p.department_id`,
      [employeeNumber, firstName, lastName, positionId, status, joinDate],
    );

    return res.status(201).json({success: true, message: 'Employee created successfully.', data: result.rows[0]});
  }

  async function updateEmployee(req, res) {
    const employeeId = parseEmployeeId(req.params.employeeId);
    if (!employeeId) return res.status(400).json({success: false, message: 'Invalid employee ID.'});

    const {employeeNumber, firstName, lastName, departmentId, positionId, status, joinDate} = req.employeeInput;
    if (!await positionBelongsToDepartment(positionId, departmentId)) return invalidReferenceResponse(res);

    const result = await database.query(
      `WITH updated AS (
         UPDATE employees
         SET employee_number = $1,
             first_name = $2,
             last_name = $3,
             position_id = $4,
             emp_status = $5,
             emp_join_date = $6
         WHERE employee_id = $7
         RETURNING *
       )
       SELECT ${employeeColumns}
       FROM updated e
       JOIN positions p ON p.position_id = e.position_id
       JOIN departments d ON d.department_id = p.department_id`,
      [employeeNumber, firstName, lastName, positionId, status, joinDate, employeeId],
    );

    if (result.rowCount === 0) return res.status(404).json({success: false, message: 'Employee not found.'});
    return res.status(200).json({success: true, message: 'Employee updated successfully.', data: result.rows[0]});
  }

  async function updateEmployeeStatus(req, res) {
    const employeeId = parseEmployeeId(req.params.employeeId);
    if (!employeeId) return res.status(400).json({success: false, message: 'Invalid employee ID.'});

    const result = await database.query(
      `WITH updated AS (
         UPDATE employees SET emp_status = $1 WHERE employee_id = $2 RETURNING *
       )
       SELECT ${employeeColumns}
       FROM updated e
       JOIN positions p ON p.position_id = e.position_id
       JOIN departments d ON d.department_id = p.department_id`,
      [req.employeeStatus, employeeId],
    );

    if (result.rowCount === 0) return res.status(404).json({success: false, message: 'Employee not found.'});

    const action = req.employeeStatus === EMPLOYEE_STATUS.ACTIVE ? 'reactivated' : 'deactivated';
    return res.status(200).json({success: true, message: `Employee ${action} successfully.`, data: result.rows[0]});
  }

  async function deactivateEmployee(req, res) {
    req.employeeStatus = EMPLOYEE_STATUS.INACTIVE;
    return updateEmployeeStatus(req, res);
  }

  return {listEmployees, getEmployee, createEmployee, updateEmployee, updateEmployeeStatus, deactivateEmployee};
}

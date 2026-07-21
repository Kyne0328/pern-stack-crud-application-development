import { EMPLOYEE_STATUS, EMPLOYEE_STATUS_VALUES } from '../constants/employeeStatus.js';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 8;
const MAX_PAGE_SIZE = 50;
const MAX_SEARCH_LENGTH = 100;

const employeeColumns = `
  employee_id AS "employeeId",
  employee_number AS "employeeNumber",
  first_name AS "firstName",
  last_name AS "lastName",
  emp_dep AS "department",
  emp_pos AS "position",
  emp_status AS "status",
  emp_join_date AS "joinDate",
  created_at AS "createdAt",
  updated_at AS "updatedAt"
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

  async function listEmployees(req, res) {
    const filters = parseEmployeeListQuery(req.query);
    if (filters.error) return res.status(400).json({success: false, message: filters.error});

    const {search, status, page, pageSize} = filters;
    const values = [];
    const conditions = [];

    if (search) {
      values.push(`%${search}%`);
      conditions.push(`(employee_number ILIKE $${values.length} OR first_name ILIKE $${values.length} OR last_name ILIKE $${values.length} OR emp_dep ILIKE $${values.length} OR emp_pos ILIKE $${values.length})`);
    }
    if (status !== null) {
      values.push(status);
      conditions.push(`emp_status = $${values.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = (page - 1) * pageSize;
    const dataValues = [...values, pageSize, offset];
    const limitParameter = values.length + 1;
    const offsetParameter = values.length + 2;

    const [countResult, employeeResult, summaryResult] = await Promise.all([
      database.query(`SELECT COUNT(*)::INTEGER AS total FROM employees ${whereClause}`, values),
      database.query(
        `SELECT ${employeeColumns}
         FROM employees
         ${whereClause}
         ORDER BY last_name ASC, first_name ASC, employee_id ASC
         LIMIT $${limitParameter} OFFSET $${offsetParameter}`,
        dataValues,
      ),
      database.query(
        `SELECT
           COUNT(*)::INTEGER AS "totalEmployees",
           (COUNT(*) FILTER (WHERE emp_status = $1))::INTEGER AS "activeEmployees",
           COUNT(DISTINCT emp_dep)::INTEGER AS departments
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

    const result = await database.query(`SELECT ${employeeColumns} FROM employees WHERE employee_id = $1`, [employeeId]);
    if (result.rowCount === 0) return res.status(404).json({success: false, message: 'Employee not found.'});

    return res.status(200).json({success: true, data: result.rows[0]});
  }

  async function createEmployee(req, res) {
    const {employeeNumber, firstName, lastName, department, position, status, joinDate} = req.employeeInput;
    const result = await database.query(
      `INSERT INTO employees (employee_number, first_name, last_name, emp_dep, emp_pos, emp_status, emp_join_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING ${employeeColumns}`,
      [employeeNumber, firstName, lastName, department, position, status, joinDate],
    );

    return res.status(201).json({success: true, message: 'Employee created successfully.', data: result.rows[0]});
  }

  async function updateEmployee(req, res) {
    const employeeId = parseEmployeeId(req.params.employeeId);
    if (!employeeId) return res.status(400).json({success: false, message: 'Invalid employee ID.'});

    const {employeeNumber, firstName, lastName, department, position, status, joinDate} = req.employeeInput;
    const result = await database.query(
      `UPDATE employees
       SET employee_number = $1, first_name = $2, last_name = $3, emp_dep = $4, emp_pos = $5, emp_status = $6, emp_join_date = $7
       WHERE employee_id = $8
       RETURNING ${employeeColumns}`,
      [employeeNumber, firstName, lastName, department, position, status, joinDate, employeeId],
    );

    if (result.rowCount === 0) return res.status(404).json({success: false, message: 'Employee not found.'});
    return res.status(200).json({success: true, message: 'Employee updated successfully.', data: result.rows[0]});
  }

  async function updateEmployeeStatus(req, res) {
    const employeeId = parseEmployeeId(req.params.employeeId);
    if (!employeeId) return res.status(400).json({success: false, message: 'Invalid employee ID.'});

    const result = await database.query(
      `UPDATE employees SET emp_status = $1 WHERE employee_id = $2 RETURNING ${employeeColumns}`,
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

import { EMPLOYEE_STATUS, EMPLOYEE_STATUS_VALUES } from '../constants/employeeStatus.js';

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function cleanString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeReferenceId(value) {
  if (typeof value === 'number' && Number.isSafeInteger(value) && value > 0) return String(value);
  if (typeof value === 'string' && /^[1-9]\d*$/.test(value.trim())) return value.trim();
  return '';
}

function isValidDate(value) {
  const match = DATE_PATTERN.exec(value);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < 1900) return false;

  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day;
}

function exceedsLength(value, maximum) {
  return value.length > maximum;
}

function isValidStatus(status) {
  return Number.isInteger(status) && EMPLOYEE_STATUS_VALUES.has(status);
}

export function validateEmployee(req, res, next) {
  const body = req.body && typeof req.body === 'object' && !Array.isArray(req.body) ? req.body : {};
  const employee = {
    employeeNumber: cleanString(body.employeeNumber).toUpperCase(),
    firstName: cleanString(body.firstName),
    lastName: cleanString(body.lastName),
    departmentId: normalizeReferenceId(body.departmentId),
    positionId: normalizeReferenceId(body.positionId),
    status: body.status === undefined ? EMPLOYEE_STATUS.ACTIVE : body.status,
    joinDate: cleanString(body.joinDate),
  };

  const errors = {};
  if (!employee.employeeNumber) errors.employeeNumber = 'Employee number is required.';
  else if (exceedsLength(employee.employeeNumber, 30)) errors.employeeNumber = 'Employee number must not exceed 30 characters.';

  if (!employee.firstName) errors.firstName = 'First name is required.';
  else if (exceedsLength(employee.firstName, 100)) errors.firstName = 'First name must not exceed 100 characters.';

  if (!employee.lastName) errors.lastName = 'Last name is required.';
  else if (exceedsLength(employee.lastName, 100)) errors.lastName = 'Last name must not exceed 100 characters.';

  if (!employee.departmentId) errors.departmentId = 'Select a valid department.';
  if (!employee.positionId) errors.positionId = 'Select a valid position.';

  if (!isValidDate(employee.joinDate)) errors.joinDate = 'Join date must be a valid date in YYYY-MM-DD format.';

  if (!isValidStatus(employee.status)) {
    errors.status = 'Status must be the integer 1 for active or 0 for inactive.';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({success: false, message: 'Please correct the highlighted fields.', errors});
  }

  req.employeeInput = employee;
  return next();
}

export function validateEmployeeStatus(req, res, next) {
  const status = req.body?.status;

  if (!isValidStatus(status)) {
    return res.status(400).json({
      success: false,
      message: 'Status must be the integer 1 for active or 0 for inactive.',
      errors: {status: 'Select a valid employee status.'},
    });
  }

  req.employeeStatus = status;
  return next();
}

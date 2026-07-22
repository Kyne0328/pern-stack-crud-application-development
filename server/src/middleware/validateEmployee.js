import {EMPLOYEE_STATUS, EMPLOYEE_STATUS_VALUES} from '../constants/employeeStatus.js';

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function cleanString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizePositionId(value) {
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
  const date = new Date(Date.UTC(year, month - 1, day));

  return year >= 1900
    && date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day;
}

export function validateEmployee(req, res, next) {
  const body = req.body && typeof req.body === 'object' && !Array.isArray(req.body) ? req.body : {};
  const employee = {
    employeeNumber: cleanString(body.employeeNumber).toUpperCase(),
    firstName: cleanString(body.firstName),
    lastName: cleanString(body.lastName),
    positionId: normalizePositionId(body.positionId),
    status: body.status === undefined ? EMPLOYEE_STATUS.ACTIVE : body.status,
    joinDate: cleanString(body.joinDate),
  };

  const errors = {};

  if (!employee.employeeNumber) errors.employeeNumber = 'Employee number is required.';
  else if (employee.employeeNumber.length > 30) errors.employeeNumber = 'Use 30 characters or fewer.';

  if (!employee.firstName) errors.firstName = 'First name is required.';
  else if (employee.firstName.length > 100) errors.firstName = 'Use 100 characters or fewer.';

  if (!employee.lastName) errors.lastName = 'Last name is required.';
  else if (employee.lastName.length > 100) errors.lastName = 'Use 100 characters or fewer.';

  if (!employee.positionId) errors.positionId = 'Select a valid position.';
  if (!isValidDate(employee.joinDate)) errors.joinDate = 'Enter a valid date in YYYY-MM-DD format.';

  if (!Number.isInteger(employee.status) || !EMPLOYEE_STATUS_VALUES.has(employee.status)) {
    errors.status = 'Select a valid status.';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Please correct the highlighted fields.',
      errors,
    });
  }

  req.employeeInput = employee;
  return next();
}

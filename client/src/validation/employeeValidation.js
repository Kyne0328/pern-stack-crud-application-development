import { EMPLOYEE_STATUS_VALUES } from '../constants/employeeStatus.js';

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

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

function cleanString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

export function normalizeEmployeeInput(values) {
  return {
    employeeNumber: cleanString(values.employeeNumber).toUpperCase(),
    firstName: cleanString(values.firstName),
    lastName: cleanString(values.lastName),
    department: cleanString(values.department),
    position: cleanString(values.position),
    status: values.status,
    joinDate: cleanString(values.joinDate),
  };
}

export function validateEmployeeInput(values) {
  const data = normalizeEmployeeInput(values);
  const errors = {};

  if (!data.employeeNumber) errors.employeeNumber = 'Employee number is required.';
  else if (data.employeeNumber.length > 30) errors.employeeNumber = 'Use 30 characters or fewer.';

  if (!data.firstName) errors.firstName = 'First name is required.';
  else if (data.firstName.length > 100) errors.firstName = 'Use 100 characters or fewer.';

  if (!data.lastName) errors.lastName = 'Last name is required.';
  else if (data.lastName.length > 100) errors.lastName = 'Use 100 characters or fewer.';

  if (!data.department) errors.department = 'Department is required.';
  else if (data.department.length > 100) errors.department = 'Use 100 characters or fewer.';

  if (!data.position) errors.position = 'Position is required.';
  else if (data.position.length > 100) errors.position = 'Use 100 characters or fewer.';

  if (!isValidDate(data.joinDate)) errors.joinDate = 'Enter a valid date in YYYY-MM-DD format.';

  if (!Number.isInteger(data.status) || !EMPLOYEE_STATUS_VALUES.has(data.status)) {
    errors.status = 'Select a valid status.';
  }

  return {data, errors, isValid: Object.keys(errors).length === 0};
}

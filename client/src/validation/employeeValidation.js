import {EMPLOYEE_STATUS_VALUES} from '../constants/employeeStatus.js';

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

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

function cleanString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeReferenceId(value) {
  if (typeof value === 'number' && Number.isSafeInteger(value) && value > 0) return String(value);
  return typeof value === 'string' ? value.trim() : '';
}

export function normalizeEmployeeInput(values) {
  return {
    firstName: cleanString(values.firstName),
    lastName: cleanString(values.lastName),
    departmentId: normalizeReferenceId(values.departmentId),
    positionId: normalizeReferenceId(values.positionId),
    status: values.status,
    joinDate: cleanString(values.joinDate),
  };
}

export function validateEmployeeInput(values, departments = []) {
  const normalized = normalizeEmployeeInput(values);
  const errors = {};

  if (!normalized.firstName) errors.firstName = 'First name is required.';
  else if (normalized.firstName.length > 100) errors.firstName = 'Use 100 characters or fewer.';

  if (!normalized.lastName) errors.lastName = 'Last name is required.';
  else if (normalized.lastName.length > 100) errors.lastName = 'Use 100 characters or fewer.';

  if (!/^[1-9]\d*$/.test(normalized.departmentId)) errors.departmentId = 'Select a valid department.';
  if (!/^[1-9]\d*$/.test(normalized.positionId)) errors.positionId = 'Select a valid position.';

  const selectedDepartment = departments.find(
    (department) => String(department.departmentId) === normalized.departmentId,
  );

  if (departments.length > 0 && !selectedDepartment) {
    errors.departmentId = 'Select an available department.';
  }
  if (selectedDepartment && !selectedDepartment.positions.some(
    (position) => String(position.positionId) === normalized.positionId,
  )) {
    errors.positionId = 'Select a position from this department.';
  }

  if (!isValidDate(normalized.joinDate)) errors.joinDate = 'Enter a valid date in YYYY-MM-DD format.';

  if (!Number.isInteger(normalized.status) || !EMPLOYEE_STATUS_VALUES.has(normalized.status)) {
    errors.status = 'Select a valid status.';
  }

  const data = {
    firstName: normalized.firstName,
    lastName: normalized.lastName,
    positionId: normalized.positionId,
    status: normalized.status,
    joinDate: normalized.joinDate,
  };

  return {data, errors, isValid: Object.keys(errors).length === 0};
}

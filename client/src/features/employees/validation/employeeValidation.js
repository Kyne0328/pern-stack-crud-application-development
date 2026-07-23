import * as z from 'zod';
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
  if (typeof value === 'number' && Number.isSafeInteger(value)) return String(value);
  return typeof value === 'string' ? value.trim() : '';
}

function positiveIdSchema(errorMessage) {
  return z.string().regex(/^[1-9]\d*$/, {error: errorMessage});
}

function createEmployeeFormSchema(departments) {
  return z.strictObject({
    firstName: z.string()
      .min(1, {error: 'First name is required.'})
      .max(100, {error: 'Use 100 characters or fewer.'}),
    lastName: z.string()
      .min(1, {error: 'Last name is required.'})
      .max(100, {error: 'Use 100 characters or fewer.'}),
    departmentId: positiveIdSchema('Select a valid department.'),
    positionId: positiveIdSchema('Select a valid position.'),
    status: z.number({error: 'Select a valid status.'})
      .refine(Number.isInteger, {error: 'Select a valid status.'})
      .refine((value) => EMPLOYEE_STATUS_VALUES.has(value), {error: 'Select a valid status.'}),
    joinDate: z.string()
      .min(1, {error: 'Join date is required.'})
      .refine(isValidDate, {error: 'Enter a valid date in YYYY-MM-DD format.'}),
  }).superRefine((employee, context) => {
    if (departments.length === 0) return;

    const selectedDepartment = departments.find(
      (department) => String(department.departmentId) === employee.departmentId,
    );

    if (!selectedDepartment) {
      context.addIssue({
        code: 'custom',
        path: ['departmentId'],
        message: 'Select an available department.',
      });
      return;
    }

    const positionExists = selectedDepartment.positions.some(
      (position) => String(position.positionId) === employee.positionId,
    );

    if (!positionExists) {
      context.addIssue({
        code: 'custom',
        path: ['positionId'],
        message: 'Select a position from this department.',
      });
    }
  });
}

function formatErrors(issues) {
  const errors = {};
  for (const issue of issues) {
    const field = String(issue.path[0] || 'form');
    if (!errors[field]) errors[field] = issue.message;
  }
  return errors;
}

export function normalizeEmployeeInput(values = {}) {
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
  const result = createEmployeeFormSchema(departments).safeParse(normalized);

  if (!result.success) {
    return {
      data: null,
      errors: formatErrors(result.error.issues),
      isValid: false,
    };
  }

  const {departmentId, ...data} = result.data;
  return {data, errors: {}, isValid: true};
}

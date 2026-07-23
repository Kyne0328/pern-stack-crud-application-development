const z = require('zod');
const {EMPLOYEE_STATUS, EMPLOYEE_STATUS_VALUES} = require('../constants/employeeStatus');
const {validateRequest} = require('../middleware/validateRequest');

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

function trimmedStringSchema(requiredMessage) {
  return z.preprocess(
    (value) => typeof value === 'string' ? value.trim() : '',
    z.string().min(1, {error: requiredMessage}),
  );
}

function positiveIdSchema(errorMessage) {
  return z.preprocess(
    (value) => {
      if (typeof value === 'number' && Number.isSafeInteger(value)) return String(value);
      return typeof value === 'string' ? value.trim() : '';
    },
    z.string().regex(/^[1-9]\d*$/, {error: errorMessage}),
  );
}

const statusSchema = z.preprocess(
  (value) => value === undefined ? EMPLOYEE_STATUS.ACTIVE : value,
  z.number({error: 'Select a valid status.'})
    .refine(Number.isInteger, {error: 'Select a valid status.'})
    .refine((value) => EMPLOYEE_STATUS_VALUES.has(value), {error: 'Select a valid status.'}),
);

const employeeSchema = z.strictObject({
  firstName: trimmedStringSchema('First name is required.')
    .pipe(z.string().max(100, {error: 'Use 100 characters or fewer.'})),
  lastName: trimmedStringSchema('Last name is required.')
    .pipe(z.string().max(100, {error: 'Use 100 characters or fewer.'})),
  positionId: positiveIdSchema('Select a valid position.'),
  status: statusSchema,
  joinDate: trimmedStringSchema('Join date is required.')
    .refine(isValidDate, {error: 'Enter a valid date in YYYY-MM-DD format.'}),
});

const employeeIdParamsSchema = z.strictObject({
  employeeId: positiveIdSchema('Invalid employee ID.'),
});

const validateEmployee = validateRequest(employeeSchema, {
  target: 'employeeInput',
  message: 'Please correct the highlighted fields.',
});

const validateEmployeeId = validateRequest(employeeIdParamsSchema, {
  source: 'params',
  target: 'employeeParams',
  message: 'Invalid employee ID.',
});

module.exports = {
  employeeIdParamsSchema,
  employeeSchema,
  isValidDate,
  validateEmployee,
  validateEmployeeId,
};

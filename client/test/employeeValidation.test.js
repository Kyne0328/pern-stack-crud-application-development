import assert from 'node:assert/strict';
import test from 'node:test';
import { EMPLOYEE_STATUS } from '../src/constants/employeeStatus.js';
import { normalizeEmployeeInput, validateEmployeeInput } from '../src/validation/employeeValidation.js';

const validEmployee = {
  employeeNumber: ' emp-100 ',
  firstName: ' Liza ',
  lastName: ' Cruz ',
  department: ' Finance ',
  position: ' Analyst ',
  status: EMPLOYEE_STATUS.ACTIVE,
  joinDate: '2026-07-21',
};

test('normalizes employee text before submission', () => {
  const result = normalizeEmployeeInput(validEmployee);

  assert.equal(result.employeeNumber, 'EMP-100');
  assert.equal(result.firstName, 'Liza');
  assert.equal(result.department, 'Finance');
});

test('accepts a complete valid employee', () => {
  const result = validateEmployeeInput(validEmployee);

  assert.equal(result.isValid, true);
  assert.deepEqual(result.errors, {});
});

test('rejects missing required fields', () => {
  const result = validateEmployeeInput({status: EMPLOYEE_STATUS.ACTIVE});

  assert.equal(result.isValid, false);
  assert.ok(result.errors.employeeNumber);
  assert.ok(result.errors.joinDate);
});

test('rejects invalid dates and statuses', () => {
  const result = validateEmployeeInput({...validEmployee, joinDate: '2026-02-30', status: '1'});

  assert.equal(result.isValid, false);
  assert.ok(result.errors.joinDate);
  assert.ok(result.errors.status);
});

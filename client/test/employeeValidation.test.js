import assert from 'node:assert/strict';
import test from 'node:test';
import { EMPLOYEE_STATUS } from '../src/constants/employeeStatus.js';
import { normalizeEmployeeInput, validateEmployeeInput } from '../src/validation/employeeValidation.js';

const departments = [
  {
    departmentId: '3',
    departmentName: 'Finance',
    positions: [{positionId: '5', positionName: 'Accounting Assistant'}],
  },
];

const validEmployee = {
  employeeNumber: ' emp-100 ',
  firstName: ' Liza ',
  lastName: ' Cruz ',
  departmentId: '3',
  positionId: '5',
  status: EMPLOYEE_STATUS.ACTIVE,
  joinDate: '2026-07-21',
};

test('normalizes employee text and reference IDs before submission', () => {
  const result = normalizeEmployeeInput({...validEmployee, departmentId: 3, positionId: 5});

  assert.equal(result.employeeNumber, 'EMP-100');
  assert.equal(result.firstName, 'Liza');
  assert.equal(result.departmentId, '3');
  assert.equal(result.positionId, '5');
});

test('accepts a complete valid employee', () => {
  const result = validateEmployeeInput(validEmployee, departments);

  assert.equal(result.isValid, true);
  assert.deepEqual(result.errors, {});
});

test('rejects missing required fields', () => {
  const result = validateEmployeeInput({status: EMPLOYEE_STATUS.ACTIVE}, departments);

  assert.equal(result.isValid, false);
  assert.ok(result.errors.employeeNumber);
  assert.ok(result.errors.departmentId);
  assert.ok(result.errors.positionId);
  assert.ok(result.errors.joinDate);
});

test('rejects a position from another department', () => {
  const result = validateEmployeeInput({...validEmployee, positionId: '99'}, departments);

  assert.equal(result.isValid, false);
  assert.ok(result.errors.positionId);
});

test('rejects invalid dates and statuses', () => {
  const result = validateEmployeeInput({...validEmployee, joinDate: '2026-02-30', status: '1'}, departments);

  assert.equal(result.isValid, false);
  assert.ok(result.errors.joinDate);
  assert.ok(result.errors.status);
});

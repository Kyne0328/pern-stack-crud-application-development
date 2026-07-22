import assert from 'node:assert/strict';
import test from 'node:test';
import {EMPLOYEE_STATUS} from '../src/constants/employeeStatus.js';
import {normalizeEmployeeInput, validateEmployeeInput} from '../src/validation/employeeValidation.js';

const departments = [
  {
    departmentId: '3',
    departmentName: 'Finance',
    positions: [{positionId: '5', positionName: 'Accounting Assistant'}],
  },
];

const validEmployee = {
  firstName: ' Liza ',
  lastName: ' Cruz ',
  departmentId: '3',
  positionId: '5',
  status: EMPLOYEE_STATUS.ACTIVE,
  joinDate: '2026-07-21',
};

test('normalizes form values', () => {
  const result = normalizeEmployeeInput({...validEmployee, departmentId: 3, positionId: 5});

  assert.equal(result.firstName, 'Liza');
  assert.equal(result.lastName, 'Cruz');
  assert.equal(result.departmentId, '3');
  assert.equal(result.positionId, '5');
});

test('returns only backend fields after valid dropdown selection', () => {
  const result = validateEmployeeInput(validEmployee, departments);

  assert.equal(result.isValid, true);
  assert.deepEqual(result.data, {
    firstName: 'Liza',
    lastName: 'Cruz',
    positionId: '5',
    status: EMPLOYEE_STATUS.ACTIVE,
    joinDate: '2026-07-21',
  });
  assert.equal('departmentId' in result.data, false);
  assert.equal('employeeId' in result.data, false);
});

test('rejects missing fields and mismatched positions', () => {
  const missing = validateEmployeeInput({status: EMPLOYEE_STATUS.ACTIVE}, departments);
  const mismatched = validateEmployeeInput({...validEmployee, positionId: '99'}, departments);

  assert.equal(missing.isValid, false);
  assert.ok(missing.errors.firstName);
  assert.ok(missing.errors.lastName);
  assert.ok(missing.errors.departmentId);
  assert.ok(missing.errors.positionId);
  assert.ok(mismatched.errors.positionId);
});

test('rejects invalid dates and statuses', () => {
  const result = validateEmployeeInput({...validEmployee, joinDate: '2026-02-30', status: '1'}, departments);

  assert.equal(result.isValid, false);
  assert.ok(result.errors.joinDate);
  assert.ok(result.errors.status);
});

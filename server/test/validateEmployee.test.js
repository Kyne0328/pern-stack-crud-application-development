import assert from 'node:assert/strict';
import test from 'node:test';
import { EMPLOYEE_STATUS } from '../src/constants/employeeStatus.js';
import { validateEmployee, validateEmployeeStatus } from '../src/middleware/validateEmployee.js';

function runMiddleware(middleware, body) {
  let nextCalled = false;
  let statusCode;
  let payload;
  const req = {body};
  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(value) {
      payload = value;
      return this;
    },
  };

  middleware(req, res, () => {
    nextCalled = true;
  });

  return {req, nextCalled, statusCode, payload};
}

const validEmployee = {
  employeeNumber: ' emp-003 ',
  firstName: ' Ana ',
  lastName: ' Reyes ',
  departmentId: '3',
  positionId: '5',
  status: EMPLOYEE_STATUS.ACTIVE,
  joinDate: '2026-07-21',
};

test('accepts and normalizes a valid employee', () => {
  const result = runMiddleware(validateEmployee, validEmployee);

  assert.equal(result.nextCalled, true);
  assert.equal(result.req.employeeInput.employeeNumber, 'EMP-003');
  assert.equal(result.req.employeeInput.departmentId, '3');
  assert.equal(result.req.employeeInput.positionId, '5');
  assert.equal(result.req.employeeInput.status, EMPLOYEE_STATUS.ACTIVE);
});

test('accepts numeric reference IDs and normalizes them to strings', () => {
  const result = runMiddleware(validateEmployee, {...validEmployee, departmentId: 3, positionId: 5});

  assert.equal(result.nextCalled, true);
  assert.equal(result.req.employeeInput.departmentId, '3');
  assert.equal(result.req.employeeInput.positionId, '5');
});

test('rejects a missing request body without throwing', () => {
  const result = runMiddleware(validateEmployee, undefined);

  assert.equal(result.nextCalled, false);
  assert.equal(result.statusCode, 400);
  assert.ok(result.payload.errors.employeeNumber);
});

test('rejects missing required employee fields', () => {
  const result = runMiddleware(validateEmployee, {status: EMPLOYEE_STATUS.ACTIVE});

  assert.equal(result.nextCalled, false);
  assert.equal(result.statusCode, 400);
  assert.equal(result.payload.success, false);
  assert.ok(result.payload.errors.employeeNumber);
  assert.ok(result.payload.errors.departmentId);
  assert.ok(result.payload.errors.positionId);
  assert.ok(result.payload.errors.joinDate);
});

test('rejects string employee statuses', () => {
  const result = runMiddleware(validateEmployee, {...validEmployee, status: '1'});

  assert.equal(result.nextCalled, false);
  assert.equal(result.statusCode, 400);
  assert.match(result.payload.errors.status, /integer/);
});

test('rejects impossible calendar dates', () => {
  const result = runMiddleware(validateEmployee, {...validEmployee, joinDate: '2026-02-31'});

  assert.equal(result.nextCalled, false);
  assert.equal(result.statusCode, 400);
  assert.ok(result.payload.errors.joinDate);
});

test('accepts a valid status-only request', () => {
  const result = runMiddleware(validateEmployeeStatus, {status: EMPLOYEE_STATUS.INACTIVE});

  assert.equal(result.nextCalled, true);
  assert.equal(result.req.employeeStatus, EMPLOYEE_STATUS.INACTIVE);
});

test('rejects invalid status-only requests', () => {
  const result = runMiddleware(validateEmployeeStatus, {status: 7});

  assert.equal(result.nextCalled, false);
  assert.equal(result.statusCode, 400);
  assert.ok(result.payload.errors.status);
});

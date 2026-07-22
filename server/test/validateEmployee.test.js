const assert = require('node:assert/strict');
const test = require('node:test');
const {EMPLOYEE_STATUS} = require('../src/constants/employeeStatus');
const {validateEmployee} = require('../src/middleware/validateEmployee');

function runMiddleware(body) {
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

  validateEmployee(req, res, () => {
    nextCalled = true;
  });

  return {req, nextCalled, statusCode, payload};
}

const validEmployee = {
  firstName: ' Ana ',
  lastName: ' Reyes ',
  positionId: '5',
  status: EMPLOYEE_STATUS.ACTIVE,
  joinDate: '2026-07-21',
};

test('accepts and normalizes a valid employee', () => {
  const result = runMiddleware(validEmployee);

  assert.equal(result.nextCalled, true);
  assert.deepEqual(result.req.employeeInput, {
    firstName: 'Ana',
    lastName: 'Reyes',
    positionId: '5',
    status: EMPLOYEE_STATUS.ACTIVE,
    joinDate: '2026-07-21',
  });
});

test('rejects missing required fields', () => {
  const result = runMiddleware({status: EMPLOYEE_STATUS.ACTIVE});

  assert.equal(result.nextCalled, false);
  assert.equal(result.statusCode, 400);
  assert.ok(result.payload.errors.firstName);
  assert.ok(result.payload.errors.lastName);
  assert.ok(result.payload.errors.positionId);
  assert.ok(result.payload.errors.joinDate);
});

test('rejects invalid dates and statuses', () => {
  const result = runMiddleware({...validEmployee, joinDate: '2026-02-31', status: '1'});

  assert.equal(result.nextCalled, false);
  assert.ok(result.payload.errors.joinDate);
  assert.ok(result.payload.errors.status);
});

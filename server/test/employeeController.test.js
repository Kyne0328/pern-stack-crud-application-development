import assert from 'node:assert/strict';
import test from 'node:test';
import { EMPLOYEE_STATUS } from '../src/constants/employeeStatus.js';
import { createEmployeeController, parseEmployeeListQuery } from '../src/controllers/createEmployeeController.js';

function createResponse() {
  return {
    statusCode: 200,
    payload: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.payload = payload;
      return this;
    },
  };
}

test('parses valid list query values', () => {
  assert.deepEqual(parseEmployeeListQuery({search: ' Ana ', status: '1', page: '2', pageSize: '5'}), {
    search: 'Ana',
    status: 1,
    page: 2,
    pageSize: 5,
  });
});

test('rejects invalid pagination before querying the database', async () => {
  let queryCount = 0;
  const controller = createEmployeeController({query: async () => {
    queryCount += 1;
    return {rows: [], rowCount: 0};
  }});
  const response = createResponse();

  await controller.listEmployees({query: {page: '0'}}, response);

  assert.equal(response.statusCode, 400);
  assert.equal(queryCount, 0);
});

test('returns paginated employees and global summary', async () => {
  const calls = [];
  const database = {
    async query(text, values) {
      calls.push({text, values});
      if (text.includes('COUNT(*)::INTEGER AS total FROM')) return {rows: [{total: 11}]};
      if (text.includes('COUNT(DISTINCT emp_dep)')) {
        return {rows: [{totalEmployees: 14, activeEmployees: 10, departments: 4}]};
      }
      return {rows: [{employeeId: '9', employeeNumber: 'EMP-009', status: 1}], rowCount: 1};
    },
  };
  const controller = createEmployeeController(database);
  const response = createResponse();

  await controller.listEmployees({query: {search: 'ana', status: '1', page: '2', pageSize: '5'}}, response);

  assert.equal(response.statusCode, 200);
  assert.equal(response.payload.meta.total, 11);
  assert.equal(response.payload.meta.totalPages, 3);
  assert.equal(response.payload.summary.inactiveEmployees, 4);
  assert.deepEqual(calls[1].values.slice(-2), [5, 5]);
});

test('creates an employee using normalized input', async () => {
  let submittedValues;
  const controller = createEmployeeController({
    async query(text, values) {
      submittedValues = values;
      return {rows: [{employeeId: '20', employeeNumber: values[0]}], rowCount: 1};
    },
  });
  const response = createResponse();
  const employeeInput = {
    employeeNumber: 'EMP-020',
    firstName: 'Lina',
    lastName: 'Garcia',
    department: 'Finance',
    position: 'Analyst',
    status: 1,
    joinDate: '2026-07-21',
  };

  await controller.createEmployee({employeeInput}, response);

  assert.equal(response.statusCode, 201);
  assert.deepEqual(submittedValues, ['EMP-020', 'Lina', 'Garcia', 'Finance', 'Analyst', 1, '2026-07-21']);
});

test('reactivates an employee with a numeric status', async () => {
  const database = {
    async query(text, values) {
      assert.deepEqual(values, [EMPLOYEE_STATUS.ACTIVE, '9']);
      return {rows: [{employeeId: '9', status: EMPLOYEE_STATUS.ACTIVE}], rowCount: 1};
    },
  };
  const controller = createEmployeeController(database);
  const response = createResponse();

  await controller.updateEmployeeStatus(
    {params: {employeeId: '9'}, employeeStatus: EMPLOYEE_STATUS.ACTIVE},
    response,
  );

  assert.equal(response.statusCode, 200);
  assert.match(response.payload.message, /reactivated/);
});

test('returns 404 when changing a missing employee status', async () => {
  const controller = createEmployeeController({query: async () => ({rows: [], rowCount: 0})});
  const response = createResponse();

  await controller.updateEmployeeStatus(
    {params: {employeeId: '999'}, employeeStatus: EMPLOYEE_STATUS.INACTIVE},
    response,
  );

  assert.equal(response.statusCode, 404);
});

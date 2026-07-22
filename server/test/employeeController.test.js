const assert = require('node:assert/strict');
const test = require('node:test');

process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/test';
const employeeController = require('../src/controllers/employeeController');

test('exports the four employee CRUD handlers', () => {
  assert.equal(typeof employeeController.listEmployees, 'function');
  assert.equal(typeof employeeController.createEmployee, 'function');
  assert.equal(typeof employeeController.updateEmployee, 'function');
  assert.equal(typeof employeeController.deleteEmployee, 'function');
});

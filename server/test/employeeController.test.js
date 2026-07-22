import assert from 'node:assert/strict';
import test from 'node:test';

process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/test';
const {parseEmployeeListQuery} = await import('../src/controllers/employeeController.js');

test('uses simple list defaults', () => {
  assert.deepEqual(parseEmployeeListQuery(), {
    search: '',
    status: null,
    page: 1,
    pageSize: 10,
  });
});

test('parses frontend list filters', () => {
  assert.deepEqual(
    parseEmployeeListQuery({search: ' Finance ', status: '1', page: '2', pageSize: '10'}),
    {search: 'Finance', status: 1, page: 2, pageSize: 10},
  );
});

test('rejects invalid list filters', () => {
  assert.match(parseEmployeeListQuery({status: '4'}).error, /Status/);
  assert.match(parseEmployeeListQuery({page: '0'}).error, /Page/);
  assert.match(parseEmployeeListQuery({pageSize: '100'}).error, /Page size/);
});

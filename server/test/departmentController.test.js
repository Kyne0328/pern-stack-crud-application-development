const assert = require('node:assert/strict');
const test = require('node:test');

process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/test';
const {groupDepartments} = require('../src/controllers/departmentController');

test('groups positions under their departments', () => {
  const result = groupDepartments([
    {departmentId: '1', departmentName: 'Information Technology', positionId: '10', positionName: 'Software Developer'},
    {departmentId: '1', departmentName: 'Information Technology', positionId: '11', positionName: 'Technical Support'},
    {departmentId: '2', departmentName: 'Human Resources', positionId: null, positionName: null},
  ]);

  assert.equal(result.length, 2);
  assert.equal(result[0].positions.length, 2);
  assert.deepEqual(result[1].positions, []);
});

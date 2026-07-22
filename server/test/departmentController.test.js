import assert from 'node:assert/strict';
import test from 'node:test';
import { createDepartmentController } from '../src/controllers/departmentController.js';

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

test('groups positions under their departments', async () => {
  const controller = createDepartmentController({
    query: async () => ({
      rows: [
        {departmentId: '1', departmentName: 'Information Technology', positionId: '10', positionName: 'Software Developer'},
        {departmentId: '1', departmentName: 'Information Technology', positionId: '11', positionName: 'Technical Support'},
        {departmentId: '2', departmentName: 'Human Resources', positionId: null, positionName: null},
      ],
    }),
  });
  const response = createResponse();

  await controller.listDepartments({}, response);

  assert.equal(response.statusCode, 200);
  assert.equal(response.payload.data.length, 2);
  assert.equal(response.payload.data[0].positions.length, 2);
  assert.deepEqual(response.payload.data[1].positions, []);
});

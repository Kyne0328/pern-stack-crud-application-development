import {requestApi} from '../../../shared/api/apiClient.js';

export function getDepartments() {
  return requestApi({url: '/departments'});
}

export function getEmployees() {
  return requestApi({url: '/employees'});
}

export function createEmployee(employee) {
  return requestApi({url: '/employees', method: 'post', data: employee});
}

export function updateEmployee(employeeId, employee) {
  return requestApi({url: `/employees/${employeeId}`, method: 'put', data: employee});
}

export function deleteEmployee(employeeId) {
  return requestApi({url: `/employees/${employeeId}`, method: 'delete'});
}

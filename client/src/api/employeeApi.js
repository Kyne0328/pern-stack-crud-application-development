import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10_000,
  headers: {
    Accept: 'application/json',
  },
});

async function request(config) {
  try {
    const response = await api.request(config);
    return response.data;
  } catch (error) {
    if (!axios.isAxiosError(error)) throw error;

    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      throw new Error('The server took too long to respond. Try again.');
    }

    if (!error.response) {
      throw new Error('Unable to connect to the API. Confirm that the Express server is running.');
    }

    const payload = error.response.data;
    const apiError = new Error(payload?.message || 'The request failed.');
    apiError.details = payload?.errors || {};
    throw apiError;
  }
}

export function getDepartments() {
  return request({url: '/departments'});
}

export function getEmployees() {
  return request({url: '/employees'});
}

export function createEmployee(employee) {
  return request({url: '/employees', method: 'post', data: employee});
}

export function updateEmployee(employeeId, employee) {
  return request({url: `/employees/${employeeId}`, method: 'put', data: employee});
}

export function deleteEmployee(employeeId) {
  return request({url: `/employees/${employeeId}`, method: 'delete'});
}

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const REQUEST_TIMEOUT_MS = 10_000;

const api = axios.create({
  baseURL: API_URL,
  timeout: REQUEST_TIMEOUT_MS,
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
    const apiError = new Error(
      payload && typeof payload === 'object' && payload.message
        ? payload.message
        : 'The request failed.',
    );
    apiError.details = payload && typeof payload === 'object' ? payload.errors || {} : {};
    throw apiError;
  }
}

export function getDepartments() {
  return request({url: '/departments'});
}

export function getEmployees(filters = {}) {
  const params = {};
  if (filters.search) params.search = filters.search;
  if (filters.status !== '' && filters.status !== undefined) params.status = filters.status;
  if (filters.page) params.page = filters.page;
  if (filters.pageSize) params.pageSize = filters.pageSize;

  return request({url: '/employees', params});
}

export function createEmployee(employee) {
  return request({
    url: '/employees',
    method: 'post',
    data: employee,
  });
}

export function updateEmployee(employeeId, employee) {
  return request({
    url: `/employees/${employeeId}`,
    method: 'put',
    data: employee,
  });
}

export function deleteEmployee(employeeId) {
  return request({
    url: `/employees/${employeeId}`,
    method: 'delete',
  });
}

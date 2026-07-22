const API_URL = import.meta.env.VITE_API_URL || '/api';
const REQUEST_TIMEOUT_MS = 10_000;

async function request(path, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...(options.body ? {'Content-Type': 'application/json'} : {}),
        ...options.headers,
      },
    });

    const payload = await response.json().catch(() => ({
      success: false,
      message: 'The server returned an invalid response.',
    }));

    if (!response.ok) {
      const error = new Error(payload.message || 'The request failed.');
      error.details = payload.errors || {};
      throw error;
    }

    return payload;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('The server took too long to respond. Try again.');
    }
    if (error instanceof TypeError) {
      throw new Error('Unable to connect to the API. Confirm that the Express server is running.');
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export function getDepartments() {
  return request('/departments');
}

export async function getEmployees(filters = {}) {
  const params = new URLSearchParams();
  if (filters.search) params.set('search', filters.search);
  if (filters.status !== '' && filters.status !== undefined) params.set('status', String(filters.status));
  if (filters.page) params.set('page', String(filters.page));
  if (filters.pageSize) params.set('pageSize', String(filters.pageSize));
  const query = params.toString();
  return request(`/employees${query ? `?${query}` : ''}`);
}

export function getEmployee(employeeId) {
  return request(`/employees/${employeeId}`);
}

export function createEmployee(employee) {
  return request('/employees', {
    method: 'POST',
    body: JSON.stringify(employee),
  });
}

export function updateEmployee(employeeId, employee) {
  return request(`/employees/${employeeId}`, {
    method: 'PUT',
    body: JSON.stringify(employee),
  });
}

export function updateEmployeeStatus(employeeId, status) {
  return request(`/employees/${employeeId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({status}),
  });
}

export function deactivateEmployee(employeeId) {
  return request(`/employees/${employeeId}`, {method: 'DELETE'});
}

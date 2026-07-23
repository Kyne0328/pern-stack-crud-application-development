import axios from 'axios';

const authApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10_000,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

async function request(config) {
  try {
    const response = await authApi.request(config);
    return response.data;
  } catch (error) {
    if (!axios.isAxiosError(error)) throw error;

    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      throw new Error('The server took too long to respond. Try again.');
    }

    if (!error.response) {
      throw new Error('Unable to connect to the API. Confirm that the Express server is running.');
    }

    const apiError = new Error(error.response.data?.message || 'Authentication failed.');
    apiError.status = error.response.status;
    throw apiError;
  }
}

export function register(credentials) {
  return request({url: '/auth/register', method: 'post', data: credentials});
}

export function login(credentials) {
  return request({url: '/auth/login', method: 'post', data: credentials});
}

export async function getCurrentUser() {
  try {
    const response = await request({url: '/auth/current'});
    return response.user;
  } catch (error) {
    if (error.status === 401) return null;
    throw error;
  }
}

export function logout() {
  return request({url: '/auth/logout', method: 'post'});
}

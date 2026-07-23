import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10_000,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
  },
});

export async function requestApi(config) {
  try {
    const response = await apiClient.request(config);
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
    apiError.status = error.response.status;
    apiError.details = payload?.errors || {};
    throw apiError;
  }
}

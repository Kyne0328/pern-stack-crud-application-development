import {requestApi} from '../../../shared/api/apiClient.js';

export function register(credentials) {
  return requestApi({url: '/auth/register', method: 'post', data: credentials});
}

export function login(credentials) {
  return requestApi({url: '/auth/login', method: 'post', data: credentials});
}

export async function getCurrentUser() {
  const response = await requestApi({url: '/auth/current'});
  return response.user;
}

export function logout() {
  return requestApi({url: '/auth/logout', method: 'post'});
}

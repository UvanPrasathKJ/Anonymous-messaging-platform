/**
 * authService.js
 *
 * Handles authentication endpoints.
 *
 * Expected Spring Boot endpoints:
 *   POST /api/auth/login     → { token, user }
 *   POST /api/auth/register  → { message }
 *
 * Both functions return the axios response's `data` field directly
 * so callers only deal with the payload, not the full HTTP response.
 */

import client from './client';

const AUTH_BASE = '/auth';

/**
 * Log in with username + password.
 *
 * On success the backend returns a JWT. Store it in localStorage
 * and it will be attached automatically by the request interceptor.
 *
 * @param {{ username: string, password: string }} credentials
 * @returns {Promise<{ token: string, user: object }>}
 */
export async function login({ username, password }) {
  // TODO: replace with real call when backend is ready
  // const { data } = await client.post(`${AUTH_BASE}/login`, { username, password });
  // localStorage.setItem('token', data.token);
  // return data;

  return Promise.resolve({
    token: 'placeholder-jwt-token',
    user:  { id: 1, username },
  });
}

/**
 * Register a new account.
 *
 * @param {{ username: string, email: string, password: string }} payload
 * @returns {Promise<{ message: string }>}
 */
export async function register({ username, email, password }) {
  // TODO: replace with real call when backend is ready
  // const { data } = await client.post(`${AUTH_BASE}/register`, { username, email, password });
  // return data;

  return Promise.resolve({
    message: 'Registration successful. Please log in.',
  });
}

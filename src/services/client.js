/**
 * client.js
 *
 * Configured Axios instance shared by all service modules.
 *
 * Design decisions:
 *  - baseURL points to /api so every request is relative to that prefix.
 *    The Vite dev proxy forwards /api/* to http://localhost:8080/api/*.
 *    In production, set VITE_API_BASE_URL in your .env and the same
 *    prefix will reach the deployed Spring Boot service.
 *  - Authorization header is injected via a request interceptor so
 *    callers never have to add it manually.
 *  - A response interceptor handles 401 globally (redirect to login)
 *    and surfaces a normalised error shape to service callers.
 */

import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

/* ── Request interceptor ──────────────────────────────── */
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

/* ── Response interceptor ─────────────────────────────── */
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear storage and send to login.
      // When React Router is available outside components use
      // window.location; swap for navigate() once an auth context exists.
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    // Normalise the error so service callers always get a consistent shape.
    const message =
      error.response?.data?.message ??
      error.response?.data?.error ??
      error.message ??
      'An unexpected error occurred.';

    return Promise.reject({ status: error.response?.status, message });
  },
);

export default client;

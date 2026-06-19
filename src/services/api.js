/**
 * api.js  —  public surface of the services layer
 *
 * Import everything from here rather than from individual service files.
 * This keeps import paths short and makes future refactors transparent.
 *
 * Usage:
 *   import { login, register, getMessages, sendMessage } from '../services/api';
 *
 * Internal layout:
 *   src/services/
 *   ├── api.js            ← this file (barrel export)
 *   ├── client.js         ← configured Axios instance + interceptors
 *   ├── authService.js    ← login, register
 *   └── messageService.js ← getMessages, sendMessage
 */

export { login, register }           from './authService';
export { getMessages, sendMessage }  from './messageService';

// Re-export the raw client for edge cases that need it directly
// (e.g. a one-off request that doesn't belong in any service module).
export { default as apiClient }      from './client';

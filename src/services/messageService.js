/**
 * messageService.js
 *
 * Handles messaging endpoints.
 *
 * Expected Spring Boot endpoints:
 *   GET  /api/messages?recipientId={id}&page={n}&size={n}
 *         → { content: Message[], totalPages, totalElements }
 *   POST /api/messages
 *         → Message
 *
 * Message shape (mirrors Spring Boot entity):
 * {
 *   id:          number,
 *   senderId:    number,
 *   recipientId: number,
 *   content:     string,
 *   sentAt:      string (ISO-8601),
 *   readAt:      string | null,
 * }
 */

import client from './client';

const MESSAGES_BASE = '/messages';

/**
 * Fetch the message thread between the current user and a recipient.
 *
 * @param {object}  params
 * @param {number}  params.recipientId  - ID of the other participant
 * @param {number} [params.page=0]      - Zero-based page index
 * @param {number} [params.size=30]     - Items per page
 * @returns {Promise<{ content: object[], totalPages: number, totalElements: number }>}
 */
export async function getMessages({ recipientId, page = 0, size = 30 }) {
  // TODO: replace with real call when backend is ready
  // const { data } = await client.get(MESSAGES_BASE, {
  //   params: { recipientId, page, size },
  // });
  // return data;

  return Promise.resolve({
    content: [],
    totalPages: 0,
    totalElements: 0,
  });
}

/**
 * Send a message to a recipient.
 *
 * @param {object} payload
 * @param {number} payload.recipientId - ID of the recipient
 * @param {string} payload.content     - Message text
 * @returns {Promise<object>}          - The created Message object
 */
export async function sendMessage({ recipientId, content }) {
  // TODO: replace with real call when backend is ready
  // const { data } = await client.post(MESSAGES_BASE, { recipientId, content });
  // return data;

  return Promise.resolve({
    id:          Date.now(),
    senderId:    1,
    recipientId,
    content,
    sentAt:      new Date().toISOString(),
    readAt:      null,
  });
}

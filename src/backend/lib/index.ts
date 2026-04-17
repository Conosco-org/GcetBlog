/**
 * Backend Library - Barrel Export
 *
 * Central export point for all backend utilities.
 */

// Payload client singleton
export { getPayloadClient } from './payload-client'

// Activity logging
export { logActivity } from './log-activity'

// Notification creation
export { createNotification } from './create-notification'

// Email service (re-export from email module)
export {
  getEmailService,
  resetEmailService,
  sendNewsletter,
  generateDigest,
  sendWelcomeEmail,
  sendUnsubscribeConfirmation,
} from './email'

export type {
  EmailProvider,
  EmailMessage,
  SendResult,
  BatchSendResult,
  EmailAddress,
  EmailSettings,
  DigestPost,
} from './email'

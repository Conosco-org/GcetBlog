/**
 * Email Service - Barrel Export
 *
 * Central export point for all email-related functionality.
 */

// Main email service
export { getEmailService, resetEmailService } from './send-email'
export type {
  EmailProvider,
  EmailMessage,
  SendResult,
  BatchSendResult,
  EmailAddress,
  EmailSettings,
} from './types'

// Newsletter sending engine
export {
  sendNewsletter,
  generateDigest,
  sendWelcomeEmail,
  sendUnsubscribeConfirmation,
} from './sender'

// Email tracking utilities
export {
  wrapLinksForTracking,
  injectTrackingPixel,
  prepareEmailForSend,
  getComplianceHeaders,
  getSubscriberUrls,
} from './tracking'

// Email templates
export { BaseLayout } from './templates/base-layout'
export { NewsletterDigest } from './templates/newsletter-digest'
export type { DigestPost } from './templates/newsletter-digest'
export { NewsletterManual } from './templates/newsletter-manual'
export { WelcomeEmail } from './templates/welcome-email'
export { UnsubscribeConfirmation } from './templates/unsubscribe-confirmation'

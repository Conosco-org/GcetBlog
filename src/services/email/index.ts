/**
 * Email Service - Singleton Entry Point
 *
 * Usage:
 *   import { getEmailService } from '@/services/email'
 *   const email = getEmailService()
 *   await email.provider.send({ to: '...', subject: '...', html: '...' })
 */

import type { EmailProvider, EmailSettings, EmailMessage, SendResult } from './types'
import { createEmailProvider, getEmailSettings } from './factory'

// Re-export types for convenience
export type {
  EmailProvider,
  EmailMessage,
  SendResult,
  BatchSendResult,
  EmailAddress,
  EmailSettings,
} from './types'

// ---------------------------------------------------------------------------
// Service wrapper
// ---------------------------------------------------------------------------

interface EmailService {
  /** The underlying provider instance */
  provider: EmailProvider
  /** Global settings (default from, rate limit, etc.) */
  settings: EmailSettings
  /**
   * Convenience: send a single email with default "from" applied.
   * Prefer this over provider.send() directly.
   */
  send(message: EmailMessage): Promise<SendResult>
}

// ---------------------------------------------------------------------------
// Singleton
// ---------------------------------------------------------------------------

let _service: EmailService | null = null

export function getEmailService(): EmailService {
  if (_service) return _service

  const settings = getEmailSettings()
  const provider = createEmailProvider(settings.providerConfig)

  _service = {
    provider,
    settings,

    async send(message: EmailMessage): Promise<SendResult> {
      // Apply default "from" if not set
      const msg: EmailMessage = {
        ...message,
        from: message.from ?? settings.defaultFrom,
      }
      return provider.send(msg)
    },
  }

  return _service
}

/**
 * Reset the singleton - useful for testing or when env vars change at runtime.
 */
export function resetEmailService(): void {
  _service = null
}

/**
 * Email Provider Factory
 *
 * Reads environment variables and instantiates the correct provider.
 * Switch providers by changing EMAIL_PROVIDER env var — zero code changes.
 */

import type { EmailProvider, EmailProviderConfig, EmailSettings, EmailAddress } from './types'
import { SmtpProvider } from './providers/smtp'
import { ResendProvider } from './providers/resend'
import { SendGridProvider } from './providers/sendgrid'
import { ConsoleProvider } from './providers/console'

// ---------------------------------------------------------------------------
// Config from environment
// ---------------------------------------------------------------------------

function getProviderConfig(): EmailProviderConfig {
  const provider = (process.env.EMAIL_PROVIDER ?? 'console').toLowerCase()

  switch (provider) {
    case 'smtp': {
      const host = process.env.SMTP_HOST
      const port = process.env.SMTP_PORT
      const user = process.env.SMTP_USER
      const pass = process.env.SMTP_PASS

      if (!host || !port || !user || !pass) {
        throw new Error(
          '[EmailFactory] SMTP provider requires SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS env vars',
        )
      }

      return {
        provider: 'smtp',
        host,
        port: parseInt(port, 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: { user, pass },
        pool: true,
        maxConnections: parseInt(process.env.SMTP_MAX_CONNECTIONS ?? '5', 10),
      }
    }

    case 'resend': {
      const apiKey = process.env.RESEND_API_KEY
      if (!apiKey) {
        throw new Error('[EmailFactory] Resend provider requires RESEND_API_KEY env var')
      }
      return { provider: 'resend', apiKey }
    }

    case 'sendgrid': {
      const apiKey = process.env.SENDGRID_API_KEY
      if (!apiKey) {
        throw new Error('[EmailFactory] SendGrid provider requires SENDGRID_API_KEY env var')
      }
      return { provider: 'sendgrid', apiKey }
    }

    case 'console':
      return { provider: 'console' }

    default:
      console.warn(
        `[EmailFactory] Unknown EMAIL_PROVIDER "${provider}", falling back to console`,
      )
      return { provider: 'console' }
  }
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export function createEmailProvider(config: EmailProviderConfig): EmailProvider {
  switch (config.provider) {
    case 'smtp':
      return new SmtpProvider(config)
    case 'resend':
      return new ResendProvider(config)
    case 'sendgrid':
      return new SendGridProvider(config)
    case 'console':
      return new ConsoleProvider()
    default: {
      const _exhaustive: never = config
      throw new Error(`Unknown email provider: ${JSON.stringify(_exhaustive)}`)
    }
  }
}

// ---------------------------------------------------------------------------
// Settings helper
// ---------------------------------------------------------------------------

export function getEmailSettings(): EmailSettings {
  const providerConfig = getProviderConfig()

  const fromEmail = process.env.EMAIL_FROM ?? 'noreply@gcet.edu.in'
  const fromName = process.env.EMAIL_FROM_NAME ?? 'GCET Blog'

  const defaultFrom: EmailAddress = { email: fromEmail, name: fromName }

  return {
    defaultFrom,
    rateLimit: parseInt(process.env.EMAIL_RATE_LIMIT ?? '10', 10),
    providerConfig,
  }
}

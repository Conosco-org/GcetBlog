/**
 * Email Provider Abstraction Layer - Types
 *
 * Strategy pattern interfaces for provider-agnostic email sending.
 * Supports SMTP (any provider), Resend API, SendGrid API, and a
 * console logger for development.
 */

// ---------------------------------------------------------------------------
// Email message
// ---------------------------------------------------------------------------

export interface EmailAddress {
  email: string
  name?: string
}

export interface EmailMessage {
  /** Recipient(s) */
  to: string | EmailAddress | (string | EmailAddress)[]
  /** Sender - falls back to EMAIL_FROM env var */
  from?: string | EmailAddress
  /** Email subject line */
  subject: string
  /** Rendered HTML body */
  html: string
  /** Plain-text fallback */
  text?: string
  /** Reply-to address */
  replyTo?: string | EmailAddress
  /** RFC 2369 List-Unsubscribe header value */
  listUnsubscribe?: string
  /** RFC 8058 List-Unsubscribe-Post header value */
  listUnsubscribePost?: string
  /** Provider-specific tags for categorization */
  tags?: { name: string; value: string }[]
  /** Arbitrary metadata (tracking IDs, campaign refs, etc.) */
  metadata?: Record<string, string>
  /** Custom headers */
  headers?: Record<string, string>
}

// ---------------------------------------------------------------------------
// Send results
// ---------------------------------------------------------------------------

export interface SendResult {
  success: boolean
  /** Provider-assigned message ID */
  messageId?: string
  /** Which provider handled the send */
  provider: string
  /** Error message on failure */
  error?: string
}

export interface BatchSendResult {
  /** Total attempted */
  total: number
  /** Successfully queued/sent */
  successful: number
  /** Failed to send */
  failed: number
  /** Per-recipient results */
  results: SendResult[]
}

// ---------------------------------------------------------------------------
// Provider interface (strategy)
// ---------------------------------------------------------------------------

export interface EmailProvider {
  /** Human-readable provider name */
  readonly name: string

  /** Send a single email */
  send(message: EmailMessage): Promise<SendResult>

  /**
   * Send a batch of emails. Default implementation loops over send(),
   * but providers can override for native batch support.
   */
  sendBatch(messages: EmailMessage[]): Promise<BatchSendResult>

  /** Verify the provider connection / credentials are valid */
  verify(): Promise<boolean>
}

// ---------------------------------------------------------------------------
// Provider configuration (discriminated union)
// ---------------------------------------------------------------------------

export interface SmtpConfig {
  provider: 'smtp'
  host: string
  port: number
  secure?: boolean
  auth: {
    user: string
    pass: string
  }
  /** Enable connection pooling for batch sends */
  pool?: boolean
  /** Max concurrent connections (pool mode) */
  maxConnections?: number
}

export interface ResendConfig {
  provider: 'resend'
  apiKey: string
}

export interface SendGridConfig {
  provider: 'sendgrid'
  apiKey: string
}

export interface ConsoleConfig {
  provider: 'console'
}

export type EmailProviderConfig =
  | SmtpConfig
  | ResendConfig
  | SendGridConfig
  | ConsoleConfig

// ---------------------------------------------------------------------------
// Global email settings
// ---------------------------------------------------------------------------

export interface EmailSettings {
  /** Default sender address */
  defaultFrom: EmailAddress
  /** Emails per second rate limit */
  rateLimit?: number
  /** Provider config */
  providerConfig: EmailProviderConfig
}

/**
 * SMTP Email Provider
 *
 * Uses nodemailer - works with ANY SMTP endpoint:
 * Gmail, Outlook, AWS SES, SendGrid SMTP, Mailgun, self-hosted, etc.
 */

import nodemailer from 'nodemailer'
import type { Transporter } from 'nodemailer'
import type {
  EmailProvider,
  EmailMessage,
  SendResult,
  BatchSendResult,
  SmtpConfig,
  EmailAddress,
} from '../types'

function formatAddress(addr: string | EmailAddress): string {
  if (typeof addr === 'string') return addr
  return addr.name ? `"${addr.name}" <${addr.email}>` : addr.email
}

function formatAddressList(
  addrs: string | EmailAddress | (string | EmailAddress)[],
): string {
  const list = Array.isArray(addrs) ? addrs : [addrs]
  return list.map(formatAddress).join(', ')
}

export class SmtpProvider implements EmailProvider {
  readonly name = 'smtp'
  private transporter: Transporter

  constructor(private config: SmtpConfig) {
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure ?? config.port === 465,
      auth: {
        user: config.auth.user,
        pass: config.auth.pass,
      },
      pool: config.pool ?? true,
      maxConnections: config.maxConnections ?? 5,
    } as any)
  }

  async send(message: EmailMessage): Promise<SendResult> {
    try {
      const headers: Record<string, string> = {
        'X-Mailer': 'GCET-Blog-Newsletter',
        'Precedence': 'bulk',
        ...(message.headers ?? {}),
      }

      if (message.listUnsubscribe) {
        headers['List-Unsubscribe'] = message.listUnsubscribe
      }
      if (message.listUnsubscribePost) {
        headers['List-Unsubscribe-Post'] = message.listUnsubscribePost
      }

      const info = await this.transporter.sendMail({
        from: message.from ? formatAddress(message.from) : undefined,
        to: formatAddressList(message.to),
        replyTo: message.replyTo ? formatAddress(message.replyTo) : undefined,
        subject: message.subject,
        html: message.html,
        text: message.text,
        headers,
      })

      return {
        success: true,
        messageId: info.messageId,
        provider: this.name,
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Unknown SMTP error'
      return {
        success: false,
        provider: this.name,
        error,
      }
    }
  }

  async sendBatch(messages: EmailMessage[]): Promise<BatchSendResult> {
    const results: SendResult[] = []
    let successful = 0
    let failed = 0

    // Process in chunks to respect connection pool limits
    const chunkSize = this.config.maxConnections ?? 5
    for (let i = 0; i < messages.length; i += chunkSize) {
      const chunk = messages.slice(i, i + chunkSize)
      const chunkResults = await Promise.allSettled(
        chunk.map((msg) => this.send(msg)),
      )

      for (const result of chunkResults) {
        if (result.status === 'fulfilled') {
          results.push(result.value)
          if (result.value.success) successful++
          else failed++
        } else {
          failed++
          results.push({
            success: false,
            provider: this.name,
            error: result.reason?.message ?? 'Unknown error',
          })
        }
      }
    }

    return { total: messages.length, successful, failed, results }
  }

  async verify(): Promise<boolean> {
    try {
      await this.transporter.verify()
      return true
    } catch {
      return false
    }
  }
}

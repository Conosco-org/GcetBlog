/**
 * Resend Email Provider
 *
 * Uses the Resend HTTP API - no SMTP needed.
 * https://resend.com
 */

import { Resend } from 'resend'
import type {
  EmailProvider,
  EmailMessage,
  SendResult,
  BatchSendResult,
  ResendConfig,
  EmailAddress,
} from '../types'

function formatAddress(addr: string | EmailAddress): string {
  if (typeof addr === 'string') return addr
  return addr.name ? `${addr.name} <${addr.email}>` : addr.email
}

function toStringArray(
  addrs: string | EmailAddress | (string | EmailAddress)[],
): string[] {
  const list = Array.isArray(addrs) ? addrs : [addrs]
  return list.map((a) => (typeof a === 'string' ? a : a.email))
}

export class ResendProvider implements EmailProvider {
  readonly name = 'resend'
  private client: Resend

  constructor(config: ResendConfig) {
    this.client = new Resend(config.apiKey)
  }

  async send(message: EmailMessage): Promise<SendResult> {
    try {
      const headers: Record<string, string> = {
        'X-Mailer': 'GCET-Blog-Newsletter',
        ...(message.headers ?? {}),
      }

      if (message.listUnsubscribe) {
        headers['List-Unsubscribe'] = message.listUnsubscribe
      }
      if (message.listUnsubscribePost) {
        headers['List-Unsubscribe-Post'] = message.listUnsubscribePost
      }

      const { data, error } = await this.client.emails.send({
        from: message.from ? formatAddress(message.from) : '',
        to: toStringArray(message.to),
        subject: message.subject,
        html: message.html,
        text: message.text,
        replyTo: message.replyTo
          ? typeof message.replyTo === 'string'
            ? message.replyTo
            : message.replyTo.email
          : undefined,
        headers,
        tags: message.tags?.map((t) => ({ name: t.name, value: t.value })),
      })

      if (error) {
        return {
          success: false,
          provider: this.name,
          error: error.message,
        }
      }

      return {
        success: true,
        messageId: data?.id,
        provider: this.name,
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Unknown Resend error'
      return {
        success: false,
        provider: this.name,
        error,
      }
    }
  }

  async sendBatch(messages: EmailMessage[]): Promise<BatchSendResult> {
    // Resend supports native batch - up to 100 per call
    const results: SendResult[] = []
    let successful = 0
    let failed = 0

    const chunkSize = 100
    for (let i = 0; i < messages.length; i += chunkSize) {
      const chunk = messages.slice(i, i + chunkSize)

      try {
        const batchPayload = chunk.map((msg) => ({
          from: msg.from ? formatAddress(msg.from) : '',
          to: toStringArray(msg.to),
          subject: msg.subject,
          html: msg.html,
          text: msg.text,
          headers: {
            'X-Mailer': 'GCET-Blog-Newsletter',
            ...(msg.headers ?? {}),
            ...(msg.listUnsubscribe
              ? { 'List-Unsubscribe': msg.listUnsubscribe }
              : {}),
            ...(msg.listUnsubscribePost
              ? { 'List-Unsubscribe-Post': msg.listUnsubscribePost }
              : {}),
          },
          tags: msg.tags?.map((t) => ({ name: t.name, value: t.value })),
        }))

        const { data, error } = await this.client.batch.send(batchPayload)

        if (error) {
          chunk.forEach(() => {
            failed++
            results.push({ success: false, provider: this.name, error: error.message })
          })
        } else if (data) {
          data.data.forEach((item) => {
            successful++
            results.push({ success: true, messageId: item.id, provider: this.name })
          })
        }
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : 'Unknown batch error'
        chunk.forEach(() => {
          failed++
          results.push({ success: false, provider: this.name, error: errMsg })
        })
      }
    }

    return { total: messages.length, successful, failed, results }
  }

  async verify(): Promise<boolean> {
    try {
      // Resend doesn't have a dedicated verify endpoint;
      // try listing API keys as a connectivity check
      await this.client.apiKeys.list()
      return true
    } catch {
      return false
    }
  }
}

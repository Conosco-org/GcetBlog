/**
 * Console Email Provider - Development Only
 *
 * Logs emails to stdout instead of sending them.
 * Zero external dependencies. Use with EMAIL_PROVIDER=console.
 */

import type {
  EmailProvider,
  EmailMessage,
  SendResult,
  BatchSendResult,
  EmailAddress,
} from '../types'

let counter = 0

function formatAddr(addr: string | EmailAddress): string {
  if (typeof addr === 'string') return addr
  return addr.name ? `${addr.name} <${addr.email}>` : addr.email
}

function recipientList(
  addrs: string | EmailAddress | (string | EmailAddress)[],
): string {
  const list = Array.isArray(addrs) ? addrs : [addrs]
  return list.map(formatAddr).join(', ')
}

export class ConsoleProvider implements EmailProvider {
  readonly name = 'console'

  async send(message: EmailMessage): Promise<SendResult> {
    counter++
    const id = `console-${Date.now()}-${counter}`

    console.log('\n' + '='.repeat(60))
    console.log('📧  EMAIL (console provider - not actually sent)')
    console.log('='.repeat(60))
    console.log(`  ID:      ${id}`)
    console.log(`  To:      ${recipientList(message.to)}`)
    console.log(`  From:    ${message.from ? formatAddr(message.from) : '(default)'}`)
    console.log(`  Subject: ${message.subject}`)
    if (message.replyTo) {
      console.log(`  ReplyTo: ${formatAddr(message.replyTo)}`)
    }
    if (message.listUnsubscribe) {
      console.log(`  List-Unsubscribe: ${message.listUnsubscribe}`)
    }
    if (message.tags?.length) {
      console.log(`  Tags:    ${message.tags.map((t) => `${t.name}=${t.value}`).join(', ')}`)
    }
    console.log(`  HTML:    ${message.html.length} chars`)
    if (message.text) {
      console.log(`  Text:    ${message.text.substring(0, 200)}...`)
    }
    console.log('='.repeat(60) + '\n')

    return {
      success: true,
      messageId: id,
      provider: this.name,
    }
  }

  async sendBatch(messages: EmailMessage[]): Promise<BatchSendResult> {
    console.log(`\n📬 [ConsoleProvider] Batch send: ${messages.length} emails\n`)

    const results: SendResult[] = []
    let successful = 0

    for (const msg of messages) {
      const result = await this.send(msg)
      results.push(result)
      if (result.success) successful++
    }

    return {
      total: messages.length,
      successful,
      failed: messages.length - successful,
      results,
    }
  }

  async verify(): Promise<boolean> {
    console.log('[ConsoleProvider] Verify: always returns true (dev mode)')
    return true
  }
}

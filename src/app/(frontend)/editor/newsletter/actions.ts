/**
 * Newsletter Server Actions
 *
 * All newsletter-related server actions for editors.
 * Includes CRUD operations, send operations, and subscriber management.
 */

'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { revalidatePath } from 'next/cache'

import { sendNewsletter, generateDigest } from '@/services/email/sender'
import { getEmailService } from '@/services/email'

export type ActionResult = {
  success: boolean
  message: string
  id?: string
}

/**
 * Create a new newsletter draft
 */
export async function createNewsletter(data: {
  title: string
  subject: string
  previewText?: string
  type: 'manual' | 'auto_digest'
  frequency?: 'daily' | 'weekly' | 'monthly'
  content?: Record<string, unknown>
  posts?: string[]
  targetCategories?: string[]
}): Promise<ActionResult> {
  try {
    const payload = await getPayload({ config: configPromise })

    // @ts-ignore - Payload RichText Lexical type is too strict for flexible server actions
    const newsletter = await payload.create({
      collection: 'newsletters',
      data: {
        title: data.title,
        subject: data.subject,
        previewText: data.previewText || '',
        type: data.type,
        frequency: data.frequency || 'weekly',
        status: 'draft',
        content: data.content,
        posts: data.posts || [],
        targetCategories: data.targetCategories || [],
      } as any,
    })

    revalidatePath('/editor/newsletter')
    return {
      success: true,
      message: 'Newsletter draft created successfully.',
      id: newsletter.id as string,
    }
  } catch (err) {
    console.error('[createNewsletter] Error:', err)
    return {
      success: false,
      message: 'Failed to create newsletter draft.',
    }
  }
}

/**
 * Update an existing newsletter
 */
export async function updateNewsletter(
  id: string,
  data: {
    title?: string
    subject?: string
    previewText?: string
    type?: 'manual' | 'auto_digest'
    frequency?: 'daily' | 'weekly' | 'monthly'
    content?: Record<string, unknown>
    posts?: string[]
    targetCategories?: string[]
  },
): Promise<ActionResult> {
  try {
    const payload = await getPayload({ config: configPromise })

    // @ts-ignore - Payload RichText Lexical type is too strict for flexible server actions
    await payload.update({
      collection: 'newsletters',
      id,
      data: data as any,
    })

    revalidatePath('/editor/newsletter')
    revalidatePath(`/editor/newsletter/${id}`)
    return {
      success: true,
      message: 'Newsletter updated successfully.',
    }
  } catch (err) {
    console.error('[updateNewsletter] Error:', err)
    return {
      success: false,
      message: 'Failed to update newsletter.',
    }
  }
}

/**
 * Delete a newsletter (only drafts)
 */
export async function deleteNewsletter(id: string): Promise<ActionResult> {
  try {
    const payload = await getPayload({ config: configPromise })

    // Check status first
    const newsletter = (await payload.findByID({
      collection: 'newsletters',
      id,
      depth: 0,
    })) as any

    if (newsletter.status !== 'draft') {
      return {
        success: false,
        message: 'Only draft newsletters can be deleted.',
      }
    }

    await payload.delete({
      collection: 'newsletters',
      id,
    })

    revalidatePath('/editor/newsletter')
    return {
      success: true,
      message: 'Newsletter deleted successfully.',
    }
  } catch (err) {
    console.error('[deleteNewsletter] Error:', err)
    return {
      success: false,
      message: 'Failed to delete newsletter.',
    }
  }
}

/**
 * Send a test email to specific recipients
 */
export async function sendTestNewsletter(
  id: string,
  testRecipients: string[],
): Promise<ActionResult> {
  try {
    if (testRecipients.length === 0) {
      return {
        success: false,
        message: 'No test recipients provided.',
      }
    }

    const payload = await getPayload({ config: configPromise })

    // Save test recipients to newsletter
    await payload.update({
      collection: 'newsletters',
      id,
      data: { testRecipients: testRecipients.join(',') },
    })

    // Send test emails (without recording events)
    const emailService = getEmailService()
    const newsletter = (await payload.findByID({
      collection: 'newsletters',
      id,
      depth: 1,
    })) as any

    for (const email of testRecipients) {
      // Simplified test send — just render and send without full tracking
      await emailService.send({
        to: email,
        subject: `[TEST] ${newsletter.subject}`,
        html: `<p>This is a test email for newsletter: <strong>${newsletter.title}</strong></p>`,
        text: `This is a test email for newsletter: ${newsletter.title}`,
      })
    }

    return {
      success: true,
      message: `Test email sent to ${testRecipients.length} recipient(s).`,
    }
  } catch (err) {
    console.error('[sendTestNewsletter] Error:', err)
    return {
      success: false,
      message: 'Failed to send test email.',
    }
  }
}

/**
 * Send a newsletter immediately
 */
export async function sendNewsletterNow(id: string): Promise<ActionResult> {
  try {
    const result = await sendNewsletter(id)

    if (!result.success) {
      return {
        success: false,
        message: result.errors?.[0] || 'Failed to send newsletter.',
      }
    }

    revalidatePath('/editor/newsletter')
    revalidatePath(`/editor/newsletter/${id}`)
    return {
      success: true,
      message: `Newsletter sent successfully to ${result.sent} subscribers.`,
    }
  } catch (err) {
    console.error('[sendNewsletterNow] Error:', err)
    return {
      success: false,
      message: 'Failed to send newsletter.',
    }
  }
}

/**
 * Schedule a newsletter for future send
 */
export async function scheduleNewsletter(
  id: string,
  scheduledFor: Date,
): Promise<ActionResult> {
  try {
    const payload = await getPayload({ config: configPromise })

    await payload.update({
      collection: 'newsletters',
      id,
      data: {
        status: 'scheduled',
        scheduledFor: scheduledFor.toISOString(),
      },
    })

    revalidatePath('/editor/newsletter')
    revalidatePath(`/editor/newsletter/${id}`)
    return {
      success: true,
      message: `Newsletter scheduled for ${scheduledFor.toLocaleString()}.`,
    }
  } catch (err) {
    console.error('[scheduleNewsletter] Error:', err)
    return {
      success: false,
      message: 'Failed to schedule newsletter.',
    }
  }
}

/**
 * Generate auto-digest and send immediately
 */
export async function generateAndSendDigest(
  frequency: 'daily' | 'weekly' | 'monthly',
): Promise<ActionResult> {
  try {
    const result = await generateDigest(frequency)

    if (!result.created) {
      return {
        success: true,
        message: `Digest not generated. Found ${result.postCount} posts but no requirements met.`,
      }
    }

    // Now send the generated newsletter
    if (result.newsletterId) {
      const sendResult = await sendNewsletter(result.newsletterId)
      if (!sendResult.success) {
        return {
          success: false,
          message: sendResult.errors?.[0] || 'Failed to send digest.',
        }
      }

      revalidatePath('/editor/newsletter')
      return {
        success: true,
        message: `Digest generated and sent to ${sendResult.sent} subscribers (${result.postCount} posts).`,
        id: result.newsletterId,
      }
    }

    return {
      success: false,
      message: 'Digest created but newsletter ID not returned.',
    }
  } catch (err) {
    console.error('[generateAndSendDigest] Error:', err)
    return {
      success: false,
      message: 'Failed to generate and send digest.',
    }
  }
}

/**
 * Export subscribers as CSV
 */
export async function exportSubscribers(filters?: {
  status?: string
  frequency?: string
}): Promise<{ success: boolean; csv?: string; message: string }> {
  try {
    const payload = await getPayload({ config: configPromise })

    const where: Record<string, { equals: string }> = {}
    if (filters?.status) where.status = { equals: filters.status }
    if (filters?.frequency) where.frequency = { equals: filters.frequency }

    const subscribers = await payload.find({
      collection: 'newsletter-subscribers',
      where,
      limit: 10000,
      depth: 0,
    })

    // Generate CSV
    const headers = ['Email', 'Name', 'Status', 'Source', 'Frequency', 'Subscribed At', 'Confirmed At']
    const rows = subscribers.docs.map((sub) => [
      sub.email,
      sub.name || '',
      sub.status || 'pending',
      sub.source || '',
      sub.frequency || 'weekly',
      new Date(sub.createdAt).toISOString(),
      sub.confirmedAt ? new Date(sub.confirmedAt).toISOString() : '',
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n')

    return {
      success: true,
      csv: csvContent,
      message: `Exported ${subscribers.docs.length} subscribers.`,
    }
  } catch (err) {
    console.error('[exportSubscribers] Error:', err)
    return {
      success: false,
      message: 'Failed to export subscribers.',
    }
  }
}

/**
 * Import subscribers from CSV
 */
export async function importSubscribers(csvContent: string): Promise<ActionResult> {
  try {
    const payload = await getPayload({ config: configPromise })

    const lines = csvContent.trim().split('\n')
    if (lines.length < 2) {
      return {
        success: false,
        message: 'CSV file is empty or invalid.',
      }
    }

    // Skip header row
    const dataLines = lines.slice(1)
    let imported = 0
    let skipped = 0

    for (const line of dataLines) {
      const [email, name] = line.split(',').map((cell) => cell.replace(/"/g, '').trim())

      if (!email || !email.includes('@')) {
        skipped++
        continue
      }

      // Check if already exists
      const existing = await payload.find({
        collection: 'newsletter-subscribers',
        where: { email: { equals: email } },
        limit: 1,
      })

      if (existing.docs.length > 0) {
        skipped++
        continue
      }

      // Create subscriber
      await payload.create({
        collection: 'newsletter-subscribers',
        data: {
          email,
          name: name || undefined,
          status: 'active', // Imported subscribers are auto-confirmed
          source: 'admin_import',
          frequency: 'weekly',
        },
      })

      imported++
    }

    revalidatePath('/editor/newsletter/subscribers')
    return {
      success: true,
      message: `Imported ${imported} subscribers. Skipped ${skipped} (duplicates or invalid).`,
    }
  } catch (err) {
    console.error('[importSubscribers] Error:', err)
    return {
      success: false,
      message: 'Failed to import subscribers.',
    }
  }
}

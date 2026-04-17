/**
 * Newsletter Unsubscribe API
 *
 * POST /api/newsletter/unsubscribe
 * Supports RFC 8058 one-click unsubscribe (required by Gmail/Yahoo since Feb 2024)
 *
 * Body: { token } or form-encoded List-Unsubscribe=One-Click
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { sendUnsubscribeConfirmation } from '@backend/lib/email/sender'

export async function POST(request: NextRequest) {
  try {
    let token: string | null = null

    const contentType = request.headers.get('content-type') ?? ''

    if (contentType.includes('application/x-www-form-urlencoded')) {
      // RFC 8058 one-click unsubscribe
      const formData = await request.formData()
      // Token should be in the URL for one-click
      token = request.nextUrl.searchParams.get('token')
      // Check if it's the standard one-click format
      const listUnsub = formData.get('List-Unsubscribe')
      if (listUnsub === 'One-Click' && !token) {
        return NextResponse.json(
          { success: false, message: 'Missing token' },
          { status: 400 },
        )
      }
    } else {
      const body = await request.json()
      token = body.token
    }

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unsubscribe token is required.' },
        { status: 400 },
      )
    }

    const payload = await getPayload({ config: configPromise })

    const result = await payload.find({
      collection: 'newsletter-subscribers',
      where: { unsubscribeToken: { equals: token } },
      limit: 1,
      depth: 0,
    })

    if (result.docs.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token.' },
        { status: 404 },
      )
    }

    const subscriber = result.docs[0]

    await payload.update({
      collection: 'newsletter-subscribers',
      id: subscriber.id as string,
      data: {
        status: 'unsubscribed',
        unsubscribedAt: new Date().toISOString(),
      },
    })

    // Send unsubscribe confirmation email
    await sendUnsubscribeConfirmation(
      subscriber.email,
      subscriber.name,
      subscriber.unsubscribeToken as string,
    ).catch((err) => console.error('[Unsubscribe] Failed to send confirmation:', err))

    return NextResponse.json({
      success: true,
      message: 'You have been unsubscribed successfully.',
    })
  } catch (err) {
    console.error('[Unsubscribe API] Error:', err)
    return NextResponse.json(
      { success: false, message: 'Something went wrong.' },
      { status: 500 },
    )
  }
}

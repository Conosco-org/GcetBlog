import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, type FinalizeTicket } from '@/utilities/oauthState'

/**
 * Google OAuth — Step 3: Finalize session on the institution domain
 * GET /api/auth/google/finalize?ticket=...
 *
 * This route runs on the INSTITUTION domain (e.g., digital.gcet.edu.in).
 * It receives a short-lived signed ticket from the platform callback,
 * verifies it, sets the auth cookie on this domain, then redirects the
 * user to their dashboard.
 *
 * The ticket is valid for 60 seconds. After that it is useless even if
 * someone extracts it from browser history or logs.
 */
export async function GET(request: NextRequest) {
  const ticketParam = request.nextUrl.searchParams.get('ticket')

  if (!ticketParam) {
    return NextResponse.redirect(
      new URL('/login?message=Missing+session+ticket', request.url),
    )
  }

  // Verify HMAC signature and 60-second TTL
  const ticket = verifyToken<FinalizeTicket>(ticketParam, ':finalize', 60)

  if (!ticket) {
    return NextResponse.redirect(
      new URL(
        '/login?message=Session+ticket+expired+or+invalid.+Please+sign+in+again.',
        request.url,
      ),
    )
  }

  const { payloadToken, redirectPath } = ticket

  // Redirect to the dashboard — the browser follows and lands on a clean URL
  // (ticket param is not present on the final page)
  const response = NextResponse.redirect(new URL(redirectPath, request.url))

  // Set the Payload auth cookie on this institution domain
  response.cookies.set('payload-token', payloadToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days — matches loginAction
  })

  return response
}

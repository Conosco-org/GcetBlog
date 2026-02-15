/**
 * Email Tracking Utilities
 *
 * Link wrapping for click tracking and tracking pixel injection for open tracking.
 * All links in newsletter HTML are rewritten to route through our tracking API.
 */

import { getServerSideURL } from '@/utilities/getURL'

// ---------------------------------------------------------------------------
// Link wrapping (click tracking)
// ---------------------------------------------------------------------------

/**
 * Rewrites all `<a href="...">` links in the HTML to route through
 * the click-tracking endpoint, preserving the original URL as a parameter.
 *
 * Skips:
 * - Unsubscribe links (already tracked separately)
 * - Mailto links
 * - Anchor links (#)
 */
export function wrapLinksForTracking(
  html: string,
  newsletterId: string,
  subscriberId: string,
): string {
  const baseUrl = getServerSideURL()
  const trackBase = `${baseUrl}/api/newsletter/track/click`

  // Match href attributes in anchor tags
  return html.replace(
    /<a\s+([^>]*?)href=["']([^"']+)["']([^>]*?)>/gi,
    (match, before: string, url: string, after: string) => {
      // Skip special links
      if (
        url.startsWith('mailto:') ||
        url.startsWith('#') ||
        url.includes('/newsletter/unsubscribe') ||
        url.includes('/newsletter/preferences') ||
        url.includes('/api/newsletter/track/')
      ) {
        return match
      }

      const trackUrl = `${trackBase}?nid=${encodeURIComponent(newsletterId)}&sid=${encodeURIComponent(subscriberId)}&url=${encodeURIComponent(url)}`
      return `<a ${before}href="${trackUrl}"${after}>`
    },
  )
}

// ---------------------------------------------------------------------------
// Tracking pixel (open tracking)
// ---------------------------------------------------------------------------

/**
 * Injects a 1x1 transparent tracking pixel before the closing `</body>` tag.
 * When the recipient's email client loads the image, we record an "opened" event.
 */
export function injectTrackingPixel(
  html: string,
  newsletterId: string,
  subscriberId: string,
): string {
  const baseUrl = getServerSideURL()
  const pixelUrl = `${baseUrl}/api/newsletter/track/open?nid=${encodeURIComponent(newsletterId)}&sid=${encodeURIComponent(subscriberId)}`

  const pixel = `<img src="${pixelUrl}" width="1" height="1" alt="" style="display:block;width:1px;height:1px;border:0;" />`

  // Insert before </body> if it exists, otherwise append
  if (html.includes('</body>')) {
    return html.replace('</body>', `${pixel}</body>`)
  }
  return html + pixel
}

// ---------------------------------------------------------------------------
// Combined: prepare final email HTML for send
// ---------------------------------------------------------------------------

export function prepareEmailForSend(
  html: string,
  newsletterId: string,
  subscriberId: string,
): string {
  let prepared = wrapLinksForTracking(html, newsletterId, subscriberId)
  prepared = injectTrackingPixel(prepared, newsletterId, subscriberId)
  return prepared
}

// ---------------------------------------------------------------------------
// Compliance headers helper
// ---------------------------------------------------------------------------

export function getComplianceHeaders(unsubscribeUrl: string): Record<string, string> {
  return {
    'List-Unsubscribe': `<${unsubscribeUrl}>`,
    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    'Precedence': 'bulk',
    'X-Mailer': 'GCET-Blog-Newsletter',
  }
}

/**
 * Build subscriber-specific URLs for unsubscribe/preferences.
 */
export function getSubscriberUrls(unsubscribeToken: string) {
  const baseUrl = getServerSideURL()
  return {
    unsubscribeUrl: `${baseUrl}/newsletter/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}`,
    preferencesUrl: `${baseUrl}/newsletter/preferences?token=${encodeURIComponent(unsubscribeToken)}`,
    confirmUrl: `${baseUrl}/newsletter/confirm?token=${encodeURIComponent(unsubscribeToken)}`,
    resubscribeUrl: `${baseUrl}/newsletter/subscribe?resubscribe=${encodeURIComponent(unsubscribeToken)}`,
  }
}

'use client'

import { useEffect } from 'react'

export function PayloadBlocker() {
  useEffect(() => {
    // Function to remove all Payload admin elements
    const removePayloadElements = () => {
      const selectors = [
        '[data-payload-admin-bar]',
        '#payload-admin-bar',
        '.payload-admin-bar',
        'header[class*="payload"]',
        'nav[class*="payload"]',
        'div[class*="admin-bar"]',
        '[id*="payload-admin"]',
        // Target the specific Payload header structure
        'header:has(a[href="/admin"])',
        'nav:has(a[href="/admin/collections/posts"])',
      ]

      selectors.forEach((selector) => {
        const elements = document.querySelectorAll(selector)
        elements.forEach((el) => {
          el.remove()
        })
      })

      // Also remove any header that contains "Payload" text or logout button
      const allHeaders = document.querySelectorAll('header')
      allHeaders.forEach((header) => {
        const text = header.textContent || ''
        if (
          text.includes('Payload') ||
          text.includes('Logout') ||
          header.querySelector('a[href*="/admin"]')
        ) {
          // Check if it's not our contributor header
          if (!header.classList.toString().includes('contributor')) {
            header.remove()
          }
        }
      })
    }

    // Run immediately
    removePayloadElements()

    // Run on interval to catch dynamically added elements
    const interval = setInterval(removePayloadElements, 100)

    // Watch for DOM changes
    const observer = new MutationObserver(removePayloadElements)
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })

    return () => {
      clearInterval(interval)
      observer.disconnect()
    }
  }, [])

  return null
}

'use client'

import { useEffect } from 'react'

interface InstagramWindow extends Window {
  instgrm?: {
    Embeds: {
      process: () => void
    }
  }
}

export function InstagramEmbedLoader() {
  useEffect(() => {
    // Load Instagram embed script if not already loaded
    if (typeof window !== 'undefined' && !(window as InstagramWindow).instgrm) {
      const script = document.createElement('script')
      script.src = 'https://www.instagram.com/embed.js'
      script.async = true
      document.body.appendChild(script)

      script.onload = () => {
        if ((window as InstagramWindow).instgrm) {
          (window as InstagramWindow).instgrm?.Embeds.process()
        }
      }
    } else if ((window as InstagramWindow).instgrm) {
      // Script already loaded, just process embeds
      ;(window as InstagramWindow).instgrm?.Embeds.process()
    }
  }, [])

  return null
}

'use client'

import { useEffect } from 'react'

export function InstagramEmbedLoader() {
  useEffect(() => {
    // Load Instagram embed script if not already loaded
    if (typeof window !== 'undefined' && !(window as any).instgrm) {
      const script = document.createElement('script')
      script.src = 'https://www.instagram.com/embed.js'
      script.async = true
      document.body.appendChild(script)

      script.onload = () => {
        if ((window as any).instgrm) {
          (window as any).instgrm.Embeds.process()
        }
      }
    } else if ((window as any).instgrm) {
      // Script already loaded, just process embeds
      ;(window as any).instgrm.Embeds.process()
    }
  }, [])

  return null
}

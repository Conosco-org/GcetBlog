'use client'

/**
 * Newsletter Signup Component
 *
 * Public newsletter subscription form.
 * Can be embedded in footer, landing pages, etc.
 */

import { useState, useTransition } from 'react'
import { Mail, CheckCircle, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface NewsletterSignupProps {
  className?: string
  variant?: 'default' | 'inline' | 'compact'
}

export function NewsletterSignup({ className = '', variant = 'default' }: NewsletterSignupProps) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    startTransition(async () => {
      try {
        const res = await fetch('/api/newsletter/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim(), name: name.trim() || undefined }),
        })

        if (res.ok) {
          setSubmitted(true)
          setEmail('')
          setName('')
        }
      } catch (err) {
        console.error('Subscription failed:', err)
      }
    })
  }

  if (submitted) {
    return (
      <div className={`flex items-center gap-2 text-sm ${className}`}>
        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" />
        <p className="text-background/70">
          Check your email to confirm your subscription!
        </p>
      </div>
    )
  }

  if (variant === 'inline') {
    // Single row: email + button
    return (
      <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
        <Input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isPending}
          className="bg-background text-foreground border-background/20"
        />
        <Button type="submit" disabled={isPending} className="shrink-0">
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Subscribe'}
        </Button>
      </form>
    )
  }

  if (variant === 'compact') {
    // Compact: email only, no name
    return (
      <form onSubmit={handleSubmit} className={`space-y-3 ${className}`}>
        <div className="flex gap-2">
          <Input
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isPending}
            className="bg-background text-foreground border-background/20"
          />
          <Button type="submit" disabled={isPending} className="shrink-0">
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
          </Button>
        </div>
        <p className="text-xs text-background/50">
          We&apos;ll send a confirmation email. No spam, promise.
        </p>
      </form>
    )
  }

  // Default variant: email + name (optional), two-column on desktop
  return (
    <form onSubmit={handleSubmit} className={`space-y-3 ${className}`}>
      <div className="grid md:grid-cols-2 gap-2">
        <Input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isPending}
          className="bg-background text-foreground border-background/20"
        />
        <Input
          type="text"
          placeholder="Your name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isPending}
          className="bg-background text-foreground border-background/20"
        />
      </div>
      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Subscribing...
          </>
        ) : (
          <>
            <Mail className="w-4 h-4 mr-2" />
            Subscribe to Newsletter
          </>
        )}
      </Button>
      <p className="text-xs text-background/50">
        Stay updated with the latest from GCET. We&apos;ll send a confirmation email.
      </p>
    </form>
  )
}

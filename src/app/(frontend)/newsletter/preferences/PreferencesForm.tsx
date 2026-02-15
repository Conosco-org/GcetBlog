'use client'

/**
 * Newsletter Preferences Form (Client Component)
 *
 * Allows subscribers to update category preferences and digest frequency.
 */

import { useState, useTransition } from 'react'
import { Settings, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

interface PreferencesFormProps {
  token: string
  email: string
  currentFrequency: string
  currentCategoryIds: string[]
  availableCategories: { id: string; title: string }[]
}

export function PreferencesForm({
  token,
  email,
  currentFrequency,
  currentCategoryIds,
  availableCategories,
}: PreferencesFormProps) {
  const [frequency, setFrequency] = useState(currentFrequency)
  const [selectedCategories, setSelectedCategories] = useState<string[]>(currentCategoryIds)
  const [saved, setSaved] = useState(false)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const toggleCategory = (catId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId],
    )
  }

  const handleSave = () => {
    startTransition(async () => {
      try {
        const res = await fetch('/api/newsletter/preferences', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token,
            frequency,
            categories: selectedCategories,
          }),
        })

        const data = await res.json()
        if (data.success) {
          setSaved(true)
          toast({ title: 'Preferences saved', description: 'Your newsletter preferences have been updated.' })
        } else {
          toast({ title: 'Error', description: data.message ?? 'Failed to save.', variant: 'destructive' })
        }
      } catch {
        toast({ title: 'Error', description: 'Something went wrong.', variant: 'destructive' })
      }
    })
  }

  if (saved) {
    return (
      <Card>
        <CardContent className="py-12 text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-xl font-bold">Preferences Updated!</h2>
          <p className="text-muted-foreground text-sm">
            Your newsletter preferences have been saved. You&apos;ll receive emails
            based on your new settings.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          <CardTitle>Newsletter Preferences</CardTitle>
        </div>
        <CardDescription>
          Manage your subscription settings for <strong>{email}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Frequency */}
        <div>
          <label className="text-sm font-medium mb-3 block">Digest Frequency</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'daily', label: 'Daily' },
              { value: 'weekly', label: 'Weekly' },
              { value: 'monthly', label: 'Monthly' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setFrequency(option.value)}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition ${
                  frequency === option.value
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background hover:bg-accent border-border'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Categories */}
        {availableCategories.length > 0 && (
          <div>
            <label className="text-sm font-medium mb-3 block">
              Content Categories
              <span className="text-muted-foreground font-normal ml-1">
                (leave empty for all)
              </span>
            </label>
            <div className="flex flex-wrap gap-2">
              {availableCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => toggleCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition border ${
                    selectedCategories.includes(cat.id)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background hover:bg-accent border-border'
                  }`}
                >
                  {cat.title}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Save */}
        <Button onClick={handleSave} disabled={isPending} className="w-full">
          {isPending ? 'Saving...' : 'Save Preferences'}
        </Button>
      </CardContent>
    </Card>
  )
}

'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, FileStack, FileText } from 'lucide-react'
import { cn } from '@/utilities/ui'
import { TemplateCard, type TemplateCardData } from './TemplateCard'
import { TemplatePreview } from './TemplatePreview'

const CATEGORIES = [
  { label: 'All', value: '' },
  { label: 'Academic', value: 'academic' },
  { label: 'General', value: 'general' },
  { label: 'Editorial', value: 'editorial' },
  { label: 'News', value: 'news' },
]

interface TemplateSelectorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** 'editor' or 'contributor' - filters audience accordingly */
  userRole: 'editor' | 'contributor'
  /** Optional: pre-filter by content type (used in contributor flow) */
  contentType?: string
  /** Called when user selects a template */
  onSelect: (template: TemplateCardData) => void
  /** Called when user chooses to start blank */
  onStartBlank?: () => void
}

export function TemplateSelector({
  open,
  onOpenChange,
  userRole,
  contentType,
  onSelect,
  onStartBlank,
}: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<TemplateCardData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [previewTemplate, setPreviewTemplate] = useState<TemplateCardData | null>(null)

  const fetchTemplates = useCallback(async () => {
    setIsLoading(true)
    try {
      // Build query params for Payload REST API
      const params = new URLSearchParams()
      params.set('limit', '50')
      params.set('sort', '-usageCount')

      // Audience filter: show 'all' + role-specific templates
      const audienceValues =
        userRole === 'editor'
          ? ['all', 'editor_only']
          : ['all', 'contributor_only']

      // We'll use Payload's where query syntax
      const whereConditions: Record<string, unknown> = {
        and: [
          { or: audienceValues.map((v) => ({ audience: { equals: v } })) },
          { status: { equals: 'published' } },
        ],
      }

      if (contentType) {
        whereConditions['contentType'] = { equals: contentType }
      }

      params.set('where', JSON.stringify(whereConditions))

      const res = await fetch(`/api/templates?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch templates')
      const data = await res.json()

      const docs: TemplateCardData[] = (data.docs || []).map(
        (doc: Record<string, unknown>) => ({
          id: doc.id as string,
          name: doc.name as string,
          description: doc.description as string | null,
          category: doc.category as string,
          contentType: doc.contentType as string | null,
          audience: doc.audience as string,
          icon: doc.icon as string | null,
          usageCount: doc.usageCount as number | null,
          content: doc.content as string,
          suggestedTitle: doc.suggestedTitle as string | null,
          suggestedTags: doc.suggestedTags as string[] | null,
        })
      )

      setTemplates(docs)
    } catch (err) {
      console.error('Error loading templates:', err)
      setTemplates([])
    } finally {
      setIsLoading(false)
    }
  }, [userRole, contentType])

  useEffect(() => {
    if (open) {
      fetchTemplates()
      setSearch('')
      setSelectedCategory('')
      setPreviewTemplate(null)
    }
  }, [open, fetchTemplates])

  // Filter templates client-side by search and category
  const filtered = templates.filter((t) => {
    if (selectedCategory && t.category !== selectedCategory) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        t.name.toLowerCase().includes(q) ||
        (t.description?.toLowerCase().includes(q) ?? false) ||
        t.category.toLowerCase().includes(q)
      )
    }
    return true
  })

  const handleUseTemplate = async (template: TemplateCardData) => {
    // Increment usage count in background
    try {
      await fetch(`/api/templates/${template.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usageCount: (template.usageCount || 0) + 1,
        }),
      })
    } catch {
      // Non-critical - don't block the user
    }

    onSelect(template)
    onOpenChange(false)
  }

  const handleStartBlank = () => {
    onStartBlank?.()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] p-0 gap-0 flex flex-col overflow-hidden">
        {previewTemplate ? (
          // Preview mode
          <TemplatePreview
            template={previewTemplate}
            onUse={handleUseTemplate}
            onBack={() => setPreviewTemplate(null)}
          />
        ) : (
          // Browse mode
          <>
            <DialogHeader className="px-6 pt-6 pb-4 border-b space-y-4">
              <div>
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <FileStack className="w-5 h-5 text-primary" />
                  Choose a Template
                </DialogTitle>
                <DialogDescription className="mt-1">
                  Start with a pre-built structure to speed up your writing
                </DialogDescription>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search templates..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Category tabs */}
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <Badge
                    key={cat.value}
                    variant={selectedCategory === cat.value ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setSelectedCategory(cat.value)}
                  >
                    {cat.label}
                  </Badge>
                ))}
              </div>
            </DialogHeader>

            {/* Templates grid */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Start Blank option */}
              <button
                onClick={handleStartBlank}
                className="w-full mb-4 flex items-center gap-3 p-4 rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50 transition-all text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Start Blank</p>
                  <p className="text-xs text-muted-foreground">
                    Begin with an empty editor
                  </p>
                </div>
              </button>

              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="p-4 border rounded-lg">
                      <div className="flex gap-3">
                        <Skeleton className="w-10 h-10 rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-full" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-12">
                  <FileStack className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="font-medium text-muted-foreground">No templates found</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {search
                      ? 'Try a different search term'
                      : 'No templates available for this category'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filtered.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onClick={setPreviewTemplate}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t px-6 py-3 flex items-center justify-between bg-muted/30">
              <p className="text-xs text-muted-foreground">
                {filtered.length} template{filtered.length !== 1 ? 's' : ''} available
              </p>
              <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

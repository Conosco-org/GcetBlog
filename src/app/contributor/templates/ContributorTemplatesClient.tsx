'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Search,
  FileStack,
  PlusCircle,
  Eye,
  ArrowRight,
  TrendingUp,
  LayoutTemplate,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/utilities/ui'
import {
  getTemplateIcon,
  categoryColors,
  audienceLabels,
} from '@/components/templates/templateUtils'

/* ── Types ─────────────────────────────────────────────────────── */

interface TemplateData {
  id: string
  name: string
  description: string | null
  category: string
  contentType: string | null
  audience: string
  icon: string | null
  usageCount: number
  content: string
  suggestedTitle: string | null
  suggestedTags: string[] | null
}

interface ContributorTemplatesClientProps {
  templates: TemplateData[]
  query: string
  category: string
}

/* ── Constants ─────────────────────────────────────────────────── */

const CATEGORIES = [
  { label: 'All', value: '' },
  { label: 'Academic', value: 'academic' },
  { label: 'General', value: 'general' },
  { label: 'News', value: 'news' },
]

/* ── Component ─────────────────────────────────────────────────── */

export function ContributorTemplatesClient({
  templates,
  query: initialQuery,
  category: initialCategory,
}: ContributorTemplatesClientProps) {
  const router = useRouter()
  const [search, setSearch] = useState(initialQuery)
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [previewTemplate, setPreviewTemplate] = useState<TemplateData | null>(null)

  const filtered = templates.filter((t) => {
    if (selectedCategory && t.category !== selectedCategory) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        t.name.toLowerCase().includes(q) ||
        (t.description?.toLowerCase().includes(q) ?? false)
      )
    }
    return true
  })

  const handleUseTemplate = (template: TemplateData) => {
    router.push(`/contributor/create?template=${template.id}`)
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* ── Preview Dialog ─────────────────────────────────────── */}
      <Dialog open={!!previewTemplate} onOpenChange={(open) => !open && setPreviewTemplate(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          {previewTemplate && (() => {
            const Icon = getTemplateIcon(previewTemplate.icon)
            return (
              <>
                <DialogHeader className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <DialogTitle className="text-xl leading-tight">
                        {previewTemplate.name}
                      </DialogTitle>
                      <DialogDescription className="mt-1">
                        {previewTemplate.description || 'Template preview'}
                      </DialogDescription>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={cn('text-xs', categoryColors[previewTemplate.category])}>
                      {previewTemplate.category}
                    </Badge>
                    {previewTemplate.contentType && (
                      <Badge variant="outline" className="text-xs">
                        {previewTemplate.contentType}
                      </Badge>
                    )}
                  </div>
                </DialogHeader>

                {previewTemplate.suggestedTitle && (
                  <div className="rounded-lg bg-muted/50 px-4 py-3 text-sm mt-2">
                    <span className="font-medium text-foreground">Suggested title: </span>
                    <span className="text-muted-foreground">{previewTemplate.suggestedTitle}</span>
                  </div>
                )}

                {previewTemplate.suggestedTags && previewTemplate.suggestedTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {previewTemplate.suggestedTags.map((tag) => (
                      <span key={tag} className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <Separator className="my-2" />

                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: previewTemplate.content }} />
                </div>

                <Separator className="my-2" />

                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Used {previewTemplate.usageCount} times
                  </span>
                  <Button onClick={() => handleUseTemplate(previewTemplate)} className="gap-1.5 shadow-sm">
                    Use This Template
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </>
            )
          })()}
        </DialogContent>
      </Dialog>

      {/* ── Page container ─────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ── Header ────────────────────────────────────────────── */}
        <div className="mb-8">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <LayoutTemplate className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Templates</h1>
          </div>
          <p className="text-muted-foreground text-sm ml-[46px]">
            Browse pre-built templates to kickstart your writing
          </p>
        </div>

        {/* ── Search & Filters ──────────────────────────────────── */}
        <div className="bg-background rounded-xl border shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search templates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-muted/40 border-transparent focus:border-border focus:bg-background transition-colors"
              />
            </div>
            <div className="flex gap-1.5 flex-wrap items-center">
              {CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat.value
                return (
                  <button
                    key={cat.value}
                    onClick={() => setSelectedCategory(cat.value)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap',
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    {cat.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── Start Blank CTA ──────────────────────────────────── */}
        <button
          onClick={() => router.push('/contributor/create')}
          className="w-full mb-6 flex items-center gap-4 p-4 rounded-xl border bg-background shadow-sm hover:border-primary/40 hover:shadow-md transition-all text-left group"
        >
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center shrink-0 border border-primary/20 group-hover:from-primary/20 group-hover:to-primary/10 transition-colors">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">Start from Scratch</p>
            <p className="text-xs text-muted-foreground">
              Open the editor with a blank canvas — write freely without any structure
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
        </button>

        {/* ── Templates Grid ───────────────────────────────────── */}
        {filtered.length === 0 ? (
          <div className="bg-background rounded-xl border shadow-sm p-16 text-center">
            <div className="inline-flex w-16 h-16 rounded-2xl bg-muted items-center justify-center mb-4">
              <FileStack className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <h3 className="font-semibold text-lg mb-1">No templates found</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              {search
                ? 'Try a different search term or category.'
                : 'No templates are available yet. Check back later!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((template) => {
              const Icon = getTemplateIcon(template.icon)
              const catColor = categoryColors[template.category] || ''

              return (
                <Card
                  key={template.id}
                  className="group relative overflow-hidden transition-all duration-200 hover:shadow-md hover:border-primary/30 cursor-pointer"
                  onClick={() => setPreviewTemplate(template)}
                >
                  <CardContent className="p-0">
                    {/* Top color accent */}
                    <div className={cn(
                      'h-1 w-full',
                      template.category === 'academic' && 'bg-blue-500',
                      template.category === 'general' && 'bg-green-500',
                      template.category === 'editorial' && 'bg-purple-500',
                      template.category === 'news' && 'bg-orange-500',
                    )} />

                    <div className="p-5">
                      {/* Header */}
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center shrink-0 border border-border/50">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm leading-snug line-clamp-1">
                            {template.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              variant="secondary"
                              className={cn('text-[10px] px-1.5 py-0 leading-relaxed font-medium', catColor)}
                            >
                              {template.category}
                            </Badge>
                            {template.usageCount > 0 && (
                              <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                                <TrendingUp className="w-2.5 h-2.5" />
                                {template.usageCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      {template.description && (
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-4">
                          {template.description}
                        </p>
                      )}

                      {/* Tags */}
                      {template.suggestedTags && template.suggestedTags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {template.suggestedTags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full"
                            >
                              #{tag}
                            </span>
                          ))}
                          {template.suggestedTags.length > 3 && (
                            <span className="text-[10px] text-muted-foreground">
                              +{template.suggestedTags.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      <Separator className="mb-3" />

                      {/* Actions */}
                      <div className="flex items-center justify-between">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2.5 text-xs text-muted-foreground hover:text-primary gap-1"
                          onClick={(e) => {
                            e.stopPropagation()
                            setPreviewTemplate(template)
                          }}
                        >
                          <Eye className="w-3 h-3" /> Preview
                        </Button>
                        <Button
                          size="sm"
                          className="h-7 px-3 text-xs gap-1 shadow-sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleUseTemplate(template)
                          }}
                        >
                          Use Template <ArrowRight className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

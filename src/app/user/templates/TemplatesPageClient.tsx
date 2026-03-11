'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
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
  Plus,
  Eye,
  Pencil,
  Trash2,
  FileStack,
  ChevronLeft,
  ChevronRight,
  Loader2,
  LayoutTemplate,
  TrendingUp,
  Clock,
  ArrowUpRight,
  ArrowRight,
  X,
} from 'lucide-react'
import { cn } from '@/utilities/ui'
import {
  getTemplateIcon,
  categoryColors,
  audienceLabels,
} from '@/components/templates/templateUtils'
import { useToast } from '@/hooks/use-toast'

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
  status: 'draft' | 'published'
  createdAt: string
  updatedAt: string
}

interface Props {
  templates: TemplateData[]
  totalPages: number
  currentPage: number
  totalDocs: number
  query: string
  category: string
}

/* ── Constants ─────────────────────────────────────────────────── */

const CATEGORIES = [
  { label: 'All Templates', value: '' },
  { label: 'Academic', value: 'academic' },
  { label: 'General', value: 'general' },
  { label: 'Editorial', value: 'editorial' },
  { label: 'News', value: 'news' },
]

/* ── Component ─────────────────────────────────────────────────── */

export function TemplatesPageClient({
  templates,
  totalPages,
  currentPage,
  totalDocs,
  query,
  category,
}: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const [search, setSearch] = useState(query)
  const [previewTemplate, setPreviewTemplate] = useState<TemplateData | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [_isDeleting, startDeleteTransition] = useTransition()

  /* ── URL helpers ────────────────────────────────────────────── */
  const updateParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([key, val]) => {
      if (val) params.set(key, val)
      else params.delete(key)
    })
    // Reset to page 1 when changing filters
    if ('q' in updates || 'category' in updates) params.delete('page')
    router.push(`/user/templates?${params.toString()}`)
  }

  const handleSearch = () => updateParams({ q: search })
  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch()
  }

  /* ── Delete ─────────────────────────────────────────────────── */
  const handleDelete = (template: TemplateData) => {
    setDeletingId(template.id)
    startDeleteTransition(async () => {
      try {
        const res = await fetch(`/api/templates/${template.id}`, { method: 'DELETE' })
        if (!res.ok) throw new Error('Delete failed')
        toast({ title: 'Deleted', description: `"${template.name}" has been removed.` })
        router.refresh()
      } catch {
        toast({ title: 'Error', description: 'Could not delete template.', variant: 'destructive' })
      } finally {
        setDeletingId(null)
      }
    })
  }

  /* ── Render ─────────────────────────────────────────────────── */
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
                    {previewTemplate.status === 'draft' && (
                      <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                        Draft
                      </Badge>
                    )}
                    {previewTemplate.status === 'published' && (
                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                        Published
                      </Badge>
                    )}
                    <Badge className={cn('text-xs', categoryColors[previewTemplate.category])}>
                      {previewTemplate.category}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {audienceLabels[previewTemplate.audience] || previewTemplate.audience}
                    </Badge>
                    {previewTemplate.contentType && (
                      <Badge variant="outline" className="text-xs">{previewTemplate.contentType}</Badge>
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
                  <div className="flex gap-2">
                    <Link href={`/user/templates/${previewTemplate.id}/edit`}>
                      <Button variant="outline" size="sm" title="Edit" aria-label="Edit">
                        <Pencil className="w-3.5 h-3.5 sm:mr-1.5" /> <span className="hidden sm:inline">Edit</span>
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      title="Use Template"
                      aria-label="Use Template"
                      onClick={() => {
                        router.push(`/user/posts/create?template=${previewTemplate.id}`)
                        setPreviewTemplate(null)
                      }}
                    >
                      <span className="hidden sm:inline">Use Template</span> <ArrowUpRight className="w-3.5 h-3.5 sm:ml-1.5" />
                    </Button>
                  </div>
                </div>
              </>
            )
          })()}
        </DialogContent>
      </Dialog>

      {/* ── Page container ─────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ── Header ────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <LayoutTemplate className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Templates</h1>
            </div>
            <p className="text-muted-foreground text-sm ml-[46px]">
              {totalDocs} template{totalDocs !== 1 ? 's' : ''} - Create, edit, or preview reusable post structures.
            </p>
          </div>
          <Link href="/user/templates/create">
            <Button className="gap-1.5 shadow-sm" title="New Template" aria-label="New Template">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Template</span>
            </Button>
          </Link>
        </div>

        {/* ── Search & Filters ──────────────────────────────────── */}
        <div className="bg-background rounded-xl border shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search by name or description..."
                className="pl-9 bg-muted/40 border-transparent focus:border-border focus:bg-background transition-colors"
              />
            </div>
            {/* Category pills */}
            <div className="flex gap-1.5 flex-wrap items-center">
              {CATEGORIES.map((cat) => {
                const isActive = category === cat.value
                return (
                  <button
                    key={cat.value}
                    onClick={() => updateParams({ category: cat.value })}
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

        {/* ── Grid ──────────────────────────────────────────────── */}
        {templates.length === 0 ? (
          <div className="bg-background rounded-xl border shadow-sm p-16 text-center">
            <div className="inline-flex w-16 h-16 rounded-2xl bg-muted items-center justify-center mb-4">
              <FileStack className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <h3 className="font-semibold text-lg mb-1">No templates found</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-5">
              {query
                ? `No templates match "${query}". Try a different search term or clear filters.`
                : 'Get started by creating your first template.'}
            </p>
            {query ? (
              <Button variant="outline" onClick={() => updateParams({ q: '', category: '' })} title="Clear Filters" aria-label="Clear Filters">
                <X className="w-4 h-4 sm:mr-1.5" />
                <span className="hidden sm:inline">Clear Filters</span>
              </Button>
            ) : (
              <Link href="/user/templates/create">
                <Button>
                  <Plus className="w-4 h-4 sm:mr-1.5" /> <span className="hidden sm:inline">Create Template</span>
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {templates.map((template) => {
              const Icon = getTemplateIcon(template.icon)
              const catColor = categoryColors[template.category] || ''
              const isBeingDeleted = deletingId === template.id

              return (
                <Card
                  key={template.id}
                  className={cn(
                    'group relative overflow-hidden transition-all duration-200',
                    'hover:shadow-md hover:border-primary/30',
                    isBeingDeleted && 'opacity-50 pointer-events-none'
                  )}
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
                      {/* Header row: icon + name + category badge */}
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center shrink-0 border border-border/50">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-sm leading-snug line-clamp-1">
                              {template.name}
                            </h3>
                            {template.status === 'draft' && (
                              <Badge variant="secondary" className="text-[9px] px-1.5 py-0 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 shrink-0">
                                Draft
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              variant="secondary"
                              className={cn('text-[10px] px-1.5 py-0 leading-relaxed font-medium', catColor)}
                            >
                              {template.category}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground">
                              {audienceLabels[template.audience] || template.audience}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      {template.description && (
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-4">
                          {template.description}
                        </p>
                      )}

                      {/* Tags preview */}
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
                              +{template.suggestedTags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}

                      <Separator className="mb-3" />

                      {/* Footer: stats + actions */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            {template.usageCount} uses
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(template.updatedAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                            })}
                          </span>
                        </div>

                        <div className="flex items-center gap-0.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-primary"
                            onClick={() => setPreviewTemplate(template)}
                            title="Preview"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          <Link href={`/user/templates/${template.id}/edit`}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-primary"
                              title="Edit Template"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            title="Delete"
                            disabled={isBeingDeleted}
                            onClick={() => handleDelete(template)}
                          >
                            {isBeingDeleted ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Use Template button */}
                      <Link href={`/user/posts/create?template=${template.id}`} className="block mt-3">
                        <Button
                          size="sm"
                          className="w-full h-8 text-xs gap-1 shadow-sm"
                          title="Use Template"
                        >
                          <span className="hidden sm:inline">Use Template</span>
                          <span className="sm:hidden">Use</span>
                          <ArrowRight className="w-3 h-3" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* ── Pagination ────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => updateParams({ page: String(currentPage - 1) })}
              className="gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> <span className="hidden sm:inline">Previous</span>
            </Button>
            <div className="flex items-center gap-1 overflow-x-auto max-w-[200px] sm:max-w-none">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => updateParams({ page: String(p) })}
                  className={cn(
                    'w-8 h-8 rounded-lg text-sm font-medium transition-colors flex-shrink-0',
                    p === currentPage
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-muted'
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => updateParams({ page: String(currentPage + 1) })}
              className="gap-1"
            >
              <span className="hidden sm:inline">Next</span> <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

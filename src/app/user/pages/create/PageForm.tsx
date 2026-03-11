'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Save,
  ArrowLeft,
  Send,
  Plus,
  X,
  ChevronUp,
  ChevronDown,
  Upload,
  Layers,
  Trash2,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { RichTextEditor, htmlToLexical } from '@/components/RichTextEditor'
import { uploadToCloudinaryDirect } from '@/utilities/uploadToCloudinaryDirect'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ClubOption {
  id: string
  title: string
  slug: string
}

interface PageFormProps {
  user: { id: string; role?: string }
  clubOptions: ClubOption[]
  initialData?: PageInitialData
  pageId?: string
  isEdit?: boolean
}

interface PageInitialData {
  title?: string
  slug?: string
  heroType?: string
  heroMediaId?: string
  heroMediaUrl?: string
  heroRichText?: string
  club?: string
  publishedAt?: string
  blocks?: BlockData[]
  meta?: { title?: string; description?: string; image?: string; imageUrl?: string }
}

// ---------------------------------------------------------------------------
// Block Types
// ---------------------------------------------------------------------------

export interface BlockData {
  id: string
  blockType: string
  [key: string]: unknown
}

const BLOCK_TYPES = [
  { value: 'statsBlock', label: 'Stats', description: 'Animated stat counters' },
  { value: 'eventsFeed', label: 'Events Feed', description: 'Recent/upcoming events' },
  { value: 'teamGrid', label: 'Team Grid', description: 'Team member cards' },
  { value: 'countdown', label: 'Countdown', description: 'Countdown timer' },
  { value: 'galleryPreview', label: 'Gallery', description: 'Image gallery preview' },
  { value: 'sponsors', label: 'Sponsors', description: 'Partner logos' },
  { value: 'testimonials', label: 'Testimonials', description: 'Member quotes' },
  { value: 'schedule', label: 'Schedule', description: 'Event schedule/agenda' },
  { value: 'contact', label: 'Contact', description: 'Contact info & form' },
  { value: 'mediaBlock', label: 'Media', description: 'Single image/video' },
  { value: 'content', label: 'Rich Content', description: 'Rich text columns' },
  { value: 'cta', label: 'Call to Action', description: 'CTA with links' },
  { value: 'archive', label: 'Post Archive', description: 'Blog post grid' },
] as const

const HERO_TYPES = [
  { value: 'none', label: 'None' },
  { value: 'lowImpact', label: 'Low Impact' },
  { value: 'mediumImpact', label: 'Medium Impact' },
  { value: 'highImpact', label: 'High Impact' },
]

let blockIdCounter = 0
function generateBlockId() {
  blockIdCounter += 1
  return `block_${Date.now()}_${blockIdCounter}`
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PageForm({
  user: _user,
  clubOptions,
  initialData,
  pageId,
  isEdit = false,
}: PageFormProps) {
  const router = useRouter()
  const { toast } = useToast()

  const [title, setTitle] = useState(initialData?.title || '')
  const [heroType, setHeroType] = useState(initialData?.heroType || 'none')
  const [heroMediaId, setHeroMediaId] = useState<string | undefined>(initialData?.heroMediaId)
  const [heroMediaPreview, setHeroMediaPreview] = useState<string | undefined>(initialData?.heroMediaUrl)
  const [heroRichText, setHeroRichText] = useState(initialData?.heroRichText || '')
  const [isUploadingHero, setIsUploadingHero] = useState(false)
  const [club, setClub] = useState(initialData?.club || '')
  const [publishedAt, setPublishedAt] = useState(initialData?.publishedAt || '')

  // SEO
  const [metaTitle, setMetaTitle] = useState(initialData?.meta?.title || '')
  const [metaDescription, setMetaDescription] = useState(initialData?.meta?.description || '')
  const [metaImageId, setMetaImageId] = useState<string | undefined>(initialData?.meta?.image)
  const [metaImagePreview, setMetaImagePreview] = useState<string | undefined>(initialData?.meta?.imageUrl)
  const [isUploadingMeta, setIsUploadingMeta] = useState(false)

  // Blocks
  const [blocks, setBlocks] = useState<BlockData[]>(initialData?.blocks || [])
  const [showBlockPicker, setShowBlockPicker] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)

  // ---- Image Uploads ----
  const handleImageUpload = async (
    file: File,
    type: 'hero' | 'meta',
  ) => {
    const setUploading = type === 'hero' ? setIsUploadingHero : setIsUploadingMeta
    const setId = type === 'hero' ? setHeroMediaId : setMetaImageId
    const setPreview = type === 'hero' ? setHeroMediaPreview : setMetaImagePreview
    setUploading(true)
    try {
      const result = await uploadToCloudinaryDirect(file, file.name.replace(/\.[^/.]+$/, ''))
      if (result?.id) {
        setId(result.id)
        setPreview(result.url)
        toast({ title: 'Image uploaded', description: 'Upload successful.' })
      }
    } catch {
      toast({ title: 'Upload failed', description: 'Please try again.', variant: 'destructive' })
    } finally {
      setUploading(false)
    }
  }

  // ---- Block Operations ----
  const addBlock = (blockType: string) => {
    const newBlock: BlockData = {
      id: generateBlockId(),
      blockType,
      ...getBlockDefaults(blockType),
    }
    setBlocks((prev) => [...prev, newBlock])
    setShowBlockPicker(false)
  }

  const removeBlock = (id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id))
  }

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    setBlocks((prev) => {
      const newBlocks = [...prev]
      const target = direction === 'up' ? index - 1 : index + 1
      if (target < 0 || target >= newBlocks.length) return prev
      ;[newBlocks[index], newBlocks[target]] = [newBlocks[target], newBlocks[index]]
      return newBlocks
    })
  }

  const updateBlock = useCallback((id: string, updates: Partial<BlockData>) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates } : b)),
    )
  }, [])

  // ---- Submit ----
  const handleSubmit = async (status: 'draft' | 'published') => {
    if (!title.trim()) {
      toast({ title: 'Error', description: 'Page title is required.', variant: 'destructive' })
      return
    }

    setIsSubmitting(true)
    try {
      const url = isEdit ? `/api/pages/${pageId}` : '/api/pages'
      const method = isEdit ? 'PATCH' : 'POST'

      // Build hero
      const hero: Record<string, unknown> = { type: heroType }
      if (heroType !== 'none') {
        if (heroMediaId) hero.media = heroMediaId
        if (heroRichText && heroRichText !== '<p></p>') {
          hero.richText = htmlToLexical(heroRichText)
        }
      }

      // Build layout blocks
      const layout = blocks.map((block) => {
        const { id: _id, ...rest } = block
        return rest
      })

      const body: Record<string, unknown> = {
        title: title.trim(),
        hero,
        layout,
        _status: status,
        club: club || null,
        publishedAt: publishedAt || undefined,
        meta: {
          title: metaTitle.trim() || title.trim(),
          description: metaDescription.trim() || undefined,
          image: metaImageId || undefined,
        },
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: 'Success!',
          description: status === 'published'
            ? `Page ${isEdit ? 'updated' : 'created'} and published!`
            : `Page ${isEdit ? 'updated' : 'saved'} as draft.`,
        })
        setTimeout(() => {
          router.push('/user/pages')
          router.refresh()
        }, 800)
      } else {
        toast({
          title: 'Error',
          description: data.errors?.[0]?.message || data.message || 'Failed to save page.',
          variant: 'destructive',
        })
      }
    } catch (err) {
      toast({ title: 'Error', description: 'An error occurred.', variant: 'destructive' })
      console.error('Page submission error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header actions */}
      <div className="flex items-center justify-between">
        <Link
          href="/user/pages"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Pages
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => handleSubmit('draft')} disabled={isSubmitting}>
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Saving...' : 'Save Draft'}
          </Button>
          <Button onClick={() => handleSubmit('published')} disabled={isSubmitting}>
            <Send className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Publishing...' : 'Publish'}
          </Button>
        </div>
      </div>

      {/* Basic Info */}
      <section className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="text-lg font-semibold">Page Details</h2>
        <div>
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. IEEE Student Branch — Landing Page"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="club">Link to Club</Label>
          <select
            id="club"
            value={club}
            onChange={(e) => setClub(e.target.value)}
            className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-border bg-background"
          >
            <option value="">None (standalone page)</option>
            {clubOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground mt-1">
            When linked to a club, this page renders as the club&apos;s landing page at /clubs/[slug].
          </p>
        </div>
      </section>

      {/* Hero */}
      <section className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="text-lg font-semibold">Hero Section</h2>
        <div>
          <Label htmlFor="heroType">Hero Type</Label>
          <select
            id="heroType"
            value={heroType}
            onChange={(e) => setHeroType(e.target.value)}
            className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-border bg-background"
          >
            {HERO_TYPES.map((h) => (
              <option key={h.value} value={h.value}>{h.label}</option>
            ))}
          </select>
        </div>

        {heroType !== 'none' && (
          <>
            {/* Hero rich text */}
            <div>
              <Label>Hero Content</Label>
              <div className="mt-1">
                <RichTextEditor
                  value={heroRichText}
                  onChange={setHeroRichText}
                  placeholder="Hero heading, subtext..."
                />
              </div>
            </div>

            {/* Hero media */}
            {(heroType === 'highImpact' || heroType === 'mediumImpact') && (
              <div>
                <Label>Hero Image</Label>
                <div className="mt-1">
                  {heroMediaPreview ? (
                    <div className="relative aspect-video max-w-md rounded-lg overflow-hidden border border-border">
                      <Image src={heroMediaPreview} alt="Hero preview" fill className="object-cover" />
                      <button
                        onClick={() => { setHeroMediaId(undefined); setHeroMediaPreview(undefined) }}
                        className="absolute top-2 right-2 p-1 rounded-full bg-background/80 hover:bg-background"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center aspect-video max-w-md rounded-lg border-2 border-dashed border-border hover:border-accent/50 cursor-pointer transition-colors">
                      <Upload className="h-8 w-8 text-muted-foreground/50 mb-2" />
                      <span className="text-sm text-muted-foreground">
                        {isUploadingHero ? 'Uploading...' : 'Click to upload hero image'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={isUploadingHero}
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleImageUpload(file, 'hero')
                        }}
                      />
                    </label>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {/* Blocks */}
      <section className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Content Blocks ({blocks.length})
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowBlockPicker(!showBlockPicker)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Block
          </Button>
        </div>

        {/* Block picker */}
        {showBlockPicker && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 p-4 rounded-lg border border-border bg-background">
            {BLOCK_TYPES.map((bt) => (
              <button
                key={bt.value}
                type="button"
                onClick={() => addBlock(bt.value)}
                className="text-left p-3 rounded-lg border border-border hover:border-accent/50 hover:bg-accent/5 transition-colors"
              >
                <p className="font-medium text-sm">{bt.label}</p>
                <p className="text-xs text-muted-foreground">{bt.description}</p>
              </button>
            ))}
          </div>
        )}

        {/* Block list */}
        {blocks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No blocks added yet. Click &quot;Add Block&quot; to start building.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {blocks.map((block, index) => (
              <BlockEditor
                key={block.id}
                block={block}
                index={index}
                total={blocks.length}
                onUpdate={updateBlock}
                onRemove={removeBlock}
                onMove={moveBlock}
                clubOptions={clubOptions}
              />
            ))}
          </div>
        )}
      </section>

      {/* Publishing */}
      <section className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="text-lg font-semibold">Publishing Options</h2>
        <div>
          <Label htmlFor="publishedAt">Schedule Publish Date</Label>
          <Input
            type="datetime-local"
            id="publishedAt"
            value={publishedAt}
            onChange={(e) => setPublishedAt(e.target.value)}
            className="mt-1 max-w-xs"
          />
          <p className="text-xs text-muted-foreground mt-1">Leave empty to publish immediately.</p>
        </div>
      </section>

      {/* SEO */}
      <section className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="text-lg font-semibold">SEO</h2>
        <div>
          <Label htmlFor="metaTitle">Meta Title</Label>
          <Input
            id="metaTitle"
            value={metaTitle}
            onChange={(e) => setMetaTitle(e.target.value)}
            placeholder={title || 'Page title'}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="metaDescription">Meta Description</Label>
          <Textarea
            id="metaDescription"
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            placeholder="Brief description for search engines..."
            className="mt-1"
            rows={3}
          />
        </div>
        <div>
          <Label>SEO Image</Label>
          {metaImagePreview ? (
            <div className="relative aspect-video max-w-xs rounded-lg overflow-hidden border border-border mt-1">
              <Image src={metaImagePreview} alt="SEO image" fill className="object-cover" />
              <button
                onClick={() => { setMetaImageId(undefined); setMetaImagePreview(undefined) }}
                className="absolute top-2 right-2 p-1 rounded-full bg-background/80 hover:bg-background"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center aspect-video max-w-xs rounded-lg border-2 border-dashed border-border hover:border-accent/50 cursor-pointer transition-colors mt-1">
              <Upload className="h-6 w-6 text-muted-foreground/50 mb-1" />
              <span className="text-xs text-muted-foreground">
                {isUploadingMeta ? 'Uploading...' : 'Click to upload'}
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={isUploadingMeta}
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleImageUpload(file, 'meta')
                }}
              />
            </label>
          )}
        </div>
      </section>

      {/* Bottom actions */}
      <div className="flex items-center justify-end gap-2 pb-8">
        <Button variant="outline" onClick={() => handleSubmit('draft')} disabled={isSubmitting}>
          <Save className="h-4 w-4 mr-2" />
          {isSubmitting ? 'Saving...' : 'Save Draft'}
        </Button>
        <Button onClick={() => handleSubmit('published')} disabled={isSubmitting}>
          <Send className="h-4 w-4 mr-2" />
          {isSubmitting ? 'Publishing...' : 'Publish'}
        </Button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Block Editor — renders per-block-type fields
// ---------------------------------------------------------------------------

interface BlockEditorProps {
  block: BlockData
  index: number
  total: number
  onUpdate: (id: string, updates: Partial<BlockData>) => void
  onRemove: (id: string) => void
  onMove: (index: number, direction: 'up' | 'down') => void
  clubOptions: ClubOption[]
}

function BlockEditor({ block, index, total, onUpdate, onRemove, onMove, clubOptions }: BlockEditorProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const label = BLOCK_TYPES.find((bt) => bt.value === block.blockType)?.label || block.blockType

  return (
    <div className="rounded-lg border border-border bg-background">
      {/* Block header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30 rounded-t-lg">
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-2 text-sm font-medium hover:text-foreground transition-colors"
        >
          <span className="text-xs text-muted-foreground font-mono w-6">#{index + 1}</span>
          {label}
          <ChevronDown className={`h-4 w-4 transition-transform ${isCollapsed ? '-rotate-90' : ''}`} />
        </button>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onMove(index, 'up')}
            disabled={index === 0}
            className="p-1 rounded hover:bg-accent/10 disabled:opacity-30"
            aria-label="Move up"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onMove(index, 'down')}
            disabled={index === total - 1}
            className="p-1 rounded hover:bg-accent/10 disabled:opacity-30"
            aria-label="Move down"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onRemove(block.id)}
            className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
            aria-label="Remove block"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Block fields */}
      {!isCollapsed && (
        <div className="p-4 space-y-3">
          <BlockFields block={block} onUpdate={onUpdate} clubOptions={clubOptions} />
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Block Fields — renders fields per block type
// ---------------------------------------------------------------------------

interface BlockFieldsProps {
  block: BlockData
  onUpdate: (id: string, updates: Partial<BlockData>) => void
  clubOptions: ClubOption[]
}

function BlockFields({ block, onUpdate, clubOptions }: BlockFieldsProps) {
  const update = (field: string, value: unknown) => onUpdate(block.id, { [field]: value })

  switch (block.blockType) {
    case 'statsBlock':
      return <StatsBlockFields block={block} update={update} />
    case 'eventsFeed':
      return <EventsFeedFields block={block} update={update} clubOptions={clubOptions} />
    case 'teamGrid':
      return <TeamGridFields block={block} update={update} />
    case 'countdown':
      return <CountdownFields block={block} update={update} />
    case 'galleryPreview':
      return <GalleryPreviewFields block={block} update={update} />
    case 'sponsors':
      return <SponsorsFields block={block} update={update} />
    case 'testimonials':
      return <TestimonialsFields block={block} update={update} />
    case 'schedule':
      return <ScheduleFields block={block} update={update} />
    case 'contact':
      return <ContactFields block={block} update={update} />
    case 'mediaBlock':
      return <MediaBlockFields block={block} update={update} />
    case 'content':
      return <ContentBlockFields block={block} update={update} />
    case 'cta':
      return <CTABlockFields block={block} update={update} />
    case 'archive':
      return <ArchiveBlockFields block={block} update={update} />
    default:
      return <p className="text-sm text-muted-foreground">Unknown block type: {block.blockType}</p>
  }
}

// ---------------------------------------------------------------------------
// Helper: tiny field component wrappers
// ---------------------------------------------------------------------------

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs font-medium">{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// StatsBlock Fields
// ---------------------------------------------------------------------------

function StatsBlockFields({ block, update }: { block: BlockData; update: (field: string, value: unknown) => void }) {
  const stats = (block.stats as Array<{ label: string; value: string; icon?: string; description?: string }>) || []

  const addStat = () => {
    update('stats', [...stats, { label: '', value: '', icon: '', description: '' }])
  }

  const updateStat = (idx: number, field: string, val: string) => {
    const updated = [...stats]
    updated[idx] = { ...updated[idx], [field]: val }
    update('stats', updated)
  }

  const removeStat = (idx: number) => {
    update('stats', stats.filter((_, i) => i !== idx))
  }

  return (
    <>
      <FieldRow label="Heading">
        <Input value={(block.heading as string) || ''} onChange={(e) => update('heading', e.target.value)} placeholder="Our Impact" />
      </FieldRow>
      <FieldRow label="Layout">
        <select value={(block.layout as string) || 'grid'} onChange={(e) => update('layout', e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background">
          <option value="grid">Grid</option>
          <option value="strip">Inline Strip</option>
        </select>
      </FieldRow>
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-xs font-medium">Stats ({stats.length})</Label>
          <Button type="button" variant="outline" size="sm" onClick={addStat} disabled={stats.length >= 6}>
            <Plus className="w-3 h-3 mr-1" /> Add
          </Button>
        </div>
        {stats.map((s, i) => (
          <div key={i} className="grid grid-cols-[1fr_1fr_auto_auto] gap-2 mb-2">
            <Input value={s.label} onChange={(e) => updateStat(i, 'label', e.target.value)} placeholder="Label" />
            <Input value={s.value} onChange={(e) => updateStat(i, 'value', e.target.value)} placeholder="Value" />
            <select value={s.icon || ''} onChange={(e) => updateStat(i, 'icon', e.target.value)} className="px-2 py-1 text-xs rounded border border-border bg-background">
              <option value="">Icon</option>
              <option value="users">Users</option>
              <option value="calendar">Calendar</option>
              <option value="trophy">Trophy</option>
              <option value="star">Star</option>
              <option value="target">Target</option>
              <option value="zap">Zap</option>
            </select>
            <button type="button" onClick={() => removeStat(i)} className="p-1 hover:text-destructive"><X className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// EventsFeed Fields
// ---------------------------------------------------------------------------

function EventsFeedFields({ block, update, clubOptions }: { block: BlockData; update: (field: string, value: unknown) => void; clubOptions: ClubOption[] }) {
  return (
    <>
      <FieldRow label="Heading">
        <Input value={(block.heading as string) || ''} onChange={(e) => update('heading', e.target.value)} placeholder="Upcoming Events" />
      </FieldRow>
      <FieldRow label="Filter by Club">
        <select value={(block.club as string) || ''} onChange={(e) => update('club', e.target.value || null)} className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background">
          <option value="">All Clubs</option>
          {clubOptions.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
      </FieldRow>
      <div className="grid grid-cols-2 gap-3">
        <FieldRow label="Limit">
          <Input type="number" min={1} max={20} value={(block.limit as number) ?? 6} onChange={(e) => update('limit', Number(e.target.value))} />
        </FieldRow>
        <FieldRow label="Layout">
          <select value={(block.layout as string) || 'cards'} onChange={(e) => update('layout', e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background">
            <option value="cards">Cards Grid</option>
            <option value="timeline">Timeline</option>
          </select>
        </FieldRow>
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" checked={(block.showStatus as boolean) ?? true} onChange={(e) => update('showStatus', e.target.checked)} id={`${block.id}-showStatus`} className="rounded border-border" />
        <label htmlFor={`${block.id}-showStatus`} className="text-sm">Show status badges</label>
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// TeamGrid Fields
// ---------------------------------------------------------------------------

function TeamGridFields({ block, update }: { block: BlockData; update: (field: string, value: unknown) => void }) {
  const source = (block.source as string) || 'manual'
  const members = (block.members as Array<{ name: string; role: string; email?: string }>) || []

  const addMember = () => {
    update('members', [...members, { name: '', role: '', email: '' }])
  }

  const updateMember = (idx: number, field: string, val: string) => {
    const updated = [...members]
    updated[idx] = { ...updated[idx], [field]: val }
    update('members', updated)
  }

  const removeMember = (idx: number) => {
    update('members', members.filter((_, i) => i !== idx))
  }

  return (
    <>
      <FieldRow label="Heading">
        <Input value={(block.heading as string) || ''} onChange={(e) => update('heading', e.target.value)} placeholder="Our Team" />
      </FieldRow>
      <div className="grid grid-cols-2 gap-3">
        <FieldRow label="Source">
          <select value={source} onChange={(e) => update('source', e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background">
            <option value="manual">Manual Entry</option>
            <option value="conosco">From Conosco</option>
          </select>
        </FieldRow>
        <FieldRow label="Layout">
          <select value={(block.layout as string) || 'grid'} onChange={(e) => update('layout', e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background">
            <option value="grid">Grid</option>
            <option value="compact">Compact List</option>
          </select>
        </FieldRow>
      </div>
      {source === 'manual' && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-xs font-medium">Members ({members.length})</Label>
            <Button type="button" variant="outline" size="sm" onClick={addMember}>
              <Plus className="w-3 h-3 mr-1" /> Add
            </Button>
          </div>
          {members.map((m, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 mb-2">
              <Input value={m.name} onChange={(e) => updateMember(i, 'name', e.target.value)} placeholder="Name" />
              <Input value={m.role} onChange={(e) => updateMember(i, 'role', e.target.value)} placeholder="Role" />
              <Input value={m.email || ''} onChange={(e) => updateMember(i, 'email', e.target.value)} placeholder="Email" />
              <button type="button" onClick={() => removeMember(i)} className="p-1 hover:text-destructive"><X className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

// ---------------------------------------------------------------------------
// Countdown Fields
// ---------------------------------------------------------------------------

function CountdownFields({ block, update }: { block: BlockData; update: (field: string, value: unknown) => void }) {
  return (
    <>
      <FieldRow label="Event Title *">
        <Input value={(block.eventTitle as string) || ''} onChange={(e) => update('eventTitle', e.target.value)} placeholder="Tech Fest 2026" />
      </FieldRow>
      <FieldRow label="Target Date & Time *">
        <Input type="datetime-local" value={(block.targetDate as string) || ''} onChange={(e) => update('targetDate', e.target.value)} />
      </FieldRow>
      <FieldRow label="Description">
        <Textarea value={(block.description as string) || ''} onChange={(e) => update('description', e.target.value)} placeholder="Optional short description..." rows={2} />
      </FieldRow>
    </>
  )
}

// ---------------------------------------------------------------------------
// GalleryPreview Fields
// ---------------------------------------------------------------------------

function GalleryPreviewFields({ block, update }: { block: BlockData; update: (field: string, value: unknown) => void }) {
  const images = (block.images as Array<{ caption?: string; _tempUrl?: string }>) || []

  return (
    <>
      <FieldRow label="Heading">
        <Input value={(block.heading as string) || ''} onChange={(e) => update('heading', e.target.value)} placeholder="Gallery" />
      </FieldRow>
      <div className="grid grid-cols-2 gap-3">
        <FieldRow label="Layout">
          <select value={(block.layout as string) || 'grid'} onChange={(e) => update('layout', e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background">
            <option value="grid">Grid</option>
            <option value="masonry">Masonry</option>
          </select>
        </FieldRow>
        <FieldRow label="Preview Limit">
          <Input type="number" min={3} max={12} value={(block.limit as number) ?? 6} onChange={(e) => update('limit', Number(e.target.value))} />
        </FieldRow>
      </div>
      <p className="text-xs text-muted-foreground">
        Gallery images: {images.length} added. Upload images via the Media Manager and reference them by ID.
      </p>
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-xs font-medium">Images</Label>
          <Button type="button" variant="outline" size="sm" onClick={() => update('images', [...images, { caption: '' }])} disabled={images.length >= 12}>
            <Plus className="w-3 h-3 mr-1" /> Add Slot
          </Button>
        </div>
        {images.map((img, i) => (
          <div key={i} className="flex items-center gap-2 mb-2">
            <GalleryImageUploader
              index={i}
              image={img as { image?: string; caption?: string; _tempUrl?: string }}
              onUpdate={(field, val) => {
                const updated = [...images]
                updated[i] = { ...updated[i], [field]: val }
                update('images', updated)
              }}
              onRemove={() => update('images', images.filter((_, idx) => idx !== i))}
            />
          </div>
        ))}
      </div>
    </>
  )
}

function GalleryImageUploader({
  index,
  image,
  onUpdate,
  onRemove,
}: {
  index: number
  image: { image?: string; caption?: string; _tempUrl?: string }
  onUpdate: (field: string, val: unknown) => void
  onRemove: () => void
}) {
  const [uploading, setUploading] = useState(false)
  const { toast } = useToast()

  const handleUpload = async (file: File) => {
    setUploading(true)
    try {
      const result = await uploadToCloudinaryDirect(file, file.name.replace(/\.[^/.]+$/, ''))
      if (result?.id) {
        onUpdate('image', result.id)
        onUpdate('_tempUrl', result.url)
        toast({ title: 'Image uploaded' })
      }
    } catch {
      toast({ title: 'Upload failed', variant: 'destructive' })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex items-center gap-2 w-full">
      <span className="text-xs text-muted-foreground w-6">#{index + 1}</span>
      {image._tempUrl ? (
        <div className="w-12 h-12 rounded overflow-hidden border border-border flex-shrink-0">
          <Image src={image._tempUrl} alt="" width={48} height={48} className="object-cover w-full h-full" />
        </div>
      ) : (
        <label className="w-12 h-12 rounded border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-accent/50 flex-shrink-0">
          <Upload className="w-4 h-4 text-muted-foreground/50" />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleUpload(file)
            }}
          />
        </label>
      )}
      <Input
        value={image.caption || ''}
        onChange={(e) => onUpdate('caption', e.target.value)}
        placeholder="Caption..."
        className="flex-1 h-8 text-xs"
      />
      <button type="button" onClick={onRemove} className="p-1 hover:text-destructive"><X className="w-4 h-4" /></button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sponsors Fields
// ---------------------------------------------------------------------------

function SponsorsFields({ block, update }: { block: BlockData; update: (field: string, value: unknown) => void }) {
  const sponsors = (block.sponsors as Array<{ name: string; url?: string; tier?: string }>) || []

  return (
    <>
      <FieldRow label="Heading">
        <Input value={(block.heading as string) || ''} onChange={(e) => update('heading', e.target.value)} placeholder="Our Partners & Sponsors" />
      </FieldRow>
      <FieldRow label="Layout">
        <select value={(block.layout as string) || 'grid'} onChange={(e) => update('layout', e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background">
          <option value="grid">Grid</option>
          <option value="marquee">Scrolling Marquee</option>
        </select>
      </FieldRow>
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-xs font-medium">Sponsors ({sponsors.length})</Label>
          <Button type="button" variant="outline" size="sm" onClick={() => update('sponsors', [...sponsors, { name: '', url: '', tier: 'partner' }])} disabled={sponsors.length >= 20}>
            <Plus className="w-3 h-3 mr-1" /> Add
          </Button>
        </div>
        {sponsors.map((s, i) => (
          <div key={i} className="grid grid-cols-[1fr_1fr_auto_auto] gap-2 mb-2">
            <Input value={s.name} onChange={(e) => { const u = [...sponsors]; u[i] = { ...u[i], name: e.target.value }; update('sponsors', u) }} placeholder="Sponsor name" />
            <Input value={s.url || ''} onChange={(e) => { const u = [...sponsors]; u[i] = { ...u[i], url: e.target.value }; update('sponsors', u) }} placeholder="Website URL" />
            <select value={s.tier || 'partner'} onChange={(e) => { const u = [...sponsors]; u[i] = { ...u[i], tier: e.target.value }; update('sponsors', u) }} className="px-2 py-1 text-xs rounded border border-border bg-background">
              <option value="gold">Gold</option>
              <option value="silver">Silver</option>
              <option value="bronze">Bronze</option>
              <option value="partner">Partner</option>
            </select>
            <button type="button" onClick={() => update('sponsors', sponsors.filter((_, idx) => idx !== i))} className="p-1 hover:text-destructive"><X className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">Sponsor logos can be uploaded via Media Manager. For now, enter sponsor details — logos can be added when editing.</p>
    </>
  )
}

// ---------------------------------------------------------------------------
// Testimonials Fields
// ---------------------------------------------------------------------------

function TestimonialsFields({ block, update }: { block: BlockData; update: (field: string, value: unknown) => void }) {
  const testimonials = (block.testimonials as Array<{ quote: string; author: string; role?: string }>) || []

  return (
    <>
      <FieldRow label="Heading">
        <Input value={(block.heading as string) || ''} onChange={(e) => update('heading', e.target.value)} placeholder="What Our Members Say" />
      </FieldRow>
      <FieldRow label="Layout">
        <select value={(block.layout as string) || 'grid'} onChange={(e) => update('layout', e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background">
          <option value="grid">Grid</option>
          <option value="highlight">Single Highlight</option>
        </select>
      </FieldRow>
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-xs font-medium">Testimonials ({testimonials.length})</Label>
          <Button type="button" variant="outline" size="sm" onClick={() => update('testimonials', [...testimonials, { quote: '', author: '', role: '' }])} disabled={testimonials.length >= 8}>
            <Plus className="w-3 h-3 mr-1" /> Add
          </Button>
        </div>
        {testimonials.map((t, i) => (
          <div key={i} className="p-3 rounded-lg border border-border mb-2 space-y-2">
            <Textarea value={t.quote} onChange={(e) => { const u = [...testimonials]; u[i] = { ...u[i], quote: e.target.value }; update('testimonials', u) }} placeholder="Quote..." rows={2} />
            <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
              <Input value={t.author} onChange={(e) => { const u = [...testimonials]; u[i] = { ...u[i], author: e.target.value }; update('testimonials', u) }} placeholder="Author name" />
              <Input value={t.role || ''} onChange={(e) => { const u = [...testimonials]; u[i] = { ...u[i], role: e.target.value }; update('testimonials', u) }} placeholder="Role / year" />
              <button type="button" onClick={() => update('testimonials', testimonials.filter((_, idx) => idx !== i))} className="p-1 hover:text-destructive"><X className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// Schedule Fields
// ---------------------------------------------------------------------------

function ScheduleFields({ block, update }: { block: BlockData; update: (field: string, value: unknown) => void }) {
  const days = (block.days as Array<{
    date: string
    title?: string
    sessions: Array<{ time: string; title: string; speaker?: string; venue?: string; type?: string }>
  }>) || []

  const addDay = () => {
    update('days', [...days, { date: '', title: '', sessions: [{ time: '', title: '', type: 'talk' }] }])
  }

  const updateDay = (idx: number, field: string, val: unknown) => {
    const updated = [...days]
    updated[idx] = { ...updated[idx], [field]: val }
    update('days', updated)
  }

  const addSession = (dayIdx: number) => {
    const updated = [...days]
    updated[dayIdx] = {
      ...updated[dayIdx],
      sessions: [...updated[dayIdx].sessions, { time: '', title: '', type: 'talk' }],
    }
    update('days', updated)
  }

  const updateSession = (dayIdx: number, sessIdx: number, field: string, val: string) => {
    const updated = [...days]
    const sessions = [...updated[dayIdx].sessions]
    sessions[sessIdx] = { ...sessions[sessIdx], [field]: val }
    updated[dayIdx] = { ...updated[dayIdx], sessions }
    update('days', updated)
  }

  const removeSession = (dayIdx: number, sessIdx: number) => {
    const updated = [...days]
    updated[dayIdx] = {
      ...updated[dayIdx],
      sessions: updated[dayIdx].sessions.filter((_, i) => i !== sessIdx),
    }
    update('days', updated)
  }

  return (
    <>
      <FieldRow label="Heading">
        <Input value={(block.heading as string) || ''} onChange={(e) => update('heading', e.target.value)} placeholder="Event Schedule" />
      </FieldRow>
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-xs font-medium">Days ({days.length})</Label>
          <Button type="button" variant="outline" size="sm" onClick={addDay} disabled={days.length >= 7}>
            <Plus className="w-3 h-3 mr-1" /> Add Day
          </Button>
        </div>
        {days.map((day, di) => (
          <div key={di} className="p-3 rounded-lg border border-border mb-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Day {di + 1}</span>
              <button type="button" onClick={() => update('days', days.filter((_, i) => i !== di))} className="p-1 hover:text-destructive"><X className="w-3 h-3" /></button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input type="date" value={day.date} onChange={(e) => updateDay(di, 'date', e.target.value)} />
              <Input value={day.title || ''} onChange={(e) => updateDay(di, 'title', e.target.value)} placeholder="Day title..." />
            </div>
            <div className="pl-3 border-l-2 border-border space-y-2">
              {day.sessions.map((sess, si) => (
                <div key={si} className="grid grid-cols-[auto_1fr_1fr_auto_auto] gap-1 items-center">
                  <Input value={sess.time} onChange={(e) => updateSession(di, si, 'time', e.target.value)} placeholder="10:00 AM" className="h-7 text-xs w-24" />
                  <Input value={sess.title} onChange={(e) => updateSession(di, si, 'title', e.target.value)} placeholder="Session title" className="h-7 text-xs" />
                  <Input value={sess.speaker || ''} onChange={(e) => updateSession(di, si, 'speaker', e.target.value)} placeholder="Speaker" className="h-7 text-xs" />
                  <select value={sess.type || 'talk'} onChange={(e) => updateSession(di, si, 'type', e.target.value)} className="h-7 px-1 text-xs rounded border border-border bg-background">
                    <option value="talk">Talk</option>
                    <option value="workshop">Workshop</option>
                    <option value="panel">Panel</option>
                    <option value="break">Break</option>
                    <option value="networking">Networking</option>
                  </select>
                  <button type="button" onClick={() => removeSession(di, si)} className="p-0.5 hover:text-destructive"><X className="w-3 h-3" /></button>
                </div>
              ))}
              <Button type="button" variant="ghost" size="sm" onClick={() => addSession(di)} className="h-6 text-xs">
                <Plus className="w-3 h-3 mr-1" /> Session
              </Button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// Contact Fields
// ---------------------------------------------------------------------------

function ContactFields({ block, update }: { block: BlockData; update: (field: string, value: unknown) => void }) {
  const socialLinks = (block.socialLinks as Array<{ platform: string; url: string }>) || []

  return (
    <>
      <FieldRow label="Heading">
        <Input value={(block.heading as string) || ''} onChange={(e) => update('heading', e.target.value)} placeholder="Get in Touch" />
      </FieldRow>
      <FieldRow label="Address">
        <Textarea value={(block.address as string) || ''} onChange={(e) => update('address', e.target.value)} placeholder="Club office or lab address" rows={2} />
      </FieldRow>
      <div className="grid grid-cols-2 gap-3">
        <FieldRow label="Email">
          <Input type="email" value={(block.email as string) || ''} onChange={(e) => update('email', e.target.value)} placeholder="club@gcet.edu.in" />
        </FieldRow>
        <FieldRow label="Phone">
          <Input value={(block.phone as string) || ''} onChange={(e) => update('phone', e.target.value)} placeholder="+91..." />
        </FieldRow>
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-xs font-medium">Social Links ({socialLinks.length})</Label>
          <Button type="button" variant="outline" size="sm" onClick={() => update('socialLinks', [...socialLinks, { platform: 'instagram', url: '' }])} disabled={socialLinks.length >= 6}>
            <Plus className="w-3 h-3 mr-1" /> Add
          </Button>
        </div>
        {socialLinks.map((sl, i) => (
          <div key={i} className="grid grid-cols-[auto_1fr_auto] gap-2 mb-2">
            <select value={sl.platform} onChange={(e) => { const u = [...socialLinks]; u[i] = { ...u[i], platform: e.target.value }; update('socialLinks', u) }} className="px-2 py-1 text-xs rounded border border-border bg-background">
              <option value="instagram">Instagram</option>
              <option value="linkedin">LinkedIn</option>
              <option value="twitter">Twitter / X</option>
              <option value="github">GitHub</option>
              <option value="youtube">YouTube</option>
              <option value="website">Website</option>
            </select>
            <Input value={sl.url} onChange={(e) => { const u = [...socialLinks]; u[i] = { ...u[i], url: e.target.value }; update('socialLinks', u) }} placeholder="https://..." className="h-8 text-xs" />
            <button type="button" onClick={() => update('socialLinks', socialLinks.filter((_, idx) => idx !== i))} className="p-1 hover:text-destructive"><X className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
      <FieldRow label="Google Maps Embed URL">
        <Input value={(block.mapEmbedUrl as string) || ''} onChange={(e) => update('mapEmbedUrl', e.target.value)} placeholder="https://www.google.com/maps/embed?..." />
      </FieldRow>
    </>
  )
}

// ---------------------------------------------------------------------------
// MediaBlock Fields
// ---------------------------------------------------------------------------

function MediaBlockFields({ block, update }: { block: BlockData; update: (field: string, value: unknown) => void }) {
  const [uploading, setUploading] = useState(false)
  const { toast } = useToast()
  const mediaUrl = block._mediaUrl as string | undefined

  return (
    <>
      <FieldRow label="Media">
        {mediaUrl ? (
          <div className="relative w-48 aspect-video rounded-lg overflow-hidden border border-border">
            <Image src={mediaUrl} alt="" fill className="object-cover" />
            <button
              onClick={() => { update('media', undefined); update('_mediaUrl', undefined) }}
              className="absolute top-1 right-1 p-1 rounded-full bg-background/80 hover:bg-background"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-48 aspect-video rounded-lg border-2 border-dashed border-border hover:border-accent/50 cursor-pointer">
            <Upload className="h-6 w-6 text-muted-foreground/50 mb-1" />
            <span className="text-xs text-muted-foreground">{uploading ? 'Uploading...' : 'Upload'}</span>
            <input
              type="file"
              accept="image/*,video/*"
              className="hidden"
              disabled={uploading}
              onChange={async (e) => {
                const file = e.target.files?.[0]
                if (!file) return
                setUploading(true)
                try {
                  const result = await uploadToCloudinaryDirect(file, file.name.replace(/\.[^/.]+$/, ''))
                  if (result?.id) {
                    update('media', result.id)
                    update('_mediaUrl', result.url)
                    toast({ title: 'Uploaded' })
                  }
                } catch {
                  toast({ title: 'Failed', variant: 'destructive' })
                } finally {
                  setUploading(false)
                }
              }}
            />
          </label>
        )}
      </FieldRow>
    </>
  )
}

// ---------------------------------------------------------------------------
// Content Block Fields (Rich Text Columns)
// ---------------------------------------------------------------------------

function ContentBlockFields({ block, update }: { block: BlockData; update: (field: string, value: unknown) => void }) {
  const columns = (block.columns as Array<{ size: string; richText?: string; _html?: string }>) || []

  return (
    <>
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-xs font-medium">Columns ({columns.length})</Label>
          <Button type="button" variant="outline" size="sm" onClick={() => update('columns', [...columns, { size: 'full', _html: '' }])} disabled={columns.length >= 4}>
            <Plus className="w-3 h-3 mr-1" /> Add Column
          </Button>
        </div>
        {columns.map((col, i) => (
          <div key={i} className="p-3 rounded-lg border border-border mb-2 space-y-2">
            <div className="flex items-center justify-between">
              <select value={col.size || 'full'} onChange={(e) => { const u = [...columns]; u[i] = { ...u[i], size: e.target.value }; update('columns', u) }} className="px-2 py-1 text-xs rounded border border-border bg-background">
                <option value="full">Full Width</option>
                <option value="half">Half</option>
                <option value="oneThird">One Third</option>
                <option value="twoThirds">Two Thirds</option>
              </select>
              <button type="button" onClick={() => update('columns', columns.filter((_, idx) => idx !== i))} className="p-1 hover:text-destructive"><X className="w-3 h-3" /></button>
            </div>
            <RichTextEditor
              value={col._html || ''}
              onChange={(val) => { const u = [...columns]; u[i] = { ...u[i], _html: val }; update('columns', u) }}
              placeholder="Column content..."
            />
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Rich text content will be converted to Lexical format on save.
      </p>
    </>
  )
}

// ---------------------------------------------------------------------------
// CTA Block Fields
// ---------------------------------------------------------------------------

function CTABlockFields({ block, update }: { block: BlockData; update: (field: string, value: unknown) => void }) {
  return (
    <>
      <FieldRow label="CTA Content">
        <RichTextEditor
          value={(block._richTextHtml as string) || ''}
          onChange={(val) => update('_richTextHtml', val)}
          placeholder="Call to action heading and text..."
        />
      </FieldRow>
      <p className="text-xs text-muted-foreground">
        Links/buttons can be configured after initial save via the page editor.
      </p>
    </>
  )
}

// ---------------------------------------------------------------------------
// Archive Block Fields
// ---------------------------------------------------------------------------

function ArchiveBlockFields({ block, update }: { block: BlockData; update: (field: string, value: unknown) => void }) {
  return (
    <>
      <FieldRow label="Populate By">
        <select value={(block.populateBy as string) || 'collection'} onChange={(e) => update('populateBy', e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background">
          <option value="collection">Collection (auto)</option>
          <option value="selection">Individual Selection</option>
        </select>
      </FieldRow>
      {(block.populateBy as string) !== 'selection' && (
        <FieldRow label="Limit">
          <Input type="number" min={1} max={20} value={(block.limit as number) ?? 10} onChange={(e) => update('limit', Number(e.target.value))} />
        </FieldRow>
      )}
      <p className="text-xs text-muted-foreground">
        Displays a grid of recent blog posts. Category filters and individual post selection available after save.
      </p>
    </>
  )
}

// ---------------------------------------------------------------------------
// Block Defaults
// ---------------------------------------------------------------------------

function getBlockDefaults(blockType: string): Record<string, unknown> {
  switch (blockType) {
    case 'statsBlock':
      return { heading: '', layout: 'grid', stats: [] }
    case 'eventsFeed':
      return { heading: 'Upcoming Events', club: null, limit: 6, layout: 'cards', showStatus: true }
    case 'teamGrid':
      return { heading: 'Our Team', source: 'manual', layout: 'grid', members: [] }
    case 'countdown':
      return { eventTitle: '', targetDate: '', description: '' }
    case 'galleryPreview':
      return { heading: 'Gallery', layout: 'grid', limit: 6, images: [] }
    case 'sponsors':
      return { heading: 'Our Partners & Sponsors', layout: 'grid', sponsors: [] }
    case 'testimonials':
      return { heading: 'What Our Members Say', layout: 'grid', testimonials: [] }
    case 'schedule':
      return { heading: 'Event Schedule', days: [] }
    case 'contact':
      return { heading: 'Get in Touch', address: '', email: '', phone: '', socialLinks: [], mapEmbedUrl: '' }
    case 'mediaBlock':
      return { media: undefined }
    case 'content':
      return { columns: [{ size: 'full', _html: '' }] }
    case 'cta':
      return { _richTextHtml: '' }
    case 'archive':
      return { populateBy: 'collection', limit: 10 }
    default:
      return {}
  }
}

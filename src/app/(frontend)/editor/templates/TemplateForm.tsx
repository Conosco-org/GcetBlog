'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Save,
  X,
  ImageIcon,
  Loader2,
  Eye,
  Send,
  FileEdit,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { RichTextEditor } from '@/components/shared/RichTextEditor'
import { getTemplateIcon } from '@/components/shared/templates/templateUtils'
import { uploadToCloudinaryDirect } from '@/utilities/uploadToCloudinaryDirect'

// ── Constants ────────────────────────────────────────────────────

const CATEGORIES = [
  { label: 'Academic', value: 'academic' },
  { label: 'General', value: 'general' },
  { label: 'Editorial', value: 'editorial' },
  { label: 'News', value: 'news' },
]

const CONTENT_TYPES = [
  { label: 'News Article', value: 'news' },
  { label: 'Event Coverage', value: 'event' },
  { label: 'Literary Post', value: 'literary' },
  { label: 'Media Post', value: 'media' },
  { label: 'Tutorial/Guide', value: 'tutorial' },
  { label: 'Academic Content', value: 'academic' },
]

const AUDIENCES = [
  { label: 'Everyone', value: 'all' },
  { label: 'Editors Only', value: 'editor_only' },
  { label: 'Contributors Only', value: 'contributor_only' },
]

const ICONS = [
  { label: 'Calendar (Events)', value: 'calendar' },
  { label: 'Graduation Cap', value: 'graduation' },
  { label: 'File Text (Article)', value: 'file-text' },
  { label: 'Lightbulb (Tutorial)', value: 'lightbulb' },
  { label: 'Users (Interview)', value: 'users' },
  { label: 'Trophy (Achievement)', value: 'trophy' },
  { label: 'Book (Review)', value: 'book' },
  { label: 'Code (Technical)', value: 'code' },
  { label: 'Megaphone', value: 'megaphone' },
  { label: 'Star (Featured)', value: 'star' },
  { label: 'Briefcase (Placement)', value: 'briefcase' },
  { label: 'List (Listicle)', value: 'list' },
]

// ── Types ────────────────────────────────────────────────────────

export interface TemplateFormData {
  id?: string
  name: string
  description: string
  category: string
  contentType: string
  audience: string
  icon: string
  content: string
  suggestedTitle: string
  suggestedTags: string[]
  status: 'draft' | 'published'
}

interface TemplateFormProps {
  /** Pass existing data for edit mode, leave undefined for create */
  initialData?: TemplateFormData
}

// ── Component ────────────────────────────────────────────────────

export function TemplateForm({ initialData }: TemplateFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  const isEditing = !!initialData?.id

  // ── Form state ────────────────────────────────────────────────
  const [name, setName] = useState(initialData?.name || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [category, setCategory] = useState(initialData?.category || 'general')
  const [contentType, setContentType] = useState(initialData?.contentType || '')
  const [audience, setAudience] = useState(initialData?.audience || 'all')
  const [icon, setIcon] = useState(initialData?.icon || 'file-text')
  const [content, setContent] = useState(initialData?.content || '')
  const [suggestedTitle, setSuggestedTitle] = useState(initialData?.suggestedTitle || '')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>(initialData?.suggestedTags || [])
  const [status, setStatus] = useState<'draft' | 'published'>(initialData?.status || 'draft')

  // ── Tag handling ──────────────────────────────────────────────
  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase()
    if (tag && !tags.includes(tag)) {
      setTags((prev) => [...prev, tag])
    }
    setTagInput('')
  }

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      handleAddTag()
    }
    if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      setTags((prev) => prev.slice(0, -1))
    }
  }

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag))
  }

  // ── Image upload (inserts into editor content) ────────────────
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast({ title: 'Error', description: 'Please select an image file', variant: 'destructive' })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'Error', description: 'Image must be less than 5 MB', variant: 'destructive' })
      return
    }

    setIsUploadingImage(true)
    try {
      const altText = file.name.replace(/\.[^/.]+$/, '')
      const result = await uploadToCloudinaryDirect(file, altText)
      const imgHtml = `<p><img src="${result.cloudinaryUrl}" alt="${altText}" /></p>`
      setContent((prev) => prev + imgHtml)
      toast({ title: 'Uploaded', description: 'Image inserted into the template content.' })
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Upload failed', variant: 'destructive' })
    } finally {
      setIsUploadingImage(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // ── Save / Publish ────────────────────────────────────────────
  const handleSave = async (targetStatus?: 'draft' | 'published') => {
    if (!name.trim()) {
      toast({ title: 'Error', description: 'Template name is required', variant: 'destructive' })
      return
    }
    if (!content.trim()) {
      toast({ title: 'Error', description: 'Template content is required', variant: 'destructive' })
      return
    }

    const newStatus = targetStatus ?? status
    const isPublishAction = newStatus === 'published' && status !== 'published'
    const isUnpublishAction = newStatus === 'draft' && status === 'published'

    if (isPublishAction) setIsPublishing(true)
    else setIsSaving(true)

    try {
      const body = {
        name: name.trim(),
        description: description.trim() || undefined,
        category,
        contentType: contentType || undefined,
        audience,
        icon,
        content,
        suggestedTitle: suggestedTitle.trim() || undefined,
        suggestedTags: tags.length > 0 ? tags : undefined,
        status: newStatus,
      }

      const url = isEditing ? `/api/templates/${initialData!.id}` : '/api/templates'
      const method = isEditing ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Failed to save template')
      }

      setStatus(newStatus)

      const actionLabel = isPublishAction
        ? 'Template published'
        : isUnpublishAction
          ? 'Template unpublished'
          : isEditing
            ? 'Template updated'
            : 'Template created'

      toast({ title: 'Success', description: `${actionLabel} successfully.` })

      router.push('/editor/templates')
      router.refresh()
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to save template',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
      setIsPublishing(false)
    }
  }

  // ── Helpers ───────────────────────────────────────────────────
  const SelectedIcon = getTemplateIcon(icon)

  const getWordCount = (html: string) => {
    const text = html.replace(/<[^>]+>/g, ' ').trim()
    if (!text) return 0
    return text.split(/\s+/).filter(Boolean).length
  }

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-muted/30">
      {/* ── Sticky top bar ─────────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 max-w-[1400px] mx-auto">
          <div className="flex items-center gap-2">
            <Link href="/editor/templates">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                <SelectedIcon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h1 className="text-sm font-semibold leading-tight">
                  {isEditing ? 'Edit Template' : 'New Template'}
                </h1>
                <p className="text-[11px] text-muted-foreground leading-tight">
                  {name || 'Untitled'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-xs text-muted-foreground mr-1">
              {getWordCount(content)} words
            </span>
            {status === 'published' && (
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-[10px] hidden sm:flex">
                Published
              </Badge>
            )}
            {status === 'draft' && (
              <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 text-[10px] hidden sm:flex">
                Draft
              </Badge>
            )}
            <Button
              variant={showPreview ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              className="h-8 gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{showPreview ? 'Back to Edit' : 'Preview'}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSave()}
              disabled={isSaving || isPublishing}
              className="h-8 gap-1.5"
            >
              {isSaving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">
                {isSaving ? 'Saving...' : status === 'published' ? 'Save Changes' : 'Save Draft'}
              </span>
            </Button>
            {status === 'published' ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSave('draft')}
                disabled={isSaving || isPublishing}
                className="h-8 gap-1.5 border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-950"
              >
                <FileEdit className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Unpublish</span>
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => handleSave('published')}
                disabled={isSaving || isPublishing}
                className="h-8 gap-1.5 shadow-sm bg-green-600 hover:bg-green-700 text-white"
              >
                {isPublishing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span className="hidden sm:inline">
                  {isPublishing ? 'Publishing...' : 'Publish'}
                </span>
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
        {showPreview ? (
          /* ── Preview mode ──────────────────────────────────── */
          <div className="max-w-3xl mx-auto">
            <Card className="overflow-hidden">
              {/* Preview header */}
              <div className="bg-muted/40 border-b px-6 py-5">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                    <SelectedIcon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold leading-tight">
                      {name || 'Untitled Template'}
                    </h2>
                    {description && (
                      <p className="text-sm text-muted-foreground mt-1">{description}</p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Badge variant="secondary">{category}</Badge>
                      <Badge variant="outline">
                        {AUDIENCES.find((a) => a.value === audience)?.label}
                      </Badge>
                      {contentType && (
                        <Badge variant="outline">
                          {CONTENT_TYPES.find((ct) => ct.value === contentType)?.label}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {suggestedTitle && (
                  <div className="mt-4 bg-background rounded-lg px-4 py-2.5 text-sm">
                    <span className="font-medium">Suggested title: </span>
                    <span className="text-muted-foreground">{suggestedTitle}</span>
                  </div>
                )}

                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {tags.map((tag) => (
                      <span key={tag} className="text-xs text-muted-foreground bg-background px-2.5 py-0.5 rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Preview content */}
              <CardContent className="p-6 sm:p-8">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: content }} />
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* ── Edit mode ─────────────────────────────────────── */
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
            {/* Main column - editor */}
            <div className="space-y-4">
              {/* Name + description card */}
              <Card>
                <CardContent className="p-5 space-y-3">
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Template name..."
                    className="text-xl font-bold border-0 border-b rounded-none px-0 h-auto py-2 focus-visible:ring-0 focus-visible:border-primary bg-transparent"
                  />
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of what this template helps with..."
                    rows={2}
                    className="resize-none text-sm bg-transparent"
                  />
                </CardContent>
              </Card>

              {/* Editor card */}
              <Card className="overflow-hidden">
                {/* Image upload toolbar */}
                <div className="flex items-center gap-3 px-4 py-2.5 border-b bg-muted/30">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1.5 text-xs"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingImage}
                  >
                    {isUploadingImage ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <ImageIcon className="w-3.5 h-3.5" />
                    )}
                    {isUploadingImage ? 'Uploading...' : 'Insert Image'}
                  </Button>
                  <span className="text-[10px] text-muted-foreground">Max 5 MB</span>
                </div>

                {/* Rich Text Editor */}
                <CardContent className="p-0">
                  <RichTextEditor
                    value={content}
                    onChange={setContent}
                    placeholder="Write your template content here... Use headings, lists, and formatting to create a structured starting point for writers."
                    minHeight="520px"
                  />
                </CardContent>
              </Card>
            </div>

            {/* ── Sidebar ─────────────────────────────────────── */}
            <div className="space-y-4">
              {/* Settings */}
              <Card>
                <CardHeader className="px-5 py-4 pb-2">
                  <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5 space-y-4">
                  {/* Icon */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Icon</Label>
                    <Select value={icon} onValueChange={setIcon}>
                      <SelectTrigger className="h-9">
                        <div className="flex items-center gap-2">
                          <SelectedIcon className="w-4 h-4 text-primary" />
                          <SelectValue />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {ICONS.map((ic) => {
                          const IcComp = getTemplateIcon(ic.value)
                          return (
                            <SelectItem key={ic.value} value={ic.value}>
                              <span className="flex items-center gap-2">
                                <IcComp className="w-4 h-4" />
                                {ic.label}
                              </span>
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="h-px bg-border" />

                  {/* Category */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((c) => (
                          <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Content Type */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Content Type</Label>
                    <Select value={contentType} onValueChange={setContentType}>
                      <SelectTrigger className="h-9"><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>
                        {CONTENT_TYPES.map((ct) => (
                          <SelectItem key={ct.value} value={ct.value}>{ct.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Audience */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Audience</Label>
                    <Select value={audience} onValueChange={setAudience}>
                      <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {AUDIENCES.map((a) => (
                          <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Suggestions */}
              <Card>
                <CardHeader className="px-5 py-4 pb-2">
                  <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Suggestions for Writers
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5 space-y-4">
                  {/* Suggested Title */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Suggested Title</Label>
                    <Input
                      value={suggestedTitle}
                      onChange={(e) => setSuggestedTitle(e.target.value)}
                      placeholder="e.g. [Event Name] - Highlights"
                      className="h-9 text-sm"
                    />
                    <p className="text-[10px] text-muted-foreground leading-snug">
                      Auto-filled as the post title when someone picks this template.
                    </p>
                  </div>

                  <div className="h-px bg-border" />

                  {/* Tags */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Suggested Tags</Label>
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs gap-1 pr-1 bg-muted"
                          >
                            #{tag}
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="hover:bg-background rounded-full p-0.5 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleTagKeyDown}
                      onBlur={handleAddTag}
                      placeholder="Type a tag, press Enter"
                      className="h-9 text-sm"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

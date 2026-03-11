'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Save,
  ArrowLeft,
  Upload,
  X,
  Send,
  Plus,
  Tag,
  Clock,
  Palette,
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

interface PostOption {
  id: string
  title: string
}

interface ClubFormProps {
  user: { id: string; role?: string }
  departmentOptions: { label: string; value: string }[]
  postOptions?: PostOption[]
  initialData?: {
    title?: string
    classification?: string
    department?: string
    manualStatus?: string
    editorialDescription?: string
    heroImage?: string
    heroImageUrl?: string
    logo?: string
    logoUrl?: string
    featured?: boolean
    socialLinks?: {
      website?: string
      instagram?: string
      linkedin?: string
      twitter?: string
      github?: string
    }
    theme?: {
      primaryColor?: string
      accentColor?: string
      cardStyle?: string
      fontPreset?: string
    }
    tags?: string[]
    relatedPosts?: string[]
    publishedAt?: string
    meta?: { title?: string; description?: string; image?: string; imageUrl?: string }
  }
  clubId?: string
  isEdit?: boolean
}

const CARD_STYLES = [
  { label: 'Default', value: 'default' },
  { label: 'Glass', value: 'glass' },
  { label: 'Bordered', value: 'bordered' },
  { label: 'Elevated', value: 'elevated' },
]

const FONT_PRESETS = [
  { label: 'Default (Inter)', value: 'default' },
  { label: 'Modern (Space Grotesk)', value: 'modern' },
  { label: 'Classic (Merriweather)', value: 'classic' },
  { label: 'Technical (JetBrains Mono)', value: 'technical' },
]

const CLASSIFICATIONS = [
  { label: 'Technical', value: 'technical' },
  { label: 'Cultural', value: 'cultural' },
  { label: 'Sports', value: 'sports' },
  { label: 'Social', value: 'social' },
  { label: 'Professional', value: 'professional' },
  { label: 'Other', value: 'other' },
]

export function ClubForm({
  user: _user,
  departmentOptions,
  postOptions = [],
  initialData,
  clubId,
  isEdit = false,
}: ClubFormProps) {
  const router = useRouter()
  const { toast } = useToast()

  const [title, setTitle] = useState(initialData?.title || '')
  const [classification, setClassification] = useState(initialData?.classification || '')
  const [department, setDepartment] = useState(initialData?.department || '')
  const [manualStatus, setManualStatus] = useState(initialData?.manualStatus || 'active')
  const [content, setContent] = useState(initialData?.editorialDescription || '')
  const [featured, setFeatured] = useState(initialData?.featured || false)

  // Images
  const [heroImageId, setHeroImageId] = useState<string | undefined>(initialData?.heroImage)
  const [heroImagePreview, setHeroImagePreview] = useState<string | undefined>(initialData?.heroImageUrl)
  const [logoId, setLogoId] = useState<string | undefined>(initialData?.logo)
  const [logoPreview, setLogoPreview] = useState<string | undefined>(initialData?.logoUrl)
  const [isUploadingHero, setIsUploadingHero] = useState(false)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)

  // Social links
  const [website, setWebsite] = useState(initialData?.socialLinks?.website || '')
  const [instagram, setInstagram] = useState(initialData?.socialLinks?.instagram || '')
  const [linkedin, setLinkedin] = useState(initialData?.socialLinks?.linkedin || '')
  const [twitter, setTwitter] = useState(initialData?.socialLinks?.twitter || '')
  const [github, setGithub] = useState(initialData?.socialLinks?.github || '')

  // SEO
  const [metaTitle, setMetaTitle] = useState(initialData?.meta?.title || '')
  const [metaDescription, setMetaDescription] = useState(initialData?.meta?.description || '')
  const [metaImageId, setMetaImageId] = useState<string | undefined>(initialData?.meta?.image)
  const [metaImagePreview, setMetaImagePreview] = useState<string | undefined>(initialData?.meta?.imageUrl)
  const [isUploadingMetaImage, setIsUploadingMetaImage] = useState(false)

  // Theme
  const [primaryColor, setPrimaryColor] = useState(initialData?.theme?.primaryColor || '#0047AB')
  const [accentColor, setAccentColor] = useState(initialData?.theme?.accentColor || '')
  const [cardStyle, setCardStyle] = useState(initialData?.theme?.cardStyle || 'default')
  const [fontPreset, setFontPreset] = useState(initialData?.theme?.fontPreset || 'default')

  // Tags
  const [tags, setTags] = useState<string[]>(initialData?.tags || [])
  const [tagInput, setTagInput] = useState('')

  // Related posts
  const [relatedPosts, setRelatedPosts] = useState<string[]>(initialData?.relatedPosts || [])

  // Publishing
  const [publishedAt, setPublishedAt] = useState(initialData?.publishedAt || '')

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAddTag = () => {
    const newTag = tagInput.trim().toLowerCase()
    if (newTag && !tags.includes(newTag)) {
      setTags(prev => [...prev, newTag])
    }
    setTagInput('')
  }

  const handleRemoveTag = (tag: string) => {
    setTags(prev => prev.filter(t => t !== tag))
  }

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      handleAddTag()
    }
    if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      setTags(prev => prev.slice(0, -1))
    }
  }

  const handleImageUpload = async (
    file: File,
    type: 'hero' | 'logo' | 'metaImage',
  ) => {
    const uploaders = {
      hero: { setUploading: setIsUploadingHero, setId: setHeroImageId, setPreview: setHeroImagePreview, label: 'Hero image' },
      logo: { setUploading: setIsUploadingLogo, setId: setLogoId, setPreview: setLogoPreview, label: 'Logo' },
      metaImage: { setUploading: setIsUploadingMetaImage, setId: setMetaImageId, setPreview: setMetaImagePreview, label: 'SEO image' },
    }
    const { setUploading, setId, setPreview, label } = uploaders[type]

    setUploading(true)
    try {
      const result = await uploadToCloudinaryDirect(file, file.name.replace(/\.[^/.]+$/, ''))
      if (result?.id) {
        setId(result.id)
        setPreview(result.url)
        toast({ title: 'Image uploaded', description: `${label} uploaded successfully.` })
      }
    } catch {
      toast({ title: 'Upload failed', description: 'Please try again.', variant: 'destructive' })
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (status: 'draft' | 'published') => {
    if (!title.trim()) {
      toast({ title: 'Error', description: 'Club name is required.', variant: 'destructive' })
      return
    }

    setIsSubmitting(true)
    try {
      const url = isEdit ? `/api/clubs/${clubId}` : '/api/clubs'
      const method = isEdit ? 'PATCH' : 'POST'

      const body: Record<string, unknown> = {
        title: title.trim(),
        dataSource: 'manual',
        classification: classification || undefined,
        department: department || undefined,
        manualStatus,
        featured,
        _status: status,
        heroImage: heroImageId || undefined,
        logo: logoId || undefined,
        socialLinks: { website, instagram, linkedin, twitter, github },
        theme: { primaryColor, accentColor: accentColor || undefined, cardStyle, fontPreset },
        tags: tags.length > 0 ? tags : undefined,
        relatedPosts: relatedPosts.length > 0 ? relatedPosts : undefined,
        publishedAt: publishedAt || undefined,
        meta: {
          title: metaTitle.trim() || title.trim(),
          description: metaDescription.trim() || undefined,
          image: metaImageId || undefined,
        },
      }

      if (content && content !== '<p></p>') {
        body.editorialDescription = htmlToLexical(content)
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
            ? `Club ${isEdit ? 'updated' : 'created'} and published!`
            : `Club ${isEdit ? 'updated' : 'saved'} as draft.`,
        })
        setTimeout(() => {
          router.push('/user/clubs')
          router.refresh()
        }, 800)
      } else {
        toast({
          title: 'Error',
          description: data.errors?.[0]?.message || data.message || `Failed to ${isEdit ? 'update' : 'create'} club.`,
          variant: 'destructive',
        })
      }
    } catch (err) {
      toast({ title: 'Error', description: 'An error occurred. Please try again.', variant: 'destructive' })
      console.error('Club submission error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header actions */}
      <div className="flex items-center justify-between">
        <Link
          href="/user/clubs"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Clubs
        </Link>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => handleSubmit('draft')}
            disabled={isSubmitting}
          >
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
        <h2 className="text-lg font-semibold">Basic Information</h2>

        <div>
          <Label htmlFor="title">Club Name *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. IEEE Student Branch"
            className="mt-1"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="classification">Classification</Label>
            <select
              id="classification"
              value={classification}
              onChange={(e) => setClassification(e.target.value)}
              className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-border bg-background"
            >
              <option value="">Select type...</option>
              {CLASSIFICATIONS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="department">Department</Label>
            <select
              id="department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-border bg-background"
            >
              <option value="">Select department...</option>
              {departmentOptions.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              value={manualStatus}
              onChange={(e) => setManualStatus(e.target.value)}
              className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-border bg-background"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="featured"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
            className="rounded border-border"
          />
          <Label htmlFor="featured" className="text-sm cursor-pointer">
            Feature this club on the main page
          </Label>
        </div>
      </section>

      {/* Images */}
      <section className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="text-lg font-semibold">Images</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Hero Image */}
          <div>
            <Label>Hero / Banner Image</Label>
            <div className="mt-1">
              {heroImagePreview ? (
                <div className="relative aspect-video rounded-lg overflow-hidden border border-border">
                  <Image src={heroImagePreview} alt="Hero preview" fill className="object-cover" />
                  <button
                    onClick={() => { setHeroImageId(undefined); setHeroImagePreview(undefined) }}
                    className="absolute top-2 right-2 p-1 rounded-full bg-background/80 hover:bg-background"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center aspect-video rounded-lg border-2 border-dashed border-border hover:border-accent/50 cursor-pointer transition-colors">
                  <Upload className="h-8 w-8 text-muted-foreground/50 mb-2" />
                  <span className="text-sm text-muted-foreground">
                    {isUploadingHero ? 'Uploading...' : 'Click to upload'}
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

          {/* Logo */}
          <div>
            <Label>Club Logo</Label>
            <div className="mt-1">
              {logoPreview ? (
                <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-border">
                  <Image src={logoPreview} alt="Logo preview" fill className="object-cover" />
                  <button
                    onClick={() => { setLogoId(undefined); setLogoPreview(undefined) }}
                    className="absolute top-1 right-1 p-1 rounded-full bg-background/80 hover:bg-background"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-32 h-32 rounded-xl border-2 border-dashed border-border hover:border-accent/50 cursor-pointer transition-colors">
                  <Upload className="h-6 w-6 text-muted-foreground/50 mb-1" />
                  <span className="text-xs text-muted-foreground">
                    {isUploadingLogo ? 'Uploading...' : 'Upload logo'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={isUploadingLogo}
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleImageUpload(file, 'logo')
                    }}
                  />
                </label>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Description */}
      <section className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="text-lg font-semibold">Description</h2>
        <RichTextEditor
          value={content}
          onChange={setContent}
          placeholder="Write about this club — history, activities, achievements..."
        />
      </section>

      {/* Social Links */}
      <section className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="text-lg font-semibold">Social Links</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="website">Website</Label>
            <Input id="website" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://..." className="mt-1" />
          </div>
          <div>
            <Label htmlFor="instagram">Instagram</Label>
            <Input id="instagram" value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="https://instagram.com/..." className="mt-1" />
          </div>
          <div>
            <Label htmlFor="linkedin">LinkedIn</Label>
            <Input id="linkedin" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="https://linkedin.com/..." className="mt-1" />
          </div>
          <div>
            <Label htmlFor="twitter">Twitter / X</Label>
            <Input id="twitter" value={twitter} onChange={(e) => setTwitter(e.target.value)} placeholder="https://x.com/..." className="mt-1" />
          </div>
          <div>
            <Label htmlFor="github">GitHub</Label>
            <Input id="github" value={github} onChange={(e) => setGithub(e.target.value)} placeholder="https://github.com/..." className="mt-1" />
          </div>
        </div>
      </section>

      {/* Theme */}
      <section className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Theme
        </h2>
        <p className="text-sm text-muted-foreground">Customize the visual appearance of this club&apos;s landing page.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="primaryColor">Primary Color</Label>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="color"
                id="primaryColorPicker"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-10 h-10 rounded border border-border cursor-pointer"
              />
              <Input
                id="primaryColor"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                placeholder="#0047AB"
                className="flex-1"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="accentColor">Accent Color</Label>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="color"
                id="accentColorPicker"
                value={accentColor || '#ffffff'}
                onChange={(e) => setAccentColor(e.target.value)}
                className="w-10 h-10 rounded border border-border cursor-pointer"
              />
              <Input
                id="accentColor"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                placeholder="#FF6B35"
                className="flex-1"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="cardStyle">Card Style</Label>
            <select
              id="cardStyle"
              value={cardStyle}
              onChange={(e) => setCardStyle(e.target.value)}
              className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-border bg-background"
            >
              {CARD_STYLES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="fontPreset">Font Preset</Label>
            <select
              id="fontPreset"
              value={fontPreset}
              onChange={(e) => setFontPreset(e.target.value)}
              className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-border bg-background"
            >
              {FONT_PRESETS.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Tags */}
      <section className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Tag className="h-5 w-5" />
          Tags
        </h2>
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm"
            >
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="hover:text-destructive transition"
                aria-label={`Remove tag ${tag}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            placeholder="Type a tag and press Enter..."
            className="flex-1"
          />
          <Button type="button" variant="outline" size="sm" onClick={handleAddTag} disabled={!tagInput.trim()}>
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">Press Enter or comma to add tags.</p>
      </section>

      {/* Related Posts */}
      {postOptions.length > 0 && (
        <section className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h2 className="text-lg font-semibold">Related Posts</h2>
          <p className="text-sm text-muted-foreground">Link blog posts to this club.</p>
          <div className="flex flex-wrap gap-2">
            {postOptions.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() =>
                  setRelatedPosts((prev) =>
                    prev.includes(p.id) ? prev.filter((id) => id !== p.id) : [...prev, p.id],
                  )
                }
                className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                  relatedPosts.includes(p.id)
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background border-border hover:border-accent/50'
                }`}
              >
                {p.title}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Publishing Options */}
      <section className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Publishing Options
        </h2>
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
            placeholder={title || 'Club page title'}
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
          <p className="text-xs text-muted-foreground mb-2">Used for social media previews (Open Graph / Twitter cards).</p>
          {metaImagePreview ? (
            <div className="relative aspect-video max-w-xs rounded-lg overflow-hidden border border-border">
              <Image src={metaImagePreview} alt="SEO image preview" fill className="object-cover" />
              <button
                onClick={() => { setMetaImageId(undefined); setMetaImagePreview(undefined) }}
                className="absolute top-2 right-2 p-1 rounded-full bg-background/80 hover:bg-background"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center aspect-video max-w-xs rounded-lg border-2 border-dashed border-border hover:border-accent/50 cursor-pointer transition-colors">
              <Upload className="h-6 w-6 text-muted-foreground/50 mb-1" />
              <span className="text-xs text-muted-foreground">
                {isUploadingMetaImage ? 'Uploading...' : 'Click to upload'}
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={isUploadingMetaImage}
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleImageUpload(file, 'metaImage')
                }}
              />
            </label>
          )}
        </div>
      </section>

      {/* Bottom actions */}
      <div className="flex items-center justify-end gap-2 pb-8">
        <Button
          variant="outline"
          onClick={() => handleSubmit('draft')}
          disabled={isSubmitting}
        >
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

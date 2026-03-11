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
import { UpgradeToConoscoPrompt } from '@/components/UpgradeToConoscoPrompt'

interface ClubOption {
  id: string
  title: string
}

interface PostOption {
  id: string
  title: string
}

interface EventFormProps {
  user: { id: string; role?: string }
  departmentOptions: { label: string; value: string }[]
  clubOptions: ClubOption[]
  postOptions: PostOption[]
  initialData?: {
    title?: string
    eventType?: string
    department?: string
    dataSource?: string
    manualStatus?: string
    startDate?: string
    endDate?: string
    venue?: string
    editorialDescription?: string
    heroImage?: string
    heroImageUrl?: string
    featured?: boolean
    organizingClubs?: string[]
    createdByClub?: string
    registrationUrl?: string
    externalPlatform?: string
    externalEventUrl?: string
    tags?: string[]
    relatedPosts?: string[]
    publishedAt?: string
    meta?: { title?: string; description?: string; image?: string; imageUrl?: string }
  }
  eventId?: string
  isEdit?: boolean
}

const EVENT_TYPES = [
  { label: 'Workshop', value: 'workshop' },
  { label: 'Seminar', value: 'seminar' },
  { label: 'Hackathon', value: 'hackathon' },
  { label: 'Competition', value: 'competition' },
  { label: 'Cultural', value: 'cultural' },
  { label: 'Sports', value: 'sports' },
  { label: 'Guest Lecture', value: 'guest-lecture' },
  { label: 'Conference', value: 'conference' },
  { label: 'Webinar', value: 'webinar' },
  { label: 'Other', value: 'other' },
]

const STATUS_OPTIONS = [
  { label: 'Upcoming', value: 'upcoming' },
  { label: 'Ongoing', value: 'ongoing' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
]

const EXTERNAL_PLATFORMS = [
  { label: 'IEEE vTools', value: 'ieee-vtools' },
  { label: 'Unstop', value: 'unstop' },
  { label: 'Eventbrite', value: 'eventbrite' },
  { label: 'Devfolio', value: 'devfolio' },
  { label: 'Google Forms', value: 'google-forms' },
  { label: 'Other', value: 'other' },
]

export function EventForm({
  user: _user,
  departmentOptions,
  clubOptions,
  postOptions,
  initialData,
  eventId,
  isEdit = false,
}: EventFormProps) {
  void _user
  const router = useRouter()
  const { toast } = useToast()

  // Basic fields
  const [title, setTitle] = useState(initialData?.title || '')
  const [eventType, setEventType] = useState(initialData?.eventType || '')
  const [department, setDepartment] = useState(initialData?.department || '')
  const [dataSource, setDataSource] = useState(initialData?.dataSource || 'manual')
  const [manualStatus, setManualStatus] = useState(initialData?.manualStatus || 'upcoming')
  const [startDate, setStartDate] = useState(initialData?.startDate || '')
  const [endDate, setEndDate] = useState(initialData?.endDate || '')
  const [venue, setVenue] = useState(initialData?.venue || '')
  const [content, setContent] = useState(initialData?.editorialDescription || '')
  const [featured, setFeatured] = useState(initialData?.featured || false)

  // Club relationships
  const [createdByClub, setCreatedByClub] = useState(initialData?.createdByClub || '')
  const [organizingClubs, setOrganizingClubs] = useState<string[]>(initialData?.organizingClubs || [])

  // External/Registration
  const [registrationUrl, setRegistrationUrl] = useState(initialData?.registrationUrl || '')
  const [externalPlatform, setExternalPlatform] = useState(initialData?.externalPlatform || '')
  const [externalEventUrl, setExternalEventUrl] = useState(initialData?.externalEventUrl || '')

  // Hero image
  const [heroImageId, setHeroImageId] = useState<string | undefined>(initialData?.heroImage)
  const [heroImagePreview, setHeroImagePreview] = useState<string | undefined>(initialData?.heroImageUrl)
  const [isUploadingHero, setIsUploadingHero] = useState(false)

  // Tags, Related Posts, Publishing
  const [tags, setTags] = useState<string[]>(initialData?.tags || [])
  const [tagInput, setTagInput] = useState('')
  const [relatedPosts, setRelatedPosts] = useState<string[]>(initialData?.relatedPosts || [])
  const [publishedAt, setPublishedAt] = useState(initialData?.publishedAt || '')

  // SEO
  const [metaTitle, setMetaTitle] = useState(initialData?.meta?.title || '')
  const [metaDescription, setMetaDescription] = useState(initialData?.meta?.description || '')
  const [metaImageId, setMetaImageId] = useState<string | undefined>(initialData?.meta?.image)
  const [metaImagePreview, setMetaImagePreview] = useState<string | undefined>(initialData?.meta?.imageUrl)
  const [isUploadingMetaImage, setIsUploadingMetaImage] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)

  // Tag handlers
  const handleAddTag = () => {
    const trimmed = tagInput.trim().toLowerCase()
    if (trimmed && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed])
    }
    setTagInput('')
  }
  const handleRemoveTag = (tag: string) => setTags((prev) => prev.filter((t) => t !== tag))
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      handleAddTag()
    }
    if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      setTags((prev) => prev.slice(0, -1))
    }
  }

  const handleImageUpload = async (file: File, type: 'hero' | 'metaImage' = 'hero') => {
    const uploaders = {
      hero: { setUploading: setIsUploadingHero, setId: setHeroImageId, setPreview: setHeroImagePreview, label: 'Hero image' },
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

  const toggleOrganizingClub = (clubId: string) => {
    setOrganizingClubs((prev) =>
      prev.includes(clubId) ? prev.filter((id) => id !== clubId) : [...prev, clubId],
    )
  }

  const handleSubmit = async (status: 'draft' | 'published') => {
    if (!title.trim()) {
      toast({ title: 'Error', description: 'Event title is required.', variant: 'destructive' })
      return
    }

    setIsSubmitting(true)
    try {
      const url = isEdit ? `/api/events/${eventId}` : '/api/events'
      const method = isEdit ? 'PATCH' : 'POST'

      const body: Record<string, unknown> = {
        title: title.trim(),
        dataSource,
        eventType: eventType || undefined,
        department: department || undefined,
        featured,
        _status: status,
        heroImage: heroImageId || undefined,
        createdByClub: createdByClub || undefined,
        organizingClubs: organizingClubs.length > 0 ? organizingClubs : undefined,
        tags: tags.length > 0 ? tags : undefined,
        relatedPosts: relatedPosts.length > 0 ? relatedPosts : undefined,
        publishedAt: publishedAt || undefined,
        meta: {
          title: metaTitle.trim() || title.trim(),
          description: metaDescription.trim() || undefined,
          image: metaImageId || undefined,
        },
      }

      // Manual event fields
      if (dataSource === 'manual') {
        body.manualStatus = manualStatus
        body.startDate = startDate || undefined
        body.endDate = endDate || undefined
        body.venue = venue.trim() || undefined
      }

      // Registration URL (non-conosco only)
      if (dataSource !== 'conosco') {
        body.registrationUrl = registrationUrl.trim() || undefined
      }

      // External platform fields
      if (dataSource === 'external') {
        body.externalPlatform = externalPlatform || undefined
        body.externalEventUrl = externalEventUrl.trim() || undefined
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
            ? `Event ${isEdit ? 'updated' : 'created'} and published!`
            : `Event ${isEdit ? 'updated' : 'saved'} as draft.`,
        })
        setTimeout(() => {
          router.push('/user/events')
          router.refresh()
        }, 800)
      } else {
        toast({
          title: 'Error',
          description: data.errors?.[0]?.message || data.message || `Failed to ${isEdit ? 'update' : 'create'} event.`,
          variant: 'destructive',
        })
      }
    } catch (err) {
      toast({ title: 'Error', description: 'An error occurred. Please try again.', variant: 'destructive' })
      console.error('Event submission error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header actions */}
      <div className="flex items-center justify-between">
        <Link
          href="/user/events"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Events
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
          <Label htmlFor="title">Event Title *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. TechFest 2025 — AI Workshop"
            className="mt-1"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="eventType">Event Type</Label>
            <select
              id="eventType"
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-border bg-background"
            >
              <option value="">Select type...</option>
              {EVENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
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
            <Label htmlFor="dataSource">Data Source</Label>
            <select
              id="dataSource"
              value={dataSource}
              onChange={(e) => setDataSource(e.target.value)}
              className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-border bg-background"
            >
              <option value="manual">Simple CMS Event</option>
              <option value="external">External Platform</option>
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
            Feature this event
          </Label>
        </div>

        {isEdit && <UpgradeToConoscoPrompt dataSource={dataSource} />}
      </section>

      {/* Manual event details */}
      {dataSource === 'manual' && (
        <section className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h2 className="text-lg font-semibold">Event Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date & Time</Label>
              <Input
                id="startDate"
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date & Time</Label>
              <Input
                id="endDate"
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="venue">Venue</Label>
            <Input
              id="venue"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="e.g. Auditorium, Room 301"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="manualStatus">Event Status</Label>
            <select
              id="manualStatus"
              value={manualStatus}
              onChange={(e) => setManualStatus(e.target.value)}
              className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-border bg-background"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </section>
      )}

      {/* Club associations */}
      {clubOptions.length > 0 && (
        <section className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h2 className="text-lg font-semibold">Club Association</h2>

          <div>
            <Label htmlFor="createdByClub">Created By Club</Label>
            <select
              id="createdByClub"
              value={createdByClub}
              onChange={(e) => setCreatedByClub(e.target.value)}
              className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-border bg-background"
            >
              <option value="">None (institution-level event)</option>
              {clubOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label>Organizing / Collaborating Clubs</Label>
            <p className="text-xs text-muted-foreground mb-2">
              Select all clubs involved in organizing this event.
            </p>
            <div className="flex flex-wrap gap-2">
              {clubOptions.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggleOrganizingClub(c.id)}
                  className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                    organizingClubs.includes(c.id)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background border-border hover:border-accent/50'
                  }`}
                >
                  {c.title}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Hero Image */}
      <section className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="text-lg font-semibold">Hero Image</h2>
        {heroImagePreview ? (
          <div className="relative aspect-video rounded-lg overflow-hidden border border-border max-w-lg">
            <Image src={heroImagePreview} alt="Hero preview" fill className="object-cover" />
            <button
              onClick={() => { setHeroImageId(undefined); setHeroImagePreview(undefined) }}
              className="absolute top-2 right-2 p-1 rounded-full bg-background/80 hover:bg-background"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center aspect-video max-w-lg rounded-lg border-2 border-dashed border-border hover:border-accent/50 cursor-pointer transition-colors">
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
                if (file) handleImageUpload(file)
              }}
            />
          </label>
        )}
      </section>

      {/* Description */}
      <section className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="text-lg font-semibold">Description</h2>
        <RichTextEditor
          value={content}
          onChange={setContent}
          placeholder="Describe this event — agenda, speakers, what attendees will learn..."
        />
      </section>

      {/* External / Registration links */}
      {dataSource !== 'conosco' && (
        <section className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h2 className="text-lg font-semibold">Registration & Links</h2>
          <div>
            <Label htmlFor="registrationUrl">Registration URL</Label>
            <Input
              id="registrationUrl"
              value={registrationUrl}
              onChange={(e) => setRegistrationUrl(e.target.value)}
              placeholder="https://forms.google.com/..."
              className="mt-1"
            />
          </div>

          {dataSource === 'external' && (
            <>
              <div>
                <Label htmlFor="externalPlatform">External Platform</Label>
                <select
                  id="externalPlatform"
                  value={externalPlatform}
                  onChange={(e) => setExternalPlatform(e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-border bg-background"
                >
                  <option value="">Select platform...</option>
                  {EXTERNAL_PLATFORMS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="externalEventUrl">External Event URL</Label>
                <Input
                  id="externalEventUrl"
                  value={externalEventUrl}
                  onChange={(e) => setExternalEventUrl(e.target.value)}
                  placeholder="https://unstop.com/hackathons/..."
                  className="mt-1"
                />
              </div>
            </>
          )}
        </section>
      )}

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
          <p className="text-sm text-muted-foreground">Link blog posts to this event.</p>
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
            placeholder={title || 'Event page title'}
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

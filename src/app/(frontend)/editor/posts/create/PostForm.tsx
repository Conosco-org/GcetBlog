'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, ArrowLeft, Eye, Upload, X, Send, Clock, Tag, Star, Plus, FileStack, XCircle } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { RichTextEditor, htmlToLexical, htmlToPlainText } from '@/components/RichTextEditor'
import { TemplateSelector, type TemplateCardData } from '@/components/templates'
import type { Category, User } from '@/payload-types'

interface PostFormProps {
  categories: Category[]
  user: User
  initialData?: {
    title?: string
    content?: string
    categories?: string[]
    tags?: string[]
    publishedAt?: string
    featuredFrom?: string
    featuredUntil?: string
    meta?: {
      title?: string
      description?: string
    }
    heroImage?: string
  }
  /** Pre-loaded template data (from URL param ?template=<id>) */
  initialTemplate?: {
    name: string
    content: string
    suggestedTitle?: string
    suggestedTags?: string[]
  }
  postId?: string
  isEdit?: boolean
}

export function PostForm({ categories, user, initialData, initialTemplate, postId, isEdit = false }: PostFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [title, setTitle] = useState(initialData?.title || initialTemplate?.suggestedTitle || '')
  const [content, setContent] = useState(initialData?.content || initialTemplate?.content || '')
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialData?.categories || [])
  const [metaTitle, setMetaTitle] = useState(initialData?.meta?.title || '')
  const [metaDescription, setMetaDescription] = useState(initialData?.meta?.description || '')
  const [tags, setTags] = useState<string[]>(initialData?.tags || initialTemplate?.suggestedTags || [])
  const [tagInput, setTagInput] = useState('')
  const [publishedAt, setPublishedAt] = useState(initialData?.publishedAt || '')
  const [featuredFrom, setFeaturedFrom] = useState(initialData?.featuredFrom || '')
  const [featuredUntil, setFeaturedUntil] = useState(initialData?.featuredUntil || '')
  const [heroImageId, setHeroImageId] = useState<string | undefined>(initialData?.heroImage)
  const [heroImagePreview, setHeroImagePreview] = useState<string | undefined>(undefined)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)
  const [activeTemplateName, setActiveTemplateName] = useState<string | null>(initialTemplate?.name || null)

  const isEditor = user.role === 'editor'

  const handleTemplateSelect = (template: TemplateCardData) => {
    setTitle(template.suggestedTitle || '')
    setContent(template.content)
    if (template.suggestedTags && Array.isArray(template.suggestedTags)) {
      setTags(template.suggestedTags)
    }
    setActiveTemplateName(template.name)
    toast({
      title: 'Template applied',
      description: `"${template.name}" loaded — feel free to edit everything.`,
    })
  }

  const handleClearTemplate = () => {
    setActiveTemplateName(null)
  }

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

  const getWordCount = (html: string) => {
    const text = htmlToPlainText(html).trim()
    if (!text) return 0
    return text.split(/\s+/).length
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Please select an image file",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image size should be less than 5MB",
        variant: "destructive",
      })
      return
    }

    setIsUploadingImage(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/media', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setHeroImageId(data.doc.id)
        // Use Cloudinary URL for preview instead of blob URL
        setHeroImagePreview(data.cloudinaryUrl || URL.createObjectURL(file))
        toast({
          title: "Success",
          description: "Image uploaded successfully to Cloudinary",
        })
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.message || "Failed to upload image",
          variant: "destructive",
        })
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "An error occurred while uploading",
        variant: "destructive",
      })
      console.error('Image upload error:', err)
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleRemoveImage = () => {
    setHeroImageId(undefined)
    setHeroImagePreview(undefined)
  }

  const handleSendForReview = async () => {
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Title is required",
        variant: "destructive",
      })
      return
    }

    if (!content || content === '<p></p>') {
      toast({
        title: "Error",
        description: "Content is required",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const url = isEdit ? `/api/posts/${postId}` : '/api/posts'
      const method = isEdit ? 'PATCH' : 'POST'
      const plainText = htmlToPlainText(content)

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          content: htmlToLexical(content),
          categories: selectedCategories,
          tags,
          authors: [user.id],
          _status: 'draft',
          submittedForReviewAt: new Date().toISOString(),
          heroImage: heroImageId,
          meta: {
            title: metaTitle.trim() || title.trim(),
            description: metaDescription.trim() || plainText.substring(0, 160).trim(),
          },
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success!",
          description: "Post submitted for review. You'll be notified when it's approved.",
        })

        setTimeout(() => {
          router.push('/editor/content')
          router.refresh()
        }, 1000)
      } else {
        toast({
          title: "Error",
          description: data.message || 'Failed to submit post for review',
          variant: "destructive",
        })
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      })
      console.error('Submit for review error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = async (status: 'draft' | 'published') => {
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Title is required",
        variant: "destructive",
      })
      return
    }

    if (!content || content === '<p></p>') {
      toast({
        title: "Error",
        description: "Content is required",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const url = isEdit ? `/api/posts/${postId}` : '/api/posts'
      const method = isEdit ? 'PATCH' : 'POST'
      const plainText = htmlToPlainText(content)

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          content: htmlToLexical(content),
          categories: selectedCategories,
          tags,
          authors: [user.id],
          _status: status,
          ...(publishedAt ? { publishedAt: new Date(publishedAt).toISOString() } : {}),
          ...(isEditor && featuredFrom ? { featuredFrom: new Date(featuredFrom).toISOString() } : {}),
          ...(isEditor && featuredUntil ? { featuredUntil: new Date(featuredUntil).toISOString() } : {}),
          heroImage: heroImageId,
          meta: {
            title: metaTitle.trim() || title.trim(),
            description: metaDescription.trim() || plainText.substring(0, 160).trim(),
          },
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Show success toast
        toast({
          title: "Success!",
          description: data.message || (status === 'published' ? 'Post published successfully!' : 'Draft saved successfully!'),
        })

        // Navigate based on status
        if (status === 'published') {
          // Navigate to main blog page to see the published post
          setTimeout(() => {
            router.push('/')
            router.refresh()
          }, 1000)
        } else {
          // Navigate to editor content page for drafts
          setTimeout(() => {
            router.push('/editor/content')
            router.refresh()
          }, 1000)
        }
      } else {
        toast({
          title: "Error",
          description: data.message || `Failed to ${isEdit ? 'update' : 'create'} post`,
          variant: "destructive",
        })
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      })
      console.error('Post submission error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  return (
    <div className="bg-card rounded-xl shadow-sm border">
      {/* Template Selector Modal */}
      <TemplateSelector
        open={showTemplateSelector}
        onOpenChange={setShowTemplateSelector}
        userRole="editor"
        onSelect={handleTemplateSelect}
        onStartBlank={() => setShowTemplateSelector(false)}
      />

      {/* Header */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 sm:gap-3">
          <Link
            href="/editor/content"
            className="inline-flex items-center justify-center h-8 w-8 sm:w-auto sm:px-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition"
            title="Back to Content"
            aria-label="Back to Content"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline ml-1 text-sm">Back</span>
          </Link>
          {!isEdit && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowTemplateSelector(true)}
              title="Use Template"
              aria-label="Use Template"
            >
              <FileStack className="w-4 h-4 sm:mr-1.5" />
              <span className="hidden sm:inline">Template</span>
            </Button>
          )}
        </div>
        <div className="flex items-center gap-1.5 sm:gap-3">
          <Button
            type="button"
            onClick={() => handleSubmit('draft')}
            disabled={isSubmitting}
            variant="outline"
            size="sm"
            title="Save as Draft"
            aria-label="Save as Draft"
          >
            <Save className="w-4 h-4 sm:mr-1.5" />
            <span className="hidden sm:inline">{isSubmitting ? 'Saving...' : 'Save Draft'}</span>
          </Button>
          
          {/* Show different buttons based on user role */}
          {user.role === 'contributor' ? (
            <Button
              type="button"
              onClick={handleSendForReview}
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
              size="sm"
              title="Send for Review"
              aria-label="Send for Review"
            >
              <Send className="w-4 h-4 sm:mr-1.5" />
              <span className="hidden sm:inline">{isSubmitting ? 'Submitting...' : 'Send for Review'}</span>
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() => handleSubmit('published')}
              disabled={isSubmitting}
              size="sm"
              title="Publish"
              aria-label="Publish"
            >
              <Eye className="w-4 h-4 sm:mr-1.5" />
              <span className="hidden sm:inline">{isSubmitting ? 'Publishing...' : 'Publish'}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Form */}
      <div className="p-6 space-y-6">
        {/* Template banner */}
        {activeTemplateName && (
          <div className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-center gap-2 text-sm">
              <FileStack className="w-4 h-4 text-primary" />
              <span>
                Using template: <strong>{activeTemplateName}</strong>
              </span>
              <span className="text-muted-foreground">— edit freely</span>
            </div>
            <button
              type="button"
              onClick={handleClearTemplate}
              className="text-muted-foreground hover:text-foreground transition"
              aria-label="Dismiss template banner"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-semibold mb-2">
            Post Title *
          </label>
          <Input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter post title..."
            className="text-lg"
            required
          />
        </div>

        {/* Hero Image */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Hero Image
          </label>
          
          {!heroImageId && !heroImagePreview ? (
            <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition">
              <input
                type="file"
                id="heroImage"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUploadingImage}
                className="hidden"
              />
              <label
                htmlFor="heroImage"
                className="cursor-pointer flex flex-col items-center"
              >
                <Upload className="w-12 h-12 text-muted-foreground mb-2" />
                <p className="text-sm font-medium mb-1">
                  {isUploadingImage ? 'Uploading...' : 'Click to upload hero image'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Recommended: 1920×1080 (16:9) • PNG, JPG, WebP • Optimize to &lt;500KB
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  💡 Tip: Keep faces in top 60% for better cropping
                </p>
              </label>
            </div>
          ) : (
            <div className="relative border rounded-lg overflow-hidden">
              {heroImagePreview ? (
                <Image
                  src={heroImagePreview}
                  alt="Hero image preview"
                  width={800}
                  height={400}
                  className="w-full h-64 object-cover"
                />
              ) : heroImageId ? (
                <div className="w-full h-64 bg-muted flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">Image uploaded</p>
                </div>
              ) : null}
              <Button
                type="button"
                onClick={handleRemoveImage}
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 rounded-full"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Content *
          </label>
          <RichTextEditor
            value={content}
            onChange={setContent}
            placeholder="Write your post content here..."
            minHeight="400px"
          />
          <p className="text-xs text-muted-foreground mt-1">
            {getWordCount(content)} words
          </p>
        </div>

        {/* Categories */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Categories
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                type="button"
                onClick={() => handleCategoryToggle(category.id)}
                variant={selectedCategories.includes(category.id) ? 'default' : 'outline'}
                size="sm"
                className="rounded-full"
              >
                {category.title}
              </Button>
            ))}
          </div>
          {selectedCategories.length === 0 && (
            <p className="text-xs text-muted-foreground mt-2">Select at least one category</p>
          )}
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            <Tag className="w-4 h-4 inline mr-1" />
            Tags
          </label>
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
          <p className="text-xs text-muted-foreground mt-1">
            Press Enter or comma to add. Tags help readers discover your post.
          </p>
        </div>

        {/* Scheduling & Featured (editors only for featured) */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Publishing Options
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="publishedAt" className="text-sm font-semibold">
                Schedule Publish Date
              </Label>
              <Input
                type="datetime-local"
                id="publishedAt"
                value={publishedAt}
                onChange={(e) => setPublishedAt(e.target.value)}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Leave empty to publish immediately, or set a future date to schedule.
              </p>
            </div>
          </div>

          {isEditor && (
            <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-amber-700 dark:text-amber-400">
                <Star className="w-4 h-4" />
                Feature This Post
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="featuredFrom" className="text-sm">
                    Featured From
                  </Label>
                  <Input
                    type="datetime-local"
                    id="featuredFrom"
                    value={featuredFrom}
                    onChange={(e) => setFeaturedFrom(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="featuredUntil" className="text-sm">
                    Featured Until
                  </Label>
                  <Input
                    type="datetime-local"
                    id="featuredUntil"
                    value={featuredUntil}
                    onChange={(e) => setFeaturedUntil(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Post will appear in the Featured section on the homepage during this date range.
              </p>
            </div>
          )}
        </div>

        {/* SEO Meta */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">SEO Meta Tags</h3>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="metaTitle" className="block text-sm font-semibold mb-2">
                Meta Title
              </label>
              <Input
                type="text"
                id="metaTitle"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder="Leave empty to use post title"
                maxLength={60}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {metaTitle.length}/60 characters
              </p>
            </div>

            <div>
              <label htmlFor="metaDescription" className="block text-sm font-semibold mb-2">
                Meta Description
              </label>
              <Textarea
                id="metaDescription"
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="Leave empty to use first 160 characters of content"
                rows={3}
                maxLength={160}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {metaDescription.length}/160 characters
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

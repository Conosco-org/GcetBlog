'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, Category } from '@/payload-types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import {
  Upload,
  Send,
  Eye,
  Save,
  Check,
  Link as LinkIcon,
  FileStack,
  XCircle,
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/utilities/ui'
import { RichTextEditor, htmlToLexical, htmlToPlainText } from '@/components/RichTextEditor'
import { TemplateSelector, type TemplateCardData } from '@/components/templates'
import { uploadToCloudinaryDirect } from '@/utilities/uploadToCloudinaryDirect'
import { fromISTInputToISOString } from '@/utilities/dateTimeIST'
import { validateMetaDescription } from '@/utilities/postValidation'

// Categories will be passed from the server component

interface CreateContentFormProps {
  user: User
  categories: Category[]
  initialTemplate?: {
    name: string
    content: string
    suggestedTitle?: string
    suggestedTags?: string[]
    contentType?: string
  } | null
}

export function CreateContentForm({ user: _user, categories: dbCategories, initialTemplate }: CreateContentFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [selectedType, setSelectedType] = useState<string>(initialTemplate?.contentType || '')
  const [title, setTitle] = useState(initialTemplate?.suggestedTitle || '')
  const [content, setContent] = useState(initialTemplate?.content || '')
  const [excerpt, setExcerpt] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>(initialTemplate?.suggestedTags || [])
  const [tagInput, setTagInput] = useState('')
  const [metaDescription, setMetaDescription] = useState('')
  const [publishDate, setPublishDate] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [featuredImage, setFeaturedImage] = useState<string | null>(null)
  const [featuredImagePreview, setFeaturedImagePreview] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [activeTemplateName, setActiveTemplateName] = useState<string | null>(initialTemplate?.name || null)

  const toggleCategory = (categoryID: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryID) ? prev.filter((c) => c !== categoryID) : [...prev, categoryID]
    )
  }

  const handleTemplateSelect = (template: TemplateCardData) => {
    if (template.suggestedTitle) setTitle(template.suggestedTitle)
    setContent(template.content)
    if (template.suggestedTags && Array.isArray(template.suggestedTags)) {
      setTags(template.suggestedTags)
    }
    if (template.contentType) setSelectedType(template.contentType)
    setActiveTemplateName(template.name)
    toast({
      title: 'Template applied',
      description: `"${template.name}" loaded \u2014 feel free to edit everything.`,
    })
  }

  const handleClearTemplate = () => {
    setActiveTemplateName(null)
  }

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast({ title: 'Error', description: 'Please select an image file.', variant: 'destructive' })
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'Error', description: 'Image must be under 5MB.', variant: 'destructive' })
      return
    }

    setUploadingImage(true)
    try {
      const result = await uploadToCloudinaryDirect(file, title || 'Featured image')
      setFeaturedImage(result.id)
      setFeaturedImagePreview(result.cloudinaryUrl)
      toast({ title: 'Image uploaded', description: 'Featured image has been set.' })
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed to upload image.', variant: 'destructive' })
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async () => {
    // Prevent double-click submissions
    if (isSaving) {
      return
    }

    if (!title || !content) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in title and content',
        variant: 'destructive',
      })
      return
    }

    const metaError = validateMetaDescription(metaDescription.trim())
    if (metaError) {
      toast({
        title: 'Error',
        description: metaError,
        variant: 'destructive',
      })
      return
    }

    setIsSaving(true)
    setSaveStatus('saving')
    
    try {
      const response = await fetch('/api/posts/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content: htmlToLexical(content),
          excerpt,
          categories: selectedCategories,
          tags,
          metaDescription,
          publishDate: publishDate ? fromISTInputToISOString(publishDate) : undefined,
          contentType: selectedType || undefined,
          featuredImage: featuredImage || undefined,
          isDraft: false,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit post')
      }
      
      setSaveStatus('saved')
      
      // Show success toast
      toast({
        title: 'Success!',
        description: 'Your post has been submitted for review',
        className: 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800',
      })
      
      // Redirect to submissions page
      setTimeout(() => {
        router.push('/contributor/submissions')
      }, 1500)
    } catch (error) {
      console.error('Error submitting content:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to submit post',
        variant: 'destructive',
      })
      setSaveStatus('idle')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveDraft = async () => {
    // Prevent double-click submissions
    if (isSaving) {
      return
    }

    if (!title || !content) {
      toast({
        title: 'Missing Information',
        description: 'Title and content are required to save a draft',
        variant: 'destructive',
      })
      return
    }

    const metaError = validateMetaDescription(metaDescription.trim())
    if (metaError) {
      toast({
        title: 'Error',
        description: metaError,
        variant: 'destructive',
      })
      return
    }

    setSaveStatus('saving')
    try {
      const response = await fetch('/api/posts/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content: htmlToLexical(content),
          excerpt,
          categories: selectedCategories,
          tags,
          metaDescription,
          publishDate: publishDate ? fromISTInputToISOString(publishDate) : undefined,
          contentType: selectedType,
          featuredImage: featuredImage || undefined,
          isDraft: true, // Save as draft
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save draft')
      }

      setSaveStatus('saved')
      
      // Show success toast
      toast({
        title: 'Draft Saved',
        description: 'Your draft has been saved successfully',
        className: 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800',
      })
      
      // Redirect to drafts page
      setTimeout(() => {
        router.push('/contributor/drafts')
        router.refresh()
      }, 1500)
    } catch (error) {
      console.error('Error saving draft:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save draft',
        variant: 'destructive',
      })
      setSaveStatus('idle')
    }
  }

  const handlePreview = () => {
    if (!title && !content) {
      toast({ title: 'Nothing to preview', description: 'Add a title or content first.', variant: 'destructive' })
      return
    }
    setShowPreview(true)
  }

  return (
    <div className="container max-w-7xl mx-auto p-6">
      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Preview</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {featuredImagePreview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={featuredImagePreview} alt="Featured" className="w-full rounded-lg object-cover max-h-64" />
            )}
            <div>
              {selectedCategories.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {selectedCategories.map((c) => (
                    <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>
                  ))}
                </div>
              )}
              <h1 className="text-2xl font-bold leading-tight">{title || <span className="text-muted-foreground italic">No title yet</span>}</h1>
              {excerpt && <p className="text-muted-foreground mt-2 text-sm">{excerpt}</p>}
            </div>
            <div
              className="prose dark:prose-invert max-w-none text-sm"
              dangerouslySetInnerHTML={{ __html: content || '<p class="text-muted-foreground italic">No content yet</p>' }}
            />
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-2 border-t">
                {tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">#{tag}</Badge>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      {/* Template Selector Modal */}
      <TemplateSelector
        open={showTemplateSelector}
        onOpenChange={setShowTemplateSelector}
        userRole="contributor"
        contentType={selectedType || undefined}
        onSelect={handleTemplateSelect}
        onStartBlank={() => setShowTemplateSelector(false)}
      />

      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Create New Content</h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">Share your ideas with the GCET community</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowTemplateSelector(true)}
              className="gap-1.5"
              title="Use Template"
              aria-label="Use Template"
            >
              <FileStack className="w-4 h-4" />
              <span className="hidden sm:inline">Use Template</span>
            </Button>
            {saveStatus === 'saving' && (
              <div className="flex items-center gap-2 text-orange-500">
                <div className="h-2 w-2 bg-orange-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium">Saving...</span>
              </div>
            )}
            {saveStatus === 'saved' && (
              <div className="flex items-center gap-2 text-green-500">
                <Check className="h-4 w-4" />
                <span className="text-sm font-medium">Saved</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Template banner */}
      {activeTemplateName && (
        <div className="mb-6 flex items-center justify-between px-4 py-2.5 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-center gap-2 text-sm">
            <FileStack className="w-4 h-4 text-primary" />
            <span>
              Using template: <strong>{activeTemplateName}</strong>
            </span>
            <span className="text-muted-foreground">- edit freely</span>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Enter your compelling title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={cn("text-lg", !title && "border-red-300 focus:border-red-500")}
            />
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <Label>Categories</Label>
            <div className="flex flex-wrap gap-2 p-4 border rounded-lg bg-card max-h-32 overflow-y-auto">
              {dbCategories.map((category) => (
                <Badge
                  key={category.id}
                  variant={selectedCategories.includes(category.id) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleCategory(category.id)}
                >
                  {category.title}
                </Badge>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                placeholder="Add tags..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <Button onClick={addTag} variant="outline" type="button">
                <LinkIcon className="h-4 w-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button onClick={() => removeTag(tag)} className="ml-1 hover:text-destructive">
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Content Editor */}
          <div className="space-y-2">
            <Label>Content *</Label>
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="Start writing your story..."
              minHeight="400px"
            />
            <div className="text-xs text-muted-foreground text-right">
              {htmlToPlainText(content).split(/\s+/).filter(Boolean).length} / 3,000 words
            </div>
          </div>
        </div>

        {/* Sidebar - Right Column */}
        <div className="space-y-6">
          {/* Publish Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Publish Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Featured Image */}
              <div className="space-y-2">
                <Label>Featured Image</Label>
                {featuredImagePreview ? (
                  <div className="relative rounded-lg overflow-hidden border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={featuredImagePreview}
                      alt="Featured"
                      className="w-full h-40 object-cover"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      type="button"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setFeaturedImage(null)
                        setFeaturedImagePreview(null)
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer block">
                    {uploadingImage ? (
                      <>
                        <div className="h-8 w-8 mx-auto mb-2 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        <p className="text-sm text-muted-foreground">Uploading...</p>
                      </>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground mb-2">Upload featured image</p>
                        <p className="text-xs text-muted-foreground mb-3">
                          📐 Recommended: 900×600 (3:2) • Optimize to &lt;500KB
                        </p>
                        <span className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background px-3 py-1.5">
                          Choose File
                        </span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                    />
                  </label>
                )}
              </div>

              {/* Excerpt */}
              <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt/Summary</Label>
                <Textarea
                  id="excerpt"
                  placeholder="Brief summary of your content..."
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">{excerpt.length}/200 characters</p>
              </div>

              {/* Publication Date */}
              <div className="space-y-2">
                <Label htmlFor="publishDate">Publication Date</Label>
                <Input
                  id="publishDate"
                  type="datetime-local"
                  value={publishDate}
                  onChange={(e) => setPublishDate(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Time is interpreted in IST.</p>
              </div>

              {/* SEO Meta Description */}
              <div className="space-y-2">
                <Label htmlFor="metaDescription">SEO Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  placeholder="SEO-friendly description..."
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  rows={2}
                  maxLength={160}
                />
                <p className="text-xs text-muted-foreground">{metaDescription.length}/160 characters</p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="space-y-2">
            {(!title || !content) && (
              <div className="text-xs text-muted-foreground p-2 bg-muted rounded">
                Required: {!title && 'Title'} {!content && 'Content'}
              </div>
            )}
            <Button
              className="w-full gap-2"
              onClick={handleSubmit}
              disabled={isSaving || !title || !content}
            >
              <Send className="h-4 w-4" />
              Submit for Review
            </Button>
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={handlePreview}
              type="button"
            >
              <Eye className="h-4 w-4" />
              Preview
            </Button>
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={handleSaveDraft}
              type="button"
            >
              <Save className="h-4 w-4" />
              Save Draft
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

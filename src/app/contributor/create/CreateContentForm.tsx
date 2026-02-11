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
  FileText,
  Camera,
  BookOpen,
  FileEdit,
  GraduationCap,
  CalendarDays,
  Upload,
  Send,
  Eye,
  Save,
  Check,
  Link as LinkIcon,
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  Heading3,
  Type,
  List,
  ListOrdered,
  Quote,
  Code,
  Image as ImageIcon,
  Video,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from 'lucide-react'
import { cn } from '@/utilities/ui'

const contentTypes = [
  {
    id: 'news',
    icon: FileText,
    title: 'News Article',
    description: 'Breaking news, announcements, updates',
  },
  {
    id: 'event',
    icon: CalendarDays,
    title: 'Event Coverage',
    description: 'Event reports, reviews, previews',
  },
  {
    id: 'literary',
    icon: BookOpen,
    title: 'Literary Post',
    description: 'Poetry, stories, reviews, analysis',
  },
  {
    id: 'media',
    icon: Camera,
    title: 'Media Post',
    description: 'Photo stories, videos, multimedia',
  },
  {
    id: 'tutorial',
    icon: FileEdit,
    title: 'Tutorial/Guide',
    description: 'How-to guides, tutorials, tips',
  },
  {
    id: 'academic',
    icon: GraduationCap,
    title: 'Academic Content',
    description: 'Research, academic discussions',
  },
]

// Categories will be passed from the server component

interface CreateContentFormProps {
  user: User
  categories: Category[]
}

export function CreateContentForm({ user, categories: dbCategories }: CreateContentFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [selectedType, setSelectedType] = useState<string>('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [metaDescription, setMetaDescription] = useState('')
  const [publishDate, setPublishDate] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [featuredImage, setFeaturedImage] = useState<string | null>(null)
  const [featuredImagePreview, setFeaturedImagePreview] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    )
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
      const formData = new FormData()
      formData.append('file', file)
      formData.append('alt', title || 'Featured image')

      const res = await fetch('/api/media', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })

      if (!res.ok) {
        throw new Error('Upload failed')
      }

      const data = await res.json()
      setFeaturedImage(data.doc.id)
      setFeaturedImagePreview(data.doc.url || URL.createObjectURL(file))
      toast({ title: 'Image uploaded', description: 'Featured image has been set.' })
    } catch {
      toast({ title: 'Error', description: 'Failed to upload image.', variant: 'destructive' })
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async () => {
    if (!title || !content || !selectedType) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in title, content, and select a content type',
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
          content,
          excerpt,
          categories: selectedCategories,
          tags,
          metaDescription,
          publishDate,
          contentType: selectedType,
          featuredImage: featuredImage || undefined,
          isDraft: false, // Submit for review
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
    if (!title || !content) {
      toast({
        title: 'Missing Information',
        description: 'Title and content are required to save a draft',
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
          content,
          excerpt,
          categories: selectedCategories,
          tags,
          metaDescription,
          publishDate,
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
      
      setTimeout(() => setSaveStatus('idle'), 2000)
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
    toast({
      title: 'Coming Soon',
      description: 'Preview feature will be available soon',
    })
  }

  return (
    <div className="container max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Create New Content</h1>
            <p className="text-muted-foreground mt-1">Share your ideas with the GCET community</p>
          </div>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Content Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Content Type *</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {contentTypes.map((type) => {
                  const Icon = type.icon
                  return (
                    <button
                      key={type.id}
                      onClick={() => setSelectedType(type.id)}
                      aria-pressed={selectedType === type.id}
                      className={cn(
                        'flex flex-col items-start p-4 rounded-lg border-2 transition-all text-left',
                        selectedType === type.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      )}
                    >
                      <Icon className="h-6 w-6 mb-2" />
                      <h3 className="font-semibold text-sm mb-1">{type.title}</h3>
                      <p className="text-xs text-muted-foreground">{type.description}</p>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

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
                  variant={selectedCategories.includes(category.title) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleCategory(category.title)}
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
            <Card>
              <CardContent className="p-0">
                {/* Toolbar */}
                <div className="flex flex-wrap gap-1 p-2 border-b bg-muted/50">
                  <Button variant="ghost" size="sm" type="button" aria-label="Bold">
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" type="button" aria-label="Italic">
                    <Italic className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" type="button" aria-label="Underline">
                    <Underline className="h-4 w-4" />
                  </Button>
                  <div className="w-px h-6 bg-border mx-1" />
                  <Button variant="ghost" size="sm" type="button" aria-label="Heading 1">
                    <Heading1 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" type="button" aria-label="Heading 2">
                    <Heading2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" type="button" aria-label="Heading 3">
                    <Heading3 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" type="button" aria-label="Paragraph">
                    <Type className="h-4 w-4" />
                  </Button>
                  <div className="w-px h-6 bg-border mx-1" />
                  <Button variant="ghost" size="sm" type="button" aria-label="Bullet list">
                    <List className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" type="button" aria-label="Numbered list">
                    <ListOrdered className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" type="button" aria-label="Block quote">
                    <Quote className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" type="button" aria-label="Code block">
                    <Code className="h-4 w-4" />
                  </Button>
                  <div className="w-px h-6 bg-border mx-1" />
                  <Button variant="ghost" size="sm" type="button" aria-label="Insert link">
                    <LinkIcon className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" type="button" aria-label="Insert image">
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" type="button" aria-label="Insert video">
                    <Video className="h-4 w-4" />
                  </Button>
                  <div className="w-px h-6 bg-border mx-1" />
                  <Button variant="ghost" size="sm" type="button" aria-label="Align left">
                    <AlignLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" type="button" aria-label="Align center">
                    <AlignCenter className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" type="button" aria-label="Align right">
                    <AlignRight className="h-4 w-4" />
                  </Button>
                </div>

                {/* Editor */}
                <Textarea
                  placeholder="Start writing your story..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[400px] border-0 focus-visible:ring-0 rounded-none resize-none"
                />

                {/* Word Count */}
                <div className="p-2 border-t bg-muted/50 text-xs text-muted-foreground text-right">
                  {content.split(/\s+/).filter(Boolean).length} / 3,000 words
                </div>
              </CardContent>
            </Card>
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
                />
              </div>
            </CardContent>
          </Card>

          {/* Guidelines */}
          <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="text-blue-900 dark:text-blue-100 flex items-center gap-2">
                <Check className="h-5 w-5" />
                Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Use clear, engaging headlines</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Include relevant images</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Proofread before submitting</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Use appropriate tags</span>
              </div>
              <Button variant="link" className="p-0 h-auto text-blue-600 dark:text-blue-400" type="button">
                <FileText className="h-4 w-4 mr-1" />
                Full Guidelines
              </Button>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="space-y-2">
            {(!title || !content || !selectedType) && (
              <div className="text-xs text-muted-foreground p-2 bg-muted rounded">
                Required: {!title && 'Title'} {!content && 'Content'} {!selectedType && 'Content Type'}
              </div>
            )}
            <Button
              className="w-full gap-2"
              onClick={handleSubmit}
              disabled={isSaving || !title || !content || !selectedType}
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

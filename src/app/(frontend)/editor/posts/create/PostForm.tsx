'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, ArrowLeft, Eye, Upload, X, Send } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { RichTextEditor, htmlToLexical, htmlToPlainText } from '@/components/RichTextEditor'
import type { Category, User } from '@/payload-types'

interface PostFormProps {
  categories: Category[]
  user: User
  initialData?: {
    title?: string
    content?: string
    categories?: string[]
    meta?: {
      title?: string
      description?: string
    }
    heroImage?: string
  }
  postId?: string
  isEdit?: boolean
}

export function PostForm({ categories, user, initialData, postId, isEdit = false }: PostFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [title, setTitle] = useState(initialData?.title || '')
  const [content, setContent] = useState(initialData?.content || '')
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialData?.categories || [])
  const [metaTitle, setMetaTitle] = useState(initialData?.meta?.title || '')
  const [metaDescription, setMetaDescription] = useState(initialData?.meta?.description || '')
  const [heroImageId, setHeroImageId] = useState<string | undefined>(initialData?.heroImage)
  const [heroImagePreview, setHeroImagePreview] = useState<string | undefined>(undefined)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

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
          authors: [user.id],
          _status: status,
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
      {/* Header */}
      <div className="px-6 py-4 border-b flex items-center justify-between">
        <Link
          href="/editor/content"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Content
        </Link>
        <div className="flex gap-3">
          <Button
            type="button"
            onClick={() => handleSubmit('draft')}
            disabled={isSubmitting}
            variant="outline"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Saving...' : 'Save as Draft'}
          </Button>
          
          {/* Show different buttons based on user role */}
          {user.role === 'contributor' ? (
            <Button
              type="button"
              onClick={handleSendForReview}
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Submitting...' : 'Send for Review'}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() => handleSubmit('published')}
              disabled={isSubmitting}
            >
              <Eye className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Publishing...' : 'Publish'}
            </Button>
          )}
        </div>
      </div>

      {/* Form */}
      <div className="p-6 space-y-6">
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

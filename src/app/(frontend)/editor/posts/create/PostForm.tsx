'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, ArrowLeft, Eye, Upload, X } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
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

  const handleSubmit = async (status: 'draft' | 'published') => {
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Title is required",
        variant: "destructive",
      })
      return
    }

    if (!content.trim()) {
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

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          categories: selectedCategories,
          authors: [user.id],
          _status: status,
          heroImage: heroImageId,
          meta: {
            title: metaTitle.trim() || title.trim(),
            description: metaDescription.trim() || content.substring(0, 160).trim(),
          },
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
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
    <div className="bg-white rounded-xl shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <Link
          href="/editor/content"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
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
          <Button
            type="button"
            onClick={() => handleSubmit('published')}
            disabled={isSubmitting}
          >
            <Eye className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Publishing...' : 'Publish'}
          </Button>
        </div>
      </div>

      {/* Form */}
      <div className="p-6 space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
            Post Title *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter post title..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            required
          />
        </div>

        {/* Hero Image */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Hero Image
          </label>
          
          {!heroImageId && !heroImagePreview ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition">
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
                <Upload className="w-12 h-12 text-gray-400 mb-2" />
                <p className="text-sm font-medium text-gray-700 mb-1">
                  {isUploadingImage ? 'Uploading...' : 'Click to upload hero image'}
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG, WebP up to 5MB
                </p>
              </label>
            </div>
          ) : (
            <div className="relative border border-gray-300 rounded-lg overflow-hidden">
              {heroImagePreview ? (
                <Image
                  src={heroImagePreview}
                  alt="Hero image preview"
                  width={800}
                  height={400}
                  className="w-full h-64 object-cover"
                />
              ) : heroImageId ? (
                <div className="w-full h-64 bg-gray-100 flex items-center justify-center">
                  <p className="text-sm text-gray-500">Image uploaded</p>
                </div>
              ) : null}
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div>
          <label htmlFor="content" className="block text-sm font-semibold text-gray-700 mb-2">
            Content *
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your post content here..."
            rows={16}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            {content.length} characters • {Math.ceil(content.trim().split(/\s+/).length)} words
          </p>
        </div>

        {/* Categories */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Categories
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => handleCategoryToggle(category.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                  selectedCategories.includes(category.id)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.title}
              </button>
            ))}
          </div>
          {selectedCategories.length === 0 && (
            <p className="text-xs text-gray-500 mt-2">Select at least one category</p>
          )}
        </div>

        {/* SEO Meta */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO Meta Tags</h3>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="metaTitle" className="block text-sm font-semibold text-gray-700 mb-2">
                Meta Title
              </label>
              <input
                type="text"
                id="metaTitle"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder="Leave empty to use post title"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={60}
              />
              <p className="text-xs text-gray-500 mt-1">
                {metaTitle.length}/60 characters
              </p>
            </div>

            <div>
              <label htmlFor="metaDescription" className="block text-sm font-semibold text-gray-700 mb-2">
                Meta Description
              </label>
              <textarea
                id="metaDescription"
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="Leave empty to use first 160 characters of content"
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={160}
              />
              <p className="text-xs text-gray-500 mt-1">
                {metaDescription.length}/160 characters
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

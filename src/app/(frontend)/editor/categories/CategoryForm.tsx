'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Save, X } from 'lucide-react'

interface CategoryFormProps {
  category?: {
    id: string
    title: string
    description?: string
  }
  onSave?: (category: { id: string; title: string; description?: string }) => void
  onCancel?: () => void
}

export function CategoryForm({ category, onSave, onCancel }: CategoryFormProps) {
  const { toast } = useToast()
  const [title, setTitle] = useState(category?.title || '')
  const [description, setDescription] = useState(category?.description || '')
  const [isSaving, setIsSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim()) {
      toast({
        title: 'Error',
        description: 'Category title is required',
        variant: 'destructive',
      })
      return
    }

    setIsSaving(true)

    try {
      const response = await fetch('/api/categories', {
        method: category ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: category?.id,
          title: title.trim(),
          description: description.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save category')
      }

      const savedCategory = await response.json()

      toast({
        title: 'Success',
        description: `Category ${category ? 'updated' : 'created'} successfully`,
      })

      onSave?.(savedCategory)
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save category',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>
          {category ? 'Edit Category' : 'New Category'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter category title..."
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description..."
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isSaving} className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Category'}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
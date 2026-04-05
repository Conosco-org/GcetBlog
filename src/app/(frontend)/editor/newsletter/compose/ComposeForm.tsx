'use client'

/**
 * Newsletter Compose Form (Client Component)
 *
 * Form for creating/editing newsletter campaigns.
 * Supports manual compose (rich text) and auto-digest (post selection).
 */

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RichTextEditor } from '@/components/RichTextEditor/RichTextEditor'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Save, Send, Loader2, X } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import type { Newsletter, Category, Post } from '@/payload-types'

interface ComposeFormProps {
  newsletter: Newsletter | null
  categories: Category[]
  recentPosts: Post[]
  mode: 'create' | 'edit'
}

export function ComposeForm({ newsletter, categories, recentPosts }: ComposeFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()

  // Form state
  const [title, setTitle] = useState(newsletter?.title ?? '')
  const [subject, setSubject] = useState(newsletter?.subject ?? '')
  const [previewText, setPreviewText] = useState(newsletter?.previewText ?? '')
  const [type, setType] = useState<'manual' | 'auto_digest'>(
    (newsletter?.type as 'manual' | 'auto_digest') ?? 'manual',
  )
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>(
    (newsletter?.frequency as 'daily' | 'weekly' | 'monthly') ?? 'weekly',
  )
  const [content, setContent] = useState(newsletter?.content ? JSON.stringify(newsletter.content) : '')
  const [selectedPosts, setSelectedPosts] = useState<string[]>(
    Array.isArray(newsletter?.posts)
      ? newsletter.posts.map((p) => (typeof p === 'object' && p && 'id' in p ? String(p.id) : String(p)))
      : [],
  )
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    Array.isArray(newsletter?.targetCategories)
      ? newsletter.targetCategories.map((c) =>
          typeof c === 'object' && c && 'id' in c ? String(c.id) : String(c),
        )
      : [],
  )

  const togglePost = (postId: string) => {
    setSelectedPosts((prev) =>
      prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId],
    )
  }

  const toggleCategory = (catId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId],
    )
  }

  const handleSave = (status: 'draft' | 'scheduled' | 'send') => {
    startTransition(() => {
      // TODO: Call server action
      console.log('Save:', { title, subject, previewText, type, frequency, content, selectedPosts, selectedCategories, status })
      toast({
        title: status === 'draft' ? 'Saved as draft' : status === 'scheduled' ? 'Scheduled' : 'Sending...',
        description: 'Newsletter campaign updated.',
      })
    })
  }

  return (
    <form className="mt-6 space-y-6">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Details</CardTitle>
          <CardDescription>Basic information about your newsletter</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Campaign Title (Internal)</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Weekly Digest - Jan 2024"
              required
            />
          </div>

          <div>
            <Label htmlFor="subject">Email Subject Line</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="This appears in the inbox"
              required
            />
          </div>

          <div>
            <Label htmlFor="previewText">Preview Text (Subheader)</Label>
            <Input
              id="previewText"
              value={previewText}
              onChange={(e) => setPreviewText(e.target.value)}
              placeholder="Brief summary shown in email clients"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Campaign Type</Label>
              <Select value={type} onValueChange={(val) => setType(val as 'manual' | 'auto_digest')}>
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual Compose</SelectItem>
                  <SelectItem value="auto_digest">Auto-Digest</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {type === 'auto_digest' && (
              <div>
                <Label htmlFor="frequency">Frequency</Label>
                <Select
                  value={frequency}
                  onValueChange={(val) => setFrequency(val as 'daily' | 'weekly' | 'monthly')}
                >
                  <SelectTrigger id="frequency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Content Type-Specific */}
      {type === 'manual' && (
        <Card>
          <CardHeader>
            <CardTitle>Email Content</CardTitle>
            <CardDescription>Write your newsletter content</CardDescription>
          </CardHeader>
          <CardContent>
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="Start writing your newsletter content..."
              minHeight="500px"
            />
          </CardContent>
        </Card>
      )}

      {type === 'auto_digest' && (
        <Card>
            <CardHeader>
              <CardTitle>Select Posts</CardTitle>
              <CardDescription>Choose posts to include in the digest</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {recentPosts.map((post) => (
                  <div key={post.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    <Checkbox
                      checked={selectedPosts.includes(post.id as string)}
                      onCheckedChange={() => togglePost(post.id as string)}
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{post.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {post.meta?.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Selected: {selectedPosts.length} post{selectedPosts.length !== 1 && 's'}
              </p>
            </CardContent>
        </Card>
      )}

      {/* Target Audience */}
      <Card>
        <CardHeader>
          <CardTitle>Target Audience</CardTitle>
          <CardDescription>Filter subscribers by category interest (leave empty for all)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Badge
                key={cat.id}
                variant={selectedCategories.includes(cat.id as string) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => toggleCategory(cat.id as string)}
              >
                {cat.title}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center gap-2 sm:gap-3 justify-end sticky bottom-4 bg-background p-3 sm:p-4 border rounded-lg shadow-lg">
        <Button type="button" variant="outline" size="sm" onClick={() => router.back()} disabled={isPending}>
          <X className="w-4 h-4 sm:mr-1.5" />
          <span className="hidden sm:inline">Cancel</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => handleSave('draft')}
          disabled={isPending}
        >
          {isPending ? <Loader2 className="w-4 h-4 sm:mr-1.5 animate-spin" /> : <Save className="w-4 h-4 sm:mr-1.5" />}
          <span className="hidden sm:inline">Save Draft</span>
        </Button>
        <Button type="button" size="sm" onClick={() => handleSave('send')} disabled={isPending}>
          {isPending ? <Loader2 className="w-4 h-4 sm:mr-1.5 animate-spin" /> : <Send className="w-4 h-4 sm:mr-1.5" />}
          <span className="hidden sm:inline">Send Now</span>
        </Button>
      </div>
    </form>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, ArrowLeft, Send } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { RichTextEditor, htmlToLexical } from '@/components/RichTextEditor'

interface DepartmentFormProps {
  user: { id: string; role?: string }
  departmentOptions: { label: string; value: string }[]
  initialData?: {
    title?: string
    code?: string
    shortDescription?: string
    category?: string
    featured?: boolean
    primaryColor?: string
    accentColor?: string
    hodName?: string
    hodEmail?: string
    hodDesignation?: string
    facultyCount?: number
    studentCount?: number
    yearEstablished?: number
    website?: string
    instagram?: string
    linkedin?: string
    editorialDescription?: string
    publishedAt?: string
    meta?: { title?: string; description?: string }
  }
  departmentId?: string
  isEdit?: boolean
}

const CATEGORIES = [
  { label: 'Engineering', value: 'engineering' },
  { label: 'Science', value: 'science' },
  { label: 'Arts & Humanities', value: 'arts' },
  { label: 'Commerce', value: 'commerce' },
  { label: 'Management', value: 'management' },
  { label: 'Other', value: 'other' },
]

export function DepartmentForm({
  user: _user,
  departmentOptions,
  initialData,
  departmentId,
  isEdit = false,
}: DepartmentFormProps) {
  const router = useRouter()
  const { toast } = useToast()

  const [title, setTitle] = useState(initialData?.title || '')
  const [code, setCode] = useState(initialData?.code || '')
  const [shortDescription, setShortDescription] = useState(initialData?.shortDescription || '')
  const [category, setCategory] = useState(initialData?.category || 'engineering')
  const [featured, setFeatured] = useState(initialData?.featured || false)
  const [content, setContent] = useState(initialData?.editorialDescription || '')

  // HOD
  const [hodName, setHodName] = useState(initialData?.hodName || '')
  const [hodEmail, setHodEmail] = useState(initialData?.hodEmail || '')
  const [hodDesignation, setHodDesignation] = useState(initialData?.hodDesignation || 'Professor & Head')

  // Stats
  const [facultyCount, setFacultyCount] = useState<string>(
    initialData?.facultyCount ? String(initialData.facultyCount) : '',
  )
  const [studentCount, setStudentCount] = useState<string>(
    initialData?.studentCount ? String(initialData.studentCount) : '',
  )
  const [yearEstablished, setYearEstablished] = useState<string>(
    initialData?.yearEstablished ? String(initialData.yearEstablished) : '',
  )

  // Social
  const [website, setWebsite] = useState(initialData?.website || '')
  const [instagram, setInstagram] = useState(initialData?.instagram || '')
  const [linkedin, setLinkedin] = useState(initialData?.linkedin || '')

  // Theme
  const [primaryColor, setPrimaryColor] = useState(initialData?.primaryColor || '#0047AB')
  const [accentColor, setAccentColor] = useState(initialData?.accentColor || '')

  // SEO
  const [metaTitle, setMetaTitle] = useState(initialData?.meta?.title || '')
  const [metaDescription, setMetaDescription] = useState(initialData?.meta?.description || '')

  const [publishedAt, setPublishedAt] = useState(initialData?.publishedAt || '')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (status: 'draft' | 'published') => {
    if (!title.trim()) {
      toast({ title: 'Error', description: 'Department name is required.', variant: 'destructive' })
      return
    }
    if (!code) {
      toast({ title: 'Error', description: 'Department code is required.', variant: 'destructive' })
      return
    }

    setIsSubmitting(true)
    try {
      const url = isEdit ? `/api/departments/${departmentId}` : '/api/departments'
      const method = isEdit ? 'PATCH' : 'POST'

      const body: Record<string, unknown> = {
        title: title.trim(),
        code,
        shortDescription: shortDescription.trim() || undefined,
        category,
        featured,
        _status: status,
        hod: {
          name: hodName.trim() || undefined,
          email: hodEmail.trim() || undefined,
          designation: hodDesignation.trim() || undefined,
        },
        facultyCount: facultyCount ? Number(facultyCount) : undefined,
        studentCount: studentCount ? Number(studentCount) : undefined,
        yearEstablished: yearEstablished ? Number(yearEstablished) : undefined,
        socialLinks: {
          website: website.trim() || undefined,
          instagram: instagram.trim() || undefined,
          linkedin: linkedin.trim() || undefined,
        },
        theme: {
          primaryColor,
          accentColor: accentColor || undefined,
        },
        publishedAt: publishedAt || undefined,
        meta: {
          title: metaTitle.trim() || title.trim(),
          description: metaDescription.trim() || shortDescription.trim() || undefined,
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
          description:
            status === 'published'
              ? `Department ${isEdit ? 'updated' : 'created'} and published!`
              : `Department ${isEdit ? 'updated' : 'saved'} as draft.`,
        })
        setTimeout(() => {
          router.push('/user/departments')
          router.refresh()
        }, 800)
      } else {
        toast({
          title: 'Error',
          description:
            data.errors?.[0]?.message ||
            data.message ||
            `Failed to ${isEdit ? 'update' : 'create'} department.`,
          variant: 'destructive',
        })
      }
    } catch (err) {
      toast({ title: 'Error', description: 'An error occurred. Please try again.', variant: 'destructive' })
      console.error('Department submission error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header actions */}
      <div className="flex items-center justify-between">
        <Link
          href="/user/departments"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Departments
        </Link>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            disabled={isSubmitting}
            onClick={() => handleSubmit('draft')}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button disabled={isSubmitting} onClick={() => handleSubmit('published')}>
            <Send className="h-4 w-4 mr-2" />
            {isEdit ? 'Update & Publish' : 'Publish'}
          </Button>
        </div>
      </div>

      {/* Core fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="title">Department Name *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Computer Science & Engineering"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="code">Department Code *</Label>
          <select
            id="code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent/40"
            required
          >
            <option value="">Select department code</option>
            {departmentOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent/40"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="shortDescription">Short Description</Label>
          <Textarea
            id="shortDescription"
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            placeholder="Brief one-line description shown on listing cards"
            rows={2}
          />
        </div>
      </div>

      {/* Editorial content */}
      <div className="space-y-2">
        <Label>Editorial Content</Label>
        <p className="text-xs text-muted-foreground">
          Rich content about the department — programs, achievements, vision, mission.
        </p>
        <RichTextEditor value={content} onChange={setContent} placeholder="Write about this department…" />
      </div>

      {/* HOD details */}
      <fieldset className="border border-border rounded-xl p-5 space-y-4">
        <legend className="text-sm font-semibold px-2">Head of Department</legend>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="hodName">HOD Name</Label>
            <Input
              id="hodName"
              value={hodName}
              onChange={(e) => setHodName(e.target.value)}
              placeholder="Prof. Full Name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hodEmail">HOD Email</Label>
            <Input
              id="hodEmail"
              type="email"
              value={hodEmail}
              onChange={(e) => setHodEmail(e.target.value)}
              placeholder="hod@gcet.edu.in"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hodDesignation">Designation</Label>
            <Input
              id="hodDesignation"
              value={hodDesignation}
              onChange={(e) => setHodDesignation(e.target.value)}
              placeholder="Professor & Head"
            />
          </div>
        </div>
      </fieldset>

      {/* Stats */}
      <fieldset className="border border-border rounded-xl p-5 space-y-4">
        <legend className="text-sm font-semibold px-2">Statistics</legend>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="facultyCount">Faculty Count</Label>
            <Input
              id="facultyCount"
              type="number"
              min="0"
              value={facultyCount}
              onChange={(e) => setFacultyCount(e.target.value)}
              placeholder="e.g. 32"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="studentCount">Student Count</Label>
            <Input
              id="studentCount"
              type="number"
              min="0"
              value={studentCount}
              onChange={(e) => setStudentCount(e.target.value)}
              placeholder="e.g. 480"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="yearEstablished">Year Established</Label>
            <Input
              id="yearEstablished"
              type="number"
              min="1800"
              max={new Date().getFullYear()}
              value={yearEstablished}
              onChange={(e) => setYearEstablished(e.target.value)}
              placeholder="e.g. 1998"
            />
          </div>
        </div>
      </fieldset>

      {/* Social links */}
      <fieldset className="border border-border rounded-xl p-5 space-y-4">
        <legend className="text-sm font-semibold px-2">Social & Web Presence</legend>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://cse.gcet.edu.in"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="instagram">Instagram</Label>
            <Input
              id="instagram"
              type="url"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder="https://instagram.com/gcet_cse"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn</Label>
            <Input
              id="linkedin"
              type="url"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              placeholder="https://linkedin.com/company/..."
            />
          </div>
        </div>
      </fieldset>

      {/* Theme */}
      <fieldset className="border border-border rounded-xl p-5 space-y-4">
        <legend className="text-sm font-semibold px-2">Theme Colors</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="primaryColor">Primary Color</Label>
            <div className="flex items-center gap-2">
              <input
                id="primaryColor"
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="h-9 w-14 rounded border border-border cursor-pointer"
              />
              <Input
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="font-mono text-sm"
                placeholder="#0047AB"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="accentColor">Accent Color (optional)</Label>
            <div className="flex items-center gap-2">
              <input
                id="accentColor"
                type="color"
                value={accentColor || '#000000'}
                onChange={(e) => setAccentColor(e.target.value)}
                className="h-9 w-14 rounded border border-border cursor-pointer"
              />
              <Input
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="font-mono text-sm"
                placeholder="#E84393"
              />
            </div>
          </div>
        </div>
      </fieldset>

      {/* Publishing */}
      <fieldset className="border border-border rounded-xl p-5 space-y-4">
        <legend className="text-sm font-semibold px-2">Publishing</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="publishedAt">Publish Date</Label>
            <Input
              id="publishedAt"
              type="datetime-local"
              value={publishedAt}
              onChange={(e) => setPublishedAt(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 pt-6">
            <input
              id="featured"
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="h-4 w-4 rounded border-border"
            />
            <Label htmlFor="featured">Feature this department</Label>
          </div>
        </div>
      </fieldset>

      {/* SEO */}
      <fieldset className="border border-border rounded-xl p-5 space-y-4">
        <legend className="text-sm font-semibold px-2">SEO</legend>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="metaTitle">Meta Title</Label>
            <Input
              id="metaTitle"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              placeholder={title || 'Department title'}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="metaDescription">Meta Description</Label>
            <Textarea
              id="metaDescription"
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              placeholder="Brief description for search engines"
              rows={2}
            />
          </div>
        </div>
      </fieldset>

      {/* Bottom actions */}
      <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
        <Button variant="outline" disabled={isSubmitting} onClick={() => handleSubmit('draft')}>
          <Save className="h-4 w-4 mr-2" />
          Save Draft
        </Button>
        <Button disabled={isSubmitting} onClick={() => handleSubmit('published')}>
          <Send className="h-4 w-4 mr-2" />
          {isEdit ? 'Update & Publish' : 'Publish'}
        </Button>
      </div>
    </div>
  )
}

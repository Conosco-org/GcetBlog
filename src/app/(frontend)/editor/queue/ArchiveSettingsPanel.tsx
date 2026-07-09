'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save } from 'lucide-react'

import { Button } from '@frontend/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/card'
import { Input } from '@frontend/components/ui/input'
import { Label } from '@frontend/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@frontend/components/ui/select'
import { Switch } from '@frontend/components/ui/switch'
import { useToast } from '@frontend/components/ui/use-toast'

export interface ArchiveConfigView {
  postQueueRetentionDays: number
  postArchiveRetentionDays: number
  commentQueueRetentionDays: number
  commentArchiveRetentionDays: number
  autoArchivePostsEnabled: boolean
  autoArchiveCommentsEnabled: boolean
  jobSchedule: string
  dryRunEnabled: boolean
  lastRunAt: string | null
}

export function ArchiveSettingsPanel({ config }: { config: ArchiveConfigView }) {
  const router = useRouter()
  const { toast } = useToast()
  const [form, setForm] = useState(config)
  const [saving, setSaving] = useState(false)

  const setDays = (field: keyof ArchiveConfigView, value: string) => {
    setForm((current) => ({ ...current, [field]: Number(value) }))
  }

  const save = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/archive/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await response.json()
      if (!response.ok || !data.success) throw new Error(data.message || 'Failed to save settings')
      toast({ title: 'Settings saved', description: 'Archive retention settings were updated.' })
      router.refresh()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save settings',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Retention Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="postQueueRetentionDays">Post queue days</Label>
            <Input
              id="postQueueRetentionDays"
              type="number"
              min={1}
              max={3650}
              value={form.postQueueRetentionDays}
              onChange={(event) => setDays('postQueueRetentionDays', event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="postArchiveRetentionDays">Post archive days</Label>
            <Input
              id="postArchiveRetentionDays"
              type="number"
              min={1}
              max={3650}
              value={form.postArchiveRetentionDays}
              onChange={(event) => setDays('postArchiveRetentionDays', event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="commentQueueRetentionDays">Comment queue days</Label>
            <Input
              id="commentQueueRetentionDays"
              type="number"
              min={1}
              max={3650}
              value={form.commentQueueRetentionDays}
              onChange={(event) => setDays('commentQueueRetentionDays', event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="commentArchiveRetentionDays">Comment archive days</Label>
            <Input
              id="commentArchiveRetentionDays"
              type="number"
              min={1}
              max={3650}
              value={form.commentArchiveRetentionDays}
              onChange={(event) => setDays('commentArchiveRetentionDays', event.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-center justify-between rounded-md border p-4">
            <div>
              <Label>Auto-archive posts</Label>
              <p className="text-xs text-muted-foreground">Archive stale pending-review posts automatically.</p>
            </div>
            <Switch
              checked={form.autoArchivePostsEnabled}
              onCheckedChange={(checked) => setForm({ ...form, autoArchivePostsEnabled: checked })}
            />
          </div>
          <div className="flex items-center justify-between rounded-md border p-4">
            <div>
              <Label>Auto-archive comments</Label>
              <p className="text-xs text-muted-foreground">Archive stale pending comments automatically.</p>
            </div>
            <Switch
              checked={form.autoArchiveCommentsEnabled}
              onCheckedChange={(checked) => setForm({ ...form, autoArchiveCommentsEnabled: checked })}
            />
          </div>
          <div className="space-y-2">
            <Label>Maintenance schedule</Label>
            <Select value={form.jobSchedule} onValueChange={(value) => setForm({ ...form, jobSchedule: value })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="hourly">Hourly</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between rounded-md border p-4">
            <div>
              <Label>Dry run mode</Label>
              <p className="text-xs text-muted-foreground">Report candidates without changing records.</p>
            </div>
            <Switch
              checked={form.dryRunEnabled}
              onCheckedChange={(checked) => setForm({ ...form, dryRunEnabled: checked })}
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            Last maintenance run: {form.lastRunAt ? new Date(form.lastRunAt).toLocaleString() : 'Never'}
          </p>
          <Button onClick={save} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

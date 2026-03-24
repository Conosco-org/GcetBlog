'use client'

import { useRef, useTransition, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Download, Upload, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface SubscriberActionsProps {
  statusFilter?: string
  frequencyFilter?: string
}

export function SubscriberActions({ statusFilter = '', frequencyFilter = '' }: SubscriberActionsProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, startImporting] = useTransition()

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.set('status', statusFilter)
      if (frequencyFilter) params.set('frequency', frequencyFilter)
      const url = `/api/newsletter/subscribers/export?${params.toString()}`

      const res = await fetch(url)
      if (!res.ok) throw new Error('Export failed')

      const blob = await res.blob()
      const filename =
        res.headers.get('Content-Disposition')?.match(/filename="(.+)"/)?.[1] ??
        `subscribers-${new Date().toISOString().slice(0, 10)}.csv`

      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = filename
      a.click()
      URL.revokeObjectURL(a.href)
      toast({ title: 'Exported', description: `${filename} downloaded.` })
    } catch {
      toast({ title: 'Export failed', description: 'Please try again.', variant: 'destructive' })
    } finally {
      setIsExporting(false)
    }
  }

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    // Reset so same file can be re-selected
    e.target.value = ''

    startImporting(async () => {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/newsletter/subscribers/import', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        toast({ title: 'Import failed', description: data.error, variant: 'destructive' })
        return
      }

      const { imported, skipped, errors } = data as { imported: number; skipped: number; errors: string[] }
      toast({
        title: `Import complete`,
        description: `${imported} added, ${skipped} skipped (duplicates)${errors.length > 0 ? `, ${errors.length} errors` : ''}.`,
      })
      router.refresh()
    })
  }

  return (
    <div className="flex gap-3">
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={handleImportFile}
      />
      <Button variant="outline" onClick={handleExport} disabled={isExporting}>
        {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
        Export CSV
      </Button>
      <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isImporting}>
        {isImporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
        Import CSV
      </Button>
    </div>
  )
}

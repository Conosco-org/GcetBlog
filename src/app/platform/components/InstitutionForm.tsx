'use client'

import { useTransition, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Loader2,
  Building2,
  Globe,
  Phone,
  Mail,
  MapPin,
  Plus,
  Trash2,
  Palette,
  Server,
  Link2,
} from 'lucide-react'
import { createInstitution, updateInstitution } from '../actions'

const ALL_MODULES = [
  { value: 'blog', label: 'Blog' },
  { value: 'events', label: 'Events' },
  { value: 'clubs', label: 'Clubs' },
  { value: 'gallery', label: 'Gallery' },
  { value: 'newsletter', label: 'Newsletter' },
  { value: 'conosco', label: 'Conosco Integration' },
]

interface DomainEntry {
  hostname: string
  purpose: 'main' | 'club' | 'department'
  scopeId?: string
  verified?: boolean
}

interface InstitutionFormProps {
  institution?: {
    id: string
    name?: string
    code?: string
    shortName?: string | null
    status?: string
    tier?: string
    domains?: DomainEntry[]
    contact?: {
      email?: string | null
      phone?: string | null
      website?: string | null
      address?: string | null
    }
    settings?: {
      enabledModules?: string[]
      maxUsers?: number | null
      conoscoInstitutionCode?: string | null
      conoscoApiUrl?: string | null
    }
    branding?: {
      primaryColor?: string | null
      accentColor?: string | null
      tagline?: string | null
    }
    footerText?: string | null
  }
}

export function InstitutionForm({ institution }: InstitutionFormProps) {
  const isEdit = Boolean(institution?.id)
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [enabledModules, setEnabledModules] = useState<string[]>(
    institution?.settings?.enabledModules ?? ['blog'],
  )
  const [status, setStatus] = useState(institution?.status ?? 'trial')
  const [tier, setTier] = useState(institution?.tier ?? 'pilot')
  const [domains, setDomains] = useState<DomainEntry[]>(
    institution?.domains ?? [],
  )

  function addDomain() {
    setDomains((prev) => [...prev, { hostname: '', purpose: 'main', verified: false }])
  }

  function removeDomain(index: number) {
    setDomains((prev) => prev.filter((_, i) => i !== index))
  }

  function updateDomain(index: number, field: keyof DomainEntry, value: string | boolean) {
    setDomains((prev) =>
      prev.map((d, i) => (i === index ? { ...d, [field]: value } : d)),
    )
  }

  async function handleSubmit(formData: FormData) {
    setError(null)
    // Inject managed state into FormData
    enabledModules.forEach((m) => formData.append('enabledModules', m))
    formData.set('status', status)
    formData.set('tier', tier)

    // Inject domain entries
    domains.forEach((d, i) => {
      formData.set(`domains[${i}].hostname`, d.hostname)
      formData.set(`domains[${i}].purpose`, d.purpose)
      if (d.scopeId) formData.set(`domains[${i}].scopeId`, d.scopeId)
      formData.set(`domains[${i}].verified`, d.verified ? 'true' : 'false')
    })

    startTransition(async () => {
      const result = isEdit
        ? await updateInstitution(institution!.id, formData)
        : await createInstitution(formData)

      if (result?.error) {
        setError(result.error)
      }
    })
  }

  return (
    <form action={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* ── Basic Info ──────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Institution Name *</Label>
            <Input
              id="name"
              name="name"
              required
              defaultValue={institution?.name ?? ''}
              placeholder="e.g. Geethanjali College of Engineering & Technology"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="code">
                Code *
                <span className="text-xs text-muted-foreground ml-1">(lowercase, no spaces)</span>
              </Label>
              <Input
                id="code"
                name="code"
                required
                defaultValue={institution?.code ?? ''}
                placeholder="gcet"
                pattern="[a-z0-9-]+"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="shortName">Short Name</Label>
              <Input
                id="shortName"
                name="shortName"
                defaultValue={institution?.shortName ?? ''}
                placeholder="GCET"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Status *</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Suspended institutions show a 503 page to visitors.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label>Tier *</Label>
              <Select value={tier} onValueChange={setTier}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pilot">Pilot (Subdomain only)</SelectItem>
                  <SelectItem value="standard">Standard (Custom domain + CMS)</SelectItem>
                  <SelectItem value="premium">Premium (+ Conosco ERP)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Pilot: {'{code}'}.sites.conosco.in · Standard+: custom domain
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Domains ─────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Link2 className="h-4 w-4" />
            Custom Domains
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Map custom hostnames to this institution. The college IT team points a CNAME to your
            platform, then add the hostname here.
          </p>

          {domains.length === 0 && (
            <div className="text-sm text-muted-foreground border border-dashed rounded-lg py-6 text-center">
              No custom domains configured. This institution will use its pilot subdomain.
            </div>
          )}

          {domains.map((domain, i) => (
            <div
              key={i}
              className="border rounded-lg p-4 space-y-3 relative bg-muted/20"
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 space-y-1.5">
                  <Label>Hostname *</Label>
                  <Input
                    value={domain.hostname}
                    onChange={(e) => updateDomain(i, 'hostname', e.target.value)}
                    placeholder="blog.gcet.edu.in"
                  />
                </div>
                <div className="w-44 space-y-1.5">
                  <Label>Purpose</Label>
                  <Select
                    value={domain.purpose}
                    onValueChange={(v) => updateDomain(i, 'purpose', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="main">Main Site</SelectItem>
                      <SelectItem value="club">Club Site</SelectItem>
                      <SelectItem value="department">Department</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="mt-6 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => removeDomain(i)}
                  aria-label="Remove domain"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {(domain.purpose === 'club' || domain.purpose === 'department') && (
                <div className="space-y-1.5">
                  <Label>Scope ID</Label>
                  <Input
                    value={domain.scopeId ?? ''}
                    onChange={(e) => updateDomain(i, 'scopeId', e.target.value)}
                    placeholder={
                      domain.purpose === 'club'
                        ? 'Club slug (e.g., ieee)'
                        : 'Department code (e.g., cse)'
                    }
                  />
                </div>
              )}

              <div className="flex items-center gap-2">
                <Checkbox
                  checked={domain.verified ?? false}
                  onCheckedChange={(checked) => updateDomain(i, 'verified', Boolean(checked))}
                />
                <Label className="text-xs text-muted-foreground cursor-pointer">
                  DNS verified
                </Label>
              </div>
            </div>
          ))}

          <Button type="button" variant="outline" size="sm" onClick={addDomain}>
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Add Domain
          </Button>
        </CardContent>
      </Card>

      {/* ── Contact ─────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Contact & Web
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="contactEmail" className="flex items-center gap-1.5">
                <Mail className="h-3 w-3" /> Email
              </Label>
              <Input
                id="contactEmail"
                name="contactEmail"
                type="email"
                defaultValue={institution?.contact?.email ?? ''}
                placeholder="info@gcet.edu.in"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contactPhone" className="flex items-center gap-1.5">
                <Phone className="h-3 w-3" /> Phone
              </Label>
              <Input
                id="contactPhone"
                name="contactPhone"
                defaultValue={institution?.contact?.phone ?? ''}
                placeholder="+91 40 0000 0000"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="website" className="flex items-center gap-1.5">
                <Globe className="h-3 w-3" /> Website
              </Label>
              <Input
                id="website"
                name="website"
                defaultValue={institution?.contact?.website ?? ''}
                placeholder="https://gcet.edu.in"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="address" className="flex items-center gap-1.5">
              <MapPin className="h-3 w-3" /> Address
            </Label>
            <Textarea
              id="address"
              name="address"
              rows={2}
              defaultValue={institution?.contact?.address ?? ''}
              placeholder="Cheeryal, Keesara, Hyderabad, Telangana"
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Branding ────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Branding
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="primaryColor">Primary Color</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  id="primaryColorPicker"
                  defaultValue={institution?.branding?.primaryColor ?? '#1a5276'}
                  className="h-9 w-12 rounded border cursor-pointer"
                  onChange={(e) => {
                    const input = document.getElementById('primaryColor') as HTMLInputElement
                    if (input) input.value = e.target.value
                  }}
                />
                <Input
                  id="primaryColor"
                  name="primaryColor"
                  defaultValue={institution?.branding?.primaryColor ?? '#1a5276'}
                  placeholder="#1a5276"
                  className="flex-1"
                  onChange={(e) => {
                    const picker = document.getElementById('primaryColorPicker') as HTMLInputElement
                    if (picker && /^#[0-9a-fA-F]{6}$/.test(e.target.value)) {
                      picker.value = e.target.value
                    }
                  }}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="accentColor">Accent Color</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  id="accentColorPicker"
                  defaultValue={institution?.branding?.accentColor ?? '#2c3e50'}
                  className="h-9 w-12 rounded border cursor-pointer"
                  onChange={(e) => {
                    const input = document.getElementById('accentColor') as HTMLInputElement
                    if (input) input.value = e.target.value
                  }}
                />
                <Input
                  id="accentColor"
                  name="accentColor"
                  defaultValue={institution?.branding?.accentColor ?? ''}
                  placeholder="#2c3e50"
                  className="flex-1"
                  onChange={(e) => {
                    const picker = document.getElementById('accentColorPicker') as HTMLInputElement
                    if (picker && /^#[0-9a-fA-F]{6}$/.test(e.target.value)) {
                      picker.value = e.target.value
                    }
                  }}
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tagline">Tagline</Label>
            <Input
              id="tagline"
              name="tagline"
              defaultValue={institution?.branding?.tagline ?? ''}
              placeholder="Shaping Tomorrow's Engineers"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="footerText">Footer Text</Label>
            <Textarea
              id="footerText"
              name="footerText"
              rows={2}
              defaultValue={institution?.footerText ?? ''}
              placeholder="© 2025 GCET. All rights reserved."
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Modules & Settings ──────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Server className="h-4 w-4" />
            Modules & Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <Label className="text-sm font-medium mb-2 block">Enabled Modules</Label>
            <div className="grid grid-cols-2 gap-3">
              {ALL_MODULES.map((mod) => (
                <label
                  key={mod.value}
                  className="flex items-center gap-2.5 cursor-pointer group"
                >
                  <Checkbox
                    checked={enabledModules.includes(mod.value)}
                    onCheckedChange={(checked) => {
                      setEnabledModules((prev) =>
                        checked
                          ? [...prev, mod.value]
                          : prev.filter((m) => m !== mod.value),
                      )
                    }}
                  />
                  <span className="text-sm group-hover:text-foreground transition-colors">
                    {mod.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="maxUsers">
              Max Users{' '}
              <span className="text-muted-foreground text-xs">(0 = unlimited)</span>
            </Label>
            <Input
              id="maxUsers"
              name="maxUsers"
              type="number"
              min={0}
              defaultValue={institution?.settings?.maxUsers ?? 0}
              className="w-32"
            />
          </div>

          {enabledModules.includes('conosco') && (
            <div className="border-t pt-4 space-y-4">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Conosco ERP Integration
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="conoscoInstitutionCode">Institution Code</Label>
                  <Input
                    id="conoscoInstitutionCode"
                    name="conoscoInstitutionCode"
                    defaultValue={institution?.settings?.conoscoInstitutionCode ?? ''}
                    placeholder="GCET"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="conoscoApiUrl">API URL</Label>
                  <Input
                    id="conoscoApiUrl"
                    name="conoscoApiUrl"
                    defaultValue={institution?.settings?.conoscoApiUrl ?? ''}
                    placeholder="https://api.conosco.in/v1"
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Actions ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {isEdit ? 'Save Changes' : 'Create Institution'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/platform/institutions')}
          disabled={isPending}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}

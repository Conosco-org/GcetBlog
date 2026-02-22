'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Check } from 'lucide-react'
import { cn } from '@/utilities/ui'
import { getTemplateIcon, categoryColors, audienceLabels } from './templateUtils'
import type { TemplateCardData } from './TemplateCard'

interface TemplatePreviewProps {
  template: TemplateCardData
  onUse: (template: TemplateCardData) => void
  onBack: () => void
}

export function TemplatePreview({ template, onUse, onBack }: TemplatePreviewProps) {
  const Icon = getTemplateIcon(template.icon)

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b bg-card">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <Separator orientation="vertical" className="h-5" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-primary flex-shrink-0" />
            <h3 className="font-semibold text-sm truncate">{template.name}</h3>
          </div>
        </div>
        <Button size="sm" onClick={() => onUse(template)} className="gap-1.5">
          <Check className="w-4 h-4" />
          Use Template
        </Button>
      </div>

      {/* Meta info */}
      <div className="px-4 py-3 border-b bg-muted/30">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <Badge
            variant="secondary"
            className={cn('text-xs', categoryColors[template.category])}
          >
            {template.category}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {audienceLabels[template.audience] || template.audience}
          </Badge>
          {template.contentType && (
            <Badge variant="outline" className="text-xs">
              {template.contentType}
            </Badge>
          )}
        </div>
        {template.description && (
          <p className="text-sm text-muted-foreground">{template.description}</p>
        )}
        {template.suggestedTitle && (
          <p className="text-xs text-muted-foreground mt-2">
            <span className="font-medium">Suggested title:</span> {template.suggestedTitle}
          </p>
        )}
        {template.suggestedTags && template.suggestedTags.length > 0 && (
          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-xs text-muted-foreground font-medium">Tags:</span>
            {template.suggestedTags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Content preview */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <div dangerouslySetInnerHTML={{ __html: template.content }} />
        </div>
      </div>
    </div>
  )
}

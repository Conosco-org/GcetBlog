'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/utilities/ui'
import { getTemplateIcon, categoryColors } from './templateUtils'

export interface TemplateCardData {
  id: string
  name: string
  description?: string | null
  category: string
  contentType?: string | null
  audience: string
  icon?: string | null
  usageCount?: number | null
  content: string
  suggestedTitle?: string | null
  suggestedTags?: string[] | null
}

interface TemplateCardProps {
  template: TemplateCardData
  isSelected?: boolean
  onClick: (template: TemplateCardData) => void
}

export function TemplateCard({ template, isSelected, onClick }: TemplateCardProps) {
  const Icon = getTemplateIcon(template.icon)

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/50',
        isSelected && 'ring-2 ring-primary border-primary shadow-md'
      )}
      onClick={() => onClick(template)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center',
              isSelected
                ? 'bg-primary text-primary-foreground'
                : 'bg-primary/10 text-primary'
            )}
          >
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm leading-tight mb-1 truncate">
              {template.name}
            </h3>
            {template.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                {template.description}
              </p>
            )}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="secondary"
                className={cn('text-[10px] px-1.5 py-0', categoryColors[template.category])}
              >
                {template.category}
              </Badge>
              {template.usageCount != null && template.usageCount > 0 && (
                <span className="text-[10px] text-muted-foreground">
                  Used {template.usageCount}×
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

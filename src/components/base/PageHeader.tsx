import { cn } from '@/utilities/ui'

interface PageHeaderProps {
  /** Page title */
  title: string
  /** Page description */
  description?: string
  /** Optional action element (button, link, etc.) */
  action?: React.ReactNode
  /** Additional className */
  className?: string
}

export function PageHeader({ title, description, action, className }: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4', className)}>
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
}

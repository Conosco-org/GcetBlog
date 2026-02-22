import {
  CalendarDays,
  GraduationCap,
  FileText,
  Lightbulb,
  Users,
  Trophy,
  BookOpen,
  Code,
  Megaphone,
  Star,
  Briefcase,
  List,
} from 'lucide-react'

const iconMap = {
  calendar: CalendarDays,
  graduation: GraduationCap,
  'file-text': FileText,
  lightbulb: Lightbulb,
  users: Users,
  trophy: Trophy,
  book: BookOpen,
  code: Code,
  megaphone: Megaphone,
  star: Star,
  briefcase: Briefcase,
  list: List,
} as const

export type TemplateIconName = keyof typeof iconMap

export function getTemplateIcon(name?: string | null) {
  if (!name || !(name in iconMap)) return FileText
  return iconMap[name as TemplateIconName]
}

export const categoryColors: Record<string, string> = {
  academic: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  general: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  editorial: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  news: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
}

export const audienceLabels: Record<string, string> = {
  all: 'Everyone',
  editor_only: 'Editors',
  contributor_only: 'Contributors',
}

'use client'

import { cn } from '@/utilities/ui'
import Link from 'next/link'
import React from 'react'
import { BookOpen, GraduationCap, Users } from 'lucide-react'
import type { DepartmentCardData } from '../types'

function getCategoryColor(category?: string): string {
  switch (category) {
    case 'engineering':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
    case 'science':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
    case 'arts':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
    case 'commerce':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
    case 'management':
      return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300'
    default:
      return 'bg-gray-100 text-gray-600 dark:bg-gray-800/30 dark:text-gray-400'
  }
}

export const DepartmentCard: React.FC<{
  department: DepartmentCardData
  className?: string
}> = ({ department, className }) => {
  const href = `/departments/${department.slug}`
  const imageUrl = department.heroImageUrl ?? department.logoUrl

  return (
    <Link href={href} className="block">
      <article
        className={cn(
          'group relative overflow-hidden rounded-2xl border border-border bg-card hover:shadow-lg transition-all duration-300',
          className,
        )}
      >
        {/* Image / Banner */}
        <div className="relative aspect-[16/9] overflow-hidden bg-muted">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={department.title}
              className="object-cover w-full h-full group-hover:scale-[1.03] transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/15 to-indigo-500/10 flex items-center justify-center">
              <GraduationCap className="h-12 w-12 text-blue-500/30" />
            </div>
          )}

          {/* Category Badge */}
          {department.category && (
            <div className="absolute top-3 left-3">
              <span
                className={cn(
                  'px-2.5 py-1 text-[10px] sm:text-xs font-medium tracking-wider uppercase rounded-full backdrop-blur-sm',
                  getCategoryColor(department.category),
                )}
              >
                {department.category}
              </span>
            </div>
          )}

          {/* Featured Badge */}
          {department.featured && (
            <div className="absolute top-3 right-3">
              <span className="px-2 py-1 bg-amber-400/90 text-amber-900 text-[10px] font-bold uppercase rounded-full">
                Featured
              </span>
            </div>
          )}

          {/* Code Badge */}
          <div className="absolute bottom-3 left-3">
            <span className="px-2 py-1 bg-black/60 text-white text-[10px] font-mono font-bold rounded-md backdrop-blur-sm">
              {department.code}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5">
          <h3 className="text-base sm:text-lg font-semibold text-foreground line-clamp-2 mb-2 group-hover:text-accent transition-colors">
            {department.title}
          </h3>

          {department.shortDescription && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {department.shortDescription}
            </p>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {department.facultyCount !== undefined && department.facultyCount > 0 && (
              <div className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5 shrink-0" />
                <span>{department.facultyCount} faculty</span>
              </div>
            )}
            {department.studentCount !== undefined && department.studentCount > 0 && (
              <div className="flex items-center gap-1">
                <BookOpen className="h-3.5 w-3.5 shrink-0" />
                <span>{department.studentCount} students</span>
              </div>
            )}
          </div>
        </div>
      </article>
    </Link>
  )
}

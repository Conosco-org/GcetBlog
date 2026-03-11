import type { Metadata } from 'next'
import React from 'react'
import { Trophy, Award, Medal, Star } from 'lucide-react'

import { getClubDisplayData } from '@/modules/clubs/services/club-context'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import { ClubSubPageHeader } from '@/modules/clubs/components/ClubSubPageHeader'
import { ClubNav } from '@/modules/clubs/components/ClubNav'

type Args = {
  params: Promise<{ slug?: string }>
}

function getCategoryIcon(category: string) {
  switch (category.toLowerCase()) {
    case 'competition':
    case 'hackathon':
      return Trophy
    case 'certification':
    case 'academic':
      return Award
    case 'sports':
      return Medal
    default:
      return Star
  }
}

function getCategoryColor(category: string): string {
  switch (category.toLowerCase()) {
    case 'competition':
    case 'hackathon':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
    case 'certification':
    case 'academic':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
    case 'sports':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
    default:
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
  }
}

export default async function ClubAchievementsPage({ params: paramsPromise }: Args) {
  const { slug = '' } = await paramsPromise
  const url = `/clubs/${slug}/achievements`

  const club = await getClubDisplayData(slug)
  if (!club) return <PayloadRedirects url={url} />

  const achievements = club.recentAchievements ?? []

  // Group achievements by year
  const byYear = achievements.reduce<Record<string, typeof achievements>>((acc, a) => {
    const year = new Date(a.date).getFullYear().toString()
    if (!acc[year]) acc[year] = []
    acc[year].push(a)
    return acc
  }, {})

  const sortedYears = Object.keys(byYear).sort((a, b) => Number(b) - Number(a))

  return (
    <div className="min-h-screen">
      <ClubSubPageHeader
        club={club}
        title={`${club.title} Achievements`}
        description={
          achievements.length > 0
            ? `${achievements.length} achievement${achievements.length !== 1 ? 's' : ''} and counting`
            : undefined
        }
      />
      <ClubNav
        slug={slug}
        hasTeam={Boolean(club.coordinator || club.facultyAdvisor)}
        hasAchievements
      />

      <div className="container mx-auto px-4 sm:px-6 py-8 md:py-10">
        {achievements.length > 0 ? (
          <div className="space-y-10">
            {sortedYears.map((year) => (
              <section key={year}>
                <h2 className="text-lg font-display font-bold mb-4 text-foreground">
                  {year}
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {byYear[year].map((achievement, i) => {
                    const Icon = getCategoryIcon(achievement.category)
                    const categoryColor = getCategoryColor(achievement.category)
                    return (
                      <div
                        key={`${achievement.title}-${i}`}
                        className="rounded-2xl border border-border bg-card p-5 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start gap-3">
                          <div className="shrink-0 w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                            <Icon className="h-5 w-5 text-accent" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-foreground text-sm leading-snug">
                              {achievement.title}
                            </h3>
                            {achievement.description && (
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-3">
                                {achievement.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${categoryColor}`}>
                                {achievement.category}
                              </span>
                              <span className="text-[10px] text-muted-foreground/70">
                                {new Date(achievement.date).toLocaleDateString('en-IN', {
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            ))}

            {/* Data source note */}
            {club.dataSource === 'conosco' && (
              <p className="text-xs text-muted-foreground/60 mt-4">
                Achievement data is synced from Conosco and updated automatically.
              </p>
            )}
          </div>
        ) : (
          <div className="text-center py-16">
            <Trophy className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No achievements yet</h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              {club.dataSource === 'manual'
                ? 'Achievements will be displayed here once the club adds them.'
                : 'Achievement data from Conosco is currently unavailable. Please check back later.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const club = await getClubDisplayData(slug)

  if (!club) return { title: 'Club Not Found' }

  return {
    title: `Achievements | ${club.title} | GCET Clubs`,
    description: `Awards, certifications, and achievements by ${club.title} at GCET.`,
  }
}

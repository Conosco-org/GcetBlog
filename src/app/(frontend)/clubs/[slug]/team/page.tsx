import type { Metadata } from 'next'
import React from 'react'
import { Users2, Mail, Phone, GraduationCap, User } from 'lucide-react'

import { getClubDisplayData } from '@/modules/clubs/services/club-context'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import { ClubSubPageHeader } from '@/modules/clubs/components/ClubSubPageHeader'
import { ClubNav } from '@/modules/clubs/components/ClubNav'

type Args = {
  params: Promise<{ slug?: string }>
}

export default async function ClubTeamPage({ params: paramsPromise }: Args) {
  const { slug = '' } = await paramsPromise
  const url = `/clubs/${slug}/team`

  const club = await getClubDisplayData(slug)
  if (!club) return <PayloadRedirects url={url} />

  const hasLeadership = Boolean(club.coordinator || club.facultyAdvisor)

  return (
    <div className="min-h-screen">
      <ClubSubPageHeader
        club={club}
        title={`${club.title} Team`}
        description="Meet the people behind the club"
      />
      <ClubNav
        slug={slug}
        hasTeam
        hasAchievements={(club.recentAchievements?.length ?? 0) > 0}
      />

      <div className="container mx-auto px-4 sm:px-6 py-8 md:py-10">
        {hasLeadership ? (
          <div className="space-y-10">
            {/* Faculty Advisor */}
            {club.facultyAdvisor && (
              <section>
                <h2 className="text-lg font-display font-bold mb-4 flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-accent" />
                  Faculty Advisor
                </h2>
                <div className="rounded-2xl border border-border bg-card p-6 max-w-md">
                  <div className="flex items-start gap-4">
                    <div className="shrink-0 w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center">
                      <GraduationCap className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-lg">
                        {club.facultyAdvisor.name}
                      </h3>
                      {club.facultyAdvisor.designation && (
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {club.facultyAdvisor.designation}
                        </p>
                      )}
                      {club.facultyAdvisor.department && (
                        <p className="text-sm text-muted-foreground">
                          {club.facultyAdvisor.department}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Coordinator */}
            {club.coordinator && (
              <section>
                <h2 className="text-lg font-display font-bold mb-4 flex items-center gap-2">
                  <User className="h-5 w-5 text-accent" />
                  Coordinator
                </h2>
                <div className="rounded-2xl border border-border bg-card p-6 max-w-md">
                  <div className="flex items-start gap-4">
                    <div className="shrink-0 w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center">
                      <User className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-lg">
                        {club.coordinator.name}
                      </h3>
                      {club.coordinator.email && (
                        <a
                          href={`mailto:${club.coordinator.email}`}
                          className="flex items-center gap-1.5 text-sm text-accent hover:underline mt-1"
                        >
                          <Mail className="h-3.5 w-3.5" />
                          {club.coordinator.email}
                        </a>
                      )}
                      {club.coordinator.phone && (
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                          <Phone className="h-3.5 w-3.5" />
                          {club.coordinator.phone}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Member count */}
            {club.memberCount !== undefined && club.memberCount > 0 && (
              <section>
                <h2 className="text-lg font-display font-bold mb-4 flex items-center gap-2">
                  <Users2 className="h-5 w-5 text-accent" />
                  Members
                </h2>
                <div className="rounded-2xl border border-border bg-card p-6 max-w-md">
                  <p className="text-4xl font-bold text-foreground">{club.memberCount}</p>
                  <p className="text-sm text-muted-foreground mt-1">Active members</p>
                </div>
              </section>
            )}

            {/* Data source note */}
            {club.dataSource === 'conosco' && (
              <p className="text-xs text-muted-foreground/60 mt-8">
                Team information is synced from Conosco and updated automatically.
              </p>
            )}
          </div>
        ) : (
          <div className="text-center py-16">
            <Users2 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Team information not available</h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              {club.dataSource === 'manual'
                ? 'This club is managed manually. Team details will be available once added by an editor.'
                : 'Team information from Conosco is currently unavailable. Please check back later.'}
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
    title: `Team | ${club.title} | GCET Clubs`,
    description: `Meet the team behind ${club.title} at GCET.`,
  }
}

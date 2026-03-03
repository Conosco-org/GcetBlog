import React from 'react'
import { Users2, Mail, Phone, GraduationCap, Trophy, Calendar, Globe, Instagram, Linkedin, Twitter, Github } from 'lucide-react'
import type { ClubDisplayData } from '../types'

/**
 * ClubEnrichment — Sidebar panel showing Conosco data for clubs
 */
export const ClubEnrichment: React.FC<{
  club: ClubDisplayData
}> = ({ club }) => {
  return (
    <div className="space-y-6">
      {/* Member Stats */}
      {club.memberCount !== undefined && club.memberCount > 0 && (
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Users2 className="h-4 w-4" />
            Members
          </h3>
          <p className="text-3xl font-bold text-foreground">{club.memberCount}</p>
          <p className="text-xs text-muted-foreground mt-1">Active members</p>
        </div>
      )}

      {/* Leadership */}
      {(club.coordinator || club.facultyAdvisor) && (
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Leadership
          </h3>
          <div className="space-y-4">
            {club.coordinator && (
              <div>
                <span className="text-xs uppercase tracking-wider text-muted-foreground/70">Coordinator</span>
                <p className="text-sm font-medium text-foreground">{club.coordinator.name}</p>
                {club.coordinator.email && (
                  <a href={`mailto:${club.coordinator.email}`} className="flex items-center gap-1 text-xs text-accent hover:underline mt-0.5">
                    <Mail className="h-3 w-3" />
                    {club.coordinator.email}
                  </a>
                )}
                {club.coordinator.phone && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                    <Phone className="h-3 w-3" />
                    {club.coordinator.phone}
                  </div>
                )}
              </div>
            )}
            {club.facultyAdvisor && (
              <div>
                <span className="text-xs uppercase tracking-wider text-muted-foreground/70">Faculty Advisor</span>
                <p className="text-sm font-medium text-foreground">{club.facultyAdvisor.name}</p>
                {club.facultyAdvisor.designation && (
                  <p className="text-xs text-muted-foreground">{club.facultyAdvisor.designation}</p>
                )}
                {club.facultyAdvisor.department && (
                  <p className="text-xs text-muted-foreground">{club.facultyAdvisor.department}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Social Links */}
      {club.socialLinks && Object.values(club.socialLinks).some(Boolean) && (
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3">Connect</h3>
          <div className="flex flex-wrap gap-2">
            {club.socialLinks.website && (
              <a href={club.socialLinks.website} target="_blank" rel="noopener noreferrer"
                className="p-2 rounded-lg bg-muted hover:bg-accent/10 transition-colors" title="Website">
                <Globe className="h-4 w-4" />
              </a>
            )}
            {club.socialLinks.instagram && (
              <a href={club.socialLinks.instagram} target="_blank" rel="noopener noreferrer"
                className="p-2 rounded-lg bg-muted hover:bg-accent/10 transition-colors" title="Instagram">
                <Instagram className="h-4 w-4" />
              </a>
            )}
            {club.socialLinks.linkedin && (
              <a href={club.socialLinks.linkedin} target="_blank" rel="noopener noreferrer"
                className="p-2 rounded-lg bg-muted hover:bg-accent/10 transition-colors" title="LinkedIn">
                <Linkedin className="h-4 w-4" />
              </a>
            )}
            {club.socialLinks.twitter && (
              <a href={club.socialLinks.twitter} target="_blank" rel="noopener noreferrer"
                className="p-2 rounded-lg bg-muted hover:bg-accent/10 transition-colors" title="Twitter">
                <Twitter className="h-4 w-4" />
              </a>
            )}
            {club.socialLinks.github && (
              <a href={club.socialLinks.github} target="_blank" rel="noopener noreferrer"
                className="p-2 rounded-lg bg-muted hover:bg-accent/10 transition-colors" title="GitHub">
                <Github className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      )}

      {/* Recent Achievements */}
      {club.recentAchievements && club.recentAchievements.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Recent Achievements
          </h3>
          <div className="space-y-3">
            {club.recentAchievements.slice(0, 5).map((achievement, i) => (
              <div key={i} className="text-sm">
                <p className="font-medium text-foreground">{achievement.title}</p>
                {achievement.description && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{achievement.description}</p>
                )}
                <p className="text-xs text-muted-foreground/70 mt-0.5">
                  {new Date(achievement.date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                  {' · '}{achievement.category}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Events */}
      {club.recentEvents && club.recentEvents.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Recent Events
          </h3>
          <div className="space-y-2">
            {club.recentEvents.slice(0, 5).map((event) => (
              <div key={event.eventCode} className="flex items-start justify-between text-sm">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground truncate">{event.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(event.startDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full shrink-0 ml-2 ${
                  event.status === 'completed' ? 'bg-gray-100 text-gray-600' :
                  event.status === 'upcoming' ? 'bg-blue-100 text-blue-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {event.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Department & Classification */}
      {(club.department || club.classification) && (
        <div className="rounded-xl border border-border bg-card p-5">
          {club.classification && (
            <div className="mb-3">
              <span className="text-xs uppercase tracking-wider text-muted-foreground/70">Classification</span>
              <p className="text-sm font-medium text-foreground capitalize">{club.classification}</p>
            </div>
          )}
          {club.department && (
            <div>
              <span className="text-xs uppercase tracking-wider text-muted-foreground/70">Department</span>
              <p className="text-sm font-medium text-foreground">{club.department}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

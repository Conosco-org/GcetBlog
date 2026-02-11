'use client'

import React from 'react'

const features = [
  {
    number: '01',
    title: 'Multimedia Content',
    description: 'Publish rich content across formats \u2014 articles, poems, audio recordings, videos, and PDF documents \u2014 all in one unified platform.',
  },
  {
    number: '02',
    title: 'Creative Expression',
    description: 'A space curated by the Literary Club for essays, poetry, short stories, and thoughtful commentary on campus life and beyond.',
  },
  {
    number: '03',
    title: 'Technical Showcase',
    description: 'Share coding tutorials, project breakdowns, hackathon recaps, and technical deep-dives powered by the Coding Club.',
  },
  {
    number: '04',
    title: 'Structured Roles',
    description: 'Purpose-built for collaboration \u2014 Admins (Coding Club), Editors (Literary Club Leads), and Contributors from across the GCET fraternity.',
  },
  {
    number: '05',
    title: 'Moderated Feedback',
    description: 'Every piece of content benefits from community feedback with built-in moderation, ensuring constructive and meaningful discourse.',
  },
  {
    number: '06',
    title: 'Open to All',
    description: 'Students, staff, alumni, and the wider GCET fraternity can contribute \u2014 because great ideas come from every corner of our community.',
  },
]

export const FeaturesSection: React.FC = () => {
  return (
    <section id="about" className="py-24 md:py-32">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="max-w-2xl mb-16 animate-fade-up">
          <span className="text-xs tracking-widest uppercase text-accent font-medium">What We Offer</span>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl mt-4 mb-6 leading-[1.1]">
            Built for the
            <br />
            <span className="text-accent">GCET community</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Where technical prowess meets creative expression &mdash; a platform for collaboration, storytelling, and innovation across all departments.
          </p>
        </div>

        {/* Features List - Editorial Style */}
        <div className="space-y-0">
          {features.map((feature, index) => (
            <div
              key={feature.number}
              className={`group grid grid-cols-12 gap-4 md:gap-8 py-8 border-t border-border hover:bg-card/50 transition-colors duration-300 animate-fade-up stagger-${index + 1}`}
            >
              <div className="col-span-2 md:col-span-1">
                <span className="font-display text-2xl md:text-3xl text-accent/60 group-hover:text-accent transition-colors">
                  {feature.number}
                </span>
              </div>
              <div className="col-span-10 md:col-span-4">
                <h3 className="text-xl md:text-2xl font-semibold tracking-tight group-hover:text-accent transition-colors">
                  {feature.title}
                </h3>
              </div>
              <div className="col-span-12 md:col-span-7 md:pl-4">
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
          <div className="border-t border-border" />
        </div>
      </div>
    </section>
  )
}
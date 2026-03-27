import React from 'react'
import Link from 'next/link'
import { ArrowRight, Building2, Globe, Shield, BarChart3, Users2, GraduationCap, Calendar, FileText, CheckCircle2 } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Conosco Content Engine — One Platform for Every College',
  description:
    'A multi-tenant content engine for colleges. One platform for all clubs, blogs, departments, events, and more. Part of the Conosco institutional OS.',
}

const features = [
  {
    icon: FileText,
    title: 'Blog & Content',
    description:
      'Rich editorial content, draft approvals, scheduled publishing, SEO, and newsletter — for the whole institution.',
  },
  {
    icon: Users2,
    title: 'Student Clubs',
    description:
      'Every club gets its own page, events, gallery, and social presence. Clubs can be synced from Conosco ERP for zero duplicate entry.',
  },
  {
    icon: GraduationCap,
    title: 'Academic Departments',
    description:
      'Dedicated landing pages for each department — faculty, programs, research, and achievements all in one place.',
  },
  {
    icon: Calendar,
    title: 'Events',
    description:
      'Campus events with registration, attendance, and automatic NAAC criterion tagging. Sync from Conosco or create manually.',
  },
  {
    icon: Globe,
    title: 'Multi-Domain Routing',
    description:
      'One codebase, multiple domains. Each club or department can have its own subdomain — all pointing to the same platform.',
  },
  {
    icon: Shield,
    title: 'Role-Based Access',
    description:
      'Institution admins, blog editors, club admins, moderators — precise permissions without complexity.',
  },
]

const tiers = [
  {
    name: 'Pilot',
    domain: '{code}.sites.conosco.in',
    description: 'Start publishing in minutes. No IT team required.',
    features: [
      'Blog & Posts',
      'Clubs & Events',
      'Departments',
      'Managed subdomain',
    ],
    cta: 'Start Free Pilot',
    href: 'mailto:hello@conosco.in?subject=Content%20Engine%20Pilot%20Request',
    highlight: false,
  },
  {
    name: 'Standard',
    domain: 'Your custom domain',
    description: 'Bring your own domain. Full CMS control.',
    features: [
      'Everything in Pilot',
      'Custom domain (blog.college.edu.in)',
      'Multiple site domains',
      'Newsletter & subscribers',
    ],
    cta: 'Request Standard',
    href: 'mailto:hello@conosco.in?subject=Content%20Engine%20Standard%20Request',
    highlight: true,
  },
  {
    name: 'Premium',
    domain: 'Custom domain + Conosco ERP',
    description: 'Full institutional OS. Content + Compliance.',
    features: [
      'Everything in Standard',
      'Conosco ERP integration',
      'Live data sync (clubs, events)',
      'NAAC evidence generation',
    ],
    cta: 'Connect with Conosco',
    href: 'mailto:hello@conosco.in?subject=Content%20Engine%20Premium%20Request',
    highlight: false,
  },
]

export default function PlatformLandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-amber-500 flex items-center justify-center">
              <Building2 className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-sm">Conosco Content Engine</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign in
            </Link>
            <a
              href="mailto:hello@conosco.in?subject=Content%20Engine%20Pilot%20Request"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 transition-colors"
            >
              Request Pilot
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-6 py-20 md:py-28 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-200 bg-amber-50 text-amber-700 text-xs font-medium mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          Live Pilot at GCET — blog.gcet.edu.in
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight max-w-4xl mx-auto mb-6">
          One platform for{' '}
          <span className="text-amber-500">every part</span> of your college
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          A multi-tenant content engine for colleges. Blogs, clubs, departments, events —
          all in one place, with path-based or domain-based routing per site. Part of the
          Conosco institutional ecosystem.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="mailto:hello@conosco.in?subject=Content%20Engine%20Pilot%20Request"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 text-white font-medium hover:bg-amber-600 transition-colors"
          >
            Start Free Pilot
            <ArrowRight className="h-4 w-4" />
          </a>
          <a
            href="https://conosco.in"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            About Conosco
          </a>
        </div>
      </section>

      {/* Live example */}
      <section className="container mx-auto px-6 py-6 mb-10">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 p-6 max-w-2xl mx-auto">
          <p className="text-sm text-amber-700 dark:text-amber-400 font-medium mb-1">🎓 Live Pilot</p>
          <p className="text-sm text-muted-foreground">
            <strong>Geethanjali College of Engineering & Technology</strong> runs their campus content engine at{' '}
            <a
              href="https://blog.gcet.edu.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-600 hover:underline font-medium"
            >
              blog.gcet.edu.in
            </a>
            . Clubs, events, departments, and the college blog — all powered by this platform.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-6 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-3">Everything a college needs</h2>
        <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
          Built specifically for Indian engineering colleges. Covers all visibility requirements
          from day one.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className="rounded-2xl border border-border bg-card p-6 hover:shadow-md transition-shadow"
              >
                <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center mb-4">
                  <Icon className="h-5 w-5 text-amber-600" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Conosco ecosystem callout */}
      <section className="container mx-auto px-6 py-16">
        <div className="rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 p-8 md:p-12 text-white">
          <div className="max-w-2xl">
            <p className="text-amber-400 text-sm font-medium uppercase tracking-widest mb-3">
              The Conosco Ecosystem
            </p>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Content Engine is the visibility layer of Conosco
            </h2>
            <p className="text-gray-300 mb-6">
              Conosco is a compliance-first institutional OS for Indian colleges — managing employees,
              inventory, complaints, and NAAC evidence. The Content Engine adds the public-facing layer:
              your blog, clubs, departments, and events, all surfaced to students, parents, and the world.
            </p>
            <ul className="space-y-2 mb-8">
              {[
                'Events created in Conosco ERP → auto-appear on your site',
                'Club memberships and advisors → synced from operational truth',
                'Every event → NAAC criterion-tagged evidence, automatically',
                'Start with Content Engine. Add Conosco ERP when ready.',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-gray-300">
                  <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
            <a
              href="https://conosco.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-500 text-white font-medium hover:bg-amber-600 transition-colors text-sm"
            >
              Learn about Conosco
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Tiers */}
      <section className="container mx-auto px-6 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-3">Choose your path</h2>
        <p className="text-muted-foreground text-center mb-12 max-w-lg mx-auto">
          Start with a pilot, grow into full institutional OS integration.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-2xl border p-6 flex flex-col ${
                tier.highlight
                  ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/20'
                  : 'border-border bg-card'
              }`}
            >
              {tier.highlight && (
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-2">
                  Most Popular
                </span>
              )}
              <h3 className="text-lg font-bold mb-1">{tier.name}</h3>
              <p className="text-xs font-mono text-muted-foreground mb-3">{tier.domain}</p>
              <p className="text-sm text-muted-foreground mb-5">{tier.description}</p>
              <ul className="space-y-2 flex-1 mb-6">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href={tier.href}
                className={`text-center py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  tier.highlight
                    ? 'bg-amber-500 text-white hover:bg-amber-600'
                    : 'border border-border hover:bg-muted'
                }`}
              >
                {tier.cta}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="container mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-amber-500 flex items-center justify-center">
              <Building2 className="h-3 w-3 text-white" />
            </div>
            <span className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Conosco. All rights reserved.
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <a href="mailto:hello@conosco.in" className="hover:text-foreground transition-colors">
              hello@conosco.in
            </a>
            <a
              href="https://conosco.in"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              conosco.in
            </a>
            <Link href="/login" className="hover:text-foreground transition-colors">
              Admin Login
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

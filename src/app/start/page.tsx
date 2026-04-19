import React from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Building2,
  Globe,
  Shield,
  Users2,
  GraduationCap,
  Calendar,
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Clock,
  Zap,
  Award,
  BookOpen,
  Layers,
  MessageSquare,
  ExternalLink,
} from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Conosco Content Engine — Built for Indian Colleges',
  description:
    'A content platform built specifically for Indian engineering and autonomous colleges. Blogs, clubs, departments, and events — all in one CMS, with NAAC evidence as a by-product.',
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const painPoints = [
  {
    icon: Globe,
    problem: 'The college website is managed by IT, takes weeks to update, and looks like it's from 2011.',
    reality: '90% of college websites are static HTML or WordPress sites that faculty and clubs can\'t self-publish to.',
  },
  {
    icon: Users2,
    problem: 'Every club has a separate Instagram, WhatsApp group, and Google Drive. Nothing is searchable or permanent.',
    reality: 'When the club leadership changes each year, the entire digital history disappears with the outgoing batch.',
  },
  {
    icon: Award,
    problem: 'NAAC visit is approaching. Nobody knows where the evidence for Criterion 5.3 (student activities) is.',
    reality: 'Clubs ran 40+ events this year. Proof? Scattered across individual phones and deleted Instagram stories.',
  },
  {
    icon: FileText,
    problem: 'The department wants a professional-looking page to attract lateral admissions. IT quotes ₹2L and 3 months.',
    reality: 'A department landing page with faculty, programs, and achievements is not a 3-month project anymore.',
  },
]

const whyYes = [
  {
    objection: '"We already have a website."',
    answer:
      'Your website is managed by IT and nobody else can publish to it. This is a self-service publishing tool for clubs, departments, and editors — no IT tickets needed.',
  },
  {
    objection: '"Our students can just use Instagram."',
    answer:
      'Instagram posts disappear from feeds in hours. They aren\'t indexed by Google, can\'t be used as NAAC evidence, don\'t have contact forms, and die when the account changes hands.',
  },
  {
    objection: '"We don\'t have a technical team to set this up."',
    answer:
      'The pilot runs on a managed subdomain (gcet.sites.conosco.in). There\'s nothing to install. The first 10 posts are up on Day 1.',
  },
  {
    objection: '"Will faculty and students actually use this?"',
    answer:
      'The Payload CMS editor is simpler than Google Docs. Role-based access means each club editor only sees their own content — not a 200-field admin panel.',
  },
  {
    objection: '"What about cost? The college budget process takes a year."',
    answer:
      'The pilot is free. Adoption-first, budget-conversation-later. Most decisions stall on cost before value is seen — we remove that barrier.',
  },
  {
    objection: '"How is this different from just using WordPress?"',
    answer:
      'WordPress is one blog. This is multi-tenant: every club, every department, and the main blog share one CMS instance with separate permissions. Plus live sync from Conosco ERP for events and clubs.',
  },
]

const comparison = [
  {
    aspect: 'Self-service publishing',
    statusQuo: 'IT ticket required',
    contentEngine: 'Any editor, any time',
    winner: 'engine',
  },
  {
    aspect: 'Club digital presence',
    statusQuo: 'Instagram + WhatsApp (ephemeral)',
    contentEngine: 'Permanent, searchable, Google-indexed',
    winner: 'engine',
  },
  {
    aspect: 'Event evidence for NAAC',
    statusQuo: 'Manual collection every 5 years',
    contentEngine: 'Auto-generated as content is published',
    winner: 'engine',
  },
  {
    aspect: 'Department landing pages',
    statusQuo: '₹1–3L custom dev + 3+ months',
    contentEngine: 'Set up in < 1 day by institution admin',
    winner: 'engine',
  },
  {
    aspect: 'Role-based access',
    statusQuo: 'Everyone edits (or nobody does)',
    contentEngine: 'Blog editor, club admin, moderator — scoped',
    winner: 'engine',
  },
  {
    aspect: 'Multi-club management',
    statusQuo: '1 WordPress site per club = chaos',
    contentEngine: 'All clubs in one CMS, isolated permissions',
    winner: 'engine',
  },
  {
    aspect: 'Newsletter & subscribers',
    statusQuo: 'Manual WhatsApp broadcast',
    contentEngine: 'Built-in newsletter with auto-digest',
    winner: 'engine',
  },
  {
    aspect: 'ERP data sync',
    statusQuo: 'Double entry every semester',
    contentEngine: 'Live sync from Conosco (clubs, events)',
    winner: 'engine',
  },
]

const marketContext = [
  { stat: '40,000+', label: 'Engineering colleges in India', sub: 'Tier 2 & 3 colleges have the worst digital presence' },
  { stat: '~5,500', label: 'Autonomous institutions', sub: 'Autonomy = more clubs, events, and NAAC pressure' },
  { stat: '0', label: 'Purpose-built SaaS for this niche', sub: 'No product exists that does exactly this for Indian colleges' },
  { stat: '₹0', label: 'Cost to start the pilot', sub: 'Remove the biggest adoption barrier — budget approval' },
]

const naacCriteria = [
  { code: '5.3.1', description: 'Number of awards/medals for outstanding performance — searchable achievements database' },
  { code: '5.3.2', description: 'Presence of Student Council, activities — club pages, event archives, committee listings' },
  { code: '5.4.1', description: 'Alumni engagement — alumni blog section, department alumni listings' },
  { code: '3.3.1', description: 'Research papers, publications — faculty publications per department' },
  { code: '6.3.4', description: 'Professional development activities — event pages with faculty attendance' },
]

const features = [
  { icon: FileText, title: 'Blog & Newsletter', description: 'Draft approvals, scheduled publishing, categories, SEO, and automated newsletter digest.' },
  { icon: Users2, title: 'Club Pages', description: 'Every club gets a permanent home — events, achievements, team, and editorial content.' },
  { icon: GraduationCap, title: 'Department Pages', description: 'HOD profile, programs, faculty count, research links — content the admission team actually needs.' },
  { icon: Calendar, title: 'Events', description: 'Event registration, poster, date/venue, and post-event report — all in one record. NAAC-ready by default.' },
  { icon: Globe, title: 'Multi-Domain Routing', description: 'One CMS. Multiple domains. ieee.gcet.edu.in serves only IEEE club content. No extra hosting cost.' },
  { icon: Shield, title: 'Role-Based Access', description: 'Club editor, blog author, institution admin — each person sees only what they should.' },
  { icon: Zap, title: 'Conosco ERP Sync', description: 'If your college runs Conosco, events and clubs sync automatically — zero double entry.' },
  { icon: BookOpen, title: 'NAAC Evidence Layer', description: 'Every event, club activity, and department page is criterion-tagged and exportable as evidence.' },
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PlatformLandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-amber-500 flex items-center justify-center">
              <Building2 className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-sm">Conosco Content Engine</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#why" className="hover:text-foreground transition-colors">Why it works</a>
            <a href="#comparison" className="hover:text-foreground transition-colors">vs. Status Quo</a>
            <a href="#naac" className="hover:text-foreground transition-colors">NAAC</a>
            <a href="#objections" className="hover:text-foreground transition-colors">Objections</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Sign in
            </Link>
            <a
              href="mailto:hello@conosco.in?subject=Content%20Engine%20Pilot%20Request"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 transition-colors"
            >
              Request Free Pilot
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </header>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="container mx-auto px-6 py-20 md:py-28 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-green-200 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 text-xs font-medium mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          Live since 2025 · Geethanjali College of Engineering &amp; Technology · Hyderabad
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight max-w-4xl mx-auto mb-6">
          Your college clubs deserve better than{' '}
          <span className="line-through text-muted-foreground/50">Instagram</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-4">
          A self-service CMS for Indian colleges. Every club, every department, every event —
          all in one place. Built-in NAAC evidence. No IT team needed.
        </p>
        <p className="text-sm text-muted-foreground/70 mb-10">
          Used by GCET today. Free pilot for any college.
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
            href="https://blog.gcet.edu.in"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            See it live at GCET
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </section>

      {/* ── Real Pain Points ──────────────────────────────────────────────── */}
      <section id="why" className="bg-muted/30 border-y border-border">
        <div className="container mx-auto px-6 py-16 md:py-20">
          <div className="max-w-xl mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-2">The Real Problem</p>
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              What your college's digital presence actually looks like today
            </h2>
            <p className="text-muted-foreground text-sm">
              We're not pitching software. We're solving four specific problems every college faces right now.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {painPoints.map((point) => {
              const Icon = point.icon
              return (
                <div key={point.problem} className="rounded-2xl border border-border bg-card p-6">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="h-5 w-5 text-red-500" />
                    </div>
                    <div>
                      <p className="font-medium text-sm mb-2">{point.problem}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{point.reality}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Market Context ────────────────────────────────────────────────── */}
      <section className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {marketContext.map((item) => (
            <div key={item.stat} className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-amber-500 mb-1">{item.stat}</p>
              <p className="text-sm font-semibold mb-1">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Comparison Table ──────────────────────────────────────────────── */}
      <section id="comparison" className="bg-muted/30 border-y border-border">
        <div className="container mx-auto px-6 py-16 md:py-20">
          <div className="max-w-xl mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-2">vs. Status Quo</p>
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              How things actually get done today — and how they could
            </h2>
          </div>
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="grid grid-cols-3 bg-muted/60 text-xs font-bold uppercase tracking-widest text-muted-foreground border-b border-border">
              <div className="p-4">What you need</div>
              <div className="p-4 border-l border-border">
                <span className="flex items-center gap-1.5">
                  <XCircle className="h-3.5 w-3.5 text-red-500" />
                  Status Quo
                </span>
              </div>
              <div className="p-4 border-l border-border">
                <span className="flex items-center gap-1.5 text-amber-600">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                  Content Engine
                </span>
              </div>
            </div>
            {comparison.map((row, i) => (
              <div
                key={row.aspect}
                className={`grid grid-cols-3 border-b border-border last:border-0 ${i % 2 === 0 ? '' : 'bg-muted/20'}`}
              >
                <div className="p-4 text-sm font-medium">{row.aspect}</div>
                <div className="p-4 text-sm text-red-600/80 border-l border-border flex items-start gap-2">
                  <XCircle className="h-3.5 w-3.5 text-red-400 shrink-0 mt-0.5" />
                  {row.statusQuo}
                </div>
                <div className="p-4 text-sm text-green-700 dark:text-green-400 border-l border-border flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0 mt-0.5" />
                  {row.contentEngine}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NAAC Section ──────────────────────────────────────────────────── */}
      <section id="naac" className="container mx-auto px-6 py-16 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-2">NAAC Accreditation</p>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Evidence that proves itself — without a last-minute scramble
            </h2>
            <p className="text-muted-foreground mb-6">
              Every college dreads the NAAC SSR. The data exists — it's just scattered across
              drives, phones, and Instagram accounts. Content Engine makes evidence a by-product
              of normal publishing, not a separate exercise.
            </p>
            <div className="space-y-4">
              {[
                { label: 'Before Content Engine', items: ['WhatsApp groups hunting for event photos', 'Excel sheets per department, filled once in 5 years', 'Clubs produce evidence reports from memory', 'IQAC coordinator does months of last-minute work'] },
                { label: 'After Content Engine', items: ['Every event is a permanent, date-stamped, criterion-tagged record', 'Club pages serve as running evidence portfolios', 'Department pages show programs, faculty, and achievements', 'Export-ready at any time, not just during SSR'] },
              ].map((block, i) => (
                <div key={block.label} className="rounded-xl border border-border p-5">
                  <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${i === 0 ? 'text-red-500' : 'text-green-600'}`}>
                    {block.label}
                  </p>
                  <ul className="space-y-1.5">
                    {block.items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                        {i === 0
                          ? <XCircle className="h-3.5 w-3.5 text-red-400 shrink-0 mt-0.5" />
                          : <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0 mt-0.5" />
                        }
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold mb-4">NAAC Criteria directly covered</p>
            <div className="space-y-3">
              {naacCriteria.map((c) => (
                <div key={c.code} className="rounded-xl border border-border bg-card p-4 flex items-start gap-3">
                  <span className="text-xs font-bold font-mono bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-1 rounded shrink-0">
                    {c.code}
                  </span>
                  <p className="text-sm text-muted-foreground">{c.description}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 p-5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  <strong>NAAC Cycle 3 & 4 are data-heavy.</strong> Assessors look for digital trails —
                  event pages, club activity records, alumni engagement. A ₹0 pilot now saves weeks
                  of evidence collection in your next accreditation cycle.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Live Pilot ────────────────────────────────────────────────────── */}
      <section className="bg-muted/30 border-y border-border">
        <div className="container mx-auto px-6 py-14">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-2">Live Proof</p>
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Not a demo. Running in production at GCET since 2025.
            </h2>
            <p className="text-muted-foreground text-sm">
              Geethanjali College of Engineering &amp; Technology, Hyderabad —
              an autonomous institution with 10+ active clubs, multiple departments,
              and NAAC Cycle 4 preparation underway.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { icon: Users2, label: 'Clubs publishing independently', value: '10+' },
              { icon: Calendar, label: 'Events with permanent records', value: 'Every event' },
              { icon: GraduationCap, label: 'Department pages live', value: 'All departments' },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div key={item.label} className="rounded-2xl border border-border bg-card p-6 text-center">
                  <Icon className="h-6 w-6 text-amber-500 mx-auto mb-3" />
                  <p className="text-xl font-bold mb-1">{item.value}</p>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                </div>
              )
            })}
          </div>
          <div className="text-center mt-8">
            <a
              href="https://blog.gcet.edu.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-amber-600 hover:underline font-medium"
            >
              Visit blog.gcet.edu.in
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────────────── */}
      <section className="container mx-auto px-6 py-16 md:py-20">
        <div className="max-w-xl mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-2">What's Included</p>
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Everything a college needs, nothing it doesn't</h2>
          <p className="text-muted-foreground text-sm">
            No bloat. No IT consultant required. Every feature exists because it solves a real
            problem we saw at GCET.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <div key={feature.title} className="rounded-2xl border border-border bg-card p-5 hover:shadow-md transition-shadow">
                <div className="h-9 w-9 rounded-xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center mb-3">
                  <Icon className="h-4 w-4 text-amber-600" />
                </div>
                <h3 className="font-semibold text-sm mb-1.5">{feature.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Objection Handling ────────────────────────────────────────────── */}
      <section id="objections" className="bg-muted/30 border-y border-border">
        <div className="container mx-auto px-6 py-16 md:py-20">
          <div className="max-w-xl mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-2">Common Questions</p>
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              The real questions colleges ask — answered honestly
            </h2>
            <p className="text-muted-foreground text-sm">
              We've heard every objection. Here's where we agree, where we push back, and why.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-5xl">
            {whyYes.map((item) => (
              <div key={item.objection} className="rounded-2xl border border-border bg-card p-6">
                <div className="flex items-start gap-3 mb-3">
                  <MessageSquare className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  <p className="text-sm font-semibold text-muted-foreground italic">{item.objection}</p>
                </div>
                <p className="text-sm text-foreground leading-relaxed pl-7">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Conosco Ecosystem ─────────────────────────────────────────────── */}
      <section className="container mx-auto px-6 py-16 md:py-20">
        <div className="rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 p-8 md:p-12 text-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
            <div>
              <p className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-3">
                The Bigger Picture
              </p>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Content Engine is the entry point. Conosco is the destination.
              </h2>
              <p className="text-gray-300 text-sm mb-6">
                Conosco is a compliance-first institutional OS — managing employees, inventory,
                complaints, research, and NAAC evidence. Most colleges won't sign an ERP contract
                on day one. Content Engine gives them a ₹0 entry point that delivers immediate
                value, builds trust, and creates a natural upgrade path to the full OS.
              </p>
              <div className="space-y-2 mb-8">
                {[
                  'College starts with free Content Engine pilot',
                  'Content Engine proves value within 30 days',
                  'NAAC pressure + trust = conversation about Conosco ERP',
                  'Content Engine syncs live with ERP — one unified system',
                ].map((step, i) => (
                  <div key={step} className="flex items-start gap-3">
                    <span className="text-xs font-bold text-amber-400 w-4 shrink-0 mt-0.5">{i + 1}.</span>
                    <p className="text-sm text-gray-300">{step}</p>
                  </div>
                ))}
              </div>
              <a
                href="https://conosco.in"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-500 text-white font-medium hover:bg-amber-600 transition-colors text-sm"
              >
                Learn about Conosco ERP
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
            <div className="space-y-4">
              <p className="text-gray-400 text-xs uppercase tracking-widest font-bold mb-4">Why this works as a business</p>
              {[
                {
                  icon: TrendingUp,
                  title: 'Free pilot = fast adoption',
                  desc: 'Zero budget barrier means decisions happen in days, not semesters.',
                },
                {
                  icon: Layers,
                  title: 'Land-and-expand model',
                  desc: 'Content Engine is the foot in the door. ERP is the long-term contract.',
                },
                {
                  icon: Shield,
                  title: 'NAAC creates urgency',
                  desc: 'Every college is either in a cycle or preparing for one. The pain is constant and scheduled.',
                },
                {
                  icon: Clock,
                  title: 'Switching costs lock them in',
                  desc: 'Once 50 club editors are trained and 200 posts are published, nobody migrates.',
                },
              ].map((point) => {
                const Icon = point.icon
                return (
                  <div key={point.title} className="flex items-start gap-3 bg-white/5 rounded-xl p-4">
                    <Icon className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-white mb-0.5">{point.title}</p>
                      <p className="text-xs text-gray-400">{point.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── Honest Caveats ────────────────────────────────────────────────── */}
      <section className="container mx-auto px-6 pb-16">
        <div className="rounded-2xl border border-border bg-card p-8 max-w-3xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Being Honest</p>
          <h3 className="text-lg font-bold mb-4">This will not work for every college</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-semibold text-red-500 uppercase tracking-wide mb-2">Where it won't work</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {[
                  'Colleges where one IT admin controls all publishing and won\'t delegate',
                  'Institutions with zero active clubs or student activity',
                  'Colleges that have just completed NAAC and have no urgency for 5 years',
                  'Anywhere leadership hasn\'t bought into digital presence',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <XCircle className="h-3.5 w-3.5 text-red-400 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-2">Where it will</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {[
                  'Autonomous or NAAC-active colleges with 5+ clubs',
                  'Institutions where at least one faculty champion cares about digital visibility',
                  'Colleges using Conosco ERP (natural upsell)',
                  'Any college preparing for NAAC Cycle 3 or 4 in the next 2 years',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────────────── */}
      <section className="bg-amber-500">
        <div className="container mx-auto px-6 py-16 text-center text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            The pilot is free. The worst outcome is 10 posts and no adoption.
          </h2>
          <p className="text-amber-100 mb-8 max-w-xl mx-auto">
            We set up a subdomain, configure your institution, and onboard your first
            club editors in one call. If it doesn't stick, nothing is lost.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="mailto:hello@conosco.in?subject=Content%20Engine%20Pilot%20Request"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white text-amber-600 font-semibold hover:bg-amber-50 transition-colors"
            >
              Request Free Pilot
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="tel:+919700469090"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border border-white/40 text-white font-medium hover:bg-white/10 transition-colors"
            >
              Call +91 97004 69090
            </a>
          </div>
          <p className="text-xs text-amber-200 mt-6">
            hello@conosco.in · conosco.in · Hyderabad
          </p>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
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


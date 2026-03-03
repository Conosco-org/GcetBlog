# Conosco Content Engine — Master Implementation Plan

> **Version**: 3.0 (Final Locked) | **Branch**: `feature/content-engine-v1`
> **Created**: 2026-03-03 | **Status**: Implementation Ready
> **Owner**: Architecture Team

---

## Executive Summary

Transform the GCET Blog from a standalone blogging platform into a **modular institutional Content Engine** — a reusable, multi-tenant capable content operating system that serves as the public-facing display layer for any college's digital infrastructure.

### The Core Insight

Every college has these digital problems. **All of them** are solvable with two systems:

| System | Role | Analogy |
|--------|------|---------|
| **Conosco** (ERP) | Operational truth — event management, registrations, attendance, compliance, student lifecycle, evidence, certificates | The kitchen |
| **Content Engine** (CMS) | Public presentation — websites, blogs, event pages, club showcases, landing pages, SEO, editorial content | The restaurant front |

The Content Engine **never** duplicates operational logic. It consumes, enhances, and presents.

---

## Part I — Problem Landscape: What's Broken in College Digital Infrastructure

### Every Problem in Event / Club / Blog / Digital Space

| # | Problem | Current "Solution" | Why It Fails | Our Solution |
|---|---------|-------------------|--------------|-------------|
| 1 | **Fragmented event management** | vTools (IEEE), Google Forms, WhatsApp, Excel | No central calendar, no unified registration, no data reuse | Conosco event system → Content Engine display |
| 2 | **Multiple club websites** | Separate WordPress/Wix sites per club | 6 sites × 6 backends × 6 hosting bills, all unmaintained after leadership changes | Single Content Engine, multi-tenant theming via `src/custom/theme.ts` |
| 3 | **No public event archive** | Events vanish after they happen | Lost institutional memory, no NAAC evidence trail | Events module with `completed` status, Conosco evidence integration |
| 4 | **Blog is disconnected** | Standalone WordPress blog | Can't link posts to events, clubs, departments | Content Engine with `relatedEvents`, `department`, `contentVariant` fields |
| 5 | **Manual attendance tracking** | Paper sign-in sheets, proxy attendance | No verification, no digital record | Conosco: QR-based login, biometric (Content Engine displays stats only) |
| 6 | **Certificate chaos** | Manual certificates in Canva/Word, no verification | Fake certificates, no audit trail | Conosco: auto-generation + verification links (Content Engine links to verification) |
| 7 | **No student dashboard** | Students have no single view of their activities | Can't see registered events, attendance, certificates | Conosco student portal (separate frontend, same API) |
| 8 | **Club member management is ad-hoc** | WhatsApp groups, Google Sheets | Members lost on leadership change, no contribution tracking | Conosco: member lifecycle. Content Engine: public member showcase |
| 9 | **Event poster distribution** | WhatsApp forwards, Instagram stories | No central discovery, students miss events | Content Engine: `/events` listing with filters, SSR for SEO |
| 10 | **NAAC compliance documentation** | Last-minute Excel scrambles | No continuous evidence collection | Conosco: `naacCriteria` fields, evidence tracking. Content Engine: public reports |
| 11 | **No SEO for institutional content** | College events/clubs don't appear in Google | Zero organic discovery | Content Engine: SSG, `generateMetadata()`, structured data, sitemaps |
| 12 | **Tech fest / hackathon microsites** | New temporary sites every year | Rebuilt from scratch, old ones abandoned | Content Engine: `contentVariant: 'landing-page'` + event-scoped pages |
| 13 | **Department-level content isolation** | Each dept wants their own "page" | No CMS, no consistency | Content Engine: `department` field on posts/events/clubs + filtered views |
| 14 | **No email campaigns for events** | Mass BCC emails, WhatsApp broadcasts | Low engagement, no tracking | Newsletter module (already built!) + `newsletterCandidate` flag |
| 15 | **Faculty advisor visibility** | Names buried in documents | No public recognition | Clubs module: advisor field displayed on club pages |
| 16 | **Achievement tracking** | Random social media posts | No institutional record | Conosco: `recentAchievements[]`. Content Engine: achievement showcase |
| 17 | **Media/photo management** | Google Drive shares, WhatsApp photos | No tagging, no linking to events | Media module with `contextType`, `contextId` linking |
| 18 | **IEEE/professional body compliance** | Separate reporting per society | Duplicated effort across clubs | Conosco handles compliance. Content Engine displays public status |
| 19 | **Event feedback** | Google Forms sent post-event | Low response rates, data silos | Conosco: integrated feedback. Content Engine: displays `feedbackRating` |
| 20 | **No analytics** | No one knows what content performs | Blind content strategy | PageViews collection + Conosco stats in reporting module |

### Can We Solve ALL of Them?

**Yes — but with clear ownership:**

- Problems 1, 5, 6, 7, 8, 10, 16, 18, 19 → **Conosco** (operational)
- Problems 2, 3, 4, 9, 11, 12, 13, 14, 15, 17, 20 → **Content Engine** (presentation)
- The bridge → **Projection API** (Conosco exposes, Content Engine consumes)

---

## Part II — Plan Version History

### v1.0 — Initial Plan (Feb 15)

**Generated by**: Copilot based on user's implementation directive

**Key decisions**:
- Module folder structure: `src/modules/{content,events,registrations,media,newsletter,reporting,activity-log}`
- Each module: `collections/`, `services/`, `hooks/`, `types/`, `api/`
- ConoscoAdapter with mock responses
- Theme config in `src/custom/`
- Posts extended with `type`, `department`, `relatedEvents`
- Events as full Payload collection with registration forms, media ownership
- `/content/[slug]`, `/events/[slug]`, `/landing/[slug]` routes

**Issues identified**: Over-engineered in 3 places, under-designed integration boundaries in 2 places.

---

### v1.5 — GPT Architecture Review (Feb 15)

**Applied corrections**:
1. ✅ `contentVariant` instead of `type` — prevents field name collision
2. ✅ `dataSource: 'manual' | 'conosco'` added to Events — critical for multi-college licensing
3. ✅ Media simplified to `contextType` + `contextId` only — keep media dumb storage
4. ✅ Activity Log: only `module` + `metadata` JSON — no over-engineering
5. ✅ Reporting: only `getPlatformOverview()` — delay CSV/department analytics
6. ✅ `ExternalEventProvider` interface, not hardcoded `ConoscoAdapter` — provider-agnostic
7. ✅ Integration Context Layer (`getEventContext()`) — UX illusion of Conosco integration
8. ✅ No immediate redirect from `/posts/` → canonical tag instead — SEO safety
9. ❌ Events as lightweight display collection — **reversed in v2.0** when real API arrived

**Status**: Approved with conditions

---

### v2.0 — Real Conosco API Integration (Feb 15)

**Trigger**: User shared actual Conosco Public Projection API contract

**Major changes**:
- **Real HTTP client** replacing mock adapter — `ConoscoClient` calls actual API endpoints
- **TypeScript translations** of JSDoc projection types (`PublicEvent`, `PublicClub`, etc.)
- **Cached data access layer** via `unstable_cache` with TTL (5min events, 10min clubs, 15min stats)
- **Clubs added** as full module — pure API consumption, no CMS collection
- **Per-endpoint timeouts**: 3s enrichment, 5s detail, 8s list, 10s stats
- **API version tracking**: logs `X-Projection-Version` changes
- **Institution scoping**: `themeConfig.institutionCode` on every API call

**New endpoints mapped**:
```
GET /{institution}/events
GET /{institution}/events/upcoming
GET /{institution}/events/recent
GET /{institution}/events/stats
GET /{institution}/events/{eventCode}
GET /{institution}/clubs
GET /{institution}/clubs/stats
GET /{institution}/clubs/classification/{classification}
GET /{institution}/clubs/{clubCode}
```

---

### v2.5 — Integration Doctrine Applied (Feb 15)

**Trigger**: User shared formal Integration Doctrine document

**Doctrine rules locked**:
1. Schemas never leave Conosco
2. Semantic IDs publicly (`eventCode`, `clubCode`), never ObjectIds
3. CMS enhances, never overwrites operational truth
4. Backward-compatible shapes (semver on `contractVersion`)
5. Institution scoping mandatory
6. Public status filtering (Draft/Proposed never visible)
7. Budget/financial data never leaks

**Slug management**: CMS generates slugs from names, stores `slug ↔ eventCode/clubCode` mapping.

---

### v3.0 — Final Production Plan (Feb 26, Locked)

**Trigger**: Critical review identified 5 gaps + 2 decisions needed

**Critical additions**:
1. ✅ Manual cache invalidation endpoint (`/api/revalidate`)
2. ✅ Explicit per-endpoint timeout config
3. ✅ Conosco status admin page (`/editor/system/conosco`)
4. ✅ Sitemap preference update (`/content/*` not `/posts/*`)
5. ✅ Sync-preview pages for events and clubs

**Decision changes**:
- ✅ Clubs CMS collection **added to v1** (editorial enhancement needed: slugs, SEO, hero images)
- ✅ Sync-preview page included (bridges gap until v2 webhooks)

**This is the version being implemented.**

---

## Part III — Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      CONTENT ENGINE (Next.js)                   │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │ Content  │  │  Events  │  │  Clubs   │  │  Newsletter  │   │
│  │ Module   │  │  Module  │  │  Module  │  │  (existing)  │   │
│  │          │  │          │  │          │  │              │   │
│  │ services │  │ services │  │ services │  │              │   │
│  │ types    │  │ types    │  │ types    │  │              │   │
│  │          │  │ hooks    │  │ hooks    │  │              │   │
│  │          │  │ collect. │  │ collect. │  │              │   │
│  │          │  │ compnts  │  │ compnts  │  │              │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────────────┘   │
│       │              │              │                            │
│  ┌────┴──────────────┴──────────────┴────┐                      │
│  │         Integration Context Layer      │                      │
│  │  getEventDisplayData() | getClubDisplay│Data()                │
│  │  Merges CMS + API per Doctrine Rule 3 │                      │
│  └────────────────┬──────────────────────┘                      │
│                   │                                              │
│  ┌────────────────┴──────────────────────┐                      │
│  │     src/services/conosco/              │                      │
│  │  ┌─────────┐  ┌──────────┐  ┌──────┐ │                      │
│  │  │ client  │  │  cached  │  │ types│ │                      │
│  │  │ .ts     │  │  .ts     │  │ .ts  │ │                      │
│  │  └────┬────┘  └──────────┘  └──────┘ │                      │
│  │       │ factory.ts → singleton        │                      │
│  └───────┼───────────────────────────────┘                      │
│          │                                                       │
│  ┌───────┴───────┐    ┌────────────────────┐                    │
│  │ src/custom/   │    │ src/collections/   │                    │
│  │ theme.ts      │    │ (data layer,       │                    │
│  │ departments.ts│    │  stays in place)   │                    │
│  └───────────────┘    └────────────────────┘                    │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    FRONTEND ROUTES                         │  │
│  │  /events    /events/[slug]    /clubs    /clubs/[slug]     │  │
│  │  /content/[slug]   /landing/[slug]   /posts/[slug]        │  │
│  │  /editor/events    /editor/clubs    /editor/system/conosco│  │
│  └───────────────────────────────────────────────────────────┘  │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                    x-api-key + institution code
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│                  CONOSCO PROJECTION API                          │
│                                                                  │
│  GET /{institution}/events          GET /{institution}/clubs     │
│  GET /{institution}/events/upcoming GET /{institution}/clubs/stats│
│  GET /{institution}/events/{code}   GET /{institution}/clubs/{code}│
│                                                                  │
│  Response: { success, institution, contractVersion, data,        │
│              pagination }                                        │
│  Headers: X-Projection-Version, Cache-Control                    │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                     Projection Layer (mappers)
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│                     CONOSCO INTERNAL (ERP)                       │
│                                                                  │
│  Event (1671 lines) → PublicEvent projection                     │
│  Club (1240 lines) → PublicClub projection                       │
│  EventRegistration (400 lines) → aggregated stats                │
│  Evidence (1381 lines) → completion percentages                  │
│  Department (398 lines) → PublicDepartment                       │
│  Student/StudentActivity → stats only                            │
│                                                                  │
│  Budget, approvals, workflows, PII = NEVER exposed               │
└──────────────────────────────────────────────────────────────────┘
```

---

## Part IV — File Manifest (What Gets Created/Modified)

### New Files (46 files)

```
src/custom/
├── theme.ts                                    # Branding config
└── departments.ts                              # Institution departments

src/core/
└── types.ts                                    # Shared types

src/services/conosco/
├── types.ts                                    # TS projection types (contract translation)
├── client.ts                                   # HTTP client implementing ConoscoProvider
├── factory.ts                                  # Provider factory (env-driven)
├── cached.ts                                   # unstable_cache wrappers
└── index.ts                                    # Singleton barrel

src/modules/
├── index.ts                                    # Barrel export all modules
├── content/
│   ├── index.ts
│   ├── types/index.ts
│   └── services/content-service.ts
├── events/
│   ├── index.ts
│   ├── collections/Events.ts                   # Payload collection
│   ├── types/index.ts
│   ├── hooks/revalidateEvent.ts
│   ├── services/event-context.ts               # Merge layer
│   └── components/
│       ├── EventCard.tsx
│       ├── EventArchive.tsx
│       ├── EventHero.tsx
│       └── EventEnrichment.tsx
├── clubs/
│   ├── index.ts
│   ├── collections/Clubs.ts                    # Payload collection
│   ├── types/index.ts
│   ├── hooks/revalidateClub.ts
│   ├── services/club-context.ts                # Merge layer
│   └── components/
│       ├── ClubCard.tsx
│       ├── ClubArchive.tsx
│       └── ClubEnrichment.tsx
├── media/
│   ├── index.ts
│   ├── hooks/auto-populate-uploader.ts
│   └── services/media-service.ts
├── activity-log/
│   ├── index.ts
│   └── services/log-service.ts
└── reporting/
    ├── index.ts
    └── services/overview-service.ts

src/app/(frontend)/
├── events/
│   ├── page.tsx                                # Events listing
│   └── [slug]/page.tsx                         # Event detail
├── clubs/
│   ├── page.tsx                                # Clubs listing
│   └── [slug]/page.tsx                         # Club detail
├── content/
│   └── [slug]/page.tsx                         # Content (variant-aware)
├── landing/
│   └── [slug]/page.tsx                         # Landing pages
└── editor/
    ├── events/
    │   ├── page.tsx                            # Events management
    │   ├── create/page.tsx                     # Create event
    │   └── sync-preview/page.tsx               # Conosco sync preview
    ├── clubs/
    │   ├── page.tsx                            # Clubs management
    │   └── sync-preview/page.tsx               # Conosco sync preview
    └── system/
        └── conosco/page.tsx                    # Connection status

src/app/api/
└── revalidate/route.ts                         # Manual cache invalidation
```

### Modified Files (6 files)

```
src/collections/Posts/index.ts          # +contentVariant, +department, +relatedEvents, +featuredMedia, +newsletterCandidate
src/collections/Media.ts                # +contextType, +contextId, +uploadedBy
src/collections/AdminLogs/index.ts      # +module, +metadata, new action/resourceType options
src/payload.config.ts                   # +Events, +Clubs collection imports
src/plugins/index.ts                    # +events/clubs in search/SEO plugins
src/environment.d.ts                    # +CONOSCO_API_URL, +CONOSCO_API_KEY, +REVALIDATION_SECRET
src/app/(frontend)/editor/components/EditorSidebar.tsx  # +Events, +Clubs nav items, theme version
src/app/(frontend)/posts/[slug]/page.tsx                # +canonical tag
```

### NOT Modified (preserved)

```
src/collections/Users/               # No changes (department field already exists)
src/collections/Comments/            # No changes
src/collections/Feedback.ts          # No changes
src/collections/Newsletters/         # No changes (newsletter module untouched)
src/collections/NewsletterSubscribers/ # No changes
src/collections/NewsletterEvents/    # No changes
src/collections/Votes/               # No changes
src/collections/PageViews/           # No changes
src/services/email/                  # No changes (pattern mirrored, not modified)
```

---

## Part V — Integration Doctrine (Embedded Reference)

### The 7 Golden Rules

1. **Schemas never leave Conosco** — external systems consume projections only
2. **Semantic IDs publicly** — `eventCode` ("EVT-2025-0042"), never ObjectIds
3. **CMS enhances, never overwrites** — editorial descriptions yes, event dates no
4. **Backward-compatible shapes** — versioned via `contractVersion` (semver)
5. **Institution scoping mandatory** — every API call includes institution code
6. **Public status filtering** — Draft/Proposed never visible externally
7. **Budget/financial data never leaks** — non-negotiable

### Three Owners

| Domain | Owner | Examples |
|--------|-------|---------|
| **Truth** | Conosco | Event dates, participant counts, attendance, evidence, NAAC |
| **Presentation** | Content Engine | Slugs, SEO, hero images, editorial descriptions, landing pages |
| **Translation** | Projection Layer | `Event → PublicEvent`, `Club → PublicClub` transforms |

### What Content Engine CAN Add
- Editorial descriptions, featured articles
- Custom hero images, photo galleries
- SEO metadata, Open Graph, structured data
- Related content links
- Custom display ordering, featured/pinned status
- Comment sections, reactions, social sharing

### What Content Engine Must NOT Override
- Event dates, times, venue, status
- Participant counts, registration status
- Club membership numbers, advisor details
- Department names/codes
- NAAC criteria, evidence completion
- Achievement details, award information

---

## Part VI — Decision Log (All Final Decisions)

| # | Decision | Chosen | Rationale | Alternatives Rejected |
|---|----------|--------|-----------|----------------------|
| 1 | Collections location | Stay in `src/collections/`, modules re-export | 50+ import paths break on move, no business value | Move everything into modules |
| 2 | Posts extension method | Modify in-place | No factory complexity needed yet | Factory wrapper function |
| 3 | Post type field name | `contentVariant` | Prevents `type` name collision as variants grow | `type` (overloads fast) |
| 4 | Events collection scope | Lightweight display collection with CMS enhancement | Content Platform ≠ ERP, prevents source-of-truth duplication | Full operational collection |
| 5 | Clubs collection | CMS collection in v1 | Needs editorial enhancement: slugs, SEO, hero images | Pure API only (reversed) |
| 6 | Registrations | Types + adapter only, no Payload collection | Content Engine ≠ ERP | Full collection |
| 7 | Conosco adapter design | `ExternalEventProvider` interface, not `ConoscoAdapter` directly | Provider-agnostic: future ERPs, CSV, Google Sheets | Hardcoded naming |
| 8 | API client strategy | Real HTTP client + graceful `DisconnectedProvider` | No mocks needed — real API exists | Mock provider with sample data |
| 9 | URL routing | Keep `/posts/[slug]` + canonical tag to `/content/[slug]` | SEO safety, no broken links | Immediate 301 redirect |
| 10 | Media enhancement | `contextType` + `contextId` + `uploadedBy` only | Keep media dumb storage | Full relational (dept, tags, module) |
| 11 | Activity log | `module` + `metadata` JSON only | Lean schema, flexible data | Full department/entityId fields |
| 12 | Reporting v1 | `getPlatformOverview()` only | Insufficient data density for analytics | CSV exports, department analytics |
| 13 | Club URLs | CMS slugs (`/clubs/coding-club`) | CMS collection enables human-readable URLs | Code-based (`/clubs/CLB-2025-0012`) |
| 14 | Cache TTLs | 5min events, 10min clubs, 15min stats | Respects API `Cache-Control`, webhook invalidation in v2 | No caching / aggressive caching |
| 15 | Database | MongoDB (stay) | Battle-tested, all hooks/collections wired, launch risk | Postgres (dangerous migration) |
| 16 | Multi-site strategy | Same codebase, different deployment + env vars | IEEE site = swap `src/custom/` config | Fork repo (maintenance hell) |
| 17 | `dataSource` field | `'manual' \| 'conosco'` on Events & Clubs | Critical for standalone vs connected mode, multi-college licensing | No field (assume always connected) |
| 18 | Sync workflow v1 | Sync-preview page (manual record creation) | Bridges gap until v2 webhooks, reduces editor friction | Documentation only |
| 19 | Sitemap | Lists `/content/*` URLs, not `/posts/*` | Clean SEO signal with canonical tags | Keep `/posts/*` in sitemap |

---

## Part VII — Roadmap Beyond v1

### v1 (This Implementation)
- [x] Module structure, custom config
- [x] Conosco service with real HTTP client
- [x] Events & Clubs CMS collections
- [x] Content module (extended Posts)
- [x] Frontend routes: events, clubs, content, landing
- [x] Editor workspace: events/clubs management
- [x] Sync-preview pages
- [x] Conosco status dashboard
- [x] Manual cache invalidation

### v2 — Auto-Sync & Webhooks
- [ ] Conosco emits webhooks on event/club changes → Content Engine rebuilds affected pages
- [ ] Auto-create CMS records from Conosco events (replace manual sync-preview)
- [ ] Hard 301 redirect from `/posts/*` to `/content/*` (after indexing settles)
- [ ] CSV/PDF export services
- [ ] Department analytics dashboard

### v3 — Multi-Tenant Theming
- [ ] Subdomain detection in middleware (`ieee.gcet.edu.in` → IEEE theme)
- [ ] Per-club theme config (colors, fonts, layout)
- [ ] IEEE site as separate Vercel deployment, same codebase
- [ ] Club-scoped admin access (society_admin role)

### v4 — Extended Platform
- [ ] Committee/team member collection
- [ ] Student public profiles (activity feed from Conosco)
- [ ] vTools API as another `ExternalEventProvider` implementation
- [ ] Real-time event dashboard (WebSocket/SSE)
- [ ] Achievement showcase pages
- [ ] Event gallery/media browser

### v5 — Campus Digital Infrastructure
- [ ] Multiple institution support (beyond GCET)
- [ ] College magazine module
- [ ] Department-specific microsites
- [ ] Accreditation evidence portal (read-only public view)
- [ ] AI content suggestions (based on event data)

---

## Part VIII — Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Conosco API not ready when Content Engine deploys | Medium | Low | `DisconnectedProvider` handles gracefully — standalone mode works |
| Rate limit exceeded (100 req/15min) | Low | Medium | `unstable_cache` deduplicates, 5-15min TTLs reduce calls |
| Payload CMS version upgrade breaks collections | Low | High | Pin version, test before upgrading, Payload has migration tools |
| Search engines slow to canonicalize `/content/*` | Low | Low | Canonical tags + sitemap together. `/posts/*` still works |
| Editors confused by dataSource field | Medium | Low | Admin UI descriptions + integration guide (Step 49 doc) |
| Conosco API contract changes | Low | High | `X-Projection-Version` tracking, logged warnings, typed client catches mismatches |
| MongoDB performance with new collections | Very Low | Low | Indexed fields (`conoscoEventCode`, `contextId`), pagination enforced |

---

## Part IX — Implementation Order (Steps 1-57)

*See the locked plan in conversation history for full step-by-step details.*

**Phase sequence**: Foundation → Service → Cache → Collections → Extensions → Context → Components → Routes → Editor → Admin → Wiring → Validation

**Estimated file count**: 46 new files, 8 modified files

**Commit strategy**: Single atomic commit per phase, or one large `feat:` commit at the end.

---

*This is the canonical planning document. It supersedes all prior plan versions in the conversation.*

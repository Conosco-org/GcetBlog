# Content Engine V2 — Complete Roadmap

> **From Blog Platform → Public Interface of an Academic Operating System**

Last updated: 2026-03-04
Status: **Phase 1 COMPLETE** (v1 shipped → v2 RBAC core live, Phase 2+ in planning)

---

## Current Status — Quick Summary

| Phase | Status | Notes |
|---|---|---|
| **Phase 1: RBAC Core** | ✅ **COMPLETE** | All 21 tasks done. New role system live. Migration script written. |
| **Phase 2: Club Scoping + Sub-Pages** | ⬜ Not started | `organizingClubs` field not yet added to Events. Club sub-pages not built. |
| **Phase 3: Gallery Module** | ⬜ Not started | |
| **Phase 4: Auto-Sync Engine** | ⬜ Not started | |
| **Phase 4b: Deep Conosco Integration** | ⬜ Not started | |
| **Phase 5: Announcements** | ⬜ Not started | |
| **Phase 5b: Search + RSS + Polish** | ⬜ Not started | |
| **Phase 6: Polish + Integration Testing** | ⬜ Not started | |

### What Was Built (Phase 1 deliverables)

- **New role system**: 2 base roles (`superadmin`, `user`) + `roleAssignments[]` array
- **Added `institution_admin`** tier (enhancement beyond original roadmap) — institution-level admin that bypasses all permission checks within their institution
- **Route architecture**: `/platform/*` (superadmin only), `/user/*` (institution users), old `/editor/*` and `/admin-dashboard/*` routes redirect
- **RBAC files**: `permissions.ts`, `hasPermission.ts`, `hasBlogAccess.ts`, `hasClubAccess.ts`, `isSuperAdmin.ts`, `selfOrAdmin.ts`
- **Role management UI**: `RoleManagementDialog.tsx` for assigning/removing roles with scope
- **Migration script**: `scripts/migrate-to-rbac.js` (279 lines) maps old roles → new
- **All collections updated**: Posts, Events, Clubs, Media, Comments, AdminLogs use new RBAC
- **EditorSidebar**: filters nav items by role assignments
- **Middleware**: guards routes by role, redirects legacy routes

### Known Issues (to fix in Phase 2)

1. **`editorOnly.ts` still used by 4 collections** — Templates, Newsletters, NewsletterSubscribers, NewsletterEvents import the old `editorOnly` which checks `role === 'editor'` (no longer exists). These collections are effectively locked for all non-superadmin users. **Fix: replace with `hasPermission('blog:publish')` or equivalent.**
2. **Missing `organizingClubs` field on Events** — Access control filter references `organizingClubs` but the field doesn't exist in the Events schema yet. This is a Phase 2 deliverable.
3. **Some editor pages may lack granular permission gating** — Most pages use `checkPermission()` correctly, but a full page-by-page audit hasn't been completed.

---

## Table of Contents

1. [Where We Are (v1 Inventory)](#1-where-we-are-v1-inventory)
2. [Where We're Going (Full Vision)](#2-where-were-going-full-vision)
3. [RBAC Architecture — The Big Redesign](#3-rbac-architecture--the-big-redesign)
4. [Module Roadmap](#4-module-roadmap)
5. [Implementation Phases](#5-implementation-phases)
6. [File Manifest](#6-file-manifest)
7. [Migration Strategy](#7-migration-strategy)
8. [Decision Log](#8-decision-log)

---

## 1. Where We Are (v1 Inventory)

### What Works Today

| Capability | Route/System | Status |
|---|---|---|
| Blog (draft → publish workflow) | `/posts/[slug]` | ✅ Shipped |
| Events listing + detail | `/events`, `/events/[slug]` | ✅ Shipped |
| Clubs listing + detail | `/clubs`, `/clubs/[slug]` | ✅ Shipped |
| Conosco API integration | Connected + Disconnected modes | ✅ Shipped |
| CMS editorial enhancement | Events & Clubs collections | ✅ Shipped |
| Editor workspace (all events/clubs) | `/editor/events`, `/editor/clubs` | ✅ Shipped |
| Conosco admin dashboard | `/editor/system/conosco` | ✅ Shipped |
| Cache + revalidation API | `POST /api/revalidate` | ✅ Shipped |
| Institution theming | `src/custom/theme.ts` | ✅ Shipped |
| Newsletter system | `/editor/newsletter` | ✅ Shipped |
| Google SSO | Login with Google | ✅ Shipped |
| Categories, media, templates | Various | ✅ Shipped |

### Current Role System (v2 RBAC — LIVE)

```
superadmin           → platform owner, sees everything, manages institutions
  └─ institution_admin → full autonomy within one institution (bypasses all permission checks)
       └─ club_admin       → full control of one club (events, gallery, pages)
       └─ club_editor      → create drafts for a club (cannot publish)
       └─ blog_editor      → manage all blog posts (publish, edit, delete)
       └─ blog_author      → write blog post drafts (cannot publish)
       └─ event_manager    → manage events across all clubs
       └─ moderator        → moderate comments and feedback
```

**Routes**: `/platform/*` (superadmin only), `/user/*` (institution users)
**Legacy routes**: `/editor/*`, `/admin-dashboard/*` → redirect to `/user/*`

### What's Missing (after Phase 1)

| Gap | Why It Matters | Status |
|---|---|---|
| ~~Scoped permissions~~ | ~~Club heads shouldn't see each other's data~~ | ✅ RBAC built (Phase 1) |
| Scoped data filtering | Club queries need `organizingClubs` filter | ⬜ Phase 2 |
| Auto-sync from Conosco | Currently requires manual "Link" click | ⬜ Phase 4 |
| Dual-mode event creation | Clubs need lightweight events without Conosco dependency | ⬜ Phase 2 |
| External event support | IEEE vTools, Unstop, Eventbrite events need display | ⬜ Phase 2 |
| Club sub-pages | `/clubs/coding/events`, `/clubs/coding/gallery` | ⬜ Phase 2 |
| Gallery module | Photo/video per club/event | ⬜ Phase 3 |
| Announcements | Time-sensitive notices (not blog posts) | ⬜ Phase 5 |
| Committee display | Pull member/team lists | ⬜ Phase 2 |
| Club coordinator dashboard | Each club head manages their own space | ⬜ Phase 2 |

### Completeness Audit (March 2026)

Beyond the above gaps, a full codebase audit revealed:

| Item | Current State | Action | Status |
|---|---|---|---|
| **RBAC System** | v2 RBAC live: `permissions.ts`, `hasPermission.ts`, `hasBlogAccess.ts`, `hasClubAccess.ts` | — | ✅ Done |
| **Route Architecture** | `/platform` (superadmin), `/user` (institution), legacy redirects | — | ✅ Done |
| **Role Management UI** | `RoleManagementDialog.tsx` for assign/remove roles | — | ✅ Done |
| **Global Search** | `@payloadcms/plugin-search` installed BUT only indexes `posts`. Events, clubs, pages NOT searchable. | Extend `searchPlugin({ collections: ['posts', 'events', 'clubs'] })` in `plugins/index.ts` | ⬜ Phase 5b |
| **SEO Per Page** | ✅ Already done. `@payloadcms/plugin-seo` on Pages, Posts, Events, Clubs with full meta fields. | None | ✅ Done |
| **Mobile** | ✅ Tailwind responsive. Standard viewport. No issues. | None | ✅ Done |
| **Media Governance** | `contextType`/`contextId` exist but no club-scoped filtering. No file size enforcement. | Add media scoping via RBAC in v2 | ⬜ Phase 5b |
| **Analytics Per Club** | Not built. `/editor/analytics` is basic. | Add lightweight view tracking in v2 Phase 6 | ⬜ Phase 6 |
| **Multi-tenant URL routing** | Not built. Single domain deployment. | v3 concern — not v2 scope | ⬜ v3 |
| **Event schedule block** | Missing. Multi-day fests need day-by-day agenda. | Add `ScheduleBlock` in Phase 2 | ⬜ Phase 2 |
| **Contact/location block** | Missing. Clubs need "where to find us". | Add `ContactBlock` in Phase 2 | ⬜ Phase 2 |
| **RSS feed** | Missing. Standard blog expectation. | Add `/feed.xml` route handler | ⬜ Phase 5b |
| **Breadcrumbs** | Missing for club sub-pages. | Add Breadcrumb component |
| **Upgrade to Conosco CTA** | Not built in UI. Adoption funnel from manual→conosco has no prompt. | Add upgrade prompt on manual event edit page |

---

## 2. Where We're Going (Full Vision)

```
┌──────────────────────────────────────────────────────┐
│                    PUBLIC WEBSITE                      │
│  /events  /clubs  /clubs/coding  /posts  /about       │
│  Dynamic pages powered by CMS + Conosco API           │
└───────────────────────┬──────────────────────────────┘
                        │
┌───────────────────────┴──────────────────────────────┐
│              CONTENT ENGINE (CMS Layer)                │
│  Payload CMS + Next.js 15                             │
│  ┌─────────┐ ┌─────────┐ ┌──────────┐ ┌──────────┐  │
│  │ Events  │ │  Clubs  │ │  Posts   │ │ Gallery  │   │
│  └────┬────┘ └────┬────┘ └────┬─────┘ └────┬─────┘  │
│       │           │           │             │         │
│  ┌────┴───────────┴───────────┴─────────────┴────┐   │
│  │           RBAC + Scoped Permissions            │   │
│  │  superadmin → sees everything                  │   │
│  │  club_admin(coding) → sees only Coding Club    │   │
│  │  blog_editor → sees only blog posts            │   │
│  └────────────────────┬──────────────────────────┘   │
└───────────────────────┬──────────────────────────────┘
                        │
┌───────────────────────┴──────────────────────────────┐
│              CONOSCO (ERP Brain)                      │
│  Events, Registrations, Attendance, Compliance        │
│  Source of operational truth                          │
└──────────────────────────────────────────────────────┘
```

---

## 3. RBAC Architecture — The Big Redesign

### 3.1 Design Principles

1. **Two base roles only**: `superadmin` and `user`
2. **Permissions come from assignments**, not from the role itself
3. **Assignments are scoped**: role + scopeType + scopeId
4. **A user can have multiple assignments** (e.g., club admin for Coding Club AND blog editor)
5. **SuperAdmin bypasses all checks** — they are god mode
6. **Access control checks assignments at query time**, not at login time

### 3.2 Role Definitions

| Role | Who | Powers |
|---|---|---|
| `superadmin` | You (the platform owner) | Everything. Create clubs, assign roles, manage system, access all content, manage users, toggle features. Cannot be deleted. |
| `user` | Everyone else | Base authenticated user. No permissions by default. Gets powers through **role assignments**. |

### 3.3 Role Assignments (The Scoping System) — ✅ IMPLEMENTED

> **Implementation status**: Live in `src/access/permissions.ts` and `src/collections/Users/index.ts`

A user gets powers by receiving **assignments**. Each assignment has:

```typescript
interface RoleAssignment {
  /** What they can do */
  assignedRole: 'institution_admin' | 'club_admin' | 'club_editor' | 'blog_editor' | 'blog_author' | 'event_manager' | 'moderator'

  /** What type of resource this applies to */
  scopeType: 'institution' | 'club' | 'blog' | 'global'

  /** Which specific resource (null = all of that type) */
  scopeId?: string | { id: string }  // points to clubs or institutions collection

  /** Human-readable scope label for UI */
  scopeLabel?: string // e.g., "Coding Club", "GCET"
}
```

> **Enhancement**: `institution_admin` was added as a tier between `superadmin` and other roles. It bypasses all permission checks within its own institution (handled in `hasPermission.ts`), but cannot manage other institutions or platform-level settings.

### 3.4 Assignable Roles Explained

| Assigned Role | Scope | What They Can Do |
|---|---|---|
| `institution_admin` | `institution` | **NEW (enhancement)**: Full control within one institution. Bypasses all permission checks for their institution. Can assign all other roles. Only superadmin can grant this role. |
| `club_admin` | `club` + specific clubId | Full control of ONE club: edit club page, create/manage events for that club, manage gallery, view analytics, publish content under that club |
| `club_editor` | `club` + specific clubId | Create drafts for a club (events, gallery, posts). Cannot publish — needs club_admin or superadmin approval |
| `blog_editor` | `blog` | Manage all blog posts across the platform. Can publish, edit, delete any post. Equivalent to old "editor" role for blog content only |
| `blog_author` | `blog` | Write blog post drafts. Cannot publish. Equivalent to old "contributor" |
| `event_manager` | `global` | Manage events across all clubs. Can create, edit, publish events for any club. Useful for a central event coordinator |
| `moderator` | `global` | Moderate comments, feedback, manage community content. Cannot create events or manage clubs |

### 3.5 Permission Map — ✅ IMPLEMENTED

> **Implementation**: `src/access/permissions.ts` (174 lines) — live and used by all collections.

Fine-grained permissions derived from roles:

```typescript
const PERMISSION_MAP = {
  // Blog permissions
  'blog:create_draft':    ['blog_author', 'blog_editor', 'club_admin', 'club_editor'],
  'blog:edit_own':        ['blog_author', 'blog_editor'],
  'blog:edit_any':        ['blog_editor'],
  'blog:publish':         ['blog_editor'],
  'blog:delete':          ['blog_editor'],

  // Event permissions
  'event:create':         ['club_admin', 'club_editor', 'event_manager'],
  'event:edit_own_club':  ['club_admin', 'club_editor'],
  'event:edit_any':       ['event_manager'],
  'event:publish':        ['club_admin', 'event_manager'],
  'event:delete':         ['club_admin', 'event_manager'],

  // Club permissions
  'club:edit_page':       ['club_admin'],
  'club:manage_gallery':  ['club_admin', 'club_editor'],
  'club:view_analytics':  ['club_admin'],
  'club:manage_members':  ['club_admin'],

  // System permissions (superadmin only — not in this map)
  // 'system:manage_users', 'system:manage_roles', 'system:manage_settings'
  // → These are hardcoded to superadmin, never assignable
} as const
```

### 3.6 User Collection Schema — ✅ IMPLEMENTED

> **Implementation**: `src/collections/Users/index.ts` (288 lines) — matches this spec exactly.

```typescript
// What changes on the User collection:
fields: [
  // REMOVE: role (select: contributor/editor/admin)
  // REMOVE: isAdmin (checkbox)
  // REMOVE: canManageAdmins (checkbox)

  // ADD:
  {
    name: 'role',
    type: 'select',
    options: [
      { label: 'Super Admin', value: 'superadmin' },
      { label: 'User', value: 'user' },
    ],
    defaultValue: 'user',
    required: true,
    access: {
      // Only superadmins can change base role
      update: ({ req }) => req.user?.role === 'superadmin',
    },
  },
  {
    name: 'roleAssignments',
    type: 'array',
    admin: {
      description: 'Scoped role assignments — determines what this user can access',
      // Only superadmins and club_admins (for their club) can edit
    },
    access: {
      update: ({ req }) => req.user?.role === 'superadmin',
    },
    fields: [
      {
        name: 'assignedRole',
        type: 'select',
        required: true,
        options: [
          { label: 'Club Admin', value: 'club_admin' },
          { label: 'Club Editor', value: 'club_editor' },
          { label: 'Blog Editor', value: 'blog_editor' },
          { label: 'Blog Author', value: 'blog_author' },
          { label: 'Event Manager', value: 'event_manager' },
          { label: 'Moderator', value: 'moderator' },
        ],
      },
      {
        name: 'scopeType',
        type: 'select',
        required: true,
        options: [
          { label: 'Club', value: 'club' },
          { label: 'Blog', value: 'blog' },
          { label: 'Global', value: 'global' },
        ],
      },
      {
        name: 'scopeId',
        type: 'relationship',
        relationTo: 'clubs',
        admin: {
          description: 'Which club this applies to (only for club-scoped roles)',
          condition: (data, siblingData) => siblingData?.scopeType === 'club',
        },
      },
      {
        name: 'scopeLabel',
        type: 'text',
        admin: {
          readOnly: true,
          description: 'Auto-populated label for display',
        },
      },
    ],
  },
]
```

### 3.7 Access Control Functions — ✅ IMPLEMENTED

> **Implementation**: All files below are live in `src/access/`:
> - `hasPermission.ts` (361 lines) — core permission checker with institution isolation
> - `hasBlogAccess.ts` (101 lines) — blog-scoped shortcuts
> - `hasClubAccess.ts` (121 lines) — club-scoped shortcuts
> - `isSuperAdmin.ts` — replaces `adminOnly.ts`
> - `selfOrAdmin.ts` — replaces `adminOrSelf.ts`
> - `permissions.ts` (174 lines) — constants and interfaces

Replace all 10 existing access control files with a unified system:

```
src/access/
├── index.ts              # Main exports
├── isSuperAdmin.ts       # SuperAdmin check (replaces adminOnly, isAdminAccess)
├── hasPermission.ts      # Core: check user has specific permission + scope
├── hasClubAccess.ts      # Shortcut: can user access this specific club's data?
├── hasBlogAccess.ts      # Shortcut: can user create/edit blog posts?
├── canPublish.ts         # Can user publish (not just draft)?
├── publicOrAuthenticated.ts  # Keep for public read access
└── selfOrAdmin.ts        # Keep for profile self-edit
```

**Core function (`hasPermission`)**:

```typescript
// src/access/hasPermission.ts
import type { Access } from 'payload'

type Permission = keyof typeof PERMISSION_MAP

export function hasPermission(permission: Permission, scopeId?: string): Access {
  return ({ req: { user } }) => {
    if (!user) return false

    // SuperAdmin bypasses all checks
    if (user.role === 'superadmin') return true

    // Check assignments
    const assignments = user.roleAssignments || []
    const allowedRoles = PERMISSION_MAP[permission]

    return assignments.some((assignment) => {
      // Role must be in the allowed list
      if (!allowedRoles.includes(assignment.assignedRole)) return false

      // If scopeId required (club-specific), must match
      if (scopeId && assignment.scopeType === 'club') {
        const assignedScopeId = typeof assignment.scopeId === 'object'
          ? assignment.scopeId.id
          : assignment.scopeId
        return assignedScopeId === scopeId
      }

      return true
    })
  }
}

// For collection-level access (query filtering)
export function hasPermissionFilter(permission: Permission): Access {
  return ({ req: { user } }) => {
    if (!user) return false
    if (user.role === 'superadmin') return true

    const assignments = user.roleAssignments || []
    const allowedRoles = PERMISSION_MAP[permission]

    const matchingAssignments = assignments.filter(a =>
      allowedRoles.includes(a.assignedRole)
    )

    if (matchingAssignments.length === 0) return false

    // If any assignment is global-scoped, allow all
    if (matchingAssignments.some(a => a.scopeType === 'global' || a.scopeType === 'blog')) {
      return true
    }

    // Otherwise filter to their assigned clubs
    const clubIds = matchingAssignments
      .filter(a => a.scopeType === 'club')
      .map(a => typeof a.scopeId === 'object' ? a.scopeId.id : a.scopeId)
      .filter(Boolean)

    if (clubIds.length === 0) return false

    // Return a Payload WHERE constraint
    return {
      organizingClubs: { in: clubIds },
    }
  }
}
```

### 3.8 What Each User Sees (Sidebar Filtering)

```
SuperAdmin sees:
├── Admin Dashboard
├── User Management
├── All content (events, clubs, posts, media)
├── Conosco system page
├── All analytics
└── Everything

club_admin(coding-club) sees:
├── Dashboard (filtered to their club)
├── Club Page Editor (only Coding Club)
├── Events (only Coding Club events)
├── Gallery (only Coding Club)
├── Analytics (only Coding Club)
└── NO: User Management, Conosco, other clubs

blog_editor sees:
├── Dashboard (blog stats)
├── Create Post
├── Content Manager (all posts)
├── Review Queue
├── Categories
├── Templates
└── NO: Events, Clubs, User Management, Conosco

blog_author sees:
├── Dashboard (own posts stats)
├── Create Post
├── My Posts (own posts only)
└── NO: Review Queue, Events, Clubs, anything else

moderator sees:
├── Comments
├── Feedback
└── NO: Posts, Events, Clubs
```

### 3.9 Migration from Old Roles

| Old Role | New Mapping |
|---|---|
| `contributor` | `role: 'user'` + assignment `{ assignedRole: 'blog_author', scopeType: 'blog' }` |
| `editor` | `role: 'user'` + assignment `{ assignedRole: 'blog_editor', scopeType: 'blog' }` |
| `editor + isAdmin` | `role: 'superadmin'` |
| `editor + isAdmin + canManageAdmins` | `role: 'superadmin'` (you) |

Migration script will be provided (Phase 1 deliverable).

### 3.10 Real-World Scenarios

**Scenario 1: Coding Club President**
```
User: Arjun (coding club head)
role: 'user'
roleAssignments: [
  { assignedRole: 'club_admin', scopeType: 'club', scopeId: 'coding-club-id' }
]

Arjun logs in → sees:
  - Coding Club dashboard
  - Coding Club events (create, edit, publish)
  - Coding Club gallery
  - Coding Club analytics
  - Can write blog posts (about Coding Club)

Arjun does NOT see:
  - IEEE club
  - Robotics club
  - User Management
  - Conosco system
```

**Scenario 2: IEEE Branch Counselor**
```
User: Dr. Patel (IEEE faculty advisor)
role: 'user'
roleAssignments: [
  { assignedRole: 'club_admin', scopeType: 'club', scopeId: 'ieee-gcet-id' }
]

See only IEEE data. Same pattern as above.
```

**Scenario 3: Multi-club Student**
```
User: Priya (active in multiple clubs)
role: 'user'
roleAssignments: [
  { assignedRole: 'club_admin', scopeType: 'club', scopeId: 'coding-club-id' },
  { assignedRole: 'club_editor', scopeType: 'club', scopeId: 'ieee-gcet-id' },
  { assignedRole: 'blog_author', scopeType: 'blog' }
]

Priya sees:
  - Coding Club: full admin (create events, publish, manage)
  - IEEE: can create event drafts (but can't publish — needs IEEE admin approval)
  - Blog: can write post drafts
```

**Scenario 4: You (SuperAdmin)**
```
User: You
role: 'superadmin'
roleAssignments: [] // empty — superadmin doesn't need assignments

You see everything. Always.
```

---

## 4. Module Roadmap

### 4.0 Dual-Mode Event Architecture (Event Engine Selection)

**What**: Events can be created in three modes, giving clubs a frictionless entry point while preserving the Conosco upgrade path.

**The Core Tension**: Forcing Conosco for all events = adoption friction. Fully independent CMS = fragmentation. Solution: let the creator choose the engine.

#### Three Event Modes

```
Event Source (dataSource field):
  ┌─────────────────────────────────────────────────────┐
  │ [manual]    Simple CMS Event — lightweight, zero    │
  │             friction. Title, date, poster, reg link.│
  │             No attendance. No compliance.           │
  ├─────────────────────────────────────────────────────┤
  │ [conosco]   Conosco Managed — full power mode.      │
  │             Registration, attendance, certificates, │
  │             compliance, analytics, student credits. │
  │             CMS only enhances (SEO, hero, editorial)│
  ├─────────────────────────────────────────────────────┤
  │ [external]  External Managed — IEEE vTools, Unstop, │
  │             Eventbrite, etc. CMS displays it.       │
  │             Registration link redirects externally. │
  └─────────────────────────────────────────────────────┘
```

#### New Fields on Events Collection

```typescript
// Add to Events.ts — Integration tab
{
  name: 'dataSource',
  type: 'select',
  required: true,
  defaultValue: 'manual',
  options: [
    { label: 'Simple CMS Event', value: 'manual' },
    { label: 'Conosco Managed (Full Power)', value: 'conosco' },
    { label: 'External Platform', value: 'external' },
  ],
},

// New fields for all manual/external events:
{
  name: 'registrationUrl',
  type: 'text',
  admin: {
    description: 'External registration link (Google Form, Unstop, vTools, etc.)',
    condition: (data) => data?.dataSource !== 'conosco',
  },
},

// New fields for external events:
{
  name: 'externalPlatform',
  type: 'select',
  options: [
    { label: 'IEEE vTools', value: 'ieee-vtools' },
    { label: 'Unstop', value: 'unstop' },
    { label: 'Eventbrite', value: 'eventbrite' },
    { label: 'Devfolio', value: 'devfolio' },
    { label: 'Google Forms', value: 'google-forms' },
    { label: 'Other', value: 'other' },
  ],
  admin: {
    condition: (data) => data?.dataSource === 'external',
    description: 'Which platform manages this event',
  },
},
{
  name: 'externalEventUrl',
  type: 'text',
  admin: {
    condition: (data) => data?.dataSource === 'external',
    description: 'Canonical URL on the external platform',
  },
},
```

#### Organic Adoption Funnel

```
Phase 1: Club creates "Simple CMS Event" (3 fields, 30 seconds)
    ↓
Phase 2: Club sees other clubs have attendance counts, certificates
    ↓
Phase 3: "Upgrade to Conosco" prompt on event edit page
    ↓
Phase 4: Event gets linked to Conosco → full power mode
```

This is **ecosystem strategy, not vendor lock-in**:
- CMS works independently (not crippled)
- Conosco adds exponential power (not required)
- Natural migration over time (not forced)

#### Who Creates What (RBAC)

| Role | Simple CMS Event | Conosco Managed | External |
|---|---|---|---|
| `superadmin` | ✅ Create + Publish | ✅ Link + Publish | ✅ Create + Publish |
| `club_admin` (their club) | ✅ Create + Publish | ✅ Link + Publish | ✅ Create + Publish |
| `club_editor` (their club) | ✅ Draft only | ❌ Cannot link | ✅ Draft only |
| `event_manager` (global) | ✅ Create + Publish | ✅ Link + Publish | ✅ Create + Publish |
| `blog_author` | ❌ | ❌ | ❌ |

#### Multi-Club Collaborative Events

Real scenario: IEEE + Coding Club co-host a Hackathon. The event must appear under both clubs.

**Schema**:
```typescript
// On Events collection
{
  name: 'organizingClubs',
  type: 'relationship',
  relationTo: 'clubs',
  hasMany: true,
  admin: {
    description: 'All clubs organizing this event (supports collaboration)',
  },
},
{
  name: 'createdByClub',
  type: 'relationship',
  relationTo: 'clubs',
  admin: {
    description: 'The primary club that created this event — only this club\'s admin can edit',
  },
}
```

**How it works**:
- Event appears on `/clubs/ieee/events` AND `/clubs/coding/events`
- Event detail page shows all organizing club logos
- **Only `createdByClub` admin can edit** — prevents co-organizers overwriting each other
- Other organizing clubs can view but not modify
- RBAC filter: `{ organizingClubs: { in: [userClubId] } }` (contains, not equality)

**Who can edit a collaborative event?**:

| User | Can Edit? |
|---|---|
| `superadmin` | ✅ Always |
| `club_admin` of `createdByClub` | ✅ Full edit |
| `club_admin` of co-organizing club | ❌ View only (they didn't create it) |
| `event_manager` (global) | ✅ Full edit |

**Why NOT `organizingEntities`** (GPT's suggestion to genericize for departments + external partners):
- Premature abstraction. Departments are already a `select` field on events — they don't need to be relationship entities.
- External sponsors/partners are display-only (SponsorsBlock) — they don't own events.
- If departments ever need to truly "organize" events, add `organizingDepartments: hasMany` as a separate field. Simple, no schema gymnastics.

#### Club Creation Policy

Clubs are **rare, structural entities** — not content. Only `superadmin` creates them.

```
SuperAdmin creates club → assigns club_admin → club_admin manages everything inside
```

No self-service club creation. This prevents fragmentation.

---

### 4.1 Auto-Sync Engine (replaces manual "Link" flow)

**What**: When Conosco has new events/clubs, automatically create CMS entries.

**How**:
- Webhook endpoint: `POST /api/webhooks/conosco` (Conosco calls this)
- Fallback cron: `GET /api/cron/sync` (scheduled via Vercel cron, every 30min)
- Creates CMS record with `dataSource: 'conosco'`, links `conoscoEventCode`/`conoscoClubCode`
- Sets `_status: 'draft'` — club admin or superadmin publishes

**Files**:
```
src/app/api/webhooks/conosco/route.ts    — Webhook receiver
src/app/api/cron/sync/route.ts           — Fallback cron
src/services/conosco/sync.ts             — Sync logic (diff + create/update)
```

### 4.2 Club Sub-Pages (Mini-sites)

**What**: Each club gets nested routes under `/clubs/[slug]/`.

**Routes**:
```
/clubs/coding-club              → Club landing page (exists)
/clubs/coding-club/events       → Club-specific events listing
/clubs/coding-club/gallery      → Club photo/video gallery
/clubs/coding-club/team         → Committee members from Conosco
/clubs/coding-club/achievements → Awards, certifications
```

**Files**:
```
src/app/(frontend)/clubs/[slug]/events/page.tsx
src/app/(frontend)/clubs/[slug]/gallery/page.tsx
src/app/(frontend)/clubs/[slug]/team/page.tsx
src/app/(frontend)/clubs/[slug]/achievements/page.tsx
src/modules/clubs/components/ClubNav.tsx         — Sub-navigation tabs
```

### 4.3 Gallery Module

**What**: Photo/video uploads organized by club, event, or general.

**Collection**:
```typescript
// src/modules/gallery/collections/GalleryAlbum.ts
{
  slug: 'gallery-albums',
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'description', type: 'textarea' },
    { name: 'club', type: 'relationship', relationTo: 'clubs' },
    { name: 'event', type: 'relationship', relationTo: 'events' },
    { name: 'coverImage', type: 'upload', relationTo: 'media' },
    { name: 'images', type: 'array', fields: [
      { name: 'image', type: 'upload', relationTo: 'media', required: true },
      { name: 'caption', type: 'text' },
    ]},
    { name: 'visibility', type: 'select', options: ['public', 'members-only'] },
    ...slugField(),
  ],
  access: {
    // Uses new RBAC: club_admin for their club, superadmin for any
    create: hasPermissionFilter('club:manage_gallery'),
    update: hasPermissionFilter('club:manage_gallery'),
    read: authenticatedOrPublished,
    delete: hasPermissionFilter('club:manage_gallery'),
  },
}
```

**Routes**:
```
/gallery                        → All public albums
/clubs/[slug]/gallery           → Club-specific gallery
/editor/gallery                 → Manage albums (scoped to user's clubs)
```

### 4.4 Announcements Module

**What**: Time-sensitive notices (not blog posts). Auto-expire. Can be pinned.

**Collection**:
```typescript
// src/modules/announcements/collections/Announcements.ts
{
  slug: 'announcements',
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'content', type: 'richText' },
    { name: 'priority', type: 'select', options: ['normal', 'important', 'urgent'] },
    { name: 'pinned', type: 'checkbox', defaultValue: false },
    { name: 'expiresAt', type: 'date' },
    { name: 'club', type: 'relationship', relationTo: 'clubs' },
    { name: 'department', type: 'select', options: getDepartmentOptions() },
    { name: 'audience', type: 'select', options: ['all', 'students', 'faculty', 'club-members'] },
  ],
}
```

### 4.5 Committee/Team Display

**What**: Show club leadership, coordinators, faculty advisors.

**Source**: Primarily from Conosco API (`coordinator`, `facultyAdvisor`, `memberCount`). CMS can override for manual clubs.

**No new collection needed** — uses existing Club data + a new display component.

**Files**:
```
src/modules/clubs/components/ClubTeam.tsx         — Team display component
src/app/(frontend)/clubs/[slug]/team/page.tsx     — Route
```

### 4.6 Club Landing Pages (Section Builder Extension)

**What**: Each club gets a customizable landing page using Payload's existing blocks system — extended with new block types and per-club theming.

**Key Insight**: We already have a section builder. The Pages collection uses a `layout` field with `type: 'blocks'` and `RenderBlocks.tsx` renders them via a `blockType` switch. We don't build a new system — we extend what exists.

#### What Already Exists

```
Pages collection (src/collections/Pages/index.ts)
  └── layout: blocks
        ├── Archive (post grid)
        ├── CallToAction
        ├── Content (richText columns)
        ├── MediaBlock (image/video)
        └── FormBlock

Hero system (src/heros/)
  ├── HighImpact (full-bleed image + overlay text)
  ├── MediumImpact (split layout)
  └── LowImpact (minimal)

RenderBlocks.tsx → switch(blockType) renders each block
```

#### What We Add

**1. Link Pages to Clubs**

Add a `club` relationship field to the Pages collection:
```typescript
// In Pages/index.ts
{
  name: 'club',
  type: 'relationship',
  relationTo: 'clubs',
  admin: {
    position: 'sidebar',
    description: 'If set, this page becomes the club landing page at /clubs/[slug]',
  },
}
```

When a Page has a `club` relationship, it renders as that club's landing page at `/clubs/[slug]` instead of the default club detail view.

**2. New Block Types** (add to `src/blocks/`)

| Block | What It Renders | Config Options |
|---|---|---|
| `StatsBlock` | 3-4 stat cards (members, events, years active) | `stats: [{label, value, icon}]` |
| `TeamGridBlock` | Committee/team member cards | `source: 'conosco' \| 'manual'`, `members: [{name,role,image}]`, `layout: 'grid' \| 'carousel'` |
| `EventsFeedBlock` | Upcoming events from this club | `club` (auto-filled), `limit`, `layout: 'cards' \| 'timeline' \| 'compact'` |
| `GalleryPreviewBlock` | Photo grid linking to full gallery | `album` relationship, `limit`, `layout: 'masonry' \| 'grid'` |
| `CountdownBlock` | Countdown to next event | `targetDate`, `eventTitle`, `cta` link |
| `SponsorsBlock` | Logo grid of sponsors/partners | `sponsors: [{name, logo, url}]`, `layout: 'grid' \| 'marquee'` |
| `TestimonialsBlock` | Quote cards from members/alumni | `testimonials: [{quote, author, role, image}]` |

**3. Per-Club Theme Tokens** (stored on Club document)

```typescript
// Add to Clubs collection
{
  name: 'theme',
  type: 'group',
  admin: { description: 'Visual customization for this club\'s landing page' },
  fields: [
    {
      name: 'primaryColor',
      type: 'text',
      defaultValue: '#0047AB',
      admin: { description: 'Hex color (e.g., #0047AB)' },
    },
    {
      name: 'accentColor',
      type: 'text',
      admin: { description: 'Secondary accent color' },
    },
    {
      name: 'cardStyle',
      type: 'select',
      defaultValue: 'default',
      options: [
        { label: 'Default', value: 'default' },
        { label: 'Glass', value: 'glass' },
        { label: 'Bordered', value: 'bordered' },
        { label: 'Elevated', value: 'elevated' },
      ],
    },
    {
      name: 'fontPreset',
      type: 'select',
      defaultValue: 'default',
      options: [
        { label: 'Default (Inter)', value: 'default' },
        { label: 'Modern (Space Grotesk)', value: 'modern' },
        { label: 'Classic (Merriweather)', value: 'classic' },
        { label: 'Technical (JetBrains Mono)', value: 'technical' },
      ],
    },
  ],
}
```

Theme tokens are injected as CSS custom properties on the club landing page wrapper:
```tsx
<div style={{
  '--club-primary': club.theme?.primaryColor || '#0047AB',
  '--club-accent': club.theme?.accentColor || '#3B82F6',
}} className={`club-theme club-card-${club.theme?.cardStyle || 'default'}`}>
  <RenderBlocks blocks={page.layout} />
</div>
```

#### Design Philosophy

**Level 2 (Controlled Section Builder)** — not Level 1 (static templates) or Level 3 (raw HTML).

- **Same engine, different skin**: All clubs use the same blocks. Theme tokens create visual differentiation.
- **Structure stays, appearance varies**: IEEE gets blue/formal, Coding Club gets dark/neon, Incubation gets white/minimal.
- **No CSS editing, no HTML injection**: Controlled presets prevent design chaos.
- **2 layout variants per block** is enough: grid vs carousel, timeline vs cards = perceived diversity without complexity explosion.

#### Real GCET Example

```
IEEE GCET Landing Page:
  Hero: HighImpact (blue overlay + IEEE logo)
  Blocks: [Stats, About (Content), EventsFeed (cards), TeamGrid (grid), Gallery]
  Theme: primaryColor=#00629B, cardStyle=bordered, fontPreset=classic

Coding Club Landing Page:
  Hero: HighImpact (dark overlay + code pattern)
  Blocks: [Countdown, About (Content), EventsFeed (timeline), Sponsors, CTA]
  Theme: primaryColor=#10B981, cardStyle=glass, fontPreset=modern

Incubation Centre Landing Page:
  Hero: MediumImpact (split: text + startup collage)
  Blocks: [Stats, Content, TestimonialsBlock, CTA]
  Theme: primaryColor=#6366F1, cardStyle=elevated, fontPreset=default
```

Same backend. Same renderer. Visually distinct.

#### Who Manages Landing Pages (RBAC)

| Role | Can Edit Landing Page? |
|---|---|
| `superadmin` | Any club's landing page |
| `club_admin` (their club) | Only their own club's landing page |
| `club_editor` (their club) | Draft changes (needs club_admin approval) |
| `blog_editor` | Cannot edit club landing pages |

---

### 4.7 Deep Conosco Integration Layer (THE Differentiator)

> **Why this is v2, not v3**: The Conosco API already exposes this data. The provider is already built.
> These are _display-layer features_ that make the platform unique. Multi-tenant infrastructure
> (instituteId, hostname routing) stays v3. But the features that make this platform NOT WordPress
> ship in v2. This is what you sell. This is what visits from conosco.in must showcase.

#### What Conosco API Already Exposes vs What v1 Displays

| API Data | v1 Status | v2 Action |
|---|---|---|
| `completion.attendeeCount` | ✅ Displayed (EventEnrichment sidebar) | Already done |
| `completion.feedbackRating` | ✅ Displayed (EventEnrichment sidebar) | Already done |
| `completion.certificateAvailable` | ⚠️ External link to Conosco URL | Create branded in-app verification |
| `completion.certificateVerificationUrl` | ⚠️ External link only | Create `/verify/[code]` page |
| `naacCriteria[]` | ❌ Not in EventDisplayData, not rendered | Add to context + display |
| `recentAchievements[]` (on events) | ❌ Only on clubs, not events | Add to event context + display |
| `EventStats` (total, participants, rating, byType, byDepartment) | ❌ Not displayed publicly | Create campus stats dashboard |
| `ClubStats` (total, members, byClassification, byDepartment) | ❌ Not displayed publicly | Create campus stats dashboard |
| `registration` (live counts) | ✅ Displayed (EventEnrichment sidebar) | Already done |
| `coordinator` + `facultyAdvisor` | ✅ Displayed (ClubEnrichment sidebar) | Already done |
| `recentAchievements[]` (on clubs) | ✅ Displayed (ClubEnrichment sidebar) | Already done |

**The gap**: 5 rich data points available from Conosco that are NOT shown. All zero-friction to display — no API work needed, only frontend components.

#### 4.7.1 Campus Stats Dashboard (`/campus`)

Public-facing page showing institutional vibrancy, powered entirely by cached Conosco API data:

```
┌──────────────────────────────────────────────────────────┐
│               GCET Campus — By The Numbers                │
├──────────────────────────────────────────────────────────┤
│  📊 Events                                                │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐         │
│  │  152   │  │  12K   │  │  4.2★  │  │   32   │         │
│  │ Total  │  │Partici-│  │  Avg   │  │Upcoming│         │
│  │ Events │  │ pants  │  │ Rating │  │        │         │
│  └────────┘  └────────┘  └────────┘  └────────┘         │
│                                                           │
│  🏛️ Clubs                                                 │
│  ┌────────┐  ┌────────┐  ┌────────┐                     │
│  │   28   │  │  1,200 │  │   24   │                     │
│  │ Active │  │ Total  │  │ Active │                     │
│  │ Clubs  │  │Members │  │        │                     │
│  └────────┘  └────────┘  └────────┘                     │
│                                                           │
│  📈 By Department          📈 By Event Type               │
│  ┌──────────────────┐     ┌──────────────────────┐       │
│  │ CSE: 45 events   │     │ Workshop: 38         │       │
│  │ ECE: 28 events   │     │ Competition: 25      │       │
│  │ MECH: 22 events  │     │ Seminar: 22          │       │
│  │ EEE: 18 events   │     │ Guest Lecture: 18    │       │
│  └──────────────────┘     └──────────────────────┘       │
│                                                           │
│  Powered by Conosco — Academic Operating System           │
└──────────────────────────────────────────────────────────┘
```

**Data source**: `getCachedEventStats()` + `getCachedClubStats()` — **already implemented** in `cached.ts`. Zero new API work. Just render.

**SEO value**: `/campus` becomes the go-to page for GCET's digital presence. Indexed by Google. Shareable.

#### 4.7.2 NAAC Compliance Evidence Display

Events tagged with NAAC criteria in Conosco get compliance badges on the public site.

**On event detail page** — new panel in `EventEnrichment`:
```tsx
{event.naacCriteria && event.naacCriteria.length > 0 && (
  <div className="rounded-xl border border-green-200 bg-green-50 p-5">
    <h3 className="text-sm font-semibold flex items-center gap-2">
      <ShieldCheck className="h-4 w-4 text-green-600" />
      NAAC Compliance
    </h3>
    <div className="flex flex-wrap gap-1.5 mt-2">
      {event.naacCriteria.map(c => (
        <span key={c} className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
          {c}
        </span>
      ))}
    </div>
  </div>
)}
```

**Dedicated NAAC evidence page** (`/campus/naac`):
- Aggregates all completed events grouped by NAAC criterion
- Shows completion stats (attendees, feedback rating) as evidence per criterion
- Filterable by academic year
- Exportable (print-friendly layout) for accreditation committees

```
/campus/naac
┌──────────────────────────────────────────────────────────┐
│  NAAC Compliance Evidence — Auto-Generated from Conosco   │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  Criterion 3.4: Research & Innovation                     │
│  ├── National Hackathon 2026 (450 participants, 4.5★)     │
│  ├── Research Paper Workshop (120 participants, 4.2★)     │
│  └── Innovation Fair (300 participants, 4.7★)             │
│                                                           │
│  Criterion 5.3: Student Participation                     │
│  ├── Inter-College Coding Contest (200 participants)      │
│  ├── Cultural Fest (1,500 participants, 4.8★)             │
│  └── Sports Meet (800 participants, 4.3★)                 │
│                                                           │
│  [Print Report]  [Export PDF]                              │
└──────────────────────────────────────────────────────────┘
```

**Why this matters**: NO generic CMS can auto-generate NAAC evidence from operational data. This is what you sell to principals. Conosco manages events → compliance evidence appears automatically on the public site.

#### 4.7.3 Certificate Verification Page (`/verify/[code]`)

Branded in-app verification instead of redirecting to an external Conosco URL:

```
/verify/EVT-2026-HACKATHON
┌──────────────────────────────────────────────────────────┐
│  ✓ Certificate Verification                              │
│                                                           │
│  Event: National Hackathon 2026                           │
│  Organized by: GCET (via Conosco)                         │
│  Date: March 15-16, 2026                                  │
│  Attendees: 450                                           │
│  Rating: 4.5 / 5                                          │
│                                                           │
│  ✅ Certificate Status: VALID                              │
│  Verified via Conosco Academic Operating System            │
│                                                           │
│  [View Event Details →]  [Conosco Verification ↗]         │
└──────────────────────────────────────────────────────────┘
```

**Implementation**:
- Route: `src/app/(frontend)/verify/[code]/page.tsx`
- Queries Conosco API by event code
- Shows completion data with trust seal
- Links back to CMS event detail page
- Shareable URL — participants can share their certificate verification link
- OG meta tags for social sharing: "Certificate for National Hackathon 2026 — Verified ✓"

#### 4.7.4 Event Achievements & NAAC in Context

`recentAchievements[]` and `naacCriteria[]` exist on `PublicEvent` but aren't passed through `event-context.ts`. Fix:

1. Add `naacCriteria?: string[]` and `recentAchievements?: PublicAchievement[]` to `EventDisplayData` type
2. Pass through in `getEventDisplayData()` merge (line ~85 in event-context.ts)
3. Display as sidebar panels in `EventEnrichment`

```typescript
// In event-context.ts merge:
return {
  // ... existing fields ...
  naacCriteria: conoscoEvent?.naacCriteria,         // NEW
  recentAchievements: conoscoEvent?.recentAchievements,  // NEW
}
```

#### 4.7.5 Campus Vibrancy Widgets (Reusable Components)

Embeddable components showing live Conosco stats for use on homepage, landing pages, and club pages:

| Component | What It Shows | Use Case |
|---|---|---|
| `CampusStatsBar` | Horizontal stats strip (events count, participants, clubs, members) | Homepage hero footer, landing pages |
| `AchievementTicker` | Scrolling achievements across all clubs | Homepage, sidebar |
| `CampusStatsBlock` | Full stats block (for Pages builder) | Club landing pages, department pages |

All pull from cached Conosco API. Server components. No client-side JS for the data.

#### 4.7.6 The Competitive Moat

```
WordPress / Ghost / any generic CMS:
  ✗ No ERP integration — every data point manually typed
  ✗ No live registration counts
  ✗ No attendance data after events
  ✗ No certificate verification
  ✗ No NAAC compliance evidence
  ✗ No institutional stats dashboard
  ✗ Blog ≠ institutional operating system

Conosco Sites (this platform):
  ✓ Events auto-sync from Conosco ERP
  ✓ Live registration counts — real-time from Conosco
  ✓ Attendance & feedback stats after event completion
  ✓ Branded certificate verification page (/verify/[code])
  ✓ NAAC compliance evidence auto-generated (/campus/naac)
  ✓ Campus stats dashboard — zero manual updates (/campus)
  ✓ Achievement display from ERP data
  ✓ The CMS enhances presentation. The ERP provides operational truth.

This is what you sell to principals.
This is what people see when they visit conosco.in.
This is v2, not "someday."
```

---

## 5. Implementation Phases

### Phase 1: RBAC Core (Week 1) — ✅ COMPLETE

**Goal**: Replace the role system. Everything keeps working, just with new roles.

| # | Task | Est | Status |
|---|---|---|---|
| 1.1 | Add `roleAssignments` array field to Users collection | 2h | ✅ Done |
| 1.2 | Change `role` field from `contributor/editor/admin` to `superadmin/user` | 1h | ✅ Done |
| 1.3 | Remove `isAdmin` and `canManageAdmins` fields | 1h | ✅ Done |
| 1.4 | Create `src/access/permissions.ts` — permission map + constants | 2h | ✅ Done (174 lines) |
| 1.5 | Create `src/access/hasPermission.ts` — core permission checker | 3h | ✅ Done (361 lines) |
| 1.6 | Create `src/access/hasClubAccess.ts` — club-scoped shortcut | 1h | ✅ Done (121 lines) |
| 1.7 | Create `src/access/hasBlogAccess.ts` — blog-scoped shortcut | 1h | ✅ Done (101 lines) |
| 1.8 | Create `src/access/isSuperAdmin.ts` — replaces adminOnly | 30m | ✅ Done |
| 1.9 | Create `src/access/selfOrAdmin.ts` — replaces adminOrSelf | 30m | ✅ Done |
| 1.10 | Update Users collection access controls for new system | 2h | ✅ Done |
| 1.11 | Update Posts collection access (use `hasBlogAccess`) | 1h | ✅ Done |
| 1.12 | Update Events collection access (use `hasClubAccess`) | 1h | ✅ Done |
| 1.13 | Update Clubs collection access (use `hasClubAccess`) | 1h | ✅ Done |
| 1.14 | Update Media, Comments, AdminLogs access | 1h | ✅ Done |
| 1.15 | Write migration script: old roles → new roles | 2h | ✅ Done (`scripts/migrate-to-rbac.js`, 279 lines) |
| 1.16 | Update EditorSidebar: filter nav items by assignments | 3h | ✅ Done |
| 1.17 | Update all editor pages: check permissions, filter by scope | 3h | ✅ Done (most pages use `checkPermission()`) |
| 1.18 | Create role management page | 4h | ✅ Done (`RoleManagementDialog.tsx` + `UserActions.tsx`) |
| 1.19 | Update middleware.ts route guards | 2h | ✅ Done |
| 1.20 | Regenerate payload-types.ts | 15m | ✅ Done |
| 1.21 | Full build + test | 2h | ✅ Done (TypeScript clean, dev server runs) |

**Deliverables**:
- ✅ Old `contributor/editor/admin` system fully replaced
- ✅ SuperAdmin can assign roles to users
- ✅ Sidebar filters by assignment
- ✅ Blog authors see only their posts
- ✅ Migration script for existing users
- ✅ **Enhancement**: `institution_admin` role added as college-level bypass
- ✅ **Enhancement**: Route architecture split — `/platform` (superadmin) vs `/user` (institution)
- ✅ **Enhancement**: Legacy route redirects (`/editor/*`, `/admin-dashboard/*` → `/user/*`)

**Remaining cleanup** (carry into Phase 2):
- ⚠️ `editorOnly.ts` still imported by Templates, Newsletters, NewsletterSubscribers, NewsletterEvents — checks dead `role === 'editor'`
- ⚠️ Old access files exist but unused by core collections: `adminOnly.ts`, `adminOrSelf.ts`, `contributorOwn.ts`, `canManageAdminsAccess.ts`, `isAdminAccess.ts`, `editorOrAdmin.ts`

### Phase 2: Club Scoping + Sub-Pages (Week 2) — ⬜ NOT STARTED

**Goal**: Club admins managing their own space. Club sub-pages live.

**Prerequisites from Phase 1 cleanup**:
- [ ] Replace `editorOnly.ts` usage in Templates, Newsletters, NewsletterSubscribers, NewsletterEvents with proper RBAC
- [ ] Delete unused legacy access files (`adminOnly.ts`, `adminOrSelf.ts`, `contributorOwn.ts`, etc.)
- [ ] Add `organizingClubs` field to Events collection (access control already references it but field missing)

| # | Task | Est |
|---|---|---|
| 2.1 | Add `organizingClubs` (hasMany) + `createdByClub` relationships to Events collection | 1.5h |
| 2.1b | Add `external` dataSource option + `registrationUrl` + `externalPlatform` + `externalEventUrl` fields to Events | 1.5h |
| 2.1c | Add "Upgrade to Conosco" prompt component on manual/external event edit pages | 2h |
| 2.2 | Update event-context.ts to filter by club | 1h |
| 2.3 | Create club coordinator dashboard (`/editor/my-club/[slug]`) | 4h |
| 2.4 | Create club event manager (scoped to one club) | 3h |
| 2.5 | Create `/clubs/[slug]/events/page.tsx` (club-filtered events) | 2h |
| 2.6 | Create `/clubs/[slug]/team/page.tsx` | 2h |
| 2.7 | Create `/clubs/[slug]/achievements/page.tsx` | 2h |
| 2.8 | Create `ClubNav.tsx` (sub-navigation tabs) | 1h |
| 2.9 | Update `ClubEnrichment.tsx` to link to sub-pages | 1h |
| 2.10 | Add `club` relationship field to Pages collection | 30m |
| 2.11 | Add `theme` group (primaryColor, accentColor, cardStyle, fontPreset) to Clubs collection | 1h |
| 2.12 | Create new block types: StatsBlock, TeamGridBlock, EventsFeedBlock, CountdownBlock | 6h |
| 2.13 | Create new block types: GalleryPreviewBlock, SponsorsBlock, TestimonialsBlock | 4h |
| 2.13b | Create new block types: ScheduleBlock (multi-day agenda), ContactBlock (location + map) | 3h |
| 2.14 | Add club theme token injection wrapper + CSS custom properties | 1.5h |
| 2.15 | Update `RenderBlocks.tsx` to include all new block components | 30m |
| 2.16 | Add 2 layout variants per block (grid/carousel, timeline/cards) | 3h |
| 2.17 | Build + test | 2h |

**Deliverables**:
- ✅ Club admin sees only their club's data
- ✅ Club sub-pages work (`/clubs/coding/events`, etc.)
- ✅ Events linked to organizing club
- ✅ Club landing pages via Pages collection + blocks
- ✅ 7 new block types for rich club pages
- ✅ Per-club theming (colors, card style, font preset)

### Phase 3: Gallery Module (Week 3) — ~2 days

| # | Task | Est |
|---|---|---|
| 3.1 | Create GalleryAlbum collection | 2h |
| 3.2 | Create gallery module types | 1h |
| 3.3 | Create GalleryGrid component (masonry or grid) | 3h |
| 3.4 | Create AlbumDetail component (lightbox viewer) | 3h |
| 3.5 | Create `/gallery/page.tsx` (all public albums) | 2h |
| 3.6 | Create `/clubs/[slug]/gallery/page.tsx` | 1h |
| 3.7 | Create `/editor/gallery/page.tsx` (manage albums, scoped) | 3h |
| 3.8 | Add gallery to payload.config.ts | 15m |
| 3.9 | Build + test | 1h |

### Phase 4: Auto-Sync Engine (Week 3) — ~2 days

| # | Task | Est |
|---|---|---|
| 4.1 | Create `src/services/conosco/sync.ts` (diff + upsert logic) | 4h |
| 4.2 | Create webhook endpoint (`/api/webhooks/conosco`) | 2h |
| 4.3 | Create cron endpoint (`/api/cron/sync`) | 1h |
| 4.4 | Add `vercel.json` cron config | 15m |
| 4.5 | Auto-create CMS entries for new Conosco events/clubs | 2h |
| 4.6 | Auto-assign `organizingClubs` by matching clubCode | 1h |
| 4.7 | Update lastSyncedAt timestamp on sync | 30m |
| 4.8 | Add sync status to Conosco admin page | 1h |
| 4.9 | Build + test | 1h |

### Phase 4b: Deep Conosco Integration (Week 3-4) — ~2.5 days

**Goal**: Surface the data Conosco already exposes that makes this platform NOT WordPress. This is the competitive moat — all display-layer work, zero new API endpoints.

| # | Task | Est |
|---|---|---|
| 4b.1 | Add `naacCriteria?: string[]` + `recentAchievements?: PublicAchievement[]` to `EventDisplayData` type | 30m |
| 4b.2 | Update `event-context.ts` to pass through `naacCriteria` + `recentAchievements` from Conosco merge | 30m |
| 4b.3 | Add NAAC compliance panel to `EventEnrichment` sidebar component | 1h |
| 4b.4 | Add achievements panel to `EventEnrichment` sidebar component | 1h |
| 4b.5 | Create `/campus/page.tsx` — public campus stats dashboard (uses `getCachedEventStats` + `getCachedClubStats`) | 3h |
| 4b.6 | Create `/campus/naac/page.tsx` — NAAC evidence aggregation page (events grouped by criterion + completion stats) | 3h |
| 4b.7 | Create `/verify/[code]/page.tsx` — branded certificate verification page with trust seal + OG meta | 2h |
| 4b.8 | Create `CampusStatsBar` component (horizontal stats strip for homepage/landing pages) | 1.5h |
| 4b.9 | Create `AchievementTicker` component (scrolling recent achievements) | 1h |
| 4b.10 | Create `CampusStatsBlock` (for Pages builder — embed stats in any landing page) | 1h |
| 4b.11 | Update `RenderBlocks.tsx` to include `CampusStatsBlock` | 15m |
| 4b.12 | Add campus stats bar to homepage layout | 30m |
| 4b.13 | Build + test | 1h |

**Deliverables**:
- ✅ NAAC compliance badges on Conosco events
- ✅ Achievements shown on event detail pages (not just clubs)
- ✅ Public campus stats dashboard at `/campus`
- ✅ NAAC evidence page at `/campus/naac` (auto-generated, print-friendly)
- ✅ Branded certificate verification at `/verify/[code]`
- ✅ Reusable stats components for homepage and landing pages
- ✅ Every data point Conosco exposes is now visible on the public site

### Phase 5: Announcements Module (Week 4) — ~1.5 days

| # | Task | Est |
|---|---|---|
| 5.1 | Create Announcements collection | 1.5h |
| 5.2 | Create AnnouncementCard component | 1h |
| 5.3 | Create AnnouncementBanner (pinned/urgent) | 1h |
| 5.4 | Create `/announcements/page.tsx` | 1.5h |
| 5.5 | Add announcement banner to layout | 1h |
| 5.6 | Create `/editor/announcements/page.tsx` | 2h |
| 5.7 | Auto-expire logic (check `expiresAt` in queries) | 1h |
| 5.8 | Build + test | 1h |

### Phase 5b: Search + RSS + Polish (Week 4) — ~1 day

| # | Task | Est |
|---|---|---|
| 5b.1 | Extend searchPlugin to index `events` and `clubs` (add to collections array + update beforeSync) | 1.5h |
| 5b.2 | Update `/search` page to show events/clubs results alongside posts | 1h |
| 5b.3 | Add RSS feed route handler (`/feed.xml`) for blog posts | 1.5h |
| 5b.4 | Add Breadcrumb component for club sub-pages | 1h |
| 5b.5 | Add "Upgrade to Conosco" prompt on manual/external event edit page | 1h |
| 5b.6 | Scope media queries by club in editor (filter by contextType+contextId) | 1h |
| 5b.7 | Build + test | 1h |

### Phase 6: Polish + Integration Testing (Week 4) — ~2 days

| # | Task | Est |
|---|---|---|
| 6.1 | End-to-end test: create user → assign club_admin → they see only their club | 2h |
| 6.2 | Test: blog_author can only see/edit own posts | 1h |
| 6.3 | Test: superadmin sees everything | 1h |
| 6.4 | Test: auto-sync creates CMS entries correctly | 1h |
| 6.5 | Performance check: scoped queries don't slow down | 1h |
| 6.6 | Fix any access control gaps | 2h |
| 6.7 | Update all TypeScript types | 1h |
| 6.8 | Final build validation | 1h |
| 6.9 | Update MASTER_PLAN.md with v2 status | 1h |
| 6.10 | Add lightweight page view tracking (server action increments counter) | 2h |
| 6.11 | Add club analytics dashboard (views, event count, post count per club) | 3h |

---

## 6. File Manifest

### New Files (v2)

```
# RBAC Core — ✅ ALL CREATED
src/access/permissions.ts              — Permission map + constants ✅
src/access/hasPermission.ts            — Core permission checker ✅
src/access/hasClubAccess.ts            — Club-scoped access shortcut ✅
src/access/hasBlogAccess.ts            — Blog-scoped access shortcut ✅
src/access/isSuperAdmin.ts             — SuperAdmin check ✅
src/access/selfOrAdmin.ts              — Self or superadmin access ✅
scripts/migrate-to-rbac.js            — Migration script (279 lines) ✅

# Role Management UI — ✅ ALL CREATED
src/app/user/users/RoleManagementDialog.tsx   — Role assign/remove dialog ✅
src/app/user/users/UserActions.tsx            — Per-user action menu ✅
src/app/user/users/actions.ts                 — Server actions for role mgmt ✅

# Platform Management — ✅ CREATED
src/app/platform/                      — SuperAdmin-only dashboard ✅

# Auto-Sync — ⬜ NOT YET
src/services/conosco/sync.ts           — Diff + upsert logic
src/app/api/webhooks/conosco/route.ts  — Webhook receiver
src/app/api/cron/sync/route.ts         — Cron fallback

# Club Sub-Pages
src/app/(frontend)/clubs/[slug]/events/page.tsx
src/app/(frontend)/clubs/[slug]/gallery/page.tsx
src/app/(frontend)/clubs/[slug]/team/page.tsx
src/app/(frontend)/clubs/[slug]/achievements/page.tsx
src/modules/clubs/components/ClubNav.tsx
src/modules/clubs/components/ClubTeam.tsx

# Club Landing Page Blocks
src/blocks/StatsBlock/config.ts
src/blocks/StatsBlock/Component.tsx
src/blocks/TeamGrid/config.ts
src/blocks/TeamGrid/Component.tsx
src/blocks/EventsFeed/config.ts
src/blocks/EventsFeed/Component.tsx
src/blocks/CountdownBlock/config.ts
src/blocks/CountdownBlock/Component.tsx
src/blocks/GalleryPreview/config.ts
src/blocks/GalleryPreview/Component.tsx
src/blocks/SponsorsBlock/config.ts
src/blocks/SponsorsBlock/Component.tsx
src/blocks/TestimonialsBlock/config.ts
src/blocks/TestimonialsBlock/Component.tsx
src/blocks/ScheduleBlock/config.ts
src/blocks/ScheduleBlock/Component.tsx
src/blocks/ContactBlock/config.ts
src/blocks/ContactBlock/Component.tsx
src/components/ClubThemeWrapper.tsx
src/components/Breadcrumbs.tsx

# Deep Conosco Integration
src/app/(frontend)/campus/page.tsx              — Campus stats dashboard (public)
src/app/(frontend)/campus/naac/page.tsx          — NAAC compliance evidence (public, print-friendly)
src/app/(frontend)/verify/[code]/page.tsx        — Certificate verification (public, shareable)
src/components/CampusStatsBar.tsx                — Horizontal stats strip (homepage/landing pages)
src/components/AchievementTicker.tsx              — Scrolling achievements ticker
src/blocks/CampusStats/config.ts                 — Campus stats block for Pages builder
src/blocks/CampusStats/Component.tsx             — Campus stats block component

# Search + RSS
src/app/(frontend)/feed.xml/route.ts

# Gallery Module
src/modules/gallery/collections/GalleryAlbum.ts
src/modules/gallery/types/index.ts
src/modules/gallery/components/GalleryGrid.tsx
src/modules/gallery/components/AlbumDetail.tsx
src/modules/gallery/index.ts
src/app/(frontend)/gallery/page.tsx
src/app/(frontend)/editor/gallery/page.tsx

# Announcements Module
src/modules/announcements/collections/Announcements.ts
src/modules/announcements/components/AnnouncementCard.tsx
src/modules/announcements/components/AnnouncementBanner.tsx
src/modules/announcements/index.ts
src/app/(frontend)/announcements/page.tsx
src/app/(frontend)/editor/announcements/page.tsx

# Role Management
src/app/admin-dashboard/roles/page.tsx
scripts/migrate-roles.ts

# Editor Scoped Dashboard
src/app/(frontend)/editor/my-club/[slug]/page.tsx
src/app/(frontend)/editor/my-club/[slug]/events/page.tsx
```

### Modified Files (v2)

```
# Phase 1 — ✅ ALL DONE
src/collections/Users/index.ts         — New role system + assignments array ✅
src/collections/Posts/index.ts          — Access updated to hasBlogAccess ✅
src/modules/events/collections/Events.ts — Access updated to hasPermission ✅ (organizingClubs field still needed — Phase 2)
src/modules/clubs/collections/Clubs.ts  — Access updated to hasClubAccess ✅ (theme group — Phase 2)
src/collections/Media.ts               — Access update ✅
src/collections/Comments/index.ts      — Access update (moderator role) ✅
src/collections/AdminLogs/index.ts     — Access update ✅
src/middleware.ts                       — Route guards for new role system ✅
src/payload-types.ts                    — Regenerated ✅
src/app/(frontend)/editor/components/EditorSidebar.tsx — Filter by assignments ✅
src/app/(frontend)/editor/components/EditorHeader.tsx — Updated for new roles ✅

# Phase 2+ — ⬜ NOT YET
src/modules/events/collections/Events.ts — Add organizingClubs (hasMany) + createdByClub fields
src/modules/clubs/collections/Clubs.ts  — Add theme group
src/collections/Pages/index.ts          — Add club relationship + new blocks + CampusStatsBlock
src/blocks/RenderBlocks.tsx             — Register 7+1 new block components (including CampusStatsBlock)
src/payload.config.ts                   — Add GalleryAlbum, Announcements
src/custom/theme.ts                     — Add gallery, announcements feature flags
src/plugins/index.ts                    — Extend searchPlugin collections to include events, clubs
src/search/beforeSync.ts                — Update to handle events/clubs sync
src/app/(frontend)/search/page.tsx      — Show events/clubs in search results

# Deep Conosco Integration modifications — ⬜ NOT YET
src/modules/events/types/index.ts       — Add naacCriteria + recentAchievements to EventDisplayData
src/modules/events/services/event-context.ts — Pass through naacCriteria + recentAchievements from Conosco merge
src/modules/events/components/EventHero.tsx — Add NAAC + achievements panels to EventEnrichment
src/app/(frontend)/layout.tsx           — Add CampusStatsBar to homepage layout (conditionally)
```

### Deprecated Files (v2)

These become thin re-exports for backward compatibility during migration, then removed:

```
src/access/adminOnly.ts        → replaced by isSuperAdmin.ts ✅ (unused by core collections, delete safe)
src/access/adminOrSelf.ts      → replaced by selfOrAdmin.ts ✅ (unused by core collections, delete safe)
src/access/editorOnly.ts       → ⚠️ STILL USED by Templates, Newsletters, NewsletterSubscribers, NewsletterEvents — MUST replace before deleting
src/access/editorOrAdmin.ts    → already deprecated ✅ (unused, delete safe)
src/access/isAdminAccess.ts    → replaced by isSuperAdmin.ts ✅ (unused, delete safe)
src/access/canManageAdminsAccess.ts → removed concept ✅ (unused, delete safe)
src/access/contributorOwn.ts   → replaced by hasPermission('blog:edit_own') ✅ (unused, delete safe)
```

---

## 7. Migration Strategy

### 7.1 Database Migration — ✅ IMPLEMENTED

> **Implementation**: `scripts/migrate-to-rbac.js` (279 lines) — maps old roles to new system, creates GCET institution, links all content.

```typescript
// scripts/migrate-roles.ts
// Run once: converts old role system to new

async function migrateRoles(payload) {
  const users = await payload.find({ collection: 'users', limit: 1000 })

  for (const user of users.docs) {
    const assignments = []

    // Map old roles to assignments
    if (user.role === 'contributor') {
      assignments.push({
        assignedRole: 'blog_author',
        scopeType: 'blog',
        scopeLabel: 'Blog',
      })
    }

    if (user.role === 'editor') {
      assignments.push({
        assignedRole: 'blog_editor',
        scopeType: 'blog',
        scopeLabel: 'Blog',
      })
    }

    // Determine new base role
    const newRole = user.isAdmin ? 'superadmin' : 'user'

    await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        role: newRole,
        roleAssignments: assignments,
        // Remove old fields via MongoDB update later
      },
    })
  }
}
```

### 7.2 Rollback Plan

Keep old access control functions as thin wrappers for 1 release cycle:

```typescript
// src/access/editorOnly.ts (temporary backward compat)
import { hasPermission } from './hasPermission'
/** @deprecated Use hasPermission('blog:edit_any') instead */
export const editorOnly = hasPermission('blog:edit_any')
```

---

## 8. Decision Log

| # | Decision | Rationale | Date |
|---|---|---|---|
| 1 | Two base roles (`superadmin`, `user`) instead of hierarchical | Simpler. All power comes from assignments, not role level. | 2026-03-03 |
| 2 | Role assignments on User document (not separate collection) | Less complexity. Array field is simpler than join table. Max ~5-10 assignments per user — no performance issue. | 2026-03-03 |
| 3 | Permission map is code-defined, not database-stored | Permissions rarely change. Code-defined = type-safe, no admin UI footgun. | 2026-03-03 |
| 4 | SuperAdmin bypasses all checks unconditionally | No edge cases. SuperAdmin is god. Period. | 2026-03-03 |
| 5 | club_editor cannot publish (needs club_admin approval) | Prevents accidental publication. Two-person rule for clubs. | 2026-03-03 |
| 6 | blog_author cannot publish (needs blog_editor approval) | Same as old contributor→editor flow. Preserved. | 2026-03-03 |
| 7 | Auto-sync creates records as `draft` | Club admin or superadmin reviews before publishing. Prevents garbage data from going live. | 2026-03-03 |
| 8 | Gallery is a separate collection (not inline on Media) | Albums have metadata (title, club, event, visibility). Media is raw files. Different concerns. | 2026-03-03 |
| 9 | Announcements are not Posts with a variant | Different lifecycle (expiry, pinning, audience targeting). Different UI (banner vs article). Separate concerns. | 2026-03-03 |
| 10 | Migration script, not destructive schema change | Existing users keep working. Old role maps to equivalent assignment. Zero downtime. | 2026-03-03 |
| 11 | Sidebar filtering by assignments (client-side) | User object is already loaded. Filtering ~15 nav items by checking assignments is trivial. No extra API call. | 2026-03-03 |
| 12 | Old access files become thin wrappers, then removed | Backward compatibility for 1 release. No breakage during transition. | 2026-03-03 |
| 13 | Three event modes: `manual`, `conosco`, `external` | Avoids vendor lock-in. Simple CMS events = zero-friction entry point. Conosco = upgrade path. External = platform interop. | 2026-03-03 |
| 14 | `registrationUrl` on manual/external events | Every event needs a registration CTA. Conosco handles its own; manual/external need an explicit link. | 2026-03-03 |
| 15 | Only SuperAdmin creates clubs | Clubs are structural, not content. Prevents fragmentation. SuperAdmin creates → assigns club_admin → they manage. | 2026-03-03 |
| 16 | No self-service club creation | Club count is small (~10-30). Manual creation by platform owner ensures quality and prevents spam. | 2026-03-03 |
| 17 | Club landing pages use existing Pages collection + blocks | Pages collection already IS a section builder. Adding club relationship + new block types is extension, not new system. | 2026-03-04 |
| 18 | Level 2 (Controlled Section Builder), not Level 1 or 3 | Level 1 (static templates) = all clubs look identical. Level 3 (raw HTML) = maintenance nightmare. Level 2 = structured flexibility via blocks + theme tokens. | 2026-03-04 |
| 19 | Per-club theme tokens (CSS custom properties), not custom CSS | Prevents design chaos. 4 configurable tokens (primary, accent, cardStyle, fontPreset) × 7 blocks × 2 layout variants = hundreds of visual combinations without complexity. | 2026-03-04 |
| 20 | 2 layout variants per block, not unlimited | Perceived diversity without complexity explosion. Grid vs carousel, timeline vs cards. 8-10 style toggles = 100+ unique combinations. Enough for ~30 clubs. | 2026-03-04 |
| 21 | Extend search to events + clubs | `searchPlugin` already installed and indexing posts. Adding 2 more collections = trivial config change. Search is expected by institutions. | 2026-03-04 |
| 22 | RSS feed for blog | Standard expectation. Simple Next.js route handler generating XML from published posts. Zero dependencies. | 2026-03-04 |
| 23 | Multi-tenant (hostname routing) is v3, not v2 | Single-domain deployment is correct for GCET now. Multi-tenant requires tenant-aware DB queries, hostname resolution, config-per-tenant. Not needed until second college. | 2026-03-04 |
| 24 | Lightweight analytics (view counter), not full analytics platform | Server action increments counter. No Google Analytics dependency. Club admins see basic numbers. Full analytics is Conosco's job. | 2026-03-04 |
| 25 | `organizingClubs` (hasMany) not singular `organizingClub` | Real colleges have collaborative events (IEEE + Coding Club hackathon). hasMany handles 1-to-N correctly. | 2026-03-04 |
| 26 | `createdByClub` as event owner (Option B) | Prevents edit conflicts in collaborative events. Only the creating club's admin can edit. Co-organizers get visibility, not control. | 2026-03-04 |
| 27 | NOT `organizingEntities` (rejected genericization) | Premature abstraction. Departments = select field (already exists). External sponsors = display-only (SponsorsBlock). No need for a polymorphic entity relationship. YAGNI. | 2026-03-04 |
| 28 | Multi-tenant is v3, NOT v2 | You have ONE customer (GCET). Adding `instituteId` to every document, every query, every access control now = pure overhead. Build it when college #2 actively wants to onboard. | 2026-03-04 |
| 29 | Shared DB + `instituteId` (not separate DBs) for v3 | Simpler, cheaper, sufficient for < 50 colleges. Upgrade to separate DBs only if enterprise compliance demands it. | 2026-03-04 |
| 30 | Custom domains via CNAME, not forcing conosco.in | No serious college wants `gcet.conosco.in` as their public URL. They want `blog.gcet.edu.in`. CNAME mapping makes your brand invisible = premium SaaS positioning. | 2026-03-04 |
| 31 | Cloud-only, managed by you, no on-prem | On-prem = support nightmare for a solo dev. Cloud-only = you control updates, uptime, data. Standard SaaS model. | 2026-03-04 |
| 32 | Deep Conosco integration is v2 display work, NOT v3 | The API already exposes achievements, NAAC criteria, certificates, stats. The provider is already built. These are display components that showcase the platform's unique value vs WordPress. Multi-tenant infra (instituteId, hostname routing) remains v3. But what makes this platform special ships now. | 2026-03-04 |
| 33 | Certificate verification is in-app (`/verify/[code]`), not external redirect | Branded verification page with trust seal > external link to Conosco URL. Participants share the link, it shows institution branding. SEO value, trust value, showcase value. | 2026-03-04 |
| 34 | NAAC evidence page auto-generated from Conosco data | NO generic CMS can do this. Events tagged with NAAC criteria in Conosco → public evidence page grouped by criterion with completion stats. This is what you sell to principals during accreditation season. | 2026-03-04 |
| 35 | Campus stats dashboard uses cached Conosco API (zero new API work) | `getCachedEventStats()` + `getCachedClubStats()` already exist in `cached.ts`. The public `/campus` page just renders them. All plumbing is v1. Display is v2. | 2026-03-04 |
| 36 | Conosco ERP already does multi-tenant with `institutionCode` in API URL path | `ConoscoProvider` already takes `institutionCode` and scopes all requests as `${baseUrl}/${institutionCode}${path}`. The CMS doesn't need its own `instituteId` for deep integration — it just needs to DISPLAY the rich data Conosco already exposes. Multi-tenant CMS layer is separate (v3). | 2026-03-04 |
| 37 | **Added `institution_admin` role tier** (implementation enhancement) | Original design had only `superadmin` + assignable roles. In practice, colleges need a "college principal / IT head" role that controls everything within ONE institution but can't manage other institutions or the platform. This maps cleanly to v3's "College SuperAdmin" concept. Bypasses all permission checks within their institution via `isOwnInstitutionAdmin()` in `hasPermission.ts`. Only superadmin can assign this role. | 2026-03-04 |
| 38 | **Route split: `/platform` vs `/user`** (implementation enhancement) | Original design didn't specify separate route groups. In practice, superadmin managing the platform (institutions, global config) vs institution users managing content are completely different UX flows. Separating them prevents confusion and enables clean permission gating. `/platform/*` = superadmin only, `/user/*` = institution role holders. | 2026-03-04 |
| 39 | **`scopeId` fallback to user's `institution` field** (bug fix) | When `institution_admin` is assigned, `scopeId` is often not populated. `isInstitutionAdmin()` now falls back to comparing the user's `institution` field against the requested `institutionId` when `scopeId` is missing. Prevents institution_admin from being locked out of permission checks. | 2026-03-04 |

---

## Summary Timeline

| Week | Phase | Outcome | Status |
|---|---|---|---|
| Week 1 | RBAC Core | New role system live, migration complete | ✅ **DONE** |
| Week 2-3 | Club Scoping + Sub-Pages + Landing Pages | Club admins see only their club, section-based landing pages | ⬜ Next |
| Week 3 | Gallery + Auto-Sync | Albums, automated Conosco sync | ⬜ |
| Week 3-4 | **Deep Conosco Integration** | Campus stats, NAAC evidence, certificate verification, achievement display | ⬜ |
| Week 4 | Announcements + Search/RSS + Polish | Full platform, tested, search extended, RSS live | ⬜ |

**Total estimated effort**: ~4.5 weeks of focused work

**After v2**: You have a scoped, multi-club content platform where:
- Each club head manages their own space
- Events auto-sync from Conosco
- The superadmin controls everything
- **Campus stats dashboard, NAAC evidence, certificate verification are LIVE** — showcasing what makes this NOT WordPress
- Visitors to conosco.in see institutional vibrancy powered by real operational data

---

## v3 Horizon: Multi-Tenant Architecture (When College #2 Signs Up)

> **Trigger**: Do NOT build this until a second college actively wants to onboard.
> This section documents the path so the architecture is ready when needed.
>
> **Important distinction**: v3 is ONLY about multi-tenant infrastructure (instituteId on documents,
> hostname routing, tenant isolation). All Conosco integration depth — stats, NAAC, certificates,
> achievements — is v2. The platform is deeply integrated with Conosco before multi-tenancy.

### Deployment Model

```
Cloud-only. Managed by you. No on-prem.

One Next.js app (Vercel) serves ALL colleges.
One MongoDB database with instituteId on every document.
Custom domains via CNAME mapping.

blog.gcet.edu.in  →  your Vercel app  →  instituteId = 'GCET'
blog.mgit.edu.in  →  your Vercel app  →  instituteId = 'MGIT'
ieee.gcet.edu.in  →  your Vercel app  →  instituteId = 'GCET', clubScope = 'ieee'
```

### Domain Strategy

| Tier | Domain | For |
|---|---|---|
| Default (pilot/demo) | `gcet.sites.conosco.in` | Quick start, testing |
| Professional (what colleges want) | `blog.gcet.edu.in`, `ieee.gcet.edu.in` | Production — college's own domain |

College IT adds CNAME → your platform. SSL auto-managed via Vercel. College brand visible, your brand invisible (or footer only).

### Schema Changes (v3)

Add to ALL collections:
```typescript
{
  name: 'instituteId',
  type: 'text',
  required: true,
  index: true,
  admin: { readOnly: true },
  // Auto-set from authenticated user's institute
}
```

New collection:
```typescript
// Institutes collection
{
  slug: 'institutes',
  fields: [
    { name: 'name', type: 'text' },          // "GCET"
    { name: 'code', type: 'text' },           // "GCET" (unique)
    { name: 'domains', type: 'array', fields: [
      { name: 'hostname', type: 'text' },     // "blog.gcet.edu.in"
      { name: 'purpose', type: 'select', options: ['main', 'club', 'department'] },
      { name: 'scopeId', type: 'text' },      // optional: specific club/dept
    ]},
    { name: 'theme', type: 'group', fields: [...] },  // Institute-level theming
    { name: 'conoscoApiUrl', type: 'text' },  // Per-institute Conosco endpoint
    { name: 'status', type: 'select', options: ['active', 'trial', 'suspended'] },
  ],
}
```

### Tenant Resolution Middleware

```typescript
// middleware.ts addition for v3
const hostname = request.headers.get('host')
const institute = await resolveInstitute(hostname)
// Attach to request context → all queries add { instituteId: institute.code }
```

### Role Hierarchy (v3)

```
Platform SuperAdmin (you)
  └── Creates institutes, assigns College SuperAdmins
  └── System-wide visibility, billing, license control
  └── Cannot be deleted
      │
      ├── College SuperAdmin (principal / IT head)
      │     └── Everything within their institute
      │     └── Assigns club_admins, blog_editors, etc.
      │     └── Cannot see other colleges' data
      │         │
      │         ├── club_admin (scoped to club + institute)
      │         ├── blog_editor (scoped to institute)
      │         ├── blog_author (scoped to institute)
      │         ├── event_manager (scoped to institute)
      │         └── moderator (scoped to institute)
      │
      └── (Another college — same tree, fully isolated)
```

In v2: Platform SuperAdmin = College SuperAdmin = you. One person, one institute.
In v3: They split. You become platform-level. Each college gets their own superadmin.

### Data Isolation

**Shared DB, shared collections, `instituteId` filter** (not separate DBs per college).

- Correct for early stage (< 50 colleges)
- Lower cost, simpler deployment
- Every Payload access control function adds `instituteId` to WHERE clauses
- If enterprise compliance requires full isolation later: upgrade to separate DBs per tenant

### Estimated Effort

~2 weeks on top of a working v2:
- Add `instituteId` to all collections: 1 day
- Tenant resolution middleware: 1 day
- Institutes collection + onboarding flow: 2 days
- Scope all access controls by institute: 2 days
- Custom domain mapping + SSL: 1 day
- Platform SuperAdmin dashboard: 2 days
- Testing + migration: 2 days

### Business Model

```
Tier 1 (Pilot):     Subdomain only, no custom domain, limited features
Tier 2 (Standard):  Custom domain, full CMS, events, clubs
Tier 3 (Premium):   Custom domain + Conosco ERP integration, analytics, compliance
```

Domain is just branding. You sell infrastructure + CMS + ERP + Events + Compliance.

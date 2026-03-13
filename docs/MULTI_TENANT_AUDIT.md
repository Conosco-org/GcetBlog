# Multi-Tenant System Audit & Solutions

## Executive Summary

This document identifies **critical issues** in the current multi-tenant implementation and provides **industry-grade solutions** for each problem.

**Severity Levels:**
- 🔴 **CRITICAL** - Security/data leak risk, must fix immediately
- 🟠 **HIGH** - Major UX/functionality issue, fix soon
- 🟡 **MEDIUM** - Moderate impact, should fix
- 🟢 **LOW** - Minor issue, nice to have

---

## 🔴 CRITICAL ISSUES

### 1. No Institution Assignment on Registration

**Problem:**
Users can register but are NOT automatically assigned to an institution. They end up with accounts that can't access any content.

**Current Code:**
```typescript
// src/app/(auth)/register/actions.ts
const user = await payload.create({
  collection: 'users',
  data: {
    name,
    email,
    password,
    role: 'user',
    bio,
    // ❌ institution field is MISSING!
  },
})
```

**Impact:**
- Users register successfully but see no content
- Confusing onboarding experience
- Support tickets from confused users
- Institution admins can't find their users

**Industry Solution:**
Auto-assign institution based on the subdomain where user registered.


**Implementation:**
```typescript
// src/app/(auth)/register/actions.ts
'use server'

import { headers } from 'next/headers'
import { getTenantFromHeaders } from '@/utilities/tenantResolver'

export async function registerAction(formData: FormData) {
  const payload = await getPayload({ config })
  
  // Get institution from current subdomain
  const tenant = getTenantFromHeaders(headers)
  
  if (!tenant) {
    return { error: 'Unable to determine institution. Please contact support.' }
  }

  const user = await payload.create({
    collection: 'users',
    data: {
      name,
      email,
      password,
      role: 'user',
      bio,
      institution: tenant.institutionId,  // ✅ Auto-assign
    },
  })
}
```

---

### 2. Cross-Institution Login (No Validation)

**Problem:**
Users from Institution A can login on Institution B's subdomain. Login succeeds but they see no content (confusing).

**Current Code:**
```typescript
// src/app/(auth)/login/actions.ts
// ❌ No check if user belongs to current institution
const result = await payload.login({
  collection: 'users',
  data: { email, password },
})
// Login succeeds regardless of institution match
```

**Impact:**
- User logs in on wrong subdomain
- Sees empty dashboard (no content)
- Thinks platform is broken
- Poor user experience

**Industry Solution:**
Validate user's institution matches current subdomain during login.


**Implementation:**
```typescript
// src/app/(auth)/login/actions.ts
'use server'

import { headers } from 'next/headers'
import { getTenantFromHeaders } from '@/utilities/tenantResolver'

export async function loginAction(formData: FormData) {
  const payload = await getPayload({ config })
  const tenant = getTenantFromHeaders(headers)
  
  if (!tenant) {
    return { error: 'Unable to determine institution.' }
  }

  const result = await payload.login({
    collection: 'users',
    data: { email, password },
  })

  if (result.token && result.user) {
    const user = result.user as { 
      role?: string
      institution?: string | { id: string }
    }

    // ✅ SuperAdmin can login anywhere
    if (user.role === 'superadmin') {
      // Set cookie and proceed
      return { success: true, redirectPath: '/platform' }
    }

    // ✅ Check institution match
    const userInstId = typeof user.institution === 'object' 
      ? user.institution?.id 
      : user.institution

    if (userInstId !== tenant.institutionId) {
      // Fetch user's institution for helpful error
      const userInst = await payload.findByID({
        collection: 'institutions',
        id: userInstId,
      })

      // Find user's correct subdomain
      const userDomain = userInst.domains?.[0]?.hostname || 
                        `${userInst.code}.sites.conosco.in`

      return { 
        error: `This account belongs to ${userInst.name}. Please login at ${userDomain}` 
      }
    }

    // ✅ User belongs to this institution - proceed
    // Set cookie and redirect...
  }
}
```

---

### 3. Hardcoded Institution References

**Problem:**
The codebase has "GCET" and "Geethanjali" hardcoded in 50+ places, making it NOT truly multi-tenant.

**Locations:**
- Page titles: "Sign in to Geethanjali Blog"
- Metadata: `title: 'GCET Blog'`
- Footer: "Built for the GCET community"
- Newsletter: "Get new articles from GCET"
- Descriptions: "Official blog platform for Geethanjali College"
- Logos: `/gcet-logo.png`
- Favicons: `/gcet-logo.png`

**Impact:**
- MIT users see "GCET Blog" everywhere
- Unprofessional for white-label SaaS
- Breaks multi-tenant illusion
- Requires code changes for each institution

**Industry Solution:**
Dynamic content based on current institution.


**Implementation:**

**A. Dynamic Metadata**
```typescript
// src/app/(frontend)/layout.tsx
export async function generateMetadata(): Promise<Metadata> {
  const tenant = await getCurrentTenantFull()
  
  const institutionName = tenant?.shortName || tenant?.name || 'Blog'
  const tagline = tenant?.branding?.tagline || 'Official blog platform'
  
  return {
    title: {
      default: `${institutionName} Blog`,
      template: `%s | ${institutionName} Blog`,
    },
    description: `${tagline} for ${tenant?.name || 'our institution'}`,
    icons: {
      icon: tenant?.branding?.favicon?.url || '/favicon.ico',
      apple: tenant?.branding?.favicon?.url || '/favicon.ico',
    },
  }
}
```

**B. Dynamic Login Page**
```typescript
// src/app/(auth)/login/page.tsx
export default async function LoginPage() {
  const tenant = await getCurrentTenantFull()
  const institutionName = tenant?.shortName || tenant?.name || 'Blog'
  
  return (
    <div>
      <h2>Sign in to {institutionName}</h2>
      <p>Access your {institutionName} dashboard</p>
    </div>
  )
}
```

**C. Dynamic Footer**
```typescript
// src/Footer/Component.tsx
export async function Footer() {
  const tenant = await getCurrentTenantFull()
  const institutionName = tenant?.shortName || tenant?.name || 'our institution'
  const year = new Date().getFullYear()
  
  return (
    <footer>
      <p>© {year} {tenant?.name}. All rights reserved.</p>
      <p>Built for the {institutionName} community</p>
    </footer>
  )
}
```

**D. Dynamic Newsletter**
```typescript
// Newsletter signup component
const institutionName = tenant?.shortName || 'our institution'
<p>Get new articles from {institutionName} directly in your inbox.</p>
```

---

### 4. Global Header/Footer (Not Institution-Specific)

**Problem:**
Header and Footer are Payload "Globals" (singletons). All institutions share the SAME navigation.

**Current Structure:**
```
Payload Globals:
├── Header (one for all institutions)
└── Footer (one for all institutions)
```

**Impact:**
- MIT can't have different navigation than GCET
- All institutions forced to use same menu structure
- Can't customize per-institution branding
- Not truly multi-tenant

**Industry Solution:**
Store navigation in Institutions collection, fall back to global.


**Implementation:**

**Good News:** Already partially implemented in Institutions collection!

```typescript
// src/collections/Institutions/index.ts
{
  name: 'headerNavItems',
  type: 'array',
  admin: {
    description: 'Navigation items for this institution. Falls back to global Header if empty.',
  },
  fields: [
    { name: 'label', type: 'text', required: true },
    { name: 'url', type: 'text', required: true },
    { name: 'newTab', type: 'checkbox', defaultValue: false },
  ],
},
{
  name: 'footerNavItems',
  type: 'array',
  // Similar structure
},
{
  name: 'footerText',
  type: 'textarea',
  admin: {
    description: 'Custom footer text (copyright, disclaimer, etc.)',
  },
},
```

**Fix Needed:** Header/Footer components don't USE this data yet!

```typescript
// src/Header/Component.tsx - CURRENT (wrong)
export async function Header() {
  const headerData: Header = await getCachedGlobal('header', 1)()  // ❌ Global only
  // ...
}

// src/Header/Component.tsx - FIXED
export async function Header() {
  const tenant = await getCurrentTenantFull()
  
  // Try institution-specific nav first
  let navItems = tenant?.headerNavItems || []
  
  // Fall back to global if institution has no custom nav
  if (navItems.length === 0) {
    const headerData: Header = await getCachedGlobal('header', 1)()
    navItems = headerData.navItems || []
  }
  
  return <HeaderClient navItems={navItems} tenant={tenant} />
}
```

---

## 🟠 HIGH PRIORITY ISSUES

### 5. Categories Not Scoped in Header

**Problem:**
Header fetches ALL categories from database without institution filter.

**Current Code:**
```typescript
// src/Header/Component.tsx
const result = await payload.find({
  collection: 'categories',
  limit: 20,
  sort: 'title',
  // ❌ No institution filter!
})
```

**Impact:**
- MIT users see GCET's categories in search dropdown
- Cross-institution data leak
- Confusing user experience
- Security concern

**Industry Solution:**
Filter categories by current institution.

**Implementation:**
```typescript
// src/Header/Component.tsx
export async function Header() {
  const tenant = await getCurrentTenant()
  const payload = await getPayload({ config: configPromise })
  
  let categories: Array<{ id: string; title: string; slug: string }> = []
  
  if (tenant) {
    const result = await payload.find({
      collection: 'categories',
      where: {
        institution: { equals: tenant.institutionId },  // ✅ Scoped
      },
      limit: 20,
      sort: 'title',
      select: { title: true, slug: true },
    })
    categories = result.docs.map((doc) => ({
      id: String(doc.id),
      title: doc.title || '',
      slug: doc.slug || '',
    }))
  }
  
  return <HeaderClient categories={categories} />
}
```

---

### 6. SEO Metadata Not Institution-Specific

**Problem:**
All pages have hardcoded SEO metadata referencing GCET.

**Current Code:**
```typescript
// src/app/(frontend)/posts/[slug]/page.tsx
<p>Get new articles from GCET directly in your inbox.</p>

// Canonical URL
alternates: {
  canonical: `${serverUrl}/content/${slug}`,  // ❌ Same for all institutions
}
```

**Impact:**
- MIT posts have GCET in meta descriptions
- SEO confusion (Google sees duplicate content)
- Wrong canonical URLs
- Poor search rankings

**Industry Solution:**
Dynamic SEO based on institution and subdomain.


**Implementation:**
```typescript
// src/app/(frontend)/posts/[slug]/page.tsx
export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug = '' } = await params
  const post = await queryPostBySlug({ slug })
  const tenant = await getCurrentTenantFull()
  
  // Get current hostname for canonical URL
  const hdrs = await headers()
  const hostname = hdrs.get('host') || 'localhost'
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
  
  const meta = await generateMeta({ doc: post })
  
  return {
    ...meta,
    // ✅ Institution-specific canonical URL
    alternates: {
      canonical: `${protocol}://${hostname}/posts/${slug}`,
    },
    // ✅ Institution-specific OG tags
    openGraph: {
      ...meta.openGraph,
      siteName: `${tenant?.name || 'Blog'}`,
    },
  }
}

// Newsletter text
const institutionName = tenant?.shortName || 'us'
<p>Get new articles from {institutionName} directly in your inbox.</p>
```

---

### 7. Media Uploads Not Fully Isolated

**Problem:**
Media collection uses `optionalInstitutionField` instead of required `institutionField`.

**Current Code:**
```typescript
// src/collections/Media.ts
export const Media: CollectionConfig = {
  fields: [
    optionalInstitutionField,  // ❌ Optional!
    // ...
  ],
}
```

**Impact:**
- SuperAdmin uploads have no institution
- Media can leak across institutions
- Difficult to clean up institution data
- Orphaned media files

**Industry Solution:**
Make institution required for all media, except SuperAdmin uploads.

**Implementation:**
```typescript
// src/collections/Media.ts
import { institutionField } from '../fields/institution'

export const Media: CollectionConfig = {
  fields: [
    {
      ...institutionField,
      // Allow SuperAdmin to upload without institution (for platform assets)
      admin: {
        ...institutionField.admin,
        condition: (data, siblingData, { user }) => {
          // Hide field for SuperAdmin (auto-set in hook)
          return user?.role !== 'superadmin'
        },
      },
    },
    // ...
  ],
  hooks: {
    beforeChange: [
      ({ data, req }) => {
        // Auto-assign institution if not set
        if (!data.institution && req.user) {
          const user = req.user as { 
            role?: string
            institution?: string | { id: string }
          }
          
          // Regular users: use their institution
          if (user.role !== 'superadmin' && user.institution) {
            data.institution = typeof user.institution === 'object'
              ? user.institution.id
              : user.institution
          }
        }
        return data
      },
    ],
  },
}
```

---

### 8. Email Service Not Institution-Aware

**Problem:**
Email service uses global "from" address for all institutions.

**Current Code:**
```typescript
// .env
EMAIL_FROM=noreply@gcet.edu.in  // ❌ Hardcoded GCET

// All institutions send from gcet.edu.in
```

**Impact:**
- MIT sends emails from gcet.edu.in (unprofessional)
- Email deliverability issues (SPF/DKIM mismatch)
- Confusing for recipients
- Spam risk

**Industry Solution:**
Per-institution email configuration.


**Implementation:**

**A. Add Email Config to Institutions**
```typescript
// src/collections/Institutions/index.ts
{
  name: 'emailSettings',
  type: 'group',
  admin: {
    description: 'Email configuration for this institution',
  },
  fields: [
    {
      name: 'fromEmail',
      type: 'email',
      admin: {
        description: 'From address for emails (e.g., noreply@gcet.edu.in)',
        placeholder: 'noreply@institution.edu',
      },
    },
    {
      name: 'fromName',
      type: 'text',
      admin: {
        description: 'From name (e.g., "GCET Blog")',
        placeholder: 'Institution Blog',
      },
    },
    {
      name: 'replyTo',
      type: 'email',
      admin: {
        description: 'Reply-to address (optional)',
      },
    },
  ],
},
```

**B. Update Email Service**
```typescript
// src/services/email/index.ts
export async function sendInstitutionEmail(
  institutionId: string,
  message: EmailMessage,
): Promise<SendResult> {
  const payload = await getPayload({ config: configPromise })
  
  // Fetch institution email settings
  const institution = await payload.findByID({
    collection: 'institutions',
    id: institutionId,
  })
  
  const fromEmail = institution.emailSettings?.fromEmail || 
                   process.env.EMAIL_FROM || 
                   'noreply@example.com'
  
  const fromName = institution.emailSettings?.fromName || 
                  institution.shortName || 
                  institution.name
  
  const emailService = getEmailService()
  
  return emailService.send({
    ...message,
    from: {
      email: fromEmail,
      name: fromName,
    },
    replyTo: institution.emailSettings?.replyTo,
  })
}
```

---

## 🟡 MEDIUM PRIORITY ISSUES

### 9. No Institution Context in Admin Panel

**Problem:**
Payload admin panel doesn't show which institution you're managing.

**Impact:**
- SuperAdmin confused about which institution's data they're viewing
- No visual indicator of current context
- Easy to make mistakes (edit wrong institution's content)

**Industry Solution:**
Add institution indicator to admin panel header.

**Implementation:**
```typescript
// Custom admin component
// src/components/AdminUI/InstitutionIndicator.tsx
'use client'

export function InstitutionIndicator() {
  const { user } = useAuth()
  const [institution, setInstitution] = useState(null)
  
  useEffect(() => {
    if (user?.institution) {
      fetch(`/api/institutions/${user.institution}`)
        .then(res => res.json())
        .then(data => setInstitution(data))
    }
  }, [user])
  
  if (!institution) return null
  
  return (
    <div className="institution-badge">
      <span>Managing: {institution.name}</span>
    </div>
  )
}

// Add to payload.config.ts
admin: {
  components: {
    beforeNavLinks: ['@/components/AdminUI/InstitutionIndicator'],
  },
}
```

---

### 10. Scheduled Jobs Not Institution-Scoped

**Problem:**
Newsletter digest jobs run globally, not per-institution.

**Current Code:**
```typescript
// src/jobs/newsletter.ts
export const newsletterDailyDigest = async () => {
  // ❌ Fetches ALL posts from ALL institutions
  const posts = await payload.find({
    collection: 'posts',
    where: { _status: { equals: 'published' } },
  })
}
```

**Impact:**
- MIT subscribers get GCET posts in digest
- Cross-institution data leak
- Confusing newsletters
- Unsubscribe risk

**Industry Solution:**
Run jobs per-institution with proper scoping.


**Implementation:**
```typescript
// src/jobs/newsletter.ts
export const newsletterDailyDigest = async () => {
  const payload = await getPayload({ config: configPromise })
  
  // ✅ Get all active institutions
  const institutions = await payload.find({
    collection: 'institutions',
    where: {
      status: { not_equals: 'suspended' },
    },
  })
  
  // ✅ Run digest for each institution
  for (const institution of institutions.docs) {
    try {
      await sendInstitutionDigest(institution.id, 'daily')
    } catch (error) {
      console.error(`Failed to send digest for ${institution.name}:`, error)
    }
  }
}

async function sendInstitutionDigest(
  institutionId: string,
  frequency: 'daily' | 'weekly' | 'monthly',
) {
  const payload = await getPayload({ config: configPromise })
  
  // ✅ Fetch posts for THIS institution only
  const posts = await payload.find({
    collection: 'posts',
    where: {
      and: [
        { institution: { equals: institutionId } },
        { _status: { equals: 'published' } },
        // Date range based on frequency...
      ],
    },
  })
  
  // ✅ Fetch subscribers for THIS institution only
  const subscribers = await payload.find({
    collection: 'newsletter-subscribers',
    where: {
      and: [
        { institution: { equals: institutionId } },
        { status: { equals: 'active' } },
        { frequency: { equals: frequency } },
      ],
    },
  })
  
  // Send emails using institution's email settings
  for (const subscriber of subscribers.docs) {
    await sendInstitutionEmail(institutionId, {
      to: subscriber.email,
      subject: `Your ${frequency} digest`,
      html: renderDigestEmail(posts.docs, institution),
    })
  }
}
```

---

### 11. Search Not Institution-Scoped

**Problem:**
Global search plugin searches across ALL institutions.

**Current Code:**
```typescript
// Search plugin configuration
searchPlugin({
  collections: ['posts', 'pages'],
  // ❌ No institution filter
})
```

**Impact:**
- MIT users see GCET posts in search results
- Cross-institution data leak
- Confusing search experience

**Industry Solution:**
Add institution filter to search queries.

**Implementation:**
```typescript
// src/search/beforeSync.ts
export const beforeSync: BeforeSyncWithSearch = async ({ originalDoc, searchDoc, req }) => {
  const { payload } = req
  
  // ✅ Add institution to search document
  if (originalDoc.institution) {
    searchDoc.institution = typeof originalDoc.institution === 'object'
      ? originalDoc.institution.id
      : originalDoc.institution
  }
  
  return searchDoc
}

// Search query with institution filter
const results = await payload.find({
  collection: 'search',
  where: {
    and: [
      { institution: { equals: currentInstitutionId } },  // ✅ Scoped
      { title: { contains: searchQuery } },
    ],
  },
})
```

---

### 12. No Institution Switching for SuperAdmin

**Problem:**
SuperAdmin can't easily switch between institutions in admin panel.

**Impact:**
- SuperAdmin must logout and login on different subdomain
- Inefficient workflow
- Can't manage multiple institutions easily

**Industry Solution:**
Add institution switcher for SuperAdmin.

**Implementation:**
```typescript
// src/components/AdminUI/InstitutionSwitcher.tsx
'use client'

export function InstitutionSwitcher() {
  const { user } = useAuth()
  const [institutions, setInstitutions] = useState([])
  const [current, setCurrent] = useState(null)
  
  if (user?.role !== 'superadmin') return null
  
  useEffect(() => {
    fetch('/api/institutions')
      .then(res => res.json())
      .then(data => setInstitutions(data.docs))
  }, [])
  
  const switchInstitution = (instId: string) => {
    // Set session context
    fetch('/api/admin/switch-institution', {
      method: 'POST',
      body: JSON.stringify({ institutionId: instId }),
    }).then(() => {
      window.location.reload()
    })
  }
  
  return (
    <select onChange={(e) => switchInstitution(e.target.value)}>
      <option value="">All Institutions</option>
      {institutions.map(inst => (
        <option key={inst.id} value={inst.id}>
          {inst.name}
        </option>
      ))}
    </select>
  )
}
```

---

## 🟢 LOW PRIORITY ISSUES

### 13. No Institution Usage Analytics

**Problem:**
No dashboard showing per-institution metrics (posts, users, storage, etc.).

**Industry Solution:**
Add institution analytics dashboard.

**Implementation:**
```typescript
// src/app/platform/institutions/[id]/analytics/page.tsx
export default async function InstitutionAnalytics({ params }) {
  const { id } = await params
  const payload = await getPayload({ config: configPromise })
  
  const [posts, users, media, pageViews] = await Promise.all([
    payload.count({
      collection: 'posts',
      where: { institution: { equals: id } },
    }),
    payload.count({
      collection: 'users',
      where: { institution: { equals: id } },
    }),
    payload.count({
      collection: 'media',
      where: { institution: { equals: id } },
    }),
    payload.count({
      collection: 'page-views',
      where: { institution: { equals: id } },
    }),
  ])
  
  return (
    <div>
      <h1>Institution Analytics</h1>
      <div className="stats">
        <div>Posts: {posts.totalDocs}</div>
        <div>Users: {users.totalDocs}</div>
        <div>Media: {media.totalDocs}</div>
        <div>Page Views: {pageViews.totalDocs}</div>
      </div>
    </div>
  )
}
```

---

### 14. No Bulk Institution Operations

**Problem:**
SuperAdmin can't perform bulk operations (suspend all, export data, etc.).

**Industry Solution:**
Add bulk action buttons in platform dashboard.

---

### 15. No Institution Onboarding Flow

**Problem:**
When SuperAdmin creates new institution, no guided setup wizard.

**Industry Solution:**
Add onboarding checklist:
- [ ] Set up custom domain
- [ ] Configure branding
- [ ] Create first admin user
- [ ] Import initial content
- [ ] Test email delivery


---

## Implementation Priority

### Phase 1: Critical Fixes (Week 1)
1. ✅ Auto-assign institution on registration
2. ✅ Validate institution on login
3. ✅ Dynamic metadata (remove GCET hardcoding)
4. ✅ Institution-specific Header/Footer

### Phase 2: High Priority (Week 2)
5. ✅ Scope categories in Header
6. ✅ Dynamic SEO metadata
7. ✅ Fix media institution field
8. ✅ Per-institution email configuration

### Phase 3: Medium Priority (Week 3-4)
9. ✅ Admin panel institution indicator
10. ✅ Institution-scoped scheduled jobs
11. ✅ Institution-scoped search
12. ✅ SuperAdmin institution switcher

### Phase 4: Nice to Have (Future)
13. ✅ Institution analytics dashboard
14. ✅ Bulk operations
15. ✅ Onboarding wizard

---

## Testing Checklist

After implementing fixes, test:

### Registration Flow
- [ ] Register on hub.gcet.edu.in → user.institution = GCET
- [ ] Register on hub.mit.edu.in → user.institution = MIT
- [ ] User can see content after registration

### Login Flow
- [ ] GCET user can login on hub.gcet.edu.in ✓
- [ ] GCET user CANNOT login on hub.mit.edu.in ✗
- [ ] Error message shows correct subdomain
- [ ] SuperAdmin can login anywhere ✓

### Content Isolation
- [ ] GCET user sees only GCET posts
- [ ] MIT user sees only MIT posts
- [ ] Categories filtered by institution
- [ ] Media filtered by institution
- [ ] Search results filtered by institution

### Branding
- [ ] Page title shows institution name
- [ ] Logo shows institution logo
- [ ] Colors match institution branding
- [ ] Footer shows institution name
- [ ] Newsletter mentions institution name

### Email
- [ ] Emails sent from institution's domain
- [ ] Email signature has institution name
- [ ] Newsletter digest has institution posts only

### Admin Panel
- [ ] Institution indicator visible
- [ ] SuperAdmin can switch institutions
- [ ] Content filtered by selected institution

---

## Security Considerations

### Data Isolation
- ✅ All queries MUST include institution filter
- ✅ Use `tenantFind()` helpers, not raw `payload.find()`
- ✅ Validate institution ownership before updates/deletes
- ✅ Test for cross-institution data leaks

### Access Control
- ✅ Users can only access their institution's data
- ✅ SuperAdmin can access all institutions
- ✅ Institution admins can only manage their institution
- ✅ API endpoints validate institution context

### Session Management
- ✅ Tokens don't leak institution data
- ✅ Session tied to institution
- ✅ Logout clears all institution context

---

## Performance Considerations

### Caching
- ✅ Cache tenant resolution (5 min TTL)
- ✅ Cache institution data per subdomain
- ✅ Invalidate cache on institution updates

### Database Indexes
```javascript
// Add indexes for institution field
{
  collection: 'posts',
  indexes: [
    { fields: { institution: 1, _status: 1, publishedAt: -1 } },
  ],
}

{
  collection: 'users',
  indexes: [
    { fields: { institution: 1, email: 1 } },
  ],
}

{
  collection: 'categories',
  indexes: [
    { fields: { institution: 1, slug: 1 } },
  ],
}
```

### Query Optimization
- ✅ Always include institution in where clause
- ✅ Use compound indexes (institution + other fields)
- ✅ Limit query results appropriately
- ✅ Use pagination for large datasets

---

## Migration Plan

### Step 1: Backup
```bash
mongodump --uri="mongodb://..." --out=backup-$(date +%Y%m%d)
```

### Step 2: Run Migration Script
```typescript
// scripts/fix-multi-tenant.ts
import { getPayload } from 'payload'
import configPromise from '@payload-config'

async function fixMultiTenant() {
  const payload = await getPayload({ config: configPromise })
  
  // 1. Find default institution
  const defaultInst = await payload.find({
    collection: 'institutions',
    where: { code: { equals: 'gcet' } },
    limit: 1,
  })
  
  if (defaultInst.docs.length === 0) {
    throw new Error('Default institution not found')
  }
  
  const defaultInstId = defaultInst.docs[0].id
  
  // 2. Assign institution to users without one
  const usersWithoutInst = await payload.find({
    collection: 'users',
    where: { institution: { exists: false } },
  })
  
  for (const user of usersWithoutInst.docs) {
    await payload.update({
      collection: 'users',
      id: user.id,
      data: { institution: defaultInstId },
    })
  }
  
  console.log(`Fixed ${usersWithoutInst.docs.length} users`)
  
  // 3. Assign institution to media without one
  const mediaWithoutInst = await payload.find({
    collection: 'media',
    where: { institution: { exists: false } },
  })
  
  for (const media of mediaWithoutInst.docs) {
    await payload.update({
      collection: 'media',
      id: media.id,
      data: { institution: defaultInstId },
    })
  }
  
  console.log(`Fixed ${mediaWithoutInst.docs.length} media items`)
}

fixMultiTenant().then(() => {
  console.log('Migration complete')
  process.exit(0)
})
```

### Step 3: Deploy Code Changes
```bash
git add .
git commit -m "fix: implement proper multi-tenant isolation"
git push origin main
```

### Step 4: Verify
- Test all flows in checklist above
- Monitor error logs for 24 hours
- Check for cross-institution data leaks

---

## Conclusion

The current codebase has a **good foundation** for multi-tenancy but needs **critical fixes** to be production-ready for multiple institutions.

**Key Takeaways:**
1. 🔴 Fix registration/login institution assignment ASAP
2. 🔴 Remove all hardcoded "GCET" references
3. 🟠 Implement per-institution Header/Footer
4. 🟠 Scope all queries by institution
5. 🟡 Add SuperAdmin tools for managing institutions

**Estimated Effort:**
- Phase 1 (Critical): 3-5 days
- Phase 2 (High): 5-7 days
- Phase 3 (Medium): 7-10 days
- Phase 4 (Nice to have): 5-7 days

**Total: 3-4 weeks for complete multi-tenant implementation**

---

## Resources

- [Multi-Tenant Authentication Guide](./multi-tenant-authentication.md)
- [Subdomain Configuration Guide](./subdomain-configuration.md)
- [Tenant Query Utilities](../src/utilities/tenantQuery.ts)
- [Tenant Resolver](../src/utilities/tenantResolver.ts)

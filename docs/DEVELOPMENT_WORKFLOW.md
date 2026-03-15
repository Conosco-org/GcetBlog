# Development Workflow Guide

Complete guide to running and accessing the GCET Blog multi-tenant platform in development.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Understanding the Multi-Tenant System](#understanding-the-multi-tenant-system)
3. [Development Workflow](#development-workflow)
4. [Accessing Different Institutions](#accessing-different-institutions)
5. [User Roles & Access](#user-roles--access)
6. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Prerequisites

- Node.js >= 20.9.0
- pnpm >= 10.0.0
- MongoDB running locally or connection string

### Initial Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Copy environment variables
cp .env.example .env

# 3. Edit .env and set your MongoDB connection
# DATABASE_URI=mongodb://127.0.0.1/gcet-blog
# PAYLOAD_SECRET=your-secret-here
# NEXT_PUBLIC_SERVER_URL=http://localhost:3000

# 4. Seed the database with sample data
pnpm run seed

# 5. Start development server
pnpm run dev
```

The app will start at **http://localhost:3000**

---

## Understanding the Multi-Tenant System

### What is Multi-Tenancy?

This platform allows multiple educational institutions (colleges) to run their own blog sites on the same codebase. Each institution's data is completely isolated.

### How Hostname Resolution Works

The system uses **hostname-based tenant resolution**:

```
Hostname                    → Institution    → Purpose
─────────────────────────────────────────────────────────────
localhost:3000              → GCET (default) → Main site
gcet.sites.conosco.in       → GCET           → Main site (pilot)
blog.gcet.edu.in            → GCET           → Blog only
ieee.gcet.edu.in            → GCET           → Club site (IEEE)
mit.sites.conosco.in        → MIT            → Main site (pilot)
blog.mit.edu.in             → MIT            → Blog only
```

### Resolution Strategy

The middleware resolves hostnames in this order:

1. **Custom Domain Match**: Checks `institutions.domains[]` array for exact hostname
2. **Pilot Subdomain**: Checks `{code}.sites.conosco.in` pattern
3. **Localhost Fallback**: Uses `DEFAULT_INSTITUTION_CODE` env var or first active institution

---

## Development Workflow

### What Happens When You Run `npm run dev`

```bash
pnpm run dev
# or
npm run dev
```

#### Step-by-Step Process:

1. **Next.js Server Starts**
   - Reads `next.config.js` configuration
   - Loads environment variables from `.env`
   - Initializes Payload CMS with MongoDB connection
   - Starts on port 3000 (default)

2. **Middleware Initialization** (`src/middleware.ts`)
   - Runs on EVERY request before reaching your pages
   - Extracts hostname from request headers
   - Calls `/api/resolve-tenant?hostname=...` to resolve institution

3. **Tenant Resolution** (`src/utilities/tenantResolver.ts`)
   - Queries MongoDB `institutions` collection
   - Matches hostname against:
     - `domains[].hostname` field (custom domains)
     - `{code}.sites.conosco.in` pattern (pilot tier)
     - Default institution (localhost)
   - Returns institution ID, code, status, tier, purpose

4. **Header Injection**
   - Middleware sets custom headers on the response:
     - `x-tenant-id`: Institution MongoDB ID
     - `x-tenant-code`: Institution code (e.g., "gcet")
     - `x-tenant-purpose`: Domain purpose (main/blog/club)
     - `x-tenant-club-scope`: Club slug (if club domain)

5. **Server Components Read Headers**
   - All server components can access tenant info via `headers()`
   - Database queries automatically filter by institution
   - Content is scoped to the current institution

6. **Page Renders**
   - Dynamic institution name in title/metadata
   - Institution-specific posts, events, clubs
   - Custom branding (colors, logo, favicon)

---

## Accessing Different Institutions

### Method 1: Localhost (Development Default)

When you access `http://localhost:3000`, the system uses the **default institution** configured in your environment:

```env
# .env
DEFAULT_INSTITUTION_CODE=gcet
```

This resolves to the GCET institution seeded by `pnpm run seed`.

**What you see:**
- GCET branding and content
- Posts from GCET authors
- GCET events and clubs

---

### Method 2: Pilot Subdomain (Managed Hosting)

Each institution gets a free subdomain: `{code}.sites.conosco.in`

**Example:** `gcet.sites.conosco.in`

**To test locally**, you need to modify your hosts file:

#### Windows:
```
C:\Windows\System32\drivers\etc\hosts
```

Add:
```
127.0.0.1  gcet.sites.conosco.in
127.0.0.1  mit.sites.conosco.in
```

#### Mac/Linux:
```
/etc/hosts
```

Add:
```
127.0.0.1  gcet.sites.conosco.in
127.0.0.1  mit.sites.conosco.in
```

Then access: `http://gcet.sites.conosco.in:3000`

---

### Method 3: Custom Domain (Production)

Institutions can map their own domains (e.g., `blog.gcet.edu.in`).

#### How It Works:

1. **College IT Team** adds DNS CNAME record:
   ```
   blog.gcet.edu.in  →  cname.vercel-dns.com
   ```

2. **SuperAdmin** adds domain in Payload:
   - Go to `/platform/institutions`
   - Edit GCET institution
   - Add domain entry:
     - Hostname: `blog.gcet.edu.in`
     - Purpose: `blog`
     - Verified: ✓ (after DNS propagates)

3. **Middleware** resolves `blog.gcet.edu.in` → GCET institution

4. **Content Filtering** applies based on purpose:
   - `main`: All content (posts, events, clubs, pages)
   - `blog`: Posts only
   - `club`: Posts from specific club only
   - `department`: Department-specific content

#### Testing Custom Domains Locally:

Edit your hosts file:

```
127.0.0.1  blog.gcet.edu.in
127.0.0.1  ieee.gcet.edu.in
```

Access: `http://blog.gcet.edu.in:3000`

---

### Method 4: Multiple Institutions

To test multiple institutions, you need to seed more institutions:

```typescript
// scripts/seed-database.ts (add after GCET)

const mit = await payload.create({
  collection: 'institutions',
  data: {
    name: 'MIT College of Engineering',
    code: 'mit',
    shortName: 'MIT',
    status: 'active',
    tier: 'standard',
    domains: [
      {
        hostname: 'blog.mit.edu.in',
        purpose: 'blog',
        verified: false,
      },
    ],
    contact: {
      email: 'info@mit.edu.in',
      website: 'https://mit.edu.in/',
    },
  },
})
```

Then access via:
- `http://mit.sites.conosco.in:3000` (pilot subdomain)
- `http://blog.mit.edu.in:3000` (custom domain, after hosts file edit)

---

## User Roles & Access

### Seeded Demo Accounts

After running `pnpm run seed`, you get these accounts:

| Role                | Email                      | Password      | Access Level                          |
|---------------------|----------------------------|---------------|---------------------------------------|
| **SuperAdmin**      | superadmin@gcetblog.in     | superadmin123 | Platform management (`/platform`)     |
| **Institution Admin** | admin@gcet.edu.in        | admin123      | GCET management (`/user`)             |
| **Blog Editor**     | editor@gcet.edu.in         | editor123     | Edit all GCET posts (`/user`)         |
| **Blog Author**     | author@gcet.edu.in         | author123     | Create/edit own posts (`/user`)       |
| **Moderator**       | moderator@gcet.edu.in      | moderator123  | Moderate comments/feedback (`/user`)  |

### Access Patterns

#### 1. SuperAdmin (Platform Owner)

```
Login: http://localhost:3000/login
Email: superadmin@gcetblog.in
Password: superadmin123

Redirects to: /platform
```

**Can access:**
- `/platform` - Platform management dashboard
- `/platform/institutions` - Manage all institutions
- `/platform/users` - View all users across institutions
- `/platform/analytics` - Platform-wide analytics

**Cannot access:**
- `/user` - Institution-specific dashboards (redirects to `/platform`)

---

#### 2. Institution Admin

```
Login: http://localhost:3000/login
Email: admin@gcet.edu.in
Password: admin123

Redirects to: /user
```

**Can access:**
- `/user` - Unified dashboard
- `/user/posts` - Manage all GCET posts
- `/user/events` - Manage GCET events
- `/user/clubs` - Manage GCET clubs
- `/user/users` - Manage GCET users
- `/user/settings` - Institution settings

**Cannot access:**
- `/platform` - Platform management (redirects to `/user`)
- Other institutions' data (automatically filtered)

---

#### 3. Blog Editor

```
Login: http://localhost:3000/login
Email: editor@gcet.edu.in
Password: editor123

Redirects to: /user
```

**Can access:**
- `/user/posts` - Edit all GCET posts (including others' drafts)
- `/user/posts/create` - Create new posts
- `/user/categories` - Manage categories

**Cannot access:**
- `/user/users` - User management
- `/user/settings` - Institution settings
- `/platform` - Platform management

---

#### 4. Blog Author

```
Login: http://localhost:3000/login
Email: author@gcet.edu.in
Password: author123

Redirects to: /user
```

**Can access:**
- `/user/posts` - View own posts only
- `/user/posts/create` - Create new posts
- `/user/posts/[id]` - Edit own posts only

**Cannot access:**
- Other authors' posts
- User management
- Institution settings

---

#### 5. Regular User (No Roles)

```
Login: http://localhost:3000/login
Email: student@gcet.edu.in
Password: student123

Redirects to: / (public site)
```

**Can access:**
- Public pages only
- Cannot access `/user` or `/platform`

---

## Troubleshooting

### Issue: "No institution found for this hostname"

**Cause:** Hostname doesn't match any institution domain or pilot subdomain.

**Solution:**
1. Check your `.env` for `DEFAULT_INSTITUTION_CODE`
2. Verify institution exists: `http://localhost:3000/platform/institutions`
3. Check `domains[]` array in institution document
4. Clear tenant cache: POST to `/api/resolve-tenant` (as superadmin)

---

### Issue: Seeing wrong institution's content

**Cause:** Tenant cache is stale or hostname resolution failed.

**Solution:**
1. Restart dev server: `Ctrl+C` then `pnpm run dev`
2. Clear browser cache and cookies
3. Check middleware logs in terminal
4. Verify `x-tenant-id` header in browser DevTools → Network tab

---

### Issue: "Session expired" after login

**Cause:** `PAYLOAD_SECRET` mismatch or cookie domain issue.

**Solution:**
1. Check `.env` has `PAYLOAD_SECRET` set
2. Clear browser cookies for `localhost:3000`
3. Try incognito/private browsing mode
4. Verify `NEXT_PUBLIC_SERVER_URL` matches your access URL

---

### Issue: Custom domain not working locally

**Cause:** Hosts file not configured or DNS cache.

**Solution:**
1. Edit hosts file (see Method 3 above)
2. Flush DNS cache:
   - Windows: `ipconfig /flushdns`
   - Mac: `sudo dscacheutil -flushcache`
   - Linux: `sudo systemd-resolve --flush-caches`
3. Restart browser
4. Access with port: `http://blog.gcet.edu.in:3000`

---

### Issue: Database connection failed

**Cause:** MongoDB not running or wrong connection string.

**Solution:**
1. Start MongoDB: `mongod` or `brew services start mongodb-community`
2. Check `.env` has correct `DATABASE_URI`
3. Test connection: `mongosh mongodb://127.0.0.1/gcet-blog`
4. Verify MongoDB is listening on port 27017

---

## Advanced: Adding a New Institution

### 1. Via SuperAdmin Dashboard (Recommended)

```
1. Login as superadmin@gcetblog.in
2. Go to /platform/institutions
3. Click "Create New"
4. Fill in:
   - Name: "MIT College of Engineering"
   - Code: "mit" (lowercase, no spaces)
   - Short Name: "MIT"
   - Status: "active"
   - Tier: "standard"
5. Add domain:
   - Hostname: "blog.mit.edu.in"
   - Purpose: "blog"
6. Save
```

### 2. Via Script (Bulk Import)

Create `scripts/add-institution.ts`:

```typescript
import { getPayload } from 'payload'
import config from '../src/payload.config.js'

async function addInstitution() {
  const payload = await getPayload({ config })

  const mit = await payload.create({
    collection: 'institutions',
    data: {
      name: 'MIT College of Engineering',
      code: 'mit',
      shortName: 'MIT',
      status: 'active',
      tier: 'standard',
      domains: [
        { hostname: 'blog.mit.edu.in', purpose: 'blog', verified: false },
        { hostname: 'mit.sites.conosco.in', purpose: 'main', verified: true },
      ],
      contact: {
        email: 'info@mit.edu.in',
        website: 'https://mit.edu.in/',
      },
      settings: {
        enabledModules: ['blog', 'events', 'clubs'],
      },
    },
  })

  console.log('Created institution:', mit.id)
  process.exit(0)
}

addInstitution()
```

Run: `tsx scripts/add-institution.ts`

### 3. Access the New Institution

- Pilot subdomain: `http://mit.sites.conosco.in:3000`
- Custom domain: `http://blog.mit.edu.in:3000` (after hosts file edit)

---

## Summary

### Development Access Flow

```
1. Run: pnpm run dev
2. Server starts on localhost:3000
3. Access: http://localhost:3000
4. Middleware resolves hostname → GCET (default)
5. Headers injected: x-tenant-id, x-tenant-code
6. Page renders with GCET content
7. Login with role-specific account
8. Redirected to appropriate dashboard
```

### Production Access Flow

```
1. User visits: blog.gcet.edu.in
2. DNS resolves to Vercel deployment
3. Middleware resolves hostname → GCET institution
4. Headers injected: x-tenant-id=<gcet-id>, x-tenant-code=gcet
5. Server components query: { institution: { equals: gcet-id } }
6. Page renders with GCET-only content
7. User login → role-based dashboard access
```

### Key Files

- `src/middleware.ts` - Hostname resolution and routing
- `src/utilities/tenantResolver.ts` - Tenant resolution logic
- `src/app/api/resolve-tenant/route.ts` - Tenant resolution API
- `src/collections/Institutions/index.ts` - Institution schema
- `scripts/seed-database.ts` - Sample data seeding
- `.env` - Environment configuration

---

## Next Steps

1. **Customize Branding**: Edit institution in `/platform/institutions`
2. **Add Content**: Create posts, events, clubs via `/user` dashboard
3. **Configure Email**: Set up SMTP/SendGrid for newsletters
4. **Deploy**: Push to Vercel, configure custom domains
5. **Monitor**: Check `/platform/analytics` for usage stats

---

**Need Help?**
- Check `docs/MULTI_TENANT_AUDIT.md` for security details
- See `docs/COMPLETE_IMPLEMENTATION.md` for implementation summary
- Review `README.md` for general project info

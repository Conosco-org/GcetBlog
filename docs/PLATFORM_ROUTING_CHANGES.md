# Platform Routing Changes

## Overview

Implemented major routing changes to separate the platform dashboard from institution blogs, ensuring proper multi-tenant isolation and security.

---

## What Changed

### 1. Root URL Behavior

**Before:**
- `localhost:3000` → GCET blog (default institution)
- Main domain → First active institution blog

**After:**
- `localhost:3000` → Platform dashboard (login required)
- Main domain → Platform dashboard (login required)
- Institution blogs ONLY accessible via their specific domains

### 2. Tenant Resolution

**Before:**
```
localhost:3000 → Resolves to DEFAULT_INSTITUTION_CODE (always)
```

**After:**
```
localhost:3000 → No tenant resolution (platform mode)
blog.gcet.edu.in → Resolves to GCET institution
gcet.sites.conosco.in → Resolves to GCET institution
```

### 3. Access Control

**New Behavior:**
- Root path (`/`) checks for tenant resolution
- If NO tenant → Redirect to platform dashboard or login
- If tenant resolved → Show institution blog
- Non-auth pages without tenant → Show 404 with helpful message

---

## Implementation Details

### Middleware Changes (`src/middleware.ts`)

#### Root Path Handling
```typescript
if (pathname === '/') {
  if (!tenantInfo) {
    // No institution resolved → redirect to platform dashboard
    if (!token) {
      return loginRedirect(request, { redirect: '/platform' })
    }
    
    const user = await getUser(token, request)
    if (!user) {
      return loginRedirect(request, { message: 'Session expired', redirect: '/platform' })
    }
    
    // Redirect to appropriate dashboard based on role
    return NextResponse.redirect(new URL(getDashboardUrl(user), request.url))
  }
  // Tenant resolved → continue to institution blog home page
}
```

#### Content Access Protection
```typescript
const publicAuthPaths = ['/login', '/register', '/set-password', '/forgot-password']
const isAuthPath = publicAuthPaths.some(p => pathname.startsWith(p))

if (!isAuthPath && !tenantInfo && pathname !== '/') {
  // No tenant resolved and trying to access institution content
  return new NextResponse(
    '<html><body><h1>Institution Not Found</h1><p>This content is only accessible via institution-specific domains.</p></body></html>',
    { status: 404, headers: { 'Content-Type': 'text/html' } },
  )
}
```

### Tenant Resolver Changes (`src/utilities/tenantResolver.ts`)

#### Removed Automatic Localhost Fallback
```typescript
// OLD: Always fallback to default institution on localhost
if (!tenant && isLocalhost(normalizedHost)) {
  tenant = await resolveByDefault(payload)
}

// NEW: Only fallback if explicitly configured
if (!tenant && isLocalhost(normalizedHost) && process.env.DEFAULT_INSTITUTION_CODE) {
  tenant = await resolveByDefault(payload)
}
```

### Environment Variables (`.env.example`)

#### New Configuration
```env
# Default institution for localhost development (optional)
# If NOT set, localhost:3000 will show the platform dashboard
# If set, localhost:3000 will show that institution's blog
# Example: DEFAULT_INSTITUTION_CODE=gcet
# DEFAULT_INSTITUTION_CODE=

# Platform subdomain suffix for pilot tier institutions
# Example: gcet.sites.conosco.in
PLATFORM_SUBDOMAIN_SUFFIX=sites.conosco.in
```

---

## User Experience

### SuperAdmin
```
1. Visit localhost:3000 or main domain
2. Redirected to /login (if not logged in)
3. After login → Redirected to /platform
4. Can manage all institutions
```

### Institution Admin
```
1. Visit blog.gcet.edu.in
2. See GCET blog home page
3. Click login → /login on blog.gcet.edu.in
4. After login → Redirected to /user (institution dashboard)
5. Can manage GCET content only
```

### Regular User
```
1. Visit blog.gcet.edu.in
2. See GCET blog home page
3. Can browse posts, events, clubs
4. Login redirects to / (public site)
```

---

## Development Workflow

### Testing Platform Dashboard

```bash
# 1. Start dev server
npm run dev

# 2. Access platform
http://localhost:3000

# 3. Login as superadmin
Email: superadmin@gcetblog.in
Password: superadmin123

# 4. Redirected to /platform
```

### Testing Institution Blog

#### Option 1: Use Pilot Subdomain (Requires Hosts File)

```bash
# 1. Edit hosts file
# Windows: C:\Windows\System32\drivers\etc\hosts
# Mac/Linux: /etc/hosts

# Add:
127.0.0.1  gcet.sites.conosco.in

# 2. Access institution blog
http://gcet.sites.conosco.in:3000
```

#### Option 2: Use Custom Domain (Requires Hosts File)

```bash
# 1. Edit hosts file
127.0.0.1  blog.gcet.edu.in

# 2. Access institution blog
http://blog.gcet.edu.in:3000
```

#### Option 3: Set DEFAULT_INSTITUTION_CODE (Quick Testing)

```bash
# 1. Edit .env
DEFAULT_INSTITUTION_CODE=gcet

# 2. Restart dev server
npm run dev

# 3. Access institution blog
http://localhost:3000
# Now shows GCET blog instead of platform dashboard
```

---

## Migration Guide

### For Existing Deployments

1. **Update Environment Variables**
   ```env
   # Remove or comment out if you want main domain to show platform
   # DEFAULT_INSTITUTION_CODE=gcet
   
   # Add platform subdomain suffix
   PLATFORM_SUBDOMAIN_SUFFIX=sites.conosco.in
   ```

2. **Update DNS Records**
   - Ensure each institution has proper domain mapping
   - Main platform domain should NOT resolve to any institution
   - Example:
     - `platform.conosco.in` → Platform dashboard
     - `blog.gcet.edu.in` → GCET blog
     - `gcet.sites.conosco.in` → GCET blog (pilot)

3. **Test Access**
   ```bash
   # Platform dashboard
   curl -I https://platform.conosco.in
   # Should redirect to /login or /platform
   
   # Institution blog
   curl -I https://blog.gcet.edu.in
   # Should return 200 with blog content
   ```

4. **Update Documentation**
   - Inform users about new URL structure
   - Update onboarding guides
   - Update institution admin documentation

---

## Security Improvements

### 1. Tenant Isolation
- Institution content no longer accessible without proper domain
- Prevents accidental cross-institution data leaks
- Clear separation between platform and institution contexts

### 2. Access Control
- Root URL requires authentication for platform access
- Institution blogs require valid tenant resolution
- Helpful error messages for misconfigured domains

### 3. Domain Validation
- Explicit domain mapping in institutions collection
- No automatic fallbacks that could expose wrong data
- Clear audit trail of which domain serves which institution

---

## Breaking Changes

### ⚠️ BREAKING: Localhost Behavior

**Before:**
```bash
npm run dev
# localhost:3000 → Shows GCET blog (default institution)
```

**After:**
```bash
npm run dev
# localhost:3000 → Shows platform dashboard (login required)

# To test institution blog on localhost:
# Option 1: Set DEFAULT_INSTITUTION_CODE=gcet in .env
# Option 2: Edit hosts file and use gcet.sites.conosco.in:3000
```

### Migration Path

For developers who want the old behavior:

```env
# .env
DEFAULT_INSTITUTION_CODE=gcet
```

This restores localhost → institution blog behavior for local development.

---

## Testing Checklist

- [ ] Platform dashboard accessible at root URL
- [ ] SuperAdmin can access /platform
- [ ] Institution blogs accessible via custom domains
- [ ] Institution blogs accessible via pilot subdomains
- [ ] Root URL without tenant shows platform dashboard
- [ ] Non-auth pages without tenant show 404
- [ ] Login redirects work correctly for each role
- [ ] Tenant headers properly set for institution domains
- [ ] No tenant headers set for platform routes
- [ ] Build completes successfully
- [ ] No TypeScript errors
- [ ] All tests pass

---

## Files Modified

1. `src/middleware.ts` - Root path routing and tenant validation
2. `src/utilities/tenantResolver.ts` - Removed automatic localhost fallback
3. `.env.example` - Added DEFAULT_INSTITUTION_CODE documentation
4. `src/providers/Tenant/index.tsx` - Added favicon to ClientTenant type
5. `src/collections/Media.ts` - Fixed institution field type error
6. `src/app/(auth)/login/actions.ts` - Added headers import
7. `src/app/(auth)/layout.tsx` - Fixed file corruption
8. `src/app/api/auth/google/callback/route.ts` - Fixed duplicate code

---

## Next Steps

1. **Deploy to Staging**
   - Test all routing scenarios
   - Verify DNS configuration
   - Test with real institution domains

2. **Update Documentation**
   - User guides
   - Admin documentation
   - Developer setup instructions

3. **Monitor Metrics**
   - Track 404 errors for misconfigured domains
   - Monitor login redirect flows
   - Check tenant resolution performance

4. **Gather Feedback**
   - SuperAdmin experience
   - Institution admin experience
   - End user experience

---

## Rollback Plan

If issues arise, rollback by reverting the commit:

```bash
git revert 030e963
git push
```

Or restore old behavior with environment variable:

```env
DEFAULT_INSTITUTION_CODE=gcet
```

This will make localhost behave like before while keeping other improvements.

---

## Support

For questions or issues:
1. Check `docs/DEVELOPMENT_WORKFLOW.md` for detailed setup
2. Review `docs/MULTI_TENANT_AUDIT.md` for security context
3. See `docs/COMPLETE_IMPLEMENTATION.md` for full implementation details

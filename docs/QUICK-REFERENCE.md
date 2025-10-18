# Quick Reference Guide

## 🚀 Quick Start Commands

```bash
npm install          # Install dependencies
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Check code quality
npm run test         # Run tests
```

## 📁 File Locations Cheat Sheet

| What | Where |
|------|-------|
| Public pages | `src/app/(frontend)/` |
| Auth pages | `src/app/(auth)/` |
| API routes | `src/app/api/` |
| Components | `src/components/` |
| Collections | `src/collections/` |
| Server Actions | `[route]/actions.ts` |
| Middleware | `src/middleware.ts` |
| Utilities | `src/utilities/` |

## 🎯 Common Tasks

### Adding a New Page

```typescript
// 1. Create file
src/app/(frontend)/my-page/page.tsx

// 2. Export page component
export default function MyPage() {
  return <div>My Page</div>
}

// 3. Add metadata
export const metadata = {
  title: 'My Page',
  description: 'Description here'
}
```

### Creating a Server Action

```typescript
// In [route]/actions.ts
'use server'

export async function myAction(formData: FormData) {
  // 1. Validate
  const data = formData.get('field') as string
  if (!data) return { error: 'Required' }
  
  // 2. Process
  const payload = await getPayload({ config })
  const result = await payload.create({
    collection: 'my-collection',
    data: { field: data }
  })
  
  // 3. Revalidate
  revalidatePath('/my-page')
  
  // 4. Return
  return { success: true, id: result.id }
}
```

### Using UserContext

```typescript
'use client'
import { useUser } from '@/providers/User'

export default function MyComponent() {
  const { user, loading } = useUser()
  
  if (loading) return <div>Loading...</div>
  if (!user) return <div>Please log in</div>
  
  return <div>Hello, {user.name}!</div>
}
```

### Fetching User Server-Side

```typescript
import { getMeUser } from '@/utilities/getMeUser'

export default async function MyPage() {
  const user = await getMeUser()
  
  if (!user) redirect('/login')
  
  return <div>Welcome, {user.name}</div>
}
```

### Protecting a Route

```typescript
// src/middleware.ts
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/my-protected-route/:path*',  // Add this
  ]
}
```

## 🗂️ Route Groups

| Route Group | URL | Purpose |
|------------|-----|---------|
| `(frontend)/` | `/`, `/posts`, etc. | Public site |
| `(auth)/` | `/login`, `/register` | Authentication |
| `(payload)/` | `/admin` | CMS panel |

**Remember:** Parentheses don't appear in URLs!

## 🔐 Access Control Quick Reference

```typescript
// Everyone
access: { read: () => true }

// Authenticated users only
access: { read: ({ req: { user } }) => !!user }

// Admins only
access: { read: ({ req: { user } }) => user?.role === 'admin' }

// Creator or admin
access: { 
  update: ({ req: { user } }) => {
    if (user?.role === 'admin') return true
    return { author: { equals: user.id } }
  }
}
```

## 🎨 Component Patterns

### Server Component (Default)
```typescript
// Can fetch data, no 'use client' needed
export default async function MyComponent() {
  const data = await fetchData()
  return <div>{data}</div>
}
```

### Client Component
```typescript
'use client'  // Required!

import { useState } from 'react'

export default function MyComponent() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}
```

## 📊 Payload CMS Patterns

### Find Documents
```typescript
const posts = await payload.find({
  collection: 'posts',
  where: { status: { equals: 'published' } },
  sort: '-publishedAt',
  limit: 10,
})
```

### Create Document
```typescript
const post = await payload.create({
  collection: 'posts',
  data: {
    title: 'My Post',
    content: '...',
    status: 'draft',
  },
})
```

### Update Document
```typescript
const post = await payload.update({
  collection: 'posts',
  id: postId,
  data: {
    status: 'published',
  },
})
```

### Delete Document
```typescript
await payload.delete({
  collection: 'posts',
  id: postId,
})
```

## 🔧 Debugging Tips

### Clear Caches
```bash
# Clear Next.js cache
rm -rf .next

# Clear TypeScript cache
rm -f tsconfig.tsbuildinfo

# Restart TS Server in VS Code
# Cmd+Shift+P → "TypeScript: Restart TS Server"
```

### View Server Logs
```typescript
// Server Actions
console.log('[ACTION] Data:', data)

// API Routes
console.log('[API] Request:', request.url)

// Middleware
console.log('[MIDDLEWARE] User:', user)
```

### Check User Auth
```typescript
// In server component
const user = await getMeUser()
console.log('User:', user)

// In client component
const { user } = useUser()
console.log('User:', user)

// In API route
const { user } = await payload.auth({ headers })
console.log('User:', user)
```

## 🎯 Environment Variables

```bash
# Required
DATABASE_URI=mongodb://localhost:27017/gcet-blog
PAYLOAD_SECRET=your-secret-key-here
NEXT_PUBLIC_SERVER_URL=http://localhost:3000

# Optional
NODE_ENV=development
PORT=3000
```

## 📦 Useful Imports

```typescript
// Next.js
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { cookies, headers } from 'next/headers'
import type { Metadata } from 'next'

// Payload
import { getPayload } from 'payload'
import config from '@payload-config'
import type { User } from '@/payload-types'

// Components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// Utilities
import { getMeUser } from '@/utilities/getMeUser'
import { cn } from '@/utilities/ui'

// Providers
import { useUser } from '@/providers/User'
```

## 🚨 Common Errors & Solutions

### "Cannot find module"
```bash
# Solution
npm install
rm -rf .next
npm run dev
```

### "You cannot have two parallel pages"
```bash
# Cause: Duplicate routes in different route groups
# Solution: Remove duplicate or rename one
```

### "Missing <html> tags"
```bash
# Cause: Layout doesn't have HTML structure
# Solution: Each route group needs its own <html>
```

### TypeScript errors for deleted files
```bash
# Solution
rm -f tsconfig.tsbuildinfo
# Restart TS Server in VS Code
```

### Middleware not protecting route
```typescript
// Check matcher includes your route
export const config = {
  matcher: ['/your-route/:path*']
}
```

## 📱 Responsive Design

```typescript
// Tailwind breakpoints
sm:  // 640px
md:  // 768px
lg:  // 1024px
xl:  // 1280px
2xl: // 1536px

// Example
<div className="text-sm md:text-base lg:text-lg">
  Responsive text
</div>
```

## 🎨 Common UI Patterns

### Form with Server Action
```typescript
'use client'

export default function MyForm() {
  const [message, setMessage] = useState('')
  
  async function handleSubmit(formData: FormData) {
    const result = await myAction(formData)
    setMessage(result.error || 'Success!')
  }
  
  return (
    <form action={handleSubmit}>
      <Input name="field" required />
      <Button type="submit">Submit</Button>
      {message && <p>{message}</p>}
    </form>
  )
}
```

### Loading State
```typescript
export default function MyComponent() {
  const [loading, setLoading] = useState(false)
  
  async function handleAction() {
    setLoading(true)
    try {
      await doSomething()
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <Button onClick={handleAction} disabled={loading}>
      {loading ? 'Loading...' : 'Click Me'}
    </Button>
  )
}
```

### Conditional Rendering
```typescript
{user ? (
  <DashboardView />
) : (
  <LoginPrompt />
)}

{loading && <Spinner />}

{error && <ErrorMessage>{error}</ErrorMessage>}
```

## 🔍 Finding Things

### Find where something is used
```bash
# In VS Code
Ctrl+Shift+F (Cmd+Shift+F on Mac)

# Or use grep
grep -r "functionName" src/
```

### Find file by name
```bash
# In VS Code
Ctrl+P (Cmd+P on Mac)

# Type filename
```

### Find in current file
```bash
# In VS Code
Ctrl+F (Cmd+F on Mac)
```

## 🎓 Learning Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Payload CMS Docs](https://payloadcms.com/docs)
- [Tailwind Docs](https://tailwindcss.com/docs)
- [TypeScript Docs](https://www.typescriptlang.org/docs)

## 📞 Need Help?

1. Check this documentation
2. Search existing GitHub issues
3. Ask in GitHub Discussions
4. Create a new issue with [Question] tag

---

**Pro Tip:** Bookmark this page for quick access during development!

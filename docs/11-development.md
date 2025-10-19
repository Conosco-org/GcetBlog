# Development Workflow

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.17 or later
- **npm** 9.x or later
- **MongoDB** 4.4 or later (or MongoDB Atlas account)
- **Git** for version control

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/Conosco-org/GcetBlog.git
cd GcetBlog

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Configure environment variables
# Edit .env with your values:
# - DATABASE_URI=mongodb://localhost:27017/gcet-blog
# - PAYLOAD_SECRET=your-secret-key-here
# - NEXT_PUBLIC_SERVER_URL=http://localhost:3000

# Run database setup
npm run payload generate:types

# Seed the database (optional)
npm run seed

# Start development server
npm run dev
```

### Access Points

- **Frontend:** http://localhost:3000
- **Admin Panel:** http://localhost:3000/admin
- **API:** http://localhost:3000/api

### Default Admin Account

After seeding:
- **Email:** admin@gcet.edu.in
- **Password:** admin123

## 📝 Development Commands

```bash
# Development
npm run dev              # Start dev server with hot reload
npm run build           # Build for production
npm run start           # Start production server

# Code Quality
npm run lint            # Run ESLint
npm run lint:fix        # Fix linting issues
npm run format          # Format code with Prettier

# Testing
npm run test            # Run unit tests (Vitest)
npm run test:e2e        # Run E2E tests (Playwright)
npm run test:watch      # Run tests in watch mode

# Payload CMS
npm run payload         # Payload CLI
npm run payload generate:types  # Generate TypeScript types
npm run seed            # Seed database with sample data

# Database
npm run db:push         # Push schema changes
npm run db:studio       # Open database studio (if using Prisma)

# Docker
docker-compose up       # Start all services
docker-compose down     # Stop all services
```

## 🏗️ Common Development Tasks

### Adding a New Page

**1. Decide Route Group**
- Public page? → `(frontend)/`
- Auth page? → `(auth)/`
- Admin page? → `(payload)/` (rarely needed)

**2. Create the Page**
```bash
# Example: Creating a contact page
touch src/app/(frontend)/contact/page.tsx
```

```typescript
// src/app/(frontend)/contact/page.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us - GCET Blog',
  description: 'Get in touch with us',
}

export default function ContactPage() {
  return (
    <div className="container py-16">
      <h1 className="text-4xl font-bold mb-8">Contact Us</h1>
      {/* Your content */}
    </div>
  )
}
```

**3. Add Navigation Link (if needed)**
```typescript
// src/components/Header/Nav/index.tsx
const navItems = [
  { label: 'Posts', href: '/posts' },
  { label: 'Contact', href: '/contact' },  // Add this
]
```

**4. Test**
```bash
# Visit http://localhost:3000/contact
```

---

### Adding a New Component

**1. Determine Component Type**
- Needs interactivity? → Client Component
- Just rendering? → Server Component (default)

**2. Create Component File**
```bash
# Server component (default)
touch src/components/MyComponent/index.tsx

# Client component
touch src/components/MyComponent/Component.client.tsx
```

**3. Write Component**
```typescript
// Server component
export default function MyComponent({ title }: { title: string }) {
  return <div>{title}</div>
}

// Client component
'use client'

export default function MyComponent({ onClick }: { onClick: () => void }) {
  return <button onClick={onClick}>Click me</button>
}
```

**4. Export from Index**
```typescript
// src/components/MyComponent/index.ts
export { default } from './Component'
// or
export { default } from './Component.client'
```

---

### Adding a New Payload Collection

**1. Create Collection File**
```bash
touch src/collections/MyCollection.ts
```

**2. Define Schema**
```typescript
// src/collections/MyCollection.ts
import type { CollectionConfig } from 'payload'

export const MyCollection: CollectionConfig = {
  slug: 'my-collection',
  admin: {
    useAsTitle: 'title',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'content',
      type: 'richText',
    },
    {
      name: 'status',
      type: 'select',
      options: ['draft', 'published'],
      defaultValue: 'draft',
    },
  ],
}
```

**3. Add to Payload Config**
```typescript
// src/payload.config.ts
import { MyCollection } from './collections/MyCollection'

export default buildConfig({
  collections: [
    // ... existing collections
    MyCollection,
  ],
})
```

**4. Generate Types**
```bash
npm run payload generate:types
```

**5. Access in Admin**
Visit http://localhost:3000/admin/collections/my-collection

---

### Adding a Server Action

**1. Create or Update actions.ts**
```typescript
// src/app/(frontend)/my-page/actions.ts
'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { revalidatePath } from 'next/cache'

export async function myAction(formData: FormData) {
  // 1. Extract and validate data
  const title = formData.get('title') as string
  if (!title) {
    return { error: 'Title is required' }
  }
  
  // 2. Get Payload instance
  const payload = await getPayload({ config })
  
  // 3. Perform operation
  try {
    const result = await payload.create({
      collection: 'my-collection',
      data: { title },
    })
    
    // 4. Revalidate cache
    revalidatePath('/my-page')
    
    // 5. Return success
    return { success: true, id: result.id }
  } catch (error) {
    return { error: 'Failed to create item' }
  }
}
```

**2. Use in Component**
```typescript
// src/app/(frontend)/my-page/MyForm.tsx
'use client'

import { myAction } from './actions'

export default function MyForm() {
  async function handleSubmit(formData: FormData) {
    const result = await myAction(formData)
    
    if (result.error) {
      alert(result.error)
    } else {
      alert('Success!')
    }
  }
  
  return (
    <form action={handleSubmit}>
      <input name="title" required />
      <button type="submit">Submit</button>
    </form>
  )
}
```

---

### Adding API Route

**1. Create Route File**
```bash
touch src/app/api/my-endpoint/route.ts
```

**2. Implement Handlers**
```typescript
// src/app/api/my-endpoint/route.ts
import { getPayload } from 'payload'
import config from '@payload-config'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    
    // Verify authentication
    const { user } = await payload.auth({ headers: request.headers })
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Fetch data
    const data = await payload.find({
      collection: 'my-collection',
      where: { status: { equals: 'published' } },
    })
    
    return Response.json(data)
  } catch (error) {
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  // Handle POST requests
}
```

---

### Protecting a Route

**1. Add to Middleware Matcher**
```typescript
// src/middleware.ts
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/editor/:path*',
    '/admin/:path*',
    '/my-protected-route/:path*',  // Add your route
  ]
}
```

**2. Add Role Check (if needed)**
```typescript
// src/middleware.ts
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const user = await getUserFromToken(request)
  
  // Your custom route protection
  if (pathname.startsWith('/my-protected-route')) {
    if (!user) {
      return redirectToLogin(request)
    }
    if (!['editor', 'admin'].includes(user.role)) {
      return Response.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }
  }
  
  return NextResponse.next()
}
```

---

## 🧪 Testing

### Unit Tests

```typescript
// src/utilities/__tests__/formatDateTime.test.ts
import { describe, it, expect } from 'vitest'
import { formatDateTime } from '../formatDateTime'

describe('formatDateTime', () => {
  it('formats date correctly', () => {
    const date = new Date('2025-01-15')
    expect(formatDateTime(date)).toBe('Jan 15, 2025')
  })
})
```

```bash
# Run tests
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

### E2E Tests

```typescript
// tests/e2e/login.spec.ts
import { test, expect } from '@playwright/test'

test('user can login', async ({ page }) => {
  await page.goto('/login')
  
  await page.fill('input[name="email"]', 'contributor@gcet.edu.in')
  await page.fill('input[name="password"]', 'password123')
  await page.click('button[type="submit"]')
  
  await expect(page).toHaveURL('/dashboard')
  await expect(page.locator('text=Welcome back')).toBeVisible()
})
```

```bash
# Run E2E tests
npm run test:e2e

# Run in UI mode
npm run test:e2e -- --ui
```

---

## 🐛 Debugging

### Next.js Debugging

```typescript
// Enable debug mode
// .env
DEBUG=next:*

// Or for specific modules
DEBUG=next:router
```

### Server Actions Debugging

```typescript
// Add console.logs in server actions
'use server'

export async function myAction(formData: FormData) {
  console.log('[myAction] Called with:', Object.fromEntries(formData))
  
  try {
    const result = await doSomething()
    console.log('[myAction] Success:', result)
    return { success: true }
  } catch (error) {
    console.error('[myAction] Error:', error)
    return { error: 'Failed' }
  }
}
```

### Payload Debugging

```typescript
// payload.config.ts
export default buildConfig({
  debug: true,  // Enable debug mode
})
```

---

## 🔧 Troubleshooting

### TypeScript Errors for Deleted Files

```bash
# Clear TypeScript cache
rm -rf .next
rm -f tsconfig.tsbuildinfo

# Restart TypeScript server in VS Code
# Ctrl+Shift+P → "TypeScript: Restart TS Server"
```

### Module Resolution Issues

```bash
# Check tsconfig.json paths
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}

# Reinstall dependencies
rm -rf node_modules
npm install
```

### Payload Types Not Updating

```bash
# Regenerate types
npm run payload generate:types

# Restart dev server
npm run dev
```

### Database Connection Issues

```bash
# Check MongoDB is running
mongosh

# Verify DATABASE_URI in .env
# Format: mongodb://localhost:27017/database-name
# Or: mongodb+srv://user:pass@cluster.mongodb.net/database
```

---

## 📊 Performance Optimization

### Image Optimization

```typescript
import Image from 'next/image'

<Image
  src="/media/image.jpg"
  alt="Description"
  width={800}
  height={600}
  priority={false}  // Set true for above-fold images
  loading="lazy"    // Lazy load by default
/>
```

### Route Caching

```typescript
// Force dynamic (no caching)
export const dynamic = 'force-dynamic'

// Revalidate every 60 seconds
export const revalidate = 60

// Static generation
export const dynamic = 'force-static'
```

### Bundle Analysis

```bash
# Install analyzer
npm install --save-dev @next/bundle-analyzer

# Add to next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer(nextConfig)

# Run analysis
ANALYZE=true npm run build
```

---

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Production deploy
vercel --prod
```

### Docker

```bash
# Build image
docker build -t gcet-blog .

# Run container
docker run -p 3000:3000 gcet-blog

# Or use docker-compose
docker-compose up -d
```

### Environment Variables

**Production .env:**
```bash
NODE_ENV=production
DATABASE_URI=mongodb+srv://...
PAYLOAD_SECRET=your-production-secret
NEXT_PUBLIC_SERVER_URL=https://yourdomain.com
```

---

## 📚 Best Practices

### Code Organization

✅ **DO:**
- Keep server and client components separate
- Use TypeScript for type safety
- Write unit tests for utilities
- Document complex functions
- Follow existing naming conventions

❌ **DON'T:**
- Mix server and client code without `'use client'`
- Hardcode sensitive values
- Skip error handling
- Commit `.env` file
- Modify auto-generated files

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push to remote
git push origin feature/my-feature

# Create pull request on GitHub
```

### Commit Messages

Follow conventional commits:
```
feat: add new feature
fix: resolve bug
docs: update documentation
style: format code
refactor: restructure code
test: add tests
chore: update dependencies
```

---

Next: [Future Roadmap →](./12-roadmap.md)

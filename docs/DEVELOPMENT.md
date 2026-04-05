# Development Guide

This guide covers development workflows, common tasks, and troubleshooting for the GCET Blog platform.

## Development Workflow

### Branch Strategy

- **main**: Production-ready code
- **feature/***: New features (e.g., `feature/user-authentication`)
- **fix/***: Bug fixes (e.g., `fix/review-queue-improvements`)
- **optimize/***: Performance improvements (e.g., `optimize/vercel-deployment`)

### Workflow Steps

1. **Create branch**: `git checkout -b feature/your-feature-name`
2. **Make changes**: Implement your feature
3. **Test locally**: Run `pnpm dev` and test thoroughly
4. **Build verification**: Run `pnpm build` to ensure production build works
5. **Commit**: `git commit -m "feat: your feature description"`
6. **Push**: `git push origin feature/your-feature-name`
7. **Create PR**: Submit pull request for review

### Commit Message Convention

Follow conventional commits:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

Examples:
```
feat: add rejection notifications for review queue
fix: resolve timezone issue in post timestamps
docs: update API documentation
```

## Common Tasks

### Creating a New Collection

1. Create collection file in `src/collections/`:

```typescript
import { CollectionConfig } from 'payload'

export const YourCollection: CollectionConfig = {
  slug: 'your-collection',
  admin: {
    useAsTitle: 'name',
  },
  access: {
    read: () => true,
    create: ({ req }) => !!req.user,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
  ],
}
```

2. Add to `payload.config.ts`:

```typescript
import { YourCollection } from './collections/YourCollection'

export default buildConfig({
  collections: [
    // ... existing collections
    YourCollection,
  ],
})
```

3. Generate types: `pnpm generate:types`

### Adding a New Page

1. Create page in `src/app/(frontend)/your-page/page.tsx`:

```typescript
export default function YourPage() {
  return (
    <div>
      <h1>Your Page</h1>
    </div>
  )
}
```

2. Add metadata:

```typescript
export const metadata = {
  title: 'Your Page',
  description: 'Page description',
}
```

### Creating an API Route

1. Create route in `src/app/api/your-route/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({ message: 'Success' })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  return NextResponse.json({ data: body })
}
```

2. For resource-specific routes with DELETE (e.g., `/api/posts/[id]/route.ts`):

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { revalidatePath } from 'next/cache'
import config from '@/payload.config'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await getPayload({ config })
    const { id } = await params

    // Verify user is authenticated
    const { user } = await payload.auth({ headers: request.headers })
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch the resource to check permissions
    const resource = await payload.findByID({
      collection: 'your-collection',
      id,
      draft: true,
    })

    if (!resource) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      )
    }

    // Check permissions (example: user role and ownership)
    const userRole = (user as { role?: string }).role
    const isAdmin = userRole === 'admin'

    if (!isAdmin) {
      // Check if user owns the resource
      const authorIds = (resource.authors || []).map((a: unknown) =>
        typeof a === 'object' && a !== null && 'id' in a 
          ? String((a as { id: unknown }).id) 
          : String(a)
      )
      
      if (!authorIds.includes(String(user.id))) {
        return NextResponse.json(
          { error: 'You do not have permission to delete this resource' },
          { status: 403 }
        )
      }
    }

    // Delete the resource
    await payload.delete({
      collection: 'your-collection',
      id,
    })

    // Revalidate relevant paths
    revalidatePath('/your-page')

    return NextResponse.json({
      success: true,
      message: 'Resource deleted successfully',
    })
  } catch (error: unknown) {
    console.error('Error deleting resource:', error)
    const message = error instanceof Error ? error.message : 'Failed to delete resource'
    return NextResponse.json(
      { 
        success: false,
        error: message 
      },
      { status: 500 }
    )
  }
}
```

**Key Points for DELETE Endpoints:**
- Always authenticate the user first
- Fetch the resource to verify it exists
- Check permissions (role-based + ownership)
- Return appropriate HTTP status codes (401, 403, 404, 500)
- Revalidate affected paths after deletion
- Use consistent error response format

### Adding Access Control

Create access function in `src/access/`:

```typescript
import { Access } from 'payload'

export const yourAccess: Access = ({ req: { user } }) => {
  if (!user) return false
  if (user.role === 'admin') return true
  
  return {
    institution: {
      equals: user.institution,
    },
  }
}
```

### Working with Hooks

Payload hooks allow you to run logic at specific points:

```typescript
// In your collection config
hooks: {
  beforeChange: [
    async ({ data, req }) => {
      // Modify data before saving
      data.updatedBy = req.user.id
      return data
    },
  ],
  afterChange: [
    async ({ doc, req }) => {
      // Run logic after saving
      console.log('Document saved:', doc.id)
    },
  ],
}
```

### Implementing Loading States

All action buttons should implement loading states to prevent duplicate submissions:

```typescript
const [isSubmitting, setIsSubmitting] = useState(false)

const handleSubmit = async () => {
  // Set loading state immediately
  setIsSubmitting(true)
  
  try {
    const result = await serverAction()
    
    if (result.success) {
      toast({ title: "Success!", description: result.message })
      // Keep loading state on success until redirect
      setTimeout(() => router.refresh(), 500)
    } else {
      toast({ title: "Error", description: result.message, variant: "destructive" })
      // Clear loading state on error
      setIsSubmitting(false)
    }
  } catch (error) {
    toast({ title: "Error", description: "An error occurred", variant: "destructive" })
    // Clear loading state on error
    setIsSubmitting(false)
  }
}

// Button with loading state
<Button onClick={handleSubmit} disabled={isSubmitting}>
  {isSubmitting ? 'Submitting...' : 'Submit'}
</Button>
```

**Loading State Rules:**
1. Set loading state immediately on button click (before async operation)
2. Disable all related buttons when any action is in progress
3. Clear loading state on error to allow retry
4. Keep loading state on success until page refresh
5. Show loading text ("Submitting...", "Saving...", etc.)

### Contributor Workflow Best Practices

When implementing contributor features, follow these patterns:

**1. Redirect After Actions**
```typescript
const handleSaveDraft = async () => {
  setSaveStatus('saving')
  try {
    const response = await fetch('/api/posts/create', {
      method: 'POST',
      body: JSON.stringify({ ...data, isDraft: true }),
    })
    
    if (response.ok) {
      toast({ title: 'Draft Saved', description: 'Your draft has been saved' })
      // Always redirect and refresh after successful save
      setTimeout(() => {
        router.push('/contributor/drafts')
        router.refresh()
      }, 1500)
    }
  } catch (error) {
    setSaveStatus('idle')
  }
}
```

**2. Organize Drafts by Status (Tabs)**
```typescript
// Categorize posts into tabs
const currentDrafts = drafts.filter(post => 
  post.reviewStatus === 'draft' && !post.editorFeedback
)
const requestingChangesPosts = drafts.filter(post => 
  post.reviewStatus === 'draft' && post.editorFeedback
)
const pendingReviewPosts = drafts.filter(post => 
  post.reviewStatus === 'pending_review'
)
```

**3. Fetch All Relevant Posts**
```typescript
// Include draft, rejected, and pending_review posts in query
const conditions: Where[] = [
  { authors: { equals: userId } },
  { 
    or: [
      { reviewStatus: { equals: 'draft' } },
      { reviewStatus: { equals: 'rejected' } },
      { reviewStatus: { equals: 'pending_review' } },
    ]
  },
]
```

**4. Access Control for Contributors**
```typescript
// Allow contributors to edit their own posts
export const contributorOwn: Access = ({ req: { user } }) => {
  if (!user) return false
  
  // Editors and admins have full access
  if (user.role === 'editor' || user.role === 'admin') {
    return true
  }
  
  // Contributors can only access their own content
  return {
    'authors.id': { equals: user.id },
  }
}

// Allow contributors to delete their own unpublished posts
export const contributorOwnNotPublished: Access = ({ req: { user }, data }) => {
  if (!user) return false
  
  // Editors and admins can delete everything
  if (user.role === 'editor' || user.role === 'admin') {
    return true
  }
  
  // Contributors cannot delete published posts
  if (data?._status === 'published') {
    return false
  }
  
  // Contributors can only delete their own content
  return {
    'authors.id': { equals: user.id },
  }
}
```

**5. Delete with Confirmation**
```typescript
const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
const [postToDelete, setPostToDelete] = useState<Post | null>(null)
const [isDeleting, setIsDeleting] = useState(false)

const handleDeleteClick = (post: Post) => {
  setPostToDelete(post)
  setDeleteDialogOpen(true)
}

const handleDeleteConfirm = async () => {
  if (!postToDelete) return
  
  setIsDeleting(true)
  try {
    const response = await fetch(`/api/posts/${postToDelete.id}`, {
      method: 'DELETE',
    })
    
    if (response.ok) {
      toast({ title: 'Success', description: 'Draft deleted successfully' })
      setDeleteDialogOpen(false)
      router.refresh()
    }
  } finally {
    setIsDeleting(false)
  }
}
```

**6. Horizontal Tabs Layout**
```typescript
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

<Tabs defaultValue="current" className="w-full">
  <TabsList className="grid w-full grid-cols-3">
    <TabsTrigger value="current">
      Current Drafts ({currentDrafts.length})
    </TabsTrigger>
    <TabsTrigger value="changes">
      Requesting Changes ({requestingChangesPosts.length})
    </TabsTrigger>
    <TabsTrigger value="pending">
      Pending Review ({pendingReviewPosts.length})
    </TabsTrigger>
  </TabsList>

  <TabsContent value="current">
    {/* Current drafts content */}
  </TabsContent>
  
  <TabsContent value="changes">
    {/* Requesting changes content */}
  </TabsContent>
  
  <TabsContent value="pending">
    {/* Pending review content */}
  </TabsContent>
</Tabs>
```

### Sending Emails

```typescript
import { sendEmail } from '@/utilities/sendEmail'

await sendEmail({
  to: 'user@example.com',
  subject: 'Welcome',
  html: '<p>Welcome to GCET Blog!</p>',
})
```

### Querying Collections

```typescript
import { getPayload } from 'payload'
import config from '@/payload.config'

const payload = await getPayload({ config })

// Find documents
const posts = await payload.find({
  collection: 'posts',
  where: {
    status: { equals: 'published' },
  },
  limit: 10,
})

// Find by ID
const post = await payload.findByID({
  collection: 'posts',
  id: 'post-id',
})

// Create document
const newPost = await payload.create({
  collection: 'posts',
  data: {
    title: 'New Post',
    content: 'Content here',
  },
})

// Update document
await payload.update({
  collection: 'posts',
  id: 'post-id',
  data: {
    title: 'Updated Title',
  },
})

// Delete document
await payload.delete({
  collection: 'posts',
  id: 'post-id',
})
```

## Testing

### Manual Testing Checklist

Before pushing changes:

- [ ] Test in development mode (`pnpm dev`)
- [ ] Test production build (`pnpm build && pnpm start`)
- [ ] Test all user roles (admin, editor, contributor, user)
- [ ] Test multi-tenant isolation
- [ ] Test on different screen sizes
- [ ] Check browser console for errors
- [ ] Verify database changes

### Testing User Roles

1. Create test users with different roles
2. Log in as each role
3. Verify access permissions
4. Test role-specific features

### Testing Multi-Tenant

1. Create multiple institutions
2. Create users for each institution
3. Verify data isolation
4. Test institution-specific branding

## Debugging

### Enable Debug Logging

Add to `.env`:
```env
DEBUG=payload:*
NODE_ENV=development
```

### Common Debug Points

1. **Access Control Issues**: Check `src/access/` files
2. **Hook Problems**: Add console.logs in hooks
3. **Query Issues**: Log the query object
4. **Build Errors**: Check TypeScript errors with `pnpm generate:types`

### Using Payload Local API

```typescript
// Direct database access (bypasses access control)
const payload = await getPayload({ config })
const result = await payload.find({
  collection: 'posts',
  overrideAccess: true, // Bypass access control
})
```

## Code Style

### TypeScript Best Practices

- Use explicit types for function parameters
- Avoid `any` type
- Use interfaces for object shapes
- Export types from collection configs

### Component Structure

```typescript
// Props interface
interface YourComponentProps {
  title: string
  onAction?: () => void
}

// Component
export function YourComponent({ title, onAction }: YourComponentProps) {
  return <div>{title}</div>
}
```

### File Naming

- Components: PascalCase (`UserProfile.tsx`)
- Utilities: camelCase (`formatDate.ts`)
- Collections: PascalCase (`Posts.ts`)
- Pages: lowercase (`page.tsx`, `layout.tsx`)

## Performance Tips

### Optimize Images

```typescript
import Image from 'next/image'

<Image
  src="/image.jpg"
  alt="Description"
  width={800}
  height={600}
  priority // For above-the-fold images
/>
```

### Use Server Components

```typescript
// app/posts/page.tsx
export default async function PostsPage() {
  // Fetch data directly in server component
  const posts = await fetchPosts()
  
  return <PostsList posts={posts} />
}
```

### Minimize Client Components

Only use `'use client'` when needed:
- Event handlers
- Browser APIs
- State management
- Effects

## Troubleshooting

### Build Fails

**Issue**: TypeScript errors during build

**Solution**:
```bash
pnpm generate:types
pnpm build
```

### Database Connection Issues

**Issue**: Cannot connect to MongoDB

**Solution**:
1. Check `DATABASE_URI` in `.env`
2. Verify MongoDB is running
3. Check network connectivity
4. Verify credentials

### Port Already in Use

**Issue**: Port 3000 is already in use

**Solution** (Windows):
```bash
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Module Not Found

**Issue**: Cannot find module errors

**Solution**:
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Payload Admin Not Loading

**Issue**: Admin panel shows blank page

**Solution**:
1. Clear browser cache
2. Check browser console for errors
3. Verify `PAYLOAD_SECRET` is set
4. Run `pnpm generate:importmap`

### Images Not Loading

**Issue**: Images return 404

**Solution**:
1. Check Cloudinary credentials in `.env`
2. Verify image URLs in database
3. Check Next.js image configuration

### Email Not Sending

**Issue**: Emails not being delivered

**Solution**:
1. Check SMTP credentials in `.env`
2. Verify SendGrid API key
3. Check spam folder
4. Review email logs

### Slow Queries

**Issue**: Database queries are slow

**Solution**:
1. Add indexes to frequently queried fields
2. Use `select` to limit returned fields
3. Implement pagination
4. Cache results when appropriate

### Memory Issues

**Issue**: Out of memory during build

**Solution**:
```bash
# Increase Node.js memory
NODE_OPTIONS="--max-old-space-size=4096" pnpm build
```

## Environment Variables

### Required for Development

```env
DATABASE_URI=mongodb://localhost:27017/gcet-blog
PAYLOAD_SECRET=your-secret-key-min-32-chars
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
```

### Optional for Development

```env
# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# OAuth
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

### Production Only

```env
# Vercel
VERCEL_URL=your-app.vercel.app
CRON_SECRET=your-cron-secret

# Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your-analytics-id
```

## Useful Commands

```bash
# Development
pnpm dev                    # Start dev server
pnpm build                  # Build for production
pnpm start                  # Start production server

# Code Quality
pnpm lint                   # Run linter
pnpm lint:fix              # Fix linting issues

# Payload
pnpm generate:types        # Generate TypeScript types
pnpm generate:importmap    # Generate import map
pnpm payload               # Payload CLI

# Database
pnpm seed:posts            # Seed sample posts
pnpm test:contributor      # Create test contributor workflow data
```

### Testing Contributor Workflow

To test the contributor workflow with editor feedback and requesting changes:

```bash
pnpm run test:contributor
```

This script will:
1. Create an editor user: `editor@gcet.edu.in` / `editor123`
2. Create a contributor user: `contributor@gcet.edu.in` / `contributor123`
3. Create a post with `requesting_changes` status (with editor feedback)
4. Create a post with `pending_review` status

After running the script:
1. Login as contributor: `contributor@gcet.edu.in` / `contributor123`
2. Go to `/contributor/drafts`
3. Check "Requesting Changes" tab - should show 1 post with feedback
4. Check "Pending Review" tab - should show 1 post
5. Click Edit to modify the post
6. Click Preview to view the post in draft mode
7. Verify you can delete the post

## Getting Help

1. Check this documentation
2. Review [Payload CMS docs](https://payloadcms.com/docs)
3. Review [Next.js docs](https://nextjs.org/docs)
4. Check existing code for examples
5. Contact the development team

---

**Last Updated**: 2026-04-05  
**Maintained By**: GCET Development Team

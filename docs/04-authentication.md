# Authentication System

## 🔐 Overview

The authentication system uses Payload CMS's built-in authentication with custom enhancements for role-based access control and Next.js integration.

## 🎯 Authentication Flow

### Login Process

```
1. User visits /login
   ↓
2. LoginForm renders (client component)
   ↓
3. User enters credentials
   ↓
4. Form calls loginAction (server action)
   ↓
5. Server validates credentials with Payload
   ↓
6. Payload generates JWT token
   ↓
7. Token stored in HTTP-only cookie
   ↓
8. Server returns success with redirect path
   ↓
9. Client redirects to dashboard/editor/admin
   ↓
10. UserProvider fetches user data
   ↓
11. Header updates to show user info
```

### Code Walkthrough

**Step 1-2: Login Page**
```typescript
// src/app/(auth)/login/page.tsx
export default async function LoginPage() {
  // Check if already logged in
  const user = await getCurrentUser()
  
  if (user) {
    // Redirect based on role
    redirect(user.role === 'admin' ? '/admin' : '/dashboard')
  }
  
  return <LoginForm />
}
```

**Step 3-4: Form Submission**
```typescript
// src/app/(auth)/login/LoginForm.tsx
'use client'

async function handleSubmit(formData: FormData) {
  const result = await loginAction(formData)
  
  if (result?.error) {
    setMessage({ type: 'error', text: result.error })
  } else if (result?.success) {
    router.push(result.redirectPath)
  }
}
```

**Step 5-8: Server Action**
```typescript
// src/app/(auth)/login/actions.ts
'use server'

export async function loginAction(formData: FormData) {
  const payload = await getPayload({ config })
  
  // Authenticate with Payload
  const result = await payload.login({
    collection: 'users',
    data: { email, password },
  })
  
  if (result.token) {
    // Set HTTP-only cookie
    cookies().set('payload-token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })
    
    // Return redirect path based on role
    const redirectPath = result.user.role === 'admin' ? '/admin' :
                        result.user.role === 'editor' ? '/editor' :
                        '/dashboard'
    
    return { success: true, redirectPath }
  }
  
  return { error: 'Invalid credentials' }
}
```

**Step 9-11: Client-Side State**
```typescript
// src/providers/User/index.tsx
export function UserProvider({ children }) {
  const [user, setUser] = useState(null)
  
  useEffect(() => {
    // Fetch user on mount
    fetchUser()
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchUser, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])
  
  // Also refresh when navigating to protected routes
  useEffect(() => {
    if (pathname.startsWith('/dashboard') || 
        pathname.startsWith('/editor') ||
        pathname.startsWith('/admin')) {
      fetchUser()
    }
  }, [pathname])
  
  const fetchUser = async () => {
    const response = await fetch('/api/users/me')
    if (response.ok) {
      const data = await response.json()
      setUser(data.user)
    }
  }
  
  return (
    <UserContext.Provider value={{ user, loading, refreshUser, clearUser }}>
      {children}
    </UserContext.Provider>
  )
}
```

## 🚪 Logout Process

### Flow

```
1. User clicks Logout button
   ↓
2. LogoutButton calls clearUser() (immediate UI update)
   ↓
3. POST /api/auth/logout
   ↓
4. Server deletes payload-token cookie
   ↓
5. Redirect to /login
   ↓
6. UserProvider detects auth page, doesn't fetch
```

### Code

**Client-Side**
```typescript
// src/components/LogoutButton/index.tsx
'use client'

export default function LogoutButton() {
  const { clearUser } = useUser()
  const router = useRouter()
  
  const handleLogout = async () => {
    // Immediate UI update
    clearUser()
    
    // Clear session on server
    await fetch('/api/auth/logout', { method: 'POST' })
    
    // Redirect to login
    router.push('/login')
  }
  
  return <button onClick={handleLogout}>Logout</button>
}
```

**Server-Side**
```typescript
// src/app/api/auth/logout/route.ts
export async function POST() {
  const cookieStore = await cookies()
  cookieStore.delete('payload-token')
  
  return Response.json({ success: true })
}
```

## 🔒 Authorization (Role-Based Access)

### User Roles

```typescript
type UserRole = 'contributor' | 'editor' | 'admin'
```

**Contributor**
- Can create and edit own posts
- Can upload media
- Can comment on posts
- Access: `/dashboard`

**Editor**
- All Contributor permissions
- Can edit and publish any post
- Can manage categories
- Can moderate comments
- Access: `/editor`

**Admin**
- All Editor permissions
- Can manage users
- Can access system settings
- Full Payload CMS access
- Access: `/admin`

### Middleware Protection

```typescript
// src/middleware.ts
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Get user from token
  const user = await getUserFromToken(request)
  
  // Protect dashboard routes
  if (pathname.startsWith('/dashboard')) {
    if (!user) return redirectToLogin(request)
    // All authenticated users allowed
  }
  
  // Protect editor routes
  if (pathname.startsWith('/editor')) {
    if (!user) return redirectToLogin(request)
    if (!['editor', 'admin'].includes(user.role)) {
      return redirectToDashboard(request)
    }
  }
  
  // Protect admin routes (also protected by Payload)
  if (pathname.startsWith('/admin')) {
    if (!user) return redirectToLogin(request)
    if (user.role !== 'admin') {
      return redirectToDashboard(request)
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/editor/:path*', '/admin/:path*']
}
```

### Collection-Level Access

```typescript
// Example: src/collections/Posts.ts
{
  access: {
    // Anyone can read published posts
    read: ({ req: { user } }) => {
      if (!user) return { status: { equals: 'published' } }
      return true // Logged in users see all
    },
    
    // Only authenticated users can create
    create: ({ req: { user } }) => !!user,
    
    // Only post creator can update (unless editor/admin)
    update: ({ req: { user } }) => {
      if (!user) return false
      if (['editor', 'admin'].includes(user.role)) return true
      return {
        author: { equals: user.id }
      }
    },
    
    // Only editors and admins can delete
    delete: ({ req: { user } }) => {
      if (!user) return false
      return ['editor', 'admin'].includes(user.role)
    },
  }
}
```

## 🔑 Token Management

### Cookie Configuration

```typescript
{
  name: 'payload-token',
  httpOnly: true,              // Not accessible via JavaScript
  secure: production,          // HTTPS only in production
  sameSite: 'lax',            // CSRF protection
  path: '/',                  // Available to all routes
  maxAge: 60 * 60 * 24 * 7,  // 7 days
}
```

### Token Validation

**On Every Request:**
```typescript
// Middleware extracts token from cookie
const token = request.cookies.get('payload-token')

// Payload validates token
const { user } = await payload.auth({ headers })

// If invalid, user is null
```

**On Protected API Routes:**
```typescript
// src/app/api/users/me/route.ts
export async function GET(request: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: request.headers })
  
  if (!user) {
    return Response.json(
      { error: 'Unauthorized', sessionExpired: true },
      { status: 401 }
    )
  }
  
  return Response.json({ user })
}
```

### Session Expiration

```typescript
// UserProvider detects expired sessions
const fetchUser = async () => {
  const response = await fetch('/api/users/me')
  
  if (response.status === 401) {
    const data = await response.json()
    
    if (data.sessionExpired) {
      setUser(null)
      router.push('/login?message=Your session has expired')
    }
  }
}
```

## 🎭 Client-Side Auth State

### UserContext Pattern

```typescript
// Provider in src/providers/User/index.tsx
interface UserContextType {
  user: User | null
  loading: boolean
  refreshUser: () => Promise<void>
  clearUser: () => void
}

// Hook for consuming
const { user, loading } = useUser()
```

### Usage Examples

**In Header:**
```typescript
// src/components/Header/AuthButton.tsx
export default function AuthButton() {
  const { user, loading } = useUser()
  
  if (loading) return <Skeleton />
  
  if (user) {
    const dashboardUrl = user.role === 'admin' ? '/admin' :
                        user.role === 'editor' ? '/editor' :
                        '/dashboard'
    
    return (
      <>
        <Link href={dashboardUrl}>Dashboard</Link>
        <LogoutButton />
      </>
    )
  }
  
  return <Link href="/login">Sign In</Link>
}
```

**In Protected Page:**
```typescript
// Any component
'use client'

export default function MyComponent() {
  const { user } = useUser()
  
  if (!user) return <div>Please log in</div>
  
  return <div>Welcome, {user.name}!</div>
}
```

## 🛡️ Security Best Practices

### Implemented

✅ **HTTP-Only Cookies** - Tokens not accessible to JavaScript
✅ **Secure Flag** - HTTPS only in production
✅ **SameSite Protection** - Prevents CSRF attacks
✅ **Server-Side Validation** - Never trust client
✅ **Role-Based Access Control** - Multiple permission layers
✅ **Token Expiration** - 7-day maximum lifetime
✅ **Password Hashing** - Handled by Payload CMS
✅ **Input Validation** - Server-side validation on all inputs

### Additional Recommendations

🔒 **Rate Limiting** - Add to login endpoint
🔒 **2FA** - Implement for admin accounts
🔒 **Audit Logging** - Already implemented via AdminLogs
🔒 **Password Reset** - Add secure reset flow
🔒 **Email Verification** - Verify email on registration

## 🚧 Planned Features

### Account Management Pages

**Contributor Account** (`/dashboard/account`)
```typescript
// Planned features:
- Edit name, email
- Change password
- Profile picture upload
- Notification preferences
- View own post statistics
- Delete account option
```

**Editor Account** (`/editor/account`)
```typescript
// Planned features:
- All contributor features
- Editor-specific preferences
- Moderation settings
- Review queue preferences
- Content workflow settings
```

**Admin Account** (`/admin/account`)
```typescript
// Will be within Payload admin panel:
- System-wide settings
- User management access
- Security settings
- Backup/restore options
```

### Implementation Guide

When implementing account pages:

1. **Create Route**
   ```
   src/app/(frontend)/dashboard/account/page.tsx
   src/app/(frontend)/editor/account/page.tsx
   ```

2. **Add to Navigation**
   ```typescript
   // In Dashboard/Editor layout or header
   <Link href="/dashboard/account">Account Settings</Link>
   ```

3. **Create Server Actions**
   ```typescript
   // src/app/(frontend)/dashboard/account/actions.ts
   'use server'
   
   export async function updateProfileAction(formData: FormData) {
     // Validate user
     // Update in Payload
     // Revalidate cache
   }
   ```

4. **Build UI Components**
   ```tsx
   - ProfileForm (edit name, email)
   - PasswordChangeForm
   - PreferencesForm
   - DeleteAccountButton
   ```

## 🔄 Auth State Lifecycle

```
Application Load
  ↓
UserProvider mounts
  ↓
Fetches /api/users/me
  ↓
  ├── 200: User logged in → Set user state
  └── 401: Not logged in → user remains null
  ↓
Components react to user state
  ↓
Every 5 minutes: Refresh user data
  ↓
On navigation to protected route: Refresh user
  ↓
On logout: Clear user state + delete cookie
```

## 📚 Related Files

**Core Authentication:**
- `src/app/(auth)/login/actions.ts` - Login/logout logic
- `src/providers/User/index.tsx` - Client auth state
- `src/middleware.ts` - Route protection
- `src/app/api/users/me/route.ts` - User endpoint

**Access Control:**
- `src/access/*.ts` - Collection access functions
- `src/collections/Users.ts` - User schema and roles

**UI Components:**
- `src/app/(auth)/login/LoginForm.tsx` - Login UI
- `src/components/Header/AuthButton.tsx` - Auth button
- `src/components/LogoutButton/index.tsx` - Logout UI

---

Next: [Route Groups →](./05-route-groups.md)

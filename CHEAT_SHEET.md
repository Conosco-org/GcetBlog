# 🎯 GCET Blog Cheat Sheet

Quick reference for common tasks and locations.

---

## 📍 File Locations

| What | Where |
|------|-------|
| **Collections** (Data models) | `src/collections/` |
| **Access Control** (Permissions) | `src/access/` |
| **Pages** (Routes) | `src/app/(frontend)/` |
| **Blocks** (Page sections) | `src/blocks/` |
| **Components** (UI) | `src/components/` |
| **Config** (Main) | `src/payload.config.ts` |
| **Types** (Auto-generated) | `src/payload-types.ts` |

---

## 🔑 Key Collections

| Collection | File | Purpose |
|------------|------|---------|
| **Users** | `src/collections/Users/index.ts` | User accounts & auth |
| **Posts** | `src/collections/Posts/index.ts` | Blog posts |
| **Pages** | `src/collections/Pages/index.ts` | Static pages |
| **Media** | `src/collections/Media.ts` | Images & files |
| **Categories** | `src/collections/Categories.ts` | Post categories |
| **Comments** | `src/collections/Comments/index.ts` | User comments |

---

## 👥 User Roles (in order of power)

```
Admin > Editor > Contributor
```

| Role | Can Do |
|------|--------|
| **Admin** | Everything |
| **Editor** | Publish posts, give feedback |
| **Contributor** | Create drafts only |

---

## 🔐 Access Control Functions

| Function | File | Purpose |
|----------|------|---------|
| `authenticated` | `src/access/authenticated.ts` | Require login |
| `authenticatedOrPublished` | `src/access/authenticatedOrPublished.ts` | Login OR public |
| `adminOnly` | `src/access/adminOnly.ts` | Admin only |
| `editorOrAdmin` | `src/access/editorOrAdmin.ts` | Editor/Admin |
| `adminOrSelf` | `src/access/adminOrSelf.ts` | Admin or own data |
| `anyone` | `src/access/anyone.ts` | No restrictions |

---

## 🧱 Available Blocks

| Block | File | Use For |
|-------|------|---------|
| **Content** | `src/blocks/Content/` | Text columns |
| **Media** | `src/blocks/MediaBlock/` | Images/videos |
| **Call To Action** | `src/blocks/CallToAction/` | CTA buttons |
| **Archive** | `src/blocks/ArchiveBlock/` | Post listings |
| **Form** | `src/blocks/Form/` | Forms |
| **Code** | `src/blocks/Code/` | Code snippets |
| **Banner** | `src/blocks/Banner/` | Announcements |

---

## 💻 Common Commands

```bash
# Development
pnpm dev                  # Start dev server
pnpm build                # Build for production
pnpm start                # Start production server

# Code Quality
pnpm lint                 # Run linter
pnpm lint:fix             # Fix linting issues

# Payload
pnpm generate:types       # Generate TypeScript types
pnpm generate:importmap   # Generate import map

# Testing
pnpm test                 # Run all tests
pnpm test:int             # Integration tests
pnpm test:e2e             # End-to-end tests
```

---

## 🔖 What is a Slug?

```
Title: "Hello World"  →  Slug: "hello-world"  →  URL: /hello-world
```

- Auto-generated from titles
- Lowercase, hyphenated
- No special characters
- SEO-friendly URLs

---

## 🛣️ URL Routing

| URL | File | Purpose |
|-----|------|---------|
| `/` | `src/app/(frontend)/page.tsx` | Homepage |
| `/posts` | `src/app/(frontend)/posts/page.tsx` | All posts |
| `/posts/[slug]` | `src/app/(frontend)/posts/[slug]/page.tsx` | Individual post |
| `/[slug]` | `src/app/(frontend)/[slug]/page.tsx` | Dynamic pages |
| `/admin` | Auto-generated | Admin panel |

---

## ✏️ Quick Edits

### Change Who Can Create Posts

```typescript
// src/collections/Posts/index.ts
access: {
  create: editorOrAdmin,  // Change this line
}
```

### Add Field to Collection

```typescript
// Add to fields array
{
  name: 'myField',
  type: 'text',
  required: true,
}
```

### Add New Role

```typescript
// src/collections/Users/index.ts
{
  name: 'role',
  options: [
    { label: 'Contributor', value: 'contributor' },
    { label: 'Editor', value: 'editor' },
    { label: 'Admin', value: 'admin' },
  ],
}
```

### Create Static Page

```typescript
// src/app/(frontend)/my-page/page.tsx
export default function MyPage() {
  return <div>My content</div>
}
```

---

## 🎨 Field Types Reference

| Type | Use For | Example |
|------|---------|---------|
| `text` | Short text | Title, name |
| `textarea` | Long text | Description, bio |
| `richText` | Formatted text | Post content |
| `number` | Numbers | Age, count |
| `email` | Email address | User email |
| `date` | Date/time | Published date |
| `checkbox` | Yes/no | Is published |
| `select` | Dropdown | Role, category |
| `upload` | Files | Images, PDFs |
| `relationship` | Link to other collection | Author, category |
| `array` | List of items | Tags, features |
| `group` | Grouped fields | Address, settings |
| `blocks` | Layout builder | Page content |

---

## 🔍 Finding Things

### Find Collection Config
```
src/collections/[CollectionName]/index.ts
```

### Find Access Control
```
src/access/[functionName].ts
```

### Find Block Config
```
src/blocks/[BlockName]/config.ts
```

### Find Block Component
```
src/blocks/[BlockName]/Component.tsx
```

### Find Page Route
```
src/app/(frontend)/[route]/page.tsx
```

---

## 🆘 Common Issues

### "Module not found"
```bash
pnpm install
pnpm generate:types
```

### "Permission denied"
- Check access control functions
- Verify user role

### "Slug already exists"
- Change the slug field
- Make it unique

### Changes not showing
```bash
# Restart dev server
Ctrl+C
pnpm dev
```

### TypeScript errors
```bash
pnpm generate:types
```

---

## 📚 More Help

- **Full Guide**: [CODEBASE_GUIDE.md](./CODEBASE_GUIDE.md)
- **Quick Start**: [QUICK_START.md](./QUICK_START.md)
- **Architecture**: [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Index**: [DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md)

---

## 🎯 Quick Tasks

| I want to... | Go to... |
|--------------|----------|
| Create a page | Admin panel → Pages → Create |
| Create a post | Admin panel → Posts → Create |
| Upload image | Admin panel → Media → Upload |
| Change permissions | `src/collections/[Name]/index.ts` |
| Add a block | `src/blocks/[NewBlock]/` |
| Add a field | `src/collections/[Name]/index.ts` → fields |
| Add a role | `src/collections/Users/index.ts` |
| Create route | `src/app/(frontend)/[route]/page.tsx` |

---

**Print this page and keep it handy!** 📌

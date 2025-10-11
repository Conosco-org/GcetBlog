# 🚀 Quick Start Guide

> **5-minute overview** to get you started with GCET Blog

For the complete guide, see [CODEBASE_GUIDE.md](./CODEBASE_GUIDE.md)

---

## 📖 What You Need to Know

### 1. What is a Slug? 🔖

A **slug** is the URL-friendly part of a web address.

```
Title: "My First Post"  →  Slug: "my-first-post"  →  URL: /posts/my-first-post
```

- Automatically generated from titles
- Lowercase, hyphenated, no special characters
- Used for SEO-friendly URLs

---

## 🗂️ Project Structure (5 Key Folders)

```
src/
├── collections/     → Your data (Users, Posts, Pages)
├── access/          → Who can do what (permissions)
├── app/             → Website pages & routes
├── blocks/          → Reusable page sections
└── components/      → UI elements
```

---

## 👥 User Roles

```
Admin       → Can do everything (manage users, delete content)
   ↓
Editor      → Can publish & edit content, give feedback
   ↓
Contributor → Can create drafts (needs editor approval)
```

---

## 🎨 How Pages Work

### Method 1: Admin Panel (No Code!)

1. Go to `http://localhost:3000/admin`
2. Click "Pages" → "Create New"
3. Add title (slug auto-generates)
4. Drag & drop content blocks
5. Save & Publish

**Result**: Your page is live at `/your-slug`

### Method 2: Code a Page

Create file: `src/app/(frontend)/pricing/page.tsx`

```typescript
export default function PricingPage() {
  return <div>Your content here</div>
}
```

**Result**: Page is live at `/pricing`

---

## 🧱 Content Blocks

Think of blocks as **LEGO pieces** for your pages:

- **Content Block**: Text columns
- **Media Block**: Images/videos
- **CTA Block**: Call-to-action buttons
- **Archive Block**: List of posts
- **Form Block**: Contact forms

**How to use**: In the admin panel, click "Add Block" when editing a page.

---

## 🔐 Modifying Permissions

**Example**: Only let Editors create posts

File: `src/collections/Posts/index.ts`

```typescript
import { editorOrAdmin } from '../../access/editorOrAdmin'

export const Posts: CollectionConfig = {
  access: {
    create: editorOrAdmin,  // Change this line
  },
}
```

Restart server: `pnpm dev`

---

## 💻 Essential Commands

```bash
# Start development
pnpm dev

# Build for production
pnpm build

# Run linter
pnpm lint

# Generate TypeScript types
pnpm generate:types
```

---

## 🎯 Common Tasks

### Add a New Field to Posts

Edit: `src/collections/Posts/index.ts`

```typescript
fields: [
  // ... existing fields
  {
    name: 'readTime',
    type: 'number',
    admin: {
      description: 'Estimated reading time in minutes',
    },
  },
]
```

### Create a New Block

1. Create folder: `src/blocks/MyBlock/`
2. Add `config.ts` (defines fields)
3. Add `Component.tsx` (defines display)
4. Register in `src/collections/Pages/index.ts`

### Add a New Role

Edit: `src/collections/Users/index.ts`

```typescript
{
  name: 'role',
  options: [
    { label: 'Contributor', value: 'contributor' },
    { label: 'Moderator', value: 'moderator' }, // NEW
    { label: 'Editor', value: 'editor' },
    { label: 'Admin', value: 'admin' },
  ],
}
```

---

## 📚 Key Concepts

| Concept | What It Is | Where to Find |
|---------|-----------|---------------|
| **Collections** | Data models (like database tables) | `src/collections/` |
| **Access Control** | Permission rules | `src/access/` |
| **Blocks** | Reusable page sections | `src/blocks/` |
| **Slugs** | URL-friendly names | Auto-generated from titles |
| **Routes** | Website pages | `src/app/(frontend)/` |

---

## 🆘 Need Help?

1. **Full Guide**: [CODEBASE_GUIDE.md](./CODEBASE_GUIDE.md) - Comprehensive documentation
2. **README**: [README.md](./README.md) - Setup and deployment
3. **Payload Docs**: https://payloadcms.com/docs
4. **Next.js Docs**: https://nextjs.org/docs

---

## ✅ Quick Checklist for Beginners

- [ ] Read what a "slug" is (above)
- [ ] Understand the 3 user roles
- [ ] Log into admin panel at `/admin`
- [ ] Create a test page via admin panel
- [ ] Look at `src/collections/Pages/index.ts`
- [ ] Look at `src/collections/Posts/index.ts`
- [ ] Try modifying a permission
- [ ] Read the full CODEBASE_GUIDE.md

---

**Ready to dive deeper?** Open [CODEBASE_GUIDE.md](./CODEBASE_GUIDE.md) for the complete guide!

Happy coding! 🎉

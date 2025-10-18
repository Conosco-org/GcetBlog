# Documentation Index & Glossary

## 📚 Complete Documentation Index

### Getting Started
- **[README](./README.md)** - Documentation overview and navigation
- **[Quick Reference](./QUICK-REFERENCE.md)** - Fast lookup guide for common tasks
- **[Project Overview](./01-project-overview.md)** - What GCET Blog is and key features

### Core Concepts
- **[Architecture](./02-architecture.md)** - System design and patterns
- **[Folder Structure](./03-folder-structure.md)** - Complete codebase organization
- **[Authentication System](./04-authentication.md)** - How auth and security work
- **[Route Groups](./05-route-groups.md)** - Next.js routing explained

### Development
- **[Development Workflow](./11-development.md)** - How to build features
- **[Future Roadmap](./12-roadmap.md)** - Planned features and timeline

---

## 🔤 Glossary of Terms

### A

**Access Control** - System that determines who can view, create, edit, or delete content. Implemented at collection level in Payload CMS.

**Admin** - Highest user role with full system access including user management.

**API Route** - Server-side endpoint in `/api` folder that handles HTTP requests.

**App Router** - Next.js 13+ routing system using the `app/` directory.

### B

**Build** - Process of compiling the application for production deployment.

### C

**Client Component** - React component marked with `'use client'` that runs in the browser and can use hooks.

**Collection** - Payload CMS data structure similar to a database table (e.g., Posts, Users).

**Contributor** - Basic user role that can create and manage their own posts.

**Cookie** - Small piece of data stored in browser, used for authentication via `payload-token`.

**Context** - React pattern for sharing data across components without prop drilling.

### D

**Dashboard** - User interface for managing content, accessible at `/dashboard`, `/editor`, or `/admin`.

**Dynamic Route** - Route with variable segments like `/posts/[slug]`.

### E

**Editor** - User role with elevated permissions to review and publish any post.

**Environment Variable** - Configuration value stored in `.env` file, not committed to git.

### F

**Frontend** - Public-facing part of the website visible to all users.

### G

**Globals** - Payload CMS feature for site-wide settings like header/footer content.

### H

**Hook** - React feature for adding state and effects to components (e.g., `useState`, `useEffect`).

**HTTP-Only Cookie** - Secure cookie that JavaScript cannot access, used for auth tokens.

**Hydration** - Process of making server-rendered HTML interactive in the browser.

### I

**ISR** - Incremental Static Regeneration, Next.js feature for updating static pages.

### J

**JWT** - JSON Web Token, used by Payload for authentication.

### L

**Layout** - React component that wraps pages, providing consistent UI elements.

**Lexical** - Rich text editor used in Payload CMS.

### M

**Metadata** - SEO information like title, description exported from page components.

**Middleware** - Code that runs before requests to handle auth, redirects, etc.

**MongoDB** - NoSQL database used by Payload CMS.

### N

**Next.js** - React framework used for this application.

### O

**ORM** - Object-Relational Mapping, Payload's abstraction over MongoDB.

### P

**Payload CMS** - Headless CMS system used for content management.

**Protected Route** - Route that requires authentication to access.

**Provider** - React Context provider component that supplies data to children.

### R

**Revalidation** - Process of refreshing cached data in Next.js.

**Role** - User permission level (contributor, editor, admin).

**Route Group** - Folder in parentheses like `(frontend)` for organizing routes without affecting URLs.

**RSC** - React Server Components, components that run only on the server.

### S

**Sanitation** - Process of cleaning user input to prevent security issues.

**Schema** - Structure definition for data in Payload collections.

**Server Action** - Function marked with `'use server'` for server-side logic called from client.

**Server Component** - React component that runs on the server (default in Next.js 13+).

**Session** - Period of authenticated access, maintained via cookies.

**shadcn/ui** - Component library used for UI elements.

**Slug** - URL-friendly identifier (e.g., "my-post-title" from "My Post Title").

**SSR** - Server-Side Rendering, generating HTML on the server.

### T

**Tailwind CSS** - Utility-first CSS framework used for styling.

**Token** - Encrypted string used for authentication (JWT).

**TypeScript** - Typed superset of JavaScript used throughout the project.

### U

**User Context** - React Context providing current user data across the app.

### V

**Validation** - Checking data meets required format and constraints.

### W

**Webhook** - HTTP callback triggered by events in Payload CMS.

---

## 📖 Topic Index

### Authentication & Security
- Login flow → [Authentication](./04-authentication.md#authentication-flow)
- Logout process → [Authentication](./04-authentication.md#logout-process)
- Role-based access → [Authentication](./04-authentication.md#authorization)
- Middleware protection → [Authentication](./04-authentication.md#middleware-protection)
- Token management → [Authentication](./04-authentication.md#token-management)
- Security best practices → [Authentication](./04-authentication.md#security-best-practices)

### Routing
- Route groups explained → [Route Groups](./05-route-groups.md)
- Adding new pages → [Route Groups](./05-route-groups.md#adding-new-routes)
- Protected routes → [Route Groups](./05-route-groups.md#route-protection-summary)
- URL structure → [Route Groups](./05-route-groups.md#route-resolution)

### Components
- Server vs Client → [Architecture](./02-architecture.md#presentation-layer)
- Creating components → [Development](./11-development.md#adding-a-new-component)
- Component hierarchy → [Architecture](./02-architecture.md#component-hierarchy)
- UI components → [Folder Structure](./03-folder-structure.md#srccomponents---react-components)

### Data Management
- Payload collections → [Folder Structure](./03-folder-structure.md#srccollections---payload-collections)
- Access control → [Folder Structure](./03-folder-structure.md#srcaccess---access-control)
- Server actions → [Development](./11-development.md#adding-a-server-action)
- API routes → [Development](./11-development.md#adding-api-route)

### State Management
- UserContext → [Architecture](./02-architecture.md#state-management)
- React Context → [Folder Structure](./03-folder-structure.md#srcproviders---context-providers)
- Client state → [Authentication](./04-authentication.md#client-side-auth-state)

### Development
- Setup → [Development](./11-development.md#initial-setup)
- Common tasks → [Development](./11-development.md#common-development-tasks)
- Debugging → [Development](./11-development.md#debugging)
- Testing → [Development](./11-development.md#testing)
- Deployment → [Development](./11-development.md#deployment)

### Future Features
- Account management → [Roadmap](./12-roadmap.md#phase-1-account-management)
- Email system → [Roadmap](./12-roadmap.md#phase-2-email-system)
- Analytics → [Roadmap](./12-roadmap.md#phase-4-analytics--insights)
- Collaboration → [Roadmap](./12-roadmap.md#phase-5-collaboration-features)

---

## 🗺️ File Location Quick Lookup

| What You Need | Where to Find It |
|--------------|------------------|
| Homepage | `src/app/(frontend)/page.tsx` |
| Login page | `src/app/(auth)/login/page.tsx` |
| Dashboard | `src/app/(frontend)/dashboard/page.tsx` |
| Post page | `src/app/(frontend)/posts/[slug]/page.tsx` |
| Header | `src/components/Header/Component.tsx` |
| Footer | `src/Footer/Component.tsx` |
| User context | `src/providers/User/index.tsx` |
| Middleware | `src/middleware.ts` |
| User collection | `src/collections/Users.ts` |
| Post collection | `src/collections/Posts.ts` |
| Login action | `src/app/(auth)/login/actions.ts` |
| User API | `src/app/api/users/me/route.ts` |
| Payload config | `src/payload.config.ts` |
| Access controls | `src/access/*.ts` |
| UI components | `src/components/ui/*.tsx` |
| Utilities | `src/utilities/*.ts` |

---

## 🔗 External Resources

### Official Documentation
- [Next.js Documentation](https://nextjs.org/docs) - Framework docs
- [Payload CMS Documentation](https://payloadcms.com/docs) - CMS docs
- [React Documentation](https://react.dev) - React docs
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) - Styling docs
- [TypeScript Documentation](https://www.typescriptlang.org/docs) - TypeScript docs

### Component Libraries
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Lucide Icons](https://lucide.dev/) - Icon library
- [Radix UI](https://www.radix-ui.com/) - Primitives (used by shadcn)

### Tools
- [MongoDB Documentation](https://docs.mongodb.com/) - Database docs
- [Docker Documentation](https://docs.docker.com/) - Containerization
- [Vercel Documentation](https://vercel.com/docs) - Deployment platform

### Learning Resources
- [Next.js Learn](https://nextjs.org/learn) - Interactive tutorial
- [React Server Components](https://react.dev/reference/rsc/server-components) - RSC guide
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html) - TS guide

---

## 🎯 Common Scenarios

### "I want to add a new page"
→ See [Route Groups - Adding New Routes](./05-route-groups.md#adding-new-routes)

### "I want to create a protected route"
→ See [Development - Protecting a Route](./11-development.md#protecting-a-route)

### "I want to add a new data collection"
→ See [Development - Adding a New Payload Collection](./11-development.md#adding-a-new-payload-collection)

### "I want to understand authentication"
→ See [Authentication System](./04-authentication.md)

### "I want to add a form with server action"
→ See [Development - Adding a Server Action](./11-development.md#adding-a-server-action)

### "I want to access current user"
→ See [Quick Reference - Using UserContext](./QUICK-REFERENCE.md#using-usercontext)

### "I want to understand the folder structure"
→ See [Folder Structure](./03-folder-structure.md)

### "I want to implement account management"
→ See [Roadmap - Account Management](./12-roadmap.md#contributor-account-page)

### "I'm getting TypeScript errors"
→ See [Development - Troubleshooting](./11-development.md#troubleshooting)

### "I want to deploy the app"
→ See [Development - Deployment](./11-development.md#deployment)

---

## 📋 Checklists

### Before Starting Development
- [ ] Read [Project Overview](./01-project-overview.md)
- [ ] Understand [Architecture](./02-architecture.md)
- [ ] Setup development environment ([Development](./11-development.md#initial-setup))
- [ ] Bookmark [Quick Reference](./QUICK-REFERENCE.md)

### Before Adding a Feature
- [ ] Check if feature is in [Roadmap](./12-roadmap.md)
- [ ] Understand relevant architecture patterns
- [ ] Plan component structure
- [ ] Identify affected files
- [ ] Write tests

### Before Submitting PR
- [ ] Code follows project patterns
- [ ] Tests pass (`npm run test`)
- [ ] No linting errors (`npm run lint`)
- [ ] Documentation updated
- [ ] Commit messages follow conventions

---

## 🆘 Getting Help

### Self-Help
1. Check [Quick Reference](./QUICK-REFERENCE.md)
2. Search this documentation
3. Read relevant sections in detail
4. Check [Troubleshooting](./11-development.md#troubleshooting)

### Community Help
1. Search [GitHub Issues](https://github.com/Conosco-org/GcetBlog/issues)
2. Ask in [GitHub Discussions](https://github.com/Conosco-org/GcetBlog/discussions)
3. Create a new issue with `[Question]` tag

### Reporting Issues
1. Check if already reported
2. Provide clear description
3. Include reproduction steps
4. Share error messages/screenshots
5. Mention your environment

---

**Last Updated:** October 18, 2025

This documentation is continuously improved. If you find something unclear or missing, please contribute by updating the docs!

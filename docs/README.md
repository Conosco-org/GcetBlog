# GCET Blog Documentation

Welcome to the GCET Blog documentation! This comprehensive guide will help you understand the entire codebase structure, architecture, and how to work with the project.

## 📚 Documentation Structure

This documentation is organized into the following sections:

### Core Documentation
1. **[Project Overview](./01-project-overview.md)** - High-level overview of the project, tech stack, and features
2. **[Architecture](./02-architecture.md)** - System architecture, design patterns, and layers
3. **[Folder Structure](./03-folder-structure.md)** - Detailed explanation of every directory and file
4. **[Authentication System](./04-authentication.md)** - Complete auth flow, security, and authorization
5. **[Route Groups](./05-route-groups.md)** - Understanding Next.js route groups and URL routing

### Development Guides
6. **[Development Workflow](./11-development.md)** - Setup, common tasks, testing, and deployment
7. **[Future Roadmap](./12-roadmap.md)** - Planned features and implementation timeline

### Quick References
8. **[Quick Reference](./QUICK-REFERENCE.md)** - Fast lookup guide for common tasks and patterns
9. **[Index & Glossary](./INDEX.md)** - Complete index of topics and terminology
10. **[System Diagrams](./DIAGRAMS.md)** - Visual architecture and flow diagrams

## 🚀 Quick Start

If you're new to the project, we recommend reading the documentation in order. If you're looking for specific information:

- **Understanding the codebase?** → Start with [Project Overview](./01-project-overview.md)
- **Setting up development?** → Jump to [Development Workflow](./11-development.md)
- **Working with auth?** → Read [Authentication System](./04-authentication.md)
- **Adding new routes?** → See [Route Groups](./05-route-groups.md)
- **Building components?** → Check [Components Guide](./06-components.md)

## 🎯 Key Concepts

### Route Groups
The app uses Next.js 15 route groups to organize different sections:
- `(frontend)` - Public-facing blog
- `(auth)` - Login/registration pages
- `(payload)` - Admin CMS panel

### User Roles
Three user roles with different permissions:
- **Contributor** - Can create and manage their own posts
- **Editor** - Can review and publish all posts
- **Admin** - Full system access

### Account Management (Future Feature)
Each role will have dedicated account management:
- `/dashboard/account` - Contributors manage their profile
- `/editor/account` - Editors manage their profile and preferences
- `/admin/account` - Admins manage their profile and system settings

## 📖 Contributing

Before contributing, please read:
1. [Development Workflow](./11-development.md)
2. [Architecture](./02-architecture.md)
3. The relevant guide for the area you're working on

## 🔗 External Resources

- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Payload CMS Documentation](https://payloadcms.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)

## 📝 Notes

This documentation is a living document. If you find anything unclear or outdated, please update it as part of your contributions.

---

Last Updated: October 18, 2025

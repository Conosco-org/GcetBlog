# GCET Blog - Developer Documentation

Welcome to the GCET Blog development documentation. This guide will help you understand the codebase and contribute effectively.

## 📚 Documentation Structure

- **[Getting Started](./GETTING_STARTED.md)** - Setup and installation guide
- **[Architecture](./ARCHITECTURE.md)** - System architecture and design decisions
- **[Development Guide](./DEVELOPMENT.md)** - Development workflow and best practices
- **[Deployment](./DEPLOYMENT.md)** - Deployment guide for Vercel
- **[API Reference](./API.md)** - API endpoints and usage

## 🚀 Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd gcet-blog

# Install dependencies
pnpm install

# Setup environment variables
cp .env.example .env
# Edit .env with your configuration

# Run development server
pnpm dev
```

Visit:
- Frontend: http://localhost:3000
- Admin Panel: http://localhost:3000/admin

## 🏗️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **CMS**: Payload CMS 3.x
- **Database**: MongoDB
- **Styling**: Tailwind CSS
- **Deployment**: Vercel
- **Language**: TypeScript

## 📖 Key Concepts

### Multi-Tenant Architecture
The platform supports multiple institutions with isolated data and custom branding.

### Role-Based Access Control
- **Admin**: Full system access
- **Editor**: Content management and moderation
- **Contributor**: Content creation
- **User**: Public access

### Content Workflow
1. Contributor creates draft
2. Contributor submits for review
3. Editor reviews and provides feedback or approves
4. Approved content is published

## 🔗 Quick Links

- [Project Overview](./ARCHITECTURE.md#overview)
- [Folder Structure](./ARCHITECTURE.md#folder-structure)
- [Environment Variables](./GETTING_STARTED.md#environment-variables)
- [Common Tasks](./DEVELOPMENT.md#common-tasks)
- [Troubleshooting](./DEVELOPMENT.md#troubleshooting)

## 🤝 Contributing

1. Read the documentation thoroughly
2. Follow the [Development Guide](./DEVELOPMENT.md)
3. Test your changes locally
4. Submit a pull request with clear description

## 📝 Need Help?

- Check the [Troubleshooting](./DEVELOPMENT.md#troubleshooting) section
- Review existing documentation
- Contact the development team

---

**Last Updated**: 2026-04-05  
**Maintained By**: GCET Development Team

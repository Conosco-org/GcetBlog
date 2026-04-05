# Getting Started

This guide will help you set up the GCET Blog platform for local development.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 20.9.0 or higher
- **pnpm**: Version 10.0.0 or higher
- **MongoDB**: Local instance or MongoDB Atlas account
- **Git**: For version control

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd gcet-blog
```

### 2. Install Dependencies

```bash
pnpm install
```

This will install all required dependencies including Next.js, Payload CMS, and other packages.

### 3. Environment Setup

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and configure the following variables:

#### Required Variables

```env
# Database
DATABASE_URI=mongodb://localhost:27017/gcet-blog
# Or use MongoDB Atlas:
# DATABASE_URI=mongodb+srv://username:password@cluster.mongodb.net/gcet-blog

# Payload CMS
PAYLOAD_SECRET=your-secret-key-here-min-32-chars
NEXT_PUBLIC_SERVER_URL=http://localhost:3000

# Email (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Cloudinary (for media uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

#### Optional Variables

```env
# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# SendGrid (alternative to SMTP)
SENDGRID_API_KEY=your-sendgrid-api-key

# Vercel Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your-analytics-id
```

### 4. Generate Payload Types

```bash
pnpm generate:types
```

This generates TypeScript types for Payload collections.

### 5. Start Development Server

```bash
pnpm dev
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin

## First Time Setup

### Create Admin User

1. Visit http://localhost:3000/admin
2. You'll be prompted to create the first admin user
3. Fill in the required information
4. Click "Create First User"

### Configure Institution

1. Log in to the admin panel
2. Navigate to Globals → Header
3. Configure your institution's branding
4. Save changes

## Development Workflow

### Running the Development Server

```bash
pnpm dev
```

### Building for Production

```bash
pnpm build
```

### Starting Production Server

```bash
pnpm start
```

### Linting

```bash
pnpm lint
pnpm lint:fix
```

### Generate Types

```bash
pnpm generate:types
pnpm generate:importmap
```

## Common Issues

### Port Already in Use

If port 3000 is already in use:

```bash
# Kill the process using port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:3000 | xargs kill -9
```

### MongoDB Connection Issues

- Ensure MongoDB is running
- Check DATABASE_URI in .env
- Verify network connectivity for MongoDB Atlas

### Module Not Found Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next
pnpm build
```

## Next Steps

- Read the [Architecture](./ARCHITECTURE.md) documentation
- Review the [Development Guide](./DEVELOPMENT.md)
- Explore the [API Reference](./API.md)

---

**Need help?** Check the [Troubleshooting](./DEVELOPMENT.md#troubleshooting) section or contact the development team.

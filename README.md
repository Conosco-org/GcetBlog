# GCET Blog

Official blog platform for Geethanjali College of Engineering and Technology (GCET).

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **CMS**: Payload CMS 3.x
- **Database**: MongoDB
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## Quick Start

### Prerequisites

- Node.js 20.9.0 or higher
- pnpm 10.0.0 or higher
- MongoDB database

### Installation

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Configure your .env file with:
# - DATABASE_URI
# - PAYLOAD_SECRET
# - NEXT_PUBLIC_SERVER_URL
# - Other required variables

# Run development server
pnpm dev
```

Visit `http://localhost:3000` for the frontend and `http://localhost:3000/admin` for the admin panel.

### Build for Production

```bash
pnpm build
pnpm start
```

## Environment Variables

See `.env.example` for all required environment variables.

## Documentation

For detailed documentation, see the `docs/` folder (local development only).

## License

MIT

---

**Maintained by**: GCET Development Team

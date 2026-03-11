import { withPayload } from '@payloadcms/next/withPayload'

import redirects from './redirects.js'

const NEXT_PUBLIC_SERVER_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : undefined || process.env.__NEXT_PRIVATE_ORIGIN || 'http://localhost:3000'

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      ...[NEXT_PUBLIC_SERVER_URL /* 'https://example.com' */].map((item) => {
        const url = new URL(item)

        return {
          hostname: url.hostname,
          protocol: url.protocol.replace(':', ''),
        }
      }),
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      // Multi-tenant: allow images from any *.sites.conosco.in subdomain
      {
        protocol: 'https',
        hostname: '*.sites.conosco.in',
      },
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  reactStrictMode: true,
  redirects,

  // ---------------------------------------------------------------------------
  // Multi-Tenant Custom Domain Support
  // ---------------------------------------------------------------------------
  // In development, the app runs on localhost:3000.
  // In production on Vercel, custom domains are mapped via CNAME + Vercel Domains API.
  // The actual hostname is read in middleware via request.headers.get('host').
  //
  // To support multiple custom domains pointing to the same Vercel deployment:
  //   1. College IT adds CNAME: blog.gcet.edu.in → cname.vercel-dns.com
  //   2. SuperAdmin adds domain in Vercel dashboard (or via API)
  //   3. SuperAdmin maps hostname in Institutions collection → domains[]
  //   4. Middleware resolves hostname → institution → sets x-tenant-* headers
  //
  // No special Next.js config is needed for this — Vercel handles SSL + routing.
  // The `skipMiddlewareUrlNormalize` flag prevents Vercel from normalizing URLs,
  // which can interfere with custom domain routing.
  skipMiddlewareUrlNormalize: true,
}

export default withPayload(nextConfig, { devBundleServerPackages: false })

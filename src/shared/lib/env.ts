/**
 * Environment variable validation
 * Validates required env vars are present at startup
 * Throws a descriptive error if any are missing
 */

const required = [
  'DATABASE_URI',
  'PAYLOAD_SECRET',
  'NEXT_PUBLIC_SERVER_URL',
] as const

// Validate required variables
for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
}

// Export validated environment variables
export const env = {
  DATABASE_URI: process.env.DATABASE_URI!,
  PAYLOAD_SECRET: process.env.PAYLOAD_SECRET!,
  SERVER_URL: process.env.NEXT_PUBLIC_SERVER_URL!,
  
  // Optional variables
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  
  // Email configuration
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  EMAIL_FROM: process.env.EMAIL_FROM,
  
  // OAuth
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  
  // Node environment
  NODE_ENV: process.env.NODE_ENV || 'development',
} as const

export type Env = typeof env

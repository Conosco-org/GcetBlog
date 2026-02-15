declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PAYLOAD_SECRET: string
      DATABASE_URI: string
      NEXT_PUBLIC_SERVER_URL: string
      VERCEL_PROJECT_PRODUCTION_URL: string
      CRON_SECRET?: string

      // Email provider config
      EMAIL_PROVIDER?: 'smtp' | 'resend' | 'sendgrid' | 'console'
      EMAIL_FROM?: string
      EMAIL_FROM_NAME?: string
      EMAIL_RATE_LIMIT?: string

      // SMTP (when EMAIL_PROVIDER=smtp)
      SMTP_HOST?: string
      SMTP_PORT?: string
      SMTP_USER?: string
      SMTP_PASS?: string
      SMTP_SECURE?: string
      SMTP_MAX_CONNECTIONS?: string

      // Resend (when EMAIL_PROVIDER=resend)
      RESEND_API_KEY?: string

      // SendGrid (when EMAIL_PROVIDER=sendgrid)
      SENDGRID_API_KEY?: string
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {}

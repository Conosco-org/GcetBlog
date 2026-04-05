# Deployment Guide

This guide covers deploying the GCET Blog platform to Vercel.

## Prerequisites

Before deploying, ensure you have:

- Vercel account
- MongoDB Atlas database (or other MongoDB hosting)
- Cloudinary account for media storage
- SendGrid account for email delivery (or SMTP credentials)
- Git repository (GitHub, GitLab, or Bitbucket)

## Initial Setup

### 1. Prepare MongoDB Atlas

1. Create a MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster (free tier is sufficient for testing)
3. Create a database user with read/write permissions
4. Whitelist Vercel IP addresses (or use 0.0.0.0/0 for all IPs)
5. Get your connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/gcet-blog
   ```

### 2. Setup Cloudinary

1. Create account at https://cloudinary.com
2. Get your credentials from the dashboard:
   - Cloud Name
   - API Key
   - API Secret

### 3. Setup Email Service

**Option A: SendGrid**
1. Create account at https://sendgrid.com
2. Create an API key with "Mail Send" permissions
3. Verify sender email address

**Option B: SMTP (Gmail)**
1. Enable 2-factor authentication on Gmail
2. Generate app-specific password
3. Use these credentials:
   - Host: smtp.gmail.com
   - Port: 587
   - User: your-email@gmail.com
   - Pass: app-specific-password

## Vercel Deployment

### Method 1: Deploy via Vercel Dashboard (Recommended)

1. **Connect Repository**
   - Go to https://vercel.com/new
   - Import your Git repository
   - Select the repository

2. **Configure Project**
   - Framework Preset: Next.js
   - Root Directory: `./` (leave as default)
   - Build Command: `pnpm build`
   - Output Directory: `.next` (default)
   - Install Command: `pnpm install`

3. **Add Environment Variables**

   Click "Environment Variables" and add:

   ```env
   # Database
   DATABASE_URI=mongodb+srv://username:password@cluster.mongodb.net/gcet-blog

   # Payload CMS
   PAYLOAD_SECRET=generate-a-secure-random-string-min-32-chars
   NEXT_PUBLIC_SERVER_URL=https://your-app.vercel.app

   # Email - SendGrid
   SENDGRID_API_KEY=your-sendgrid-api-key
   SENDGRID_FROM_EMAIL=noreply@yourdomain.com
   SENDGRID_FROM_NAME=GCET Blog

   # OR Email - SMTP
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password

   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret

   # Cron Jobs (generate a secure random string)
   CRON_SECRET=your-cron-secret-for-newsletter-jobs

   # Optional: Google OAuth
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret

   # Optional: Analytics
   NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your-analytics-id
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (3-5 minutes)
   - Visit your deployed site

### Method 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   pnpm add -g vercel
   ```

2. **Login**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Add Environment Variables**
   ```bash
   vercel env add DATABASE_URI
   vercel env add PAYLOAD_SECRET
   # ... add all other variables
   ```

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## Post-Deployment Setup

### 1. Create Admin User

1. Visit `https://your-app.vercel.app/admin`
2. You'll be prompted to create the first admin user
3. Fill in the required information
4. Click "Create First User"

### 2. Configure Institution

1. Log in to the admin panel
2. Navigate to Globals → Header
3. Configure:
   - Institution name
   - Logo
   - Navigation items
4. Navigate to Globals → Footer
5. Configure footer content
6. Save changes

### 3. Setup Cron Jobs (Newsletter)

Vercel automatically runs scheduled jobs defined in `payload.config.ts`. Ensure `CRON_SECRET` is set in environment variables.

The following jobs are configured:
- Daily Digest: 6:00 AM daily
- Weekly Digest: 7:00 AM Mondays
- Monthly Digest: 8:00 AM 1st of month
- Scheduled Send: Every 15 minutes
- Stats Rollup: Every 6 hours

### 4. Configure Custom Domain (Optional)

1. Go to Vercel project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Update DNS records as instructed
5. Update `NEXT_PUBLIC_SERVER_URL` environment variable

## Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URI` | MongoDB connection string | `mongodb+srv://...` |
| `PAYLOAD_SECRET` | Secret key for Payload (min 32 chars) | `your-secret-key` |
| `NEXT_PUBLIC_SERVER_URL` | Public URL of your app | `https://your-app.vercel.app` |

### Email Variables (Choose One)

**SendGrid:**
| Variable | Description |
|----------|-------------|
| `SENDGRID_API_KEY` | SendGrid API key |
| `SENDGRID_FROM_EMAIL` | Sender email address |
| `SENDGRID_FROM_NAME` | Sender name |

**SMTP:**
| Variable | Description |
|----------|-------------|
| `SMTP_HOST` | SMTP server host |
| `SMTP_PORT` | SMTP server port |
| `SMTP_USER` | SMTP username |
| `SMTP_PASS` | SMTP password |

### Media Storage

| Variable | Description |
|----------|-------------|
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |

### Optional Variables

| Variable | Description |
|----------|-------------|
| `CRON_SECRET` | Secret for cron job authentication |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `NEXT_PUBLIC_VERCEL_ANALYTICS_ID` | Vercel Analytics ID |

## Continuous Deployment

### Automatic Deployments

Vercel automatically deploys when you push to your repository:

- **Production**: Pushes to `main` branch
- **Preview**: Pushes to other branches

### Manual Deployments

Trigger manual deployment:
1. Go to Vercel dashboard
2. Select your project
3. Click "Deployments"
4. Click "Redeploy"

## Monitoring

### Vercel Analytics

1. Enable in Vercel dashboard
2. Add `NEXT_PUBLIC_VERCEL_ANALYTICS_ID` to environment variables
3. View analytics in Vercel dashboard

### Error Tracking

View errors in Vercel dashboard:
1. Go to your project
2. Click "Logs"
3. Filter by error level

### Performance Monitoring

Vercel provides:
- Build time metrics
- Function execution time
- Edge network performance
- Core Web Vitals

## Troubleshooting

### Build Fails

**Issue**: Build fails on Vercel

**Solutions**:
1. Check build logs in Vercel dashboard
2. Verify all environment variables are set
3. Test build locally: `pnpm build`
4. Check for TypeScript errors
5. Ensure all dependencies are in `package.json`

### Database Connection Fails

**Issue**: Cannot connect to MongoDB

**Solutions**:
1. Verify `DATABASE_URI` is correct
2. Check MongoDB Atlas IP whitelist (add 0.0.0.0/0)
3. Verify database user has correct permissions
4. Check MongoDB Atlas cluster is running

### Images Not Loading

**Issue**: Images return 404 or don't load

**Solutions**:
1. Verify Cloudinary credentials
2. Check `next.config.js` image configuration
3. Ensure Cloudinary domain is in `remotePatterns`

### Emails Not Sending

**Issue**: Emails not being delivered

**Solutions**:
1. Verify email service credentials
2. Check SendGrid sender verification
3. Review Vercel function logs
4. Test email configuration locally

### Function Timeout

**Issue**: Serverless function timeout

**Solutions**:
1. Optimize database queries
2. Add indexes to frequently queried fields
3. Reduce payload size
4. Consider upgrading Vercel plan for longer timeouts

### Environment Variables Not Working

**Issue**: Environment variables not accessible

**Solutions**:
1. Redeploy after adding variables
2. Ensure variables are added to correct environment (Production/Preview)
3. Check variable names match exactly
4. For client-side variables, use `NEXT_PUBLIC_` prefix

## Scaling

### Database Scaling

- Upgrade MongoDB Atlas tier for more storage/performance
- Add indexes for frequently queried fields
- Implement caching strategies

### Vercel Scaling

- Vercel automatically scales serverless functions
- Consider Pro plan for:
  - Longer function execution time
  - More bandwidth
  - Advanced analytics

### Media Scaling

- Cloudinary automatically handles CDN and optimization
- Upgrade plan for more transformations/bandwidth

## Security Best Practices

1. **Environment Variables**
   - Never commit `.env` files
   - Use strong, unique secrets
   - Rotate secrets periodically

2. **Database**
   - Use strong database passwords
   - Limit IP whitelist when possible
   - Enable MongoDB Atlas encryption

3. **Access Control**
   - Review user permissions regularly
   - Implement rate limiting for API routes
   - Use HTTPS only (Vercel provides this)

4. **Monitoring**
   - Enable Vercel logs
   - Monitor for unusual activity
   - Set up error alerts

## Backup Strategy

### Database Backups

MongoDB Atlas provides automatic backups:
1. Go to Atlas dashboard
2. Navigate to "Backup"
3. Configure backup schedule
4. Test restore process

### Code Backups

- Git repository serves as code backup
- Tag releases: `git tag v1.0.0`
- Keep production branch protected

## Rollback Procedure

If deployment has issues:

1. **Via Vercel Dashboard**
   - Go to "Deployments"
   - Find previous working deployment
   - Click "..." → "Promote to Production"

2. **Via Git**
   ```bash
   git revert HEAD
   git push origin main
   ```

## Cost Optimization

### Vercel
- Free tier: Suitable for small projects
- Pro tier: $20/month for production apps
- Monitor usage in dashboard

### MongoDB Atlas
- Free tier: 512MB storage
- Shared tier: $9/month for 2GB
- Monitor usage in Atlas dashboard

### Cloudinary
- Free tier: 25GB storage, 25GB bandwidth
- Monitor usage in Cloudinary dashboard

## Support

- **Vercel**: https://vercel.com/support
- **MongoDB Atlas**: https://www.mongodb.com/support
- **Cloudinary**: https://support.cloudinary.com
- **SendGrid**: https://support.sendgrid.com

---

**Last Updated**: 2026-04-05  
**Maintained By**: GCET Development Team

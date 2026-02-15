# Newsletter Email Setup Guide

The newsletter system supports multiple email providers. Choose one based on your needs:

## 📧 Email Provider Options

### 1. **Console** (Development Only)
- **Best for**: Local testing
- **Setup**: None required (default)
- **Config**:
  ```env
  EMAIL_PROVIDER=console
  EMAIL_FROM=noreply@gcet.edu.in
  ```
- Logs emails to console instead of sending

---

### 2. **SMTP** (Most Flexible)
- **Best for**: Using existing SMTP server, Gmail, Outlook, AWS SES SMTP
- **Setup**: Get SMTP credentials from your provider
- **Config**:
  ```env
  EMAIL_PROVIDER=smtp
  EMAIL_FROM=noreply@gcet.edu.in
  SMTP_HOST=smtp.gmail.com
  SMTP_PORT=587
  SMTP_SECURE=false
  SMTP_USER=your-email@gmail.com
  SMTP_PASS=your-app-password
  SMTP_MAX_CONNECTIONS=5
  ```

#### Gmail Setup:
1. Enable 2-Factor Authentication on your Google account
2. Go to https://myaccount.google.com/apppasswords
3. Generate an "App Password" for "Mail"
4. Use that 16-character password as `SMTP_PASS`

#### Zoho Mail Setup:
1. Go to Zoho Mail settings → Security → App Passwords
2. Generate an App Password for "SMTP"
3. Use:
   ```env
   SMTP_HOST=smtp.zoho.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@zoho.com
   SMTP_PASS=your-app-password
   ```
   - For India: `smtp.zoho.in`
   - For Europe: `smtp.zoho.eu`

#### Outlook/Microsoft 365 Setup:
1. Enable 2FA on your Microsoft account
2. Generate an App Password at https://account.microsoft.com/security
3. Use:
   ```env
   SMTP_HOST=smtp.office365.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@outlook.com
   SMTP_PASS=your-app-password
   ```

#### AWS SES SMTP Setup:
1. Verify your domain in AWS SES console
2. Create SMTP credentials in SES settings
3. Use:
   ```env
   SMTP_HOST=email-smtp.us-east-1.amazonaws.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-ses-smtp-username
   SMTP_PASS=your-ses-smtp-password
   ```

---

### 3. **Resend** (Modern, Easy)
- **Best for**: Simple setup, modern API, great deliverability
- **Setup**: Sign up at https://resend.com
- **Pricing**: Free tier: 100 emails/day, 3,000/month
- **Config**:
  ```env
  EMAIL_PROVIDER=resend
  EMAIL_FROM=noreply@gcet.edu.in
  RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
  ```

#### Resend Setup:
1. Sign up at https://resend.com
2. Verify your domain (or use their test domain for development)
3. Generate an API key
4. Add to your `.env` file

---

### 4. **SendGrid** (Enterprise)
- **Best for**: High volume, advanced analytics
- **Setup**: Sign up at https://sendgrid.com
- **Pricing**: Free tier: 100 emails/day
- **Config**:
  ```env
  EMAIL_PROVIDER=sendgrid
  EMAIL_FROM=noreply@gcet.edu.in
  SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
  ```

#### SendGrid Setup:
1. Sign up at https://sendgrid.com
2. Verify your sender identity (email or domain)
3. Create an API key with "Mail Send" permission
4. Add to your `.env` file

---

## 🚀 Quick Start (Development)

For local testing, use **Console** mode (already set by default):

```env
EMAIL_PROVIDER=console
EMAIL_FROM=noreply@gcet.edu.in
```

Emails will be logged to your terminal instead of actually sending.

---

## 🏭 Production Recommendation

For production, we recommend:

1. **Resend** - Easiest to set up, great deliverability
2. **AWS SES** - Best pricing for high volume (via SMTP)
3. **SendGrid** - If you need advanced analytics

---

## 📝 Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Then edit `.env` with your chosen provider's settings.

---

## ✅ Testing Your Setup

1. Start your dev server: `pnpm dev`
2. Go to `/editor/newsletter/compose`
3. Create a test newsletter and use "Send Test Email"
4. Check your terminal (console mode) or inbox (SMTP/Resend/SendGrid)

---

## 🔒 Security Notes

- **Never commit `.env` to git** (it's in `.gitignore`)
- Use App Passwords for Gmail (not your actual password)
- Rotate API keys regularly
- Use environment variables in production (Vercel, Railway, etc.)

---

## 🎯 Newsletter Features

Once configured, the system supports:

- ✅ Manual newsletter composition (Tiptap editor)
- ✅ Automated digests (daily/weekly/monthly)
- ✅ Scheduled sending
- ✅ Double opt-in confirmation
- ✅ One-click unsubscribe
- ✅ Email tracking (opens, clicks, bounces)
- ✅ Subscriber preferences
- ✅ CSV import/export

---

## 🐛 Troubleshooting

### "SMTP provider requires SMTP_HOST..."
- Make sure all SMTP_* variables are set in `.env`

### Gmail "Authentication failed"
- Use an App Password, not your regular password
- Enable 2FA first, then generate App Password

### Zoho "Authentication failed"
- Generate an App Password from Security settings
- Use the correct regional SMTP host (`.com`, `.in`, `.eu`)
- Port 587 with TLS is recommended

### Emails not sending
- Check `EMAIL_PROVIDER` is set correctly
- Verify API keys/passwords are correct
- Check console for error messages
- Try `EMAIL_PROVIDER=console` to test locally

### "550 Relay denied"
- Your SMTP server requires authentication
- Verify `SMTP_USER` and `SMTP_PASS` are correct

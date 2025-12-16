# Email Configuration for Cloud Platforms (Render, Heroku, etc.)

## 🐛 Problem: Connection Timeout on SMTP

Cloud platforms like Render, Heroku, and many others **block outbound connections on standard SMTP ports** for security reasons:
- Port 25: Almost always blocked
- Port 587: Often blocked (STARTTLS)
- Port 465: **Usually allowed** (SSL/TLS)

## ✅ Solution: Use Port 465 with SSL

### Updated Configuration

**In your `.env` file (and Render Environment Variables):**

```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465  # ← Changed from 587 to 465
EMAIL_DEBUG=false
```

### What Changed

1. **Default Port**: Changed from `587` → `465`
2. **Retry Order**: Now tries `[465, 587, 25]` instead of `[587, 465, 25]`
3. **Connection Timeouts**: Increased to 20 seconds for cloud platforms
4. **TLS Settings**:
   - `rejectUnauthorized: false` (required for cloud platforms)
   - `minVersion: 'TLSv1.2'` (modern TLS)
   - Removed `ciphers: 'SSLv3'` (deprecated)
5. **Verification Timeout**: Added 15-second timeout to prevent hanging

## 🔧 Setup Instructions

### 1. Generate Gmail App Password

Since you're using Gmail, you need an **App Password** (not your regular Gmail password):

1. Go to: https://myaccount.google.com/apppasswords
2. Sign in to your Google Account
3. Click "Select app" → Choose "Mail"
4. Click "Select device" → Choose "Other (Custom name)"
5. Enter: "Interview AI Backend"
6. Click "Generate"
7. Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)
8. Use this password in `EMAIL_PASS` (remove spaces)

### 2. Update Render Environment Variables

In Render Dashboard:

1. Go to your backend service
2. Click **Environment** tab
3. Update or add these variables:
   ```
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password-without-spaces
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=465
   ```
4. Click **Save Changes**
5. Render will automatically redeploy

### 3. Verify Configuration

After deployment, check the logs for:
- ✅ `Email transporter ready on port 465`
- ✅ OTP emails send successfully

If you see:
- ❌ `Failed to connect on port 465` → Try port 2525 (see alternatives below)
- ❌ `Invalid credentials` → Check Gmail App Password

## 🔀 Alternative Ports (If 465 is Also Blocked)

Some platforms allow alternative SMTP ports:

### Option 1: Port 2525 (Alternative SMTP)

```env
SMTP_PORT=2525
```

Gmail doesn't support this, but you can use **Gmail SMTP Relay** if you have a Google Workspace account.

### Option 2: Use SendGrid (Free Tier)

If Gmail ports are all blocked:

1. Sign up at https://sendgrid.com (Free: 100 emails/day)
2. Get API Key
3. Update `.env`:
   ```env
   EMAIL_SERVICE=SendGrid
   EMAIL_USER=apikey
   EMAIL_PASS=your-sendgrid-api-key
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=465
   ```

### Option 3: Use Mailgun (Free Tier)

1. Sign up at https://www.mailgun.com (Free: 5,000 emails/month)
2. Get SMTP credentials
3. Update `.env`:
   ```env
   EMAIL_SERVICE=Mailgun
   EMAIL_USER=postmaster@your-domain.mailgun.org
   EMAIL_PASS=your-mailgun-password
   SMTP_HOST=smtp.mailgun.org
   SMTP_PORT=465
   ```

## 🧪 Testing Locally

Test the email configuration locally before deploying:

```bash
cd backend
node test-email.js
```

Or test OTP specifically:

```bash
node test-otp.js
```

## 🔍 Debugging

Enable email debug logging:

```env
EMAIL_DEBUG=true
```

Then check logs for detailed SMTP connection information.

## 📝 Technical Details

### Why Port 465?

- **Port 465**: SMTP over SSL (SMTPS)
  - Encrypted connection from the start
  - Less likely to be blocked on cloud platforms
  - Direct SSL/TLS handshake

- **Port 587**: SMTP with STARTTLS
  - Starts unencrypted, upgrades to TLS
  - Often blocked on shared cloud hosting
  - Requires STARTTLS command support

### Why Gmail App Password?

Google disabled "less secure app access" in May 2022. You must use:
- App Passwords (for personal Gmail)
- OAuth2 (more complex, not needed for server-to-server)

## ✅ Checklist

Before deploying to Render:

- [ ] Gmail App Password generated
- [ ] `.env` has `SMTP_PORT=465`
- [ ] Render Environment Variables updated
- [ ] Tested locally with `node test-email.js`
- [ ] Checked Render logs for "Email transporter ready"
- [ ] Verified OTP emails are received

## 🚨 Common Errors

### Error: Invalid login

**Solution**: Use Gmail App Password, not your regular password.

### Error: Connection timeout (even on 465)

**Solutions**:
1. Verify Gmail App Password is correct (no spaces)
2. Check if your Gmail account has 2FA enabled (required for App Passwords)
3. Try SendGrid or Mailgun instead
4. Contact Render support to check if SMTP is blocked

### Error: Self-signed certificate

**Solution**: Already handled with `rejectUnauthorized: false`

### Error: EAUTH - Authentication failed

**Solution**: 
1. Generate new Gmail App Password
2. Remove spaces from the password
3. Wrap password in quotes in `.env`: `EMAIL_PASS="abcdefghijklmnop"`

## 📞 Support

If emails still don't work after following this guide:
1. Check Render logs: Dashboard → Logs tab
2. Enable `EMAIL_DEBUG=true` for detailed logs
3. Test with a different email provider (SendGrid/Mailgun)
4. Contact Render support about SMTP port restrictions

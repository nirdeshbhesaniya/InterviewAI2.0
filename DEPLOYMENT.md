# Azure Deployment Checklist

## 📋 Pre-Deployment Setup

### 1. MongoDB Atlas Configuration
- [ ] Create MongoDB Atlas cluster
- [ ] Create database user with password
- [ ] Whitelist Azure IP ranges (or 0.0.0.0/0 for development)
- [ ] Get connection string (mongodb+srv://...)
- [ ] Test connection from local environment

### 2. Environment Secrets Preparation
- [ ] Generate strong JWT_SECRET (min 32 characters)
- [ ] Setup email service (Gmail, SendGrid, etc.)
- [ ] Get Cloudinary credentials
- [ ] Get Google Gemini API key
- [ ] (Optional) Get OpenAI API key

### 3. GitHub Repository
- [ ] All code pushed to main branch
- [ ] .env files NOT committed (check .gitignore)
- [ ] README.md updated with deployment info

---

## 🚀 Backend Deployment (Azure App Service)

### Step 1: Create App Service
1. Go to [Azure Portal](https://portal.azure.com)
2. Click "Create a resource" → "Web App"
3. Configuration:
   - **Resource Group**: Create new (e.g., `interview-ai-rg`)
   - **Name**: `interview-ai-backend` (must be globally unique)
   - **Publish**: Code
   - **Runtime Stack**: Node 18 LTS
   - **Operating System**: Linux
   - **Region**: Choose nearest (e.g., East US)
   - **Pricing**: B1 Basic (or F1 Free for testing)
4. Click "Review + Create" → "Create"

### Step 2: Configure Environment Variables
1. Go to App Service → Configuration → Application Settings
2. Click "New application setting" for each variable:

```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
JWT_SECRET=your-super-secret-key-min-32-chars
NODE_ENV=production
PORT=8080

# Email
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
SUPPORT_EMAIL=support@yourapp.com

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# AI Services
GEMINI_API_KEY=your-gemini-key
OPENAI_API_KEY=your-openai-key

# Frontend URL (will be added after frontend deployment)
FRONTEND_URL=https://your-frontend.azurestaticapps.net
AZURE_STATIC_WEB_APP_URL=https://your-frontend.azurestaticapps.net
APP_URL=https://your-frontend.azurestaticapps.net
```

3. Click "Save" at the top

### Step 3: Setup GitHub Deployment
1. Go to App Service → Deployment Center
2. Source: **GitHub**
3. Authorize GitHub if prompted
4. Organization: Your GitHub username
5. Repository: `InterviewAI2.0`
6. Branch: `main`
7. Build Provider: **GitHub Actions**
8. Runtime stack: Node
9. Version: 18
10. **Important**: In "Advanced", set:
    - App location: `/backend`
    - Output location: (leave empty)
11. Click "Save"

### Step 4: Verify Backend Deployment
- Wait 3-5 minutes for initial deployment
- Go to App Service → Overview → URL
- Visit: `https://your-app.azurewebsites.net/api/health`
- Should see: `{"status":"healthy",...}`
- Check logs: App Service → Log stream

---

## 🌐 Frontend Deployment (Azure Static Web Apps)

### Step 1: Create Static Web App
1. Go to Azure Portal
2. Click "Create a resource" → Search "Static Web Apps"
3. Configuration:
   - **Resource Group**: Use same as backend
   - **Name**: `interview-ai-frontend`
   - **Plan type**: Free
   - **Region**: Choose nearest
   - **Deployment details**:
     - Source: GitHub
     - Organization: Your username
     - Repository: `InterviewAI2.0`
     - Branch: `main`
   - **Build Details**:
     - Build Presets: **Custom**
     - App location: `/frontend`
     - Api location: (leave empty)
     - Output location: `dist`
4. Click "Review + Create" → "Create"

### Step 2: Configure Environment Variables
1. Go to Static Web App → Configuration
2. Click "Add" under Application settings:
```
VITE_API_BASE_URL=https://your-backend.azurewebsites.net/api
```
3. Click "Save"

### Step 3: Update Backend CORS
1. Go back to Backend App Service → Configuration
2. Update these variables with your Static Web App URL:
```
FRONTEND_URL=https://your-frontend.azurestaticapps.net
AZURE_STATIC_WEB_APP_URL=https://your-frontend.azurestaticapps.net
APP_URL=https://your-frontend.azurestaticapps.net
```
3. Click "Save" → Restart App Service

### Step 4: Verify Frontend Deployment
- Wait 3-5 minutes for initial build
- Go to Static Web App → Overview → URL
- Visit: `https://your-frontend.azurestaticapps.net`
- Test registration and login
- Check browser console for errors

---

## ✅ Post-Deployment Verification

### Backend Health Checks
- [ ] Visit `/api/health` - should return healthy status
- [ ] Check MongoDB connection in health response
- [ ] Test `/api/auth/login` with valid credentials
- [ ] Check App Service → Log stream for errors

### Frontend Functionality
- [ ] Landing page loads correctly
- [ ] User registration works
- [ ] User login works
- [ ] Dashboard displays after login
- [ ] API calls work (check Network tab)
- [ ] React Router works on page refresh
- [ ] No CORS errors in console

### Integration Tests
- [ ] Create new interview session
- [ ] Take MCQ test
- [ ] Upload resource
- [ ] Check notifications
- [ ] Update profile
- [ ] Test all major features

---

## 🐛 Troubleshooting

### Backend Issues

**Problem**: Health endpoint returns 503
- Check App Service logs
- Verify MongoDB connection string
- Check if all required env variables are set

**Problem**: CORS errors
- Verify FRONTEND_URL matches Static Web App URL exactly
- Check for typos in URL (http vs https)
- Restart App Service after changing env variables

**Problem**: Application crashes on startup
- Check Log stream for error messages
- Verify all dependencies are in package.json
- Check Node version compatibility

### Frontend Issues

**Problem**: White screen / blank page
- Check browser console for errors
- Verify VITE_API_BASE_URL is set correctly
- Clear browser cache and try again

**Problem**: 404 on page refresh
- Verify staticwebapp.config.json is deployed
- Check Static Web App configuration

**Problem**: API calls failing
- Check Network tab in browser DevTools
- Verify backend URL in env variables
- Test backend health endpoint directly

---

## 🔄 CI/CD Pipeline

### Automatic Deployments
- **Backend**: Push to `main` → GitHub Actions → Auto-deploy to App Service
- **Frontend**: Push to `main` → GitHub Actions → Auto-deploy to Static Web Apps

### Manual Deployment Trigger
1. Go to GitHub → Actions
2. Select the workflow
3. Click "Run workflow"

### Rollback Procedure
1. Go to GitHub → Commits
2. Find last working commit
3. Revert or create new commit
4. Push to main branch

---

## 📊 Monitoring & Logs

### Backend Logs
- App Service → Log stream (real-time)
- App Service → Monitoring → Logs
- Application Insights (if enabled)

### Frontend Logs
- Browser Developer Console
- Static Web App → Functions (if any)

### Performance Monitoring
- App Service → Metrics
- Monitor CPU, Memory, Response time
- Set up alerts for high usage

---

## 💰 Cost Management

### Free Tier Limits
- **App Service F1**: Always free (with limitations)
- **Static Web Apps Free**: 100 GB bandwidth/month
- **MongoDB Atlas M0**: 512 MB storage (free forever)

### Recommended Production Tiers
- **App Service B1**: ~$13/month
- **Static Web Apps Standard**: ~$9/month
- **MongoDB Atlas M2**: ~$9/month

---

## 🔐 Security Best Practices

- [ ] Never commit .env files
- [ ] Use strong JWT_SECRET (32+ characters)
- [ ] Enable HTTPS only
- [ ] Set up MongoDB network access rules
- [ ] Rotate API keys regularly
- [ ] Enable Application Insights for monitoring
- [ ] Set up Azure Key Vault for production secrets

---

## 📞 Support Resources

- [Azure App Service Docs](https://docs.microsoft.com/azure/app-service/)
- [Azure Static Web Apps Docs](https://docs.microsoft.com/azure/static-web-apps/)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)
- [GitHub Actions Docs](https://docs.github.com/actions)

---

## 🎓 GitHub Student Pack Benefits

With GitHub Student Developer Pack, you get:
- $100 Azure credits
- Free domain via Namecheap
- Free SSL certificates
- Many other developer tools

Apply at: https://education.github.com/pack

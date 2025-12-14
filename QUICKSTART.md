# ⚡ Quick Start Guide - Azure Deployment

## 🎯 Goal
Deploy Interview AI to Azure in under 30 minutes.

## ✅ Prerequisites Checklist
- [ ] GitHub account
- [ ] Azure account (Free/Student)
- [ ] MongoDB Atlas account (Free M0 cluster)
- [ ] Code pushed to GitHub main branch

## 🚀 5-Step Deployment

### Step 1: MongoDB Setup (5 minutes)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free M0 cluster
3. Create database user
4. Network Access → Add IP: `0.0.0.0/0` (Allow all)
5. Copy connection string:
   ```
   mongodb+srv://user:password@cluster.mongodb.net/dbname
   ```

### Step 2: Create Backend (5 minutes)
1. [Azure Portal](https://portal.azure.com) → Create Resource → Web App
2. Settings:
   - Name: `interview-ai-backend-[yourname]`
   - Runtime: Node 18 LTS
   - OS: Linux
   - Pricing: F1 (Free)
3. Create → Wait 2 minutes
4. Go to resource → Configuration → New application setting:
   ```
   MONGODB_URI = [paste your connection string]
   JWT_SECRET = [generate random 32+ char string]
   NODE_ENV = production
   ```
   Save all settings

### Step 3: Deploy Backend (5 minutes)
1. App Service → Deployment Center
2. Source: GitHub
3. Authorize → Select repository: `InterviewAI2.0`
4. Branch: `main`
5. Build Provider: GitHub Actions
6. Advanced Settings:
   - App location: `/backend`
7. Save → Wait 3 minutes for build
8. Test: `https://your-app.azurewebsites.net/api/health`
   Should see: `{"status":"healthy"}`

### Step 4: Create Frontend (5 minutes)
1. Azure Portal → Create Resource → Static Web Apps
2. Settings:
   - Name: `interview-ai-frontend-[yourname]`
   - Pricing: Free
   - Source: GitHub
   - Repository: `InterviewAI2.0`
   - Branch: `main`
   - Build Details:
     - Preset: Custom
     - App location: `/frontend`
     - Output: `dist`
3. Create → Wait 2 minutes

### Step 5: Connect & Configure (5 minutes)
1. Static Web App → Configuration → Add:
   ```
   VITE_API_BASE_URL = https://your-backend.azurewebsites.net/api
   ```
   Save

2. Copy your Static Web App URL (e.g., `https://xyz.azurestaticapps.net`)

3. Go back to Backend App Service → Configuration → Add/Update:
   ```
   FRONTEND_URL = [paste Static Web App URL]
   AZURE_STATIC_WEB_APP_URL = [paste Static Web App URL]
   APP_URL = [paste Static Web App URL]
   ```
   Save

4. Backend App Service → Overview → Restart

5. Wait 3 minutes → Visit your Static Web App URL

## 🎉 You're Done!

Visit your Static Web App URL and test:
- ✅ Register new account
- ✅ Login
- ✅ Test features

## 🔧 Essential Settings Only

For working app, you only need:

**Backend (Minimum):**
```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
NODE_ENV=production
FRONTEND_URL=https://your-frontend.azurestaticapps.net
AZURE_STATIC_WEB_APP_URL=https://your-frontend.azurestaticapps.net
```

**Frontend:**
```env
VITE_API_BASE_URL=https://your-backend.azurewebsites.net/api
```

## 🐛 Quick Troubleshooting

**Backend not starting?**
- Check MongoDB connection string is correct
- Verify JWT_SECRET is set
- Check App Service → Log stream

**Frontend blank page?**
- Verify VITE_API_BASE_URL is set correctly
- Check browser console (F12)
- Verify backend /api/health works

**CORS errors?**
- Verify FRONTEND_URL matches your Static Web App URL exactly
- Restart backend after changing settings

## 📝 Add Features Later

After basic deployment works, add these for full functionality:

```env
# Email (for password reset, notifications)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Image uploads
CLOUDINARY_CLOUD_NAME=your-name
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret

# AI features
GEMINI_API_KEY=your-gemini-key
OPENAI_API_KEY=your-openai-key
```

## 📚 Next Steps

1. ✅ Test all features
2. ✅ Add custom domain (optional)
3. ✅ Setup Application Insights (optional)
4. ✅ Configure email service
5. ✅ Add AI API keys
6. ✅ Setup Cloudinary for images

## 💡 Pro Tips

- Use free tiers for testing
- Upgrade to B1/S1 for production
- Setup alerts for errors
- Enable Application Insights for monitoring
- Keep sensitive keys in Azure, never in code

## 📞 Need Help?

- Check [DEPLOYMENT.md](DEPLOYMENT.md) for detailed guide
- Check [AZURE-CONFIG.md](AZURE-CONFIG.md) for all settings
- Check [DEVELOPMENT.md](DEVELOPMENT.md) for local setup
- Create GitHub issue for support

---

**Time to Deploy**: ~25 minutes  
**Cost**: $0 (Free tier)  
**Difficulty**: Beginner-friendly ✨

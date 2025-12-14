# Azure Configuration Summary

## 🎯 Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Repository                         │
│                   (InterviewAI2.0)                          │
└────────────┬────────────────────────────┬──────────────────┘
             │                             │
             │ Push to main               │ Push to main
             ▼                             ▼
    ┌─────────────────┐          ┌──────────────────────┐
    │  GitHub Actions  │          │   GitHub Actions     │
    │   (Backend CI)   │          │   (Frontend CI)      │
    └────────┬─────────┘          └──────────┬───────────┘
             │                               │
             │ Auto Deploy                   │ Auto Deploy
             ▼                               ▼
    ┌─────────────────────┐       ┌───────────────────────┐
    │  Azure App Service  │◄─────►│ Azure Static Web Apps │
    │   (Node.js/Linux)   │ CORS  │      (React)          │
    │   Port: 8080        │       │   Client-side only    │
    └──────────┬──────────┘       └───────────────────────┘
               │
               │ MongoDB Driver
               ▼
    ┌─────────────────────┐
    │   MongoDB Atlas     │
    │   (Cloud Database)  │
    └─────────────────────┘
```

## 📦 Resource Naming Convention

| Resource Type | Recommended Name | Example |
|---------------|------------------|---------|
| Resource Group | `{project}-rg` | `interview-ai-rg` |
| App Service | `{project}-backend` | `interview-ai-backend` |
| Static Web App | `{project}-frontend` | `interview-ai-frontend` |
| MongoDB Database | `{project}db` | `interviewaidb` |

## 🔧 Backend Configuration (Azure App Service)

### Runtime Configuration
- **Platform**: Linux
- **Runtime Stack**: Node 18 LTS
- **Startup Command**: `node server.js` (automatic via package.json)
- **Port**: 8080 (from process.env.PORT)
- **Always On**: Enabled (prevents cold starts)

### Application Settings (Environment Variables)

#### Database
```
MONGODB_URI = mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
```

#### Authentication
```
JWT_SECRET = <generate-strong-secret-min-32-chars>
NODE_ENV = production
```

#### CORS & Frontend
```
FRONTEND_URL = https://<your-static-web-app>.azurestaticapps.net
AZURE_STATIC_WEB_APP_URL = https://<your-static-web-app>.azurestaticapps.net
APP_URL = https://<your-static-web-app>.azurestaticapps.net
```

#### Email Service
```
EMAIL_SERVICE = gmail
EMAIL_USER = <your-email@gmail.com>
EMAIL_PASS = <app-specific-password>
SUPPORT_EMAIL = <support@yourdomain.com>
SMTP_HOST = (optional)
SMTP_PORT = 587
EMAIL_DEBUG = false
```

#### Cloudinary (Image Uploads)
```
CLOUDINARY_CLOUD_NAME = <your-cloud-name>
CLOUDINARY_API_KEY = <your-api-key>
CLOUDINARY_API_SECRET = <your-api-secret>
```

#### AI Services
```
GEMINI_API_KEY = <your-google-gemini-key>
OPENAI_API_KEY = <your-openai-key>
```

#### SendGrid (Optional)
```
SENDGRID_API_KEY = <your-sendgrid-key>
```

### Deployment Settings
- **Source**: GitHub
- **Repository**: nirdeshbhesaniya/InterviewAI2.0
- **Branch**: main
- **App Location**: `/backend`
- **Build Provider**: GitHub Actions

### Health Check
- **Endpoint**: `/api/health`
- **Expected Response**: `{"status":"healthy","mongodb":"connected"}`

## 🌐 Frontend Configuration (Azure Static Web Apps)

### Build Configuration
- **App Location**: `/frontend`
- **API Location**: (empty - no backend functions)
- **Output Location**: `dist`
- **Build Command**: `npm run build` (automatic)

### Application Settings
```
VITE_API_BASE_URL = https://<your-app-service>.azurewebsites.net/api
```

### Static Web App Configuration (staticwebapp.config.json)
- ✅ React Router fallback to /index.html
- ✅ Client-side routing support
- ✅ Proper MIME types
- ✅ Cache headers

### Deployment Settings
- **Source**: GitHub
- **Repository**: nirdeshbhesaniya/InterviewAI2.0
- **Branch**: main
- **Build Preset**: Custom
- **Framework**: React (Vite)

## 🔐 Security Configuration

### App Service Security
1. **HTTPS Only**: Enabled (force HTTPS)
2. **Minimum TLS**: 1.2
3. **CORS**: Configured in code (allows Static Web App domain)
4. **Authentication**: JWT-based (in application code)

### Static Web App Security
1. **HTTPS**: Automatic
2. **Custom Domains**: Supported (optional)
3. **SSL**: Free, auto-renewed

### MongoDB Security
1. **Network Access**: Allow Azure IP ranges or 0.0.0.0/0
2. **Authentication**: Username/password
3. **Encryption**: At rest and in transit
4. **Backup**: Enabled (recommended)

## 📊 Monitoring & Logging

### Backend Monitoring
- **Application Insights**: Optional (recommended for production)
- **Log Stream**: Real-time logs
- **Metrics**: CPU, Memory, Requests
- **Alerts**: Set up for failures

### Frontend Monitoring
- **Browser Console**: Client-side errors
- **Network Tab**: API call debugging
- **Azure Monitor**: Static Web App analytics

### Health Check Monitoring
```bash
# Test backend health
curl https://your-app.azurewebsites.net/api/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "environment": "production",
  "mongodb": "connected"
}
```

## 💰 Cost Estimation

### Free Tier (Student/Starter)
```
App Service (F1):        $0/month
Static Web App (Free):   $0/month  
MongoDB Atlas (M0):      $0/month
Total:                   $0/month
```

### Basic Production
```
App Service (B1):        ~$13/month
Static Web App (Std):    ~$9/month
MongoDB Atlas (M2):      ~$9/month
Total:                   ~$31/month
```

### Recommended Production
```
App Service (S1):        ~$70/month
Static Web App (Std):    ~$9/month
MongoDB Atlas (M10):     ~$60/month
Application Insights:    ~$2/month
Total:                   ~$141/month
```

## 🚀 Deployment Steps Summary

### Initial Setup (One-time)
1. ✅ Create Azure Resource Group
2. ✅ Create App Service (Backend)
3. ✅ Configure Backend Environment Variables
4. ✅ Connect Backend to GitHub
5. ✅ Wait for backend deployment
6. ✅ Test backend health endpoint
7. ✅ Create Static Web App (Frontend)
8. ✅ Configure Frontend Environment Variables
9. ✅ Update Backend CORS settings with frontend URL
10. ✅ Wait for frontend deployment
11. ✅ Test full application

### Ongoing Deployments (Automatic)
1. Push code to `main` branch
2. GitHub Actions triggers automatically
3. Backend/Frontend deploys in 3-5 minutes
4. Verify deployment via health checks

## 🔄 CI/CD Pipeline

### Trigger Events
- Push to `main` branch
- Pull request to `main` (preview deployment for frontend)
- Manual workflow dispatch

### Build Process
**Backend:**
```
1. Checkout code
2. Setup Node.js 18
3. npm ci (clean install)
4. Deploy to App Service
```

**Frontend:**
```
1. Checkout code
2. Setup Node.js
3. npm ci
4. npm run build
5. Deploy to Static Web Apps
```

### Environment-specific Builds
- Development: Use .env.local
- Production: Use Azure Application Settings

## 📝 Post-Deployment Checklist

### Backend Verification
- [ ] https://your-app.azurewebsites.net/api/health returns 200
- [ ] MongoDB connection shows "connected"
- [ ] No errors in Log Stream
- [ ] All environment variables set

### Frontend Verification
- [ ] https://your-app.azurestaticapps.net loads
- [ ] No console errors
- [ ] API calls work (check Network tab)
- [ ] React Router works on page refresh
- [ ] Images load correctly

### Integration Testing
- [ ] User registration works
- [ ] User login works
- [ ] All API endpoints respond
- [ ] File uploads work
- [ ] Email notifications sent
- [ ] No CORS errors

## 🐛 Common Issues & Solutions

### Issue: Backend shows "Application Error"
**Solution:** Check Log Stream → Verify MongoDB connection → Verify env variables

### Issue: Frontend shows blank page
**Solution:** Check console → Verify VITE_API_BASE_URL → Clear cache

### Issue: CORS errors
**Solution:** Verify FRONTEND_URL in backend → Restart App Service

### Issue: MongoDB connection timeout
**Solution:** Add Azure IPs to MongoDB network access → Verify connection string

### Issue: 404 on frontend routes
**Solution:** Verify staticwebapp.config.json is deployed

## 📞 Support Resources

- **Azure Docs**: https://docs.microsoft.com/azure
- **GitHub Actions**: https://docs.github.com/actions
- **MongoDB Atlas**: https://docs.atlas.mongodb.com
- **Node.js**: https://nodejs.org/docs
- **React**: https://react.dev
- **Vite**: https://vitejs.dev

## 🎓 Additional Resources

- Azure for Students: https://azure.microsoft.com/free/students/
- GitHub Student Pack: https://education.github.com/pack
- MongoDB University: https://university.mongodb.com
- Free SSL Certificates: https://letsencrypt.org

---

**Last Updated**: 2025-01-13
**Version**: 1.0.0
**Status**: Production Ready ✅

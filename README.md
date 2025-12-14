# Interview AI - MERN Stack Application

AI-powered interview preparation platform with mock interviews, MCQ tests, code execution, and learning resources.

## 🏗️ Architecture

- **Frontend**: React 19 + Vite + Tailwind CSS
- **Backend**: Node.js + Express.js
- **Database**: MongoDB Atlas
- **Deployment**: Azure (App Service + Static Web Apps)

## 📋 Prerequisites

- Node.js 18+ and npm 9+
- MongoDB Atlas account
- Azure account (GitHub Student Pack eligible)
- GitHub account

## 🚀 Azure Deployment Guide

### Backend Deployment (Azure App Service)

1. **Create Azure App Service**
   - Go to [Azure Portal](https://portal.azure.com)
   - Create new App Service (Linux, Node 18 LTS)
   - Choose B1 or F1 tier (free tier available)

2. **Configure Environment Variables**
   - Go to App Service → Configuration → Application Settings
   - Add all variables from `backend/.env.example`
   - **Required variables:**
     - `MONGODB_URI`
     - `JWT_SECRET`
     - `FRONTEND_URL` (your Static Web App URL)
     - `AZURE_STATIC_WEB_APP_URL` (same as above)
     - Email, Cloudinary, AI API keys

3. **Deploy via GitHub Actions**
   - Go to App Service → Deployment Center
   - Choose GitHub as source
   - Select repository and `main` branch
   - Choose `/backend` as root directory
   - Azure will auto-generate GitHub Actions workflow

4. **Verify Deployment**
   - Visit: `https://your-app.azurewebsites.net/api/health`
   - Should return healthy status

### Frontend Deployment (Azure Static Web Apps)

1. **Create Static Web App**
   - Go to Azure Portal
   - Create Static Web Apps resource
   - Choose Free tier

2. **Connect to GitHub**
   - Select your repository
   - Build Details:
     - Build Presets: **Custom**
     - App location: `/frontend`
     - Output location: `dist`

3. **Configure Environment Variables**
   - Go to Static Web App → Configuration
   - Add: `VITE_API_BASE_URL=https://your-backend.azurewebsites.net/api`

4. **Verify Deployment**
   - Azure auto-deploys on push to main
   - Visit your Static Web App URL
   - Test login and features

## 🛠️ Local Development

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev
```

Server runs on: http://localhost:8080

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local: VITE_API_BASE_URL=http://localhost:8080/api
npm run dev
```

App runs on: http://localhost:5173

## 🔧 Environment Configuration

### Backend (.env)
All secrets must be set in Azure App Service Configuration. Never commit `.env` to Git.

### Frontend (.env.local)
Only `VITE_API_BASE_URL` is needed. Set in Azure Static Web App Configuration.

## 📦 Project Structure

```
Interview-Preparation-app/
├── backend/
│   ├── Controllers/
│   ├── Models/
│   ├── Routes/
│   ├── utils/
│   ├── middlewares/
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   └── utils/
│   ├── public/
│   ├── staticwebapp.config.json
│   ├── package.json
│   └── .env.example
└── README.md
```

## 🔑 Key Features

- 🤖 AI-Powered Mock Interviews
- 📝 MCQ Testing System
- 💻 Multi-Language Code Execution
- 📚 Community Resource Sharing
- 👤 User Profiles & Progress Tracking
- 🔔 Notifications System
- 📧 Email Integration
- 🎨 Dark/Light Theme

## 🌐 API Endpoints

### Health Check
- `GET /api/health` - Server health status

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Password reset

### Interview
- `GET /api/interview` - Get all interviews
- `POST /api/interview` - Create interview
- `POST /api/interview/ask` - AI interview question

### MCQ
- `POST /api/mcq/generate` - Generate MCQ test
- `POST /api/mcq/submit` - Submit answers

### Resources
- `GET /api/resources` - Get all resources
- `POST /api/resources` - Upload resource

[Full API documentation available on request]

## 🐛 Troubleshooting

### Backend Issues

**MongoDB Connection Failed**
- Verify `MONGODB_URI` in Azure App Service settings
- Check MongoDB Atlas network access (allow Azure IPs)

**CORS Errors**
- Ensure `FRONTEND_URL` is set correctly
- Check Azure Static Web App URL matches

### Frontend Issues

**API Calls Failing**
- Verify `VITE_API_BASE_URL` in Static Web App configuration
- Check backend `/api/health` endpoint

**Routing 404 on Refresh**
- Ensure `staticwebapp.config.json` is deployed
- Check Azure Static Web App configuration

## 📄 License

MIT License - see LICENSE file

## 👥 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📞 Support

For issues and questions:
- GitHub Issues: [Create Issue](https://github.com/nirdeshbhesaniya/InterviewAI2.0/issues)
- Email: support@yourapp.com

## 🎓 Credits

Built with ❤️ using:
- React, Express, MongoDB, Node.js
- Google Gemini AI
- Cloudinary
- Azure Cloud Services

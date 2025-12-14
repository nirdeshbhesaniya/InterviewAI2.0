# Local Development Setup

## Prerequisites

- Node.js 18+ and npm 9+
- MongoDB Atlas account (or local MongoDB)
- Git

## Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/nirdeshbhesaniya/InterviewAI2.0.git
cd Interview-Preparation-app
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```env
MONGODB_URI=mongodb://localhost:27017/interviewai
# OR use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname

JWT_SECRET=your-local-jwt-secret-key-min-32-chars
NODE_ENV=development
PORT=8080

# Email (optional for local dev)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Cloudinary (required for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# AI Services (required for AI features)
GEMINI_API_KEY=your-gemini-api-key
OPENAI_API_KEY=your-openai-api-key
```

Start backend:
```bash
npm run dev
```

Backend runs on: http://localhost:8080

### 3. Frontend Setup

Open new terminal:
```bash
cd frontend
npm install
```

Create `.env.local` file:
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
VITE_API_BASE_URL=http://localhost:8080/api
```

Start frontend:
```bash
npm run dev
```

Frontend runs on: http://localhost:5173

## 4. Test Application

1. Open browser: http://localhost:5173
2. Register new account
3. Login
4. Test features:
   - Dashboard
   - Interview Prep
   - MCQ Tests
   - Code Execution
   - Resources

## Development Tips

### Backend Hot Reload
Backend uses nodemon for auto-restart on file changes.

### Frontend Hot Reload
Vite provides instant HMR (Hot Module Replacement).

### MongoDB Local vs Atlas
- **Local**: Fast, free, no internet required
- **Atlas**: Production-like, shared across team, free tier available

### Environment Variables
- Backend: Uses `.env` (never commit this!)
- Frontend: Uses `.env.local` (Vite only reads VITE_* variables)

### Common Issues

**MongoDB Connection Failed**
```bash
# Check if MongoDB is running (local)
mongod --version

# Or verify Atlas connection string
# Make sure to URL-encode password special characters
```

**Port Already in Use**
```bash
# Change PORT in backend/.env
# Or kill process using port 8080:
# Windows: netstat -ano | findstr :8080
# Mac/Linux: lsof -ti:8080 | xargs kill
```

**CORS Errors**
- Backend automatically allows localhost:5173
- Check backend console for CORS logs

## Project Structure

```
Interview-Preparation-app/
├── backend/
│   ├── Controllers/      # Request handlers
│   ├── Models/          # MongoDB schemas
│   ├── Routes/          # API routes
│   ├── middlewares/     # Auth, upload, etc.
│   ├── utils/           # Helpers (email, cloudinary, AI)
│   ├── server.js        # Entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Route pages
│   │   ├── context/     # React Context (state)
│   │   ├── utils/       # API paths, helpers
│   │   ├── App.jsx      # Main app component
│   │   └── main.jsx     # Entry point
│   ├── public/          # Static assets
│   └── package.json
│
├── README.md            # Main documentation
├── DEPLOYMENT.md        # Azure deployment guide
└── .gitignore
```

## Available Scripts

### Backend
```bash
npm start       # Production mode
npm run dev     # Development with nodemon
npm test        # Run tests
```

### Frontend
```bash
npm run dev     # Development server
npm run build   # Production build
npm run preview # Preview production build
npm run lint    # Run ESLint
```

## Tech Stack

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- Cloudinary (images)
- Nodemailer (emails)
- Google Gemini AI
- OpenAI

### Frontend
- React 19
- Vite
- React Router
- Tailwind CSS
- Framer Motion
- Axios
- React Hot Toast
- Monaco Editor (code)

## API Documentation

### Authentication
```
POST /api/auth/register   - Register new user
POST /api/auth/login      - Login
POST /api/auth/forgot-password - Request password reset
POST /api/auth/verify-otp - Verify OTP
POST /api/auth/reset-password - Reset password
```

### Profile
```
GET  /api/profile         - Get profile
PUT  /api/profile/update  - Update profile
POST /api/profile/upload-photo - Upload photo
PUT  /api/profile/change-password - Change password
```

### Interview
```
GET  /api/interview       - Get all interviews
POST /api/interview       - Create interview
GET  /api/interview/:id   - Get interview by ID
POST /api/interview/ask   - Ask AI question
```

### MCQ
```
POST /api/mcq/generate    - Generate MCQ test
POST /api/mcq/submit      - Submit answers
GET  /api/mcq/history     - Get test history
GET  /api/mcq/topics      - Get available topics
```

Full API documentation: See individual route files in `backend/Routes/`

## Contributing

1. Create feature branch: `git checkout -b feature/amazing-feature`
2. Commit changes: `git commit -m 'Add amazing feature'`
3. Push to branch: `git push origin feature/amazing-feature`
4. Open Pull Request

## Troubleshooting

### Backend won't start
1. Check MongoDB connection
2. Verify all required env variables
3. Check port availability
4. Check logs for errors

### Frontend build fails
1. Delete node_modules and package-lock.json
2. Run npm install again
3. Clear npm cache: `npm cache clean --force`

### API calls failing
1. Check backend is running
2. Verify VITE_API_BASE_URL is correct
3. Check browser Network tab for details
4. Check backend logs

## License

MIT License - See LICENSE file

## Support

- GitHub Issues: [Create Issue](https://github.com/nirdeshbhesaniya/InterviewAI2.0/issues)
- Email: support@yourapp.com

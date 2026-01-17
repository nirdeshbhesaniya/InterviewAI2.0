# 📚 Interview AI Website - Complete System Documentation

> **InterviewAI 2.0** - A Modern MERN Stack Interview Preparation Platform with AI-Powered Features

---

## 📋 Table of Contents

- [🎯 Project Overview](#-project-overview)
- [🏗️ System Architecture](#️-system-architecture)
- [💻 Technology Stack](#-technology-stack)
- [✨ Core Features](#-core-features)
- [🗄️ Database Models](#️-database-models)
- [🔌 API Endpoints](#-api-endpoints)
- [🎨 Frontend Structure](#-frontend-structure)
- [🤖 AI Integration](#-ai-integration)
- [🔐 Authentication & Security](#-authentication--security)
- [📧 Email Services](#-email-services)
- [🚀 Deployment](#-deployment)
- [🛠️ Development Guide](#️-development-guide)
- [📊 Performance Optimization](#-performance-optimization)
- [🐛 Testing & Debugging](#-testing--debugging)
- [📝 Best Practices](#-best-practices)

---

## 🎯 Project Overview

### 📖 Description
**InterviewAI 2.0** is a comprehensive interview preparation platform that leverages AI to help users prepare for technical interviews. The application provides:

- 🎤 **AI-Powered Mock Interviews** with intelligent question generation
- 📝 **MCQ Test Generation** with adaptive difficulty levels
- 💬 **Interactive Chatbot** for instant help and guidance
- 📊 **Performance Analytics** with detailed insights
- 📚 **Resource Management** for study materials
- ✍️ **Notes & Documentation** system
- 👤 **User Profile Management** with progress tracking

### 🎨 Key Highlights
- ✅ Modern, responsive UI with dark/light theme support
- ✅ Real-time AI-powered assistance
- ✅ Comprehensive test history and analytics
- ✅ Code execution platform for practice
- ✅ Email notifications and OTP verification
- ✅ Session management and security features

### 👨‍💻 Author
**Nirdesh Bhesaniya**
- 📧 Email: Contact via support system
- 🔗 Repository: [InterviewAI2.0](https://github.com/nirdeshbhesaniya/InterviewAI2.0.git)

---

## 🏗️ System Architecture

### 📐 Architecture Pattern
```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │  React 19 + Vite + TailwindCSS + Framer Motion  │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ↕️
┌─────────────────────────────────────────────────────────┐
│                    API LAYER                            │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Express.js 5.1 + RESTful API + Middleware      │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ↕️
┌─────────────────────────────────────────────────────────┐
│                  BUSINESS LOGIC LAYER                   │
│  ┌──────────────────────────────────────────────────┐  │
│  │  LangChain + LangGraph + AI Services            │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ↕️
┌─────────────────────────────────────────────────────────┐
│                   DATABASE LAYER                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │  MongoDB 8.15 + Mongoose ODM                    │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ↕️
┌─────────────────────────────────────────────────────────┐
│                 EXTERNAL SERVICES                       │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Google Gemini AI | SendGrid | Cloudinary      │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 🔄 Request Flow
1. **Client Request** → React Router handles navigation
2. **API Call** → Axios instance with interceptors
3. **Authentication** → JWT verification middleware
4. **Route Handler** → Express route processes request
5. **Business Logic** → LangChain/LangGraph for AI operations
6. **Database** → MongoDB via Mongoose
7. **Response** → JSON formatted data
8. **UI Update** → React state management + Context API

---

## 💻 Technology Stack

### 🎨 Frontend Technologies

#### Core Framework
| Technology | Version | Purpose |
|------------|---------|---------|
| ⚛️ **React** | 19.1.0 | UI library for building components |
| ⚡ **Vite** | 6.3.5 | Fast build tool and dev server |
| 🎨 **TailwindCSS** | 4.1.10 | Utility-first CSS framework |
| 🔀 **React Router** | 7.6.1 | Client-side routing |

#### UI Libraries & Components
| Library | Version | Purpose |
|---------|---------|---------|
| 🎭 **Framer Motion** | 12.15.0 | Animation library |
| 🎯 **Radix UI** | Various | Accessible component primitives |
| 🎨 **Lucide React** | 0.512.0 | Icon library |
| 🔥 **React Hot Toast** | 2.5.2 | Toast notifications |
| 📊 **Recharts** | 3.6.0 | Chart library for analytics |

#### Code & Markdown
| Library | Version | Purpose |
|---------|---------|---------|
| 💻 **Monaco Editor** | 4.7.0 | Code editor (VS Code engine) |
| 📝 **React Markdown** | 10.1.0 | Markdown rendering |
| 🎨 **Syntax Highlighter** | 15.6.1 | Code syntax highlighting |
| 🔍 **Highlight.js** | 11.11.1 | Syntax highlighting engine |

#### Utilities
| Library | Version | Purpose |
|---------|---------|---------|
| 📡 **Axios** | 1.9.0 | HTTP client |
| 📅 **Moment.js** | 2.30.1 | Date/time manipulation |
| 📄 **jsPDF** | 3.0.1 | PDF generation |
| 🖼️ **html2canvas** | 1.4.1 | Screenshot generation |

### 🔧 Backend Technologies

#### Core Framework
| Technology | Version | Purpose |
|------------|---------|---------|
| 🟢 **Node.js** | ≥18.0.0 | Runtime environment |
| 🚂 **Express.js** | 5.1.0 | Web application framework |
| 🍃 **MongoDB** | 8.15.1 | NoSQL database |
| 📦 **Mongoose** | 8.15.1 | MongoDB ODM |

#### AI & Language Models
| Library | Version | Purpose |
|---------|---------|---------|
| 🤖 **Google Generative AI** | 0.24.1 | Gemini AI integration |
| 🔗 **LangChain** | 0.3.37 | LLM application framework |
| 🧠 **LangGraph** | 0.2.74 | Workflow orchestration |
| 🌐 **OpenAI** | 5.1.1 | OpenAI API integration |

#### Authentication & Security
| Library | Version | Purpose |
|---------|---------|---------|
| 🔐 **bcryptjs** | 3.0.2 | Password hashing |
| 🎫 **jsonwebtoken** | 9.0.2 | JWT token generation |
| ✅ **express-validator** | 7.2.1 | Request validation |
| 🔒 **dotenv** | 16.5.0 | Environment variables |

#### File & Email Services
| Library | Version | Purpose |
|---------|---------|---------|
| 📧 **SendGrid** | 8.1.6 | Email service |
| 📮 **Nodemailer** | 7.0.5 | Email sending |
| ☁️ **Cloudinary** | 2.8.0 | Image hosting |
| 📁 **Multer** | 2.0.1 | File upload handling |

#### Utilities
| Library | Version | Purpose |
|---------|---------|---------|
| 🔄 **CORS** | 2.8.5 | Cross-origin resource sharing |
| 🆔 **UUID** | 11.1.0 | Unique ID generation |
| 📊 **Zod** | 3.25.76 | Schema validation |
| 🔁 **Streamifier** | 0.1.1 | Stream conversion |

---

## ✨ Core Features

### 1. 🎤 AI-Powered Interview Preparation

#### 📝 Interview Session Management
- **Create Sessions**: Generate interview sessions with custom topics
- **Question Generation**: AI-powered question creation using LangChain
- **Answer Editor**: Rich text and code editor for answers
- **Q&A Management**: Add, edit, delete questions and answers
- **Session Organization**: Tag-based categorization with color coding

#### 🎯 Features
- ✅ Session-based organization
- ✅ Multiple question types (text + code)
- ✅ Markdown support in answers with Syntax Highlighting
- ✅ Modern Responsive UI with Dark/Light mode
- ✅ Export to Markdown functionality
- ✅ Share sessions and deep-link to questions
- ✅ Admin controls (Approve/Reject/Delete)
- ✅ Star/Mark important questions

**Key Files:**
- `frontend/src/pages/InterviewPrep/InterviewPrepModern.jsx`
- `frontend/src/pages/InterviewPrep/AnswerEditor.jsx`
- `frontend/src/pages/InterviewPrep/AddQuestionPage.jsx`
- `backend/Routes/interview-langchain.js`

---

### 2. 📝 MCQ Test System

#### 🎯 Test Generation
- **AI-Generated Questions**: Dynamic MCQ generation based on topic
- **Difficulty Levels**: Beginner, Intermediate, Advanced, Expert
- **Specialization Support**: Custom topics and specializations
- **Adaptive Testing**: Questions tailored to experience level

#### 📊 Test Features
- ✅ Timed tests with countdown
- ✅ Fullscreen enforcement
- ✅ Tab switch detection
- ✅ Auto-submit on time expiry
- ✅ Immediate feedback with explanations
- ✅ Detailed performance analytics
- ✅ Test history tracking

#### 🔒 Security Features
- 🚨 Fullscreen exit warnings
- 🚨 Tab switch detection
- 🚨 Security violation tracking
- 🚨 Auto-submission on violations

#### 📈 Analytics
- Score calculation (percentage)
- Time spent tracking
- Performance level assessment
- Category-wise analysis
- Historical trend charts

**Key Files:**
- `frontend/src/pages/MCQTest/MCQTest.jsx` (120KB - main test interface)
- `frontend/src/pages/MCQTest/TestHistoryPage.jsx`
- `backend/Routes/mcq.js` (34KB - comprehensive MCQ logic)
- `backend/utils/mcq-optimizer.js`
- `backend/utils/mcq-cache.js`

---

### 3. 💬 AI Chatbot Assistant

#### 🤖 Chatbot Features
- **Context-Aware Responses**: LangChain-powered conversations
- **Memory Support**: Maintains conversation history
- **Multi-Purpose Help**: Interview prep, coding, general queries
- **Floating Interface**: Available on all pages

#### 🎨 UI Features
- ✅ Minimizable chat window
- ✅ Markdown rendering in responses
- ✅ Code syntax highlighting
- ✅ Typing indicators
- ✅ Message history

**Key Files:**
- `frontend/src/components/Chatbot/`
- `backend/Routes/chatbot-langchain.js`
- `frontend/src/context/ChatBotContext.jsx`

---

### 4. 💻 Code Execution Platform

#### ⚡ Features
- **Multi-Language Support**: Execute code in various languages
- **Monaco Editor**: VS Code-like editing experience
- **Real-time Execution**: Instant code compilation and execution
- **Output Display**: Console output with error handling

**Key Files:**
- `frontend/src/pages/Home/Codebase.jsx`
- `backend/Routes/compile.js`

---

### 5. 👤 User Profile & Analytics

#### 📊 Profile Features
- **Personal Information**: Name, bio, location, social links
- **Profile Photo**: Upload and manage profile picture
- **Activity Timeline**: Track all user activities
- **Performance Charts**: Visual analytics with Recharts
- **Progress Summary**: Comprehensive statistics

#### 📈 Analytics Displayed
- Total tests taken
- Average score
- Study time
- Questions answered
- Performance by category
- Activity timeline
- Score trends over time

**Key Files:**
- `frontend/src/pages/ProfilePage.jsx` (93KB - comprehensive profile)
- `backend/Routes/profileRoutes.js` (18KB)

---

### 6. 📚 Resources Management

#### 📖 Resource Features
- **Resource Library**: Curated study materials
- **Category Organization**: Organized by topics
- **Link Management**: External resource links
- **User Contributions**: Add custom resources

**Key Files:**
- `frontend/src/pages/ResourcesPage.jsx` (34KB)
- `backend/Routes/resources.js`
- `backend/Models/Resource.js`

---

### 7. ✍️ Notes System

#### 📝 Notes Features
- **Rich Text Editor**: Markdown support
- **Organization**: Tag-based categorization
- **Search**: Find notes quickly
- **CRUD Operations**: Full note management

**Key Files:**
- `frontend/src/pages/NotesPage.jsx` (33KB)
- `backend/Routes/notes.js`
- `backend/Models/Note.js`

---

### 8. 🔔 Notifications System

#### 📬 Notification Features
- **Real-time Notifications**: Instant updates
- **Categorization**: Different notification types
- **Mark as Read**: Track notification status
- **Notification History**: View past notifications

**Key Files:**
- `frontend/src/pages/NotificationsPageNew.jsx`
- `backend/Routes/notifications.js`
- `backend/Models/Notification.js`

---

### 9. ⚙️ Settings & Preferences

#### 🎛️ Settings Features
- **Account Settings**: Update profile information
- **Preferences**: Email notifications, test reminders
- **Theme Settings**: Light/dark mode
- **Language & Timezone**: Localization options
- **Security**: Password change, 2FA setup
- **Session Management**: Active device tracking
- **Account Deletion**: Request account deletion

**Key Files:**
- `frontend/src/pages/SettingsPageNew.jsx`
- `backend/Routes/settings.js`
- `backend/Models/UserSettings.js`

---

### 10. 🆘 Support System

#### 💬 Support Features
- **Contact Form**: Submit support requests
- **Email Integration**: Automated email responses
- **Issue Tracking**: Track support tickets

**Key Files:**
- `frontend/src/pages/ContactSupportPage.jsx`
- `backend/Routes/support_new.js`

---

### 11. 🛡️ Admin & Control Panel

#### 👮 User Management
- **View All Users**: List, filter, and search users
- **Ban/Unban**: Restrict access for specific users
- **Role Management**: Owner can manage Admin roles
- **Delete User**: Soft delete and ban functionality

#### 🤖 AI Control Center
- **Dashboard**: Visual usage statistics (OpenAI vs OpenRouter)
- **Status Monitoring**: Health check for multiple AI providers
- **Key Management**: Lock/Unlock specific API keys (Owner only)
- **Feature Toggles**: Enable/Disable specific AI features globally
- **Logs**: View detailed AI transaction logs (who used what model, tokens, cost)

#### 📝 Content Moderation
- **Q&A Approval**: Review and approve/reject user-submitted questions
- **Practice Test Management**: Create and manage official practice tests
- **Content Deletion**: Admin override to delete any note, resource, or session

**Key Files:**
- `backend/Routes/adminRoutes.js`
- `backend/Routes/aiRoutes.js`
- `frontend/src/pages/Admin/` (implied)

---

## 🗄️ Database Models

### 👤 User Model
**File:** `backend/Models/User.js`

```javascript
{
  fullName: String,
  email: String (unique),
  password: String (hashed),
  photo: String,
  bio: String,
  location: String,
  website: String,
  linkedin: String,
  github: String,
  preferences: {
    emailNotifications: Boolean,
    testReminders: Boolean,
    weeklyDigest: Boolean,
    language: String,
    timezone: String
  },
  twoFactorEnabled: Boolean,
  twoFactorSecret: String,
  sessions: [SessionSchema],
  lastPasswordChange: Date,
  accountDeletionRequested: Boolean,
  deletionRequestDate: Date,
  isDeleted: Boolean,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  otp: String,
  otpExpires: Date,
  isEmailVerified: Boolean,
  emailVerificationOTP: String,
  emailVerificationOTPExpires: Date,
  tempUserData: Object
}
```

**Indexes:**
- ✅ Email (unique)
- ✅ Timestamps (createdAt, updatedAt)

---

### 🎤 Interview Model
**File:** `backend/Models/Interview.js`

```javascript
{
  sessionId: String,
  title: String,
  tag: String,
  initials: String,
  experience: String,
  desc: String,
  color: String,
  qna: [{
    question: String,
    answerParts: [{
      type: String (enum: ['text', 'code']),
      content: String
    }]
  }],
  creatorEmail: String (required),
  deleteOTP: String
}
```

**Features:**
- ✅ Multi-part answers (text + code)
- ✅ Session-based organization
- ✅ OTP-based deletion security

---

### 📝 MCQTest Model
**File:** `backend/Models/MCQTest.js`

```javascript
{
  userId: ObjectId (ref: 'User'),
  userEmail: String,
  topic: String,
  experience: String (enum: ['beginner', 'intermediate', 'advanced', 'expert']),
  specialization: String,
  totalQuestions: Number,
  correctAnswers: Number,
  score: Number (0-100),
  timeSpent: Number (seconds),
  userAnswers: Map<Number>,
  questionsWithAnswers: [{
    question: String,
    options: [String],
    correctAnswer: Number,
    explanation: String
  }],
  securityWarnings: {
    fullscreenExits: Number,
    tabSwitches: Number
  },
  testStatus: String (enum: ['completed', 'auto-submitted', 'timeout']),
  completedAt: Date
}
```

**Indexes:**
- ✅ userId + createdAt (compound)
- ✅ userEmail + createdAt (compound)

**Methods:**
- `getPerformanceLevel()`: Returns performance assessment

---

### 📚 Resource Model
**File:** `backend/Models/Resource.js`

```javascript
{
  title: String,
  description: String,
  category: String,
  url: String,
  tags: [String],
  addedBy: ObjectId (ref: 'User'),
  isPublic: Boolean,
  views: Number,
  likes: [ObjectId]
}
```

---

### ✍️ Note Model
**File:** `backend/Models/Note.js`

```javascript
{
  userId: ObjectId (ref: 'User'),
  title: String,
  content: String,
  tags: [String],
  category: String,
  isPinned: Boolean,
  color: String
}
```

---

### 🔔 Notification Model
**File:** `backend/Models/Notification.js`

```javascript
{
  userId: ObjectId (ref: 'User'),
  type: String,
  title: String,
  message: String,
  isRead: Boolean,
  link: String,
  metadata: Object
}
```

---

### ⚙️ UserSettings Model
**File:** `backend/Models/UserSettings.js`

```javascript
{
  userId: ObjectId (ref: 'User', unique),
  theme: String (enum: ['light', 'dark', 'auto']),
  language: String,
  timezone: String,
  notifications: {
    email: Boolean,
    push: Boolean,
    testReminders: Boolean
  }
}
```

---

## 🔌 API Endpoints

### 🔐 Authentication Routes
**Base:** `/api/auth`
**File:** `backend/Routes/authRoutes.js`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register new user | ❌ |
| POST | `/verify-otp` | Verify email OTP | ❌ |
| POST | `/resend-otp` | Resend verification OTP | ❌ |
| POST | `/login` | User login | ❌ |
| POST | `/forgot-password` | Request password reset | ❌ |
| POST | `/reset-password` | Reset password with token | ❌ |
| POST | `/logout` | Logout user | ✅ |
| GET | `/verify-token` | Verify JWT token | ✅ |

---

### 👤 Profile Routes
**Base:** `/api/profile`
**File:** `backend/Routes/profileRoutes.js`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get user profile | ✅ |
| PUT | `/update` | Update profile info | ✅ |
| POST | `/upload-photo` | Upload profile photo | ✅ |
| DELETE | `/delete-photo` | Delete profile photo | ✅ |
| GET | `/stats` | Get user statistics | ✅ |
| GET | `/activity` | Get activity timeline | ✅ |
| GET | `/performance` | Get performance data | ✅ |

---

### 🎤 Interview Routes (LangChain)
**Base:** `/api/interview`
**File:** `backend/Routes/interview-langchain.js`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/create` | Create interview session | ✅ |
| GET | `/sessions` | Get all sessions | ✅ |
| GET | `/session/:sessionId` | Get specific session | ✅ |
| PUT | `/session/:sessionId` | Update session | ✅ |
| DELETE | `/session/:sessionId` | Delete session | ✅ |
| POST | `/generate-questions` | AI generate questions | ✅ |
| POST | `/add-question` | Add custom question | ✅ |
| PUT | `/update-answer` | Update answer | ✅ |
| DELETE | `/delete-question` | Delete question | ✅ |

---

### 📝 MCQ Test Routes
**Base:** `/api/mcq`
**File:** `backend/Routes/mcq.js`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/generate` | Generate MCQ test | ✅ |
| POST | `/submit` | Submit test answers | ✅ |
| GET | `/history` | Get test history | ✅ |
| GET | `/test/:testId` | Get specific test | ✅ |
| DELETE | `/test/:testId` | Delete test | ✅ |
| GET | `/analytics` | Get analytics data | ✅ |
| GET | `/performance` | Get performance stats | ✅ |

---

### 💬 Chatbot Routes (LangChain)
**Base:** `/api/chatbot`
**File:** `backend/Routes/chatbot-langchain.js`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/chat` | Send chat message | ✅ |
| GET | `/history` | Get chat history | ✅ |
| DELETE | `/clear` | Clear chat history | ✅ |

---

### 💻 Code Compilation Routes
**Base:** `/api/compile`
**File:** `backend/Routes/compile.js`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/execute` | Execute code | ✅ |

---

### 📚 Resource Routes
**Base:** `/api/resources`
**File:** `backend/Routes/resources.js`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all resources | ✅ |
| POST | `/create` | Create resource | ✅ |
| PUT | `/:id` | Update resource | ✅ |
| DELETE | `/:id` | Delete resource | ✅ |
| POST | `/:id/like` | Like resource | ✅ |

---

### ✍️ Notes Routes
**Base:** `/api/notes`
**File:** `backend/Routes/notes.js`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all notes | ✅ |
| POST | `/create` | Create note | ✅ |
| PUT | `/:id` | Update note | ✅ |
| DELETE | `/:id` | Delete note | ✅ |
| PUT | `/:id/pin` | Toggle pin status | ✅ |

---

### 🔔 Notification Routes
**Base:** `/api/notifications`
**File:** `backend/Routes/notifications.js`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get notifications | ✅ |
| PUT | `/:id/read` | Mark as read | ✅ |
| PUT | `/read-all` | Mark all as read | ✅ |
| DELETE | `/:id` | Delete notification | ✅ |

---

### ⚙️ Settings Routes
**Base:** `/api/settings`
**File:** `backend/Routes/settings.js`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get user settings | ✅ |
| PUT | `/update` | Update settings | ✅ |
| POST | `/change-password` | Change password | ✅ |
| POST | `/enable-2fa` | Enable 2FA | ✅ |
| POST | `/disable-2fa` | Disable 2FA | ✅ |
| GET | `/sessions` | Get active sessions | ✅ |
| DELETE | `/session/:id` | Revoke session | ✅ |
| POST | `/request-deletion` | Request account deletion | ✅ |

---

### 🆘 Support Routes
**Base:** `/api/support`
**File:** `backend/Routes/support_new.js`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/contact` | Submit support request | ❌ |
| GET | `/tickets` | Get user tickets | ✅ |
| GET | `/ticket/:id` | Get specific ticket | ✅ |

---

### 👮 Admin & Owner Routes
**Base:** `/api/admin`
**File:** `backend/Routes/adminRoutes.js`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/users` | Get all users | ✅ (Admin/Owner) |
| PUT | `/users/:userId` | Update user details | ✅ (Admin/Owner) |
| DELETE | `/users/:userId` | Delete user (Soft delete + Ban) | ✅ (Admin/Owner) |
| PATCH | `/users/:userId/ban` | Ban/Unban user | ✅ (Admin/Owner) |
| GET | `/qna-requests` | Get pending Q&A approvals | ✅ (Admin/Owner) |
| POST | `/approve-all-qna` | Approve all pending Q&A | ✅ (Admin/Owner) |
| DELETE | `/interviews/:id` | Delete interview session | ✅ (Admin/Owner) |
| DELETE | `/notes/:id` | Delete any note | ✅ (Admin/Owner) |
| DELETE | `/resources/:id` | Delete any resource | ✅ (Admin/Owner) |
| POST | `/practice-tests` | Create practice test | ✅ (Admin/Owner) |
| PUT | `/practice-tests/:id` | Update practice test | ✅ (Admin/Owner) |
| DELETE | `/practice-tests/:id` | Delete practice test | ✅ (Admin/Owner) |

---

### 🤖 AI Management Routes
**Base:** `/api/ai`
**File:** `backend/Routes/aiRoutes.js`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/dashboard` | Get AI usage stats & health | ✅ (Admin/Owner) |
| GET | `/logs` | Get detailed AI transaction logs | ✅ (Admin/Owner) |
| POST | `/control` | Lock/Unlock API keys | ✅ (Owner) |
| GET | `/features` | Get AI feature flags | ✅ (Admin/Owner) |
| POST | `/features/toggle` | Enable/Disable AI features | ✅ (Owner) |

---

## 🎨 Frontend Structure

### 📁 Directory Organization

```
frontend/src/
├── 📄 App.jsx                    # Main app component with routing
├── 📄 main.jsx                   # Entry point
├── 🎨 index.css                  # Global styles (19KB)
│
├── 📁 pages/                     # Page components
│   ├── 🔐 Auth/                  # Authentication pages
│   │   ├── Login.jsx
│   │   ├── SignUp.jsx
│   │   ├── ForgotPassword.jsx
│   │   └── ResetPassword.jsx
│   │
│   ├── 🏠 Home/                  # Home pages
│   │   ├── Dashboard.jsx
│   │   └── Codebase.jsx
│   │
│   ├── 🎤 InterviewPrep/         # Interview preparation
│   │   ├── InterviewPrepModern.jsx (42KB)
│   │   ├── AnswerEditor.jsx (37KB)
│   │   ├── AddQuestionPage.jsx (35KB)
│   │   └── components/
│   │
│   ├── 📝 MCQTest/               # MCQ testing
│   │   ├── MCQTest.jsx (120KB - largest file!)
│   │   └── TestHistoryPage.jsx (43KB)
│   │
│   ├── 📄 LandingPage.jsx (33KB)
│   ├── 👤 ProfilePage.jsx (93KB)
│   ├── ✍️ NotesPage.jsx (33KB)
│   ├── 📚 ResourcesPage.jsx (34KB)
│   ├── 🔔 NotificationsPageNew.jsx
│   ├── ⚙️ SettingsPageNew.jsx
│   └── 🆘 ContactSupportPage.jsx
│
├── 📁 components/                # Reusable components
│   ├── 💬 Chatbot/
│   ├── 🎴 Cards/
│   ├── 🆘 ContactSupport/
│   ├── ❓ FAQ/
│   ├── 🔘 FloatingHelpButton/
│   ├── 🎨 ui/                    # UI primitives
│   └── 📐 layouts/
│       ├── MainLayout.jsx
│       └── ProtectedRoute.jsx
│
├── 📁 context/                   # React Context
│   ├── ChatBotContext.jsx
│   ├── TestModeContext.jsx
│   └── UserContext.jsx
│
├── 📁 utils/                     # Utility functions
│   ├── apiPaths.js              # API endpoint definitions
│   ├── axiosInstance.js         # Axios configuration
│   ├── data.js                  # Static data
│   ├── exportUtils.js           # Export functionality
│   ├── helper.js                # Helper functions
│   └── uploadImage.js           # Image upload utilities
│
├── 📁 hooks/                     # Custom React hooks
│   └── useAuth.js
│
├── 📁 lib/                       # Library configurations
│   └── utils.js
│
└── 📁 assets/                    # Static assets
    ├── images/
    └── icons/
```

---

### 🎯 Key Frontend Components

#### 1. 🔐 Protected Route
**File:** `frontend/src/components/layouts/ProtectedRoute.jsx`
- JWT token validation
- Automatic redirect to login
- User context management

#### 2. 📐 Main Layout
**File:** `frontend/src/components/layouts/MainLayout.jsx`
- Navigation header
- Sidebar (if applicable)
- Footer
- Outlet for nested routes

#### 3. 💬 Chatbot Component
**Directory:** `frontend/src/components/Chatbot/`
- Floating chat interface
- Message history
- Markdown rendering
- Code highlighting

#### 4. 🎴 Card Components
**Directory:** `frontend/src/components/Cards/`
- Reusable card layouts
- Consistent styling
- Responsive design

#### 5. 🎨 UI Components
**Directory:** `frontend/src/components/ui/`
- Button variants
- Input fields
- Modals
- Dropdowns
- Tooltips
- Progress bars
- Badges
- Alerts
- Tabs
- Accordions
- Scroll areas

---

### 🎨 Styling System

#### TailwindCSS Configuration
**File:** `frontend/tailwind.config.js`

**Custom Theme Variables:**
```css
--bg-primary: Background color
--bg-elevated: Elevated surfaces
--text-primary: Primary text
--text-secondary: Secondary text
--accent: Accent color
--success: Success color
--danger: Error color
--warning: Warning color
--border: Border color
```

**Features:**
- ✅ Dark/Light theme support
- ✅ Custom color palette
- ✅ Responsive breakpoints
- ✅ Animation utilities
- ✅ Typography plugin
- ✅ Custom animations

---

## 🤖 AI Integration

### 🧠 LangChain Implementation

#### 📚 Core Files
1. **`backend/utils/langchain-config.js`** - LangChain configuration
2. **`backend/utils/langchain-chains.js`** - Chain definitions
3. **`backend/utils/langgraph-workflows.js`** - Workflow orchestration

#### 🔗 LangChain Features

##### 1. Interview Question Generation
```javascript
// Uses structured output with Zod schemas
// Generates contextual interview questions
// Maintains conversation memory
```

**Chain Type:** `ConversationChain` with `BufferMemory`

##### 2. MCQ Generation
```javascript
// Generates multiple-choice questions
// Adaptive difficulty based on experience
// Topic-specific question generation
// Includes explanations for answers
```

**Optimization:**
- Caching mechanism (`mcq-cache.js`)
- Batch generation
- Performance monitoring (`mcq-optimizer.js`)

##### 3. Chatbot Conversations
```javascript
// Context-aware responses
// Memory-enabled conversations
// Multi-turn dialogue support
```

**Features:**
- ✅ Conversation history
- ✅ Context retention
- ✅ Structured responses
- ✅ Error handling

---

### 🌟 Google Gemini AI

**File:** `backend/utils/gemini.js`

**Integration Points:**
- Interview question generation
- MCQ creation
- Chatbot responses
- Code explanation
- Answer evaluation

**Configuration:**
```javascript
Model: gemini-pro
Temperature: 0.7
Max Tokens: 2048
Top P: 0.9
```

---

### 🎯 AI Workflow (LangGraph)

**File:** `backend/utils/langgraph-workflows.js`

**Workflow Steps:**
1. **Input Processing** → Validate and sanitize user input
2. **Context Retrieval** → Fetch relevant context from database
3. **AI Generation** → Generate response using LLM
4. **Post-Processing** → Format and validate output
5. **Response Delivery** → Send structured response

**Benefits:**
- ✅ Modular workflow design
- ✅ Error handling at each step
- ✅ State management
- ✅ Retry mechanisms
- ✅ Logging and monitoring

---

## 🔐 Authentication & Security

### 🔑 JWT Authentication

#### Token Structure
```javascript
{
  userId: ObjectId,
  email: String,
  iat: Number,
  exp: Number
}
```

**Token Expiry:** 7 days (configurable)

#### Authentication Flow
1. **Registration** → User signs up with email/password
2. **OTP Verification** → Email OTP sent for verification
3. **Login** → JWT token generated and returned
4. **Token Storage** → Stored in localStorage (frontend)
5. **Request Authentication** → Token sent in Authorization header
6. **Token Validation** → Middleware validates on each request

---

### 🔒 Password Security

**Hashing:** bcryptjs with salt rounds = 10

```javascript
// Password hashing
const hashedPassword = await bcrypt.hash(password, 10);

// Password verification
const isMatch = await bcrypt.compare(password, user.password);
```

---

### 🛡️ Security Middleware

**File:** `backend/middlewares/`

#### 1. Authentication Middleware
- Validates JWT tokens
- Extracts user information
- Handles token expiry

#### 2. Validation Middleware
- Request body validation
- Input sanitization
- XSS prevention

---

### 🔐 Security Features

#### ✅ Implemented Security Measures
- ✅ Password hashing (bcrypt)
- ✅ JWT token authentication
- ✅ CORS configuration
- ✅ Input validation (express-validator)
- ✅ Rate limiting (recommended)
- ✅ Helmet.js (recommended)
- ✅ SQL injection prevention (Mongoose)
- ✅ XSS protection
- ✅ Session management
- ✅ OTP-based operations
- ✅ Password reset tokens
- ✅ Email verification

#### 🔒 MCQ Test Security
- Fullscreen enforcement
- Tab switch detection
- Security violation tracking
- Auto-submission on violations
- Time-based auto-submit

---

## 📧 Email Services

### 📮 Email Configuration

**Primary Service:** SendGrid
**Backup Service:** Nodemailer

**Files:**
- `backend/utils/emailService.js` (51KB - comprehensive)
- `backend/utils/emailServiceSendGrid.js`
- `backend/utils/email.js`

---

### 📬 Email Templates

#### 1. 🎉 Welcome Email
- Sent on successful registration
- Includes getting started guide
- Platform overview

#### 2. 🔐 OTP Verification
- Email verification OTP
- Password reset OTP
- Account deletion confirmation

#### 3. 📝 Test Results
- MCQ test completion
- Score summary
- Performance insights
- Detailed results link

#### 4. 🔔 Notifications
- Test reminders
- Weekly digest
- Activity updates

#### 5. 🆘 Support
- Support ticket confirmation
- Response notifications

---

### 📧 Email Features
- ✅ HTML email templates
- ✅ Responsive design
- ✅ Inline CSS
- ✅ Brand styling
- ✅ Attachment support
- ✅ Error handling
- ✅ Retry mechanism
- ✅ Delivery tracking

---

## 🚀 Deployment

### 🌐 Deployment Platforms

#### Frontend Deployment
**Platform:** Azure Static Web Apps

**Configuration File:** `frontend/staticwebapp.config.json`

```json
{
  "navigationFallback": {
    "rewrite": "/index.html"
  },
  "routes": [
    {
      "route": "/api/*",
      "allowedRoles": ["anonymous"]
    }
  ]
}
```

**Build Command:** `npm run build`
**Output Directory:** `dist/`

---

#### Backend Deployment
**Platform:** Azure Web Services / Render

**Configuration File:** `backend/web.config`

**Environment Variables Required:**
```env
MONGODB_URI=<MongoDB connection string>
JWT_SECRET=<JWT secret key>
FRONTEND_URL=<Frontend URL>
SENDGRID_API_KEY=<SendGrid API key>
CLOUDINARY_CLOUD_NAME=<Cloudinary cloud name>
CLOUDINARY_API_KEY=<Cloudinary API key>
CLOUDINARY_API_SECRET=<Cloudinary API secret>
GOOGLE_AI_API_KEY=<Google Gemini API key>
OPENAI_API_KEY=<OpenAI API key>
```

---

### 🔧 Build Process

#### Frontend Build
```bash
cd frontend
npm install
npm run build
```

**Output:** `frontend/dist/`

#### Backend Build
```bash
cd backend
npm install
npm run build  # Currently just echoes "Build complete"
```

---

### 🌍 CORS Configuration

**File:** `backend/server.js`

**Allowed Origins:**
- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000`
- `process.env.FRONTEND_URL`
- `https://interviewai2-0.onrender.com`
- `*.azurestaticapps.net` (Azure Static Web Apps)

**CORS Options:**
```javascript
{
  origin: (origin, callback) => { /* validation logic */ },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "user-email"]
}
```

---

### 📊 Health Checks

**Endpoint:** `GET /api/health`

**Response:**
```json
{
  "success": true
}
```

**Root Endpoint:** `GET /`

**Response:**
```json
{
  "status": "OK",
  "message": "InterviewAI Backend is running 🚀"
}
```

---

## 🛠️ Development Guide

### 🚀 Getting Started

#### Prerequisites
- ✅ Node.js ≥ 18.0.0
- ✅ npm ≥ 9.0.0
- ✅ MongoDB instance
- ✅ Git

---

### 📥 Installation

#### 1. Clone Repository
```bash
git clone https://github.com/nirdeshbhesaniya/InterviewAI2.0.git
cd InterviewAI2.0
```

#### 2. Backend Setup
```bash
cd backend
npm install
```

**Create `.env` file:**
```env
PORT=8080
MONGODB_URI=mongodb://localhost:27017/interviewai
JWT_SECRET=your_jwt_secret_key_here
FRONTEND_URL=http://localhost:5173
NODE_ENV=development

# Email Service
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@interviewai.com

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# AI Services
GOOGLE_AI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key
```

#### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

**Create `.env` file:**
```env
VITE_API_URL=http://localhost:8080/api
VITE_APP_NAME=InterviewAI
```

---

### 🏃 Running the Application

#### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev  # Uses nodemon for auto-reload
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev  # Vite dev server on port 5173
```

**Access Application:**
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8080`
- API Health: `http://localhost:8080/api/health`

---

### 🧪 Testing

#### Backend Tests
```bash
cd backend

# Test email service
node test-email.js

# Test OTP functionality
node test-otp.js

# Test MCQ generation
node test-mcq-performance.js

# Test LangChain
node test-langchain.js

# Test SendGrid
node test-sendgrid.js

# Test resources
node test-resources.js
```

---

### 🔍 Debugging

#### Backend Debugging
- Use `console.log()` for quick debugging
- Check MongoDB logs
- Monitor API responses
- Use Postman for API testing

#### Frontend Debugging
- React DevTools
- Browser console
- Network tab for API calls
- Redux DevTools (if using Redux)

---

### 📝 Code Style

#### ESLint Configuration
**Frontend:** `frontend/eslint.config.js`

**Rules:**
- React hooks rules
- React refresh rules
- No unused variables
- Consistent formatting

**Run Linter:**
```bash
cd frontend
npm run lint
```

---

## 📊 Performance Optimization

### ⚡ Frontend Optimization

#### 1. Code Splitting
- Route-based code splitting with React.lazy()
- Dynamic imports for heavy components

#### 2. Image Optimization
- Cloudinary for image hosting
- Lazy loading images
- Responsive images

#### 3. Bundle Optimization
- Vite's built-in optimizations
- Tree shaking
- Minification
- Compression

#### 4. Caching
- Browser caching
- Service workers (recommended)
- API response caching

---

### 🚀 Backend Optimization

#### 1. Database Optimization
**File:** `backend/utils/mcq-cache.js`

- Query optimization with indexes
- Connection pooling
- Aggregation pipelines
- Lean queries

**Indexes:**
```javascript
// User model
email: unique index

// MCQTest model
userId + createdAt: compound index
userEmail + createdAt: compound index
```

#### 2. MCQ Generation Optimization
**File:** `backend/utils/mcq-optimizer.js`

**Strategies:**
- ✅ Caching frequently requested topics
- ✅ Batch generation
- ✅ Parallel processing
- ✅ Response streaming
- ✅ Performance monitoring

**Cache Implementation:**
```javascript
// Cache structure
{
  key: `${topic}_${experience}_${specialization}`,
  value: generatedQuestions,
  ttl: 3600 // 1 hour
}
```

#### 3. API Optimization
- Response compression (gzip)
- Request payload limits
- Rate limiting (recommended)
- API versioning (recommended)

---

### 📈 Monitoring & Analytics

#### Performance Metrics
- API response times
- Database query times
- AI generation times
- Error rates
- User activity

#### Recommended Tools
- 📊 Google Analytics
- 🔍 Sentry (error tracking)
- 📈 New Relic (APM)
- 🗄️ MongoDB Atlas monitoring

---

## 🐛 Testing & Debugging

### 🧪 Test Files

#### Backend Test Files
1. **`test-email.js`** (8.4KB) - Email service testing
2. **`test-otp.js`** (6KB) - OTP functionality
3. **`test-langchain.js`** (9.7KB) - LangChain integration
4. **`test-mcq-email.js`** (12.5KB) - MCQ email notifications
5. **`test-mcq-performance.js`** (6.5KB) - MCQ generation performance
6. **`test-production-email.js`** (7.7KB) - Production email testing
7. **`test-registration-email.js`** (2.8KB) - Registration emails
8. **`test-registration-otp.js`** (5.7KB) - Registration OTP
9. **`test-resources.js`** (2.7KB) - Resource management
10. **`test-sendgrid.js`** (10.5KB) - SendGrid integration

---

### 🔧 Debugging Tips

#### Common Issues & Solutions

##### 1. 🔴 MongoDB Connection Error
```
Error: MongoDB connection error
```
**Solution:**
- Check MongoDB URI in `.env`
- Ensure MongoDB is running
- Check network connectivity
- Verify credentials

##### 2. 🔴 JWT Token Invalid
```
Error: Invalid token
```
**Solution:**
- Check JWT_SECRET in `.env`
- Verify token expiry
- Clear localStorage and re-login
- Check token format

##### 3. 🔴 CORS Error
```
Error: CORS policy blocked
```
**Solution:**
- Add frontend URL to allowed origins
- Check CORS configuration in `server.js`
- Verify credentials: true

##### 4. 🔴 AI Generation Timeout
```
Error: Request timeout
```
**Solution:**
- Increase timeout limits
- Check API key validity
- Monitor API rate limits
- Implement retry logic

##### 5. 🔴 Email Not Sending
```
Error: Email send failed
```
**Solution:**
- Verify SendGrid API key
- Check email template
- Monitor SendGrid dashboard
- Check spam folder

---

## 📝 Best Practices

### ✅ Code Quality

#### 1. Component Structure
```javascript
// ✅ Good
const Component = () => {
  // Hooks
  // State
  // Effects
  // Handlers
  // Render
};

// ❌ Avoid
const Component = () => {
  // Mixed logic and rendering
};
```

#### 2. Error Handling
```javascript
// ✅ Good
try {
  const result = await apiCall();
  return result;
} catch (error) {
  console.error('Error:', error);
  toast.error('Operation failed');
  return null;
}

// ❌ Avoid
const result = await apiCall(); // No error handling
```

#### 3. API Calls
```javascript
// ✅ Good
const fetchData = async () => {
  try {
    setLoading(true);
    const response = await axios.get('/api/data');
    setData(response.data);
  } catch (error) {
    handleError(error);
  } finally {
    setLoading(false);
  }
};

// ❌ Avoid
const fetchData = async () => {
  const response = await axios.get('/api/data');
  setData(response.data);
};
```

---

### 🎯 Performance Best Practices

#### 1. Avoid Unnecessary Re-renders
```javascript
// ✅ Good
const MemoizedComponent = React.memo(Component);

// Use useMemo for expensive calculations
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);

// Use useCallback for functions
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);
```

#### 2. Optimize Database Queries
```javascript
// ✅ Good
const users = await User.find({ isActive: true })
  .select('name email')
  .limit(10)
  .lean();

// ❌ Avoid
const users = await User.find(); // Fetches all fields and documents
```

#### 3. Use Indexes
```javascript
// ✅ Good
userSchema.index({ email: 1 });
userSchema.index({ userId: 1, createdAt: -1 });
```

---

### 🔒 Security Best Practices

#### 1. Input Validation
```javascript
// ✅ Good
const { body, validationResult } = require('express-validator');

router.post('/register',
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // Process request
  }
);
```

#### 2. Password Handling
```javascript
// ✅ Good
const hashedPassword = await bcrypt.hash(password, 10);

// ❌ Avoid
const password = req.body.password; // Storing plain text
```

#### 3. Environment Variables
```javascript
// ✅ Good
const apiKey = process.env.API_KEY;

// ❌ Avoid
const apiKey = 'hardcoded-api-key';
```

---

### 📚 Documentation Best Practices

#### 1. Code Comments
```javascript
// ✅ Good
/**
 * Generates MCQ test questions using AI
 * @param {string} topic - The topic for questions
 * @param {string} experience - User experience level
 * @param {number} count - Number of questions
 * @returns {Promise<Array>} Array of generated questions
 */
const generateQuestions = async (topic, experience, count) => {
  // Implementation
};

// ❌ Avoid
const generateQuestions = async (topic, experience, count) => {
  // No documentation
};
```

#### 2. README Files
- ✅ Clear installation instructions
- ✅ Usage examples
- ✅ API documentation
- ✅ Troubleshooting guide
- ✅ Contributing guidelines

---

### 🎨 UI/UX Best Practices

#### 1. Loading States
```javascript
// ✅ Good
{loading ? <Spinner /> : <Content data={data} />}
```

#### 2. Error States
```javascript
// ✅ Good
{error && <ErrorMessage message={error} />}
```

#### 3. Empty States
```javascript
// ✅ Good
{data.length === 0 && <EmptyState message="No data found" />}
```

#### 4. Accessibility
- ✅ Semantic HTML
- ✅ ARIA labels
- ✅ Keyboard navigation
- ✅ Color contrast
- ✅ Focus indicators

---

## 🎓 Learning Resources

### 📚 Documentation Links

#### Frontend
- [React Documentation](https://react.dev/)
- [Vite Guide](https://vitejs.dev/)
- [TailwindCSS Docs](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [React Router](https://reactrouter.com/)

#### Backend
- [Express.js Guide](https://expressjs.com/)
- [MongoDB Manual](https://www.mongodb.com/docs/)
- [Mongoose Docs](https://mongoosejs.com/)
- [LangChain Docs](https://js.langchain.com/)
- [LangGraph Guide](https://langchain-ai.github.io/langgraphjs/)

#### AI & ML
- [Google Gemini AI](https://ai.google.dev/)
- [OpenAI API](https://platform.openai.com/docs)
- [LangChain Tutorials](https://js.langchain.com/docs/tutorials/)

---

## 🎉 Conclusion

This **Interview Preparation Application** is a comprehensive, modern, and scalable platform built with the MERN stack and enhanced with AI capabilities. The system provides:

### ✨ Key Strengths
1. 🤖 **AI-Powered Features** - LangChain, LangGraph, Google Gemini
2. 📊 **Comprehensive Analytics** - Detailed performance tracking
3. 🎨 **Modern UI/UX** - React 19, TailwindCSS, Framer Motion
4. 🔒 **Robust Security** - JWT, bcrypt, input validation
5. 📧 **Email Integration** - SendGrid with beautiful templates
6. 💾 **Optimized Performance** - Caching, indexing, optimization
7. 🧪 **Well-Tested** - Multiple test files for critical features
8. 📱 **Responsive Design** - Mobile-first approach
9. 🌐 **Production-Ready** - Azure deployment configuration
10. 📚 **Well-Documented** - Comprehensive codebase

### 🚀 Future Enhancements
- [ ] Real-time collaboration features
- [ ] Video interview practice
- [ ] Advanced analytics dashboard
- [ ] Mobile applications (React Native)
- [ ] Gamification elements
- [ ] Social features (sharing, leaderboards)
- [ ] Advanced AI tutoring
- [ ] Integration with job platforms
- [ ] Certification system
- [ ] Multi-language support

---

## 📞 Support & Contact

### 🆘 Getting Help
- 📧 **Email Support**: Use the in-app contact form
- 🐛 **Bug Reports**: GitHub Issues
- 💡 **Feature Requests**: GitHub Discussions
- 📚 **Documentation**: This file!

### 🤝 Contributing
Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📄 License

**MIT License**

Copyright (c) 2024 Nirdesh Bhesaniya

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

---

<div align="center">

### 🌟 Made with ❤️ by Nirdesh Bhesaniya

**InterviewAI 2.0** - Empowering Interview Success Through AI

---

**⭐ Star this repository if you find it helpful!**

**🔗 [GitHub Repository](https://github.com/nirdeshbhesaniya/InterviewAI2.0.git)**

---

*Last Updated: December 2024*

</div>

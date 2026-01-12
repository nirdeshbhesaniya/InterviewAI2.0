// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Login from './pages/Auth/Login';
import SignUp from './pages/Auth/SignUp';
import LandingPage from './pages/LandingPage';
import { Dashboard } from './pages/Home/Dashboard';
import InterviewPrepModern from './pages/InterviewPrep/InterviewPrepModern';
import AnswerEditor from './pages/InterviewPrep/AnswerEditor';
import AddQuestionPage from './pages/InterviewPrep/AddQuestionPage';
import ContactSupportPage from './pages/ContactSupportPage';
import MCQTest from './pages/MCQTest/MCQTest';
import TestHistoryPage from './pages/MCQTest/TestHistoryPage';
import PracticeTestsPage from './pages/MCQTest/PracticeTestsPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPageNew from './pages/SettingsPageNew';
import NotificationsPageNew from './pages/NotificationsPageNew';
import NotesPage from './pages/NotesPage';
import ResourcesPage from './pages/ResourcesPage';

import MainLayout from './components/layouts/MainLayout';
import ProtectedRoute from './components/layouts/ProtectedRoute';

import AdminGuard from './components/layouts/AdminGuard';
import AdminDashboard from './pages/Admin/AdminDashboard';
import CodeExecutionPlatform from './pages/Home/Codebase';

// Chatbot Components
import ChatbotProvider from './context/ChatBotContext';
import Chatbot from './components/Chatbot';
import FloatingHelpButton from './components/FloatingHelpButton';

// Test Mode Context
import { TestModeProvider } from './context/TestModeContext';

const App = () => {
  return (
    <ChatbotProvider>
      <TestModeProvider>
        <Router>
          <div className="min-h-screen bg-background text-foreground">
            <Routes>
              {/* Public routes (no header) */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/support" element={<ContactSupportPage />} />

              {/* Routes with header */}
              <Route element={<MainLayout />}>
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/codebase"
                  element={
                    <ProtectedRoute>
                      <CodeExecutionPlatform />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/mcq-test"
                  element={
                    <ProtectedRoute>
                      <MCQTest />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/mcq-test/practice"
                  element={
                    <ProtectedRoute>
                      <PracticeTestsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/mcq-test/practice/:testId"
                  element={
                    <ProtectedRoute>
                      <MCQTest />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/mcq-test/history"
                  element={
                    <ProtectedRoute>
                      <TestHistoryPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/interview-prep/:sessionId"
                  element={
                    <ProtectedRoute>
                      <InterviewPrepModern />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/interview-prep/:sessionId/add"
                  element={
                    <ProtectedRoute>
                      <AddQuestionPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/interview-prep/:sessionId/edit"
                  element={
                    <ProtectedRoute>
                      <AnswerEditor />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <SettingsPageNew />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/notifications"
                  element={
                    <ProtectedRoute>
                      <NotificationsPageNew />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/notes"
                  element={
                    <ProtectedRoute>
                      <NotesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/resources"
                  element={
                    <ProtectedRoute>
                      <ResourcesPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <AdminGuard>
                        <AdminDashboard />
                      </AdminGuard>
                    </ProtectedRoute>
                  }
                />
              </Route>
            </Routes>

            {/* Global Chatbot - Available on all routes */}
            <Chatbot />

            {/* Global Help Button - Available on all routes */}
            <FloatingHelpButton />

            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'rgb(var(--bg-elevated))',
                  color: 'rgb(var(--text-primary))',
                  border: '1px solid rgb(var(--border))',
                  borderRadius: '12px',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                  padding: '12px 16px',
                  fontSize: '14px',
                  fontWeight: '500',
                  maxWidth: '400px',
                  width: '100%',
                },
                className: 'toast-custom',
                success: {
                  duration: 3500,
                  style: {
                    background: 'rgb(var(--bg-elevated))',
                    color: 'rgb(var(--text-primary))',
                    border: '2px solid rgb(var(--success))',
                    borderRadius: '12px',
                    boxShadow: '0 8px 24px rgba(34, 197, 94, 0.15)',
                  },
                  iconTheme: {
                    primary: 'rgb(var(--success))',
                    secondary: 'rgb(var(--bg-elevated))',
                  },
                },
                error: {
                  duration: 4500,
                  style: {
                    background: 'rgb(var(--bg-elevated))',
                    color: 'rgb(var(--text-primary))',
                    border: '2px solid rgb(var(--danger))',
                    borderRadius: '12px',
                    boxShadow: '0 8px 24px rgba(239, 68, 68, 0.15)',
                  },
                  iconTheme: {
                    primary: 'rgb(var(--danger))',
                    secondary: 'rgb(var(--bg-elevated))',
                  },
                },
                loading: {
                  style: {
                    background: 'rgb(var(--bg-elevated))',
                    color: 'rgb(var(--text-primary))',
                    border: '2px solid rgb(var(--accent))',
                    borderRadius: '12px',
                    boxShadow: '0 8px 24px rgba(59, 130, 246, 0.15)',
                  },
                  iconTheme: {
                    primary: 'rgb(var(--accent))',
                    secondary: 'rgb(var(--bg-elevated))',
                  },
                },
              }}
            />
          </div>
        </Router>
      </TestModeProvider>
    </ChatbotProvider>
  );
};

export default App;

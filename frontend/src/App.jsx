// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Login from './pages/Auth/Login';
import SignUp from './pages/Auth/SignUp';
import LandingPage from './pages/LandingPage';
import { Dashboard } from './pages/Home/Dashboard';
import InterviewPrepModern from './pages/InterviewPrep/InterviewPrepModern';
import ContactSupportPage from './pages/ContactSupportPage';
import MCQTest from './pages/MCQTest/MCQTest';
import TestHistoryPage from './pages/MCQTest/TestHistoryPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPageNew from './pages/SettingsPageNew';
import NotificationsPageNew from './pages/NotificationsPageNew';
import NotesPage from './pages/NotesPage';

import MainLayout from './components/layouts/MainLayout';
import ProtectedRoute from './components/layouts/ProtectedRoute';
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
              </Route>
            </Routes>

            {/* Global Chatbot - Available on all routes */}
            <Chatbot />

            {/* Global Help Button - Available on all routes */}
            <FloatingHelpButton />

            <Toaster
              position="top-center"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#363636',
                  color: '#fff',
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

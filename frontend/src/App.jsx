// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Login from './pages/Auth/Login';
import SignUp from './pages/Auth/SignUp';
import LandingPage from './pages/LandingPage';
import OldLandingPage from './pages/LandingPage_backup';
import { Dashboard } from './pages/Home/Dashboard';
import InterviewPrepModern from './pages/InterviewPrep/InterviewPrepModern';
import AnswerEditor from './pages/InterviewPrep/AnswerEditor';
import AddQuestionPage from './pages/InterviewPrep/AddQuestionPage';
import ContactSupportPage from './pages/ContactSupportPage';
import ExploreFeaturesPage from './pages/ExploreFeaturesPage';

import MCQTest from './pages/MCQTest/MCQTest';
import TestHistoryPage from './pages/MCQTest/TestHistoryPage';
import PracticeTestsPage from './pages/MCQTest/PracticeTestsPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPageNew from './pages/SettingsPageNew';
import NotificationPage from './pages/InterviewPrep/NotificationPage';
import NotesPage from './pages/NotesPage';
import ResourcesPage from './pages/ResourcesPage';
import MockInterviewDashboard from './pages/MockInterview/MockInterviewDashboard';
import CreateMockInterview from './pages/MockInterview/CreateMockInterview';
import ActiveInterview from './pages/MockInterview/ActiveInterview';
import InterviewResult from './pages/MockInterview/InterviewResult';
import InterviewDetails from './pages/MockInterview/InterviewDetails';

import MainLayout from './components/layouts/MainLayout';
import ProtectedRoute from './components/layouts/ProtectedRoute';
import DesktopOnlyGuard from './components/layouts/DesktopOnlyGuard';
import FeatureLockGuard from './components/layouts/FeatureLockGuard';

import AdminGuard from './components/layouts/AdminGuard';
import AdminDashboard from './pages/Admin/AdminDashboard';
import CodeExecutionPlatform from './pages/Home/Codebase';

// Chatbot Components
import ChatbotProvider from './context/ChatBotContext';
import Chatbot from './components/Chatbot';
import FloatingHelpButton from './components/FloatingHelpButton';

// Test Mode Context
import { TestModeProvider } from './context/TestModeContext';
import { InterviewModeProvider } from './context/InterviewModeContext';

const App = () => {
  return (
    <ChatbotProvider>
      <TestModeProvider>
        <InterviewModeProvider>
          <Router>
            <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
              <Routes>
                {/* Public routes (no header) */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/old-landing" element={<OldLandingPage />} />
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
                        <FeatureLockGuard featureKey="code_execution" title="Code Execution" description="The code workspace and compilation API are locked by an administrator.">
                          <CodeExecutionPlatform />
                        </FeatureLockGuard>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/explore"
                    element={
                      <ProtectedRoute>
                        <ExploreFeaturesPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/mcq-test"
                    element={
                      <ProtectedRoute>
                        <FeatureLockGuard featureKey="ai_mcq_generation" title="AI MCQ Test" description="MCQ generation has been locked by an administrator.">
                          <DesktopOnlyGuard featureName="AI MCQ Test">
                            <MCQTest />
                          </DesktopOnlyGuard>
                        </FeatureLockGuard>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/mcq-test/practice"
                    element={
                      <ProtectedRoute>
                        <FeatureLockGuard featureKey="practice_tests" title="Practice Tests" description="The practice test library is currently unavailable.">
                          <DesktopOnlyGuard featureName="Practice Tests">
                            <PracticeTestsPage />
                          </DesktopOnlyGuard>
                        </FeatureLockGuard>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/mcq-test/practice/:testId"
                    element={
                      <ProtectedRoute>
                        <FeatureLockGuard featureKey="practice_tests" title="Practice Test" description="This practice test is currently locked.">
                          <DesktopOnlyGuard featureName="Practice Test">
                            <MCQTest />
                          </DesktopOnlyGuard>
                        </FeatureLockGuard>
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
                        <FeatureLockGuard featureKey="ai_interview_generation" title="AI Interview Generation" description="Interview generation and AI assistance are currently locked by an administrator.">
                          <InterviewPrepModern />
                        </FeatureLockGuard>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/interview-prep/:sessionId/add"
                    element={
                      <ProtectedRoute>
                        <FeatureLockGuard featureKey="ai_interview_generation" title="AI Interview Generation" description="Interview generation and AI assistance are currently locked by an administrator.">
                          <AddQuestionPage />
                        </FeatureLockGuard>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/interview-prep/:sessionId/edit"
                    element={
                      <ProtectedRoute>
                        <FeatureLockGuard featureKey="ai_interview_generation" title="AI Interview Generation" description="Interview generation and AI assistance are currently locked by an administrator.">
                          <AnswerEditor />
                        </FeatureLockGuard>
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
                        <NotificationPage />
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


                  {/* Mock Interview Routes */}
                  <Route
                    path="/mock-interview"
                    element={
                      <ProtectedRoute>
                        <FeatureLockGuard featureKey="mock_interview" title="Mock Interview" description="The mock interview workflow is locked right now.">
                          <DesktopOnlyGuard featureName="Mock Interview">
                            <MockInterviewDashboard />
                          </DesktopOnlyGuard>
                        </FeatureLockGuard>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/mock-interview/create"
                    element={
                      <ProtectedRoute>
                        <FeatureLockGuard featureKey="mock_interview" title="Mock Interview" description="The mock interview workflow is locked right now.">
                          <DesktopOnlyGuard featureName="Mock Interview">
                            <CreateMockInterview />
                          </DesktopOnlyGuard>
                        </FeatureLockGuard>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/mock-interview/:mockId"
                    element={
                      <ProtectedRoute>
                        <FeatureLockGuard featureKey="mock_interview" title="Mock Interview" description="The mock interview workflow is locked right now.">
                          <DesktopOnlyGuard featureName="Mock Interview">
                            <InterviewDetails />
                          </DesktopOnlyGuard>
                        </FeatureLockGuard>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/mock-interview/:mockId/start"
                    element={
                      <ProtectedRoute>
                        <FeatureLockGuard featureKey="mock_interview" title="Mock Interview" description="The mock interview workflow is locked right now.">
                          <DesktopOnlyGuard featureName="Mock Interview">
                            <ActiveInterview />
                          </DesktopOnlyGuard>
                        </FeatureLockGuard>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/mock-interview/:mockId/feedback"
                    element={
                      <ProtectedRoute>
                        <FeatureLockGuard featureKey="mock_interview" title="Mock Interview" description="The mock interview workflow is locked right now.">
                          <DesktopOnlyGuard featureName="Mock Interview">
                            <InterviewResult />
                          </DesktopOnlyGuard>
                        </FeatureLockGuard>
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
        </InterviewModeProvider>
      </TestModeProvider>
    </ChatbotProvider>
  );
};

export default App;

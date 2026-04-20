import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StudyProvider } from './context/StudyContext';
import { AuthProvider } from './context/AuthContext';
import { FocusProvider } from './context/FocusContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import './index.css';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

// Lazy load pages
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Subjects  = React.lazy(() => import('./pages/Subjects'));
const Tasks     = React.lazy(() => import('./pages/Tasks'));
const Revision  = React.lazy(() => import('./pages/Revision'));
const AITools   = React.lazy(() => import('./pages/AITools'));
const Focus     = React.lazy(() => import('./pages/Focus'));
const Login     = React.lazy(() => import('./pages/Login'));
const Signup    = React.lazy(() => import('./pages/Signup'));
import ThemeToggle from './components/ThemeToggle';

function App() {
  React.useEffect(() => {
    // Theme initialization
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <AuthProvider>
      <StudyProvider>
        {/*
         * FocusProvider wraps BrowserRouter so the persistent YouTube iframe
         * lives above the router tree and is NEVER unmounted on route changes.
         * This is what keeps music playing across navigation.
         */}
        <FocusProvider>
        <BrowserRouter>
          <React.Suspense fallback={
            <div className="min-h-screen bg-background flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          }>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="subjects"  element={<Subjects />} />
                  <Route path="tasks"     element={<Tasks />} />
                  <Route path="revision"  element={<Revision />} />
                  <Route path="ai-tools" element={<AITools />} />
                  <Route path="focus"    element={<Focus />} />
                </Route>
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </React.Suspense>
          <ThemeToggle floating={true} />
          <ToastContainer position="bottom-right" theme="dark" />
        </BrowserRouter>
        </FocusProvider>
      </StudyProvider>
    </AuthProvider>
  );
}

export default App;


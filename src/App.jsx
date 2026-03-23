import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StudyProvider } from './context/StudyContext';
import Layout from './components/Layout';
import './styles/global.css';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

// Lazy load pages
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Subjects = React.lazy(() => import('./pages/Subjects'));
const Tasks = React.lazy(() => import('./pages/Tasks'));
const Revision = React.lazy(() => import('./pages/Revision'));
const AITools = React.lazy(() => import('./pages/AITools'));

function App() {
  return (
    <StudyProvider>
      <BrowserRouter>
        <React.Suspense fallback={<div className="loading">Loading...</div>}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="subjects" element={<Subjects />} />
              <Route path="tasks" element={<Tasks />} />
              <Route path="revision" element={<Revision />} />
              <Route path="ai-tools" element={<AITools />} />
            </Route>
          </Routes>
        </React.Suspense>
        <ToastContainer position="bottom-right" theme="dark" />
      </BrowserRouter>
    </StudyProvider>
  );
}

export default App;

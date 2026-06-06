import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from './store/useStore';
import { SplashPage } from './pages/SplashPage';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { UploadPage } from './pages/UploadPage';
import { AnalysisPage } from './pages/AnalysisPage';
import { LabPage } from './pages/LabPage';
import { FreezePage } from './pages/FreezePage';
import { JobPage } from './pages/JobPage';
import { AccountPage } from './pages/AccountPage';
import { TermsPage } from './pages/TermsPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { BottomNavigation } from './components/BottomNavigation';
import { DesktopSidebar } from './components/DesktopSidebar';

const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.25 }}
  >
    {children}
  </motion.div>
);

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useStore(s => s.isAuthenticated);
  const showSplash = useStore(s => s.showSplash);
  if (showSplash) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { showSplash, isAuthenticated } = useStore();

  if (showSplash) return <SplashPage />;

  return (
    <div className="min-h-screen bg-[#050505]" dir="rtl">
      <DesktopSidebar />
      <div className="md:pr-56">
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={
              isAuthenticated
                ? <Navigate to="/dashboard" replace />
                : <PageWrapper><LandingPage /></PageWrapper>
            } />
            <Route path="/landing" element={<PageWrapper><LandingPage /></PageWrapper>} />
            <Route path="/login" element={
              isAuthenticated
                ? <Navigate to="/dashboard" replace />
                : <PageWrapper><LoginPage /></PageWrapper>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute><PageWrapper><DashboardPage /></PageWrapper></ProtectedRoute>
            } />
            <Route path="/upload" element={
              <ProtectedRoute><PageWrapper><UploadPage /></PageWrapper></ProtectedRoute>
            } />
            <Route path="/analysis" element={
              <ProtectedRoute><PageWrapper><AnalysisPage /></PageWrapper></ProtectedRoute>
            } />
            <Route path="/lab" element={
              <ProtectedRoute><PageWrapper><LabPage /></PageWrapper></ProtectedRoute>
            } />
            <Route path="/freeze" element={
              <ProtectedRoute><PageWrapper><FreezePage /></PageWrapper></ProtectedRoute>
            } />
            <Route path="/job" element={
              <ProtectedRoute><PageWrapper><JobPage /></PageWrapper></ProtectedRoute>
            } />
            <Route path="/account" element={
              <ProtectedRoute><PageWrapper><AccountPage /></PageWrapper></ProtectedRoute>
            } />
            <Route path="/terms" element={<PageWrapper><TermsPage /></PageWrapper>} />
            <Route path="/privacy" element={<PageWrapper><PrivacyPage /></PageWrapper>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </div>
      {isAuthenticated && <BottomNavigation />}
    </div>
  );
}

function App() {
  return (
    <HashRouter>
      <AppRoutes />
    </HashRouter>
  );
}

export default App;

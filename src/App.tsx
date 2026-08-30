import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GalaxyCanvas } from './components/canvas/GalaxyCanvas';
import { Navbar } from './components/ui/Navbar';
import { LandingPage } from './pages/LandingPage';
import { ExplorePage } from './pages/ExplorePage';
import { AnalyzePage } from './pages/AnalyzePage';
import { SolarSystemPage } from './pages/SolarSystemPage';
import { DashboardPage } from './pages/DashboardPage';
import { AboutPage } from './pages/AboutPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { useAuthStore } from './store/useAuthStore';

export const App: React.FC = () => {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <Router>
      <div className="relative min-h-screen bg-void text-starwhite select-none overflow-x-hidden">
        {/* Persistent 3D WebGL Canvas Layer */}
        <GalaxyCanvas />

        {/* Fixed Corner Navigation Bar */}
        <Navbar />

        {/* Application Page Routing */}
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route
            path="/analyze"
            element={
              <ProtectedRoute>
                <AnalyzePage />
              </ProtectedRoute>
            }
          />
          <Route path="/galaxy/:repoId" element={<SolarSystemPage />} />
          <Route path="/galaxy/*" element={<SolarSystemPage />} />
          <Route
            path="/dashboard/:repoId"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<NotFoundPage />} />

        </Routes>
      </div>
    </Router>
  );
};

export default App;


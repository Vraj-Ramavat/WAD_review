import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GalaxyCanvas } from './components/canvas/GalaxyCanvas';
import { Navbar } from './components/ui/Navbar';
import { LandingPage } from './pages/LandingPage';
import { ExplorePage } from './pages/ExplorePage';
import { AnalyzePage } from './pages/AnalyzePage';
import { SolarSystemPage } from './pages/SolarSystemPage';
import { DashboardPage } from './pages/DashboardPage';
import { AboutPage } from './pages/AboutPage';
import { NotFoundPage } from './pages/NotFoundPage';

export const App: React.FC = () => {
  return (
    <Router>
      <div className="relative min-h-screen bg-void text-starwhite select-none overflow-x-hidden">
        {/* Persistent 3D WebGL Canvas Layer */}
        <GalaxyCanvas />

        {/* Fixed Corner Navigation Bar (Fix #1: Prevents dead ends) */}
        <Navbar />

        {/* Application Page Routing */}
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/analyze" element={<AnalyzePage />} />
          <Route path="/galaxy/:repoId" element={<SolarSystemPage />} />
          <Route path="/dashboard/:repoId" element={<DashboardPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;

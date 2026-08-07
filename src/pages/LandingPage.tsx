import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, ArrowRight, ShieldAlert, Clock, Network, Terminal, Sparkles } from 'lucide-react';
import { useViewStore } from '../store/useViewStore';
import { useGalaxyStore } from '../store/useGalaxyStore';
import { MicroCanvas } from '../components/canvas/MicroCanvas';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const setCanvasMode = useViewStore((state) => state.setCanvasMode);
  const featuredRepos = useGalaxyStore((state) => state.featuredRepos);

  const [inputUrl, setInputUrl] = useState('');

  useEffect(() => {
    setCanvasMode('ambient');
  }, [setCanvasMode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;
    navigate(`/analyze?url=${encodeURIComponent(inputUrl.trim())}`);
  };

  return (
    <div className="ui-overlay min-h-screen flex flex-col justify-between px-6 md:px-16 py-12 text-starwhite">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto text-center mt-12 space-y-8 ui-interactive">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full instrument-panel border-amber/40 text-xs font-mono text-amber">
          <Sparkles className="w-3.5 h-3.5" />
          <span>CodeGalaxy WebGL v3 — Solar Systems & Milky Way Hub</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-serif font-extrabold tracking-tight leading-tight text-starwhite drop-shadow-md">
          Every repository is a galaxy. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber via-starwhite to-copper">
            See yours.
          </span>
        </h1>

        <p className="text-base md:text-lg text-slate max-w-2xl mx-auto font-sans leading-relaxed">
          Transform any public GitHub repository into a 3D Solar System. Folders orbit as planets, files as moons sized by LOC and colored by ML bug-risk.
        </p>

        {/* Input & Action Buttons */}
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-xl mx-auto pt-4">
          <div className="relative w-full">
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="github.com/facebook/react or username/repo"
              className="w-full px-4 py-3.5 rounded bg-deepspace/90 border border-amber/60 text-starwhite placeholder-slate focus:outline-none focus:border-amber focus:ring-1 focus:ring-amber font-mono text-sm shadow-xl"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3.5 rounded bg-amber text-void font-bold text-sm font-sans hover:bg-amber/90 transition-all flex items-center justify-center gap-2 whitespace-nowrap shadow-lg hover:shadow-amber/20"
            >
              <span>Analyze Repo</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => navigate('/explore')}
              className="w-full sm:w-auto px-5 py-3.5 rounded instrument-panel border-brass/50 text-starwhite hover:border-amber text-sm font-sans flex items-center justify-center gap-2 whitespace-nowrap transition-colors"
            >
              <Compass className="w-4 h-4 text-databhlue" />
              <span>Explore Hub</span>
            </button>
          </div>
        </form>

        {/* Quick Sample Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-mono text-slate pt-2">
          <span>Popular Repos:</span>
          {featuredRepos.slice(0, 4).map((repo) => (
            <button
              key={repo.id}
              onClick={() => navigate(`/analyze?url=${encodeURIComponent(repo.url)}`)}
              className="px-2.5 py-1 rounded bg-deepspace border border-brass/30 hover:border-amber/50 hover:text-amber transition-colors"
            >
              {repo.name}
            </button>
          ))}
        </div>
      </div>

      {/* 3-Column Feature Strip */}
      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-6 my-16 ui-interactive">
        <div className="p-6 rounded instrument-panel space-y-3">
          <MicroCanvas type="planet" />
          <div className="flex items-center gap-2 text-amber font-serif font-bold text-lg">
            <ShieldAlert className="w-5 h-5 text-copper" />
            <span>ML Bug-Risk Scoring</span>
          </div>
          <p className="text-xs text-slate font-sans leading-relaxed">
            Folders and file moons are colored along an amber-to-copper gradient based on machine learning defect prediction algorithms.
          </p>
        </div>

        <div className="p-6 rounded instrument-panel space-y-3">
          <MicroCanvas type="meteor" />
          <div className="flex items-center gap-2 text-amber font-serif font-bold text-lg">
            <Clock className="w-5 h-5 text-amber" />
            <span>Time-Travel Scrubber</span>
          </div>
          <p className="text-xs text-slate font-sans leading-relaxed">
            Drag the time slider to scrub through commit history. Watch meteor commit trails light up historical code evolution.
          </p>
        </div>

        <div className="p-6 rounded instrument-panel space-y-3">
          <MicroCanvas type="threads" />
          <div className="flex items-center gap-2 text-amber font-serif font-bold text-lg">
            <Network className="w-5 h-5 text-databhlue" />
            <span>Dependency Web</span>
          </div>
          <p className="text-xs text-slate font-sans leading-relaxed">
            Toggle connective threads between moons across planetary orbits to visualize module references and cross-file dependencies.
          </p>
        </div>
      </div>

      {/* How it reads your repo flow */}
      <div className="max-w-4xl mx-auto w-full p-8 rounded instrument-panel space-y-6 my-8 ui-interactive text-center">
        <h3 className="text-xl font-serif font-bold text-starwhite flex items-center justify-center gap-2">
          <Terminal className="w-5 h-5 text-brass" />
          <span>How CodeGalaxy Reads Your Repo</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left font-mono text-xs">
          <div className="p-4 rounded bg-deepspace border border-brass/30">
            <div className="text-amber font-bold mb-1">01. Fetch & Parse</div>
            <p className="text-slate font-sans">Extracts file tree, commit history, author telemetry, and lines of code (LOC).</p>
          </div>
          <div className="p-4 rounded bg-deepspace border border-brass/30">
            <div className="text-copper font-bold mb-1">02. Score & Classify</div>
            <p className="text-slate font-sans">Runs defect prediction models to assign bug-risk scores and classify commits.</p>
          </div>
          <div className="p-4 rounded bg-deepspace border border-brass/30">
            <div className="text-databhlue font-bold mb-1">03. Render Solar System</div>
            <p className="text-slate font-sans">Generates 3D Sun, folder planets, file moons, and interactive 3D WebGL orbits.</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="pt-8 border-t border-brass/30 text-center font-mono text-xs text-slate ui-interactive">
        <span>CodeGalaxy WebGL — Built with React Three Fiber, GSAP & Zustand</span>
      </footer>
    </div>
  );
};

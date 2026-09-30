import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Search, Sparkles, HelpCircle, X, ChevronUp, ChevronDown } from 'lucide-react';
import { useViewStore } from '../store/useViewStore';
import { useGalaxyStore } from '../store/useGalaxyStore';

export const ExplorePage: React.FC = () => {
  const navigate = useNavigate();
  const setCanvasMode = useViewStore((state) => state.setCanvasMode);
  const featuredRepos = useGalaxyStore((state) => state.featuredRepos);
  const searchedRepo = useGalaxyStore((state) => state.searchedRepo);

  const [searchInput, setSearchInput] = useState('');
  const [isLegendOpen, setIsLegendOpen] = useState(true);

  useEffect(() => {
    setCanvasMode('milkyway');
  }, [setCanvasMode]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    navigate(`/analyze?url=${encodeURIComponent(searchInput.trim())}`);
  };

  return (
    <div className="ui-overlay min-h-screen px-4 sm:px-6 pt-20 sm:pt-24 pb-4 font-mono text-starwhite flex flex-col justify-between">
      {/* Top Bar Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md instrument-panel text-amber">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-serif font-bold text-starwhite">Milky Way Galaxy Hub</h2>
            <p className="text-xs text-slate font-sans">Each mini spiral galaxy is a repository. Click any galaxy to enter its 3D Solar System.</p>
          </div>
        </div>

        {/* Quick Search Widget */}
        <form onSubmit={handleSearchSubmit} className="ui-interactive flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="w-3.5 h-3.5 text-slate absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search another repo..."
              className="pl-8 pr-3 py-1.5 rounded bg-deepspace/90 border border-brass/40 text-xs text-starwhite placeholder-slate focus:outline-none focus:border-amber w-full sm:w-64"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 rounded bg-amber text-void font-bold text-xs hover:bg-amber/90 transition-colors"
          >
            Analyze
          </button>
        </form>
      </div>

      {/* Bottom-Left Fixed Collapsible Legend Key (Fix #1: Never blocks center canvas) */}
      <div className="fixed bottom-16 left-4 sm:left-6 z-40 font-mono text-xs ui-interactive max-w-[calc(100vw-2rem)]">
        {isLegendOpen ? (
          <div className="p-3 rounded-md instrument-panel border-brass/30 text-xs space-y-2 max-w-xs shadow-2xl bg-deepspace/80 backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-brass/20 pb-1.5">
              <div className="flex items-center gap-1.5 text-amber font-semibold text-[11px]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Galaxy Telemetry Key</span>
              </div>
              <button
                type="button"
                onClick={() => setIsLegendOpen(false)}
                className="p-0.5 text-slate hover:text-starwhite rounded transition-colors"
                title="Collapse Legend"
                aria-label="Collapse galaxy legend"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex flex-col gap-1.5 text-[10px]">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-amber animate-pulse shadow-[0_0_6px_#E8A33D]" />
                <span className="text-starwhite">Searched Repository Galaxy</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-databhlue" />
                <span className="text-slate">Curated Famous Repositories</span>
              </div>
            </div>

            {searchedRepo && (
              <div className="pt-1.5 border-t border-brass/20 text-[10px] text-amber">
                ★ Highlighted: <span className="underline font-bold">{searchedRepo.name}</span>
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsLegendOpen(true)}
            aria-label="Expand galaxy legend"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md instrument-panel border-brass/30 text-[11px] text-slate hover:text-amber transition-colors shadow-lg"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber" />
            <span>Legend</span>
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Bottom Footer Helper */}
      <div className="flex items-center justify-between gap-4 text-[10px] sm:text-xs text-slate border-t border-brass/30 pt-3">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-3.5 h-3.5 text-brass" />
          <span className="font-sans">Rotate and zoom freely. Hover galaxy markers to inspect stars count and health score.</span>
        </div>
        <div>
          Showing {featuredRepos.length} Repositories in local galaxy
        </div>
      </div>
    </div>
  );
};

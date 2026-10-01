import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Compass } from 'lucide-react';
import { useRepoStore } from '../store/useRepoStore';
import { useViewStore } from '../store/useViewStore';
import { HealthBadge } from '../components/ui/HealthBadge';
import { ViewModeToggle } from '../components/ui/ViewModeToggle';
import { TimeTravelSlider } from '../components/ui/TimeTravelSlider';
import { DetailDrawer } from '../components/ui/DetailDrawer';
import { ChatAssistant } from '../components/ui/ChatAssistant';

export const SolarSystemPage: React.FC = () => {
  const params = useParams();
  const repoId = params['*'] || params.repoId;
  const navigate = useNavigate();


  const currentRepo = useRepoStore((state) => state.currentRepo);
  const loadRepoById = useRepoStore((state) => state.loadRepoById);
  const setCanvasMode = useViewStore((state) => state.setCanvasMode);
  const setHasEnteredSystem = useViewStore((state) => state.setHasEnteredSystem);
  const setSelectedPlanetId = useViewStore((state) => state.setSelectedPlanetId);
  const setSelectedFileId = useViewStore((state) => state.setSelectedFileId);
  const setChatOpen = useViewStore((state) => state.setChatOpen);

  // Fix #5: Guard against direct or unpopulated access
  useEffect(() => {
    let repoToUse = currentRepo;

    if (!repoToUse && repoId) {
      const loaded = loadRepoById(repoId);
      if (!loaded) {
        // Redirect if invalid/unpopulated repo
        navigate('/explore');
        return;
      }
    } else if (!repoToUse) {
      navigate('/explore');
      return;
    }

    setCanvasMode('solarsystem');
    setHasEnteredSystem(true);
  }, [repoId, currentRepo, loadRepoById, setCanvasMode, setHasEnteredSystem, navigate]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setSelectedPlanetId(null);
      setSelectedFileId(null);
      setChatOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setChatOpen, setSelectedFileId, setSelectedPlanetId]);

  if (!currentRepo) return null;

  return (
    <div className="ui-overlay min-h-screen text-starwhite">
      {/* Top Left: Repo Health Badge */}
      <HealthBadge repo={currentRepo} />

      {/* Top Right: View Mode Toggles */}
      <ViewModeToggle />

      {/* "Back to Galaxy" Button (Fix #7: Returns to /explore) */}
      <button
        onClick={() => {
          setCanvasMode('milkyway');
          navigate('/explore');
        }}
        className="solar-back-button fixed z-40 flex items-center gap-1.5 px-3 py-2 rounded-md instrument-panel border-brass/40 text-xs font-mono text-slate hover:text-amber transition-colors ui-interactive focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <Compass className="w-3.5 h-3.5 text-databhlue" />
        <span>Back to Galaxy Hub</span>
      </button>

      {/* Bottom Full-Width Time-Travel Slider */}
      <TimeTravelSlider commits={currentRepo.commits} />

      {/* Right Side: Planet & Moon Detail Drawer */}
      <DetailDrawer repo={currentRepo} />

      {/* Bottom Right: AI Chat Assistant Orb & Drawer */}
      <ChatAssistant />
    </div>
  );
};

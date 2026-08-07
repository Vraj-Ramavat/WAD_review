import React from 'react';
import { Layers, Network, Users, RotateCcw } from 'lucide-react';
import { useViewStore } from '../../store/useViewStore';
import { ViewMode } from '../../types';

interface ViewModeToggleProps {
  onResetCamera?: () => void;
}

export const ViewModeToggle: React.FC<ViewModeToggleProps> = ({ onResetCamera }) => {
  const viewMode = useViewStore((state) => state.viewMode);
  const setViewMode = useViewStore((state) => state.setViewMode);
  const resetView = useViewStore((state) => state.resetView);

  const handleToggle = (mode: ViewMode) => {
    setViewMode(mode);
  };

  const handleReset = () => {
    resetView();
    if (onResetCamera) onResetCamera();
  };

  return (
    <div className="fixed top-16 right-6 z-40 flex items-center gap-1 p-1 rounded-md instrument-panel font-mono text-xs">
      <button
        onClick={() => handleToggle('default')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded relative transition-all ${
          viewMode === 'default' ? 'text-amber font-semibold' : 'text-slate hover:text-starwhite'
        }`}
      >
        <Layers className="w-3.5 h-3.5" />
        <span>Default</span>
        {viewMode === 'default' && (
          <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-amber rounded-full shadow-[0_0_6px_#E8A33D]" />
        )}
      </button>

      <button
        onClick={() => handleToggle('dependency')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded relative transition-all ${
          viewMode === 'dependency' ? 'text-databhlue font-semibold' : 'text-slate hover:text-starwhite'
        }`}
      >
        <Network className="w-3.5 h-3.5" />
        <span>Dependency Web</span>
        {viewMode === 'dependency' && (
          <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-databhlue rounded-full shadow-[0_0_6px_#4C7A9E]" />
        )}
      </button>

      <button
        onClick={() => handleToggle('ownership')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded relative transition-all ${
          viewMode === 'ownership' ? 'text-brass font-semibold' : 'text-slate hover:text-starwhite'
        }`}
      >
        <Users className="w-3.5 h-3.5" />
        <span>Ownership Map</span>
        {viewMode === 'ownership' && (
          <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-brass rounded-full shadow-[0_0_6px_#B08D57]" />
        )}
      </button>

      <div className="h-4 w-[1px] bg-brass/30 mx-1" />

      <button
        onClick={handleReset}
        title="Reset Camera & Selection"
        className="p-1.5 text-slate hover:text-amber rounded transition-colors"
      >
        <RotateCcw className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

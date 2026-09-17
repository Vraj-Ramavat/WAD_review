import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Compass, AlertOctagon } from 'lucide-react';
import { useViewStore } from '../store/useViewStore';

export const NotFoundPage: React.FC = () => {
  const setCanvasMode = useViewStore((state) => state.setCanvasMode);

  useEffect(() => {
    setCanvasMode('ambient');
  }, [setCanvasMode]);

  return (
    <div className="ui-overlay min-h-screen flex items-center justify-center p-6 text-starwhite font-mono">
      <div className="max-w-md w-full p-8 rounded-md instrument-panel border-copper/40 text-center space-y-6 ui-interactive shadow-2xl">
        <div className="flex justify-center text-copper">
          <AlertOctagon className="w-12 h-12" />
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-serif font-extrabold text-starwhite">404</h1>
          <p className="text-sm text-copper font-bold uppercase">Sector Uncharted</p>
          <p className="text-xs text-slate font-sans leading-relaxed pt-2">
            That repository or route fell outside the observable CodeGalaxy universe.
          </p>
        </div>

        <div className="pt-4 border-t border-brass/30">
          <Link
            to="/explore"
            className="px-5 py-3 rounded bg-amber text-void font-bold text-xs font-sans inline-flex items-center gap-2 hover:bg-amber/90 transition-colors shadow-lg"
          >
            <Compass className="w-4 h-4" />
            <span>Return to Milky Way Hub</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle2, Terminal } from 'lucide-react';
import { useViewStore } from '../store/useViewStore';
import { useGalaxyStore } from '../store/useGalaxyStore';
import { useRepoStore } from '../store/useRepoStore';

const STAGES = [
  'Fetching commit history from GitHub API...',
  'Extracting AST file structures and folder depth...',
  'Scoring bug-risk with machine learning models...',
  'Classifying commits into feature, bugfix, refactor...',
  'Placing star coordinates in Milky Way Hub...',
  'Rendering 3D Solar System & planetary orbits...'
];

export const AnalyzePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const rawUrl = searchParams.get('url') || 'facebook/react';

  const setCanvasMode = useViewStore((state) => state.setCanvasMode);
  const setHasEnteredSystem = useViewStore((state) => state.setHasEnteredSystem);
  const addSearchedRepo = useGalaxyStore((state) => state.addSearchedRepo);
  const setCurrentRepo = useRepoStore((state) => state.setCurrentRepo);

  const [currentStage, setCurrentStage] = useState(0);

  useEffect(() => {
    setCanvasMode('ambient');

    // Progress pipeline timer simulation
    const interval = setInterval(() => {
      setCurrentStage((prev) => {
        if (prev < STAGES.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          return prev;
        }
      });
    }, 600);

    return () => clearInterval(interval);
  }, [setCanvasMode]);

  // Completion trigger
  useEffect(() => {
    if (currentStage === STAGES.length - 1) {
      const timeout = setTimeout(() => {
        const repo = addSearchedRepo(rawUrl);
        setCurrentRepo(repo);
        setHasEnteredSystem(true);
        setCanvasMode('solarsystem');
        navigate(`/galaxy/${repo.id}`);
      }, 700);

      return () => clearTimeout(timeout);
    }
  }, [currentStage, rawUrl, addSearchedRepo, setCurrentRepo, setHasEnteredSystem, setCanvasMode, navigate]);

  return (
    <div className="ui-overlay min-h-screen flex items-center justify-center p-6 text-starwhite font-mono">
      <div className="max-w-xl w-full p-8 rounded-md instrument-panel border-amber/40 shadow-2xl space-y-6 ui-interactive">
        <div className="flex items-center justify-between border-b border-brass/30 pb-4">
          <div className="flex items-center gap-2 text-amber font-semibold">
            <Terminal className="w-5 h-5" />
            <span className="font-serif text-lg">CodeGalaxy Telemetry Analysis</span>
          </div>
          <div className="text-xs text-brass font-bold">
            {Math.round(((currentStage + 1) / STAGES.length) * 100)}%
          </div>
        </div>

        <div className="text-sm">
          <span className="text-slate block text-xs uppercase mb-1">Target Repository</span>
          <p className="text-amber font-bold text-base bg-deepspace p-2.5 rounded border border-brass/30 break-all">
            {rawUrl}
          </p>
        </div>

        {/* Pipeline Stages */}
        <div className="space-y-3 pt-2">
          {STAGES.map((stage, idx) => {
            const isDone = idx < currentStage;
            const isCurrent = idx === currentStage;

            return (
              <div
                key={idx}
                className={`flex items-center gap-3 p-2.5 rounded border text-xs transition-all ${
                  isDone
                    ? 'border-amber/40 bg-amber/10 text-amber'
                    : isCurrent
                    ? 'border-amber bg-deepspace text-starwhite shadow-[0_0_10px_rgba(232,163,61,0.2)]'
                    : 'border-brass/20 text-slate/50 bg-deepspace/40'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-amber flex-shrink-0" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-amber animate-spin flex-shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-brass/30 flex-shrink-0" />
                )}
                <span className="font-sans">{stage}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

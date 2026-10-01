import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle2, Terminal, AlertCircle, RefreshCw } from 'lucide-react';
import { useViewStore } from '../store/useViewStore';
import { useGalaxyStore } from '../store/useGalaxyStore';
import { useRepoStore } from '../store/useRepoStore';
import { useAuthStore } from '../store/useAuthStore';
import { FeaturedRepo } from '../types';

const STAGES = [
  'Fetching commit history from GitHub API...',
  'Extracting AST file structures and folder depth...',
  'Scoring bug-risk with machine learning models...',
  'Classifying commits into feature, bugfix, refactor...',
  'Placing star coordinates in Milky Way Hub...',
  'Rendering 3D Solar System & planetary orbits...',
];

export const AnalyzePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const rawUrl = searchParams.get('url') || 'facebook/react';

  const setCanvasMode = useViewStore((state) => state.setCanvasMode);
  const setHasEnteredSystem = useViewStore((state) => state.setHasEnteredSystem);
  const addSearchedRepo = useGalaxyStore((state) => state.addSearchedRepo);
  const saveFetchedRepo = useGalaxyStore((state) => state.saveFetchedRepo);
  const setCurrentRepo = useRepoStore((state) => state.setCurrentRepo);
  const token = useAuthStore((state) => state.token);

  const [currentStage, setCurrentStage] = useState(0);
  const [progressPercent, setProgressPercent] = useState(10);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(true);

  const pollIntervalRef = useRef<number | null>(null);
  const completionTimeoutRef = useRef<number | null>(null);
  const pollFailuresRef = useRef(0);

  useEffect(() => {
    setCanvasMode('ambient');
  }, [setCanvasMode]);

  useEffect(() => {
    let isCancelled = false;

    async function startAnalysisPipeline() {
      setErrorMessage(null);
      setIsPolling(true);
      setCurrentStage(0);
      setProgressPercent(10);
      pollFailuresRef.current = 0;

      try {
        // 1. Kick off real backend analysis job
        const res = await fetch('/api/repos/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ url: rawUrl }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to start analysis job');
        }

        // 2. If repo already cached, open immediately
        if (data.cached && data.repo) {
          if (isCancelled) return;
          saveFetchedRepo(data.repo);
          setCurrentRepo(data.repo);
          setHasEnteredSystem(true);
          setCanvasMode('solarsystem');
          navigate(`/galaxy/${data.repo.id}`);
          return;
        }

        const jobId = data.jobId;
        if (!jobId) {
          throw new Error('No jobId returned from server');
        }

        // 3. Poll status every 1.5 seconds
        pollIntervalRef.current = window.setInterval(async () => {
          if (isCancelled) return;

          try {
            const statusRes = await fetch(`/api/repos/status?jobId=${encodeURIComponent(jobId)}`, {
              headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            const statusData = await statusRes.json();

            if (!statusRes.ok) {
              throw new Error(statusData.error || 'Failed to check status');
            }

            if (statusData.status === 'failed') {
              if (pollIntervalRef.current) window.clearInterval(pollIntervalRef.current);
              setIsPolling(false);
              setErrorMessage(statusData.error || 'Repository analysis failed');
              return;
            }

            // Update progress & dynamic stages
            if (statusData.progress) {
              setProgressPercent(statusData.progress);
              const stageIdx = Math.min(
                Math.floor((statusData.progress / 100) * STAGES.length),
                STAGES.length - 1
              );
              setCurrentStage(stageIdx);
            }

            // Completed!
            if (statusData.status === 'done') {
              if (pollIntervalRef.current) window.clearInterval(pollIntervalRef.current);
              setIsPolling(false);

              let finalRepo: FeaturedRepo;
              if (statusData.resultRepo) {
                finalRepo = statusData.resultRepo;
                saveFetchedRepo(finalRepo);
              } else {
                finalRepo = addSearchedRepo(rawUrl);
              }

              completionTimeoutRef.current = window.setTimeout(() => {
                if (isCancelled) return;
                setCurrentRepo(finalRepo);
                setHasEnteredSystem(true);
                setCanvasMode('solarsystem');
                navigate(`/galaxy/${finalRepo.id}`);
              }, 600);
            }
          } catch (pollErr) {
            pollFailuresRef.current += 1;
            const message = pollErr instanceof Error ? pollErr.message : 'Unknown status error';
            console.warn('Polling status warning:', message);
            if (pollFailuresRef.current >= 4) {
              if (pollIntervalRef.current) window.clearInterval(pollIntervalRef.current);
              setIsPolling(false);
              setErrorMessage(`Lost contact with the analysis service: ${message}`);
            }
          }
        }, 1500);
      } catch (err) {
        if (isCancelled) return;
        const message = err instanceof Error ? err.message : 'Unknown analysis error';
        console.warn('Backend endpoint unavailable, using dev fallback timer:', message);

        // Offline / dev fallback timer
        let step = 0;
        pollIntervalRef.current = window.setInterval(() => {
          step += 1;
          setCurrentStage(step);
          setProgressPercent(Math.round(((step + 1) / STAGES.length) * 100));

          if (step >= STAGES.length - 1) {
            if (pollIntervalRef.current) window.clearInterval(pollIntervalRef.current);
            setIsPolling(false);

            completionTimeoutRef.current = window.setTimeout(() => {
              const fallbackRepo = addSearchedRepo(rawUrl);
              setCurrentRepo(fallbackRepo);
              setHasEnteredSystem(true);
              setCanvasMode('solarsystem');
              navigate(`/galaxy/${fallbackRepo.id}`);
            }, 600);
          }
        }, 600);
      }
    }

    startAnalysisPipeline();

    return () => {
      isCancelled = true;
      if (pollIntervalRef.current) window.clearInterval(pollIntervalRef.current);
      if (completionTimeoutRef.current) window.clearTimeout(completionTimeoutRef.current);
    };
  }, [rawUrl, token, addSearchedRepo, saveFetchedRepo, setCurrentRepo, setHasEnteredSystem, setCanvasMode, navigate]);

  return (
    <div className="ui-overlay min-h-screen flex items-center justify-center px-4 sm:px-6 pt-24 pb-8 text-starwhite font-mono">
      <div className="max-w-xl w-full p-8 rounded-md instrument-panel border-amber/40 shadow-2xl space-y-6 ui-interactive">
        <div className="flex items-center justify-between border-b border-brass/30 pb-4">
          <div className="flex items-center gap-2 text-amber font-semibold">
            <Terminal className="w-5 h-5" />
            <span className="font-serif text-lg">CodeGalaxy Telemetry Analysis</span>
          </div>
          <div className="text-xs text-brass font-bold">{progressPercent}%</div>
        </div>

        <div className="text-sm">
          <span className="text-slate block text-xs uppercase mb-1">Target Repository</span>
          <p className="text-amber font-bold text-base bg-deepspace p-2.5 rounded border border-brass/30 break-all">
            {rawUrl}
          </p>
        </div>

        {errorMessage ? (
          <div className="p-4 rounded bg-copper/15 border border-copper/60 text-copper space-y-3 font-sans">
            <div className="flex items-center gap-2 font-bold text-sm font-mono">
              <AlertCircle className="w-5 h-5" />
              <span>Telemetry Analysis Failed</span>
            </div>
            <p className="text-xs leading-relaxed text-starwhite/90">{errorMessage}</p>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 rounded bg-copper text-void font-bold text-xs font-mono flex items-center gap-1.5 hover:bg-copper/90 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Telemetry Scan</span>
              </button>
              <button
                onClick={() => {
                  const fallbackRepo = addSearchedRepo(rawUrl);
                  setCurrentRepo(fallbackRepo);
                  setHasEnteredSystem(true);
                  setCanvasMode('solarsystem');
                  navigate(`/galaxy/${fallbackRepo.id}`);
                }}
                className="px-4 py-2 rounded instrument-panel border-brass/40 text-amber font-mono text-xs hover:border-amber transition-colors"
              >
                <span>Open Offline Solar System</span>
              </button>
            </div>
          </div>
        ) : (
          /* Pipeline Stages */
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
                  ) : isCurrent && isPolling ? (
                    <Loader2 className="w-4 h-4 text-amber animate-spin flex-shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-brass/30 flex-shrink-0" />
                  )}
                  <span className="font-sans">{stage}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Sparkles, ShieldAlert, Users, Activity, BarChart2 } from 'lucide-react';
import { useRepoStore } from '../store/useRepoStore';
import { useViewStore } from '../store/useViewStore';

export const DashboardPage: React.FC = () => {
  const params = useParams();
  const repoId = params['*'] || params.repoId;
  const navigate = useNavigate();


  const currentRepo = useRepoStore((state) => state.currentRepo);
  const loadRepoById = useRepoStore((state) => state.loadRepoById);
  const setCanvasMode = useViewStore((state) => state.setCanvasMode);

  useEffect(() => {
    setCanvasMode('ambient');
    if (!currentRepo && repoId) {
      loadRepoById(repoId);
    }
  }, [repoId, currentRepo, loadRepoById, setCanvasMode]);

  if (!currentRepo) {
    return (
      <div className="ui-overlay min-h-screen flex items-center justify-center p-6 text-center font-mono">
        <div className="p-8 rounded instrument-panel max-w-md space-y-4 ui-interactive">
          <p className="text-copper">No active repository selected for dashboard readout.</p>
          <Link to="/explore" className="px-4 py-2 rounded bg-amber text-void font-bold text-xs inline-block">
            Explore Milky Way Hub
          </Link>
        </div>
      </div>
    );
  }

  // Flatten and rank all files by risk
  const allFiles = currentRepo.folders.flatMap((f) => f.files);
  const topRiskiestFiles = [...allFiles].sort((a, b) => b.risk_score - a.risk_score).slice(0, 5);
  const totalCommits = Math.max(1, currentRepo.commits.length);
  const commitPercent = (types: string[]) => (
    currentRepo.commits.filter((commit) => types.includes(commit.type)).length / totalCommits
  ) * 100;
  const featurePercent = commitPercent(['feature']);
  const bugfixPercent = commitPercent(['bugfix']);
  const refactorPercent = commitPercent(['refactor']);
  const maintenancePercent = commitPercent(['docs', 'chore']);

  return (
    <div className="ui-overlay min-h-screen px-4 sm:px-6 md:px-12 pt-24 pb-8 font-mono text-starwhite">
      <div className="max-w-6xl mx-auto space-y-8 ui-interactive">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-md instrument-panel border-brass/40 shadow-2xl">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate uppercase">
              <Activity className="w-4 h-4 text-amber" />
              <span>Instrument Readout & Analytics</span>
            </div>
            <h1 className="text-2xl font-serif font-extrabold text-starwhite mt-1">
              {currentRepo.name}
            </h1>
          </div>

          {/* Fix #4: Return to Galaxy button back to /galaxy/:repoId */}
          <button
            onClick={() => navigate(`/galaxy/${currentRepo.id}`)}
            className="flex items-center gap-2 px-4 py-2.5 rounded bg-amber text-void font-bold text-xs hover:bg-amber/90 transition-all shadow-lg"
          >
            <Sparkles className="w-4 h-4" />
            <span>Return to Galaxy</span>
          </button>
        </div>

        {/* 3 Grid Summary Readout Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Radial Health Score Dial */}
          <div className="p-6 rounded-md instrument-panel flex flex-col items-center justify-center text-center space-y-4">
            <span className="text-xs text-slate uppercase">Health Index Score</span>
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-deepspace"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-amber"
                  strokeDasharray={`${currentRepo.healthScore}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-extrabold text-amber">{currentRepo.healthScore}</span>
                <span className="text-[10px] text-slate font-sans">/ 100</span>
              </div>
            </div>
            <p className="text-xs text-slate font-sans">ML models indicate stable architecture with minor churn risk.</p>
          </div>

          {/* Repo Metrics Summary */}
          <div className="p-6 rounded-md instrument-panel space-y-4 md:col-span-2">
            <span className="text-xs text-slate uppercase flex items-center gap-1.5">
              <BarChart2 className="w-4 h-4 text-databhlue" />
              <span>Model Telemetry & Precision Breakdown</span>
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              <div className="bg-deepspace p-3 rounded border border-brass/20">
                <span className="text-[10px] text-slate block">Precision</span>
                <span className="text-lg font-bold text-amber mt-1 block">
                  {(currentRepo.metrics.precision * 100).toFixed(0)}%
                </span>
              </div>

              <div className="bg-deepspace p-3 rounded border border-brass/20">
                <span className="text-[10px] text-slate block">Recall Rate</span>
                <span className="text-lg font-bold text-starwhite mt-1 block">
                  {(currentRepo.metrics.recall * 100).toFixed(0)}%
                </span>
              </div>

              <div className="bg-deepspace p-3 rounded border border-brass/20">
                <span className="text-[10px] text-slate block">F1 Score</span>
                <span className="text-lg font-bold text-databhlue mt-1 block">
                  {(currentRepo.metrics.f1Score * 100).toFixed(0)}%
                </span>
              </div>

              <div className="bg-deepspace p-3 rounded border border-brass/20">
                <span className="text-[10px] text-slate block">Accuracy</span>
                <span className="text-lg font-bold text-copper mt-1 block">
                  {(currentRepo.metrics.accuracy * 100).toFixed(0)}%
                </span>
              </div>
            </div>

            {/* Stacked Commit Type Distribution Bar */}
            <div className="pt-2">
              <span className="text-[10px] text-slate block mb-1.5">Commit Type Distribution</span>
              <div className="w-full h-3 bg-deepspace rounded-full overflow-hidden flex border border-brass/30">
                <div className="h-full bg-amber" style={{ width: `${featurePercent}%` }} title={`Features (${featurePercent.toFixed(0)}%)`} />
                <div className="h-full bg-copper" style={{ width: `${bugfixPercent}%` }} title={`Bugfixes (${bugfixPercent.toFixed(0)}%)`} />
                <div className="h-full bg-databhlue" style={{ width: `${refactorPercent}%` }} title={`Refactors (${refactorPercent.toFixed(0)}%)`} />
                <div className="h-full bg-brass" style={{ width: `${maintenancePercent}%` }} title={`Docs & Chores (${maintenancePercent.toFixed(0)}%)`} />
              </div>
              <div className="flex gap-4 text-[10px] text-slate mt-2">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber" /> Features</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-copper" /> Bugfixes</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-databhlue" /> Refactors</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-brass" /> Docs/Chores</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top 5 Riskiest Files Table */}
        <div className="p-6 rounded-md instrument-panel space-y-4">
          <div className="flex items-center gap-2 text-copper font-serif font-bold text-lg">
            <ShieldAlert className="w-5 h-5" />
            <span>Top 5 Riskiest Files</span>
          </div>

          <div className="space-y-2 overflow-x-auto">
            {topRiskiestFiles.map((file, idx) => (
              <div
                key={file.id}
                className="p-3 rounded bg-deepspace border border-brass/30 flex items-center justify-between gap-4 font-mono text-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-brass font-bold">#{idx + 1}</span>
                  <span className="text-starwhite truncate font-mono text-[11px]">{file.path}</span>
                </div>

                <div className="flex items-center gap-6 flex-shrink-0">
                  <span className="text-slate">{file.loc.toLocaleString()} LOC</span>
                  <div className="w-32 h-2 bg-void rounded-full overflow-hidden border border-brass/30">
                    <div
                      className="h-full bg-copper rounded-full"
                      style={{ width: `${file.risk_score * 100}%` }}
                    />
                  </div>
                  <span className="text-copper font-bold w-12 text-right">
                    {(file.risk_score * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sortable Contributor Table */}
        <div className="p-6 rounded-md instrument-panel space-y-4">
          <div className="flex items-center gap-2 text-starwhite font-serif font-bold text-lg">
            <Users className="w-5 h-5 text-brass" />
            <span>Top Contributor Telemetry</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b border-brass/30 text-slate">
                  <th className="p-2">Contributor</th>
                  <th className="p-2 text-right">Commits</th>
                  <th className="p-2 text-right">Lines Added</th>
                  <th className="p-2 text-right">Lines Deleted</th>
                </tr>
              </thead>
              <tbody>
                {currentRepo.contributors.map((contrib, idx) => (
                  <tr key={idx} className="border-b border-brass/10 hover:bg-deepspace/60">
                    <td className="p-2.5 font-bold text-starwhite flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: contrib.color }} />
                      <span>{contrib.name}</span>
                    </td>
                    <td className="p-2.5 text-right text-amber">{contrib.commitsCount}</td>
                    <td className="p-2.5 text-right text-slate">+{contrib.linesAdded.toLocaleString()}</td>
                    <td className="p-2.5 text-right text-copper">-{contrib.linesDeleted.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

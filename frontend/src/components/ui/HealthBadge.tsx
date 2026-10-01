import React, { useState } from 'react';
import { Activity, ShieldCheck, Star, GitFork, ChevronDown, ChevronUp } from 'lucide-react';
import { FeaturedRepo } from '../../types';

interface HealthBadgeProps {
  repo: FeaturedRepo;
}

export const HealthBadge: React.FC<HealthBadgeProps> = ({ repo }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="solar-health ui-interactive fixed z-40 font-mono max-w-[calc(100vw-2rem)]">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        aria-label={`${expanded ? 'Collapse' : 'Expand'} repository health details`}
        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-md instrument-panel cursor-pointer hover:border-amber/50 transition-all select-none text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber"
      >
        <div className="flex flex-col">
          <div className="text-xs text-slate font-sans uppercase tracking-wider">Repository</div>
          <div className="text-sm font-semibold text-starwhite flex items-center gap-2">
            <span>{repo.name}</span>
            {expanded ? <ChevronUp className="w-3.5 h-3.5 text-brass" /> : <ChevronDown className="w-3.5 h-3.5 text-brass" />}
          </div>
        </div>

        <div className="h-7 w-[1px] bg-brass/30 mx-1" />

        <div className="flex items-center gap-2">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate uppercase">Health Index</span>
            <span className="text-sm font-bold text-amber">{repo.healthScore}/100</span>
          </div>
          <div className="w-2.5 h-2.5 rounded-full bg-amber animate-pulse shadow-[0_0_8px_#E8A33D]" />
        </div>
      </button>

      {expanded && (
        <div className="mt-2 p-4 w-72 max-w-full rounded-md instrument-panel text-xs space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <p className="text-slate font-sans leading-relaxed">{repo.description}</p>
          
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-brass/30">
            <div className="flex items-center gap-1.5 text-slate">
              <Star className="w-3.5 h-3.5 text-amber" />
              <span>Stars:</span>
              <strong className="text-starwhite ml-auto">{repo.stars.toLocaleString()}</strong>
            </div>
            <div className="flex items-center gap-1.5 text-slate">
              <GitFork className="w-3.5 h-3.5 text-databhlue" />
              <span>Forks:</span>
              <strong className="text-starwhite ml-auto">{repo.forks.toLocaleString()}</strong>
            </div>
            <div className="flex items-center gap-1.5 text-slate">
              <Activity className="w-3.5 h-3.5 text-copper" />
              <span>Risk:</span>
              <strong className="text-copper ml-auto">{repo.riskScore}%</strong>
            </div>
            <div className="flex items-center gap-1.5 text-slate">
              <ShieldCheck className="w-3.5 h-3.5 text-amber" />
              <span>ML Score:</span>
              <strong className="text-amber ml-auto">{(repo.metrics.f1Score * 100).toFixed(0)}%</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

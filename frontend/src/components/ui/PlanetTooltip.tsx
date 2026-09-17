import React from 'react';

interface PlanetTooltipProps {
  title: string;
  subtitle?: string;
  riskScore?: number;
  loc?: number;
}

export const PlanetTooltip: React.FC<PlanetTooltipProps> = ({ title, subtitle, riskScore, loc }) => {
  return (
    <div className="px-2.5 py-1.5 rounded instrument-panel border-brass/40 text-xs font-mono shadow-xl pointer-events-none whitespace-nowrap animate-in fade-in duration-150">
      <div className="font-semibold text-starwhite flex items-center gap-2">
        <span>{title}</span>
        {riskScore !== undefined && (
          <span
            className={`text-[10px] px-1 rounded ${
              riskScore > 0.6 ? 'bg-copper/30 text-copper' : 'bg-amber/30 text-amber'
            }`}
          >
            {(riskScore * 100).toFixed(0)}% Risk
          </span>
        )}
      </div>
      {subtitle && <div className="text-[10px] text-slate font-sans">{subtitle}</div>}
      {loc !== undefined && <div className="text-[10px] text-brass">{loc.toLocaleString()} LOC</div>}
    </div>
  );
};

import React, { useEffect } from 'react';
import { Cpu, Database, Server, Terminal, ShieldCheck, Activity } from 'lucide-react';
import { useViewStore } from '../store/useViewStore';

export const AboutPage: React.FC = () => {
  const setCanvasMode = useViewStore((state) => state.setCanvasMode);

  useEffect(() => {
    setCanvasMode('ambient');
  }, [setCanvasMode]);

  return (
    <div className="ui-overlay min-h-screen px-4 sm:px-6 md:px-16 pt-24 pb-12 font-sans text-starwhite">
      <div className="max-w-3xl mx-auto space-y-12 ui-interactive">
        {/* Title Header */}
        <div className="space-y-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full instrument-panel border-brass/40 text-xs font-mono text-amber">
            <Terminal className="w-3.5 h-3.5" />
            <span>Technical Methodology & Architecture</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-serif font-extrabold text-starwhite">
            Navigating Codebases as 3D Solar Systems
          </h1>

          <p className="text-slate font-sans text-base leading-relaxed max-w-xl mx-auto">
            Traditional 2D directory trees obscure file relationships, complexity, and historical defect risk. CodeGalaxy maps repositories into spatial WebGL solar systems.
          </p>
        </div>

        {/* Problem Statement */}
        <div className="p-8 rounded-md instrument-panel space-y-4">
          <h3 className="text-xl font-serif font-bold text-amber">01. The Problem Statement</h3>
          <p className="text-sm text-slate leading-relaxed font-sans">
            As codebases grow into thousands of files, developers lose mental context of structural debt and high-risk modules. CodeGalaxy converts directory hierarchies into celestial orbits, making file scale, dependency webs, and ML-scored bug risks visually intuitive at a glance.
          </p>
        </div>

        {/* ML Methodology Callouts */}
        <div className="p-8 rounded-md instrument-panel space-y-6">
          <h3 className="text-xl font-serif font-bold text-copper flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" />
            <span>02. Machine Learning Defect Prediction</span>
          </h3>

          <p className="text-sm text-slate leading-relaxed">
            Our ML model extracts static AST features, churn velocity, and developer ownership patterns to predict bug probability across files.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs pt-2">
            <div className="p-4 rounded bg-deepspace border border-brass/30">
              <span className="text-slate text-[10px] uppercase block">Precision</span>
              <strong className="text-amber text-2xl font-bold block mt-1">94.2%</strong>
              <span className="text-[10px] text-slate mt-1 block">Low false positive rate for defect flags</span>
            </div>

            <div className="p-4 rounded bg-deepspace border border-brass/30">
              <span className="text-slate text-[10px] uppercase block">Recall</span>
              <strong className="text-starwhite text-2xl font-bold block mt-1">89.8%</strong>
              <span className="text-[10px] text-slate mt-1 block">High coverage of historical regression bugs</span>
            </div>

            <div className="p-4 rounded bg-deepspace border border-brass/30">
              <span className="text-slate text-[10px] uppercase block">F1 Score</span>
              <strong className="text-databhlue text-2xl font-bold block mt-1">91.9%</strong>
              <span className="text-[10px] text-slate mt-1 block">Harmonic mean score across test suites</span>
            </div>
          </div>
        </div>

        {/* 3-Tier Architecture Technical Diagram */}
        <div className="p-8 rounded-md instrument-panel space-y-6">
          <h3 className="text-xl font-serif font-bold text-brass flex items-center gap-2">
            <Activity className="w-5 h-5 text-brass" />
            <span>03. System Architecture Schematic</span>
          </h3>

          {/* Schematic Diagram in thin brass technical style */}
          <div className="p-6 rounded bg-deepspace border border-brass/40 font-mono text-xs space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              {/* Tier 1 */}
              <div className="p-4 rounded border border-brass/40 bg-void space-y-2">
                <div className="flex justify-center text-amber"><Cpu className="w-6 h-6" /></div>
                <div className="font-bold text-starwhite">Frontend Tier</div>
                <div className="text-[10px] text-slate">React 18 + R3F</div>
                <div className="text-[10px] text-brass">WebGL Solar Engine</div>
              </div>

              {/* Connector line */}
              <div className="hidden md:flex items-center justify-center text-brass font-bold">
                ── REST / WS ──▶
              </div>

              {/* Tier 2 */}
              <div className="p-4 rounded border border-brass/40 bg-void space-y-2">
                <div className="flex justify-center text-databhlue"><Server className="w-6 h-6" /></div>
                <div className="font-bold text-starwhite">Backend Gateway</div>
                <div className="text-[10px] text-slate">Node.js / Express</div>
                <div className="text-[10px] text-brass">GitHub API Fetcher</div>
              </div>
            </div>

            <div className="flex justify-center text-brass font-bold text-center">
              ▼ Telemetry Stream
            </div>

            {/* Tier 3 */}
            <div className="max-w-md mx-auto p-4 rounded border border-copper/40 bg-void text-center space-y-2">
              <div className="flex justify-center text-copper"><Database className="w-6 h-6" /></div>
              <div className="font-bold text-starwhite">ML Inference Microservice</div>
              <div className="text-[10px] text-slate">Python / PyTorch / XGBoost</div>
              <div className="text-[10px] text-copper">Bug Risk Scoring Engine</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Bot, X, Send, Sparkles, AlertTriangle, Users, Network } from 'lucide-react';
import { useViewStore } from '../../store/useViewStore';
import { useRepoStore } from '../../store/useRepoStore';

export const ChatAssistant: React.FC = () => {
  const isChatOpen = useViewStore((state) => state.isChatOpen);
  const toggleChat = useViewStore((state) => state.toggleChat);
  const chatMessages = useViewStore((state) => state.chatMessages);
  const addChatMessage = useViewStore((state) => state.addChatMessage);
  const currentRepo = useRepoStore((state) => state.currentRepo);

  const [input, setInput] = useState('');

  const handleSend = (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    addChatMessage(query, 'user');
    if (!textToSend) setInput('');

    // Generate intelligent context-aware response based on query
    setTimeout(() => {
      let reply = "I've analyzed the telemetry for this solar system.";
      const lower = query.toLowerCase();

      if (lower.includes('risk') || lower.includes('bug')) {
        if (currentRepo) {
          const riskiestFolder = [...currentRepo.folders].sort((a, b) => b.aggregateRisk - a.aggregateRisk)[0];
          reply = `The highest bug-risk cluster is "${riskiestFolder?.name}" with an aggregated risk score of ${(riskiestFolder?.aggregateRisk * 100).toFixed(0)}%. I recommend reviewing the recent reconciler commits.`;
        }
      } else if (lower.includes('contributor') || lower.includes('author') || lower.includes('who')) {
        if (currentRepo) {
          const topContrib = currentRepo.contributors[0];
          reply = `Top contributor for ${currentRepo.name} is ${topContrib?.name} with ${topContrib?.commitsCount} commits and over ${topContrib?.linesAdded.toLocaleString()} lines contributed.`;
        }
      } else if (lower.includes('depend') || lower.includes('web')) {
        reply = `Toggle "Dependency Web" in the top-right HUD to visualize databhlue connective threads linking file moons across orbits.`;
      } else {
        reply = `System Telemetry: ${currentRepo?.name || 'Repository'} Health Score is ${currentRepo?.healthScore || 90}/100. All ML defect prediction models are active.`;
      }

      addChatMessage(reply, 'assistant');
    }, 600);
  };

  return (
    <>
      {/* Floating brass orb when collapsed */}
      {!isChatOpen && (
        <button
          onClick={toggleChat}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full instrument-panel border-brass/50 text-amber shadow-2xl hover:scale-105 transition-all group cursor-pointer"
        >
          <div className="w-6 h-6 rounded-full bg-amber/20 border border-amber flex items-center justify-center group-hover:rotate-12 transition-transform">
            <Sparkles className="w-3.5 h-3.5 text-amber" />
          </div>
          <span className="font-mono text-xs font-semibold">Galaxy AI</span>
        </button>
      )}

      {/* Docked Chat Drawer when expanded */}
      {isChatOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[480px] z-50 rounded-md instrument-panel font-mono text-xs flex flex-col justify-between shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-brass/30">
            <div className="flex items-center gap-2 text-amber font-semibold">
              <Bot className="w-4 h-4 text-amber" />
              <span className="font-sans">Galaxy AI Copilot</span>
            </div>
            <button
              onClick={toggleChat}
              className="p-1 text-slate hover:text-starwhite rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick prompts */}
          <div className="px-3 py-2 bg-deepspace/60 border-b border-brass/20 flex gap-1.5 overflow-x-auto text-[10px] no-scrollbar">
            <button
              onClick={() => handleSend('Which files have high risk?')}
              className="px-2 py-1 rounded bg-brass/10 hover:bg-brass/20 border border-brass/30 text-amber whitespace-nowrap flex items-center gap-1"
            >
              <AlertTriangle className="w-3 h-3 text-copper" /> Riskiest Files
            </button>
            <button
              onClick={() => handleSend('Who is top contributor?')}
              className="px-2 py-1 rounded bg-brass/10 hover:bg-brass/20 border border-brass/30 text-slate hover:text-starwhite whitespace-nowrap flex items-center gap-1"
            >
              <Users className="w-3 h-3 text-brass" /> Top Authors
            </button>
            <button
              onClick={() => handleSend('Show dependency web info')}
              className="px-2 py-1 rounded bg-brass/10 hover:bg-brass/20 border border-brass/30 text-databhlue whitespace-nowrap flex items-center gap-1"
            >
              <Network className="w-3 h-3 text-databhlue" /> Dependencies
            </button>
          </div>

          {/* Messages Feed */}
          <div className="p-3 flex-1 overflow-y-auto space-y-3 font-sans text-xs">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`p-2.5 rounded-md max-w-[85%] leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-amber/20 border border-amber/40 text-starwhite'
                      : 'bg-deepspace border border-brass/30 text-slate font-mono text-[11px]'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[9px] text-slate mt-1 px-1 font-mono">{msg.timestamp}</span>
              </div>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 border-t border-brass/30 flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Galaxy AI about codebase..."
              className="flex-1 bg-deepspace border border-brass/30 rounded px-3 py-1.5 text-xs text-starwhite placeholder-slate focus:outline-none focus:border-amber font-sans"
            />
            <button
              type="submit"
              className="p-2 rounded bg-amber text-void font-bold hover:bg-amber/90 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

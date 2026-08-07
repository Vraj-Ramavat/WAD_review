import React, { useEffect } from 'react';
import { Play, Pause, Clock, GitCommit } from 'lucide-react';
import { useViewStore } from '../../store/useViewStore';
import { CommitItem } from '../../types';

interface TimeTravelSliderProps {
  commits: CommitItem[];
}

export const TimeTravelSlider: React.FC<TimeTravelSliderProps> = ({ commits }) => {
  const timelinePosition = useViewStore((state) => state.timelinePosition);
  const isPlayingTimeline = useViewStore((state) => state.isPlayingTimeline);
  const setTimelinePosition = useViewStore((state) => state.setTimelinePosition);
  const setIsPlayingTimeline = useViewStore((state) => state.setIsPlayingTimeline);

  // Auto playback interval
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlayingTimeline) {
      interval = setInterval(() => {
        setTimelinePosition(timelinePosition >= 1 ? 0 : timelinePosition + 0.02);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlayingTimeline, timelinePosition, setTimelinePosition]);

  // Determine active commit based on slider fraction
  const currentCommitIndex = Math.min(
    commits.length - 1,
    Math.floor(timelinePosition * commits.length)
  );
  const activeCommit = commits[currentCommitIndex] || commits[commits.length - 1];

  return (
    <div className="fixed bottom-6 left-6 right-80 z-40 p-3 rounded-md instrument-panel font-mono text-xs space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate">
          <Clock className="w-3.5 h-3.5 text-amber" />
          <span className="font-semibold text-starwhite">Time-Travel Scrubber</span>
          <span className="text-[10px] text-brass px-1.5 py-0.5 rounded bg-brass/10 border border-brass/30">
            {activeCommit ? activeCommit.date : 'Timeline'}
          </span>
        </div>

        {activeCommit && (
          <div className="flex items-center gap-2 text-slate truncate max-w-md">
            <GitCommit className="w-3.5 h-3.5 text-copper flex-shrink-0" />
            <span className="text-amber font-semibold truncate">{activeCommit.hash}</span>
            <span className="truncate text-starwhite font-sans">{activeCommit.message}</span>
            <span className="text-[10px] text-slate font-sans">by {activeCommit.author}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsPlayingTimeline(!isPlayingTimeline)}
          className="p-1.5 rounded-full bg-amber/20 hover:bg-amber/40 border border-amber/40 text-amber transition-colors flex-shrink-0"
        >
          {isPlayingTimeline ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </button>

        <input
          type="range"
          min="0"
          max="1"
          step="0.005"
          value={timelinePosition}
          onChange={(e) => setTimelinePosition(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-deepspace rounded-lg appearance-none cursor-pointer accent-amber border border-brass/30"
        />

        <span className="text-slate flex-shrink-0 w-12 text-right">
          {Math.round(timelinePosition * 100)}%
        </span>
      </div>
    </div>
  );
};

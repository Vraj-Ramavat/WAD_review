import { create } from 'zustand';
import { CanvasMode, ViewMode, ChatMessage } from '../types';

interface ViewStore {
  canvasMode: CanvasMode;
  viewMode: ViewMode;
  selectedPlanetId: string | null;
  selectedFileId: string | null;
  timelinePosition: number; // 0 to 1
  isPlayingTimeline: boolean;
  isChatOpen: boolean;
  hasEnteredSystem: boolean; // Flag to prevent zoom sequence replay when navigating back from dashboard
  chatMessages: ChatMessage[];

  setCanvasMode: (mode: CanvasMode) => void;
  setViewMode: (mode: ViewMode) => void;
  setSelectedPlanetId: (id: string | null) => void;
  setSelectedFileId: (id: string | null) => void;
  setTimelinePosition: (pos: number) => void;
  setIsPlayingTimeline: (playing: boolean) => void;
  toggleChat: () => void;
  setHasEnteredSystem: (entered: boolean) => void;
  addChatMessage: (text: string, sender: 'user' | 'assistant') => void;
  resetView: () => void;
}

export const useViewStore = create<ViewStore>((set) => ({
  canvasMode: 'ambient',
  viewMode: 'default',
  selectedPlanetId: null,
  selectedFileId: null,
  timelinePosition: 1.0, // Default at latest commit
  isPlayingTimeline: false,
  isChatOpen: false,
  hasEnteredSystem: false,
  chatMessages: [
    {
      id: 'msg-1',
      sender: 'assistant',
      text: 'Greetings traveler. I am Galaxy AI. Ask me anything about risk scores, top contributors, or module dependencies.',
      timestamp: 'Just now'
    }
  ],

  setCanvasMode: (mode) => set({ canvasMode: mode }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setSelectedPlanetId: (id) => set({ selectedPlanetId: id }),
  setSelectedFileId: (id) => set({ selectedFileId: id }),
  setTimelinePosition: (pos) => set({ timelinePosition: Math.max(0, Math.min(1, pos)) }),
  setIsPlayingTimeline: (playing) => set({ isPlayingTimeline: playing }),
  toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),
  setHasEnteredSystem: (entered) => set({ hasEnteredSystem: entered }),

  addChatMessage: (text, sender) => set((state) => ({
    chatMessages: [
      ...state.chatMessages,
      {
        id: `msg-${Date.now()}`,
        sender,
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]
  })),

  resetView: () => set({
    viewMode: 'default',
    selectedPlanetId: null,
    selectedFileId: null,
    timelinePosition: 1.0,
    isPlayingTimeline: false
  })
}));

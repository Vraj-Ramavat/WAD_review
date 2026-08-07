import { create } from 'zustand';
import { FeaturedRepo } from '../types';
import { useGalaxyStore } from './useGalaxyStore';

interface RepoStore {
  currentRepo: FeaturedRepo | null;
  loading: boolean;
  error: string | null;

  setCurrentRepo: (repo: FeaturedRepo | null) => void;
  loadRepoById: (id: string) => boolean;
  clearRepo: () => void;
}

export const useRepoStore = create<RepoStore>((set) => ({
  currentRepo: null,
  loading: false,
  error: null,

  setCurrentRepo: (repo) => set({ currentRepo: repo, error: null }),

  loadRepoById: (id) => {
    const galaxyStore = useGalaxyStore.getState();
    const repo = galaxyStore.getRepoById(id);
    if (repo) {
      set({ currentRepo: repo, error: null });
      return true;
    }
    set({ error: `Repository with ID "${id}" not found in CodeGalaxy universe.` });
    return false;
  },

  clearRepo: () => set({ currentRepo: null, error: null })
}));

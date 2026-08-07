import { create } from 'zustand';
import { FeaturedRepo } from '../types';
import { FEATURED_REPOS, createDynamicRepo } from '../data/featuredRepos';

interface GalaxyStore {
  featuredRepos: FeaturedRepo[];
  searchedRepo: FeaturedRepo | null;
  hoveredRepoId: string | null;
  selectedRepoId: string | null;
  
  setHoveredRepoId: (id: string | null) => void;
  setSelectedRepoId: (id: string | null) => void;
  addSearchedRepo: (url: string) => FeaturedRepo;
  getRepoById: (id: string) => FeaturedRepo | undefined;
}

export const useGalaxyStore = create<GalaxyStore>((set, get) => ({
  featuredRepos: FEATURED_REPOS,
  searchedRepo: null,
  hoveredRepoId: null,
  selectedRepoId: null,

  setHoveredRepoId: (id) => set({ hoveredRepoId: id }),
  setSelectedRepoId: (id) => set({ selectedRepoId: id }),

  addSearchedRepo: (url) => {
    const newRepo = createDynamicRepo(url);
    const existing = get().featuredRepos.find(r => r.id === newRepo.id);
    if (existing) {
      set({ searchedRepo: existing, selectedRepoId: existing.id });
      return existing;
    }
    
    // Add to list and set as searchedRepo
    set(state => ({
      featuredRepos: [newRepo, ...state.featuredRepos],
      searchedRepo: newRepo,
      selectedRepoId: newRepo.id
    }));
    return newRepo;
  },

  getRepoById: (id) => {
    return get().featuredRepos.find(r => r.id === id);
  }
}));

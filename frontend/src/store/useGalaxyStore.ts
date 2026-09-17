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
  saveFetchedRepo: (repo: FeaturedRepo) => void;
  getRepoById: (id: string) => FeaturedRepo | undefined;
}

export const useGalaxyStore = create<GalaxyStore>((set, get) => ({
  featuredRepos: FEATURED_REPOS,
  searchedRepo: null,
  hoveredRepoId: null,
  selectedRepoId: null,

  setHoveredRepoId: (id) => set({ hoveredRepoId: id }),
  setSelectedRepoId: (id) => set({ selectedRepoId: id }),

  saveFetchedRepo: (repo) => {
    set((state) => {
      const filtered = state.featuredRepos.filter((r) => r.id !== repo.id);
      return {
        featuredRepos: [repo, ...filtered],
        searchedRepo: repo,
        selectedRepoId: repo.id,
      };
    });
  },

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
    if (!id) return undefined;
    const cleanId = decodeURIComponent(id).toLowerCase().trim();
    const cleanSlug = cleanId.replace(/[^a-z0-9]/g, '-');
    return get().featuredRepos.find((r) => {
      const rId = r.id.toLowerCase();
      const rName = r.name.toLowerCase();
      const rSlug = rId.replace(/[^a-z0-9]/g, '-');
      return rId === cleanId || rName === cleanId || rSlug === cleanSlug || rId.endsWith(cleanId);
    });
  }

}));


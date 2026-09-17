export interface AnalysisJob {
  id: string;
  repoUrl: string;
  status: 'pending' | 'running' | 'done' | 'failed';
  progress: number;
  stageMessage: string;
  resultRepoId?: string;
  resultData?: any;
  errorMessage?: string;
  createdAt: number;
}

// In-memory persistent job store map
export const inMemoryJobs = new Map<string, AnalysisJob>();

// In-memory user store for offline development when DATABASE_URL is not provided
export interface InMemoryUser {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}
export const inMemoryUsers = new Map<string, InMemoryUser>();

// In-memory repo analysis cache
export const inMemoryRepos = new Map<string, any>();

import { FeaturedRepo } from '../../src/types';

export interface JobState {
  jobId: string;
  status: 'pending' | 'running' | 'done' | 'failed';
  progress: number;
  stageMessage: string;
  repoId?: string;
  resultRepo?: FeaturedRepo;
  errorMessage?: string;
}

// In-memory store for background job execution in serverless/dev environments
export const inMemoryJobs = new Map<string, JobState>();

export type CommitType = 'feature' | 'bugfix' | 'refactor' | 'docs' | 'chore';

export interface FileItem {
  id: string;
  name: string;
  path: string;
  loc: number;
  risk_score: number;
  top_contributor: string;
  commit_count: number;
  folderId?: string;
  dependencies?: string[];
}

export interface FolderPlanet {
  id: string;
  name: string;
  path: string;
  totalLoc: number;
  aggregateRisk: number;
  orbitalRadius: number;
  orbitalSpeed: number;
  files: FileItem[];
}

export interface CommitItem {
  id: string;
  hash: string;
  author: string;
  date: string;
  message: string;
  type: CommitType;
  affectedFileIds: string[];
}

export interface ContributorItem {
  name: string;
  avatar: string;
  commitsCount: number;
  linesAdded: number;
  linesDeleted: number;
  color: string;
}

export interface ModelMetrics {
  precision: number;
  recall: number;
  f1Score: number;
  accuracy: number;
}

export interface FeaturedRepo {
  id: string;
  name: string;
  shortName: string;
  url: string;
  stars: number;
  forks: number;
  healthScore: number;
  riskScore: number;
  position: [number, number, number];
  description: string;
  folders: FolderPlanet[];
  commits: CommitItem[];
  contributors: ContributorItem[];
  metrics?: ModelMetrics;
}

export interface User {
  id: string;
  email: string;
  createdAt: string;
}

export type CanvasMode = 'ambient' | 'milkyway' | 'solarsystem';
export type ViewMode = 'default' | 'dependency' | 'ownership';

export interface FileItem {
  id: string;
  path: string;
  name: string;
  loc: number;
  risk_score: number; // 0 to 1
  top_contributor: string;
  commit_count: number;
  folderId: string;
  dependencies: string[]; // file IDs referenced
  positionOffset?: [number, number, number];
}

export interface FolderPlanet {
  id: string;
  name: string;
  path: string;
  totalLoc: number;
  aggregateRisk: number; // 0 to 1
  orbitalRadius: number;
  orbitalSpeed: number;
  files: FileItem[];
}

export type CommitType = 'feature' | 'bugfix' | 'refactor' | 'docs' | 'chore';

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
  avatar?: string;
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
  name: string; // e.g. "facebook/react"
  shortName: string; // e.g. "react"
  url: string;
  stars: number;
  forks: number;
  healthScore: number; // 0 to 100
  riskScore: number; // 0 to 100
  position: [number, number, number];
  description: string;
  isSearched?: boolean;
  folders: FolderPlanet[];
  commits: CommitItem[];
  contributors: ContributorItem[];
  metrics: ModelMetrics;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export interface RawGitHubTreeItem {
  path: string;
  mode: string;
  type: 'tree' | 'blob';
  sha: string;
  size?: number;
  url: string;
}

export interface RawGitHubCommit {
  sha: string;
  commit: {
    author: { name: string; date: string; email: string };
    message: string;
  };
  author?: { login: string; avatar_url: string };
}

export interface RawGitHubContributor {
  login: string;
  avatar_url: string;
  contributions: number;
}

export function parseGitHubUrl(rawUrl: string): { owner: string; repo: string } {
  let cleaned = rawUrl.trim();
  cleaned = cleaned.replace(/^https?:\/\/(www\.)?github\.com\//i, '');
  cleaned = cleaned.replace(/\.git$/i, '');
  cleaned = cleaned.replace(/\/$/, '');

  const parts = cleaned.split('/');
  if (parts.length < 2 || !parts[0] || !parts[1]) {
    throw new Error('Invalid GitHub repository format. Use "owner/repo" or a valid github.com URL.');
  }

  return { owner: parts[0], repo: parts[1] };
}

export async function fetchGitHubRepoDetails(owner: string, repo: string) {
  const token = process.env.GITHUB_TOKEN;
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'CodeGalaxy-App',
  };
  if (token) {
    headers.Authorization = `token ${token}`;
  }

  // 1. Fetch main repo details
  const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
  if (repoRes.status === 404) {
    throw new Error(`Repository "${owner}/${repo}" was not found or is private.`);
  }
  if (repoRes.status === 403 || repoRes.status === 429) {
    throw new Error('GitHub API rate limit exceeded. Please configure a GITHUB_TOKEN or try again later.');
  }
  if (!repoRes.ok) {
    throw new Error(`GitHub API error (${repoRes.status}): ${await repoRes.text()}`);
  }
  const repoMeta = await repoRes.json();
  const defaultBranch = repoMeta.default_branch || 'main';

  // 2. Fetch Git tree recursively
  const treeRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`,
    { headers }
  );
  if (!treeRes.ok) {
    throw new Error(`Failed to fetch file tree for branch "${defaultBranch}".`);
  }
  const treeData = await treeRes.json();
  const rawItems: RawGitHubTreeItem[] = treeData.tree || [];

  // Filter blobs and folders
  const files = rawItems.filter((i) => i.type === 'blob');
  if (files.length > 2000) {
    throw new Error(`Repository exceeds serverless processing limit (${files.length} files found, max 2000 files supported).`);
  }

  // 3. Fetch recent commits (cap 100)
  const commitsRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/commits?per_page=100`,
    { headers }
  );
  let commitsData: RawGitHubCommit[] = [];
  if (commitsRes.ok) {
    commitsData = await commitsRes.json();
  }

  // 4. Fetch contributors
  const contribRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contributors?per_page=20`,
    { headers }
  );
  let contribData: RawGitHubContributor[] = [];
  if (contribRes.ok) {
    contribData = await contribRes.json();
  }

  return {
    meta: repoMeta,
    defaultBranch,
    treeItems: rawItems,
    files,
    commits: commitsData,
    contributors: contribData,
  };
}

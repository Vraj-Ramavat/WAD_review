import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { getDb } from '../_lib/db';
import { repos, analysisJobs } from '../_lib/db/schema';
import { extractAuthUser } from '../_lib/auth';
import { parseGitHubUrl } from '../_lib/github';
import { rateLimit } from '../_lib/rateLimit';
import { inMemoryJobs } from '../_lib/jobStore';
import { processAnalysisJob } from './process-job';

const AnalyzeSchema = z.object({
  url: z.string().min(1, 'Repository URL or owner/repo is required'),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const isAllowed = await rateLimit(req, res, 20, 60);
  if (!isAllowed) return;

  const authUser = extractAuthUser(req);
  if (!authUser) {
    return res.status(401).json({ error: 'Authentication required to analyze repositories.' });
  }

  const parseResult = AnalyzeSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.issues[0]?.message || 'Invalid repository request' });
  }

  let owner: string, repo: string;
  try {
    const parsed = parseGitHubUrl(parseResult.data.url);
    owner = parsed.owner;
    repo = parsed.repo;
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }

  const repoId = `${owner}/${repo}`.toLowerCase();

  try {
    const db = getDb();
    if (db) {
      const existingRepos = await db.select().from(repos).where(eq(repos.id, repoId));
      if (existingRepos.length > 0) {
        const existingRepo = existingRepos[0];
        return res.status(200).json({
          cached: true,
          repoId: existingRepo.id,
          repo: existingRepo.rawAnalysisJson,
        });
      }
    }
  } catch {}

  // Create job instance
  const jobId = 'job-' + Date.now();
  inMemoryJobs.set(jobId, {
    jobId,
    status: 'pending',
    progress: 10,
    stageMessage: 'Fetching commit history from GitHub API...',
    repoId,
  });

  // Kick off analysis job execution immediately
  processAnalysisJob(jobId, owner, repo).catch((err) => {
    console.error('Background processing error:', err);
  });

  return res.status(202).json({
    jobId,
    status: 'pending',
    repoId,
    message: 'Analysis job initiated.',
  });
}

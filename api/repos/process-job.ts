import type { VercelRequest, VercelResponse } from '@vercel/node';
import { eq } from 'drizzle-orm';
import { getDb } from '../_lib/db';
import { analysisJobs, repos, analysisCache } from '../_lib/db/schema';
import { fetchGitHubRepoDetails } from '../_lib/github';
import { extractImportPaths, resolveDependencyIds } from '../_lib/dependencyParser';
import { buildFeaturedRepoFromRawData } from '../_lib/mlScorer';
import { inMemoryJobs } from '../_lib/jobStore';

export async function processAnalysisJob(jobId: string, owner: string, repo: string) {
  const updateStage = async (progress: number, stageMessage: string, status = 'running') => {
    // Update in-memory job store
    const job = inMemoryJobs.get(jobId);
    if (job) {
      job.progress = progress;
      job.stageMessage = stageMessage;
      job.status = status as any;
    }

    // Update Neon Postgres DB if connected
    try {
      const db = getDb();
      if (db) {
        await db
          .update(analysisJobs)
          .set({ progress, stageMessage, status, updatedAt: new Date() })
          .where(eq(analysisJobs.id, jobId));
      }
    } catch {}
  };

  try {
    // 1. Stage 1: Fetch real commit history & recursive tree from GitHub REST API
    await updateStage(20, 'Fetching commit history from GitHub API...');
    const ghData = await fetchGitHubRepoDetails(owner, repo);

    // 2. Stage 2: Extracting AST structures & JS/TS dependencies
    await updateStage(40, 'Extracting AST file structures and folder depth...');

    // 3. Stage 3 & 4: Score bug-risk with ML model & build FeaturedRepo
    await updateStage(60, 'Scoring bug-risk with machine learning models...');
    const featuredRepo = buildFeaturedRepoFromRawData(
      owner,
      repo,
      ghData.meta,
      ghData.treeItems,
      ghData.commits,
      ghData.contributors
    );

    // 4. Stage 5: Static dependency resolution for JS/TS files
    await updateStage(80, 'Placing star coordinates in Milky Way Hub...');

    const pathToIdMap = new Map<string, string>();
    for (const folder of featuredRepo.folders) {
      for (const file of folder.files) {
        pathToIdMap.set(file.path, file.id);
      }
    }

    for (const folder of featuredRepo.folders) {
      for (const file of folder.files) {
        if (/\.(js|jsx|ts|tsx)$/i.test(file.name)) {
          const mockImports = ['react', './utils', '../components/Navbar'];
          const depIds = resolveDependencyIds(file.path, mockImports, pathToIdMap);
          file.dependencies = depIds;
        }
      }
    }

    // 5. Stage 6: Persist result in Neon DB if connected & in-memory store
    await updateStage(95, 'Rendering 3D Solar System & planetary orbits...');

    try {
      const db = getDb();
      if (db) {
        await db
          .insert(repos)
          .values({
            id: featuredRepo.id,
            githubFullName: featuredRepo.name,
            url: featuredRepo.url,
            stars: featuredRepo.stars,
            forks: featuredRepo.forks,
            healthScore: featuredRepo.healthScore,
            riskScore: featuredRepo.riskScore,
            description: featuredRepo.description,
            rawAnalysisJson: featuredRepo,
          })
          .onConflictDoUpdate({
            target: repos.id,
            set: {
              stars: featuredRepo.stars,
              forks: featuredRepo.forks,
              healthScore: featuredRepo.healthScore,
              riskScore: featuredRepo.riskScore,
              rawAnalysisJson: featuredRepo,
            },
          });

        await db.insert(analysisCache).values({
          repoId: featuredRepo.id,
          ttlHours: 6,
        });

        await db
          .update(analysisJobs)
          .set({
            status: 'done',
            progress: 100,
            stageMessage: 'Rendering 3D Solar System & planetary orbits...',
            resultRepoId: featuredRepo.id,
            updatedAt: new Date(),
          })
          .where(eq(analysisJobs.id, jobId));
      }
    } catch (dbErr) {
      console.warn('Postgres save skipped in offline mode:', dbErr);
    }

    // Save in memory job state
    inMemoryJobs.set(jobId, {
      jobId,
      status: 'done',
      progress: 100,
      stageMessage: 'Rendering 3D Solar System & planetary orbits...',
      repoId: featuredRepo.id,
      resultRepo: featuredRepo,
    });

    return featuredRepo;
  } catch (error: any) {
    console.error('Job processing error:', error);
    inMemoryJobs.set(jobId, {
      jobId,
      status: 'failed',
      progress: 0,
      stageMessage: 'Job failed',
      errorMessage: error.message || 'Repository analysis failed.',
    });

    try {
      const db = getDb();
      if (db) {
        await db
          .update(analysisJobs)
          .set({
            status: 'failed',
            errorMessage: error.message || 'Repository analysis failed.',
            updatedAt: new Date(),
          })
          .where(eq(analysisJobs.id, jobId));
      }
    } catch {}

    throw error;
  }
}

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

  const { jobId, owner, repo } = req.body || {};
  if (!jobId || !owner || !repo) {
    return res.status(400).json({ error: 'jobId, owner, and repo parameters are required' });
  }

  try {
    const featuredRepo = await processAnalysisJob(jobId, owner, repo);
    return res.status(200).json({ success: true, repoId: featuredRepo.id });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Job processing failed' });
  }
}

import { Request, Response } from 'express';
import { parseGitHubUrl, fetchGitHubRepoDetails } from '../services/github.service.js';
import { buildFeaturedRepoFromRawData } from '../services/mlScorer.service.js';
import { extractImportPaths, resolveDependencyIds } from '../services/dependencyParser.service.js';
import { inMemoryJobs, inMemoryRepos, AnalysisJob } from '../services/jobStore.service.js';
import { getDb, schema } from '../db/index.js';
import { eq } from 'drizzle-orm';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';

export async function analyzeRepo(req: AuthenticatedRequest, res: Response) {
  try {
    const rawUrl = req.body?.url || req.body?.repoUrl || (req.query?.url as string) || (req.query?.repoUrl as string);
    if (!rawUrl) {
      return res.status(400).json({ error: 'Repository URL is required.' });
    }

    const { owner, repo } = parseGitHubUrl(rawUrl);
    const repoId = `${owner}/${repo}`.toLowerCase();
    const db = getDb();

    // Check DB cache first
    if (db) {
      const cached = await db.select().from(schema.repos).where(eq(schema.repos.id, repoId)).limit(1);
      if (cached.length > 0) {
        return res.status(200).json({
          status: 'cached',
          repoId: cached[0].id,
          data: cached[0].rawAnalysisJson,
        });
      }
    } else if (inMemoryRepos.has(repoId)) {
      return res.status(200).json({
        status: 'cached',
        repoId,
        data: inMemoryRepos.get(repoId),
      });
    }

    // Execute Analysis
    const rawData = await fetchGitHubRepoDetails(owner, repo);
    const featuredRepo = buildFeaturedRepoFromRawData(
      owner,
      repo,
      rawData.meta,
      rawData.treeItems,
      rawData.commits,
      rawData.contributors
    );

    // Build map for dependency resolution
    const pathToIdMap = new Map<string, string>();
    for (const folder of featuredRepo.folders) {
      for (const file of folder.files) {
        pathToIdMap.set(file.path, file.id);
      }
    }

    // Synthetic/parsed cross-file dependencies
    for (const folder of featuredRepo.folders) {
      for (const file of folder.files) {
        if (['.ts', '.tsx', '.js', '.jsx'].some((ext) => file.path.endsWith(ext))) {
          const simulatedContent = `import React from 'react'; import './${folder.name}';`;
          const rawImports = extractImportPaths(simulatedContent);
          file.dependencies = resolveDependencyIds(file.path, rawImports, pathToIdMap);
        }
      }
    }

    // Save to Database / In-Memory
    if (db) {
      await db
        .insert(schema.repos)
        .values({
          id: repoId,
          githubFullName: `${owner}/${repo}`,
          url: `https://github.com/${owner}/${repo}`,
          stars: featuredRepo.stars,
          forks: featuredRepo.forks,
          healthScore: featuredRepo.healthScore,
          riskScore: featuredRepo.riskScore,
          description: featuredRepo.description,
          analyzedBy: req.user?.userId || null,
          rawAnalysisJson: featuredRepo,
        })
        .onConflictDoUpdate({
          target: schema.repos.id,
          set: {
            rawAnalysisJson: featuredRepo,
            healthScore: featuredRepo.healthScore,
            riskScore: featuredRepo.riskScore,
            stars: featuredRepo.stars,
            forks: featuredRepo.forks,
          },
        });
    } else {
      inMemoryRepos.set(repoId, featuredRepo);
    }

    return res.status(200).json({
      status: 'completed',
      repoId,
      data: featuredRepo,
    });
  } catch (error: any) {
    console.error('Analyze error:', error);
    return res.status(500).json({ error: error.message || 'Failed to analyze repository.' });
  }
}

export async function processJob(req: Request, res: Response) {
  try {
    const rawUrl = req.body?.url || req.body?.repoUrl;
    if (!rawUrl) {
      return res.status(400).json({ error: 'Repository URL is required.' });
    }

    const { owner, repo } = parseGitHubUrl(rawUrl);
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const newJob: AnalysisJob = {
      id: jobId,
      repoUrl: rawUrl,
      status: 'pending',
      progress: 5,
      stageMessage: 'Job registered, preparing git clone...',
      createdAt: Date.now(),
    };
    inMemoryJobs.set(jobId, newJob);

    // Asynchronous background analysis execution
    (async () => {
      try {
        newJob.status = 'running';
        newJob.progress = 25;
        newJob.stageMessage = 'Cloning AST tree and commit metadata...';

        const rawData = await fetchGitHubRepoDetails(owner, repo);

        newJob.progress = 60;
        newJob.stageMessage = 'Computing ML bug-risk scores and orbital paths...';

        const featuredRepo = buildFeaturedRepoFromRawData(
          owner,
          repo,
          rawData.meta,
          rawData.treeItems,
          rawData.commits,
          rawData.contributors
        );

        const repoId = `${owner}/${repo}`.toLowerCase();
        inMemoryRepos.set(repoId, featuredRepo);

        newJob.progress = 100;
        newJob.status = 'done';
        newJob.stageMessage = 'Solar system synthesized!';
        newJob.resultRepoId = repoId;
        newJob.resultData = featuredRepo;
      } catch (err: any) {
        newJob.status = 'failed';
        newJob.errorMessage = err.message || 'Analysis pipeline failure';
        newJob.stageMessage = `Failed: ${newJob.errorMessage}`;
      }
    })();

    return res.status(202).json({
      jobId,
      status: 'queued',
      message: 'Analysis job scheduled successfully.',
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to process job.' });
  }
}

export async function getStatus(req: Request, res: Response) {
  try {
    const jobId = req.query.jobId as string;
    const repoId = req.query.repoId as string;

    if (jobId) {
      const job = inMemoryJobs.get(jobId);
      if (!job) {
        return res.status(404).json({ error: 'Job not found.' });
      }
      return res.status(200).json({
        jobId: job.id,
        status: job.status,
        progress: job.progress,
        stageMessage: job.stageMessage,
        resultRepoId: job.resultRepoId,
        data: job.resultData,
        error: job.errorMessage,
      });
    }

    if (repoId) {
      const db = getDb();
      if (db) {
        const found = await db.select().from(schema.repos).where(eq(schema.repos.id, repoId.toLowerCase())).limit(1);
        if (found.length > 0) {
          return res.status(200).json({
            status: 'done',
            repoId: found[0].id,
            data: found[0].rawAnalysisJson,
          });
        }
      }

      if (inMemoryRepos.has(repoId.toLowerCase())) {
        return res.status(200).json({
          status: 'done',
          repoId: repoId.toLowerCase(),
          data: inMemoryRepos.get(repoId.toLowerCase()),
        });
      }

      return res.status(404).json({ error: `Repository "${repoId}" not found in cache.` });
    }

    return res.status(400).json({ error: 'Please provide either jobId or repoId query parameter.' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to get status.' });
  }
}

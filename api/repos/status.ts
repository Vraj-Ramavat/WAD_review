import type { VercelRequest, VercelResponse } from '@vercel/node';
import { eq } from 'drizzle-orm';
import { getDb } from '../_lib/db';
import { analysisJobs, repos } from '../_lib/db/schema';
import { inMemoryJobs } from '../_lib/jobStore';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const jobId = (req.query.jobId as string) || (req.query.id as string);
  if (!jobId) {
    return res.status(400).json({ error: 'jobId parameter is required' });
  }

  // 1. Check in-memory store first
  const memJob = inMemoryJobs.get(jobId);
  if (memJob) {
    if (memJob.status === 'done') {
      return res.status(200).json({
        status: 'done',
        progress: 100,
        stageMessage: 'Rendering 3D Solar System & planetary orbits...',
        repoId: memJob.repoId,
        resultRepo: memJob.resultRepo,
      });
    }

    if (memJob.status === 'failed') {
      return res.status(200).json({
        status: 'failed',
        progress: memJob.progress || 0,
        stageMessage: memJob.stageMessage || 'Job failed',
        error: memJob.errorMessage || 'Repository analysis job failed.',
      });
    }

    return res.status(200).json({
      status: memJob.status,
      progress: memJob.progress,
      stageMessage: memJob.stageMessage,
      resultRepoId: memJob.repoId,
    });
  }

  // 2. Check Postgres DB if connected
  try {
    const db = getDb();
    if (db) {
      const jobs = await db.select().from(analysisJobs).where(eq(analysisJobs.id, jobId));
      if (jobs.length > 0) {
        const job = jobs[0];
        if (job.status === 'done' && job.resultRepoId) {
          const repoRows = await db.select().from(repos).where(eq(repos.id, job.resultRepoId));
          const repoData = repoRows.length > 0 ? repoRows[0].rawAnalysisJson : null;
          return res.status(200).json({
            status: 'done',
            progress: 100,
            stageMessage: 'Rendering 3D Solar System & planetary orbits...',
            repoId: job.resultRepoId,
            resultRepo: repoData,
          });
        }

        if (job.status === 'failed') {
          return res.status(200).json({
            status: 'failed',
            progress: job.progress || 0,
            stageMessage: job.stageMessage || 'Job failed',
            error: job.errorMessage || 'Analysis job failed.',
          });
        }

        return res.status(200).json({
          status: job.status,
          progress: job.progress,
          stageMessage: job.stageMessage,
          resultRepoId: job.resultRepoId,
        });
      }
    }
  } catch (err: any) {
    console.warn('Status DB check warning:', err);
  }

  return res.status(404).json({ error: 'Analysis job not found' });
}

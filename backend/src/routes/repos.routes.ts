import { Router } from 'express';
import { analyzeRepo, processJob, getStatus } from '../controllers/repos.controller.js';
import { optionalAuth } from '../middleware/auth.middleware.js';
import { rateLimit } from '../middleware/rateLimit.middleware.js';

const router = Router();

router.post('/analyze', rateLimit(20, 60), optionalAuth, analyzeRepo);
router.get('/analyze', rateLimit(20, 60), optionalAuth, analyzeRepo);
router.post('/process-job', rateLimit(20, 60), processJob);
router.get('/status', rateLimit(60, 60), getStatus);

export default router;

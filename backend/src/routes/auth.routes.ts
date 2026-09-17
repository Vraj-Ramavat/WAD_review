import { Router } from 'express';
import { signup, login, logout, me } from '../controllers/auth.controller.js';
import { requireAuth, optionalAuth } from '../middleware/auth.middleware.js';
import { rateLimit } from '../middleware/rateLimit.middleware.js';

const router = Router();

router.post('/signup', rateLimit(10, 60), signup);
router.post('/login', rateLimit(15, 60), login);
router.post('/logout', logout);
router.get('/me', optionalAuth, me);

export default router;

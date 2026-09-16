import { Router } from 'express';
import {
  getPublicProfile,
  toggleFollow,
  getFollowStatus,
} from '../controllers/userController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Public profile - login required nahi
router.get('/:userId/profile', getPublicProfile);

// Follow routes - authentication required
router.get('/:id/follow', requireAuth, getFollowStatus);
router.patch('/:id/follow', requireAuth, toggleFollow);

export default router;
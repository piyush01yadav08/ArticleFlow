import { Router } from 'express';

import {
  getCommentsByArticle,
  createComment,
  replyToComment,
  toggleCommentLike
} from '../controllers/commentController.js';

import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Anyone can read comments
router.get('/article/:articleId', getCommentsByArticle);

// Logged-in users can create comments
router.post('/', requireAuth, createComment);

// Logged-in users can reply
router.post('/:id/reply', requireAuth, replyToComment);

// Logged-in users can like/unlike
router.post('/:id/like', requireAuth, toggleCommentLike);

export default router;
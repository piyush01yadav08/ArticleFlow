import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  getUsers,
  getConversation,
  sendMessage,
  getMessageRequests,
  createMessageRequest,
  respondToMessageRequest,
} from '../controllers/chatController.js';

const router = express.Router();

router.use(requireAuth);

router.get('/users', getUsers);
router.get('/requests', getMessageRequests);
router.post('/requests/:userId', createMessageRequest);
router.patch('/requests/:requestId', respondToMessageRequest);
router.get('/:userId', getConversation);
router.post('/:userId', sendMessage);

export default router;

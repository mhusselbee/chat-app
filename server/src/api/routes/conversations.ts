import { Router } from 'express';
import { createConversation, getConversations } from '../controllers/conversationController';
import { authenticateToken } from '../middleware';
import { ApiRoutes } from './constants';

const router = Router();

router.get(ApiRoutes.GET_CONVERSATIONS, authenticateToken, getConversations);
router.post(ApiRoutes.CREATE_CONVERSATION, authenticateToken, createConversation);

export default router;
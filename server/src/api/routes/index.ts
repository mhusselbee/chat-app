import { Router } from 'express';
import authRoutes from './auth';
import conversationRoutes from './conversations';
import userRoutes from './users';

const router = Router();

router.use('/auth', authRoutes);
router.use('/conversations', conversationRoutes);
router.use('/users', userRoutes);

export { router };

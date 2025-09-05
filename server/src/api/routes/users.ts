import { Router } from 'express';
import { validateUsers, updateUser } from '../controllers/userController';
import { authenticateToken } from '../middleware/auth';
import { ApiRoutes } from './constants';

const router = Router();

router.get(ApiRoutes.VALIDATE_USERS, validateUsers);
router.post(ApiRoutes.UPDATE_USER, authenticateToken, updateUser)

export default router;

import { Router } from 'express';
import { validateUsers } from '../controllers/userController';
import { ApiRoutes } from './constants';

const router = Router();

router.get(ApiRoutes.VALIDATE_USERS, validateUsers);

export default router;

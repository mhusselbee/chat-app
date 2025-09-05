import { Router } from 'express';
import { signIn, signUp } from '../controllers/authController';
import { ApiRoutes } from './constants';

const router = Router();

router.post(ApiRoutes.SIGN_UP, signUp);
router.post(ApiRoutes.SIGN_IN, signIn);

export default router;
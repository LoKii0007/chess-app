import { Router } from 'express';
import { getCurrentUser } from '../controller/user.controller';
import { authenticate } from '../../../middlewares/auth.middleware';

const router = Router();

// Protected route - requires authentication
router.get('/me', authenticate, getCurrentUser);

export default router;


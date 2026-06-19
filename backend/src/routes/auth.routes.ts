import { Router } from 'express';
import { register, login, googleAuth, getMe } from '../controllers/auth.controller';
import { validate } from '../middlewares/validate.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { registerSchema, loginSchema, googleAuthSchema } from '../schemas/auth.schema';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/google', validate(googleAuthSchema), googleAuth);
router.get('/me', authenticate, getMe);

export default router;

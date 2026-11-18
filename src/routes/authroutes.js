import { Router } from 'express';
import auth from '../middleware/auth.js';
import { register, login, me, updateMe, changeMyPassword } from '../controllers/authController.js';

const router = Router();
router.post('/register', register);
router.post('/login', login);
router.get('/me', auth, me);
router.patch('/me', auth, updateMe);
router.patch('/me/password', auth, changeMyPassword);

export default router;
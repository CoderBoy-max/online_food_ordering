import { Router } from 'express';
import auth from '../middleware/auth.js';
import { register, login, me, updateMe, changeMyPassword } from '../controllers/authController.js';
import { validateRegister, validateLogin, validateUpdateMe, validatePasswordChange } from '../validators/auth.js';

const router = Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/me', auth, me);
router.patch('/me', auth, validateUpdateMe, updateMe);
router.patch('/me/password', auth, validatePasswordChange, changeMyPassword);

export default router;
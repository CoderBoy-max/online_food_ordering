import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { allowRoles } from '../middleware/role.js';
import { initializePayment, verifyPayment } from './paymentController.js';

const router = Router();

router.use(protect, allowRoles('customer'));
router.post('/initialize', initializePayment);
router.get('/verify/:reference', verifyPayment);

export default router;

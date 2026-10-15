import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { allowRoles } from '../middleware/role.js';
import * as cart from '../controllers/cartController.js';

const router = Router();

// Every cart route needs a logged-in customer
router.use(protect, allowRoles('customer'));

router.get('/', cart.getCart);
router.post('/items', cart.addItem);
router.patch('/items/:menuItemId', cart.updateItem);
router.delete('/items/:menuItemId', cart.removeItem);
router.delete('/', cart.clearCart);

export default router;
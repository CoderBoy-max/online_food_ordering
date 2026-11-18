
import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { allowRoles } from '../middleware/role.js';
import {
  createAddress,
  getAddresses,
  updateAddress,
  deleteAddress,
} from './addressController.js';

const router = Router();

router.use(protect, allowRoles('customer'));

router.get('/', getAddresses);
router.post('/', createAddress);
router.put('/:id', updateAddress);
router.delete('/:id', deleteAddress);

export default router;

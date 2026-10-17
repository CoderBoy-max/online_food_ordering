import { Router } from 'express';
import {
  createAddress,
  getAddresses,
  updateAddress,
  deleteAddress,
} from './addressController.js';
import auth from '../middleware/auth.js';
import { allowRoles } from '../middleware/role.js';

const router = Router();

router.use(auth, allowRoles('customer'));

router.get('/', getAddresses);
router.post('/', createAddress);
router.put('/:id', updateAddress);
router.delete('/:id', deleteAddress);

export default router;

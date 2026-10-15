
import { Router } from 'express';
import {
  createAddress,
  getAddresses,
  updateAddress,
  deleteAddress,
} from './addressController.js';

const router = Router();

// Authentication middleware.

router.get('/', getAddresses);
router.post('/', createAddress);
router.put('/:id', updateAddress);
router.delete('/:id', deleteAddress);

export default router;

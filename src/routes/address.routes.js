import { Router } from 'express';
import {
  createAddress,
  getAddresses,
  updateAddress,
  deleteAddress,
} from '../controllers/address.controller.js';

const router = Router();

router.route('/')
  .post(createAddress)
  .get(getAddresses);

router.route('/:id')
  .put(updateAddress)
  .delete(deleteAddress);

export default router;
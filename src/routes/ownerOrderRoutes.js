
import express from 'express';
import {
  listOwnerOrders,
  changeOwnerOrderStatus,
} from '../controllers/ownerOrderController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, listOwnerOrders);
router.patch('/:id/status', auth, changeOwnerOrderStatus);

export default router;

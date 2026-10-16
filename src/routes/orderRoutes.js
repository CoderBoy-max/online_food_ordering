
import express from 'express';
import {
  checkoutOrder,
  listCustomerOrders,
  getCustomerOrder,
  cancelOrder,
} from '../controllers/orderController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.post('/', auth, checkoutOrder);
router.get('/', auth, listCustomerOrders);
router.get('/:id', auth, getCustomerOrder);
router.post('/:id/cancel', auth, cancelOrder);

export default router;

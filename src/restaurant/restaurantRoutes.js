
import express from 'express';
import { protect } from '../middleware/auth.js';
import { allowRoles } from '../middleware/role.js';

import {
  createRestaurant,
  getMyRestaurants,
  getRestaurants,
  getRestaurantById,
  updateRestaurant,
  setRestaurantOpenStatus,
} from './restaurantController.js';

const router = express.Router();

// Public routes
router.get('/', getRestaurants);
router.get('/mine', protect, allowRoles('owner'), getMyRestaurants);
router.get('/:id', getRestaurantById);

// Owner routes
router.post('/', protect, allowRoles('owner'), createRestaurant);
router.put('/:id', protect, allowRoles('owner'), updateRestaurant);
router.patch(
  '/:id/open',
  protect,
  allowRoles('owner'),
  setRestaurantOpenStatus
);

export default router;

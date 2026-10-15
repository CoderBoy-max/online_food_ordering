
import express from 'express';

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
router.get('/mine', getMyRestaurants);
router.get('/:id', getRestaurantById);

// Owner routes
router.post('/', createRestaurant);
router.put('/:id', updateRestaurant);
router.patch('/:id/open', setRestaurantOpenStatus);

export default router;

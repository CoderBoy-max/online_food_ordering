import express from 'express';
import {
  getRestaurants,
  getRestaurantById
} from './restaurantController.js';

const router = express.Router();

// Public routes: approved restaurants only
router.get('/', getRestaurants);
router.get('/:id', getRestaurantById);

export default router;

import express from 'express';
import {
  createRestaurant,
  getMyRestaurants,
  getRestaurants,
  getRestaurantById,
  updateRestaurant,
  setRestaurantOpenStatus,
} from './restaurantController.js';
import auth from '../middleware/auth.js';
import { allowRoles } from '../middleware/role.js';

const router = express.Router();

// Public routes — no login required
router.get('/', getRestaurants);
router.get('/:id', getRestaurantById);

// Owner routes — login and owner role required
router.get('/mine', auth, allowRoles('owner'), getMyRestaurants);
router.post('/', auth, allowRoles('owner'), createRestaurant);
router.put('/:id', auth, allowRoles('owner'), updateRestaurant);
router.patch('/:id/open', auth, allowRoles('owner'), setRestaurantOpenStatus);

export default router;

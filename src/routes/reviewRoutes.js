import { Router } from 'express';
import {
  createOrderReview,
  getRestaurantReviews,
} from '../controllers/reviewController.js';
import auth from '../middleware/auth.js';
import { allowRoles } from '../middleware/role.js';

const router = Router();

// Customer: review a delivered order
router.post('/v1/orders/:id/review', auth, allowRoles('customer'), createOrderReview);

// Public: reviews of a restaurant
router.get('/restaurants/:id/reviews', getRestaurantReviews);

export default router;

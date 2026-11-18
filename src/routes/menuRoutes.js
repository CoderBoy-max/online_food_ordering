import { Router } from 'express';
import * as controller from '../controllers/menuController.js';
import {
  validateIdParam,
  validateCategory,
  validateCreateMenuItem,
  validateUpdateMenuItem,
  validateAvailability,
} from '../validators/menu.validator.js';
// These two come from the Auth module (task A3).
import auth from '../middleware/auth.js';
import { allowRoles } from '../middleware/role.js';

const router = Router();
const owner = [auth, allowRoles('owner')];

// Public: full menu grouped by category (approved restaurants only)
router.get('/restaurants/:id/menu', validateIdParam, controller.getMenu);

// Owner: categories
router.post('/restaurants/:id/categories', ...owner, validateIdParam, validateCategory, controller.createCategory);
router.put('/categories/:id', ...owner, validateIdParam, validateCategory, controller.renameCategory);
router.delete('/categories/:id', ...owner, validateIdParam, controller.deleteCategory);

// Owner: menu items
router.post('/restaurants/:id/menu-items', ...owner, validateIdParam, validateCreateMenuItem, controller.createMenuItem);
router.put('/menu-items/:id', ...owner, validateIdParam, validateUpdateMenuItem, controller.updateMenuItem);
router.patch('/menu-items/:id/availability', ...owner, validateIdParam, validateAvailability, controller.setAvailability);
router.delete('/menu-items/:id', ...owner, validateIdParam, controller.deleteMenuItem);

export default router;

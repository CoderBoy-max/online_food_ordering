import express from "express";
import { authorizeFounder, protectAdmin } from "../middleware/auth.middleware.js";
import {
  createAdmin,
  deleteAdmin,
  getAdminById,
  getCurrentAdmin,
  getAdmins,
  loginAdmin,
  updateAdmin,
} from "../controllers/adminController.js";

const router = express.Router();

router.post("/login", loginAdmin);
router.post("/signup", createAdmin);
router.get("/me", protectAdmin, getCurrentAdmin);

router.use(protectAdmin);
router.route("/")
  .get(getAdmins)
  .post(createAdmin);

router.route("/:id")
  .get(getAdminById)
  .patch(updateAdmin)
  .delete(authorizeFounder, deleteAdmin);

export default router;

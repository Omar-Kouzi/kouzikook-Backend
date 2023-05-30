import categoryController from "../controllers/categoryController.js";
import express from "express";
import { protect } from "../middleware/authenticationMiddleware.js";

const router = express.Router();

router.route("/").get(categoryController.getAllCategories);
router.route("/").post(protect,categoryController.CreatCategory);
router.route("/:id").delete(protect,categoryController.deleteCategory);

export default router;

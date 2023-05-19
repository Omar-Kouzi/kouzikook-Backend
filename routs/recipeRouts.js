import Recipe from "../controllers/recipeControllers.js";
import express from "express";
import { protect } from "../middleware/authenticationMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.route("/").post(protect, upload.single("image"), Recipe.postRecipe);

router.route("/").patch(protect,upload.single("image"), Recipe.updateRecipeFour);

router.route("/").delete(protect, Recipe.deleteRecipe);

router.route("/").get( Recipe.getAllRecipes);

router.route("/likes").get( Recipe.likeRecipe);
router.route("/like").post( Recipe.likeRecipe);

export default router;

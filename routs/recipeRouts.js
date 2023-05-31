import Recipe from "../controllers/recipeControllers.js";
import express from "express";
import { protect } from "../middleware/authenticationMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.route("/:id").post(protect, upload.single("image"), Recipe.postRecipe);

router.route("/").patch(protect,upload.single("image"), Recipe.updateRecipeFour);

router.route("/:id").delete(Recipe.deleteRecipe);

router.route("/").get( Recipe.getAllRecipes);

router.route("/:id").get( Recipe.getRecipeById);

router.route("/approve/:id").patch( Recipe.approveRecipe);


export default router;

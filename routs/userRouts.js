import express from "express";
import UsersController from "../controllers/userControllers.js";
import { protect } from "../middleware/authenticationMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.route("/login").post(UsersController.login);

router.route("/").post(upload.single("image"), UsersController.registerUser);

router.route("/f/:id").post(protect, UsersController.followUser);

router.route("/unf/:id").post(protect, UsersController.unfollowUser);

router.route("/:id").patch(protect, upload.single("image"), UsersController.updateUserProfile);

router.route("/").get(UsersController.getAllUsers);

router.route("/:id").get(UsersController.getUserById);

router.route("/followers/:id").get(UsersController.getUserFollowers);

router.route("/following/:id").get(UsersController.getUserFollowing);

export default router;

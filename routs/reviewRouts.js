import reviewController from "../controllers/reviewControllers.js";
import express from "express";
import { protect } from "../middleware/authenticationMiddleware.js";

const router = express.Router();

router.route("/").get(reviewController.getAllRevirews);
router.route("/").post(protect,reviewController.postReview);
router.route("/").delete(protect,reviewController.deleteReview);


export default router;

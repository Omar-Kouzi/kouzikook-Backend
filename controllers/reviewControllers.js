import Review from "../models/reviewModel.js";
import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";

const getAllRevirews = asyncHandler(async (req, res) => {
  const reviews = await Review.find();
  res.json(reviews);
});

const postReview = asyncHandler(async (req, res) => {
  const { id } = req.body;

  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  const { comment } = req.body;

  if (!comment) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  try {
    const review = new Review({
      user: user.id,
      comment,
    });
    await review.save();

    return res.status(201).json({
      review,
    });
  } catch (err) {
    return res.status(201).json({
      err,
    });
  }
});
const deleteReview = asyncHandler(async (req, res) => {
  const { id } = req.body;

  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  const { reviewID } = req.body;

  if (!reviewID) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  try {
    await Review.findByIdAndDelete(reviewID);

    return res.status(201).json({
      message: "Review deleted successfully",
    });
  } catch (err) {
    return res.status(201).json({
      err,
    });
  }
});

export default { getAllRevirews, postReview, deleteReview };

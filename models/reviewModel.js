import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    comment:{
        type:String
    }
  },
  { timestamps: true }
);

const Review = mongoose.model("Review", reviewSchema);



export default Review;

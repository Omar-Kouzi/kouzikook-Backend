import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    image: {
      type: String,
    },
    title: {
      type: String,
    },
    decription: {
      type: String,
    },
    ingredients: {
      type: [String],
    },steps{
        type:String
    }
    ,
    likes: {
      type: Number,
    },
    reviews: {
      type: String,
    },
    savedPosts: {
      type: [String],
    },
    likedPosts: {
      type: [String],
    },
  },
  { timestamps: true }
);

const Post = mongoose.model("Cart", postSchema);

export default Post;

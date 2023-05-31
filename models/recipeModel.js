// import mongoose from "mongoose";

// const recipeSchema = new mongoose.Schema(
//   {
//     user: {
//       type: mongoose.Schema.Types.ObjectId,
//       required: true,
//       ref: "User",
//     },
//     title: {
//       type: String,
//     },
//     description: {
//       type: String,
//     },
//     ingredients: {
//       type: [],
//     },
//     steps: {
//       type: String,
//     },
//     image: {
//       type: String,
//     },
//     likes: {
//       type: {
//         number:Number,
//         user:{
//           type: mongoose.Schema.Types.ObjectId,
//           required: true,
//           ref: "User",
//         }
//       },
//     },
//     rating: {
//       type: Number,
//       default: 0,
//     },
//     category: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Category",
//     },
//     savedPosts: {
//       type: Boolean,
//       default: false,
//     },
//     likedPosts: {
//       type: Boolean,
//       default: false,
//     },
//     reviews: [
//       {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Review",
//       },
//     ],
//     approved: {
//       type: Boolean,
//       default: false,
//     },
//   },
//   { timestamps: true }
// );

// const Recipe = mongoose.model("Recipe", recipeSchema);

// Recipe.find()
//   .populate({ path: "categoryID", select: "title" })
//   .exec(function (err, recipes) {
//   });

// export default Recipe;
import mongoose from "mongoose";

const recipeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    ingredients: {
      type: [String],
      required: true,
    },
    steps: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    likesCount: {
      type: Number,
      default: 0,
    },
    liked: {
      type: Boolean,
      default: false,
    },
    approved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Recipe = mongoose.model("Recipe", recipeSchema);
Recipe.find()
  .populate({ path: "categoryID", select: "title" })
  .exec(function (err, recipes) {});

export default Recipe;

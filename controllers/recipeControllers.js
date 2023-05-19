import asyncHandler from "express-async-handler";
import Recipe from "../models/recipeModel.js";
import User from "../models/userModel.js";
import cloudinary from "cloudinary";
//============

const postRecipe = asyncHandler(async (req, res) => {
  const { id } = req.body;
console.log(id)
  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const { title, description, ingredients, steps, category } = req.body;

  if (!title || !description || !ingredients || !steps || !category) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  if (!req.file || req.file.length === 0) {
    return res.status(400).json({ message: "Image file is missing" });
  }

  try {
    cloudinary.v2.config({
      cloud_name: process.env.CLOUD_NAME,
      api_key: process.env.API_KEY,
      api_secret: process.env.API_SECRET,
    });

    const result = await cloudinary.v2.uploader.upload(req.file.path);

    // Split the ingredients string into an array
    const parsedIngredients = ingredients.split(";").map((i) => i.trim());

    const recipe = new Recipe({
      user: user.id,
      title,
      description,
      ingredients: parsedIngredients, // Use the parsed ingredients array
      steps,
      image: result.secure_url,
      category: category.split(",").map((c) => c.trim()), // Use the parsed categories array
    });

    await recipe.save();

    return res.status(201).json({
      recipe,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

//============

const getAllRecipes = asyncHandler(async (req, res) => {
  const recipe = await Recipe.find();
  res.json(recipe);
});

//============

const updateRecipeFour = asyncHandler(async (req, res) => {
  const { user, id } = req.body;
  const useri = await User.findById(user);

  if (!useri) {
    return res.status(404).json({ message: "User not found" });
  }

  const { title, description, ingredients, steps } = req.body;

  // Check if there is a new image
  let imageUrl;
  if (req.file) {
    try {
      cloudinary.v2.config({
        cloud_name: process.env.CLOUD_NAME,
        api_key: process.env.API_KEY,
        api_secret: process.env.API_SECRET,
      });

      const result = await cloudinary.v2.uploader.upload(req.file.path);
      imageUrl = result.secure_url;
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  // Split the ingredients string into an array
  const parsedIngredients = ingredients.split(";").map((i) => i.trim());

  // Update the recipe
  const updates = {
    title,
    description,
    ingredients: parsedIngredients,
    steps,
    ...(imageUrl && { image: imageUrl }),
  };

  const options = { new: true };
  const recipe = await Recipe.findByIdAndUpdate(id, updates, options);

  if (!recipe) {
    return res.status(404).json({ message: "Recipe not found" });
  }

  return res.json({ recipe });
});

//=============

const deleteRecipe = asyncHandler(async (req, res) => {
  const { user } = req.body;

  const userId = req.user.id;

  const finduser = await User.findById(user);
  if (finduser.isAdmin || user === userId) {
    const { id } = req.body;
    const recipe = await Recipe.findById(id);
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }
    await recipe.remove();
    res.json({
      message: "Recipe deleted successfully",
    });
  } else {
    return res
      .status(403)
      .json({ message: "You are not authorized to delete this recipe" });
  }
});

// // Like recipe
// const likeRecipe = asyncHandler(async (req, res) => {
//   const { user, id } = req.body;

//   const recipe = await Recipe.findById(id);
//   if (!recipe) {
//     return res.status(404).json({ message: "Recipe not found" });
//   }

 
//   // const likeIndex = recipe.likedPosts;
//   recipe.likedPosts=!(recipe.likedPosts)
//   await recipe.save();

//     console.log(recipe.likedPosts);

  

// });


const likeRecipe = asyncHandler(async (req, res) => {
  const { user, id } = req.body;

  const recipe = await Recipe.findById(id);
  console.log(id,recipe)
  if (!recipe) {
    return res.status(404).json({ message: "Like Recipe not found" });
  }

  // Check if the user has already liked this recipe
  const index = recipe.likedBy.indexOf(user);
  const liked = index !== -1;

  // Toggle the liked status
  if (liked) {
    recipe.likedBy.splice(index, 1);
  } else {
    recipe.likedBy.push(user);
  }

  // Update the likes count and save the recipe
  recipe.likesCount = recipe.likedBy.length;
  await recipe.save();

  // Return the recipe with the new 'liked' property
  const responseRecipe = recipe.toObject();
  responseRecipe.liked = !liked;
  return res.json({ recipe: responseRecipe });
});

// Get likes data for all recipes
const getLikesData = asyncHandler(async (req, res) => {
  // Retrieve likes data for all recipes
  const likesData = await Like.aggregate([
    {
      $group: {
        _id: "$recipe",
        likes: { $push: "$user" },
        count: { $sum: 1 },
      },
    },
  ]);

  // Create a map of recipe IDs to likes data
  const likesMap = new Map();
  likesData.forEach((item) => likesMap.set(item._id.toString(), item));

  return res.json(likesMap);
});

export default {
  likeRecipe,
  getLikesData,
  postRecipe,
  getAllRecipes,
  updateRecipeFour,
  deleteRecipe,
};

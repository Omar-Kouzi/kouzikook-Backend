import Category from "../models/categoryModel.js";
import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";

const CreatCategory = asyncHandler(async (req, res) => {

  
  const { title } = req.body;
  if (!title) {
    return res.status(400).json({
      message: "required field not found",
    });
  }
  const category = new Category({
    title,
  });
  await category.save();

  return res.status(201).json({
    category,
  });
});


const getAllCategories = asyncHandler(async (req, res, next) => {
  const categories = await Category.find();
  return res.status(404).json({ categories });
});

const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.body;

  const user = await User.findById(id);
  console.log(user)
  if (user.isAdmin == true) {
    const {id} = req.params
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "category not found" });
    }
    await category.remove();
    res.json({
      message: "category deleted successfully",
      deletedcategory: category,
    });
  }
});
export default { getAllCategories, CreatCategory , deleteCategory };

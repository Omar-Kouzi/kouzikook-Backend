import asyncHandler from "express-async-handler";
import generateToken from "../utils/generateToken.js";
import User from "../models/userModel.js";
import cloudinary from "cloudinary";
import Recipe from "../models/recipeModel.js";
//============
const registerUser = asyncHandler(async (req, res, next) => {
  const { name, email, password, isAdmin } = req.body;

  if (!name || !email || !password) {
    return res
      .status(200)
      .json({ message: "Missing required fields", success: false });
  }
  if (!req.file) {
    return res
      .status(200)
      .json({ message: "Required image missing", success: false });
  }

  // Check if user with same name or email already exists
  const existingUser = await User.findOne({ $or: [{ name }, { email }] });
  if (existingUser) {
    if (existingUser.email === email) {
      return res
        .status(200)
        .json({ message: "Email must be unique", success: false });
    } else {
      return res
        .status(200)
        .json({ message: "Name must be unique", success: false });
    }
  }

  // Upload image to Cloudinary
  cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
  });

  const result = (await cloudinary.uploader.upload(req.file.path)) || "";

  // Create user with uploaded image URL
  const user = new User({
    name,
    email,
    password,
    profilePic: result.secure_url,
    isAdmin: isAdmin || false,
    success: true,
  });

  try {
    await user.save();
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ message: messages });
    }
    throw error;
  }

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
    token: generateToken(user._id),
    phoneNumber: user.phoneNumber,
    profilePic: user.profilePic,
  });
});

//============

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && (await user.matchPassword(password))) {
    return res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
      phoneNumber: user.phoneNumber,
    });
  } else {
    return res.status(200).json({ message: "Invalid email or password" });
  }
});

//============

const updateUserProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  user.name = req.body.name || user.name;
  user.email = req.body.email || user.email;

  user.phoneNumber = req.body.phoneNumber || user.phoneNumber;

  if (req.file) {
    cloudinary.config({
      cloud_name: process.env.CLOUD_NAME,
      api_key: process.env.API_KEY,
      api_secret: process.env.API_SECRET,
    });

    const result = await cloudinary.uploader.upload(req.file.path);

    user.profilePic = result.secure_url;
  }

  if (req.body.password) {
    user.password = req.body.password;
  }

  const updatedUser = await user.save();

  res.json({
    _id: updatedUser.id,
    name: updatedUser.name,
    email: updatedUser.email,
    isAdmin: updatedUser.isAdmin,
    token: generateToken(updatedUser._id),
    phoneNumber: updatedUser.phoneNumber,
    profilePic: updatedUser.profilePic,
    followers: updatedUser.followers,
    following: updatedUser.following,
    savedPosts: updatedUser.savedPosts,
  });
});

//============

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find();
  res.json(users);
});

//============

const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);
  res.json(user);
});

//============

const getUserByName = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const user = await User.find({ name });
  res.json(user);
});

//============

const getUserFollowers = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  const user = await User.findById(userId).populate("followers", "name email");

  if (!user) {
    return res.status(200).json({ message: "User not found", success: false });
  }

  return res.json({
    followers: user.followers,
  });
});

//============

const getUserFollowing = asyncHandler(async (req, res) => {
  const userId = req.params.id;

  const user = await User.findById(userId).populate("following", "name email");

  if (!user) {
    return res.status(200).json({ message: "User not found", success: false });
  }

  return res.json({
    following: user.following,
  });
});

//============

const followUser = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    console.log(user);
    const { id } = req.params;
    const userToFollow = await User.findById(id);
    console.log(id);
    if (!userToFollow) {
      return res
        .status(200)
        .json({ message: "User not found", success: false });
    }

    if (userToFollow._id.equals(user._id)) {
      return res
        .status(200)
        .json({ message: "You cannot follow yourself", success: false });
    }

    if (userToFollow.followers.includes(user._id)) {
      return res
        .status(200)
        .json({ message: "Already following this user", success: false });
    }

    userToFollow.followers.push(user._id);
    user.following.push(userToFollow._id);

    await userToFollow.save();
    await user.save();

    return res.status(200).json({
      message: "User followed successfully",
      followers: userToFollow.followers,
      following: user.following,
    });
  } catch (error) {
    console.error(error);
    return res.status(200).json({ message: "Internal Server Error" });
  }
});

//============

const unfollowUser = asyncHandler(async (req, res) => {

  const user = await User.findById(req.user._id);
console.log(user)
  const { id } = req.params;
  const userToUnfollow = await User.findById(id);
console.log(id)
  if (!userToUnfollow) {
    return res.status(200).json({ message: "User not found", success: false });
  }

  if (!userToUnfollow.followers.includes(user._id)) {
    return res
      .status(200)
      .json({ message: "You are not following this user", success: false });
  }

  const index = userToUnfollow.followers.indexOf(user._id);
  userToUnfollow.followers.splice(index, 1);

  const followingIndex = user.following.indexOf(userToUnfollow._id);
  user.following.splice(followingIndex, 1);

  await userToUnfollow.save();
  await user.save();

  res.json({
    message: "User unfollowed successfully",
    following: user.following,
  });
});

// const savePost = asyncHandler(async (req, res) => {
//   try {
//     const { id } = req.params;
//     const user = await User.findById(req.user._id);
//     const post = await Post.findById(id);

//     if (!post) {
//       return res.status(404).json({ message: "receipe not found" });
//     }
//     if (post.saved.equals(true)) {
//       return res.status(400).json({ message: "receipe already saved" });
//     }

//     user.savedPosts.push(post._id);

//     await user.save();

//     res.json({
//       message: "Receipe saved successfully",
//       user,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// });

//============

const deleteUser = asyncHandler(async (req, res) => {
  const id = req.params.id;
  console.log(id);
  const user = await User.findById(id);
  console.log(user.following);

  // Remove user's id from followers array of all users
  await User.updateMany({ followers: id }, { $pull: { followers: id } });

  // Delete all recipes posted by the user
  await Recipe.deleteMany({ user: id });

  // Delete the user
  const deletedUser = await User.findByIdAndDelete(id);
  if (deletedUser) {
    return res.status(200).json({
      message: `${id} had been deleted successfully`,
    });
  } else return res.status(404).json({ message: `${id} not found` });
});

export default {
  registerUser,
  followUser,
  unfollowUser,
  updateUserProfile,
  getAllUsers,
  getUserById,
  getUserByName,
  getUserFollowers,
  getUserFollowing,
  login,
  deleteUser,
};

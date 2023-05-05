import asyncHandler from "express-async-handler";
import generateToken from "../utils/generateToken.js";
import User from "../models/userModel.js";

//============

const registerUser = asyncHandler(async (req, res, next) => {
  const { name, email, password, phoneNumber, isAdmin } = req.body;
  console.log(req.body);
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  if (!req.file) {
    return res.status(400).json({ message: "Image file is missing" });
  }

  const image_url = req.file.path;
  const user = new User({
    name,
    email,
    password,
    phoneNumber,
    profilePic: image_url,
    isAdmin: isAdmin || false,
  });
  await user.save();
  return res.status(201).json({
    _id: user.id,
    name: user.name,
    email: user.email,
    token: generateToken(user._id),
    phoneNumber: user.phoneNumber,
    profilePic: user.profilePic,
    followers: user.followers,
    following: user.following,
    isAdmin,
  });
});

//============

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
      phoneNumber: user.phoneNumber,
    });
  } else {
    res.status(401).json({ message: "Invalid email or password" });
  }
});

//============

// const logout = asyncHandler(async (req, res) => {
//   const { email, password } = req.body;
//   const user = await User.findOne({ email });
//   if (user && (await user.matchPassword(password))) {
//     res.json({
//       message: "Logged out successfully",
      
//     });
//   } else {
//     res.status(401).json({ message: "Invalid email or password" });
//   }
// });
//============

const updateUserProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);
  console.log("User: " + user);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  user.name = req.body.name || user.name;
  user.email = req.body.email || user.email;
  user.phoneNumber = req.body.phoneNumber || user.phoneNumber;

  if (req.file) {
    user.profilePic = req.file.path;
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
    savedPosts: updatedUser.savedPosts
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

const getUserFollowers = asyncHandler(async (req, res) => {
  const userId = req.params.id;

  const user = await User.findById(userId).populate("followers", "name email");

  if (!user) {
    return res.status(404).json({ message: "User not found" });
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
    return res.status(404).json({ message: "User not found" });
  }

  return res.json({
    following: user.following,
  });
});

//============

const followUser = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.user._id);
    const userToFollow = await User.findById(id);

    if (!userToFollow) {
      return res.status(404).json({ message: "User not found" });
    }

    if (userToFollow._id.equals(user._id)) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    if (userToFollow.followers.includes(user._id)) {
      return res.status(400).json({ message: "Already following this user" });
    }

    userToFollow.followers.push(user._id);
    user.following.push(userToFollow._id);

    await userToFollow.save();
    await user.save();

    res.json({
      message: "User followed successfully",
      followers: userToFollow.followers,
      following: user.following,
    });
  } catch (error) {
    // Handle the error
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//============

const unfollowUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(req.user._id);
  const userToUnfollow = await User.findById(id);

  if (!userToUnfollow) {
    return res.status(404).json({ message: "User not found" });
  }

  if (!userToUnfollow.followers.includes(user._id)) {
    return res.status(400).json({ message: "You are not following this user" });
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
export default {
  registerUser,
  followUser,
  unfollowUser,
  updateUserProfile,
  getAllUsers,
  getUserById,
  getUserFollowers,
  getUserFollowing,
  login,
};

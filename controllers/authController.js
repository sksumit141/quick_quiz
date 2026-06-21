// const asyncHandler = require('express-async-handler');
// const User = require('../models/User');
// const jwt = require('jsonwebtoken');

// const generateToken = (id) => {
//     return jwt.sign({ id }, process.env.JWT_SECRET, {
//         expiresIn: '30d'
//     });
// };

// const registerUser = asyncHandler(async (req, res) => {
//     const { username, email, password } = req.body;

//     if (!username || !email || !password) {
//         res.status(400);
//         throw new Error('Please include all fields');
//     }

//     // Check if user exists
//     const userExists = await User.findOne({ email });

//     if (userExists) {
//         res.status(400);
//         throw new Error('User already exists');
//     }

//     // Create user
//     const user = await User.create({
//         username,
//         email,
//         password
//     });

//     if (user) {
//         res.status(201).json({
//             _id: user._id,
//             username: user.username,
//             email: user.email,
//             token: generateToken(user._id)
//         });
//     } else {
//         res.status(400);
//         throw new Error('Invalid user data');
//     }
// });

// const loginUser = asyncHandler(async (req, res) => {
//     const { email, password } = req.body;

//     const user = await User.findOne({ email });

//     if (user && (await user.matchPassword(password))) {
//         res.json({
//             _id: user._id,
//             username: user.username,
//             email: user.email,
//             token: generateToken(user._id)
//         });
//     } else {
//         res.status(401);
//         throw new Error('Invalid credentials');
//     }
// });

// const getMe = asyncHandler(async (req, res) => {
//     const user = {
//         id: req.user._id,
//         email: req.user.email,
//         username: req.user.username
//     };
//     res.status(200).json(user);
// });

// module.exports = {
//     registerUser,
//     loginUser,
//     getMe
// };

const asyncHandler = require("express-async-handler");
const User = require("../models/User");

// Register User
const registerUser = asyncHandler(async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      res.status(400);
      throw new Error("Please include all fields");
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error("User already exists");
    }

    const user = await User.create({
      username,
      email,
      password,
    });

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token: user.generateToken(),
    });
  } catch (error) {
    console.error("CREATE ERROR:", error);
    throw error;
  }
});

// Login User
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Please provide email and password");
  }

  const user = await User.findOne({ email });

  if (!user) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  res.status(200).json({
    _id: user._id,
    username: user.username,
    email: user.email,
    token: user.generateToken(),
  });
});

// Get Current User
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    id: req.user._id,
    username: req.user.username,
    email: req.user.email,
  });
});

module.exports = {
  registerUser,
  loginUser,
  getMe,
};

import express from "express";
import User from "../models/User.js";
import logger from "../utils/logger.js";

const router = express.Router();

// TODO: Add JWT authentication middleware
// import auth from '../middleware/auth.js';

// Get user by ID
router.get("/:userId", async (req, res) => {
  try {
    logger.debug("Fetching user by ID", { userId: req.params.userId });

    const user = await User.findById(req.params.userId).select(
      "-hashedPassword",
    );

    if (!user) {
      logger.warn("User not found", { userId: req.params.userId });
      return res.status(404).json({ error: "User not found" });
    }

    logger.info("User fetched successfully", { userId: user._id });
    res.status(200).json(user);
  } catch (error) {
    logger.error("Error fetching user", {
      userId: req.params.userId,
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({ error: "Server error" });
  }
});

// User login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    logger.debug("Login attempt", { username });

    // Validate input
    if (!username || !password) {
      logger.warn("Login failed - missing credentials", { username });
      return res
        .status(400)
        .json({ error: "Username and password are required" });
    }

    // Find user by username or email
    const user = await User.findOne({
      $or: [{ username: username }, { email: username }],
    });

    if (!user) {
      logger.warn("Login failed - invalid credentials", { username });
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Check if user is active
    if (!user.isActive) {
      logger.warn("Login failed - account deactivated", { userId: user._id });
      return res.status(401).json({ error: "Account is deactivated" });
    }

    // Verify password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      logger.warn("Login failed - invalid password", { userId: user._id });
      return res.status(401).json({ error: "Invalid credentials" });
    }

    logger.info("User logged in successfully", { userId: user._id });
    res.status(200).json({
      user: user.toJSON(),
    });
  } catch (error) {
    logger.error("Login error", {
      username: req.body.username,
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({ error: "Server error" });
  }
});

// User signup
router.post("/signup", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      username,
      password,
      age,
      travelPreferences,
    } = req.body;

    logger.debug("New user signup attempt", { username, email });

    // Validate required fields
    if (!firstName || !lastName || !email || !username || !password) {
      logger.warn("Signup failed - missing required fields", {
        username,
        email,
      });
      return res
        .status(400)
        .json({ error: "All required fields must be provided" });
    }

    // Check if username already exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      logger.warn("Signup failed - username exists", { username });
      return res.status(409).json({ error: "Username already exists" });
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      logger.warn("Signup failed - email exists", { email });
      return res.status(409).json({ error: "Email already exists" });
    }

    // Create new user
    const newUser = new User({
      firstName,
      lastName,
      email,
      username,
      hashedPassword: password,
      age: age || null,
      travelPreferences: travelPreferences || {
        budgetRange: "mid-range",
        travelStyle: "balanced",
        interests: [],
        accommodationStyle: "hotels",
        dietaryRestrictions: ["none"],
        accessibilityNeeds: ["none"],
      },
      profileCompleted: false,
    });

    await newUser.save();
    logger.info("New user created successfully", {
      userId: newUser._id,
      username: newUser.username,
    });

    res.status(201).json({
      user: newUser.toJSON(),
    });
  } catch (error) {
    logger.error("Signup error", {
      username: req.body.username,
      email: req.body.email,
      error: error.message,
      stack: error.stack,
    });

    if (error.code === 11000) {
      return res
        .status(409)
        .json({ error: "Username or email already exists" });
    }

    res.status(500).json({ error: "Server error" });
  }
});

// Update user profile (including travel preferences)
router.put("/profile/:userId", async (req, res) => {
  try {
    const { travelPreferences, profileCompleted } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      {
        travelPreferences,
        profileCompleted: profileCompleted || false,
      },
      { new: true, runValidators: true },
    ).select("-hashedPassword");

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Search users (for collaboration)
router.get("/search/:query", async (req, res) => {
  try {
    const { query } = req.params;

    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
        { firstName: { $regex: query, $options: "i" } },
        { lastName: { $regex: query, $options: "i" } },
      ],
      isActive: true,
    })
      .select("username email firstName lastName")
      .limit(10);

    res.status(200).json(users);
  } catch (error) {
    console.error("User search error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// TODO: Add more user management endpoints:
// - Password reset
// - Account deletion
// - Email verification
// - Profile picture upload

export default router;

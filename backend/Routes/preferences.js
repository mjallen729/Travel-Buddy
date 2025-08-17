import express from "express";
import mongoose from "mongoose";
import User from "../models/User.js";
import logger from "../utils/logger.js";

const router = express.Router();

router.post("/", async (req, res) => {
  // never log raw secrets
  const { hashedPassword, ...rest } = req.body || {};
  const safeBody = {
    ...rest,
    ...(hashedPassword ? { hashedPassword: "***masked***" } : {}),
  };

  logger.info("📥 POST /api/preferences", { body: safeBody });

  // 1) pull fields safely
  const {
    _id,
    firstName,
    lastName,
    email,
    username,
    hashedPassword: hpw,
    age,
    createdAt,
    travelPreferences = {},
  } = req.body || {};

  const { budgetRange, travelStyle, accommodationStyle, interests } =
    travelPreferences;

  // 2) validate
  const missing = [];
  if (!_id || !mongoose.Types.ObjectId.isValid(_id)) missing.push("_id");
  if (!firstName) missing.push("firstName");
  if (!lastName) missing.push("lastName");
  if (!email) missing.push("email");
  if (!username) missing.push("username");
  if (!hpw) missing.push("hashedPassword");
  if (age === undefined || isNaN(Number(age))) missing.push("age");
  if (!createdAt) missing.push("createdAt");
  if (!budgetRange) missing.push("travelPreferences.budgetRange");
  if (!travelStyle) missing.push("travelPreferences.travelStyle");
  if (!accommodationStyle) missing.push("travelPreferences.accommodationStyle");
  if (!Array.isArray(interests)) missing.push("travelPreferences.interests");

  if (missing.length > 0) {
    logger.warn("⚠️ Missing required fields", { missing });
    return res.status(400).json({ error: "Missing required fields", missing });
  }

  // 3) update payload
  const update = {
    firstName,
    lastName,
    email,
    username,
    hashedPassword: hpw,
    age: Number(age),
    createdAt,
    travelPreferences: {
      budgetRange,
      travelStyle,
      accommodationStyle,
      interests,
    },
    updatedAt: new Date(),
  };

  // 4) upsert
  try {
    const updatedUser = await User.findByIdAndUpdate(
      _id,
      { $set: update },
      { new: true, upsert: true, runValidators: true }
    );

    logger.info("✅ Preferences upserted", { userId: String(_id) });
    return res.status(200).json({
      message: "User preferences saved successfully",
      data: updatedUser,
    });
  } catch (err) {
    logger.error("❌ [Preferences Update] Error", {
      error: err.message,
      stack: err.stack,
    });
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

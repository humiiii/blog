// routes/profile.js
import express from "express";
import User from "../models/User.js";

const router = express.Router();

/**
 * @route   POST /api/user/get-profile
 * @desc    Fetch public profile details of a user by username
 * @access  Public
 */
router.post("/get-profile", async (req, res) => {
  try {
    const { username } = req.body;

    if (!username || typeof username !== "string" || !username.trim()) {
      return res
        .status(400)
        .json({ success: false, error: "A valid username is required." });
    }

    const user = await User.findOne({
      "personal_info.username": username.trim(),
    }).select("-personal_info.password -blogs -updatedAt");

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found." });
    }

    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("[Get Profile] Error:", error);
    return res
      .status(500)
      .json({ success: false, error: "An error occurred. Please try again." });
  }
});

export default router;

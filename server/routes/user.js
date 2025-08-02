// routes/profile.js
import express from "express";
import User from "../models/User.js";
import authMiddleware from "../middleware/authMiddleware.js";
import bcrypt from "bcrypt";
import { z } from "zod";

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

// Zod schema for password validation
const passwordSchema = z.object({
  currentPassword: z.string().min(6, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

router.post("/change-password", authMiddleware, async (req, res) => {
  try {
    // Validate passwords
    const { currentPassword, newPassword } = passwordSchema.parse(req.body);

    // Find user by ID
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Compare current password
    const isMatch = await bcrypt.compare(
      currentPassword,
      user.personal_info.password
    );
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Current password is incorrect." });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await User.findByIdAndUpdate(user._id, {
      "personal_info.password": hashedPassword,
    });

    return res.status(200).json({ message: "Password changed successfully." });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    console.error("Change Password Error:", error);
    return res.status(500).json({ message: "An unexpected error occurred." });
  }
});

export default router;

// routes/profile.js
import express from "express";
import User from "../models/User.js";
import authMiddleware from "../middleware/authMiddleware.js";
import bcrypt from "bcrypt";
import { z } from "zod";

const router = express.Router();

// Zod Schemas
const bioLimit = 150;
const updateProfileSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  bio: z
    .string()
    .max(bioLimit, `Bio must not exceed ${bioLimit} characters`)
    .optional(),
  social_links: z
    .object({
      linkedin: z.string().url().optional().or(z.literal("")),
      facebook: z.string().url().optional().or(z.literal("")),
      github: z.string().url().optional().or(z.literal("")),
      instagram: z.string().url().optional().or(z.literal("")),
      twitter: z.string().url().optional().or(z.literal("")),
      website: z.string().url().optional().or(z.literal("")),
    })
    .partial()
    .optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(6, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

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

/**
 * @route   POST /api/user/change-password
 * @desc    Change user's password
 * @access  Private
 */
router.post("/change-password", authMiddleware, async (req, res) => {
  try {
    // Validate passwords
    const { currentPassword, newPassword } = passwordSchema.parse(req.body);

    // Find user by ID
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found." });

    // Compare current password
    const isMatch = await bcrypt.compare(
      currentPassword,
      user.personal_info.password
    );
    if (!isMatch) {
      return res.status(400).json({ error: "Current password is incorrect." });
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
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error("Change Password Error:", error);
    return res.status(500).json({ error: "An unexpected error occurred." });
  }
});

/**
 * @route   POST /api/user/update-profile-image
 * @desc    Update profile image
 * @access  Private
 */
router.post("/update-profile-image", authMiddleware, async (req, res) => {
  try {
    const { uploadedUrl } = req.body;

    if (!uploadedUrl || typeof uploadedUrl !== "string") {
      return res.status(400).json({ error: "Invalid or missing uploadedUrl." });
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: req.user.id },
      { "personal_info.profile_img": uploadedUrl },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found." });
    }

    return res.status(200).json({
      message: "Profile image updated successfully.",
      profile_img: updatedUser.personal_info.profile_img,
    });
  } catch (error) {
    console.error("Error updating profile image:", error);
    return res
      .status(500)
      .json({ error: "An internal server error occurred." });
  }
});

/**
 * @route   POST /api/user/update-profile
 * @desc    Update user's username, bio, and social links
 * @access  Private
 */
router.post("/update-profile", authMiddleware, async (req, res) => {
  try {
    // Validate request body
    const parsed = updateProfileSchema.parse(req.body);
    const { username, bio = "", social_links = {} } = parsed;

    // Domain validation for social links
    for (const [key, urlString] of Object.entries(social_links)) {
      if (urlString && urlString.length > 0) {
        let hostname;
        try {
          hostname = new URL(urlString).hostname.toLowerCase();
        } catch {
          return res.status(400).json({ error: `Invalid URL for ${key}` });
        }
        if (key !== "website") {
          const expectedDomain = `${key}.com`;
          if (!hostname.includes(expectedDomain)) {
            return res.status(400).json({
              error: `Invalid URL domain for ${key}, expected domain to contain "${expectedDomain}"`,
            });
          }
        }
      }
    }

    // Prepare update object
    const updateObject = {
      "personal_info.username": username,
      "personal_info.bio": bio,
      social_links,
    };

    // Update user document with validation enabled
    const updatedUser = await User.findOneAndUpdate(
      { _id: req.user.id },
      updateObject,
      { new: true, runValidators: true }
    );

    console.log(updatedUser);

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found." });
    }

    // Return updated fields
    return res.status(200).json({
      username: updatedUser.personal_info.username,
      bio: updatedUser.personal_info.bio,
      social_links: updatedUser.social_links,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error("Update profile error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

export default router;

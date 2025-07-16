import express from "express";
import bcrypt from "bcrypt";
import { z } from "zod";
import slugify from "slugify";
import jwt from "jsonwebtoken";

import User from "../models/User.js";

const router = express.Router();

// Schema validation using Zod
const signupSchema = z.object({
  fullname: z.string().min(3, "Fullname must be at least 3 characters long"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

/**
 * Generates a unique username based on the email.
 * Appends a random 4-digit number to the slugified local part.
 */
async function generateUniqueUsername(email, digits = 4) {
  const base = slugify(email.split("@")[0], {
    lower: true,
    strict: true,
  }).slice(0, 16);

  let username;
  let exists = true;

  while (exists) {
    const randomSuffix = Math.random()
      .toString()
      .slice(2, 2 + digits);
    username = `${base}${randomSuffix}`;

    try {
      exists = await User.exists({ "personal_info.username": username });
    } catch (err) {
      throw new Error("Error checking username uniqueness");
    }
  }

  return username;
}

/**
 * Generates JWT and sends user data with token in response.
 */
function sendUserWithToken(res, user, statusCode = 200) {
  const payload = {
    id: user._id,
    username: user.personal_info.username,
    fullname: user.personal_info.fullname,
    profile_img: user.personal_info.profile_img,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  const responseData = {
    accessToken: token,
    user: {
      username: payload.username,
      fullname: payload.fullname,
      profile_img: payload.profile_img,
    },
    message: "Welcome, you are now logged in",
  };

  res.status(statusCode).json(responseData);
}

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new user
 * @access  Public
 */
router.post("/signup", async (req, res) => {
  const result = signupSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ errors: result.error.errors });
  }

  const { fullname, email, password } = result.data;

  try {
    // Check if email already exists
    const existingUser = await User.findOne({ "personal_info.email": email });
    if (existingUser) {
      return res.status(409).json({ error: "Email is already registered" });
    }

    // Generate unique username
    const username = await generateUniqueUsername(email);

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save the user
    const newUser = new User({
      personal_info: {
        fullname,
        email,
        password: hashedPassword,
        username,
      },
    });

    await newUser.save();

    // Respond with token and user info
    sendUserWithToken(res, newUser, 201);
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ error: "Server error during signup" });
  }
});

/**
 * @route   POST /api/auth/signin
 * @desc    Login an existing user
 * @access  Public
 */
router.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  if (!email?.trim() || !password?.trim()) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ "personal_info.email": email });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.personal_info.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    sendUserWithToken(res, user);
  } catch (err) {
    console.error("Signin error:", err);
    return res.status(500).json({ error: "Server error during signin" });
  }
});

export default router;

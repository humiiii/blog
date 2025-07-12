const express = require("express");
const bcrypt = require("bcryptjs");
const { z } = require("zod");
const slugify = require("slugify");
const jwt = require("jsonwebtoken");

const User = require("../models/User").default || require("../models/User");

const router = express.Router();

const signupSchema = z.object({
  fullname: z.string().min(3, "Fullname must be at least 3 characters"),
  email: z.email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Function to generate a unique username from email with a random number prefix

async function generateUniqueUsername(email, digits = 4) {
  // 1) slugify and lowercase the email local‑part
  const base = slugify(email.split("@")[0], {
    lower: true,
    strict: true,
  }).slice(0, 16);

  let username;
  let exists = true;

  while (exists) {
    // 2) generate a new random numeric suffix each iteration
    const randomSuffix = Math.random()
      .toString()
      .slice(2, 2 + digits); // e.g. "4839" for 4 digits

    username = `${base}${randomSuffix}`;

    // 3) check your exact schema path here:
    exists = await User.exists({ "personal_info.username": username });
  }

  return username;
}

function sendUserWithToken(res, user) {
  const payload = {
    id: user._id,
    username: user.personal_info.username,
    fullname: user.personal_info.fullname,
    profile_img: user.personal_info.profile_img,
  };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.status(201).json({
    accessToken: token,
    user: {
      username: payload.username,
      fullname: payload.fullname,
      profile_img: payload.profile_img,
    },
  });
}

router.post("/signup", async (req, res) => {
  // Validate form data
  const result = signupSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ errors: result.error.errors });
  }
  const { fullname, email, password } = result.data;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ "personal_info.email": email });
    if (existingUser) {
      return res.status(409).json({ error: "Email already registered" });
    }
    // Generate unique username
    const username = await generateUniqueUsername(email);
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create user
    const newUser = new User({
      personal_info: {
        fullname,
        email,
        password: hashedPassword,
        username,
      },
    });
    await newUser.save();
    // Send JWT and user info
    sendUserWithToken(res, newUser);
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;

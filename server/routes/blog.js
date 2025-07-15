const express = require("express");
const { nanoid } = require("nanoid");
const authMiddleware = require("../middleware/authMiddleware");
const Blog = require("../models/Blog").default || require("../models/Blog");
const User = require("../models/User").default || require("../models/User");

const router = express.Router();

/**
 * @route   POST /api/blogs
 * @desc    Create a new blog post (or save as draft)
 * @access  Private
 */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const authorId = req.user.id;
    let { title, description, content, banner, tags = [], draft } = req.body;

    // Basic validation
    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Title is required." });
    }

    if(!draft){
        if (!description || !description.trim() || description.length > 200) {
          return res.status(400).json({
            error: "Description is required and must be ≤ 200 characters.",
          });
        }

        if (!banner || !banner.trim()) {
          return res
            .status(400)
            .json({ error: "Banner image URL is required." });
        }

        if (
          !content ||
          typeof content !== "object" ||
          !Array.isArray(content.blocks) ||
          content.blocks.length === 0
        ) {
          return res.status(400).json({ error: "Content is required." });
        }

        if (
          !Array.isArray(tags) ||
          tags.some((t) => typeof t !== "string") ||
          tags.length > 10
        ) {
          return res
            .status(400)
            .json({ error: "Tags must be a string array of ≤ 10 items." });
        }
    }

    

    // Normalize tags
    tags = tags.map((tag) => tag.trim().toLowerCase());

    // Generate a URL‑friendly slug + unique id
    const slugBase = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const slug = `${slugBase}-${nanoid(6)}`;

    // Build and save the blog
    const blog = new Blog({
      title: title.trim(),
      description: description.trim(),
      banner: banner.trim(),
      content,
      tags,
      author: authorId,
      blog_id: slug,
      draft: Boolean(draft),
    });

    await blog.save();

    // Increment total_posts only if not a draft
    if (!blog.draft) {
      await User.findByIdAndUpdate(authorId, {
        $inc: { "account_info.total_posts": 1 },
        $push: { blogs: blog._id },
      });
    } else {
      await User.findByIdAndUpdate(authorId, {
        $push: { blogs: blog._id },
      });
    }

    return res.status(201).json({ message: "Blog saved.", blog });
  } catch (err) {
    console.error("Error creating blog:", err);
    return res
      .status(500)
      .json({ error: "Server error. Please try again later." });
  }
});

module.exports = router;

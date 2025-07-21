import express from "express";
import { nanoid } from "nanoid";

import authMiddleware from "../middleware/authMiddleware.js";
import Blog from "../models/Blog.js";
import User from "../models/User.js";

const router = express.Router();

/**
 * @route   POST /api/blogs/latest
 * @desc    Fetch latest 5 published blogs
 * @access  Public
 */

router.post("/latest", async (req, res) => {
  try {
    let { page } = req.body;
    let maxLimit = 5;
    const blogs = await Blog.find({ draft: false })
      .limit(maxLimit)
      .sort({ publishedAt: -1 })
      .select("blog_id title description banner activity tags publishedAt")
      .populate({
        path: "author",
        select:
          "personal_info.profile_img personal_info.username personal_info.fullname -_id",
      })
      .skip((page - 1) * maxLimit);
    return res.status(200).json({ blogs });
  } catch (error) {
    console.error("Error fetching latest blogs:", err);
    return res.status(500).json({ error: "Failed to fetch blogs. Try again." });
  }
});

/**
 * @route   POST /api/blogs/all-latest-blogs-count
 * @desc    Get total count of latest published blogs (non-drafts)
 * @access  Public
 */

router.post("/all-latest-blogs-count", async (req, res) => {
  try {
    const totalDocs = await Blog.countDocuments({ draft: false });
    console.log(totalDocs);
    return res.status(200).json({ success: true, totalDocs });
  } catch (error) {
    console.error("Error fetching blog count:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch blog count. Please try again later.",
    });
  }
});

/**
 * @route   GET /api/blogs/trending
 * @desc    Get trending blogs sorted by reads and likes
 * @access  Public
 */

router.get("/trending", async (req, res) => {
  try {
    const blogs = await Blog.find({ draft: false })
      .sort({
        "activity.total_reads": -1,
        "activity.total_likes": -1,
        publishedAt: -1,
      })
      .limit(5)
      .select("blog_id title publishedAt -_id")
      .populate({
        path: "author",
        select:
          "personal_info.profile_img personal_info.username personal_info.fullname -_id",
      });
    res.status(200).json({ blogs });
  } catch (error) {
    console.error("Error fetching trending blogs:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch trending blogs. Please try again." });
  }
});

/**
 * @route   POST /api/blogs
 * @desc    Create a new blog post (or save as draft)
 * @access  Private
 */
router.post("/create-blog", authMiddleware, async (req, res) => {
  try {
    const authorId = req.user.id;
    let { title, description, content, banner, tags = [], draft } = req.body;

    // Basic validation
    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Title is required." });
    }

    if (!draft) {
      if (!description || !description.trim() || description.length > 200) {
        return res.status(400).json({
          error: "Description is required and must be ≤ 200 characters.",
        });
      }

      if (!banner || !banner.trim()) {
        return res.status(400).json({ error: "Banner image URL is required." });
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

export default router;

import express from "express";
import Blog from "../models/Blog.js";
import User from "../models/User.js";

const router = express.Router();

/**
 * @route   POST /api/search/search-blogs
 * @desc    Search blogs by tag or query with pagination (5 per page)
 * @access  Public
 */
router.post("/search-blogs", async (req, res) => {
  try {
    const { tag, query, author, page = 1, limit = 5, currentBlog } = req.body;

    if (
      (!tag || typeof tag !== "string" || !tag.trim()) &&
      (!query || typeof query !== "string" || !query.trim()) &&
      (!author || typeof author !== "string" || !author.trim())
    ) {
      return res.status(400).json({
        success: false,
        error: "Either 'tag', 'query', or 'author' must be provided.",
      });
    }

    let findQuery = { draft: false, blog_id: { $ne: currentBlog } };

    if (tag?.trim()) {
      findQuery.tags = tag.trim().toLowerCase();
    } else if (query?.trim()) {
      findQuery.title = new RegExp(query.trim(), "i");
    } else if (author?.trim()) {
      findQuery.author = author.trim().toLowerCase();
    }

    const skip = (Number(page) - 1) * limit;

    const blogs = await Blog.find(findQuery)
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("blog_id title description banner activity tags publishedAt")
      .populate({
        path: "author",
        select:
          "personal_info.profile_img personal_info.username personal_info.fullname -_id",
      });

    return res.status(200).json({ success: true, blogs });
  } catch (error) {
    console.error("[Search Blogs] Error:", error.message);
    return res.status(500).json({
      success: false,
      error: "An unexpected error occurred while searching blogs.",
    });
  }
});

/**
 * @route   POST /api/search/search-blogs-count
 * @desc    Count total blogs for a given tag
 * @access  Public
 */
router.post("/search-blogs-count", async (req, res) => {
  try {
    const { tag, query, author } = req.body;

    if (
      (!tag || typeof tag !== "string" || !tag.trim()) &&
      (!query || typeof query !== "string" || !query.trim()) &&
      (!author || typeof author !== "string" || !author.trim())
    ) {
      return res.status(400).json({
        success: false,
        error: "Either 'tag', 'query', or 'author' must be provided.",
      });
    }

    let countQuery = { draft: false };

    if (tag?.trim()) {
      countQuery.tags = tag.trim().toLowerCase();
    } else if (query?.trim()) {
      countQuery.title = new RegExp(query.trim(), "i");
    } else if (author?.trim()) {
      countQuery.author = author.trim().toLowerCase();
    }

    const totalDocs = await Blog.countDocuments(countQuery);

    return res.status(200).json({ success: true, totalDocs });
  } catch (error) {
    console.error("[Search Blogs Count] Error:", error.message);
    return res.status(500).json({
      success: false,
      error: "Failed to count blogs. Please try again later.",
    });
  }
});

/**
 * @route   POST /api/search/search-users
 * @desc    Search users by username (case-insensitive, max 50 results)
 * @access  Public
 */

router.post("/search-users", async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || typeof query !== "string" || !query.trim()) {
      return res.status(400).json({
        success: false,
        error: "Invalid search query.",
      });
    }

    const users = await User.find({
      "personal_info.username": new RegExp(query.trim(), "i"),
    })
      .limit(50)
      .select(
        "personal_info.username personal_info.fullname personal_info.profile_img -_id"
      );

    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Error searching users:", error.message);
    return res.status(500).json({
      success: false,
      error: "Failed to search users. Please try again later.",
    });
  }
});

export default router;

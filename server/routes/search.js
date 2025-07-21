import express from "express";
import Blog from "../models/Blog.js";

const router = express.Router();

/**
 * @route   POST /api/search/search-blogs
 * @desc    Search blogs by tag with pagination (5 per page)
 * @access  Public
 */
router.post("/search-blogs", async (req, res) => {
  try {
    const { tag, page = 1 } = req.body;

    // --- Validate tag ---
    if (!tag || typeof tag !== "string" || !tag.trim()) {
      return res
        .status(400)
        .json({ success: false, error: "A valid 'tag' is required." });
    }

    const query = { tags: tag.trim().toLowerCase(), draft: false };
    const LIMIT = 5;
    const skip = (page - 1) * LIMIT;

    const blogs = await Blog.find(query)
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(LIMIT)
      .select("blog_id title description banner activity tags publishedAt")
      .populate({
        path: "author",
        select:
          "personal_info.profile_img personal_info.username personal_info.fullname -_id",
      });

    return res.status(200).json({ success: true, blogs });
  } catch (error) {
    console.error("[Search Blogs] Error:", error);
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
    const { tag } = req.body;

    // --- Validate tag ---
    if (!tag || typeof tag !== "string" || !tag.trim()) {
      return res
        .status(400)
        .json({ success: false, error: "A valid 'tag' is required." });
    }

    const query = { tags: tag.trim().toLowerCase(), draft: false };
    const totalDocs = await Blog.countDocuments(query);

    return res.status(200).json({ success: true, totalDocs });
  } catch (error) {
    console.error("[Search Blogs Count] Error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to count blogs. Please try again later.",
    });
  }
});

export default router;

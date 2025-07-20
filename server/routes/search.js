import express from "express";
import Blog from "../models/Blog.js";

const router = express.Router();

/**
 * @route   POST /api/search/search-blogs
 * @desc    Search blogs by tag (returns latest 5 non-draft blogs)
 * @access  Public
 */
router.post("/search-blogs", async (req, res) => {
  try {
    const { tag } = req.body;

    // --- Input Validation ---
    if (typeof tag !== "string" || tag.trim().length === 0) {
      return res
        .status(400)
        .json({ error: "A valid 'tag' is required in body." });
    }

    const query = { tags: tag.trim(), draft: false };
    const LIMIT = 5;

    // --- Fetch Blogs ---
    const blogs = await Blog.find(query)
      .sort({ publishedAt: -1 })
      .limit(LIMIT)
      .select("blog_id title description banner activity tags publishedAt")
      .populate({
        path: "author",
        select:
          "personal_info.profile_img personal_info.username personal_info.fullname -_id",
      });

    return res.status(200).json({ blogs });
  } catch (error) {
    // --- Error Handling ---
    console.error("[Blog Search] Failed to fetch blogs:", error);
    return res
      .status(500)
      .json({ error: "An unexpected error occurred while fetching blogs." });
  }
});

export default router;

import express from "express";
import { nanoid } from "nanoid";

import authMiddleware from "../middleware/authMiddleware.js";
import Blog from "../models/Blog.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import Comment from "../models/Comment.js";

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
/**
 * @route   POST /api/blogs/create-blog
 * @desc    Create a new blog post or update an existing one (if blogId provided)
 * @access  Private
 */
router.post("/create-blog", authMiddleware, async (req, res) => {
  try {
    const authorId = req.user.id;
    let {
      blogId,
      title,
      description,
      content,
      banner,
      tags = [],
      draft,
    } = req.body;

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

    // Generate slug (only if creating new blog)

    console.log(blogId);

    let slug;
    if (!blogId) {
      const slugBase = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      slug = `${slugBase}-${nanoid(6)}`;
    }

    // If blogId is provided, update the existing blog
    if (blogId) {
      // Find the blog by blog_id and update fields
      const blog = await Blog.findOneAndUpdate(
        { blog_id: blogId },
        {
          title: title.trim(),
          description: description ? description.trim() : "",
          banner: banner ? banner.trim() : "",
          content,
          tags,
          draft: Boolean(draft),
        },
        { new: true }
      );

      if (!blog) {
        return res.status(404).json({
          error: "Blog not found or you do not have permission to update.",
        });
      }

      return res.status(200).json({ message: "Blog updated.", blog });
    }

    // Otherwise create a new blog
    const newBlog = new Blog({
      title: title.trim(),
      description: description.trim(),
      banner: banner.trim(),
      content,
      tags,
      author: authorId,
      blog_id: slug,
      draft: Boolean(draft),
    });

    await newBlog.save();

    // Increment total_posts only if not a draft
    if (!newBlog.draft) {
      await User.findByIdAndUpdate(authorId, {
        $inc: { "account_info.total_posts": 1 },
        $push: { blogs: newBlog._id },
      });
    } else {
      await User.findByIdAndUpdate(authorId, {
        $push: { blogs: newBlog._id },
      });
    }

    return res.status(201).json({ message: "Blog created.", blog: newBlog });
  } catch (err) {
    console.error("Error creating/updating blog:", err);
    return res
      .status(500)
      .json({ error: "Server error. Please try again later." });
  }
});

/**
 * @route   POST /api/blogs/get-blog
 * @desc    Retrieve a blog post by blog_id with draft mode access control.
 *          Increments total reads if mode is not "edit".
 *          Blocks access to draft blogs unless draft=true is provided in request.
 * @access  Public (draft blogs access is restricted)
 */

router.post("/get-blog", async (req, res) => {
  try {
    const { blogId, draft, mode } = req.body;

    if (!blogId) {
      return res
        .status(400)
        .json({ success: false, error: "Blog ID is required." });
    }

    const incrementVal = mode !== "edit" ? 1 : 0;

    const blog = await Blog.findOneAndUpdate(
      { blog_id: blogId },
      { $inc: { "activity.total_reads": incrementVal } },
      { new: true }
    )
      .populate(
        "author",
        "personal_info.fullname personal_info.username personal_info.profile_img"
      )
      .select(
        "title description content banner activity publishedAt blog_id tags draft"
      ); // Ensure draft field is selected

    if (!blog) {
      return res.status(404).json({ success: false, error: "Blog not found." });
    }

    // Restrict access to draft blogs if 'draft' flag is not set in request
    if (blog.draft && !draft) {
      return res.status(403).json({
        success: false,
        error: "Access denied: Blog is a draft and cannot be viewed publicly.",
      });
    }

    await User.findOneAndUpdate(
      { "personal_info.username": blog.author.personal_info.username },
      { $inc: { "account_info.total_reads": incrementVal } }
    );

    return res.status(200).json({ success: true, blog });
  } catch (err) {
    console.error("Error in /get-blog:", err);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error." });
  }
});

/**
 * @route   POST /api/blogs/like-blog
 * @desc    Like or unlike a blog post and create a notification on like
 * @access  Private (requires authMiddleware)
 *
 * @body
 *  - _id: string (Blog document _id to like/unlike)
 *  - isLikedByUser: boolean (whether the blog is currently liked by the user)
 *
 * @response
 *  - 200: { liked_by_user: boolean }
 *  - 400: { error: string } (bad request)
 *  - 404: { error: string } (blog not found)
 *  - 500: { error: string } (server error)
 */
router.post("/like-blog", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { _id, isLikedByUser } = req.body;

    // Validate input
    if (!_id) {
      return res.status(400).json({ error: "Invalid request data." });
    }

    // Calculate increment value based on current like state
    const incrementVal = !isLikedByUser ? 1 : -1;

    // Atomically update blog likes count
    const blog = await Blog.findOneAndUpdate(
      { _id },
      { $inc: { "activity.total_likes": incrementVal } },
      { new: true }
    );

    if (!blog) {
      return res.status(404).json({ error: "Blog not found." });
    }

    // Manage like notifications
    if (!isLikedByUser) {
      // Create notification for liking the blog
      const likeNotification = new Notification({
        type: "like",
        blog: _id,
        notification_for: blog.author,
        user: userId,
      });

      await likeNotification.save();
    } else {
      // Remove existing like notification when unliked
      await Notification.findOneAndDelete({
        user: userId,
        blog: _id,
        type: "like",
      });
    }

    // Return updated like state
    return res.status(200).json({ liked_by_user: !isLikedByUser });
  } catch (error) {
    console.error("Error in /like-blog:", error);
    return res.status(500).json({
      error:
        "An error occurred while processing your request. Please try again later.",
    });
  }
});

/**
 * @route   POST /api/notifications/liked-by-user
 * @desc    Check if a user has liked a specific blog
 * @access  Private (requires authentication)
 */
router.post("/liked-by-user", authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { _id } = req.body;

    // --- Validation ---
    if (!_id) {
      return res.status(400).json({ error: "Blog ID (_id) is required." });
    }

    // --- Database Check ---
    const hasLiked = await Notification.exists({
      user: userId,
      type: "like",
      blog: _id,
    });

    return res.status(200).json({ liked: Boolean(hasLiked) });
  } catch (error) {
    console.error("[LikedByUser] Error checking like status:", error);
    return res
      .status(500)
      .json({ error: "Failed to check like status. Please try again." });
  }
});

/** 
 @route : POST /api/blogs/add-comment
 @description : Adds a comment to a blog post.
 */

router.post("/add-comment", authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { _id: blogId, comment, blog_author } = req.body;

    // Validate Input
    if (typeof comment !== "string" || !comment.trim()) {
      return res.status(400).json({ error: "Comment cannot be empty." });
    }
    if (!blogId || !blog_author) {
      return res
        .status(400)
        .json({ error: "Blog ID and author are required." });
    }

    // Create and Save Comment
    const commentObject = new Comment({
      blog_id: blogId,
      blog_author,
      comment: comment.trim(),
      commented_by: userId,
    });
    const newComment = await commentObject.save();

    // Update the Blog (push comment ID, increment activity)
    await Blog.findByIdAndUpdate(
      blogId,
      {
        $push: { comments: newComment._id },
        $inc: {
          "activity.total_comments": 1,
          "activity.total_parent_comments": 1,
        },
      },
      { new: true }
    );

    // Create and Save Notification
    const notificationObject = {
      type: "comment",
      blog: blogId,
      notification_for: blog_author,
      user: userId,
      comment: newComment._id,
    };
    await new Notification(notificationObject).save();

    // Prepare Comment Data for Response
    const { comment: content, commentedAt, children, _id } = newComment;
    return res.status(201).json({
      comment: content,
      commentedAt,
      _id,
      userId,
      children,
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    return res
      .status(500)
      .json({ error: "Failed to add comment. Please try again later." });
  }
});

router.post("/get-blog-comments", async (req, res) => {
  try {
    const { blog_id, skip } = req.body;
    const maxLimit = 5;

    // Input validation
    if (!blog_id) {
      return res
        .status(400)
        .json({ error: "Missing required parameter: blog_id" });
    }

    const skipVal = Number.isInteger(skip) && skip > 0 ? skip : 0;

    // Fetch top-level comments with pagination and necessary populates
    const comments = await Comment.find({ blog_id, isReply: false })
      .populate(
        "commented_by",
        "personal_info.username personal_info.fullname personal_info.profile_img"
      )
      .sort({ commentedAt: -1 })
      .skip(skipVal)
      .limit(maxLimit);

    // Fetch blog activity counts
    const blog = await Blog.findById(blog_id, "activity");

    // Prepare activity info or fallback to empty object
    const activity = blog?.activity ? blog.activity.toObject() : {};

    // Return both comments and activity counts
    return res.status(200).json({ results: comments, activity });
  } catch (error) {
    console.error("Failed to fetch comments:", error);
    return res
      .status(500)
      .json({ error: "Failed to fetch comments. Please try again later." });
  }
});

const deleteComment = async (commentId) => {
  try {
    // 1. Find and delete the comment
    const deletedComment = await Comment.findByIdAndDelete(commentId);
    if (!deletedComment) return null; // Nothing to do if not found

    // 2. Delete all notifications for this comment
    await Notification.deleteMany({ comment: commentId });

    // 3. Update the blog's comments array and activity counts
    //    Only decrement total_parent_comments if top-level comment (no parent)
    const isParent = !deletedComment.parent;

    await Blog.findByIdAndUpdate(deletedComment.blog_id, {
      $pull: { comments: commentId },
      $inc: {
        "activity.total_comments": -1,
        "activity.total_parent_comments": isParent ? -1 : 0,
      },
    });

    // 4. If this comment is a reply, remove it from the parent's children array
    if (deletedComment.parent) {
      await Comment.findByIdAndUpdate(deletedComment.parent, {
        $pull: { children: commentId },
      });
    }

    return deletedComment;
  } catch (error) {
    console.error(`Error deleting comment with ID ${commentId}:`, error);
    throw error;
  }
};

router.post("/delete-comment", authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { _id: commentId } = req.body;

    if (!commentId) {
      return res
        .status(400)
        .json({ error: "Missing comment ID (_id) in request body." });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found." });
    }

    // Check if the user is either the comment owner or the blog author
    if (
      userId.toString() !== comment.commented_by.toString() &&
      userId.toString() !== comment.blog_author.toString()
    ) {
      return res
        .status(403)
        .json({ error: "You do not have permission to delete this comment." });
    }

    const deleted = await deleteComment(commentId);
    if (!deleted)
      return res
        .status(404)
        .json({ error: "Comment not found or already deleted." });

    return res.status(200).json({ message: "Comment deleted successfully." });
  } catch (error) {
    console.error("Error in delete-comment route:", error);
    return res
      .status(500)
      .json({ error: "Internal server error while deleting the comment." });
  }
});

export default router;

import mongoose, { Schema } from "mongoose";

// Define the schema
const blogSchema = new Schema(
  {
    blog_id: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    banner: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      maxlength: 200,
      required: true,
      trim: true,
    },
    content: {
      type: Object,
      required: true,
    },
    tags: {
      type: [String],
      validate: [tagsLimit, "{PATH} exceeds the limit of 10"],
      default: [],
    },
    author: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "users",
    },
    activity: {
      total_likes: {
        type: Number,
        default: 0,
      },
      total_comments: {
        type: Number,
        default: 0,
      },
      total_reads: {
        type: Number,
        default: 0,
      },
      total_parent_comments: {
        type: Number,
        default: 0,
      },
    },
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: "comments",
      },
    ],
    draft: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: {
      createdAt: "publishedAt",
      updatedAt: "updatedAt",
    },
  }
);

// Helper to validate tags count
function tagsLimit(val) {
  return val.length <= 10;
}

// Model export (compatible with both ES modules and CommonJS)
const Blog = mongoose.models.Blogs || mongoose.model("Blogs", blogSchema);
export default Blog;

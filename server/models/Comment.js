import mongoose, { Schema } from "mongoose";

const commentSchema = new Schema(
  {
    blog_id: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "blogs",
    },
    blog_author: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "users", // should reference users, not blogs
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
    children: [
      {
        type: Schema.Types.ObjectId,
        ref: "comments",
      },
    ],
    commented_by: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "users",
    },
    isReply: {
      type: Boolean,
      default: false,
    },
    parent: {
      type: Schema.Types.ObjectId,
      ref: "comments",
      default: null,
    },
  },
  {
    timestamps: {
      createdAt: "commentedAt",
      updatedAt: "updatedAt",
    },
  }
);

// Export with overwrite protection
const Comment =
  mongoose.models.comments || mongoose.model("comments", commentSchema);
export default Comment;

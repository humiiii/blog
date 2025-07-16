import mongoose, { Schema } from "mongoose";

const notificationSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["like", "comment", "reply"],
      required: true,
    },
    blog: {
      type: Schema.Types.ObjectId,
      ref: "blogs",
      required: true,
    },
    notification_for: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true, // User who receives the notification
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true, // User who triggered the action (like/comment/reply)
    },
    comment: {
      type: Schema.Types.ObjectId,
      ref: "comments", // For "comment" or "like" on comment
    },
    reply: {
      type: Schema.Types.ObjectId,
      ref: "comments", // For "reply"
    },
    replied_on_comment: {
      type: Schema.Types.ObjectId,
      ref: "comments", // Original comment being replied to
    },
    seen: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Protect against model overwrite errors in dev (like in Next.js)
const Notification =
  mongoose.models.notification ||
  mongoose.model("notification", notificationSchema);
export default Notification;

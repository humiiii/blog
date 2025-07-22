import mongoose, { Schema } from "mongoose";

// Predefined avatar options
const profileImgNames = [
  "Garfield",
  "Tinkerbell",
  "Annie",
  "Loki",
  "Cleo",
  "Angel",
  "Bob",
  "Mia",
  "Coco",
  "Gracie",
  "Bear",
  "Bella",
  "Abby",
  "Harley",
  "Cali",
  "Leo",
  "Luna",
  "Jack",
  "Felix",
  "Kiki",
];

const profileImgCollections = [
  "notionists-neutral",
  "adventurer-neutral",
  "fun-emoji",
];

// User Schema
const userSchema = new Schema(
  {
    personal_info: {
      fullname: {
        type: String,
        required: true,
        minlength: [3, "Fullname must be at least 3 characters long"],
        lowercase: true,
      },
      email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
      },
      password: {
        type: String, // Will be empty if Google auth
      },
      username: {
        type: String,
        unique: true,
        minlength: [3, "Username must be at least 3 characters long"],
      },
      bio: {
        type: String,
        maxlength: [200, "Bio must be at most 200 characters"],
        default: "",
      },
      profile_img: {
        type: String,
        default: () => {
          const collection =
            profileImgCollections[
              Math.floor(Math.random() * profileImgCollections.length)
            ];
          const seed =
            profileImgNames[Math.floor(Math.random() * profileImgNames.length)];
          return `https://api.dicebear.com/6.x/${collection}/svg?seed=${seed}`;
        },
      },
    },

    social_links: {
      linkedin: { type: String, default: "" },
      instagram: { type: String, default: "" },
      facebook: { type: String, default: "" },
      twitter: { type: String, default: "" },
      github: { type: String, default: "" },
      website: { type: String, default: "" },
    },

    account_info: {
      total_posts: { type: Number, default: 0 },
      total_reads: { type: Number, default: 0 },
    },

    google_auth: {
      type: Boolean,
      default: false,
    },

    blogs: {
      type: [Schema.Types.ObjectId],
      ref: "blogs",
      default: [],
    },
  },
  {
    timestamps: { createdAt: "joinedAt" },
  }
);

// Prevent model overwrite in dev
const User = mongoose.models.users || mongoose.model("users", userSchema);
export default User;

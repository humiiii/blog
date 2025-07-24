import React, { useContext, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { IoClose } from "react-icons/io5";
import { useNavigate, useParams } from "react-router-dom";

import PageAnimation from "./page.animation";
import Tag from "./Tag.component";
import { EditorContext } from "../pages/Editor.page";
import { UserContext } from "../App";

const CHARACTER_LIMIT = 200;
const TAGS_LIMIT = 10;

const PublishForm = () => {
  let { blogId } = useParams();
  const navigate = useNavigate();
  const { accessToken } = useContext(UserContext).userAuth;
  const {
    blog: { banner = "", title = "", tags = [], description = "", content },
    setEditorState,
    blog,
    setBlog,
  } = useContext(EditorContext);

  const [isPublishing, setIsPublishing] = useState(false);

  const handleClose = () => {
    setEditorState("editor");
  };

  const onTitleChange = (e) => {
    setBlog({ ...blog, title: e.target.value });
  };

  const onDescriptionChange = (e) => {
    setBlog({ ...blog, description: e.target.value });
  };

  const onTagKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const newTag = e.target.value.trim();

      if (!newTag) return;
      if (tags.includes(newTag)) {
        toast.error("Tag already added");
      } else if (tags.length >= TAGS_LIMIT) {
        toast.error(`You can add up to ${TAGS_LIMIT} tags`);
      } else {
        setBlog({ ...blog, tags: [...tags, newTag] });
      }
      e.target.value = "";
    }
  };

  const onPublish = async () => {
    // Front-end validations
    if (!title.trim()) {
      return toast.error("Title is required.");
    }
    if (!description.trim() || description.length > CHARACTER_LIMIT) {
      return toast.error(
        "Description is required and must be ≤ 200 characters.",
      );
    }
    if (!tags.length) {
      return toast.error("Enter at least one tag.");
    }

    setIsPublishing(true);
    const toastId = toast.loading("Publishing...");

    try {
      const payload = {
        title,
        description,
        content,
        banner,
        tags,
        draft: false,
      };
      const { data } = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/blogs/create-blog`,
        { ...payload, blogId },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      toast.dismiss(toastId);
      toast.success(data.message || "Blog published!");
      setEditorState("publish");

      setTimeout(() => navigate("/"), 500);
    } catch (err) {
      toast.dismiss(toastId);
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Something went wrong. Please try again.";
      toast.error(msg);
      console.error("Publish error:", err);
    } finally {
      setIsPublishing(false);
    }
  };

  const remainingChars = CHARACTER_LIMIT - description.length;
  const remainingTags = TAGS_LIMIT - tags.length;

  return (
    <PageAnimation>
      <Toaster />
      <section className="relative grid min-h-screen w-screen items-center py-16 lg:grid-cols-2 lg:gap-4">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 rounded-lg p-2 hover:bg-gray-200"
        >
          <IoClose size={24} />
        </button>

        {/* Preview */}
        <div className="center max-w-[550px] px-4">
          <p className="mb-1 text-gray-600">Preview</p>
          <div className="mt-4 aspect-video w-full overflow-hidden rounded-lg bg-gray-100">
            <img
              src={banner}
              alt="Blog banner"
              className="h-full w-full object-cover"
            />
          </div>
          <h1 className="mt-4 line-clamp-2 text-4xl font-semibold">
            {title || "Your Title"}
          </h1>
          <p className="font-gelasio mt-2 line-clamp-2 text-xl">
            {description || "Your short description..."}
          </p>
        </div>

        {/* Form */}
        <div className="border-gray-300 px-4 py-8 lg:border-2 lg:p-6">
          {/* Title */}
          <label className="mb-1 block text-gray-300">Blog Title</label>
          <input
            type="text"
            value={title}
            onChange={onTitleChange}
            placeholder="Blog Title"
            className="input-box mb-6 w-full p-3"
          />

          {/* Description */}
          <label className="mb-1 block text-gray-300">
            Short description about your blog
          </label>
          <textarea
            maxLength={CHARACTER_LIMIT}
            value={description}
            onChange={onDescriptionChange}
            onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
            placeholder="A brief description..."
            className="input-box mb-1 h-32 w-full resize-none p-3"
          />
          <p className="mb-6 text-right text-sm text-gray-500">
            {remainingChars} characters left
          </p>

          {/* Tags */}
          <label className="mb-1 block text-gray-700">
            Tags <span className="text-gray-400">(up to {TAGS_LIMIT})</span>
          </label>
          <div className="input-box relative mb-2 w-full gap-2 p-3">
            <input
              type="text"
              onKeyDown={onTagKeyDown}
              placeholder="Press Enter to add tag"
              className="input-box sticky top-0 left-0 mb-3 bg-white pl-4 outline-none focus:bg-white"
            />
            {tags.map((tag, i) => (
              <Tag tag={tag} key={i} tagIndex={i} />
            ))}
          </div>
          <p className="mb-6 text-right text-sm text-gray-500">
            {remainingTags} tags left
          </p>

          {/* Publish Button */}
          <button
            onClick={onPublish}
            disabled={isPublishing}
            className={`btn-dark w-full py-3 ${isPublishing ? "cursor-not-allowed opacity-50" : ""}`}
          >
            {isPublishing ? "Publishing..." : "Publish"}
          </button>
        </div>
      </section>
    </PageAnimation>
  );
};

export default PublishForm;

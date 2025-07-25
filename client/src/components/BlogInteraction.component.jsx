import React, { useContext, useEffect } from "react";
import { BlogContext } from "../pages/Blog.page";
import {
  FaRegHeart,
  FaRegCommentDots,
  FaXTwitter,
  FaHeart,
} from "react-icons/fa6";
import { Link } from "react-router-dom";
import { UserContext } from "../App";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";

const BlogInteraction = () => {
  let {
    blog,
    blog: {
      _id,
      title,
      blog_id,
      activity,
      activity: { total_likes, total_comments },
      author: {
        personal_info: { username },
      },
    },
    setBlog,
    isLikedByUser,
    setIsLikedByUser,
  } = useContext(BlogContext);

  let {
    userAuth,
    userAuth: { accessToken },
  } = useContext(UserContext);

  const isOwnProfile =
    userAuth?.user?.username?.toLowerCase() === username?.toLowerCase();

  useEffect(() => {
    if (!accessToken) return;

    const checkIfLiked = async () => {
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_SERVER_URL}/api/blogs/liked-by-user`,
          { _id },
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          },
        );

        setIsLikedByUser(Boolean(response.data.liked));
      } catch (error) {
        console.error("Failed to check like status:", error);
      }
    };

    checkIfLiked();
  }, []);

  const handleLikeByUser = async () => {
    if (!accessToken) {
      toast.error("Please login to like this post");
      return;
    }

    const newIsLiked = !isLikedByUser;
    // Optimistically update UI
    setIsLikedByUser(newIsLiked);
    setBlog((prev) => ({
      ...prev,
      activity: {
        ...prev.activity,
        total_likes: prev.activity.total_likes + (newIsLiked ? 1 : -1),
      },
    }));

    try {
      // Pass the current like state BEFORE toggling to backend to maintain logic compatibility
      await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/blogs/like-blog`,
        { _id, isLikedByUser }, // Send current state before change
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
    } catch (error) {
      console.error("Error liking/unliking blog:", error);
      toast.error("Failed to update like status. Please try again.");

      // Revert optimistic update on error
      setIsLikedByUser(isLikedByUser);
      setBlog((prev) => ({
        ...prev,
        activity: {
          ...prev.activity,
          total_likes: prev.activity.total_likes + (isLikedByUser ? 1 : -1),
        },
      }));
    }
  };

  return (
    <>
      <Toaster />
      <hr className="border-gray my-2" />
      <div className="flex justify-between gap-6">
        <div className="flex items-center gap-3">
          <button
            onClick={handleLikeByUser}
            className={`flex h-10 w-10 items-center justify-center rounded-lg ${isLikedByUser ? "bg-red/20 text-red" : "bg-gray/80"}`}
          >
            {isLikedByUser ? <FaHeart /> : <FaRegHeart />}
          </button>
          <p className="text-dark-gray text-xl">{total_likes}</p>
          <button className="bg-gray/80 flex h-10 w-10 items-center justify-center rounded-lg">
            <FaRegCommentDots />
          </button>
          <p className="text-dark-gray text-xl">{total_comments}</p>
        </div>
        <div className="flex items-center gap-6">
          {isOwnProfile && (
            <Link
              className="hover:text-purple underline"
              to={`/editor/${blog_id}`}
            >
              Edit
            </Link>
          )}
          <Link
            to={`https://twitter.com/intent/tweet?text=Read ${title}&url=${location.href}`}
            className="text-dark-gray bg-gray/80 flex h-10 w-10 items-center justify-center rounded-lg hover:text-black"
          >
            <FaXTwitter className="text-xl" />
          </Link>
        </div>
      </div>

      <hr className="border-gray my-2" />
    </>
  );
};

export default BlogInteraction;

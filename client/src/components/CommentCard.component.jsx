import React, { useContext } from "react";
import { format, isValid, parseISO } from "date-fns";
import { UserContext } from "../App";
import { BlogContext } from "../pages/Blog.page";
import { FaRegTrashCan } from "react-icons/fa6";
import axios from "axios";
import toast from "react-hot-toast";

const CommentCard = ({ index, leftVal, commentData }) => {
  const {
    commented_by: {
      personal_info: {
        profile_img = null,
        fullname = "",
        username: commentedByUsername = "",
      } = {},
    } = {},
    comment = "",
    commentedAt = "",
  } = commentData || {};

  let dateLabel = "";
  if (commentedAt) {
    let dateObj = null;
    if (isValid(new Date(commentedAt))) {
      dateObj = new Date(commentedAt);
    } else if (isValid(parseISO(commentedAt))) {
      dateObj = parseISO(commentedAt);
    }
    if (dateObj && isValid(dateObj)) {
      dateLabel = format(dateObj, "dd MMM");
    }
  }

  const userContext = useContext(UserContext) || {};
  const userAuth = userContext.userAuth || {};
  const accessToken = userAuth.accessToken;
  const username = userAuth.user?.username || "";

  const blogContext = useContext(BlogContext) || {};
  const blog = blogContext.blog || {};
  const blog_author = blog.author?.personal_info?.username || "";
  const setBlog = blogContext.setBlog;
  const setTotalParentCommentsLoaded = blogContext.setTotalParentCommentsLoaded;

  const handleDeleteComment = async (e, commentId) => {
    e.target.setAttribute("disabled", "true");

    try {
      const token = accessToken;

      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/blogs/delete-comment`,
        { _id: commentId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.status === 200) {
        toast.success("Comment deleted successfully.");

        // Remove deleted comment from local state comments array
        const updatedComments = (blog.comments?.results || []).filter(
          (comment) => comment._id !== commentId,
        );

        // Update loaded count safely
        setTotalParentCommentsLoaded &&
          setTotalParentCommentsLoaded((prev) => (prev > 0 ? prev - 1 : 0));

        // Update blog state with new comments array and decrement activity counts
        setBlog &&
          setBlog((prevBlog) => ({
            ...prevBlog,
            comments: { ...prevBlog.comments, results: updatedComments },
            activity: {
              ...prevBlog.activity,
              total_parent_comments: Math.max(
                (prevBlog.activity?.total_parent_comments || 1) - 1,
                0,
              ),
              total_comments: Math.max(
                (prevBlog.activity?.total_comments || 1) - 1,
                0,
              ),
            },
          }));
      } else {
        toast.error("Failed to delete comment.");
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error(
        error.response?.data?.error ||
          "An error occurred while deleting the comment.",
      );
    } finally {
      e.target.removeAttribute("disabled");
    }
  };

  return (
    <div className="w-full" style={{ paddingLeft: `${(leftVal || 0) * 10}px` }}>
      <div className="border-gray my-5 rounded-lg border p-6">
        <div className="mb-8 flex items-center gap-3">
          {profile_img ? (
            <img
              src={profile_img}
              className="h-6 w-6 rounded-lg"
              alt={`${fullname}'s profile`}
            />
          ) : (
            <div
              className="h-6 w-6 rounded-lg bg-gray-300"
              aria-label="no profile image"
            />
          )}
          <p className="line-clamp-1">
            {fullname} @{commentedByUsername}
          </p>
          <p className="min-w-fit">{dateLabel}</p>
          {(username === commentedByUsername || username === blog_author) && (
            <button
              onClick={(e) => handleDeleteComment(e, commentData._id)}
              className="border-gray hover:bg-red/30 hover:text-red ml-auto flex items-center rounded-lg border p-2 px-3"
              aria-label="Delete comment"
            >
              <FaRegTrashCan className="pointer-events-none" />
            </button>
          )}
        </div>
        <p className="font-gelasio mb-3 text-xl">{comment}</p>
      </div>
    </div>
  );
};

export default CommentCard;

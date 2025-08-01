import React, { useContext, useState } from "react";
import { UserContext } from "../App";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { BlogContext } from "../pages/Blog.page";
import { fetchComments } from "./CommentsContainer.component";

const CommentField = ({ action }) => {
  const [comment, setComment] = useState("");

  const blogContext = useContext(BlogContext) ?? {};
  const {
    blog = {},
    setBlog,
    setTotalParentCommentsLoaded,
  } = blogContext;

  const { _id = "", author: { _id: blog_author } = {} } = blog;

  const userContext = useContext(UserContext) ?? {};
  const {
    userAuth: {
      accessToken = "",
      username = "",
      fullname = "",
      profile_img = "",
    } = {},
  } = userContext;

  const handleComment = async () => {
    if (!accessToken) {
      return toast.error("Login to leave a comment");
    }

    if (!comment || !comment.trim()) {
      return toast.error("Write something to leave a comment...");
    }

    try {
      // Post the new comment
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/blogs/add-comment`,
        {
          _id,
          blog_author,
          comment: comment.trim(),
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      toast.success("Comment added!");
      setComment("");

      // The new comment data from backend
      const data = response.data;

      // Attach commenter info and childrenLevel
      data.commented_by = {
        personal_info: { username, fullname, profile_img },
      };
      data.childrenLevel = 0;

const { results, activity: freshActivity } = await fetchComments({
  blog_id: _id,
  skip: 0,
  setParentCommentCountFunction: setTotalParentCommentsLoaded,
  comment_array: [],
});

// Update blog state with fresh comments and activity
setBlog(prevBlog => ({
  ...prevBlog,
  comments: { ...prevBlog.comments, results },
  activity: {
    ...prevBlog.activity,
    ...freshActivity,
  },
}));



    } catch (error) {
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
      console.error(error);
    }
  };

  return (
    <>
      <Toaster />
      <textarea
        onChange={(e) => setComment(e.target.value)}
        value={comment}
        placeholder="Leave a comment here..."
        className="input-box placeholder:text-dark-gray h-[150px] resize-none overflow-auto pl-5"
      />
      <button className="btn-dark mt-5 px-10" onClick={handleComment}>
        {action}
      </button>
    </>
  );
};

export default CommentField;

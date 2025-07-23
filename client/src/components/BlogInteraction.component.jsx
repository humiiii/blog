import React, { useContext } from "react";
import { BlogContext } from "../pages/Blog.page";
import { FaRegHeart, FaRegCommentDots, FaXTwitter } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { UserContext } from "../App";

const BlogInteraction = () => {
  let {
    blog: {
      title,
      blog_id,
      activity,
      activity: { total_likes, total_comments },
      author: {
        personal_info: { username },
      },
    },
    setBlog,
  } = useContext(BlogContext);

  let { userAuth } = useContext(UserContext);

  const isOwnProfile =
    userAuth?.user?.username?.toLowerCase() === username?.toLowerCase();

  return (
    <>
      <hr className="border-gray my-2" />
      <div className="flex justify-between gap-6">
        <div className="flex items-center gap-3">
          <button className="bg-gray/80 flex h-10 w-10 items-center justify-center rounded-lg">
            <FaRegHeart />
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

import { format } from "date-fns";
import React from "react";
import { Link } from "react-router-dom";

const MinimalBlogPost = ({ blog, index }) => {
  if (!blog) {
    return null;
  }

  let {
    title,
    blog_id: id,
    author: {
      personal_info: { fullname, username, profile_img },
    },
    publishedAt,
  } = blog;

  return (
    <Link to={`/blog/${id}`} className="mb-6 flex gap-5">
      <h1 className="blog-index">{index < 10 ? "0" + (index + 1) : index}</h1>
      <div className="">
        <div className="text-dark-gray mb-7 flex items-center gap-2 text-sm">
          <img
            src={profile_img}
            alt={`${fullname}'s profile`}
            className="h-6 w-6 rounded-lg object-cover"
          />
          <p className="line-clamp-1">
            {fullname} @{username}
          </p>
          <p className="min-w-fit">
            {format(new Date(publishedAt), "dd MMM yyyy")}
          </p>
        </div>
        <h1 className="blog-title">{title}</h1>
      </div>
    </Link>
  );
};

export default MinimalBlogPost;
